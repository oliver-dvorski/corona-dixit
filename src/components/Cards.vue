<template>
  <div class="cards-grid">
    <div
      v-for="card in images"
      :key="card.ref"
      class="playing-card"
      :class="{ 'selected' : selected === card.ref }"
      @click="$emit('select', card.ref)"
    >
      <svg
        v-if="card.ref === selected"
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
      ><g
        class="nc-icon-wrapper"
        fill="currentColor"
      ><path
        d="M12,0A12,12,0,1,0,24,12,12.035,12.035,0,0,0,12,0ZM10,17.414,4.586,12,6,10.586l4,4,8-8L19.414,8Z"
        fill="currentColor"
      /></g></svg>
      <img
        :src="card.link"
        alt="Card"
      >
    </div>
  </div>
</template>

<script>
import { storage } from '../firebase';

export default {
  name: 'Cards',

  model: {
    prop: 'selected',
    event: 'select',
  },

  props: {
    selected: {
      type: String,
      default: '',
    },

    hand: {
      type: Array,
      required: true,
    },

    selectable: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      images: [],
    };
  },

  watch: {
    hand: {
      immediate: true,
      handler() {
        this.hand.forEach(async (ref) => {
          if (this.images.find((image) => image.ref === ref)) {
            return;
          }

          const link = await storage.ref(ref).getDownloadURL();

          this.images.push({
            ref,
            link,
          });
        });
      },
    },
  },
};
</script>
