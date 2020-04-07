export function getEmptyRoom() {
  return {
    name: '',
    members: [{
      id: '',
      name: '',
      hand: [],
    }],
    host: {
      name: '',
      id: '',
    },
    startedAt: null,
    rounds: [
      {
        storyTeller: {
          name: '',
          id: '',
        },
        pool: [],
        story: {
          text: '',
          card: '',
        },
      },
    ],
  };
}
