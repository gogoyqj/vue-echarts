/**
 * @description 指标块模型
 */
import React, { Component } from 'react';
import { raw } from '../raw';
import { JSX, charts } from '../constants';

const { METRIC_BLOCK } = charts;

const render = (v, index) => {
  switch (index) {
    case 0:
      return (<h2>{v}</h2>);
    case 1:
      return (<h3>{v}</h3>);
    default:
      return (<h4>{v}</h4>);
  }
};

raw
  .chart(METRIC_BLOCK)
  .category(JSX)
  .draw((canvas, cnf) => {
    const { name, metrics } = cnf;
    return (
      <div className="metric-list">
        {
          metrics.map(({ title, values }, index) => {
            const current = values[0];
            const left = values.slice(1);
            const { title: t, value, style } = current; // 本期
            const k = `b${index}`;
            return (
              <div key={k} className="metric-group">
                <div className="metric-group-item clearfix">
                  {
                    render(<span style={style}><span className="metric-block">{title}：</span>{value}</span>, index)
                  }
                  {
                    left.length ? (
                      <span className="pull-right">
                        ({
                          left.map(({ title, value, style }) => <span key={title} className="metric-block-ratio" style={style}><span>{title}：</span>{value}</span>, index)
                        })
                      </span>
                    ) : null
                  }
                </div>
              </div>
            );
          })
        }
      </div>
    );
  });
