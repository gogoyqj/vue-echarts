/**
 * @description 条形图图模型
 */
import { raw } from '../raw';
import { charts, DIMENSION, METRIC } from '../constants';

require('./line');

const { CLOUD } = charts;
raw.models.set(CLOUD, (config = {}) => {
  const model = raw.model();

  const word = model
    .dimension('word')
    .types(DIMENSION)
    .required(1);

  const count = model
    .dimension('count')
    .types(METRIC)
    .required(1);

  model.map((obj) => {
    const { data = [] } = obj;
    const mp = {};
    const series = [];
    data.forEach((d) => {
      const key = word(d);
      const val = count(d);
      const { showName: title } = count.value[0];
      const cnt = Array.isArray(val) ? val[0] : val;
      // 处理空值
      if (cnt != null) {
        let target = mp[key];
        if (!target) {
          target = mp[key] = { value: key, count: 0, title };
          series.push(target);
        }
        target.count += cnt;
      }
    });
    return {
      series,
    };
  });

  return model;
});

