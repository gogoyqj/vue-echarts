/**
 * @description 折线图模型
 */
import { raw } from '../raw';
import { PERCENTILE, TWO_DECIMAL, METRIC, DIMENSION, charts, formatNumber } from '../constants';

const { LINE } = charts;

raw.models.set(LINE, (config = {}) => {
  const model = raw.model();

  model.config({
    style: ['area', 'stack', 'hideXY', 'percentage'],
    top: {
      label: 'show top',
      input: 'number',
      style: { width: 80 },
      config: {
        extra: '显示每个指标的 Top N'
      }
    }
  });

  // 定义 x 轴，维度：比如 日期
  const XAxis = model.dimension('XAxis')
    .types(DIMENSION)
    .required([1, 2])
    .multiple(true);

  // 定义 y 轴，指标：比如 PV
  const YAxis = model.dimension('YAxis')
    .types(METRIC)
    // .style(style(LINE))
    .format(TWO_DECIMAL, PERCENTILE)
    .required(1)
    .multiple(true);

  // 格式化数据
  model.map((obj) => {
    const style = (config && config.style) || [];
    const area = style.indexOf('area') !== -1; // 堆叠
    const percentage = style.indexOf('percentage') !== -1; // 计算同一指标的百分比
    const hideXY = style.indexOf('hideXY') !== -1; // 隐藏 x y 坐标
    let stack = style.indexOf('stack') !== -1 && '总量'; // 堆叠
    let max = Math.max(...((config && config.top) || []).filter(n => n > 0));
    if (max <= 0) {
      max = Infinity;
    }
    // 存储每个指标的总和，用以计算百分比
    const MetricTotalCounts = [];
    const { data = [] } = obj;
    const xAxis = [];
    const yAxis = [];
    const series = [];
    const seriesMP = {};
    const metricMP = {};
    let X = XAxis.value;
    const indexMap = {};
    // 过滤掉非配置的日期
    XAxis.value = X = X.filter(m => (`${m.id}` != '-1' || '$DID' in m));
    data.forEach((d) => {
      const XArr = XAxis(d);
      if (!XArr) {
        return;
      }
      // 选取作为 x 轴
      const x = XArr[0];
      const y = YAxis(d);
      let pos = xAxis.indexOf(x);
      if (pos === -1) {
        pos = xAxis.length;
        xAxis.push(x);
      }
      YAxis.value.forEach((YAxisConfig, index) => {
        let { name, format = [], $format, yAxisIndex } = YAxisConfig;
        if (!(yAxisIndex in indexMap)) {
          indexMap[yAxisIndex] = yAxisIndex = yAxis.length;
          yAxis.push({
            gridIndex: yAxisIndex
          });
        } else {
          yAxisIndex = indexMap[yAxisIndex];
        }
        // const s = stack ? XArr[0] || stack : false;
        // 如果某个维度在 X 上的数据是不连续的
        const s = stack ? xAxis[0] || stack : false;
        // 勾选堆积：2个维度按照维度堆积，1个维度则将所有指标堆积起来
        const stackName = s && X.length !== 1 ? `${s}-${name}` : s;
        // seriesMPKey 对于除时间这种维度之外，必须是整个数组拼接，才能唯一标识 - 暂且先同意当成可唯一标识的吧
        const seriesMPKey = XArr.slice(1).concat([name]).join('-');
        if (!seriesMP[seriesMPKey]) {
          seriesMP[seriesMPKey] = {
            metricIndex: index,
            metricName: name,
            name: seriesMPKey,
            yAxisIndex,
            total: 0,
            $$config: {
              percent: format.indexOf(PERCENTILE) !== -1,
              format: format.indexOf(TWO_DECIMAL) !== -1 ? [TWO_DECIMAL] : [],
            },
            area,
            stack: stackName,
            value: []
          };
          metricMP[stackName || ''] = metricMP[stackName || ''] || [];
          metricMP[stackName || ''].push(seriesMP[seriesMPKey]);
        }
        // 处理空值
        if (y[index] != null) {
          let cnt = Number(y[index]);
          cnt = $format ? $format.reduce((v, func) => func(v), cnt) : cnt;
          // 求和才对，之前为何没有求和？求和有什么问题？
          seriesMP[seriesMPKey].total += cnt;
          seriesMP[seriesMPKey].value[pos] = (seriesMP[seriesMPKey].value[pos] || 0) + cnt;
          MetricTotalCounts[index] = MetricTotalCounts[index] || [];
          MetricTotalCounts[index][pos] = MetricTotalCounts[index][pos] || 0;
          MetricTotalCounts[index][pos] += cnt;
        }
      });
    });
    // 确保有序
    const valueToPosMap = {};
    const waitForSelect = [];
    Object
      .keys(metricMP)
      .forEach((key) => {
        metricMP[key].forEach((item) => {
          const { total, $$config: { format = [], percent }, metricIndex } = item;
          const metricMap = valueToPosMap[metricIndex] = valueToPosMap[metricIndex] || {};
          metricMap[total] = metricMap[total] || [];
          metricMap[total].push(waitForSelect.length);
          if (format.length || percent || percentage) {
            // 格式化
            item.value = item.value.map((v, pos) => {
              if (v != null) {
                // 转化成百分比，并保留N位小数
                if (percentage) {
                  item.$$config.percent = true;
                  return Number((v * 100 / (MetricTotalCounts[metricIndex][pos] || 1)).toFixed(2));
                } else if (percent) {
                  v = v * 100;
                }
                if (format.length) {
                  return formatNumber(v, format);
                }
              }
              return v;
            });
          }
          waitForSelect.push(item);
        });
      });
    // 限制条数
    // 此处优化为显示每个指标下的前 TopN
    const selected = {};
    let percent;
    Object
      .keys(valueToPosMap)
      .forEach((metricIndex) => {
        const metricLines = valueToPosMap[metricIndex];
        let count = 0;
        Object
          .keys(metricLines)
          .sort((a, b) => b - a)
          .forEach((valueKey) => {
            const pos = metricLines[valueKey];
            pos.forEach((p) => {
              if (count < max) {
                selected[p] = '';
                count++;
              }
            });
          });
      });
    let otherSeries = {};
    waitForSelect.forEach((s, index) => {
      if (index in selected) {
        if (s.$$config.percent) {
          percent = true;
        }
        series.push(s);
      // 创建一个其他 
      } else if (percentage) {
        const { metricName } = s;
        const otherKey = `other-${metricName}`;
        const other = otherSeries[otherKey];
        if (other) {
          // 此处不能用 map，因为数组内存在 empty
          s.value.forEach((val, pos) => {
            const last = other.value[pos];
            // 处理空值
            if (val != undefined) {
              if (last == undefined) {
                other.value[pos] = Number(val);
              } else {
                other.value[pos] = Number(last) + Number(val); // 麻痹的精度问题？？
              }
            }
          });
        } else {
          series.push(otherSeries[otherKey] = {
            ...s,
            name: otherKey
          });
        }
      }
    });
    return {
      hideXY,
      percent,
      xAxis,
      yAxis,
      series
    };
  });
  return model;
});
