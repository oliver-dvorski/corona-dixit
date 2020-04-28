<template>
  <div class="cards-grid mb">
    <div
      v-for="item in parsedPool"
      :key="item.id"
      class="playing-card"
    >
      <p class="set-by">
        {{ item.setBy.name }}
      </p>
      <img
        :src="item.downloadURL"
        alt="Card"
      >
      <div
        v-if="item.chosenBy.length > 0"
        class="content chosen-by"
      >
        <ul>
          <li
            v-for="member in item.chosenBy"
            :key="member.uid"
          >
            {{ member.name }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { storage } from '../../../firebase';

export default {
  name: 'ByCard',
  props: {
    pool: {
      type: Array,
      required: true,
    },
  },

  data() {
    return {
      parsedPool: [],
    };
  },

  watch: {
    pool: {
      immediate: true,
      handler() {
        this.parsePool();
      },
    },
  },

  methods: {
    async parsePool() {
      for (const poolItem of this.pool) {
        const existing = this.parsedPool.find((item) => item.card === poolItem.card);
        if (existing) {
          return;
        }

        const downloadURL = await storage.ref(poolItem.card).getDownloadURL();
        this.parsedPool.push({
          ...poolItem,
          downloadURL,
        });
      }
    },
  },
};
</script>

<style scoped lang="scss">
  .mb {
    margin-bottom: 1rem;
  }
</style>
