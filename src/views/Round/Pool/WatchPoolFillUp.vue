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
      members: [],
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

      members: db
        .collection('rooms')
        .doc(this.$route.params.roomID)
        .collection('members'),
    };
  },

  watch: {
    pool() {
      this.pool.forEach((item) => {
        if (!this.images.includes(item.card)) {
          this.images.push(item.card);
        }
      });

      if (this.pool.length === this.members.length) {
        this.$router.push({
          name: 'RoundResults',
          params: {
            ...this.$route.params,
          },
        });
      }
    },
  },
};
</script>
