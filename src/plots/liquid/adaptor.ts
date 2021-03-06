import { Geometry } from '@antv/g2';
import { isFunction } from '@antv/util';
import { interaction, animation, theme, scale } from '../../adaptor/common';
import { Params } from '../../core/adaptor';
import { flow, deepAssign } from '../../utils';
import { interval } from '../../adaptor/geometries';
import { LiquidOptions } from './types';

const CAT_VALUE = 'liquid';

/**
 * geometry 处理
 * @param params
 */
function geometry(params: Params<LiquidOptions>): Params<LiquidOptions> {
  const { chart, options } = params;
  const { percent, color, liquidStyle, radius } = options;

  const data = [{ percent, type: CAT_VALUE }];

  chart.scale({
    percent: {
      min: 0,
      max: 1,
    },
  });

  chart.data(data);

  const p = deepAssign({}, params, {
    options: {
      xField: 'type',
      yField: 'percent',
      // radius 放到 columnWidthRatio 中。
      // 保证横向的大小是根据  redius 生成的
      widthRatio: radius,
      interval: {
        color,
        style: liquidStyle,
        shape: 'liquid-fill-gauge',
      },
    },
  });
  const { ext } = interval(p);
  const geometry = ext.geometry as Geometry;

  // 将 radius 传入到自定义 shape 中
  geometry.customInfo({
    radius,
  });

  // 关闭组件
  chart.legend(false);
  chart.axis(false);
  chart.tooltip(false);

  return params;
}

/**
 * 统计指标文档
 * @param params
 */
function statistic(params: Params<LiquidOptions>): Params<LiquidOptions> {
  const { chart, options } = params;
  const { statistic, percent } = options;

  const { title, content } = statistic;

  // annotation title 和 content 分别使用一个 text
  [title, content].forEach((annotation) => {
    if (annotation) {
      const { formatter, style, offsetX, offsetY, rotate } = annotation;
      chart.annotation().text({
        top: true,
        position: {
          type: CAT_VALUE,
          percent: 0.5,
        },
        content: isFunction(formatter) ? formatter({ percent }) : `${percent}`,
        style: isFunction(style) ? style({ percent }) : style,
        offsetX,
        offsetY,
        rotate,
      });
    }
  });

  return params;
}

/**
 * 水波图适配器
 * @param chart
 * @param options
 */
export function adaptor(params: Params<LiquidOptions>) {
  // flow 的方式处理所有的配置到 G2 API
  return flow(geometry, statistic, scale({}), animation, theme, interaction)(params);
}
