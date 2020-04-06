<template>
  <div>
    <Loader :loading="loading" />
    <div class="field">
      <label class="label">Choose a card</label>

      <div class="cards">
        <div class="card" />
        <div class="card" />
        <div class="card" />
        <div class="card" />
        <div class="card" />
        <div class="card" />
      </div>
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
        @click="submit"
      >
        Submit
      </button>
    </div>
  </div>
</template>

<script>
import { getEmptyRoom } from '../../utils/data';
import { db } from '../../firebase';
import Loader from '../../components/Loader.vue';

export default {
  name: 'WriteStory',

  components: {
    Loader,
  },

  data() {
    return {
      loading: false,
      text: '',
      room: getEmptyRoom(),
    };
  },

  firestore() {
    return {
      room: db.collection('rooms').doc(this.$route.params.id),
    };
  },

  methods: {
    async submit() {
      this.loading = true;

      const { rounds } = this.room;

      rounds[this.$route.params.number - 1].story.text = this.text;

      await db.collection('rooms')
        .doc(this.$route.params.id)
        .update({
          rounds,
        });

      this.loading = false;
    },
  },
};
</script>

<style scoped lang="scss">
  .cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    grid-gap: 1rem;

    .card {
      min-height: 7rem;
    }
  }
</style>
