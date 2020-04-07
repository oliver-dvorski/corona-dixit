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

async function getHand(deck) {
  const hand = [];

  for (let i = 0; i < 6; i++) {
    hand.push(deck[Math.floor(Math.random() * deck.length)].name);
  }

  return hand;
}

exports.shuffleCards = functions
  .runWith({
    timeoutSeconds: 40,
    memory: '1GB',
  })
  .https
  .onCall(async (data, context) => {
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

    await roomRef.update({
      members,
    });
  });
