/**
 * @description 雷达图模型
 */
import { raw } from '../raw';
import { METRIC, DIMENSION, charts, TWO_DECIMAL } from '../constants';

const { MAP } = charts;

// 数据层抽象
raw.models.set(MAP, (config = {}) => {
  const model = raw.model();
  model.config({
    cnf: ['china', 'world'],
    // style: ['label'],
  });

  const Dimension = model
    .dimension('dimension')
    .types(DIMENSION)
    .required(1);

  const Metric = model
    .dimension('metric')
    .types(METRIC)
    .format(TWO_DECIMAL)
    .required(1);

  model.map((obj, config) => {
    const { data = [], meta = [] } = obj;
    const series = [];
    const keyMap = {};
    const mapType = (config.cnf || []).indexOf('world') >= 0 ? 'world' : 'china';
    data.forEach((row) => {
      const area = Dimension(row);
      const values = Metric(row);
      const name = area && area.join ? area.join('-') : area;
      // 多个维度
      (Array.isArray(values) ? values : [values]).forEach((value, index) => {
        if (value != null) {
          if (!(index in keyMap)) {
            keyMap[index] = {};
            series.push({
              name: Metric.value[index].name,
              mapType,
              type: 'map',
              data: [],
            });
          }
          const { $format } = Metric.value[index];
          const sery = series[index];
          const map = keyMap[index];
          if (!(name in map)) {
            map[name] = sery.data.length;
            sery.data.push({
              dataType: Metric.value[index].name,
              type: Metric.value[index].name,
              name,
              value: 0
            });
          }
          const val = Number(value);
          sery.data[map[name]].value += $format ? $format.reduce((v, func) => func(v), val) : val;
        }
      });
    }); 
    Metric.value.forEach((m, index) => {
      const { format = [] } = m;
      if (format.indexOf(TWO_DECIMAL) !== -1) {
        series[index].data = series[index].data.map(row => ({
          ...row,
          value: Number(Number(row.value).toFixed(2))
        }));
      }
    });
    return { series };
  });
  return model;
});