<template>
  <div>
    <div class="field">
      <label class="label">Choose a card</label>
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

export default {
  name: 'WriteStory',

  data() {
    return {
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
      const { rounds } = this.room;

      rounds[this.$route.params.number - 1].story.text = this.text;

      await db.collection('rooms')
        .doc(this.$route.params.id)
        .update({
          rounds,
        });
    },
  },
};
</script>
