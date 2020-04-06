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
  </div>
</template>

<script>
import { firestore } from 'firebase/app';
import { auth, db } from '../firebase';
import { getEmptyRoom } from '../utils/data';
import { notify } from '../utils/notifications';

export default {
  name: 'Room',

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

  watch: {
    room() {
      if (this.room && this.room.startedAt) {
        notify('Game started');

        this.$router.push({
          name: 'Round',
          params: {
            number: 1,
          },
        });
      }
    },
  },

  async mounted() {
    const userAlreadyMember = this.room.members.find((member) => member.id === auth.currentUser.uid);

    if (!userAlreadyMember) {
      await db.collection('rooms').doc(this.$route.params.id).update({
        members: firestore.FieldValue.arrayUnion({
          id: auth.currentUser.uid,
          name: auth.currentUser.displayName,
        }),
      });
    }
  },

  methods: {
    async startGame() {
      await db.collection('rooms').doc(this.$route.params.id).update({
        startedAt: Date.now(),
      });
    },
  },
};
</script>
