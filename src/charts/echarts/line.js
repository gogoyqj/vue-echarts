/**
 * @description 折线图模型
 */
import { raw } from '../raw';
import { charts } from '../constants';
import hooks from './hooks';

const { LINE, BAR } = charts;
const emptyArr = [];

const getRatio = (cur, series) => {
  const { dataIndex, seriesIndex, value } = cur;
  const { stack } = series[seriesIndex];
  if (!stack) {
    return '';
  }
  let total = 0;
  series.forEach((sery) => {
    const { value: val, stack: stk } = sery;
    if (stk === stack) {
      total += Number(val[dataIndex]) || 0;
    }
  });
  return ` ${(Number(value) * 100 / (total || 1)).toFixed(2)}%`;
};

const formatter = (v) => {
  let p = Number((v / 100000000).toFixed(2));
  let unit = '亿';
  if (p < 1) {
    // parseInt() cannot parse small number (less than 1x10^-6) and very big number (larger than 1x10^21) correctly
    p = Math.floor(v / 10000, 10);
    unit = '万';
    // 小于 1 w 不聚合
    if (p < 2) {
      p = v;
      unit = '';
    }
  }
  return `${p}${unit}`;
};

const DRAW = (canvas, { xAxis, yAxis, series, hideXY = false, percent }, config = {}, ModelName = LINE) => {
  let { name, max = emptyArr, min = emptyArr } = config;
  max = max[0];
  min = min[0];
  const yAxisConfig = {};
  if (max !== 'dataMax') {
    if (max != null) {
      max = Number(max);
      if (Number.isFinite(max)) {
        yAxisConfig.max = max;
      }
    }
  } else {
    yAxisConfig.max = max;
  }
  if (min !== 'dataMin') {
    if (min != null) {
      min = Number(min);
      if (Number.isFinite(min)) {
        yAxisConfig.min = min;
      }
    }
  } else {
    yAxisConfig.min = min;
  }
  const xy = {
    xAxis: yAxis.map(({ gridIndex }) => (
      {
        gridIndex,
        type: 'category',
        show: !hideXY,
        boundaryGap: [10, 10],
        data: xAxis
      })),
    yAxis: yAxis.map(y => ({
      ...y,
      show: !hideXY,
      type: 'value',
      splitLine: {
        lineStyle: {
          color: ['#eee']
        }
      },
      ...yAxisConfig,
      axisLabel: percent ? {
        show: true,
        interval: 'auto',
        formatter: v => `${formatter(v)}%`
      } : {
        formatter
      }
    }))
  };
  const style = (config && config.style) || [];
  const horizontal = style.indexOf('horizontal') !== -1;
  if (horizontal) { // 水平
    const x = xy.xAxis;
    xy.xAxis = xy.yAxis;
    xy.yAxis = x;
  }
  if (canvas) {
    const len = yAxis.length;
    const dur = 100 / (len || 1);
    const pMap = {};
    const option = {
      title: {
        text: name
      },
      legend: {
        type: 'scroll',
        left: 'auto',
        right: 'auto',
        data: series.map(({ name: category }) => category)
      },
      grid: yAxis.map((o, index) => {
        const g = {
          left: '0%',
          right: '0%',
          bottom: `${(len - index - 1) * dur}%`,
          containLabel: true
        };
        if (index) {
          g.top = `${index * dur}%`;
        }
        return g;
      }),
      tooltip: {
        confine: true,
        trigger: 'item',
        formatter: (params) => {
          if (!Array.isArray(params)) {
            params = [params];
          }
          const arr = [];
          params.forEach((param, index) => {
            const { seriesName, value } = param;
            if (value !== undefined) {
              arr.push(`${seriesName}：${value}${index in pMap ? '%' : ''}${getRatio(param, series)}`);
            }
          });
          return arr.join('<br/>');
        },
        axisPointer: {
          type: 'cross',
          show: false,
          label: {
            backgroundColor: '#6a7985'
          }
        }
      },
      ...config,
      ...xy,
      series: series.map((item, index) => {
        const { name: seriesName, value, area, stack, $$config = {}, yAxisIndex } = item;
        if ($$config.percent) {
          pMap[index] = '';
        }
        const s = {
          stack,
          xAxisIndex: yAxisIndex,
          yAxisIndex,
          name: seriesName,
          data: value,
          smooth: true,
          type: ModelName.toLowerCase(),
          barMaxWidth: 60
        };
        if (area) {
          s.areaStyle = { normal: {} }; // 面积
        }
        return s;
      })
    };
    // 最后输出前的钩子
    if (config.$lastFilter) {
      // config.$lastFilter(option, config);
    }
    // rerener each time
    hooks.init(canvas).setOption(option, true);
  }
};

raw
  .chart(LINE)
  .draw(DRAW);

raw
  .chart(BAR)
  .draw((canvas, data, config) => DRAW(canvas, data, config, BAR));
