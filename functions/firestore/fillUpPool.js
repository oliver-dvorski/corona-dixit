const { getFullDeck, randomPowerlaw } = require('../helpers');
const { admin, storage } = require('../services');

async function fillUpPool(change, context) {
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
      const randomIndex = randomPowerlaw(1, deck.length) - 1;

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
          setBy: {
            uid: 'cloudFunction',
            name: 'Cloud Function',
          },
          chosenBy: [],
        });

      dealtCards.push(deck[randomIndex]);
      deck.splice(randomIndex, 1);
    }

    await roomRef.update({
      dealtCards,
    });
  }
}

exports.fillUpPool = fillUpPool;
