<template>
  <section class="section">
    <loader :loading="loading" />

    <h3 class="title">
      New room
    </h3>
    <div class="columns">
      <div class="column">
        <label for="name">Room name</label>
        <input
          id="name"
          v-model="name"
          type="text"
          class="input"
          @keydown.enter="createGame"
        >
      </div>
    </div>

    <button
      class="button is-primary"
      @click="createGame"
    >
      Host game
    </button>
  </section>
</template>

<script>
import { auth, db } from '../firebase';
import Loader from '../components/Loader.vue';

export default {
  name: 'NewRoom',

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
    async createGame() {
      this.loading = true;

      const host = {
        id: auth.currentUser.uid,
        name: auth.currentUser.displayName,
        hand: [],
      };

      const newRoom = await db.collection('rooms').add({
        name: this.name,
        host,
        createdAt: Date.now(),
        startedAt: null,
        members: [
          host,
        ],
        rounds: [{
          storyTeller: host,
          pool: [],
          story: {
            text: '',
            card: '',
          },
        }],
      });

      this.name = '';

      this.loading = false;

      await this.$router.push({
        name: 'Room',
        params: {
          id: newRoom.id,
        },
      });
    },
  },
};
</script>
