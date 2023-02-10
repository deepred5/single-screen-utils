import { useEffect } from 'react';
import forceLandscape, { LandscapeProps } from '../../force-landscape';

const useForceLandscape = (options: LandscapeProps) => {
  useEffect(() => {
    const destroy = forceLandscape(options);

    return () => {
      destroy();
    };
  }, []);
};

export default useForceLandscape;
