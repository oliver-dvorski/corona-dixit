<template>
  <section class="section">
    <h1 class="title">
      Round #{{ $route.params.number }}
    </h1>

    <div v-if="currentRound.story.text === '' || currentRound.story.card === ''">
      <WriteStory v-if="currentRound.storyTeller.id === auth.currentUser.uid" />

      <div v-else>
        <p class="title is-5">
          Waiting on the storyteller to write the story
        </p>
        <p class="subtitle">
          Storyteller for this round: <span class="has-text-weight-bold">{{ currentRound.storyTeller.name }}</span>
        </p>

        <p>While you're waiting, take a look at the cards in your hand:</p>
        <div class="cards">
          <div
            v-for="(card, index) in hand"
            :key="index"
            class="card"
          >
            <img
              :src="card"
              alt="Card"
            >
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { auth, db, storage } from '../../firebase';
import WriteStory from './WriteStory.vue';
import { getEmptyRoom } from '../../utils/data';

export default {
  name: 'Round',

  components: {
    WriteStory,
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
  },

  watch: {
    async room() {
      if (!this.room) {
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
