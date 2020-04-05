<template>
  <div>
    <section class="section">
      <h1 class="title">
        {{ room.name }} ({{ room.members.length }})
      </h1>
      <p class="subtitle">
        Hosted by {{ room.host.name }}
      </p>
      <p>Waiting for players to connect...</p>

      <div class="content">
        <ul>
          <li
            v-for="member in room.members"
            :key="member.id"
          >
            {{ member.name }}
          </li>
        </ul>
      </div>
    </section>
  </div>
</template>

<script>
import { db } from '../firebase';

export default {
  name: 'Room',

  data() {
    return {
      room: {
        name: '',
        members: [{
          name: '',
          id: '',
        }],
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
};
</script>

<style scoped>

</style>
