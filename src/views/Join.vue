<template>
  <section class="section">
    <h3 class="title">
      Set display name
    </h3>
    <div class="field">
      <label
        class="label"
        for="display-name"
      >Label</label>
      <div class="control">
        <input
          id="display-name"
          v-model="name"
          class="input"
          type="text"
        >
      </div>
    </div>

    <div class="field">
      <button
        class="button"
        @click="join"
      >
        Join
      </button>
    </div>
  </section>
</template>

<script>
import { auth, db } from '../firebase';
import EventBus from '../EventBus';

export default {
  data() {
    return {
      name: '',
    };
  },

  methods: {
    async join() {
      const user = await auth.signInAnonymously();

      console.log(user);

      await db.collection('users').add({
        name: this.name,
        uid: auth.currentUser.uid,
      });

      EventBus.$emit('userDisplayName', this.name);
    },
  },
};
</script>
