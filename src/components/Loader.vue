<template>
  <div
    v-if="loading"
    class="overlay"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="48"
      height="48"
      viewBox="0 0 48 48"
    ><g
      class="nc-icon-wrapper"
      stroke-linecap="square"
      stroke-linejoin="miter"
      stroke-width="4"
      fill="#ffffff"
      stroke="#ffffff"
    ><path
      fill="none"
      stroke="#ffffff"
      stroke-miterlimit="10"
      d="M3.919,33C2.686,30.253,2,27.207,2,24 C2,11.85,11.85,2,24,2s22,9.85,22,22"
      data-cap="butt"
      stroke-linecap="butt"
    /> </g></svg>
  </div>
</template>

<script>
export default {
  name: 'Loader',

  props: {
    loading: {
      type: Boolean,
      default: true,
    },
  },
};
</script>

<style scoped lang="scss">
  .overlay {
    position: fixed;
    background: rgba(0, 0, 0, .35);
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
    z-index: 99999999;
    display: flex;
    align-items: center;
    justify-content: center;

    svg {
      position: relative;
      animation: spin 0.75s linear infinite;
    }
  }

  @keyframes spin {
    from {
      transform: rotate(0);
    }

    to {
      transform: rotate(360deg);
    }
  }
</style>
