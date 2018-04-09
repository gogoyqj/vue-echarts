<template>
  <div>
    <div v-bind:class="cls" v-bind:style="style" ref="canvas" v-if="cube">
      <Cube :cube="cube" />
    </div>
    <div v-bind:class="cls" v-bind:style="style" ref="canvas" v-if="!cube">
      {{children}}
    </div>
  </div>
</template>

<script>
import Vue from 'vue';
import { raw } from './models/';

export default {
  name: "Chart",
  components: {
    Cube: () => Promise.resolve({
      render: function(createElement) {
        const { $attrs: { cube } } = this;
        return cube(createElement);
      }
    })
  },
  props: {
    className: String,
    config: Object,
    dataSource: Array
  },
  data: function() {
    const { className = "" } = this;
    const config = this.config || {};
    const { chart = '', height, minHeight } = config;
    const cls =`cube-canvas cube-${chart.toLowerCase().replace(' ', '-')} ${className}`;
    const style = { height, minHeight };
    const newData = JSON.parse(JSON.stringify(this.dataSource));
    const definedChart = this.definedChart = raw.charts.get(chart);
    let cnf = config;
    if (location.search.match(/mail=true/)) {
      cnf = {
        ...cnf,
        animation: false, // 关闭动画
      };
    }
    let draw;
    let cube;
    let children = '';
    if (definedChart) {
      const { category } = definedChart;
      if (category() === 'JSX') {
        cube = (createElement) => definedChart(createElement, newData, cnf);
      } else {
        draw = (canvas) => {
          definedChart(canvas, newData, cnf);
        };
      }
    } else {
      children = `${chart} not support`;
    }
    return {
      cls,
      draw,
      style,
      cube,
      children
    };
  },
  mounted: function() {
    if (this.draw) {
      this.draw(this.$refs.canvas);
    }
  }
};
</script>

<style>

</style>
