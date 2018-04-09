/**
 * @description graph
 */
import { raw } from '../raw';
import { charts } from '../constants';
import hooks from './hooks';

const { SANKEY } = charts;

// 数据 => 具体图表库抽象
const seryConfig = {
  type: 'sankey',
  layout: 'none',
  itemStyle: {
      normal: {
          borderWidth: 1,
          borderColor: '#aaa'
      }
  },
  lineStyle: {
      normal: {
          color: 'source',
          curveness: 0.5
      }
  }
};
raw.chart(SANKEY)
  .draw((canvas, { series = [] }, config) => {
    if (canvas) {
      const option = {
        tooltip: {
          tooltip: {
              trigger: 'item',
              triggerOn: 'mousemove'
          }
        },
        animationDurationUpdate: 1500,
        animationEasingUpdate: 'quinticInOut',
        ...config,
        series: series.map(sery => ({
          ...seryConfig,
          ...sery
        }))
      };
      // 最后输出前的钩子
      if (config.$lastFilter) {
        config.$lastFilter(option, config, canvas);
      }
      hooks.init(canvas, config).setOption(option, true);
    }
  });
