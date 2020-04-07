<template>
  <div>
    <Loader :loading="loading" />
    <div class="field">
      <label class="label">Choose a card</label>

      <div class="cards">
        <div
          v-for="(card, index) in hand"
          :key="index"
          class="card"
        >
          <img
            :src="card"
            alt="Card"
          >
        </div>
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
import { auth, db, storage } from '../../firebase';
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
      hand: [],
      room: getEmptyRoom(),
    };
  },

  firestore() {
    return {
      room: db.collection('rooms').doc(this.$route.params.id),
    };
  },

  watch: {
    async room() {
      const currentRoomMember = this.room.members.find((member) => member.id === auth.currentUser.uid);
      if (currentRoomMember.hand.length > 0) {
        // eslint-disable-next-line no-restricted-syntax
        for (const fileName of currentRoomMember.hand) {
          // eslint-disable-next-line no-await-in-loop
          this.hand.push(await storage.ref(fileName).getDownloadURL());
        }
      }
    },
  },

  // computed: {
  //   handURLs() {
  //
  //     const list = [];
  //
  //     for (const cardID of currentRoomMember.hand) {
  //       list.push(await storage.ref(cardID).getDownloadURL());
  //     }
  //
  //     return list;
  //   },
  // },

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

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
  }
</style>
