import { useMemo, useRef } from 'react';
import dynamicRem, { DynamicRemProps, DynamicRemHandle } from '../../dynamic-rem';
import useIsomorphicLayoutEffect from '../use-isomorphic-layout-effect';

export type UseDynamicRemProps = DynamicRemProps & {
  resetFontSize?: number | string;
}

// 注意:
// 1. options 仅在首次渲染时生效(init-once),后续变化不会重新初始化;
// 2. dynamicRem 操作全局根字体,同一时刻页面内只应存在一个实例。
const useDynamicRem = (options: UseDynamicRemProps = {}) => {
  const handleRef = useRef<DynamicRemHandle | null>(null);
  // 固定首帧 options,显式表达 init-once 语义
  const optionsRef = useRef(options);

  useIsomorphicLayoutEffect(() => {
    const { resetFontSize, ...props } = optionsRef.current;
    const handle = dynamicRem(props);
    handleRef.current = handle;

    return () => {
      handleRef.current = null;
      handle(resetFontSize);
    };
  }, []);

  // 返回稳定的 pause/resume 代理,卸载后调用为空操作
  return useMemo(() => ({
    pause: () => handleRef.current?.pause(),
    resume: () => handleRef.current?.resume(),
  }), []);
};

export default useDynamicRem;
