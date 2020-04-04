const state = {
  firebaseUser: null,
};

const mutations = {
  // eslint-disable-next-line no-shadow
  setUser(state, user) {
    state.firebaseUser = user;
  },
};

export default {
  namespaced: true,
  state,
  mutations,
};
