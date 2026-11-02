import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import forceLandscape from '../force-landscape';
import forcePortrait from '../force-portrait';

function setViewport(width: number, height: number) {
  Object.defineProperty(document.documentElement, 'clientWidth', { value: width, configurable: true });
  Object.defineProperty(document.documentElement, 'clientHeight', { value: height, configurable: true });
}

describe('强制朝向容器的视口同步', () => {
  let destroy: (() => void) | undefined;
  const orientationDescriptor = Object.getOwnPropertyDescriptor(window, 'onorientationchange');

  beforeEach(() => {
    vi.useFakeTimers();
    document.body.innerHTML = '<div id="app"></div>';
    Object.defineProperty(window, 'onorientationchange', { value: null, configurable: true });
    setViewport(375, 812);
  });

  afterEach(() => {
    destroy?.();
    destroy = undefined;
    vi.restoreAllMocks();
    vi.useRealTimers();
    if (orientationDescriptor) Object.defineProperty(window, 'onorientationchange', orientationDescriptor);
    else Reflect.deleteProperty(window, 'onorientationchange');
    document.body.innerHTML = '';
  });

  it.each([
    ['横屏', forceLandscape, '700px', '320px'],
    ['竖屏', forcePortrait, '320px', '700px'],
  ] as const)('支持 orientationchange 时,%s容器仍响应普通 resize', (_name, force, width, height) => {
    destroy = force({ delay: 100 });
    setViewport(320, 700);
    window.dispatchEvent(new Event('resize'));
    vi.advanceTimersByTime(100);
    const app = document.getElementById('app')!;
    expect(app.style.width).toBe(width);
    expect(app.style.height).toBe(height);
    expect(app.style.left).toBe(force === forceLandscape ? '-190px' : '0px');
    expect(app.style.top).toBe(force === forceLandscape ? '190px' : '0px');
  });

  it('方向变化与普通 resize 共用防抖,最终只同步一次最新视口', () => {
    const onForceResize = vi.fn();
    destroy = forceLandscape({ delay: 100, onForceResize });
    onForceResize.mockClear();
    setViewport(700, 320);
    window.dispatchEvent(new Event('orientationchange'));
    vi.advanceTimersByTime(50);
    setViewport(720, 320);
    window.dispatchEvent(new Event('resize'));
    vi.advanceTimersByTime(99);
    expect(onForceResize).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(onForceResize).toHaveBeenCalledExactlyOnceWith(true);
    expect(document.getElementById('app')!.style.width).toBe('720px');
  });

  it('不支持 orientationchange 时仍只注册一个 resize 监听', () => {
    Reflect.deleteProperty(window, 'onorientationchange');
    const addEventListener = vi.spyOn(window, 'addEventListener');
    const onForceResize = vi.fn();
    destroy = forceLandscape({ delay: 100, onForceResize });
    expect(addEventListener.mock.calls.filter(([event]) => event === 'resize')).toHaveLength(1);
    expect(addEventListener.mock.calls.filter(([event]) => event === 'orientationchange')).toHaveLength(0);
    onForceResize.mockClear();
    setViewport(320, 700);
    window.dispatchEvent(new Event('resize'));
    vi.advanceTimersByTime(100);
    expect(onForceResize).toHaveBeenCalledTimes(1);
  });

  it('销毁后清除两个监听与待执行的同步,不再写回样式', () => {
    const removeEventListener = vi.spyOn(window, 'removeEventListener');
    const onForceResize = vi.fn();
    destroy = forceLandscape({ delay: 100, onForceResize });
    onForceResize.mockClear();
    setViewport(320, 700);
    window.dispatchEvent(new Event('resize'));
    destroy();
    destroy = undefined;
    expect(removeEventListener.mock.calls.filter(([event]) => event === 'resize')).toHaveLength(1);
    expect(removeEventListener.mock.calls.filter(([event]) => event === 'orientationchange')).toHaveLength(1);
    window.dispatchEvent(new Event('resize'));
    window.dispatchEvent(new Event('orientationchange'));
    vi.runAllTimers();
    expect(onForceResize).not.toHaveBeenCalled();
    expect(document.getElementById('app')!.style.width).toBe('');
  });
});
