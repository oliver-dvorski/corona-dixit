const FBAdmin = require('firebase-admin');
const { admin } = require('../services');

async function startNewRound(change, context) {
  const {
    roomID,
    roundID,
  } = context.params;

  const round = change.after.data();

  const membersRef = admin
    .firestore()
    .collection('rooms')
    .doc(roomID)
    .collection('members');

  const membersSnap = await membersRef.get();

  // -1 because the storyTeller doesn't vote
  if (round.voted.length < membersSnap.size - 1) {
    return;
  }

  const storyPoolItemSnap = await admin
    .firestore()
    .collection(`rooms/${roomID}/rounds/${roundID}/pool`)
    .where('setBy.uid', '==', round.storyTeller.uid)
    .get();

  if (!storyPoolItemSnap.docs[0].exists) {
    console.error('Didn\'t find the story card in the card pool! Aborting');
    return;
  }

  const storyPoolItemDoc = storyPoolItemSnap.docs[0];

  const storyPoolItem = storyPoolItemDoc.data();

  if (storyPoolItem.chosenBy.length === 0 || storyPoolItem.chosenBy.length === membersSnap.size - 1) {
    // Everyone or no one voted for the right card

    for (const memberDoc of membersSnap.docs) {
      if (memberDoc.id !== round.storyTeller.uid) {
        await membersRef.doc(memberDoc.id).update({
          score: FBAdmin.firestore.FieldValue.increment(2),
          newPoints: 2,
        });
      } else {
        await membersRef.doc(memberDoc.id).update({
          newPoints: 0,
        });
      }
    }
  } else {
    // At least one person chose the right card and at least one failed to do so

    for (const player of storyPoolItem.chosenBy) {
      await membersRef.doc(player.uid).update({
        score: FBAdmin.firestore.FieldValue.increment(3),
        newPoints: 3,
      });
    }

    await membersRef.doc(round.storyTeller.uid).update({
      score: FBAdmin.firestore.FieldValue.increment(3),
      newPoints: 3,
    });

    const membersWhoMissed = membersSnap.docs.filter((memberDoc) => !storyPoolItem.chosenBy.find((player) => player.uid === memberDoc.id) && memberDoc.id !== storyPoolItem.setBy.uid);
    for (const memberDoc of membersWhoMissed) {
      await membersRef.doc(memberDoc.id).update({
        newPoints: 0,
      });
    }
  }

  // Bonus points
  const poolCollection = await admin
    .firestore()
    .collection(`rooms/${roomID}/rounds/${roundID}/pool`)
    .get();

  for (const poolDoc of poolCollection.docs) {
    const poolItem = poolDoc.data();
    if (poolItem.setBy.uid !== 'cloudFunction' && poolItem.setBy.uid !== round.storyTeller.uid && poolItem.chosenBy.length > 0) {
      await membersRef
        .doc(poolItem.setBy.uid)
        .update({
          score: FBAdmin.firestore.FieldValue.increment(poolItem.chosenBy.length),
          newPoints: FBAdmin.firestore.FieldValue.increment(poolItem.chosenBy.length),
        });
    }
  }

  const roomDoc = await admin
    .firestore()
    .collection('rooms')
    .doc(roomID)
    .get();

  const room = roomDoc.data();

  const numberOfMembers = membersSnap.size;

  if (round.number < numberOfMembers * 2) {
    const nextStoryTeller = round.number < numberOfMembers ? room.playOrder[round.number] : room.playOrder[round.number - numberOfMembers];

    await admin
      .firestore()
      .collection('rooms')
      .doc(roomID)
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

exports.startNewRound = startNewRound;
