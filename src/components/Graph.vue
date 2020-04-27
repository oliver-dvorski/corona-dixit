<template>
  <div class="graph-container">
    <canvas
      ref="canvas"
      width="600"
      height="400"
    />
  </div>
</template>

<script>
import Chart from 'chart.js';

export default {
  props: {
    height: {
      type: String,
      default: '12rem',
    },

    type: {
      type: String,
      default: 'line',
    },

    labels: {
      type: Array,
      required: true,
    },

    datasets: {
      type: Array,
      required: true,
    },

    color: {
      type: String,
      default: 'rgba(0,194,209,0.5)',
    },

    options: {
      type: Object,
      default() {
        return {
          maintainAspectRatio: false,
          legend: {
            display: false,
          },
          scales: {
            xAxes: [{
              ticks: {
                beginAtZero: true,
              },
              stacked: true,
            }],
            yAxes: [{ stacked: true }],
          },
        };
      },
    },
  },

  data() {
    return {
      chart: {},
    };
  },

  watch: {
    values() {
      this.updateChart();
    },
    labels() {
      this.updateChart();
    },
  },

  mounted() {
    this.$el.style.height = this.height;

    this.chart = new Chart(
      this.$refs.canvas,
      {
        type: this.type,
        data: {
          labels: this.labels,
          datasets: this.datasets,
        },
        options: this.options,
      },
    );
  },

  methods: {
    updateChart() {
      this.chart.data = {
        labels: this.labels,
        datasets: this.datasets,
      };
      this.chart.update();
      this.$el.style.height = this.height;
    },
  },
};
</script>

<style>
  .graph-container {
    position: relative;
    margin: auto;
    width: 100%;
  }
</style>
