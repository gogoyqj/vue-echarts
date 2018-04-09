import hooks from './hooks';
import 'zrender/lib/svg/svg';
import echarts from 'echarts/lib/echarts';
import 'echarts/lib/chart/map';
import 'echarts/map/js/world';
import 'echarts/map/js/china';
import 'echarts/map/js/china-contour';
import 'echarts/lib/chart/heatmap';
import 'echarts/lib/chart/line';
import 'echarts/lib/chart/lines';
import 'echarts/lib/chart/bar';
import 'echarts/lib/chart/pie';
import 'echarts/lib/chart/radar';
import 'echarts/lib/chart/scatter';
import 'echarts/lib/component/title';
import 'echarts/lib/component/legend';
import 'echarts/lib/component/legendScroll';
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/toolbox';
import 'echarts/lib/component/dataZoom';
import 'echarts/lib/component/visualMap';
import 'echarts/lib/component/markPoint';
import 'echarts/lib/component/markLine';
import 'echarts/lib/component/markArea';
import 'echarts/lib/chart/funnel';
import 'echarts/lib/chart/gauge';
import 'echarts/lib/chart/sankey';

/**
 * @method canvas 初始化一个 echarts 画布
 * @param {element} ele 画布元素
 * @return {object} echarts 实例
 */
export const init = (ele, config = {}) => {
  const chart = echarts.init(ele, 'custom');
  const { events } = config;
  chart.on('dblclick', function (params) {
    let hide;
    try {
      hide = this._model.option.series.length > 1;
    } catch (e) {
      hide = true;
    }
    if (hide && params.seriesName) {
      this.dispatchAction({
        type: 'legendToggleSelect',
        // 图例名称
        name: params.seriesName
      });
    }
  });
  if (Array.isArray(events)) {
    events.forEach(({ event, cb }) => {
      chart.on(event, cb);
    });
  }
  return chart;
};

hooks.init = init;
