/**
 * @description graph
 */
import { raw } from '../raw';
import { charts } from '../constants';
import hooks from './hooks';

const { GRAPH } = charts;

// 数据 => 具体图表库抽象
const seryConfig = {
  type: 'graph',
  layout: 'circular',
  roam: true,
  edgeSymbol: ['arrow'],
  edgeSymbolSize: 8,
  focusNodeAdjacency: true,
  lineStyle: {
    normal: {
      curveness: 0.3
    }
  }
};
const linkConfig = {
  label: {
    formatter: function ({ name, value }) {
      return `${name}: ${value}`;
    }
  }
};
raw.chart(GRAPH)
  .draw((canvas, { series = [] }, config) => {
    if (canvas) {
      const option = {
        tooltip: {
          formatter: function ({ name, value, data }) {
            const { source, target } = data;
            // 处理双向
            return Array.isArray(value) && source && target
              ? `${source} > ${target}: ${value[0]}<br>${source} < ${target}: ${value[1]}`
              : `${name}: ${value}`;
          }
        },
        animationDurationUpdate: 1500,
        animationEasingUpdate: 'quinticInOut',
        ...config,
        series: series.map((sery) => {
          const { links, nodes } = sery;
          return {
            ...seryConfig,
            ...sery,
            nodes: nodes.map(node => ({
              label: {
                normal: {
                  fontSize: 14,
                  position: 'right',
                  show: true
                }
              },
              symbolSize: Math.max(Math.ceil((node.value / nodes[0].value) * 30), 8),
              ...node
            })),
            links: links.map(link => ({
              ...linkConfig,
              ...link
            }))
          };
        })
      };
      series.map((sery) => {
        const { categories } = sery;
        if (categories) {
          option.legend = [{
            data: categories.map(function (a) {
                return a.name;
            })
          }];
        }
      });
      // 最后输出前的钩子
      if (config.$lastFilter) {
        config.$lastFilter(option, config, canvas);
      }
      hooks.init(canvas, config).setOption(option, true);
    }
  });
