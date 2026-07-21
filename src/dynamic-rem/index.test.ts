import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import dynamicRem from './index';

function setViewport(width: number, height: number) {
  Object.defineProperty(document.documentElement, 'clientWidth', { value: width, configurable: true });
  Object.defineProperty(document.documentElement, 'clientHeight', { value: height, configurable: true });
}

describe('dynamicRem', () => {
  beforeEach(() => {
    // 让 getComputedStyle 回读刚设置的行内字体,规避 jsdom 级联样式的局限
    vi.spyOn(window, 'getComputedStyle').mockImplementation(
      (el: Element) => ({ fontSize: (el as HTMLElement).style.fontSize }) as CSSStyleDeclaration,
    );
    document.documentElement.style.fontSize = '';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('返回一个销毁函数', () => {
    setViewport(375, 812);
    const destroy = dynamicRem({});
    expect(typeof destroy).toBe('function');
    destroy();
  });

  it('正常竖屏移动端按宽度比例设置根字体', () => {
    setViewport(375, 812); // aspectRatio 0.46 < 750/1334
    const destroy = dynamicRem({ pageWidth: 750, pageHeight: 1334, pageFontSize: 100 });
    // 100 * (375 / 750) = 50
    expect(document.documentElement.style.fontSize).toBe('50px');
    destroy();
  });

  it('宽屏移动端按高度比例设置根字体', () => {
    setViewport(700, 375); // clientWidth <= 750 且 aspectRatio 1.87 > 0.56
    const destroy = dynamicRem({ pageWidth: 750, pageHeight: 1334, pageFontSize: 100 });
    // 100 * (375 / 1334) = 28.111
    expect(document.documentElement.style.fontSize).toBe('28.111px');
    destroy();
  });

  it('宽度超过设计稿(pc/ipad)按高度比例设置根字体', () => {
    setViewport(1000, 1300);
    const destroy = dynamicRem({ pageWidth: 750, pageHeight: 1334, pageFontSize: 100 });
    // 100 * (1300 / 1334) = 97.451
    expect(document.documentElement.style.fontSize).toBe('97.451px');
    destroy();
  });

  it('横屏模式会交换宽高再计算', () => {
    setViewport(375, 812); // 物理竖屏,landscape 模式交换为 812x375
    const destroy = dynamicRem({
      pageWidth: 750,
      pageHeight: 1334,
      pageFontSize: 100,
      mode: dynamicRem.ModeType.landscape,
    });
    // 交换后 clientWidth=812>750 => 100 * (375 / 1334) = 28.111
    expect(document.documentElement.style.fontSize).toBe('28.111px');
    destroy();
  });

  it('销毁时可传入字符串还原字体', () => {
    setViewport(375, 812);
    const destroy = dynamicRem({});
    destroy('16px');
    expect(document.documentElement.style.fontSize).toBe('16px');
  });

  it('销毁时可传入数字还原字体', () => {
    setViewport(375, 812);
    const destroy = dynamicRem({});
    destroy(20);
    expect(document.documentElement.style.fontSize).toBe('20px');
  });

  it('ModeType 静态常量存在', () => {
    expect(dynamicRem.ModeType.portrait).toBe(0);
    expect(dynamicRem.ModeType.landscape).toBe(1);
  });
});
