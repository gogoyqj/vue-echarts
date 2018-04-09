/**
 * @description 雷达图模型
 */
import { raw } from '../raw';
import { METRIC, DIMENSION, charts, TWO_DECIMAL, PERCENTILE } from '../constants';

const { RADAR } = charts;

// 数据层抽象
raw.models.set(RADAR, (config = {}) => {
  const model = raw.model();
  model.config({
    top: {
      label: 'show top',
      input: 'number',
      style: { width: 80 },
      config: {
        extra: '个区块'
      }
    }
  });

  // 饼图: 可配置一个维度，一个指标，如选择按照维度画图，则以配置的维度为绘制维度，以配置的唯一指标确定饼图 arc 大小
  // 指定两个维度， 一个指标
  const Dimension = model
    .dimension('dimension')
    .types(DIMENSION)
    .required([0, 1])
    .multiple(true);

  // 可定义多个指标
  const Metric = model
    .dimension('metric')
    .types(METRIC)
    .format(TWO_DECIMAL, PERCENTILE)
    .required(1)
    .multiple(true);

  model.map((obj, config) => {
    const { data = [], meta = [] } = obj;
    let maxCornerCnt = Math.max(...((config && config.top) || [])); // 最多展示
    const metrics = Metric.value;
    const indicatorMap = {};
    let series = [];
    let indicator;
    let max = 1;
    let hasNoDimensions = false;
    data.forEach((d) => {
      const value = Metric(d);
      const dim = Dimension(d) || [];
      let sery = series[0];
      // 未设置维度，多个指标
      if (dim.length === 0) {
        indicator = indicator || metrics;
        hasNoDimensions = true;
        maxCornerCnt = false; // 全指定指标的情形
        if (value != null) {
          if (!sery) {
            sery = {
              name,
              type: 'radar',
              data: [
                {
                  value,
                  name
                }
              ]
            };
            series.push(sery);
          } else {
            // 求和 ...
            sery.data[0].value = sery.data[0].value.map((v, index) => v + value[index]);
          }
        }
      // 一维度 多指标
      } else {
        indicator = indicator || [];
        const useDim = dim[0]; // 选取第一个维度
        let indicatorItem = indicatorMap[useDim];
        if (!indicatorItem) {
          indicatorItem = indicatorMap[useDim] = {
            name: useDim,
            total: 0,
            pos: indicator.length,
          };
          indicator.push(indicatorItem);
        }
        // 将指标分配到对应的 sery 内
        value.forEach((v, index) => {
          if (v != null) {
            if (!sery) {
              sery = {
                type: 'radar',
                data: []
              };
              series.push(sery);
            }
            let corner = sery.data[index];
            if (!corner) {
              corner = {
                value: [],
                name: metrics[index].name
              };
              sery.data.push(corner);
            }
            indicatorItem.total += Number(v);
            // 统一求和
            corner.value[indicatorItem.pos] = (corner.value[indicatorItem.pos] || 0) + Number(v);
            max = Math.max(corner.value[indicatorItem.pos], max);
          }
        });
      }
    });
    if (maxCornerCnt > 0 && maxCornerCnt !== Infinity) {
      const selectItemsMap = {}; // 前 maxCornerCnt 条
      indicator
        .sort(({ total: a }, { total: b }) => b - a)
        .slice(0, maxCornerCnt)
        .forEach(({ pos, name, max }) => {
          selectItemsMap[pos] = {
            name,
          };
        }); // 逆序
      indicator = []; // 清空
      const newSeries = series.map((sery) => {
        const { data } = sery;
        const newSery = {
          ...sery,
          data: []
        };
        data.forEach((d, index) => {
          let otherCnt = 0;
          const { value } = d;
          const corner = newSery.data[index] = {
            ...d,
            value: []
          };
          value.forEach((v, pos) => {
            if (v != null) {
              if (pos in selectItemsMap) {
                const c = selectItemsMap[pos];
                let selectPos = indicator.indexOf(c);
                if (selectPos === -1) {
                  selectPos = indicator.length;
                  indicator.push(c);
                  corner.value.push(Number(v));
                } else {
                  corner.value[selectPos] = (corner.value[selectPos] || 0) + Number(v);
                }
              } else {
                otherCnt += Number(v);
              }
            }
          });
          // 添加其他
          if (otherCnt) {
            corner.value.push(otherCnt);
            // push 一次
            if (corner.value.length !== indicator.length) {
              indicator.push({
                name: 'other'
              });
            }
            max = Math.max(otherCnt, max);
          }
        });
        return newSery;
      });
      series = newSeries;
    }
    return {
      series: series.map((sery) => {
        const { data } = sery;
        const cnf = sery.$$config = {
          percentMap: {},
        };
        data.forEach((corner, index) => {
          const { value } = corner;
          // 格式化
          if (hasNoDimensions) {
            value.forEach((v, index) => {
              if (v != null) {
                const metric = metrics[index];
                const { format = [] } = metric;
                const percent = format.indexOf(PERCENTILE) !== -1;
                const dec = format.indexOf(TWO_DECIMAL) !== -1;
                if (percent) {
                  v = v * 100;
                  max = Math.max(max, v);
                  cnf.percentMap[index] = '';
                }
                if (dec) {
                  v = Number(Number(v).toFixed(2));
                }
                value[index] = v;
              }
            });
          } else {
            const metric = metrics[index];
            const { format = [] } = metric;
            const percent = format.indexOf(PERCENTILE) !== -1;
            const dec = format.indexOf(TWO_DECIMAL) !== -1;
            if (percent || dec) {
              value.forEach((v, index) => {
                if (v != null) {
                  if (percent) {
                    v = v * 100;
                    max = Math.max(max, v);
                    cnf.percentMap[index] = '';
                  }
                  if (dec) {
                    v = Number(v.toFixed(2));
                  }
                  value[index] = v;
                }
              });
            } 
          }
        });
        return sery;
      }),
      radar: {
        indicator: indicator.map(({ name }) => ({
          name,
          max,
        }))
      }
    };
  });
  return model;
});