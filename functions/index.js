const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { Storage } = require('@google-cloud/storage');

const serviceAccount = require('./service-account.json');

const adminConfig = JSON.parse(process.env.FIREBASE_CONFIG);
adminConfig.credential = admin.credential.cert(serviceAccount);
adminConfig.storageBucket = 'corona-dixit.appspot.com';
admin.initializeApp(adminConfig);

const storage = new Storage({
  keyFilename: './service-account.json',
});

async function dealHand(deck) {
  const hand = [];

  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * deck.length);

    hand.push(deck[randomIndex]);

    deck.splice(randomIndex, 1);
  }

  return hand;
}

exports.shuffleCards = functions
  .firestore
  .document('rooms/{roomID}/rounds/{roundID}')
  .onCreate(async (change, context) => {
    const roomRef = admin
      .firestore()
      .collection('rooms')
      .doc(context.params.roomID);

    const membersSnapshot = await roomRef.collection('members').get();

    const storageCollection = await storage.bucket('corona-dixit.appspot.com').getFiles();
    const deck = storageCollection[0].map((storageObject) => storageObject.name);

    membersSnapshot.forEach(async (member) => {
      roomRef.collection('members').doc(member.id).collection('hand').add({
        roundID: context.params.roundID,
        cards: await dealHand(deck),
      });
    });
  });
