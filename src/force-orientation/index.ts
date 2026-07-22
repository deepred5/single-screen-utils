export enum DetectType {
  size, // 根据长宽判断横屏
  orientation, // 根据方向判断横屏
}

export enum OrientationMode {
  portrait, // 强制竖屏
  landscape, // 强制横屏
}

export interface ForceOrientationProps {
  id?: string;
  detectType?: DetectType;
  delay?: number;
  // 旋转角度手动覆盖(90 或 -90)。不传则根据设备物理朝向自动选择
  angle?: 90 | -90;
  // isTargetOrientation: 设备当前是否已处于目标朝向(true 表示无需旋转,直接铺满)
  onForceResize?: (isTargetOrientation: boolean) => void;
}

const defaultProps: Required<Omit<ForceOrientationProps, 'angle'>> = {
  id: '#app',
  detectType: DetectType.size,
  delay: 800,
  onForceResize: () => {},
};

// 屏幕相对设备自然朝向的逆时针旋转角(0/90/180/270),读不到返回 null。
// 优先标准 API screen.orientation.angle,降级到已废弃的 window.orientation(-90 归一化为 270)
const getScreenAngle = (): number | null => {
  if (typeof screen !== 'undefined' && screen.orientation && typeof screen.orientation.angle === 'number') {
    return screen.orientation.angle;
  }
  if (typeof window.orientation === 'number') {
    return (window.orientation + 360) % 360;
  }
  return null;
};

// 由 handler 写入目标元素的内联样式属性,销毁时按此清理还原。
const MUTATED_STYLE_PROPS = [
  'position',
  'width',
  'height',
  'left',
  'top',
  'transform',
  'transformOrigin',
] as const;

// 强制元素朝向的通用核心逻辑。
// forceLandscape / forcePortrait 均是它的薄封装,唯一区别是目标朝向 mode。
const forceOrientation = (mode: OrientationMode, p: ForceOrientationProps = {}) => {
  const props = Object.assign({}, defaultProps, p);
  const { id, detectType, delay, angle, onForceResize } = props;
  const orientationchangeEvent = 'onorientationchange' in window ? 'orientationchange' : 'resize';
  const hiddenProperty = 'hidden' in document ? 'hidden' :
    'webkitHidden' in document ? 'webkitHidden' :
      'mozHidden' in document ? 'mozHidden' :
        null;
  // 老旧浏览器可能没有 Page Visibility API,此时降级为不监听 visibilitychange
  const visibilitychangeEvent = hiddenProperty ? hiddenProperty.replace(/hidden/i, 'visibilitychange') : null;
  const pageshowEvent = 'pageshow';
  let timer: ReturnType<typeof setTimeout>;

  // 决定旋转 +90° 还是 -90°。优先级:用户显式指定 > 按设备物理朝向自动补偿 > 固定默认值。
  // 自动补偿:目标朝向相对重力的角度(竖屏 0°,横屏 90°)减去屏幕当前旋转角,即内容需要补的角度
  const resolveRotateAngle = (): number => {
    if (angle !== undefined) return angle;
    const fallback = mode === OrientationMode.landscape ? 90 : -90;
    const screenAngle = getScreenAngle();
    if (screenAngle === null) return fallback;
    const target = mode === OrientationMode.landscape ? 90 : 0;
    const compensation = ((target - screenAngle) % 360 + 360) % 360;
    if (compensation === 90) return 90;
    if (compensation === 270) return -90;
    // 0 或 180:朝向 API 与尺寸判断结果矛盾(如桌面浏览器缩窄窗口),退回默认值
    return fallback;
  };

  const handler = () => {
    let width = document.documentElement.clientWidth;
    let height = document.documentElement.clientHeight;
    const targetDom = document.querySelector(id) as HTMLElement;
    if (!targetDom) return null;

    const isDeviceLandscape = () => {
      if (detectType === DetectType.size) {
        // 宽度大于高度,就认为是横屏
        return width > height;
      }

      // 根据方向
      return (window.orientation === 90 || window.orientation === -90);
    };

    // 设备当前朝向是否已等于目标朝向
    const isTargetOrientation = isDeviceLandscape() === (mode === OrientationMode.landscape);

    if (isTargetOrientation) {
      // 已是目标朝向,无需旋转,直接铺满
      targetDom.style.position = 'absolute';
      targetDom.style.width = `${width}px`;
      targetDom.style.height = `${height}px`;
      targetDom.style.left = `${0}px`;
      targetDom.style.top = `${0}px`;
      targetDom.style.transform = 'none';
      targetDom.style.transformOrigin = '50% 50%';
      onForceResize(true);
    } else {
      // 绕自身中心旋转 ±90° 铺满视口(定位偏移对两个方向一致)
      targetDom.style.position = 'absolute';
      targetDom.style.width = `${height}px`;
      targetDom.style.height = `${width}px`;
      targetDom.style.left = `${0 - (height - width) / 2}px`;
      targetDom.style.top = `${(height - width) / 2}px`;
      targetDom.style.transform = `rotate(${resolveRotateAngle()}deg)`;
      targetDom.style.transformOrigin = '50% 50%';
      onForceResize(false);
    }
  };

  const executeHandler = () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      handler();
    }, delay);
  };

  const handleResize = () => {
    executeHandler();
  };

  const handlePageShow = (e: PageTransitionEvent) => {
    if (e.persisted) {
      // 来自缓存
      executeHandler();
    }
  };

  const handleVisibilitychange = () => {
    // @ts-ignore
    if (!document[hiddenProperty]) {
      executeHandler();
    }
  };

  window.addEventListener(orientationchangeEvent, handleResize);
  if (visibilitychangeEvent) {
    window.addEventListener(visibilitychangeEvent, handleVisibilitychange);
  }
  window.addEventListener(pageshowEvent, handlePageShow);

  handler();

  return () => {
    window.removeEventListener(orientationchangeEvent, handleResize);
    if (visibilitychangeEvent) {
      window.removeEventListener(visibilitychangeEvent, handleVisibilitychange);
    }
    window.removeEventListener(pageshowEvent, handlePageShow);
    // 清掉可能挂起的防抖回调,避免销毁后又把样式写回去
    clearTimeout(timer);
    // 还原被强制朝向时写入的内联样式
    const targetDom = document.querySelector(id) as HTMLElement | null;
    if (targetDom) {
      MUTATED_STYLE_PROPS.forEach((prop) => {
        targetDom.style[prop] = '';
      });
    }
  };
};

export default forceOrientation;
