/**
 * @description 指标块模型
 */
import React, { Component } from 'react';
import { TagCloud } from 'react-tagcloud';
import { raw } from '../raw';
import { JSX, charts } from '../constants';

const { CLOUD } = charts;
const options = {
  luminosity: 'light',
  hue: 'blue'
};
const style = { textAlign: 'center' };
const customRenderer = (tag, size, color) => (
  <span
    key={tag.value}
    title={`${tag.value}${tag.title ? `- ${tag.title}` : ''}: ${tag.count}`}
    style={{ color, fontSize: size || 12, margin: '0 3px', verticalAlign: 'middle', display: 'inline-block', cursor: 'default', }}
  >{tag.value}</span>
);


raw
  .chart(CLOUD)
  .category(JSX)
  .draw((canvas, cnf, config) => {
    const { series } = cnf;
    const c = {
      minSize: 12,
      maxSize: Math.min(50, 12 + series.length),
      tags: series,
      renderer: customRenderer
    };
    // 最后输出前的钩子
    if (config.$lastFilter) {
      config.$lastFilter(c, config);
    }
    return (
      <div style={style}>
        <TagCloud {...c} />
      </div>
    );
  });
