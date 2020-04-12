<template>
  <div>
    <Loader :loading="loading" />
    <div class="field">
      <label class="label">Choose a card</label>

      <Cards
        v-model="card"
        :hand="hand"
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
      hand: [],
      round: getEmptyRound(),
    };
  },

  firestore() {
    return {
      round: db.collection(`rooms/${this.$route.params.roomID}/rounds/`).doc(this.$route.params.roundID),
    };
  },

  watch: {
    round() {
      const membersRef = db
        .collection('rooms')
        .doc(this.$route.params.roomID)
        .collection('members');

      membersRef
        .where('uid', '==', auth.currentUser.uid)
        .get()
        .then((snap) => {
          membersRef
            .doc(snap.docs[0].id)
            .collection('hand')
            .where('roundID', '==', this.round.id)
            .get()
            .then((handSnap) => {
              this.hand = handSnap.docs[0].data().cards;
            });
        });
    },
  },

  methods: {
    async submit() {
      if (this.card === '' || this.text === '') {
        return;
      }

      this.loading = true;

      await db
        .collection(`rooms/${this.$route.params.roomID}/rounds`)
        .doc(this.$route.params.roundID)
        .update({
          story: {
            card: this.card,
            text: this.text,
          },
        });

      this.loading = false;
    },
  },
};
</script>
