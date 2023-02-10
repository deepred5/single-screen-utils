export enum ModeType {
  portrait,
  landscape,
};
export interface DynamicRemProps {
  pageWidth?: number;
  pageHeight?: number;
  pageFontSize?: number;
  mode?: ModeType;
  pageAspectRatio?: number;
}; 

const defaultProps: Required<Omit<DynamicRemProps, 'pageAspectRatio'>> = {
  pageWidth: 750,
  pageHeight: 1334,
  pageFontSize: 100,
  mode: ModeType.portrait,
};

const dynamicRem = (p: DynamicRemProps) => {
  const props = Object.assign({}, defaultProps, p);
  const { pageFontSize, pageHeight, pageWidth, mode } = props;
  const pageAspectRatio = props.pageAspectRatio || (pageWidth / pageHeight);

  // 根据屏幕大小及dpi调整缩放和大小
  function onResize() {
    let clientWidth = document.documentElement.clientWidth;
    let clientHeight = document.documentElement.clientHeight;

    // 该页面需要强制横屏
    if (mode === ModeType.landscape) {
      if (clientWidth < clientHeight) {
        [clientWidth, clientHeight] = [clientHeight, clientWidth];
      }
    }

    let aspectRatio = clientWidth / clientHeight;

    // 根元素字体
    let e = 16;
    if (clientWidth > pageWidth) {
      // 认为是ipad/pc
      e = pageFontSize * (clientHeight / pageHeight);
    } else if (aspectRatio > pageAspectRatio) {
      // 宽屏移动端
      e = pageFontSize * (clientHeight / pageHeight);
    } else {
      // 正常移动端
      e = pageFontSize * (clientWidth / pageWidth);
    }

    e = parseFloat(e.toFixed(3));

    document.documentElement.style.fontSize = `${e}px`;
    let realitySize = parseFloat(window.getComputedStyle(document.documentElement).fontSize);
    if (e !== realitySize) {
      e = e * e / realitySize;
      document.documentElement.style.fontSize = `${e}px`;
    }
  }

  const handleResize = () => {
    onResize();
  };

  window.addEventListener('resize', handleResize);
  onResize();

  return (resetFontSize?: string | number) => {
    window.removeEventListener('resize', handleResize);
    if (resetFontSize) {
      if (typeof resetFontSize === 'string') {
        document.documentElement.style.fontSize = resetFontSize;
      } else if (typeof resetFontSize === 'number') {
        document.documentElement.style.fontSize = `${resetFontSize}px`;
      }
    }
  };
};

dynamicRem.ModeType = ModeType;

export default dynamicRem;