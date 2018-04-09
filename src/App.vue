<template>
  <div id="app">
    <Chart className="nima" :config="configLINE" :dataSource="dataSource" />
    <Chart :config="configLINEBAR" :dataSource="dataSource" />
    <Chart :config="configLINEAREA" :dataSource="dataSource" />
    <Chart :config="configPIE" :dataSource="dataSource" />
    <Chart :config="configBLOCK" :dataSource="dataSource" />
  </div>
</template>

<script>
import Chart from './charts/index.vue';

const configLINE = {
  chart: "LINE",
  dimension: {
    XAxis: [
      {
        id: "23",
        name: "date"
      }
    ],
    YAxis: [
      {
        id: "18",
        name: "pv"
      },
      {
        id: "19",
        name: "uv"
      }
    ]
  }
};
const configLINEBAR = { ...configLINE, chart: 'BAR' };
const configLINEAREA = {...configLINE, height: 200, style: ['area'] };
const configPIE = {
  chart: "PIE",
  dimension: {
    dimension: [
      {
        id: "23",
        name: "platform"
      }
    ],
    arc: [
      {
        id: "19",
        name: "uv"
      }
    ]
  }
};
const configBLOCK = {
  chart: "METRIC BLOCK",
  dimension: {
    metric: [
        {
          id: "19",
          name: "pv"
        },
        {
          id: "20",
          name: "uv"
        }
    ]
  }
};
const dataSource = [
  ["pv", "uv", "platform", "date"],
  [7036, 422, "iOS", "2017-08-01"],
  [1032, 54, "Android", "2017-08-01"],
  [7489, 533, "iOS", "2017-08-02"],
  [2621, 547, "Android", "2017-08-02"],
  [8434, 143, "iOS", "2017-08-03"],
  [1043, 69, "Android", "2017-08-03"],
  [6725, 604, "iOS", "2017-08-04"],
  [3216, 141, "Android", "2017-08-04"],
  [7516, 761, "iOS", "2017-08-05"],
  [6067, 216, "Android", "2017-08-05"],
  [7358, 61, "iOS", "2017-08-06"],
  [3511, 569, "Android", "2017-08-06"],
  [7587, 479, "iOS", "2017-08-07"],
  [2935, 616, "Android", "2017-08-07"],
  [1344, 142, "iOS", "2017-08-08"],
  [7054, 420, "Android", "2017-08-08"],
  [4469, 931, "iOS", "2017-08-09"],
  [4196, 999, "Android", "2017-08-09"]
];
export default {
  name: 'app',
  data: () => ({
    configLINE,
    configLINEBAR,
    configLINEAREA,
    configBLOCK,
    configPIE,
    dataSource
  }),
  components: {
    Chart: Chart.Chart
  }
}
</script>

<style>
#app {
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
* {
    padding: 0;
    margin: 0;
}

.cube-canvas {
    min-height: 300px;
}

.row {
    width: 400px;
    margin: 0 auto;
}
.row .pricing-box {
    float: left;
    text-align: center;
    float: left;
    width: 195px;
    margin-right: 2px;
    border: 1px solid #efefef;
    border-radius: 10px;
    overflow: hidden;    
}
.row .pricing-box h5 {
    background: lightblue;
    font-size: 20px;
    line-height: 30px;
    color: #fff;
}
.row .pricing-box.widget-main {
    padding: 10px 0;
}

</style>
