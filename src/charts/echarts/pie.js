/**
 * @description 饼图模型
 */
import { raw } from '../raw';
import { charts } from '../constants';
import hooks from './hooks';

const { PIE } = charts;

// 数据 => 具体图表库抽象
raw.chart(PIE)
  .draw((canvas, { series }, config) => {
    if (canvas) {
      const option = {
        tooltip: {
          confine: true,
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
          type: 'scroll',
          data: series.reduce((arr, { data }) => {
            arr.push(...data.map(({ name }) => name));
            return arr;
          }, [])
        },
        ...config,
        series: series.map(o => ({
          name: '',
          type: PIE.toLowerCase(),
          ...o
        }))
      };
      // 最后输出前的钩子
      if (config.$lastFilter) {
        config.$lastFilter(option, config);
      }
      hooks.init(canvas).setOption(option);
    }
  });
