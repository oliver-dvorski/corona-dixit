<template>
  <section class="section">
    <h1 class="title">
      Round #{{ $route.params.number }}
    </h1>

    <div v-if="!voting && auth.currentUser">
      <WriteStory v-if="currentRound.storyTeller.id === auth.currentUser.uid" />

      <div v-else>
        <p class="title is-5">
          Waiting on the storyteller to write the story
        </p>
        <p class="subtitle">
          Storyteller for this round: <span class="has-text-weight-bold">{{ currentRound.storyTeller.name }}</span>
        </p>

        <p class="label">
          While you're waiting, take a look at the cards in your hand:
        </p>
        <Cards :hand="hand" />
      </div>
    </div>

    <p class="subtitle">
      {{ currentRound.story.text }}
    </p>

    <div v-if="voting && auth.currentUser">
      <Vote v-if="currentRound.storyTeller.id !== auth.currentUser.uid" />

      <Pool v-else />
    </div>
  </section>
</template>

<script>
import { auth, db, storage } from '../../firebase';
import WriteStory from './WriteStory.vue';
import Cards from '../../components/Cards.vue';
import Vote from './Vote.vue';
import Pool from './Pool.vue';
import { getEmptyRoom } from '../../utils/data';

export default {
  name: 'Round',

  components: {
    WriteStory,
    Vote,
    Pool,
    Cards,
  },

  data() {
    return {
      auth,
      hand: [],
      room: getEmptyRoom(),
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

    voting() {
      return this.currentRound.story.text !== '' && this.currentRound.story.card !== '';
    },
  },

  watch: {
    async room() {
      if (!this.room || !auth.currentUser) {
        return;
      }

      const currentRoomMember = this.room.members.find((member) => member.id === auth.currentUser.uid);

      if (currentRoomMember.hand.length > 0) {
        for (const fileName of currentRoomMember.hand) {
          this.hand.push(await storage.ref(fileName).getDownloadURL());
        }
      }
    },
  },
};
</script>
