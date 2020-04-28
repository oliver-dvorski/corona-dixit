const { getHand, getFullDeck } = require('../helpers');
const { admin, storage } = require('../services');

async function shuffleCards(roundSnap, context) {
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
        .where('setBy.uid', '==', member.id)
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
}

exports.shuffleCards = shuffleCards;
