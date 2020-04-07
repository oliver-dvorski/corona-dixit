<template>
  <div>
    <section
      v-if="room"
      class="section"
    >
      <h1 class="title">
        {{ room.name }} ({{ room.members.length }})
      </h1>
      <p>Waiting for players to connect...</p>

      <div class="content">
        <ul>
          <li
            v-for="member in room.members"
            :key="member.id"
            :class="{'has-text-primary': member.id === room.host.id}"
          >
            {{ member.name }}
          </li>
        </ul>
      </div>

      <div v-if="auth.currentUser.uid === room.host.id && room.members.length > 2">
        <div class="field">
          <button
            class="button"
            @click="startGame"
          >
            Start game
          </button>
        </div>
      </div>
    </section>

    <Loader :loading="dealingCards" />
  </div>
</template>

<script>
import { firestore } from 'firebase/app';
import { auth, db, functions } from '../firebase';
import { getEmptyRoom } from '../utils/data';
import { notify } from '../utils/notifications';
import Loader from '../components/Loader.vue';

export default {
  name: 'Room',

  components: {
    Loader,
  },

  data() {
    return {
      dealingCards: false,
      auth,
      room: getEmptyRoom(),
    };
  },

  firestore() {
    return {
      room: db.collection('rooms').doc(this.$route.params.id),
    };
  },

  watch: {
    async room() {
      if (this.room === null) {
        return;
      }

      const userAlreadyMember = this.room.members.find((member) => member.id === auth.currentUser.uid);

      if (this.room.startedAt && !userAlreadyMember) {
        await notify('This room is full');

        await this.$router.push({
          name: 'Home',
        });

        return;
      }

      if (!userAlreadyMember && !this.room.startedAt) {
        await db.collection('rooms').doc(this.$route.params.id).update({
          members: firestore.FieldValue.arrayUnion({
            id: auth.currentUser.uid,
            name: auth.currentUser.displayName,
            hand: [],
          }),
        });
      }

      if (this.room.startedAt && userAlreadyMember && !this.dealingCards) {
        await notify('Game started');

        await this.$router.push({
          name: 'Round',
          params: {
            number: 1,
          },
        });
      }
    },
  },

  methods: {
    async startGame() {
      this.dealingCards = true;

      await db.collection('rooms').doc(this.$route.params.id).update({
        startedAt: Date.now(),
      });

      const shuffle = functions.httpsCallable('shuffleCards');

      await shuffle({
        roomID: this.$route.params.id,
      });

      this.dealingCards = false;
    },
  },
};
</script>
