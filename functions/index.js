const functions = require('firebase-functions');

const { shuffleCards } = require('./firestore/shuffleCards');
const { fillUpPool } = require('./firestore/fillUpPool');
const { startNewRound } = require('./firestore/startNewRound');

exports.shuffleCards = functions
  .firestore
  .document('rooms/{roomID}/rounds/{roundID}')
  .onCreate(shuffleCards);

exports.fillUpPool = functions
  .firestore
  .document('rooms/{roomID}/rounds/{roundID}/pool/{poolID}')
  .onCreate(fillUpPool);

exports.startNewRound = functions
  .firestore
  .document('rooms/{roomID}/rounds/{roundID}')
  .onUpdate(startNewRound);
