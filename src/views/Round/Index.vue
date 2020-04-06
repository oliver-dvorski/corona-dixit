<template>
  <section class="section">
    <h1 class="title">
      Round #{{ $route.params.number }}
    </h1>

    <div v-if="currentRound.story.text === '' || currentRound.story.card === ''">
      <WriteStory v-if="currentRound.storyTeller.id === auth.currentUser.uid" />
    </div>
  </section>
</template>

<script>
import { auth, db } from '../../firebase';
import WriteStory from './WriteStory.vue';

export default {
  name: 'Round',

  components: {
    WriteStory,
  },

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
        rounds: [{
          storyTeller: {
            name: '',
            id: '',
          },
          pool: [],
          story: {
            text: '',
            card: '',
          },
        }],
      },
    };
  },

  firestore() {
    return {
      room: db.collection('rooms').doc(this.$route.params.id),
    };
  },

  computed: {
    currentRound() {
      return this.room.rounds[this.$route.params.number - 1];
    },
  },
};
</script>
