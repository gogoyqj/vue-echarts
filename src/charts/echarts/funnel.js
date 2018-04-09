/**
 * @description 绘制漏斗
 */
import { raw } from '../raw';
import { charts } from '../constants';
import hooks from './hooks';

const { FUNNEL } = charts;

// 数据 => 具体图表库抽象
raw.chart(FUNNEL)
  .draw((canvas, { series = [] }, config) => {
    let max = 1;
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
              max = Math.max(value, max);
            });
            return name;
          })
        },
        ...config,
        series: series.map((sery, index) => {
          let { funnelAlign, sort } = config;
          if (Array.isArray(funnelAlign)) {
            funnelAlign = funnelAlign[0];
          }
          if (Array.isArray(sort)) {
            sort = sort[0];
            if (sort) {
              sort = `${sort.replace(/ing$/g, '')}ing`;
            }
          }
          return {
            type: 'funnel',
            max,
            funnelAlign: funnelAlign || 'center',
            // sort
            label: {
                normal: {
                  show: true,
                  position: series.length > 1 && index ? 'inside' : '',
                },
                emphasis: {
                    textStyle: {
                      position: 'inside',
                    }
                }
            },
            itemStyle: {
              normal: {
                opacity: 0.5,
                borderColor: '#fff',
                borderWidth: 2
              }
            },
            ...sery
          };
        })
      };
      // 最后输出前的钩子
      if (config.$lastFilter) {
        config.$lastFilter(option, config);
      }
      hooks.init(canvas).setOption(option);
    }
  });
