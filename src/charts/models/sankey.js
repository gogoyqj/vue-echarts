/**
 * @description 图模型
 */
import { raw } from '../raw';
import { METRIC, DIMENSION, charts, TWO_DECIMAL, PERCENTILE } from '../constants';

const { SANKEY } = charts;

// 数据层抽象
raw.models.set(SANKEY, (config = {}) => {
  const model = raw.model();
  model.config({
    top: {
      label: 'show top',
      input: 'number',
      style: { width: 80 },
      config: {
        extra: '个点'
      }
    }
  });

  const S = model
    .dimension('source')
    .types(DIMENSION)
    .required(1)
    .multiple(true);
  
    const T = model
      .dimension('target')
      .types(DIMENSION)
      .required(1)
      .multiple(true);

  // 一个指标
  const V = model
    .dimension('value')
    .types(METRIC);
  model.map((obj, config) => {
    const sourceMeta = S.value;
    const targetMeta = T.value;
    const { data = [] } = obj;
    const max = Math.max(...((config && config.top) || []));
    const sery = {
      nodes: [],
      links: []
    };
    const { nodes, links } = sery;
    // 节点
    const nodesMap = {};
    // 关系
    const linksMap = {};
    data.forEach((d) => {
      let sources = S(d);
      let targets = T(d);
      if (!Array.isArray(sources)) {
        sources = [sources];
      }
      if (!Array.isArray(targets)) {
        targets = [targets];
      }
      const value = Number(V(d)) || 1;
      sources.forEach((source, sourceIndex) => {
        // 加前缀防止 a => b => a 情况导致闭环出错
        source = `${sourceMeta[sourceIndex].name || 'source'}: ${source}`;
        targets.forEach((target, targetIndex) => {
          target = `${targetMeta[targetIndex].name || 'target'}: ${target}`;
          // source
          let node = nodesMap[source];
          if (node) {
            node.value = (node.value || 0) + value;
          } else {
            node = {
              name: source,
              value
            };
            nodes.push(nodesMap[source] = node);
          }
          // target
          node = nodesMap[target];
          if (!node) {
            node = {
              name: target
            };
            nodes.push(nodesMap[target] = node);
          }
          // links
          const AToB = `${source} -> ${target}`;
          if (AToB in linksMap) {
            const link = linksMap[AToB];
            const { value: ab } = link;
            if (Array.isArray(ab)) {
              ab[0] += value;
            } else {
              link.value += value;
            }
          } else {
            const link = {
              source,
              target,
              value
            };
            links.push(linksMap[AToB] = link);
          }
        });
      });
    });
    // 确定最大
    if (config.sort !== false) {
      nodes
      .sort(({ value: a }, { value: b }) => (b - a));
    }
    // 限制点的个数
    if (max > 0 && max !== Infinity) {
      nodes.splice(max, nodes.length - max);
    }
    return {
      series: [ sery ]
    };
  });
  return model;
});