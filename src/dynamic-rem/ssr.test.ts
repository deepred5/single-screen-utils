// @vitest-environment node
import { expect, it } from 'vitest';
import dynamicRem from './index';

it('无浏览器全局变量时可以导入 dynamicRem', () => {
  expect(typeof window).toBe('undefined');
  expect(typeof dynamicRem).toBe('function');
});
