<template>
  <div>
    <User v-slot:user="{ user }">
      <section class="hero is-primary">
        <div class="hero-body">
          <div class="container">
            <h1 class="title">
              Dixit 🔥
            </h1>
            <p class="subtitle" v-if="user && user.displayName !== null">
              <span>Signed in as</span> <span class="tag is-dark">{{ user.displayName }}</span>
            </p>
          </div>
        </div>
      </section>

      <section class="section" v-if="user">
        <h3 class="title">Join:</h3>
        <div class="box room" v-for="(room, index) in rooms" :key="index">
          <p>{{ room }}</p>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g class="nc-icon-wrapper" stroke-linecap="square" stroke-linejoin="miter" stroke-width="2" fill="currentColor" stroke="currentColor"><line data-cap="butt" data-color="color-2" fill="none" stroke-miterlimit="10" x1="6" y1="12" x2="17" y2="12" stroke-linecap="butt"/> <polyline data-color="color-2" fill="none" stroke-miterlimit="10" points=" 13,8 17,12 13,16 "/> <circle fill="none" stroke="currentColor" stroke-miterlimit="10" cx="12" cy="12" r="11"/></g></svg>
        </div>
        <router-link :to="{ name: 'NewRoom' }">Host new game</router-link>
      </section>

      <Join v-else />
    </User>
  </div>
</template>

<script>
import User from './User.vue';
import Join from './Join.vue';

export default {
  components: {
    User,
    Join,
  },
  data() {
    return {
      rooms: ['🔍🏡 Zoom zoom', '🔥 Public room'],
    };
  },
};
</script>

<style>
  .room.box {
    cursor: pointer;
    display: grid;
    grid-template-columns: 1fr max-content;
  }
</style>
