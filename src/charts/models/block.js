/**
 * @description 指标块模型
 */
import { raw } from '../raw';
import { PERCENTILE, TWO_DECIMAL, THOUSANDS, METRIC, charts, style, formatStyle, formatNumber, SPLY, LP, renderRatio } from '../constants';

const { METRIC_BLOCK } = charts;

raw.models.set(METRIC_BLOCK, () => {
  const model = raw.model();
  model.config({
    compare: [LP, SPLY]
  });

  // 定义一个指标块
  const Metric = model.dimension('metric')
    .types(METRIC)
    .items([
      { key: 'alias' }
    ])
    .format(PERCENTILE, TWO_DECIMAL, THOUSANDS)
    .style(style(METRIC_BLOCK))
    .accessor((v, metrics, index) => {
      metrics[index] = (metrics[index] || 0) + Number(v);
    })
    .required(1)
    .multiple(true);

  // 格式化数据
  model.map((obj, config) => {
    const { data = [] } = obj;
    const ms = [];
    const dimensions = Metric.value;
    data.forEach(d => Metric(d, ms));
    // 格式化
    const mp = {};
    const metrics = [];
    ms.forEach((v, index) => {
      // 转为数字
      const { $format } = dimensions[index];
      if (v != null) {
        v = Number(v);
        v = $format ? $format.reduce((v, func) => func(v), v) : v;
      }
      const dim = dimensions[index] || {};
      const { style: s, format = '', key, name, showName, alias, id } = dim;
      const title = name || showName || alias || key || id;
      const styleObject = formatStyle(v, s) || {};
      const fv = formatNumber(v, format);
      let metric = {
        title,
        originValue: v,
        value: fv,
        style: styleObject,
      };
      if (id !== undefined) {
        if (!(id in mp)) {
          mp[id] = metrics.length;
          metrics.push({
            title,
            values: []
          });
        } else {
          // 计算同比环比
          let currentValue = metrics[mp[id]].values[0];
          if (currentValue) {
            currentValue = currentValue.originValue;
            // 处理空值
            if (currentValue != null) {
              if (SPLY in dim || LP in dim) {
                metric = {
                  ...metric,
                  ...renderRatio(v, currentValue)
                };
              }
            }
          }
        }
        metrics[mp[id]].values.push(metric);
      } else {
        metrics.push({
          title,
          values: [metric],
        });
      }
    });
    return {
      ...config,
      metrics,
    };
  });
  return model;
});
