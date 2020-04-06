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
          <router-link
            :to="{
              name: 'Round',
              params: {
                number: 1
              }
            }"
            class="button"
          >
            Start game
          </router-link>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { firestore } from 'firebase/app';
import { auth, db } from '../firebase';

export default {
  name: 'Room',

  data() {
    return {
      auth,
      room: {
        name: '',
        members: [],
        host: {
          name: '',
          id: '',
        },
      },
    };
  },

  firestore() {
    return {
      room: db.collection('rooms').doc(this.$route.params.id),
    };
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
};
</script>

<style scoped>

</style>
