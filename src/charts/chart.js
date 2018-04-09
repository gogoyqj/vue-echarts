import React, { Component } from 'react';
import { raw } from './models/';
import ReactDOMServer from 'react-dom/server';

export default class Chart extends Component {
  componentWillUnmount() {
    this.definedChart = null;
    this.canvas = null;
  }

  renderToHTML() {
    const { definedChart, props } = this;
    if (definedChart) {
      const { category } = definedChart;
      const config = props.config || {};
      const { chart = '', height, minHeight } = config;
      if (category() === 'JSX') {
        return ReactDOMServer.renderToStaticMarkup((
          <div style={props.style || {}}>
            {definedChart(null, JSON.parse(JSON.stringify(this.props.data)), this.props.config, 'staticHTML')}
          </div>
        ));
      }
      try {
        return `<img src="${this.canvas.querySelector('canvas').toDataURL('img')}" width="${this.canvas.offsetWidth}" />`;
      } catch (e) {
        return '<span>no canvas found<span>';
      }
    }
    return '<span>no definedChart found</span>';
  }

  render() {
    const { className = '' } = this.props;
    const config = this.props.config || {};
    const { chart = '', height, minHeight } = config;
    const cnf = {
      className: `cube-canvas cube-${chart.toLowerCase().replace(' ', '-')} ${className}`,
      style: { height, minHeight }
    };
    const newData = JSON.parse(JSON.stringify(this.props.data));
    const definedChart = this.definedChart = raw.charts.get(chart);
    let c = config;
    if (location.search.match(/mail=true/)) {
      c = {
        ...c,
        animation: false, // 关闭动画
      };
    }
    if (definedChart) {
      const { category } = definedChart;
      if (category() === 'JSX') {
        cnf.ref = (canvas) => {
          this.canvas = canvas;
        };
        cnf.children = definedChart(null, newData, c);
      } else {
        cnf.ref = (canvas) => {
          this.canvas = canvas;
          definedChart(canvas, newData, c);
        };
      }
    } else {
      cnf.children = 'not support';
    }
    return <div {...cnf} />;
  }
}
