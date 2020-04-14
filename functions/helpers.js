async function getHand(deck) {
  const hand = [];

  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * deck.length);

    hand.push(deck[randomIndex]);

    deck.splice(randomIndex, 1);
  }

  return hand;
}

async function getFullDeck(storage) {
  const storageCollection = await storage.bucket('corona-dixit.appspot.com').getFiles();

  return storageCollection[0].map((storageObject) => storageObject.name);
}

module.exports = {
  getHand,
  getFullDeck,
};
