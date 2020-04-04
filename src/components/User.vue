<template>
  <div>
    <slot
      name="user"
      :user="storeUser"
    />
  </div>
</template>

<script>
import { ref, computed } from '@vue/composition-api';
import { auth } from '../firebase';

export default {
  setup(props, context) {
    const user = ref(null);

    const unsubscribe = auth.onAuthStateChanged(
      (firebaseuser) => {
        user.value = firebaseuser;

        if (!firebaseuser) {
          context.root.$store.commit('user/setUser', null);

          return;
        }

        const storeUser = {
          ...firebaseuser,
          displayName: firebaseuser.displayName ? firebaseuser.displayName : '',
        };

        context.root.$store.commit('user/setUser', storeUser);
      },
    );

    const storeUser = computed(() => context.root.$store.state.user.firebaseUser);

    return {
      user,
      unsubscribe,
      storeUser,
    };
  },

  destroyed() {
    this.unsubscribe();
  },
};
</script>
