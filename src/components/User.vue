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

export default {
  setup() {
    const user = ref(null);
    const unsubscribe = auth.onAuthStateChanged(
      () => {
        user.value = auth.currentUser;

        // console.log(firebaseUser.displayName);
      },
    );

    return {
      user,
      unsubscribe,
    };
  },

  destroyed() {
    this.unsubscribe();
  },
};
</script>
