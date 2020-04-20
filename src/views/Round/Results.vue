<template>
  <section class="section">
    <Loader :loading="loading" />
    <div
      v-if="waitingOn.length > 0"
      class="content container"
    >
      <p>Waiting on:</p>
      <ul>
        <li
          v-for="member in waitingOn"
          :key="member.uid"
        >
          {{ member.name }}
        </li>
      </ul>
    </div>

    <div v-else>
      <h2 class="title">
        Results:
      </h2>
      <div class="content">
        <ul>
          <li
            v-for="member in members"
            :key="member.id"
          >
            {{ member.name }} ({{ member.score }})
          </li>
        </ul>
      </div>

      <div
        v-if="round.number < members.length * 2"
        class="field"
      >
        <router-link
          v-if="linkToNextRound"
          :to="linkToNextRound"
          class="button"
        >
          Next round
        </router-link>
      </div>

      <div
        v-else
        class="field"
      >
        <router-link
          class="button"
          :to="{name: 'Home'}"
        >
          Game over
        </router-link>
      </div>
    </div>
  </section>
</template>

<script>
import firebase from 'firebase/app';
import { auth, db } from '../../firebase';
import { getEmptyRound } from '../../utils/data';
import Loader from '../../components/Loader.vue';

export default {
  name: 'RoundResults',

  components: {
    Loader,
  },

  data() {
    return {
      members: [],
      round: getEmptyRound(),
      allRounds: [],
      linkToNextRound: null,
      waitingOn: [],
      pool: [],
      loading: false,
    };
  },

  firestore() {
    return {
      members: db
        .collection('rooms')
        .doc(this.$route.params.roomID)
        .collection('members'),

      round: db
        .collection('rooms')
        .doc(this.$route.params.roomID)
        .collection('rounds')
        .doc(this.$route.params.roundID),

      allRounds: db
        .collection('rooms')
        .doc(this.$route.params.roomID)
        .collection('rounds'),
    };
  },

  watch: {
    async round() {
      this.waitingOn = this.members.filter((member) => !this.round.voted.includes(member.uid) && this.round.storyTeller.uid !== member.uid);

      if (this.waitingOn.length === 0 && this.members.length > 0) {
        this.pool = [];

        const poolSnap = await db
          .collection('rooms')
          .doc(this.$route.params.roomID)
          .collection('rounds')
          .doc(this.$route.params.roundID)
          .collection('pool')
          .get();

        poolSnap.forEach((item) => {
          this.pool.push(item.data());
        });

        if (this.pool.length === 6 && this.round.results.length === 0 && auth.currentUser.uid === this.round.storyTeller.uid) {
          await this.calculateResults();
        }
      }
    },

    allRounds() {
      const nextRound = this.allRounds.find((round) => round.number === this.round.number + 1);

      if (nextRound) {
        this.linkToNextRound = {
          name: 'Round',
          params: {
            roomID: this.$route.params.roomID,
            roundID: nextRound.id,
          },
        };
      }
    },
  },

  methods: {
    async calculateResults() {
      if (this.pool.length === 0) {
        return false;
      }

      this.loading = true;

      const storyPoolItem = this.pool.find((item) => item.setBy === this.round.storyTeller.uid);

      if (storyPoolItem.chosenBy.length === 0 || storyPoolItem.chosenBy.length === this.members.length - 1) {
        // Everyone or no one voted for the right card
        for (const member of this.members) {
          if (member.id !== this.round.storyTeller.uid) {
            await db
              .collection('rooms')
              .doc(this.$route.params.roomID)
              .collection('members')
              .doc(member.id)
              .update({
                score: firebase.firestore.FieldValue.increment(2),
              });
          }
        }
      } else {
        for (const playerID of storyPoolItem.chosenBy) {
          await db
            .collection('rooms')
            .doc(this.$route.params.roomID)
            .collection('members')
            .doc(playerID)
            .update({
              score: firebase.firestore.FieldValue.increment(3),
            });
        }

        await db
          .collection('rooms')
          .doc(this.$route.params.roomID)
          .collection('members')
          .doc(this.round.storyTeller.uid)
          .update({
            score: firebase.firestore.FieldValue.increment(3),
          });
      }

      // Bonus points
      for (const poolItem of this.pool) {
        if (poolItem.setBy !== 'cloudFunction' && poolItem.setBy !== this.round.storyTeller.uid && poolItem.chosenBy.length > 0) {
          await db
            .collection('rooms')
            .doc(this.$route.params.roomID)
            .collection('members')
            .doc(poolItem.setBy)
            .update({
              score: firebase.firestore.FieldValue.increment(poolItem.chosenBy.length),
            });
        }
      }

      await this.writeResultsToRound();

      this.loading = false;
    },

    async writeResultsToRound() {
      await db
        .collection('rooms')
        .doc(this.$route.params.roomID)
        .collection('rounds')
        .doc(this.$route.params.roundID)
        .update({
          results: this.members,
        });
    },
  },
};
</script>
