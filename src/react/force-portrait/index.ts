import { useRef } from 'react';
import forcePortrait, { PortraitProps } from '../../force-portrait';
import useIsomorphicLayoutEffect from '../use-isomorphic-layout-effect';

// options 仅在首次渲染时生效(init-once),后续变化不会重新初始化。
const useForcePortrait = (options: PortraitProps = {}) => {
  const optionsRef = useRef(options);

  useIsomorphicLayoutEffect(() => {
    const destroy = forcePortrait(optionsRef.current);

    return () => {
      destroy();
    };
  }, []);
};

export default useForcePortrait;
