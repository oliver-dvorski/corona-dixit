<template>
  <div>
    <Loader :loading="loading" />

    <div class="field">
      <p class="label">
        Cast your vote
      </p>
      <Cards
        v-model="vote"
        :hand="round.pool"
      />
    </div>

    <div class="field">
      <button
        class="button"
        @click="castVote"
      >
        Submit
      </button>
    </div>
  </div>
</template>

<script>
import firebase from 'firebase/app';
import { auth, db } from '../../firebase';
import Cards from '../../components/Cards.vue';
import Loader from '../../components/Loader.vue';
import { getEmptyRoom } from '../../utils/data';

export default {
  name: 'Vote',

  components: {
    Cards,
    Loader,
  },

  data() {
    return {
      loading: false,
      pool: [],
      round: getEmptyRoom(),
      vote: '',
    };
  },

  firestore() {
    return {
      round: db
        .collection('rooms')
        .doc(this.$route.params.roomID)
        .collection('rounds')
        .doc(this.$route.params.roundID),
    };
  },

  methods: {
    async castVote() {
      this.loading = true;
      await db
        .collection('rooms')
        .doc(this.$route.params.roomID)
        .collection('rounds')
        .doc(this.$route.params.roundID)
        .collection('pool')
        .doc(this.vote)
        .update({
          chosenBy: firebase.firestore.FieldValue.arrayUnion(auth.currentUser.uid),
        });

      await db
        .collection('rooms')
        .doc(this.$route.params.roomID)
        .collection('rounds')
        .doc(this.$route.params.roundID)
        .update({
          voted: firebase.firestore.FieldValue.arrayUnion(auth.currentUser.uid),
        });

      await this.$router.push({
        name: 'RoundResults',
        params: {
          ...this.$route.params,
        },
      });

      this.loading = false;
    },
  },
};
</script>
