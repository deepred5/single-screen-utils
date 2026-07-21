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
  // isTargetOrientation: 设备当前是否已处于目标朝向(true 表示无需旋转,直接铺满)
  onForceResize?: (isTargetOrientation: boolean) => void;
}

const defaultProps: Required<ForceOrientationProps> = {
  id: '#app',
  detectType: DetectType.size,
  delay: 800,
  onForceResize: () => {},
};

// 强制元素朝向的通用核心逻辑。
// forceLandscape / forcePortrait 均是它的薄封装,唯一区别是目标朝向 mode。
const forceOrientation = (mode: OrientationMode, p: ForceOrientationProps = {}) => {
  const props = Object.assign({}, defaultProps, p);
  const { id, detectType, delay, onForceResize } = props;
  const orientationchangeEvent = 'onorientationchange' in window ? 'orientationchange' : 'resize';
  const hiddenProperty = 'hidden' in document ? 'hidden' :
    'webkitHidden' in document ? 'webkitHidden' :
      'mozHidden' in document ? 'mozHidden' :
        null;
  const visibilitychangeEvent = hiddenProperty!.replace(/hidden/i, 'visibilitychange');
  const pageshowEvent = 'pageshow';
  let timer: ReturnType<typeof setTimeout>;

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
      // 旋转 90° 绕自身中心铺满视口(横竖两个方向数学一致)
      targetDom.style.position = 'absolute';
      targetDom.style.width = `${height}px`;
      targetDom.style.height = `${width}px`;
      targetDom.style.left = `${0 - (height - width) / 2}px`;
      targetDom.style.top = `${(height - width) / 2}px`;
      targetDom.style.transform = 'rotate(90deg)';
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
  window.addEventListener(visibilitychangeEvent, handleVisibilitychange);
  window.addEventListener(pageshowEvent, handlePageShow);

  handler();

  return () => {
    window.removeEventListener(orientationchangeEvent, handleResize);
    window.removeEventListener(visibilitychangeEvent, handleVisibilitychange);
    window.removeEventListener(pageshowEvent, handlePageShow);
  };
};

export default forceOrientation;
