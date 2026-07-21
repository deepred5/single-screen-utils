import { beforeEach, describe, expect, it } from 'vitest';
import forceLandscape from './index';
import forcePortrait from '../force-portrait';

function setViewport(width: number, height: number) {
  Object.defineProperty(document.documentElement, 'clientWidth', { value: width, configurable: true });
  Object.defineProperty(document.documentElement, 'clientHeight', { value: height, configurable: true });
}

describe('forceLandscape / forcePortrait', () => {
  let app: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>';
    app = document.getElementById('app') as HTMLElement;
  });

  describe('forceLandscape', () => {
    it('竖屏设备下旋转 90 度铺满', () => {
      setViewport(375, 812);
      const destroy = forceLandscape();
      expect(app.style.transform).toBe('rotate(90deg)');
      expect(app.style.width).toBe('812px'); // = height
      expect(app.style.height).toBe('375px'); // = width
      expect(app.style.left).toBe('-218.5px'); // 0 - (812-375)/2
      expect(app.style.top).toBe('218.5px'); // (812-375)/2
      destroy();
    });

    it('横屏设备下不旋转,直接铺满', () => {
      setViewport(812, 375);
      const destroy = forceLandscape();
      expect(app.style.transform).toBe('none');
      expect(app.style.width).toBe('812px');
      expect(app.style.height).toBe('375px');
      expect(app.style.left).toBe('0px');
      destroy();
    });

    it('无参调用不报错,且带 DetectType 静态常量', () => {
      setViewport(375, 812);
      expect(() => forceLandscape()).not.toThrow();
      expect(forceLandscape.DetectType.size).toBe(0);
      expect(forceLandscape.DetectType.orientation).toBe(1);
    });
  });

  describe('forcePortrait', () => {
    it('横屏设备下旋转 90 度铺满', () => {
      setViewport(812, 375);
      const destroy = forcePortrait();
      expect(app.style.transform).toBe('rotate(90deg)');
      expect(app.style.width).toBe('375px'); // = height
      expect(app.style.height).toBe('812px'); // = width
      expect(app.style.left).toBe('218.5px'); // 0 - (375-812)/2
      expect(app.style.top).toBe('-218.5px'); // (375-812)/2
      destroy();
    });

    it('竖屏设备下不旋转,直接铺满', () => {
      setViewport(375, 812);
      const destroy = forcePortrait();
      expect(app.style.transform).toBe('none');
      expect(app.style.width).toBe('375px');
      expect(app.style.height).toBe('812px');
      destroy();
    });

    it('带 DetectType 静态常量', () => {
      expect(forcePortrait.DetectType.size).toBe(0);
      expect(forcePortrait.DetectType.orientation).toBe(1);
    });
  });

  it('销毁时还原写入的内联样式', () => {
    setViewport(375, 812);
    const destroy = forceLandscape();
    expect(app.style.transform).toBe('rotate(90deg)');

    destroy();
    expect(app.style.position).toBe('');
    expect(app.style.width).toBe('');
    expect(app.style.height).toBe('');
    expect(app.style.left).toBe('');
    expect(app.style.top).toBe('');
    expect(app.style.transform).toBe('');
    expect(app.style.transformOrigin).toBe('');
  });
});
