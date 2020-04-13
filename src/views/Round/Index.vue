<template>
  <section
    v-if="round.id"
    class="section"
  >
    <Loader :loading="!hand" />

    <div v-if="hand">
      <div v-if="round.number">
        <h1 class="title">
          {{ room.name }}
        </h1>
        <p class="subtitle">
          Round #{{ round.number }}
        </p>
      </div>

      <!--    <pre>{{ round }}</pre>-->

      <div v-if="round.storyText === ''">
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
        <WatchPoolFillUp v-if="auth.currentUser.uid === round.storyTeller.uid" />

        <div v-else>
          <h2 class="title">
            The story is: {{ round.storyText }}
          </h2>

          <AddToPool v-if="currentUserPoolCollection.length === 0" />
        </div>
      </section>
    </div>
  </section>
</template>

<script>
import { auth, db } from '../../firebase';
import WriteStory from './WriteStory.vue';
import Cards from '../../components/Cards.vue';
// import Vote from './Vote.vue';
import WatchPoolFillUp from './Pool/WatchPoolFillUp.vue';
import AddToPool from './Pool/AddToPool.vue';
import { getEmptyRoom, getEmptyRound } from '../../utils/data';
import Loader from '../../components/Loader.vue';

export default {
  name: 'Round',

  components: {
    WriteStory,
    // Vote,
    WatchPoolFillUp,
    AddToPool,
    Cards,
    Loader,
  },

  data() {
    return {
      auth,
      room: getEmptyRoom(),
      round: getEmptyRound(),
      members: [],
      currentUserPoolCollection: [],
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

      members: db
        .collection('rooms')
        .doc(this.$route.params.roomID)
        .collection('members'),

      hand: db
        .collection(`rooms/${this.$route.params.roomID}/members/`)
        .doc(auth.currentUser.uid)
        .collection('hand')
        .doc(this.$route.params.roundID),

      currentUserPoolCollection: db
        .collection('rooms')
        .doc(this.$route.params.roomID)
        .collection('rounds')
        .doc(this.$route.params.roundID)
        .collection('pool')
        .where('setBy', '==', auth.currentUser.uid),
    };
  },

  computed: {
    // currentRound() {
    //   return this.room.rounds[this.$route.params.number - 1];
    // },

    voting() {
      return this.round.storyText !== '' && this.members.length > this.round.pool.length;
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
