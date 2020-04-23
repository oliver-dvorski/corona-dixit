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
    const round = change.after.data();

    if (round.results.length > 0) {
      const membersSnap = await admin
        .firestore()
        .collection('rooms')
        .doc(context.params.roomID)
        .collection('members')
        .get();

      const roomDoc = await admin
        .firestore()
        .collection('rooms')
        .doc(context.params.roomID)
        .get();

      const room = roomDoc.data();

      const numberOfMembers = membersSnap.size;

      if (round.number < numberOfMembers * 2) {
        const nextStoryTeller = round.number < numberOfMembers ? room.playOrder[round.number] : room.playOrder[round.number - numberOfMembers];

        await admin
          .firestore()
          .collection('rooms')
          .doc(context.params.roomID)
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
    }
  });
