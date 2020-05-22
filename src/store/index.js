import Vue from 'vue';
import Vuex from 'vuex';
import { firestoreAction, vuexfireMutations } from 'vuexfire';
import user from './modules/user';
import { db } from '../firebase';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    rooms: [],
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
