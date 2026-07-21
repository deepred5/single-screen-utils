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
  // 输入框聚焦时自动暂停(冻结字体),失焦后自动恢复;用于避免软键盘弹起改变
  // clientHeight 导致字体跳动。默认关闭,保持既有行为。
  pauseOnInputFocus?: boolean;
};

export interface DynamicRemHandle {
  // 兼容既有用法:调用即销毁,可选传入 resetFontSize 还原字体
  (resetFontSize?: string | number): void;
  // 暂停响应 resize(字体停留在当前值)
  pause: () => void;
  // 恢复响应 resize,并立即重算一次
  resume: () => void;
}

const defaultProps: Required<Omit<DynamicRemProps, 'pageAspectRatio'>> = {
  pageWidth: 750,
  pageHeight: 1334,
  pageFontSize: 100,
  mode: ModeType.portrait,
  pauseOnInputFocus: false,
};

// 会唤起软键盘的可编辑元素
const NON_TEXT_INPUT_TYPES = ['checkbox', 'radio', 'button', 'submit', 'reset', 'range', 'file', 'color', 'image', 'hidden'];
const isEditableElement = (el: EventTarget | null): boolean => {
  if (!(el instanceof HTMLElement)) return false;
  if (el instanceof HTMLTextAreaElement) return true;
  if (el instanceof HTMLInputElement) {
    return NON_TEXT_INPUT_TYPES.indexOf(el.type) === -1;
  }
  return el.isContentEditable;
};

const dynamicRem = (p: DynamicRemProps = {}): DynamicRemHandle => {
  const props = Object.assign({}, defaultProps, p);
  const { pageFontSize, pageHeight, pageWidth, mode, pauseOnInputFocus } = props;
  const pageAspectRatio = props.pageAspectRatio || (pageWidth / pageHeight);

  // 手动暂停(pause/resume)与焦点暂停(pauseOnInputFocus)相互独立,
  // 任一生效即不响应 resize;各自解除时若整体已不再暂停,立即重算一次。
  let manualPaused = false;
  let focusPaused = false;
  const isPaused = () => manualPaused || focusPaused;

  // 根据屏幕大小及dpi调整缩放和大小
  function onResize() {
    if (isPaused()) return;

    let clientWidth = document.documentElement.clientWidth;
    let clientHeight = document.documentElement.clientHeight;

    // 该页面需要强制横屏
    if (mode === ModeType.landscape) {
      if (clientWidth < clientHeight) {
        [clientWidth, clientHeight] = [clientHeight, clientWidth];
      }
    }

    let aspectRatio = clientWidth / clientHeight;

    // 根元素字体: fontSize = pageFontSize × min(宽度比, 高度比) —— contain 缩放,
    // 保证设计稿内容双向都能装进视口。aspectRatio > pageAspectRatio 等价于高度比更小。
    let e: number;
    if (aspectRatio > pageAspectRatio) {
      // 视口比设计稿更宽(含 ipad/pc 宽屏) → 高度是瓶颈
      e = pageFontSize * (clientHeight / pageHeight);
    } else {
      // 视口比设计稿更瘦高或等比 → 宽度是瓶颈
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

  // ---- pauseOnInputFocus: 聚焦可编辑元素 → 暂停;失焦 → 微延时后确认恢复 ----
  let focusOutTimer: ReturnType<typeof setTimeout>;

  const handleFocusIn = (event: FocusEvent) => {
    if (!isEditableElement(event.target)) return;
    clearTimeout(focusOutTimer);
    focusPaused = true;
  };

  const handleFocusOut = () => {
    if (!focusPaused) return;
    clearTimeout(focusOutTimer);
    // 延后确认:焦点若只是移到另一个输入框(focusout → focusin),保持暂停不抖动
    focusOutTimer = setTimeout(() => {
      if (isEditableElement(document.activeElement)) return;
      focusPaused = false;
      onResize();
    }, 0);
  };

  window.addEventListener('resize', handleResize);
  if (pauseOnInputFocus) {
    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);
  }
  onResize();

  const destroy = (resetFontSize?: string | number) => {
    window.removeEventListener('resize', handleResize);
    if (pauseOnInputFocus) {
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
    }
    clearTimeout(focusOutTimer);
    if (resetFontSize) {
      if (typeof resetFontSize === 'string') {
        document.documentElement.style.fontSize = resetFontSize;
      } else if (typeof resetFontSize === 'number') {
        document.documentElement.style.fontSize = `${resetFontSize}px`;
      }
    }
  };

  const handle = destroy as DynamicRemHandle;
  handle.pause = () => {
    manualPaused = true;
  };
  handle.resume = () => {
    manualPaused = false;
    onResize();
  };

  return handle;
};

dynamicRem.ModeType = ModeType;

export default dynamicRem;
