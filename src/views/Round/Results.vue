<template>
  <section class="section">
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
      <pre>{{ pool }}</pre>
    </div>
  </section>
</template>

<script>
import { db } from '../../firebase';
import { getEmptyRound } from '../../utils/data';

export default {
  name: 'RoundResults',

  data() {
    return {
      members: [],
      round: getEmptyRound(),
      waitingOn: [],
      pool: [],
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
      }
    },
  },
};
</script>
