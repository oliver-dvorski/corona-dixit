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
    const randomIndex = Math.floor(Math.random() * deck.length);

    hand.push(deck[randomIndex]);

    deck.splice(randomIndex, 1);
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

    const roomRef = admin.firestore().collection('rooms').doc(roomID);

    const roomSnapshot = await roomRef.get();

    const members = roomSnapshot.get('members');

    let cardsAlreadyDealt = false;
    members.forEach((member) => {
      if (member.hand.length === 6) {
        cardsAlreadyDealt = true;
      }
    });

    if (cardsAlreadyDealt) {
      return;
    }

    const storageCollection = await storage.bucket('corona-dixit.appspot.com').getFiles();

    const deck = storageCollection[0].map((storageObject) => storageObject.name);

    for (const member of members) {
      member.hand = await getHand(deck);
    }

    await roomRef.update({
      members,
    });
  });
