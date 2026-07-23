import { useEffect, useLayoutEffect } from 'react';

// 浏览器端用 useLayoutEffect(绘制前同步设置,避免首帧字体/样式闪跳),
// SSR 环境退回 useEffect 以规避 React 的 useLayoutEffect 服务端告警。
const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export default useIsomorphicLayoutEffect;
