import Vue from 'vue';
import VueCompositionApi from '@vue/composition-api';
import Vuex from 'vuex';
import { firestorePlugin as VueFire } from 'vuefire';
import App from './App.vue';
import router from './router';
import store from './store';

import './assets/sass/main.scss';

Vue.use(VueCompositionApi);

Vue.use(VueFire);

Vue.use(Vuex);

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
