export enum DetectType {
  size, // 根据长宽判断横屏
  orientation, // 根据方向判断横屏
}
export interface LandscapeProps {
  id?: string;
  detectType?: DetectType;
  delay?: number;
};

const defaultProps: Required<LandscapeProps> = {
  id: '#app',
  detectType: DetectType.size,
  delay: 800,
}

const forceLandscape = (p: LandscapeProps) => {
  const props = Object.assign({}, defaultProps, p);
  const { id, detectType, delay } = props;
  const orientationchangeEvent = 'onorientationchange' in window ? 'orientationchange' : 'resize';
  const hiddenProperty = 'hidden' in document ? 'hidden' :
    'webkitHidden' in document ? 'webkitHidden' :
      'mozHidden' in document ? 'mozHidden' :
        null;
  const visibilitychangeEvent = hiddenProperty!.replace(/hidden/i, 'visibilitychange');
  const pageshowEvent = 'pageshow';
  let timer: NodeJS.Timeout;

  const handler = () => {
    let width = document.documentElement.clientWidth;
    let height = document.documentElement.clientHeight;
    const targetDom = document.querySelector(id) as HTMLElement;
    if (!targetDom) return null;

    const isLandscape = () => {
      if (detectType === DetectType.size) {
        // 宽度大于高度,就认为是横屏
        return width > height;
      }

      // 根据方向
      return (window.orientation === 90 || window.orientation === -90);
    };

    if (isLandscape()) {
      // 横屏
      targetDom.style.position = 'absolute';
      targetDom.style.width = `${width}px`;
      targetDom.style.height = `${height}px`;
      targetDom.style.left = `${0}px`;
      targetDom.style.top = `${0}px`;
      targetDom.style.transform = 'none';
      targetDom.style.transformOrigin = '50% 50%';
    } else {
      // 竖屏强制横屏
      targetDom.style.position = 'absolute';
      targetDom.style.width = `${height}px`;
      targetDom.style.height = `${width}px`;
      targetDom.style.left = `${0 - (height - width) / 2}px`;
      targetDom.style.top = `${(height - width) / 2}px`;
      targetDom.style.transform = 'rotate(90deg)';
      targetDom.style.transformOrigin = '50% 50%';
    }
  };

  const excuteHandler = () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      handler();
    }, delay);
  };

  const handleResize = () => {
    excuteHandler();
  };

  const handlePageShow = (e: PageTransitionEvent) => {
    if (e.persisted) {
      // 来自缓存
      excuteHandler();
    }
  };

  const handleVisibilitychange = () => {
    // @ts-ignore
    if (!document[hiddenProperty]) {
      excuteHandler();
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
  }
};

forceLandscape.DetectType = DetectType;

export default forceLandscape;