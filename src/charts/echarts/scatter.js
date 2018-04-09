/**
 * @description 散点图模型
 */
import { raw } from '../raw';
import { charts, formatNumber } from '../constants';
import hooks from './hooks';

const { SCATTER } = charts;

const DRAW = (canvas, opts, config = {}) => {
  const { name, dimension } = config;

  if (canvas) {
    const formatter = (config, axis) => {
      const format = config.dimension[`${axis.toUpperCase()}Axis`][0]
        ? config.dimension[`${axis.toUpperCase()}Axis`][0].format
        : [];
      return value => formatNumber(value, format);
    };
    
    const option = {
      ...opts,
      title: {
        text: name
      },
      xAxis: {
        scale: true,
        axisLabel: {
          formatter: formatter(config, 'x')
        },
        name: dimension.XAxis[0] && dimension.XAxis[0].name
      },
      yAxis: {
        scale: true,
        axisLabel: {
          formatter: formatter(config, 'y')
        },
        name: dimension.YAxis[0].name
      }
    };

    opts.series.forEach((s) => {
      s.label.emphasis.formatter = (param) => {
        const [x, y, ...dimensions] = param.data;
        return `${option.xAxis.name || 'x'}: ${formatter(config, 'x')(x)}
        \n${option.yAxis.name || 'y'}: ${formatter(config, 'y')(y)}
        \n维度: ${dimensions.toString()}
        `;
      };
    });

    // rerener each time
    hooks.init(canvas, config).setOption(option, true);
  }
};

raw
  .chart(SCATTER)
  .draw(DRAW);