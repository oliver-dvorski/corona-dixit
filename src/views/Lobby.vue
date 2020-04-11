<template>
  <div>
    <Loader :loading="!room.host.uid" />

    <section
      v-if="room.host.uid"
      class="section"
    >
      <h1 class="title">
        {{ room.name }} ({{ members.length }})
      </h1>
      <p>Waiting for players to connect...</p>

      <div class="content">
        <ul>
          <li
            v-for="member in members"
            :key="member.uid"
            :class="{'has-text-primary': member.uid === room.host.uid}"
          >
            {{ member.name }}
          </li>
        </ul>
      </div>

      <div v-if="room.host.uid && auth.currentUser.uid === room.host.uid && members.length > 2">
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
  </div>
</template>

<script>
import { auth, db } from '../firebase';
import { getEmptyRoom, getEmptyRound } from '../utils/data';
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
      rounds: [],
      members: [],
    };
  },

  firestore() {
    return {
      room: db
        .collection('rooms')
        .doc(this.$route.params.id),

      rounds: db
        .collection('rooms')
        .doc(this.$route.params.id)
        .collection('rounds')
        .orderBy('number', 'desc'),

      members: db
        .collection('rooms')
        .doc(this.$route.params.id)
        .collection('members'),
    };
  },

  computed: {
    cardsDealt() {
      if (!this.room) {
        return false;
      }

      let count = 0;

      this.members.forEach((member) => {
        count += member.hand.length;
      });

      return count === this.members.length * 6;
    },

    dealingCards() {
      if (!this.room) {
        return false;
      }

      return this.room.startedAt && !this.cardsDealt;
    },
  },

  watch: {
    room() {
      const userAlreadyMember = this.members.find((member) => member.uid === auth.currentUser.uid);

      if (this.room.startedAt && userAlreadyMember) {
        this.resumeRound();
      }
    },

    async members() {
      if (this.members.length === 0) {
        return;
      }

      const userAlreadyMember = this.members.find((member) => member.uid === auth.currentUser.uid);

      if (this.room.startedAt && !userAlreadyMember) {
        this.goHome();
      }

      if (this.room.startedAt && userAlreadyMember) {
        this.resumeRound();
      }

      if (!this.room.startedAt && !userAlreadyMember) {
        await db
          .collection('rooms')
          .doc(this.$route.params.id)
          .collection('members')
          .add({
            uid: auth.currentUser.uid,
            name: auth.currentUser.displayName,
          });
      }
    },
  },

  methods: {
    goHome() {
      this.$router.push({
        name: 'Home',
      });
    },

    resumeRound() {
      this.$router.push({
        name: 'Round',
        params: {
          roomID: this.room.id,
          roundID: this.rounds[this.rounds.length - 1].id,
        },
      });
    },

    async startGame() {
      await db
        .collection('rooms')
        .doc(this.$route.params.id)
        .update({
          startedAt: Date.now(),
        });

      const newRound = await db
        .collection('rooms')
        .doc(this.$route.params.id)
        .collection('rounds')
        .add(getEmptyRound());

      // const shuffle = functions.httpsCallable('shuffleCards');
      //
      // await shuffle({
      //   roomID: this.$route.params.id,
      // });

      await this.$router.push({
        name: 'Round',
        params: {
          roomID: this.room.id,
          roundID: newRound.id,
        },
      });
    },
  },
};
</script>
