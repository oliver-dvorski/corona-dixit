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
import Loader from '../components/Loader.vue';

export default {
  name: 'Lobby',

  components: {
    Loader,
  },

  data() {
    return {
      auth,
      room: getEmptyRoom(),
    };
  },

  firestore() {
    return {
      room: db.collection('rooms').doc(this.$route.params.id),
    };
  },

  computed: {
    userAlreadyMember() {
      if (!this.room || !auth.currentUser) {
        return;
      }

      return this.room.members.find((member) => member.id === auth.currentUser.uid);
    },

    cardsDealt() {
      if (!this.room) {
        return false;
      }

      let count = 0;

      this.room.members.forEach((member) => {
        count += member.hand.length;
      });

      return count === this.room.members.length * 6;
    },

    dealingCards() {
      if (!this.room) {
        return false;
      }

      return this.room.startedAt && !this.cardsDealt;
    },
  },

  watch: {
    async room() {
      if (!this.room) {
        return;
      }

      if (this.room.startedAt && !this.userAlreadyMember) {
        await this.$router.push({
          name: 'Home',
        });

        return;
      }

      if (!this.userAlreadyMember && !this.room.startedAt) {
        await db.collection('rooms').doc(this.$route.params.id).update({
          members: firestore.FieldValue.arrayUnion({
            id: auth.currentUser.uid,
            name: auth.currentUser.displayName,
            hand: [],
          }),
        });
      }
    },

    async dealingCards() {
      if (!this.room) {
        return false;
      }

      if (this.room.startedAt && this.userAlreadyMember && !this.dealingCards) {
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
      await db.collection('rooms').doc(this.$route.params.id).update({
        startedAt: Date.now(),
      });

      const shuffle = functions.httpsCallable('shuffleCards');

      await shuffle({
        roomID: this.$route.params.id,
      });
    },
  },
};
</script>
