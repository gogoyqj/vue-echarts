/**
 * @description 条形图图模型
 */
import { raw } from '../raw';
import { charts } from '../constants';

require('./line');

const { BAR, LINE } = charts;
raw.models.set(BAR, (config) => {
  const lineModel = raw.models.get(LINE);
  const model = lineModel(config);
  const lineMap = model.map();
  model.config({
    style: ['stack', 'horizontal', 'hideXY']
  });
  model.map(data => lineMap.call(this, data));
  return model;
});
