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
  .onCreate(async (change, context) => {
    const roomRef = admin
      .firestore()
      .collection('rooms')
      .doc(context.params.roomID);

    const membersSnapshot = await roomRef.collection('members').get();

    const deck = await getFullDeck(storage);

    membersSnapshot.forEach(async (member) => {
      roomRef.collection('members').doc(member.id).collection('hand').doc(context.params.roundID)
        .set({
          roundID: context.params.roundID,
          cards: await getHand(deck),
        });
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

      for (let i = difference; i < 6; i++) {
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

        deck.splice(randomIndex, 1);
      }
    }
  });
