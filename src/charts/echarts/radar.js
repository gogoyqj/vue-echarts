/**
 * @description 绘制雷达图
 */
import { raw } from '../raw';
import { charts } from '../constants';
import hooks from './hooks';

const { RADAR } = charts;

// 数据 => 具体图表库抽象
raw.chart(RADAR)
  .draw((canvas, { radar = {}, series = [] }, config) => {
    if (canvas) {
      const legendData = [];
      series.forEach(({ data }) => {
        data.forEach(({ name }) => {
          legendData.push(name);
        });
      });
      const option = {
        tooltip: {
          confine: true,
          formatter: (params) => {
            const { seriesIndex, data, value } = params;
            const sery = series[seriesIndex] || {};
            const { percentMap = {} } = sery.$$config || {};
            return (data && data.name ? [data.name] : [])
              .concat(value.map((v, index) => `${radar.indicator[index].name}：${v}${index in percentMap ? '%' : ''}`))
              .join('<br/>');
          }
        },
        legend: {
          data: legendData
        },
        radar: {
          ...radar
        },
        ...config,
        series
      };
      // 最后输出前的钩子
      if (config.$lastFilter) {
        config.$lastFilter(option, config);
      }
      hooks.init(canvas).setOption(option);
    }
  });
