<template>
  <section class="section">
    <h3 class="title">Set display name</h3>
    <div class="field">
      <label class="label" for="display-name">Label</label>
      <div class="control">
        <input class="input" type="text" id="display-name" v-model="name">
      </div>
    </div>

    <div class="field">
      <button class="button" @click="join">Join</button>
    </div>
  </section>
</template>

<script>
import { auth } from '../firebase';

export default {
  data() {
    return {
      name: '',
    };
  },

  methods: {
    async join() {
      await auth.signInAnonymously();

      await auth.currentUser.updateProfile({
        displayName: this.name,
      });
    },
  },
};
</script>
