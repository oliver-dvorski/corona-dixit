<template>
  <section class="section">
    <button
      class="button"
      @click="join"
    >
      Sign in with Google
    </button>
  </section>
</template>

<script>
import firebase from 'firebase/app';
import { auth } from '../firebase';

export default {
  data() {
    return {
      name: '',
    };
  },

  methods: {
    async join() {
      // eslint-disable-next-line new-cap
      const provider = new firebase.auth.GoogleAuthProvider();

      await auth.signInWithPopup(provider);
    },
  },
};
</script>
