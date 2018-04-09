/**
 * @description 散点图模型
 */
import { raw } from '../raw';
import { METRIC, DIMENSION, charts, TWO_DECIMAL, PERCENTILE } from '../constants';

const { SCATTER } = charts;

const getTopK = (arr, k) => {
  const xList = arr.map(v => v[0]);
  const yList = arr.map(v => v[1]);
  let lastX = null;
  let scoreX = 0;
  const xListScore = xList
    .map((v, idx) => ({ v, key: idx }))
    .sort((a, b) => a.v - b.v)
    .map((v) => {
      if (v !== lastX) {
        scoreX++;
        lastX = v;
      }
      return {
        ...v,
        score: scoreX
      };
    });

  let lastY = null;
  let scoreY = 0;
  const yListScore = yList
    .map((v, idx) => ({ v, key: idx }))
    .sort((a, b) => a.v - b.v)
    .map((v) => {
      if (v !== lastY) {
        scoreY++;
        lastY = v;
      }
      return {
        ...v,
        score: scoreY
      };
    });

  const score = xListScore
    .map(
    ({ v, score, key }) => ({
      v: [
        v, // x
        yListScore.find(({ key: KEY }) => KEY === key).v, // y
        ...arr[key].slice(2) // 维度
      ],
      score: yListScore.find(({ key: KEY }) => KEY === key).score + score
    })
    )
    .sort((a, b) => a.score - b.score);

  return score.map(({ v }) => v).slice(score.length - k);
};

raw.models.set(SCATTER, (config = {}) => {
  const model = raw.model();

  model.config({
    top: {
      label: 'show top',
      input: 'number',
      style: { width: 80 },
      config: {
        extra: 'N个点'
      }
    }
  });

  // 维度
  const Demensions = model.dimension('dimension')
    .types(DIMENSION)
    .required([1, 2])
    .multiple(true);

  // 定义 x 轴，指标：比如 日期
  const XAxis = model.dimension('XAxis')
    .label('XAxis METRIC')
    .types(METRIC)
    .format(TWO_DECIMAL, PERCENTILE)
    .required([1, 1]);

  // 定义 y 轴，指标：比如 PV
  const YAxis = model.dimension('YAxis')
    .label('YAxis METRIC')
    .types(METRIC)
    .format(TWO_DECIMAL, PERCENTILE)
    .required([1, 1]);

  // 格式化数据
  model.map((obj) => {
    const { data } = obj;

    const legends = [];

    const series = [];

    data.forEach((d) => {
      const demension = Demensions(d);
      // 选了多个维度的话，只对比第一个维度
      if (Array.isArray(demension)) {
        const firstDemension = demension[0];
        if (legends.indexOf(firstDemension) === -1) {
          legends.push(firstDemension);
          series.push({
            name: firstDemension,
            data: [],
            type: 'scatter',
            symbol: 'circle',
            symbolSize: function () {
              return 10;
            },
            label: {
              emphasis: {
                show: true,
                formatter: function (param) {
                  return param.data.toString();
                },
                position: 'top',
                color: '#FFFFFF',
                borderRadius: 10,
                align: 'left',
                padding: 5,
                backgroundColor: 'rgba(0,0,0,0.6)'
              }
            }
          });
        }
      }
    });

    const top = config.top[0] ? Number(config.top[0]) : null;

    if (top) {
      const formatedData = [];
      data.forEach((d) => {
        // xAxis 非必选，暂时赋值为0以防影响前 N 个点的计算
        // 后面再遍历分配使其 x 值有序，而不是所有点都叠在 x = 0 这条线上
        const x = XAxis(d) || 0;
        const y = YAxis(d);
        const demension = Demensions(d);
        formatedData.push([x, y, ...demension]);
      });
      const topK = getTopK(formatedData, top);

      // 按照 legends 产出 series
      topK.forEach((d) => {
        legends.forEach((legend, idx) => {
          const [x, y, ...dimensions] = d;
          if (dimensions[0] === legend) {
            series[idx].data.push([x, y, ...dimensions]);
          }
        });
      });
    } else {
      data.forEach((d) => {
        legends.forEach((legend, idx) => {
          const x = XAxis(d) || 0;
          const y = YAxis(d);
          const demension = Demensions(d);
          if (demension[0] === legend) {
            series[idx].data.push([x, y, ...demension]);
          }
        });
      });
    }

    // 过滤掉没有数据的 series    
    const notEmptySeries = series.filter(s => s.data.length !== 0);

    // 如果没选 x 轴, 为每个点生成唯一的uid
    if (!config.dimension.XAxis.length) {
      notEmptySeries.forEach((s) => {
        let uid = 0;
        s.data = s.data
          // 按照 Y 轴的值排序
          .sort((a, b) => a[1] - b[1])
          // 生成 uid
          .map((d) => {
            d[0] = uid++;
            return d;
          });
      });
    }

    return {
      legend: {
        type: 'scroll',
        // legend 与 series 一致
        data: notEmptySeries.map(({ name }) => name)
      },
      series: notEmptySeries
    };
  });
  return model;
});
