<template>
  <div class="metric-list">
    <div class="metric-group" v-for="(metric, index) in metrics" :key="index" >
      <div class="metric-group-item clearfix">
        <div :class="'m-h'+index">
          <span :style="metric.style">
            <span class="metric-block">{{metric.title}}：</span>{{metric.value}}
          </span>
        </div>
        <span className="pull-right">
          <span v-for="l in metric.left" :key="l.title" class="metric-block-ratio" :style="l.style">
            <span>{{l.title}}：</span>{{l.value}}
          </span>
        </span>
      </div>
    </div>
  </div>
</template>


<script>
import { raw } from '../raw';
import { JSX, charts } from '../constants';
const MetricBlock = {
  name: "MetricBlock",
  props: {
    config: Object,
    metrics: Array
  }
}
raw
  .chart(charts.METRIC_BLOCK)
  .category(JSX)
  .draw((createElement, data, config) => {
    if (Array.isArray(data.metrics)) {
      data.metrics = data.metrics.map((metric) => {
        const { title, values } = metric;
        const current = values[0];
        const left = values.slice(1);
        const { title: t, value, style } = current;
        return {
          ...metric,
          style,
          value,
          left
        };
      })
    }
    return createElement(MetricBlock, {
      props: data
    });
  });
export default MetricBlock;
</script>
<style>
  .m-h0 {
    font-size: 16px;
    font-weight: 500;
    color: rgba(0, 0, 0, 0.65);
  }
  .m-h1, .m-h2 {
    font-size: 14px;
    font-weight: 500;
    color: rgba(0, 0, 0, 0.65);
  }
</style>

