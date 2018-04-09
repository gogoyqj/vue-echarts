/**
 * @description 饼图模型
 */
import { raw } from '../raw';
import { METRIC, DIMENSION, charts } from '../constants';

const { PIE } = charts;

// 数据层抽象
raw.models.set(PIE, (config = {}) => {
  const model = raw.model();
  model.config({
    top: {
      label: 'show top',
      input: 'number',
      style: { width: 80 },
      config: {
        extra: '个扇形图'
      }
    },
    radius: {
      label: 'type',
      options: ['ring']
    }
  });

  // 饼图: 可配置一个维度，一个指标，如选择按照维度画图，则以配置的维度为绘制维度，以配置的唯一指标确定饼图 arc 大小
  // 指定两个维度， 一个指标
  const dimension = model
    .dimension('dimension')
    .types(DIMENSION)
    .required([0, 2])
    .multiple(true);

  // 饼图: 可以配置多个指标，则绘制 arc = Mn/(M1 + ... + MN) * Math.PI * 2 的饼图
  const arc = model
    .dimension('arc')
    .types(METRIC)
    .accessor((v, series, index) => {
      if (series === undefined) {
        return v;
      }
      if (v != undefined) {
        series[index].value += Number(v);
      }
    })
    .required(1)
    .multiple(true);

  /**
   * Input array:
   * Device Platform Page1 Page2 Page3
   * iPhone iOS      100   98    90
   * SamSum Android  500   298   20
   * Huawei Android  600   298   40
   * Output:
   *   Device: Page1:
   *   iPhone: 100
   *   SamSum: 500
   *   Huawei: 600
   * or:
   *    Page1: xxx
   *    Page2: xxx
   *    Page3: xxx
   */
  model.map((obj, config) => {
    const { data = [] } = obj;
    const drawByDimension = dimension.value;
    const dLen = drawByDimension.length;
    const arcs = arc.value;
    const ring = dLen === 1 && config.radius && config.radius[0]; // 显示成环形，仅当配置一个维度时生效，两个维度必然环形
    const newSeries = [];
    const max = Math.max(...((config && config.top) || []));
    // 按照维度绘制
    if (dLen) {
      const maps = [];
      data.forEach((d) => {
        const keys = dimension(d);
        const values = arc(d);
        if (values && values[0] != null) {
          const cnt = Number(arc(d)[0]);
          if (!Number.isNaN(cnt)) {
            keys.forEach((dimensionKey, index) => {
              maps[index] = maps[index] || {};
              maps[index][`${dimensionKey}`] = (maps[index][dimensionKey] || 0) + cnt;
            });
          }
        }
      });
      maps.forEach((mp, index) => {
        const newData = [];
        Object.keys(mp).forEach(name => newData.push({
          name: `${name}${arcs[0] && arcs[0].name ? `-${arcs[0] && arcs[0].name}` : ''}`,
          value: mp[name],
        }));
        if (max > 0 && max !== Infinity) {
          newData.sort(({ value: a }, { value: b }) => b - a);
          const last = newData[max];
          if (last) {
            const other = {
              name: 'Other',
              value: 0
            };
            newData
              .splice(max, newData.length, other)
              .forEach(({ value }) => {
                if (value != null) {
                  other.value += Number(value) || 0;
                }
              });
          }
        }
        newSeries.push({
          radius: index || ring ? ['50%', '70%'] : [0, '40%'],
          data: newData,
        });
      });
    } else {
      const newData = [];
      arcs.forEach(({ name }) => newData.push({
        name,
        value: 0
      }));
      data.forEach(d => arc(d, newData));
      newSeries.push({
        data: newData,
      });
    }
    return {
      series: newSeries,
    };
  });

  return model;
});
