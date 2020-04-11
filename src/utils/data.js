export function getEmptyRoom() {
  return {
    name: '',
    host: {
      name: '',
      id: '',
    },
    startedAt: null,
  };
}

export function getEmptyRound() {
  return {
    number: 1,
    story: {
      text: '',
      card: '',
    },
    pool: [],
  };
}
