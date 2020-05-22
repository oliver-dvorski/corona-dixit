import Vue from 'vue';
import Vuex from 'vuex';
import { firestoreAction, vuexfireMutations } from 'vuexfire';
import user from './modules/user';
import { db } from '../firebase';
import { getEmptyRoom } from '../utils/data';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    rooms: [],
  },

  getters: {
    getRoom: (state) => (id) => {
      if (state.rooms.length === 0) {
        return getEmptyRoom();
      }

      return state.rooms.find((room) => room.id === id);
    },
  },

  modules: {
    user,
  },

  mutations: {
    ...vuexfireMutations,
  },

  actions: {
    bindRooms: firestoreAction(({ bindFirestoreRef }) => bindFirestoreRef('rooms', db.collection('rooms').orderBy('createdAt', 'desc'))),
  },
});
