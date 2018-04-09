/**
 * @description 绘制地图
 */
import { raw } from '../raw';
import { charts } from '../constants';
import hooks from './hooks';

const { MAP } = charts;

// 数据 => 具体图表库抽象
raw.chart(MAP)
  .draw((canvas, { series = [] }, config) => {
    let max = 1;
    let min = 0;
    if (canvas) {
      const option = {
        tooltip: {
          confine: true
        },
        legend: {
          orient: 'vertical',
          x: 'left',
          data: series.map(({ name, data }) => {
            data.forEach(({ value }) => {
              value = Number(value);
              max = Math.max(value, max);
              min = min ? Math.min(value, min) : value; 
            });
            return name;
          })
        },
        dataRange: {
          min: min === max ? 0 : min,
          max,
          show: !config.hideDataRange,
          x: 'right',
          y: 'bottom',
          text: [ '高', '低' ],
          calculable: true
        },
        roamController: {
          show: true,
          x: 'right',
          mapTypeControl: {
            'china': true
          }
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
