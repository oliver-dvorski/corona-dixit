<template>
  <div>
    <slot
      name="user"
      :user="user"
    />
  </div>
</template>

<script>
import { ref } from '@vue/composition-api';
import { auth } from '../firebase';
// import EventBus from '../EventBus';

export default {
  setup() {
    const user = ref(null);
    const unsubscribe = auth.onAuthStateChanged(
      // @eslint-ignore
      (firebaseUser) => user.value = firebaseUser,
    );

    return {
      user,
      unsubscribe,
    };
  },

  mounted() {
    // EventBus.$on('userDisplayName', (name) => {
    //   console.log('setting', name);
    //
    //   this.displayName = name;
    // });
  },

  destroyed() {
    this.unsubscribe();

    // EventBus.$off('userDisplayName');
  },
};
</script>
