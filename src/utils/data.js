// eslint-disable-next-line import/prefer-default-export
export function getEmptyRoom() {
  return {
    name: '',
    members: [],
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
