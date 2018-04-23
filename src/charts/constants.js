export const PERCENTILE = 'PERCENTILE';
export const TWO_DECIMAL = 'TWO_DECIMAL';
export const THOUSANDS = 'THOUSANDS';
export const METRIC = 'METRIC';
export const DIMENSION = 'DIMENSION';
export const JSX = 'JSX';
export const SPLY = 'year on year';
export const LP = 'ring ratio';
export const charts = {
  LINE: 'LINE',
  BAR: 'BAR',
  TABLE: 'TABLE',
  PIE: 'PIE',
  METRIC_BLOCK: 'METRIC BLOCK',
  RADAR: 'RADAR',
  MAP: 'MAP',
  FUNNEL: 'FUNNEL',
  CLOUD: 'CLOUD',
  SCATTER: 'SCATTER',
  GRAPH: 'GRAPH',
  SANKEY: 'SANKEY'
};
export const style = () => ({
  op: Object.keys(MP),
  style: {
    color: ['red', 'green']
  }
});

const MP = {
  GT: (a, b) => a > b,
  LT: (a, b) => a < b,
};

export const formatStyle = (v, s) => {
  let o = {};
  if (s instanceof Array) {
    s.forEach(({ op: operator, value, style: styleObject }) => {
      if (MP[operator]) {
        if (MP[operator](v, value)) {
          o = {
            ...styleObject
          };
        }
      }
    });
  }
  return o;
};

export const formatNumber = (v, fs = '') => {
  const formats = fs instanceof Array ? fs : fs.trim().split(',');
  if (!formats.length) {
    return v;
  }
  formats.sort((a, b) => {
    if (a === PERCENTILE) {
      return -1;
    }
    if (a === TWO_DECIMAL) {
      return 1;
    }
  }).forEach((f) => {
    if (f === PERCENTILE) { // 百分比
      v = `${v * 100}%`;
    } else if (f === TWO_DECIMAL) { // 2 位小数
      v = String(v).replace(/(\.[0-9]{2})[0-9]*/g, (mat, n) => n);
    } else if (f === THOUSANDS || f === 'QUARTILE') { // 千分位
      const pts = String(v).split('.');
      let beforeDot = pts[0];
      // 正负符号
      let sign = '';
      beforeDot = beforeDot.replace(/^[-+]/g, (s) => {
        sign = s;
        return '';
      });
      let len = beforeDot.length;
      let newNum = '';
      while (len > 0) {
        len -= 3;
        const x = beforeDot.substr(len > 0 ? len : 0, len > 0 ? 3 : 3 + len);
        newNum = `${len > 0 ? `,${x}` : x}${newNum}`;
      }
      v = `${sign}${[newNum].concat(pts.slice(1)).join('.')}`;
    }
  });
  return v;
};

export function renderRatio(v, valueToCompare, isRatio) {
  if (typeof valueToCompare !== 'number') {
    console.warn(`${valueToCompare} 不是数字`);
  } else {
    // 是否已经计算百分比
    const ratio = (valueToCompare - v) * 100 / (isRatio ? 1 : (v || 1));
    // 空值
    v = Number.isNaN(ratio) ? '' : `${ratio.toFixed(2)}%`;
    const style = ratio > 10 ? { color: 'green' } : ratio < -10 ? { color: 'red' } : undefined;
    return { style, value: v };
  }
  return { value: v };
}

export function hasRatio(dim) {
  return dim[SPLY] || dim[LP] || dim.expTag;
}