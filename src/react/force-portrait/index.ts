import { useEffect } from 'react';
import forcePortrait, { PortraitProps } from '../../force-portrait';

const useForcePortrait = (options: PortraitProps = {}) => {
  useEffect(() => {
    const destroy = forcePortrait(options);

    return () => {
      destroy();
    };
  }, []);
};

export default useForcePortrait;
