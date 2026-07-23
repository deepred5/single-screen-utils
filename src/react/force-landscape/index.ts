import { useRef } from 'react';
import forceLandscape, { LandscapeProps } from '../../force-landscape';
import useIsomorphicLayoutEffect from '../use-isomorphic-layout-effect';

// options 仅在首次渲染时生效(init-once),后续变化不会重新初始化。
const useForceLandscape = (options: LandscapeProps = {}) => {
  const optionsRef = useRef(options);

  useIsomorphicLayoutEffect(() => {
    const destroy = forceLandscape(optionsRef.current);

    return () => {
      destroy();
    };
  }, []);
};

export default useForceLandscape;
