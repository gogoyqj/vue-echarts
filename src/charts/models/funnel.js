/**
 * @description 漏斗图模型
 */
import { raw } from '../raw';
import { METRIC, DIMENSION, charts, TWO_DECIMAL } from '../constants';

const { FUNNEL } = charts;

// 数据层抽象
raw.models.set(FUNNEL, (config = {}) => {
  const model = raw.model();
  model.config({
    funnelAlign: {
      label: 'align',
      options: ['left', 'right', 'center'],
    },
    sort: {
      label: 'sort', options: ['ascend', 'descend']
    },
  });

  // 只有指标
  const Metric = model
    .dimension('metric')
    .types(METRIC)
    .format(TWO_DECIMAL)
    .required(1)
    .multiple(true);

  model.map((obj, config) => {
    const { data = [], meta = [] } = obj;
    const funnelData = [];
    const series = [
      {
        data: funnelData,
      }
    ];
    data.forEach((row) => {
      const values = Metric(row);
      if (Array.isArray(values)) {
        values.forEach((v, index) => {
          // 处理空值
          if (v != null) {
            if (!funnelData[index]) {
              funnelData[index] = {
                name: config.dimension.metric[index].name,
                value: 0,
              };
            }
            funnelData[index].value += Number(v) || 0;
          }
        });
      }
    }); 
    let compaireWith;
    Metric.value.forEach((m, index) => {
      const { format = [] } = m;
      // 期待
      if (m.expectation !== undefined) {
        const expectation = String(m.expectation).trim().replace(/,/g, '');
        if (expectation) {
          if (!compaireWith) {
            compaireWith = {
              name: '预期',
              data: []
            };
            series.unshift(compaireWith);
          }
          compaireWith.data[index] = {
            name: `${funnelData[index].name}预期`,
            value: expectation
          }; 
        }
      }
      const val = funnelData[index].value;
      if (format.indexOf(TWO_DECIMAL) !== -1 && val != null) {
        funnelData[index].value = Number(Number(val).toFixed(2));
      }
    });
    return { series };
  });
  return model;
});