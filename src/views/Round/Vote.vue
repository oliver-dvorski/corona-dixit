<template>
  <div>
    <Loader :loading="loading" />

    <p class="label">
      Cast your vote
    </p>
    <Cards
      v-model="vote"
      :hand="hand"
    />

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
import { auth, db, storage } from '../../firebase';

export default {
  name: 'Vote',

  components: {
    Cards,
    Loader,
  },

  data() {
    return {
      loading: false,
      hand: [],
      room: getEmptyRoom(),
      vote: '',
    };
  },

  firestore() {
    return {
      room: db.collection('rooms').doc(this.$route.params.id),
    };
  },

  watch: {
    async room() {
      if (!this.room || !auth.currentUser) {
        return;
      }

      const currentRoomMember = this.room.members.find((member) => member.id === auth.currentUser.uid);

      if (currentRoomMember.hand.length > 0) {
        this.hand = [];

        for (const fileName of currentRoomMember.hand) {
          this.hand.push(await storage.ref(fileName).getDownloadURL());
        }
      }
    },
  },

  methods: {
    async castVote() {
      this.loading = true;

      const { rounds } = this.room;

      rounds[this.$route.params.number - 1].pool.push({
        file: this.vote,
        setBy: auth.currentUser.uid,
        chosenBy: '',
      });

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
