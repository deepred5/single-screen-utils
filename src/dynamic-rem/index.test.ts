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

  it('宽度超过设计稿但宽高比仍偏宽(pc/ipad)按高度比例设置根字体', () => {
    setViewport(1000, 1300); // aspectRatio 0.77 > 0.56 → 高度是瓶颈
    const destroy = dynamicRem({ pageWidth: 750, pageHeight: 1334, pageFontSize: 100 });
    // 100 * (1300 / 1334) = 97.451
    expect(document.documentElement.style.fontSize).toBe('97.451px');
    destroy();
  });

  it('宽度超过设计稿但视口更瘦高时按宽度比例设置根字体(回归: 旧实现横向溢出)', () => {
    setViewport(800, 1600); // clientWidth 800 > 750,但 aspectRatio 0.5 < 0.56 → 宽度是瓶颈
    const destroy = dynamicRem({ pageWidth: 750, pageHeight: 1334, pageFontSize: 100 });
    // min(800/750, 1600/1334) = 800/750 → 100 * (800 / 750) = 106.667 (旧实现错误地给出 119.94,内容溢出)
    expect(document.documentElement.style.fontSize).toBe('106.667px');
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

  describe('pause / resume', () => {
    it('pause 后 resize 不再重算,resume 后立即重算', () => {
      setViewport(375, 812);
      const handle = dynamicRem({ pageWidth: 750, pageHeight: 1334, pageFontSize: 100 });
      expect(document.documentElement.style.fontSize).toBe('50px');

      handle.pause();
      setViewport(300, 812); // 模拟键盘等导致的视口变化
      window.dispatchEvent(new Event('resize'));
      expect(document.documentElement.style.fontSize).toBe('50px'); // 冻结不变

      handle.resume();
      // 100 * (300 / 750) = 40
      expect(document.documentElement.style.fontSize).toBe('40px');
      handle();
    });

    it('pause 期间调用销毁函数仍可还原字体(兼容旧用法)', () => {
      setViewport(375, 812);
      const handle = dynamicRem({});
      handle.pause();
      handle('16px');
      expect(document.documentElement.style.fontSize).toBe('16px');
    });
  });

  describe('pauseOnInputFocus', () => {
    it('聚焦 input 时冻结,失焦后恢复并重算', async () => {
      setViewport(375, 812);
      document.body.innerHTML = '<input id="name" type="text" />';
      const input = document.getElementById('name') as HTMLInputElement;

      const handle = dynamicRem({ pageWidth: 750, pageHeight: 1334, pageFontSize: 100, pauseOnInputFocus: true });
      expect(document.documentElement.style.fontSize).toBe('50px');

      input.focus(); // focusin → 暂停
      setViewport(375, 400); // 键盘弹起压缩高度 → 宽屏分支本应改字体
      window.dispatchEvent(new Event('resize'));
      expect(document.documentElement.style.fontSize).toBe('50px'); // 被冻结

      input.blur(); // focusout → 微延时后恢复
      await new Promise((r) => setTimeout(r, 10));
      // 恢复后立即重算: aspectRatio 375/400 > 750/1334 → 100 * (400/1334) = 29.985
      expect(document.documentElement.style.fontSize).toBe('29.985px');
      handle();
    });

    it('checkbox 等非文本控件聚焦不触发冻结', () => {
      setViewport(375, 812);
      document.body.innerHTML = '<input id="cb" type="checkbox" />';
      const cb = document.getElementById('cb') as HTMLInputElement;

      const handle = dynamicRem({ pageWidth: 750, pageHeight: 1334, pageFontSize: 100, pauseOnInputFocus: true });
      cb.focus();
      setViewport(300, 812);
      window.dispatchEvent(new Event('resize'));
      // 未冻结,正常重算: 100 * (300/750) = 40
      expect(document.documentElement.style.fontSize).toBe('40px');
      handle();
    });

    it('默认不开启,聚焦 input 不影响 resize 重算', () => {
      setViewport(375, 812);
      document.body.innerHTML = '<input id="name2" type="text" />';
      (document.getElementById('name2') as HTMLInputElement).focus();

      const handle = dynamicRem({ pageWidth: 750, pageHeight: 1334, pageFontSize: 100 });
      setViewport(300, 812);
      window.dispatchEvent(new Event('resize'));
      expect(document.documentElement.style.fontSize).toBe('40px');
      handle();
    });

    it('销毁后不再监听 focus 事件', () => {
      setViewport(375, 812);
      document.body.innerHTML = '<input id="name3" type="text" />';
      const input = document.getElementById('name3') as HTMLInputElement;

      const handle = dynamicRem({ pageWidth: 750, pageHeight: 1334, pageFontSize: 100, pauseOnInputFocus: true });
      handle('16px'); // 销毁
      input.focus();
      expect(document.documentElement.style.fontSize).toBe('16px');
    });
  });
});
