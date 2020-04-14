<template>
  <div>
    <Loader :loading="loading" />

    <div class="field">
      <p class="label">
        Cast your vote
      </p>
      <Cards
        v-model="vote"
        :hand="images"
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
import Cards from '../../components/Cards.vue';
import Loader from '../../components/Loader.vue';
import { getEmptyRoom } from '../../utils/data';
import { db } from '../../firebase';

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
      images: [],
    };
  },

  firestore() {
    return {
      pool: db
        .collection('rooms')
        .doc(this.$route.params.roomID)
        .collection('rounds')
        .doc(this.$route.params.roundID)
        .collection('pool'),
    };
  },

  watch: {
    pool() {
      this.pool.forEach((item) => {
        if (!this.images.includes(item.card)) {
          this.images.push(item.card);
        }
      });
    },
  },

  methods: {
    async castVote() {
      this.loading = true;
      //
      this.loading = false;
    },
  },
};
</script>
