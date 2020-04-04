<template>
  <div>
    <section class="section">
      <div class="field">
        <label
          for="name"
          class="label"
        >Display Name</label>
        <div class="field">
          <input
            id="name"
            v-model="name"
            type="text"
            class="input"
            @keydown.enter="join"
          >
        </div>

        <Loader :loading="loading" />

        <button
          class="button"
          @click="join"
        >
          Join
        </button>
      </div>
    </section>

    <!--    <section class="section">-->
    <!--      <button-->
    <!--        class="button"-->
    <!--        @click="join"-->
    <!--      >-->
    <!--        Sign in with Google-->
    <!--      </button>-->
    <!--    </section>-->
  </div>
</template>

<script>
import { auth } from '../firebase';
import Loader from '../components/Loader.vue';

export default {
  components: {
    Loader,
  },

  data() {
    return {
      name: '',
      loading: false,
    };
  },

  methods: {
    async join() {
      this.loading = true;

      await auth.signInAnonymously();

      await auth.currentUser.updateProfile({
        displayName: this.name,
      });

      this.$store.commit('user/setUser', auth.currentUser);

      this.loading = false;

      // // eslint-disable-next-line new-cap
      // const provider = new firebase.auth.GoogleAuthProvider();
      //
      // await auth.signInWithPopup(provider);
    },
  },
};
</script>
