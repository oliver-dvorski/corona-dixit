<template>
  <div>
    <Cards
      v-if="pool.length > 0"
      :hand="images"
    />
    <p v-else>
      Waiting for first card in pool
    </p>
  </div>
</template>

<script>
import Cards from '../../../components/Cards.vue';
import { db } from '../../../firebase';

export default {
  name: 'WatchPoolFillUp',

  components: {
    Cards,
  },

  data() {
    return {
      pool: [],
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
      this.images = this.pool.map((item) => item.card);
    },
  },
};
</script>
