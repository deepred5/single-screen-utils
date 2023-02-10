import { useEffect } from 'react';
import dynamicRem, { DynamicRemProps } from '../../dynamic-rem';

export type UseDynamicRemProps = DynamicRemProps & {
  resetFontSize?: number | string;
}

const useDynamicRem = (options: UseDynamicRemProps = {}) => {
  useEffect(() => {
    const { resetFontSize, ...props } = options;
    const destroy = dynamicRem(props);

    return () => {
      destroy(resetFontSize);
    };
  }, []);
};

export default useDynamicRem;
