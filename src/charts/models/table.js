/**
 * @description 表格模型
 */
import { raw } from '../raw';
import { METRIC, DIMENSION, PERCENTILE, TWO_DECIMAL, THOUSANDS, charts, style, formatStyle, formatNumber, SPLY, LP, renderRatio } from '../constants';

const { TABLE } = charts;

/**
 * columns: 
 * [
 *  {
 *    data: key,
 *    title:
 *    style: {}
 *  }
 * ]
 * data:
 * [
 *  [
 *    v, { value: v, style: {} }
 *  ]
 * ]
 */
raw.models.set(TABLE, () => {
  const model = raw.model();
  model.config({
    compare: [LP, SPLY]
  });

  // 字段 segment
  const dimension = model.dimension('segment')
    .types(METRIC, DIMENSION)
    .required(2)
    .multiple(true)
    .style(style(TABLE))
    .format(PERCENTILE, TWO_DECIMAL, THOUSANDS);

  model.map((d) => {
    const { value } = dimension;
    const metrics = value.filter(({ type }) => type === METRIC);
    const { data = [] } = d;
    const posMap = {}; // 映射原始值
    const renderMap = {}; // 映射同环比 render
    const columns = [];
    // 调整显示效果，如果有同环比，则和数据显示在一起
    // 正常数据配置必须在前列
    value.forEach((o) => {
      const { style: s, format = '', type, key, label = key, name, alias, $format, id, expTag } = o;
      const ratio = o[SPLY] || o[LP] || expTag;
      const isMetric = type === METRIC;
      const title = !ratio && alias || name || label;
      const newColumn = {
        ...o,
        data: key,
        title,
        render: (v) => {
          if (v == null) {
            return null;
          }
          const originValue = v;
          // 指标转数字 - 有可能填的类型不规范，指标不一定会是数字
          if (isMetric) {
            v = Number.isNaN(Number(v)) ? v : Number(v);
            v = $format ? $format.reduce((v, func) => func(v), v) : v;
          }
          const { color } = (s ? formatStyle(v, s) : {});
          const fv = format && format.length ? formatNumber(v, format) : v;
          // 是否已经计算百分比，如果勾选百分比，则认为已经是计算好的
          const isRatio = Array.isArray(format) ? format.indexOf(PERCENTILE) !== -1 : false;
          // toString => fix AntTable 内默认排序的问题
          return { style: { color }, value: fv, originValue, toString: () => originValue, isRatio };
        },
      };
      // 同比环比特殊处理
      if (ratio) {
        if (posMap[id] !== undefined) {
          renderMap[id] = renderMap[id] || [];
          renderMap[id].push({ title, data: key });
        } else {
          console.error(`${id} 数据列必须在同比、环比列之前`);
        }
      } else {
        posMap[id] = key;
        columns.push(newColumn);
      }
    });
    let newData = data;
    // 只有一个指标，归并
    if (metrics.length === 1) {
      newData = [];
      const metricIndex = value.indexOf(metrics[0]);
      const metricRowIndex = metrics[0].key;
      const MP = {};
      data.forEach((row) => {
        const dKey = dimension(row)
          .filter((v, index) => index !== metricIndex)
          .join('@_@');
        if (dKey in MP) {
          if (row[metricRowIndex] != null) {
            MP[dKey][metricRowIndex] = (Number(MP[dKey][metricRowIndex]) || 0) + (Number(row[metricRowIndex]) || 0);
          }
        } else {
          MP[dKey] = row;
          newData.push(row);
        }
      });
    }
    return {
      columns,
      data: newData.map((row) => {
        // 顺序不一定一致
        columns.forEach(({ data: pos, id, render }) => {
          const value = render(row[pos], row);
          if (renderMap[id] && value !== null) {
            row[pos] = [value].concat(renderMap[id].map((col) => {
              const baseValue = Number(typeof value === 'object' ? value.originValue : value);
              if (row[col.data] != null) {
                const o = renderRatio(Number(row[col.data]), baseValue, value && value.isRatio);
                return ({ ...col, ...o });
              }
            }));
            // f*ck 排序
            row[pos].toString = () => value.toString();
          } else {
            row[pos] = value;
          }
        });
        return row;
      })
    };
  });

  return model;
});
