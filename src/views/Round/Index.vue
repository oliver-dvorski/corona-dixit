<template>
  <section class="section">
    <h1
      v-if="round.number"
      class="title"
    >
      Round #{{ round.number }}
    </h1>

    <pre>{{ round }}</pre>

    <div v-if="!voting">
      <WriteStory v-if="round.storyTeller.uid === auth.currentUser.uid" />

    <!--      <div v-else>-->
    <!--        <p class="title is-5">-->
    <!--          Waiting on the storyteller to write the story-->
    <!--        </p>-->
    <!--        <p class="subtitle">-->
    <!--          Storyteller for this round: <span class="has-text-weight-bold">{{ currentRound.storyTeller.name }}</span>-->
    <!--        </p>-->

    <!--        <p class="label">-->
    <!--          While you're waiting, take a look at the cards in your hand:-->
    <!--        </p>-->
    <!--        <Cards :hand="hand" />-->
    <!--      </div>-->
    <!--    </div>-->

    <!--    <p class="subtitle">-->
    <!--      {{ currentRound.story.text }}-->
    <!--    </p>-->

    <!--    <div v-if="voting && auth.currentUser">-->
    <!--      <Vote v-if="currentRound.storyTeller.id !== auth.currentUser.uid" />-->

    <!--      <Pool v-else />-->
    </div>
  </section>
</template>

<script>
import { auth, db } from '../../firebase';
import WriteStory from './WriteStory.vue';
// import Cards from '../../components/Cards.vue';
// import Vote from './Vote.vue';
// import Pool from './PopulatePool.vue';
import { getEmptyRoom, getEmptyRound } from '../../utils/data';

export default {
  name: 'Round',

  components: {
    WriteStory,
    // Vote,
    // Pool,
    // Cards,
  },

  data() {
    return {
      auth,
      hand: [],
      room: getEmptyRoom(),
      round: getEmptyRound(),
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
    };
  },

  computed: {
    // currentRound() {
    //   return this.room.rounds[this.$route.params.number - 1];
    // },

    voting() {
      return this.round.story.text !== '' && this.round.story.card !== '';
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
