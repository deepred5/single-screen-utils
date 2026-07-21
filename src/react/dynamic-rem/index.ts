import { useEffect, useMemo, useRef } from 'react';
import dynamicRem, { DynamicRemProps, DynamicRemHandle } from '../../dynamic-rem';

export type UseDynamicRemProps = DynamicRemProps & {
  resetFontSize?: number | string;
}

const useDynamicRem = (options: UseDynamicRemProps = {}) => {
  const handleRef = useRef<DynamicRemHandle | null>(null);

  useEffect(() => {
    const { resetFontSize, ...props } = options;
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
