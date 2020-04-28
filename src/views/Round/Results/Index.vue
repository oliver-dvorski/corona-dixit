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
      <by-card :pool="pool" />
      <graph
        :labels="graphLabels"
        dataset-label="Results"
        :datasets="graphValues"
        type="horizontalBar"
        :height="`${members.length * 4}rem`"
      />
      <div class="content">
        <ul>
          <li
            v-for="member in members"
            :key="member.id"
            :class="{ 'has-text-primary' : member.id === auth.currentUser.uid }"
          >
            {{ member.name }} ({{ member.score }}) <span class="tag">+{{ member.newPoints }}</span>
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
import { auth, db } from '../../../firebase';
import { getEmptyRound } from '../../../utils/data';
import Loader from '../../../components/Loader.vue';
import Graph from '../../../components/Graph.vue';
import ByCard from './ByCard.vue';

export default {
  name: 'RoundResults',

  components: {
    Loader,
    Graph,
    ByCard,
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
      auth,
    };
  },

  firestore() {
    return {
      members: db
        .collection('rooms')
        .doc(this.$route.params.roomID)
        .collection('members')
        .orderBy('score', 'desc'),

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

  computed: {
    graphLabels() {
      return this.members ? this.members.map((member) => member.name) : [];
    },

    graphValues() {
      if (!this.members) {
        return [];
      }

      const scoreDataset = {
        label: 'Score from previous round',
        backgroundColor: 'rgba(20,109,255,0.64)',
        data: [],
      };

      const newPointsDataset = {
        label: 'New points',
        backgroundColor: 'rgba(255,97,0,0.74)',
        data: [],
      };

      this.members.forEach((member) => {
        scoreDataset.data.push(member.score - member.newPoints);
        newPointsDataset.data.push(member.newPoints);
      });

      return [scoreDataset, newPointsDataset];
    },
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
};
</script>
