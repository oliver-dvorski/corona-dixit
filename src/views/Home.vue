<template>
  <div>
    <User v-slot:user="{ user }">
      <section
        v-if="user"
        class="section"
      >
        <h3 class="title">
          Join:
        </h3>

        <p v-if="rooms.length === 0">
          No rooms created yet
        </p>

        <router-link
          v-for="room in rooms"
          :key="room.id"
          class="box room"
          :to="{
            name: 'Lobby',
            params: {
              id: room.id
            }
          }"
        >
          <p>{{ room.name ? room.name : 'Missing name' }}</p>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
          >
            <g
              class="nc-icon-wrapper"
              stroke-linecap="square"
              stroke-linejoin="miter"
              stroke-width="2"
              fill="currentColor"
              stroke="currentColor"
            >
              <line
                data-cap="butt"
                data-color="color-2"
                fill="none"
                stroke-miterlimit="10"
                x1="6"
                y1="12"
                x2="17"
                y2="12"
                stroke-linecap="butt"
              />
              <polyline
                data-color="color-2"
                fill="none"
                stroke-miterlimit="10"
                points=" 13,8 17,12 13,16 "
              />
              <circle
                fill="none"
                stroke="currentColor"
                stroke-miterlimit="10"
                cx="12"
                cy="12"
                r="11"
              />
            </g>
          </svg>
        </router-link>

        <router-link :to="{ name: 'NewRoom' }">
          Host new game
        </router-link>
      </section>

      <Join v-else />
    </User>
  </div>
</template>

<script>
import User from '../components/User.vue';
import Join from './Join.vue';
import { db } from '../firebase';

export default {
  name: 'Home',

  components: {
    User,
    Join,
  },

  data() {
    return {
      rooms: [],
      db,
    };
  },

  firestore() {
    return {
      rooms: db.collection('rooms').orderBy('createdAt', 'desc'),
    };
  },
};
</script>

<style>
  .room.box {
    cursor: pointer;
    display: grid;
    grid-template-columns: 1fr max-content;
    color: inherit;
  }
</style>
