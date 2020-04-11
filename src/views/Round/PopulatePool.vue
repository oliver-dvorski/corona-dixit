<template>
  <div>
    <Cards :hand="pool" />
  </div>
</template>

<script>
import Cards from '../../components/Cards.vue';
import { db } from '../../firebase';
import { getEmptyRoom } from '../../utils/data';

export default {
  name: 'PoolVue',

  components: {
    Cards,
  },

  data() {
    return {
      room: getEmptyRoom(),
    };
  },

  firestore() {
    return {
      room: db.collection('rooms').doc(this.$route.params.id),
    };
  },

  computed: {
    pool() {
      if (!this.room) {
        return [];
      }

      return this.room.rounds[this.$route.params.number - 1].pool.map((item) => item.file);
    },
  },
};
</script>
