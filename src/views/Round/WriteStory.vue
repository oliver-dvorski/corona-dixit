<template>
  <div>
    <Loader :loading="loading" />
    <div class="field">
      <label class="label">Choose a card</label>

      <Cards
        v-if="hand"
        v-model="card"
        :hand="hand.cards"
      />
    </div>

    <div class="field">
      <label
        for="story"
        class="label"
      >Write the story</label>
      <input
        id="story"
        v-model="text"
        type="text"
        class="input"
        @keydown.enter="submit"
      >
    </div>

    <div class="field">
      <button
        class="button"
        :disabled="card === '' || text === ''"
        @click="submit"
      >
        Submit
      </button>
    </div>
  </div>
</template>

<script>
import { getEmptyRound } from '../../utils/data';
import { auth, db } from '../../firebase';
import Loader from '../../components/Loader.vue';
import Cards from '../../components/Cards.vue';

export default {
  name: 'WriteStory',

  components: {
    Loader,
    Cards,
  },

  data() {
    return {
      loading: false,
      text: '',
      card: '',
      hand: {
        uid: '',
        cards: [],
      },
      self: {},
      round: getEmptyRound(),
    };
  },

  firestore() {
    return {
      round: db
        .collection(`rooms/${this.$route.params.roomID}/rounds/`)
        .doc(this.$route.params.roundID),

      hand: db
        .collection(`rooms/${this.$route.params.roomID}/members/`)
        .doc(auth.currentUser.uid)
        .collection('hand')
        .doc(this.$route.params.roundID),
    };
  },

  methods: {
    async submit() {
      if (this.card === '' || this.text === '') {
        return;
      }

      this.loading = true;

      const { roomID, roundID } = this.$route.params;

      await db
        .collection(`rooms/${roomID}/rounds`)
        .doc(roundID)
        .update({
          storyText: this.text,
        });

      await db
        .collection(`rooms/${roomID}/rounds/${roundID}/pool`)
        .doc(this.card)
        .set({
          card: this.card,
          setBy: auth.currentUser.uid,
          chosenBy: '',
        });

      this.loading = false;
    },
  },
};
</script>
