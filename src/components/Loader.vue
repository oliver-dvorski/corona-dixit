<template>
  <div
    v-if="loading"
    class="overlay"
  >
    <svg
      class="circular"
      viewBox="25 25 50 50"
    >
      <circle
        class="path"
        cx="50"
        cy="50"
        r="20"
        fill="none"
        stroke-width="4"
        stroke-miterlimit="10"
      />
    </svg>
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
    background: rgba(0, 0, 0, .45);
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
    z-index: 99999999;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .circular {
    animation: rotate 2s linear infinite;
    height: 65px;
    transform-origin: center center;
    width: 65px;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    margin: auto;
  }

    .path {
      stroke-dasharray: 1, 200;
      stroke-dashoffset: 0;
      animation: dash 1.5s ease-in-out infinite;
      stroke: white;
    }

    @keyframes rotate {
      100% {
        transform: rotate(360deg);
      }
    }

  @keyframes dash {
    0% {
      stroke-dasharray: 1, 200;
      stroke-dashoffset: 0;
    }
    50% {
      stroke-dasharray: 89, 200;
      stroke-dashoffset: -35px;
    }
    100% {
      stroke-dasharray: 89, 200;
      stroke-dashoffset: -124px;
    }
  }
</style>
