const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { Storage } = require('@google-cloud/storage');
const { getHand, getFullDeck } = require('./helpers');

const serviceAccount = require('./service-account.json');

const adminConfig = JSON.parse(process.env.FIREBASE_CONFIG);
adminConfig.credential = admin.credential.cert(serviceAccount);
adminConfig.storageBucket = 'corona-dixit.appspot.com';
admin.initializeApp(adminConfig);

const storage = new Storage({
  keyFilename: './service-account.json',
});

exports.shuffleCards = functions
  .firestore
  .document('rooms/{roomID}/rounds/{roundID}')
  .onCreate(async (roundSnap, context) => {
    const roomRef = admin
      .firestore()
      .collection('rooms')
      .doc(context.params.roomID);

    const membersSnapshot = await roomRef.collection('members').get();

    const deck = await getFullDeck(storage);

    const roomDoc = await roomRef.get();
    const room = roomDoc.data();

    room.dealtCards.forEach((card) => {
      deck.splice(deck.indexOf(card), 1);
    });

    const round = roundSnap.data();

    let previousRound = round;

    if (round.number > 1) {
      const previousRoundSnap = await roomRef
        .collection('rounds')
        .where('number', '==', round.number - 1)
        .get();

      previousRound = previousRoundSnap.docs[0];
    }

    const dealtCards = room.dealtCards;

    for (const member of membersSnapshot.docs) {
      const handCollection = roomRef.collection('members').doc(member.id).collection('hand');

      let newHand = {};

      if (round.number > 1) {
        const handSnap = await handCollection.doc(previousRound.id).get();
        const hand = handSnap.data().cards;

        const usedCardSnap = await roomRef
          .collection('rounds')
          .doc(previousRound.id)
          .collection('pool')
          .where('setBy', '==', member.id)
          .get();

        const usedCard = usedCardSnap.docs[0].data().card;

        hand.splice(hand.indexOf(usedCard), 1);

        const randomIndex = Math.floor(Math.random() * deck.length);

        hand.push(deck[randomIndex]);

        newHand = {
          roundID: context.params.roundID,
          cards: hand,
        };

        dealtCards.push(deck[randomIndex]);

        deck.splice(randomIndex, 1);
      } else {
        newHand = {
          roundID: context.params.roundID,
          cards: await getHand(deck),
        };

        dealtCards.push(...newHand.cards);
      }

      await handCollection.doc(context.params.roundID).set(newHand);
    }

    await roomRef.update({
      dealtCards,
    });
  });

exports.fillUpPool = functions
  .firestore
  .document('rooms/{roomID}/rounds/{roundID}/pool/{poolID}')
  .onCreate(async (change, context) => {
    const {
      roomID,
      roundID,
    } = context.params;

    const membersSnap = await admin
      .firestore()
      .collection('rooms')
      .doc(roomID)
      .collection('members')
      .get();

    const numberOfMembers = membersSnap.size;

    const poolSnap = await admin
      .firestore()
      .collection('rooms')
      .doc(roomID)
      .collection('rounds')
      .doc(roundID)
      .collection('pool')
      .get();

    const numberOfCardsInPool = poolSnap.size;

    if (numberOfCardsInPool < numberOfMembers) {
      return;
    }

    if (numberOfCardsInPool === 6) {
      // We should start voting, let's add the pool cards to the round so they're
      // accessible by the client

      const shallowPool = [];
      poolSnap.forEach((poolDoc) => {
        shallowPool.push(poolDoc.data().card);
      });

      await admin
        .firestore()
        .collection('rooms')
        .doc(roomID)
        .collection('rounds')
        .doc(roundID)
        .update({
          vote: true,
          pool: shallowPool,
        });

      return;
    }

    if (numberOfCardsInPool === numberOfMembers) {
      const difference = 6 - numberOfMembers;

      const deck = await getFullDeck(storage);

      const poolData = [];

      poolSnap.forEach((doc) => {
        poolData.push(doc.data());
      });

      poolData.forEach((poolItem) => {
        const existing = deck.indexOf(poolItem.card);

        deck.splice(existing, 1);
      });

      const roomRef = admin
        .firestore()
        .collection('rooms')
        .doc(context.params.roomID);

      const roomDoc = await roomRef.get();

      const dealtCards = roomDoc.data().dealtCards;

      dealtCards.forEach((card) => {
        deck.splice(deck.indexOf(card), 1);
      });

      for (let i = 0; i < difference; i++) {
        const randomIndex = Math.floor(Math.random() * deck.length);

        await admin
          .firestore()
          .collection('rooms')
          .doc(roomID)
          .collection('rounds')
          .doc(roundID)
          .collection('pool')
          .doc(deck[randomIndex])
          .set({
            card: deck[randomIndex],
            setBy: 'cloudFunction',
            chosenBy: [],
          });

        dealtCards.push(deck[randomIndex]);
        deck.splice(randomIndex, 1);
      }

      await roomRef.update({
        dealtCards,
      });
    }
  });

exports.startNewRound = functions
  .firestore
  .document('rooms/{roomID}/rounds/{roundID}')
  .onUpdate(async (change, context) => {
    const {
      roomID,
      roundID,
    } = context.params;

    const round = change.after.data();

    const membersRef = admin
      .firestore()
      .collection('rooms')
      .doc(roomID)
      .collection('members');

    const membersSnap = await membersRef.get();

    // -1 because the storyTeller doesn't vote
    if (round.voted.length < membersSnap.size - 1) {
      return;
    }

    const storyPoolItemSnap = await admin
      .firestore()
      .collection(`rooms/${roomID}/rounds/${roundID}/pool`)
      .where('setBy', '==', round.storyTeller.uid)
      .get();

    if (!storyPoolItemSnap.docs[0].exists) {
      console.error('Didn\'t find the story card in the card pool! Aborting');
      return;
    }

    const storyPoolItemDoc = storyPoolItemSnap.docs[0];

    const storyPoolItem = storyPoolItemDoc.data();

    if (storyPoolItem.chosenBy.length === 0 || storyPoolItem.chosenBy.length === membersSnap.size - 1) {
      // Everyone or no one voted for the right card

      for (const memberDoc of membersSnap.docs) {
        if (memberDoc.id !== round.storyTeller.uid) {
          await memberDoc.update({
            score: admin.firestore.FieldValue.increment(2),
          });
        }
      }
    } else {
      // At least one person chose the right card and at least one failed to do so

      for (const playerID of storyPoolItem.chosenBy) {
        await membersRef.doc(playerID).update({
          score: admin.firestore.FieldValue.increment(3),
        });
      }

      await membersRef.doc(round.storyTeller.uid).update({
        score: admin.firestore.FieldValue.increment(3),
      });
    }

    // Bonus points
    const poolCollection = await admin
      .firestore()
      .collection(`rooms/${roomID}/rounds/${roundID}/pool`)
      .get();

    for (const poolDoc of poolCollection.docs) {
      const poolItem = poolDoc.data();
      if (poolItem.setBy !== 'cloudFunction' && poolItem.setBy !== round.storyTeller.uid && poolItem.chosenBy.length > 0) {
        await membersRef
          .doc(poolItem.setBy)
          .update({
            score: admin.firestore.FieldValue.increment(poolItem.chosenBy.length),
          });
      }
    }

    const roomDoc = await admin
      .firestore()
      .collection('rooms')
      .doc(roomID)
      .get();

    const room = roomDoc.data();

    const numberOfMembers = membersSnap.size;

    if (round.number < numberOfMembers * 2) {
      const nextStoryTeller = round.number < numberOfMembers ? room.playOrder[round.number] : room.playOrder[round.number - numberOfMembers];

      await admin
        .firestore()
        .collection('rooms')
        .doc(roomID)
        .collection('rounds')
        .add({
          number: round.number + 1,
          pool: [],
          results: [],
          storyTeller: nextStoryTeller,
          storyText: '',
          vote: false,
          voted: [],
        });
    }
  });
