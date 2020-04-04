<template>
  <div>
    <User #user="{ user }">
      <section class="section">
        <div
          v-if="user"
          class="content"
        >
          <p v-if="user.displayName">
            Display name: {{ user.displayName }}
          </p>
          <p>Joined: {{ user.metadata.creationTime }}</p>
          <p>UID: {{ user.uid }}</p>
        </div>

        <div class="field">
          <button
            class="button"
            @click="logout"
          >
            Log out
          </button>
        </div>
      </section>
    </User>
  </div>
</template>

<script>
import User from '../components/User.vue';
import { auth } from '../firebase';

export default {
  components: {
    User,
  },

  methods: {
    async logout() {
      await auth.signOut();

      await this.$router.push({
        name: 'Home',
      });
    },
  },
};
</script>
