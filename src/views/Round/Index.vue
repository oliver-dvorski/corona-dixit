<template>
  <section
    v-if="round.id"
    class="section"
  >
    <div v-if="round.number">
      <h1 class="title">
        {{ room.name }}
      </h1>
      <p class="subtitle">
        Round #{{ round.number }}
      </p>
    </div>

    <!--    <pre>{{ round }}</pre>-->

    <div v-if="!voting">
      <WriteStory v-if="round.storyTeller.uid === auth.currentUser.uid" />

      <div v-else>
        <p class="title is-5">
          Waiting on the storyteller to write the story
        </p>
        <p class="subtitle">
          Storyteller for this round: <span class="has-text-weight-bold">{{ round.storyTeller.name }}</span>
        </p>

        <p class="label">
          While you're waiting, take a look at the cards in your hand:
        </p>
        <Cards
          v-if="hand"
          :hand="hand.cards"
        />
      </div>


      <!--    <div v-if="voting && auth.currentUser">-->
      <!--      <Vote v-if="currentRound.storyTeller.id !== auth.currentUser.uid" />-->

      <!--      <Pool v-else />-->
    </div>

    <section
      v-else
      class="section"
    >
      <h2 class="title">
        The story is: {{ round.story.text }}
      </h2>
      <p class="subtitle">
        And the image:
      </p>
      <div class="playing-card story-card-image">
        <img
          :src="storyCardImage"
          alt="Story image"
        >
      </div>
      <!--        <p class="subtitle">-->
      <!--          {{ round.story.text }}-->
      <!--        </p>-->
    </section>
  </section>
</template>

<script>
import { auth, db, storage } from '../../firebase';
import WriteStory from './WriteStory.vue';
import Cards from '../../components/Cards.vue';
// import Vote from './Vote.vue';
// import Pool from './PopulatePool.vue';
import { getEmptyRoom, getEmptyRound } from '../../utils/data';

export default {
  name: 'Round',

  components: {
    WriteStory,
    // Vote,
    // Pool,
    Cards,
  },

  data() {
    return {
      auth,
      room: getEmptyRoom(),
      round: getEmptyRound(),
      hand: {
        uid: '',
        cards: [],
      },
      // TODO: Add an initial loading image or smth here
      storyCardImage: '',
    };
  },

  firestore() {
    return {
      room: db
        .collection('rooms')
        .doc(this.$route.params.roomID),

      round: db
        .collection('rooms')
        .doc(this.$route.params.roomID)
        .collection('rounds')
        .doc(this.$route.params.roundID),

      hand: db
        .collection(`rooms/${this.$route.params.roomID}/members/`)
        .doc(auth.currentUser.uid)
        .collection('hand')
        .doc(this.$route.params.roundID),
    };
  },

  computed: {
    // currentRound() {
    //   return this.room.rounds[this.$route.params.number - 1];
    // },

    voting() {
      // TODO: Add a check for pool size (we're not voting if the pool equals the number of members in the room)
      return this.round.story.text !== '' && this.round.story.card !== '';
    },
  },

  watch: {
    async round() {
      if (this.round.story.card !== '') {
        this.storyCardImage = await storage.ref(this.round.story.card).getDownloadURL();
      }
    },
  },

  // watch: {
  //   async room() {
  //     if (!this.room || !auth.currentUser) {
  //       return;
  //     }
  //
  //     const currentRoomMember = this.room.members.find((member) => member.id === auth.currentUser.uid);
  //
  //     if (currentRoomMember.hand.length > 0) {
  //       for (const fileName of currentRoomMember.hand) {
  //         this.hand.push(await storage.ref(fileName).getDownloadURL());
  //       }
  //     }
  //   },
  // },
};
</script>

<style>
  .story-card-image {
    max-width: 300px;
  }
</style>
