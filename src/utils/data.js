export function getEmptyRoom() {
  return {
    name: '',
    host: {
      name: '',
      id: '',
    },
    startedAt: null,
    dealtCards: [],
  };
}

export function getEmptyRound() {
  return {
    number: 1,
    storyText: '',
    storyTeller: {
      name: '',
      uid: '',
    },
    pool: [],
    voted: [],
    vote: false,
    results: [],
  };
}
