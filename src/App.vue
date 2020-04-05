<template>
  <div id="app">
    <User #user="{ user }">
      <section class="hero is-primary">
        <div class="hero-body">
          <div class="container">
            <h1 class="title">
              <router-link :to="{ name: 'Home' }">
                Dixit 🔥
              </router-link>
            </h1>
            <p
              v-if="user && user.displayName !== null && user.displayName !== ''"
              class="subtitle"
            >
              <span>Signed in as</span>
              &nbsp;
              <router-link
                :to="{ name: 'UserProfile' }"
                class="tag is-dark"
              >
                {{
                  user.displayName
                }}
              </router-link>
            </p>
          </div>
        </div>
      </section>
    </User>

    <router-view />
  </div>
</template>

<script>
import User from './components/User.vue';
import { auth } from './firebase';

export default {
  name: 'App',

  components: {
    User,
  },

  data() {
    return {
      auth,
    };
  },
};
</script>

<style>
  .hero .title a {
    color: inherit;
  }
</style>
