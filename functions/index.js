const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { Storage } = require('@google-cloud/storage');

const serviceAccount = require('../service-account');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'corona-dixit.appspot.com',
});

const storage = new Storage({
  keyFilename: '../service-account.json',
});

async function getHand(deck) {
  const hand = [];

  for (let i = 0; i < 6; i++) {
    hand.push(deck[Math.floor(Math.random() * deck.length)].name);
  }

  return hand;
}

exports.shuffleCards = functions.https.onCall(async (data, context) => {
  const { roomID } = data;

  admin.firestore().collection('rooms').doc(roomID);

  let deck = await storage.bucket('corona-dixit.appspot.com').getFiles();

  deck = deck[0];


  const roomRef = admin.firestore().collection('rooms').doc(roomID);

  const roomSnapshot = await roomRef.get();

  const members = roomSnapshot.get('members');

  for (const member of members) {
    // eslint-disable-next-line no-await-in-loop
    member.hand = await getHand(deck);
  }

  console.log({ members });

  await roomRef.update({
    members,
  });
});
