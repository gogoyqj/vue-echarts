/**
 * @description 表格模型
 */
import React from 'react';
import { raw } from '../raw';
import { charts, JSX } from '../constants';
import { AntTable } from '../../features/common/';

const { TABLE } = charts;


raw
  .chart(TABLE)
  .category(JSX)
  .draw((canvas, data, config, staticHTML) => {
    const conf = {
      ...config,
      config: {
        size: 'small',
        rowKey: (record, i) => `${i}`,
        columns: data.columns.map((c) => {
          const { style, title, data: key, jsx } = c;
          const col = {
            ...c,
            title: jsx || title, // 埋伏一钩子，用 toString 方法搞不定
            filter: false,
            dataIndex: `${key}`, // since antd table 不能正确处理 0 的情况，因此需要 '0'
            render: (cell) => {
              if (!Array.isArray(cell)) {
                cell = [cell];
              }
              return (
                <span className="metric-ratio">
                  {
                    cell.map((metric, index) => {
                      if (metric && metric.value !== undefined) {
                        const { value, style: metricStyle = {}, title } = metric;
                        return (
                          <span>
                            {index === 1 ? '(' : null}
                            <label key={index} style={metricStyle}>{`${title ? `${title}：` : ''}${value}`}</label>
                            {index && index === cell.length - 1 ? ')' : null}
                          </span>
                        );
                      }
                      return <label>{metric}</label>;
                    })
                  }
                </span>
              );
            }
          };
          if (style && style.width) {
            col.width = style.width;
          }
          if (staticHTML) {
            col.sorter = false;
            col.filter = false;
          }
          return col;
        }),
        dataSource: data.data
      }
    };
    if (staticHTML) {
      conf.pagination = false;
    }
    // 最后输出前的钩子
    if (config.$lastFilter) {
      config.$lastFilter(conf, config);
    }
    return <AntTable {...conf} />;
  });

