<template>
  <div>
    <Loader :loading="loading" />

    <div class="field">
      <p class="label">
        Add your card to the pool:
      </p>
      <Cards
        v-model="selection"
        :hand="hand.cards"
      />
    </div>

    <div class="field">
      <button
        class="button"
        @click="submit"
      >
        Submit
      </button>
    </div>
  </div>
</template>

<script>
import { auth, db } from '../../../firebase';
import Cards from '../../../components/Cards.vue';
import Loader from '../../../components/Loader.vue';

export default {
  name: 'AddToPool',

  components: {
    Cards,
    Loader,
  },

  data() {
    return {
      loading: false,

      selection: '',

      hand: {
        uid: '',
        cards: [],
      },
    };
  },

  firestore() {
    return {
      hand: db
        .collection(`rooms/${this.$route.params.roomID}/members/`)
        .doc(auth.currentUser.uid)
        .collection('hand')
        .doc(this.$route.params.roundID),
    };
  },

  methods: {
    async submit() {
      this.loading = true;

      await db
        .collection('rooms')
        .doc(this.$route.params.roomID)
        .collection('rounds')
        .doc(this.$route.params.roundID)
        .collection('pool')
        .doc(this.selection)
        .set({
          card: this.selection,
          setBy: auth.currentUser.uid,
          chosenBy: '',
        });

      this.loading = false;
    },
  },
};
</script>

<style scoped>

</style>
