/**
 * @description 图模型
 */
import { raw } from '../raw';
import { METRIC, DIMENSION, charts, TWO_DECIMAL, PERCENTILE } from '../constants';

const { GRAPH } = charts;

// 数据层抽象
raw.models.set(GRAPH, (config = {}) => {
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
    .required(1);
  
    const T = model
      .dimension('target')
      .types(DIMENSION)
      .required(1);
  
    const TC = model
      .dimension('targetCategory')
      .types(DIMENSION);

    const SC = model
        .dimension('sourceCategory')
        .types(DIMENSION);

  // 一个指标
  const V = model
    .dimension('value')
    .types(METRIC);

  model.map((obj, config) => {
    const { data = [] } = obj;
    const max = Math.max(...((config && config.top) || []));
    const sery = {
      nodes: [],
      links: []
    };
    const { nodes, links } = sery;
    let categories = {};
    // 节点
    const nodesMap = {};
    // 关系
    const linksMap = {};
    data.forEach((d) => {
      const source = S(d);
      const target = T(d);
      const value = Number(V(d)) || 1;
      const sourceCategory = SC(d);
      const targetCategory = TC(d);
      // source
      let node = nodesMap[source];
      if (node) {
        node.value += value;
      } else {
        node = {
          name: source,
          value
        };
        nodes.push(nodesMap[source] = node);
      }
      let category = node.category = sourceCategory || node.category;
      if (category !== undefined) {
        categories[category] = '';
      }
      // target
      node = nodesMap[target];
      if (!node) {
        node = {
          name: target,
          value
        };
        nodes.push(nodesMap[target] = node);
      }
      category = node.category = targetCategory || node.category;
      if (category !== undefined) {
        categories[category] = '';
      }
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
      // 处理双向
      const BToA = `${target} -> ${source}`;
      if (BToA in linksMap) {
        const link = linksMap[BToA];
        const { value: ba } = link;
        if (Array.isArray(ba)) {
          ba[1] += value;
        } else {
          link.value = [ba, value];
        }
      }
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
    categories = Object.keys(categories);
    if (categories.length) {
      sery.categories = categories.map(cate => ({
        name: cate
      }));
    }
    return {
      series: [ sery ]
    };
  });
  return model;
});