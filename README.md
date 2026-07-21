# single-screen-utils

[![NPM version](https://img.shields.io/npm/v/single-screen-utils.svg?style=for-the-badge)](https://npmjs.org/package/single-screen-utils)
[![NPM downloads](http://img.shields.io/npm/dm/single-screen-utils.svg?style=for-the-badge)](https://npmjs.org/package/single-screen-utils)

单屏页面布局常用工具方法

`dynamicRem`: 单屏页面时，既需要根据屏幕**宽度**也需要根据屏幕**高度**进行`rem`设置 (常规`rem`方案，仅使用屏幕**宽度**进行等比例划分)

`forceLandscape`: 强制元素横屏方案

`forcePortrait`: 强制元素竖屏方案

## Install

```bash
npm install single-screen-utils

yarn add single-screen-utils
```

## Quickstart

**dynamicRem**

普通方法
```javascript
import { dynamicRem } from 'single-screen-utils';

// 返回一个销毁函数
const destroy = dynamicRem();
```

`hooks`方法
```jsx
import { useDynamicRem } from 'single-screen-utils';

const App = () => {
  // 自动销毁
  useDynamicRem();

  return (
    <div id="app">App</div>
  )
};
```
***

**forceLandscape**

普通方法
```javascript
import { forceLandscape } from 'single-screen-utils';

// 返回一个销毁函数
const destroy = forceLandscape();
```

`hooks`方法
```jsx
import { useForceLandscape } from 'single-screen-utils';

const App = () => {
  // 自动销毁
  useForceLandscape();

  return (
    <div id="app">App</div>
  )
};
```
***

**forcePortrait**

普通方法
```javascript
import { forcePortrait } from 'single-screen-utils';

// 返回一个销毁函数
const destroy = forcePortrait();
```

`hooks`方法
```jsx
import { useForcePortrait } from 'single-screen-utils';

const App = () => {
  // 自动销毁
  useForcePortrait();

  return (
    <div id="app">App</div>
  )
};
```

## API

`dynamicRem`: 根据页面宽高比动态设置html的rem大小

参数:

| 属性            | 说明                    | 类型                                    | 默认值                 |
| :-------------- | ----------------------- | --------------------------------------- | ---------------------- |
| pageWidth       | 设计稿的宽度 (px)       | number                                  | 750                    |
| pageHeight      | 设计稿的高度 (px)       | number                                  | 1334                   |
| pageFontSize    | 页面html元素的字体 (px) | number                                  | 100                    |
| pageAspectRatio | 页面宽高比              | number                                  | pageWidth / pageHeight             |
| mode            | 横屏模式/竖屏模式       | ModeType.portrait \| ModeType.landscape | ModeType.portrait 竖屏 |
| pauseOnInputFocus | 输入框聚焦时自动暂停(冻结字体)，失焦后自动恢复。用于避免软键盘弹起改变视口高度导致字体跳动 | boolean | false |


返回值:

返回一个函数，调用此函数取消事件监听

| 类型 | 说明                            |
| -------- | ------------------------------- |
| (resetFontSize?: string \| number) => void | 取消rem动态设置，还原默认的字体 |

返回的函数上还挂载了两个方法:

| 方法 | 说明 |
| -------- | ------------------------------- |
| pause() | 暂停响应 resize，字体冻结在当前值 |
| resume() | 恢复响应 resize，并立即重算一次 |

```javascript
const handle = dynamicRem();

// 打开含输入框的弹窗前冻结，关闭后恢复 (也可直接用 pauseOnInputFocus 自动处理)
handle.pause();
handle.resume();

// 兼容原有用法：调用销毁并还原字体
handle('16px');
```

`useDynamicRem` 的返回值为 `{ pause, resume }`，语义与上述一致（组件卸载后调用为空操作）。


静态常量:

`dynamicRem.ModeType.portrait` 竖屏模式 (0) 

`dynamicRem.ModeType.landscape` 横屏模式 (1) 

***

`forceLandscape`: 强制元素横屏

参数:

| 属性       | 说明                                                         | 类型                                           | 默认值          |
| ---------- | ------------------------------------------------------------ | ---------------------------------------------- | --------------- |
| Id         | 需要强制横屏的元素id                                         | string                                         | \#app           |
| detectType | 判断是否横屏的依据 <br> DetectType.size 宽度比高度大，认为是横屏 <br> DetectType.orientation 设备方向是90或者-90，认为是横屏 | DetectType.size \| DetectType.orientation | DetectType.size |
| delay      | 防抖时间(ms)                                                 | number                                         | 800             |
| onForceResize      | 强制转换元素时的回调方法                                                | function                                         | (isLandscape: boolean) => void            |

返回值:

返回一个函数，调用此函数取消事件监听

| 类型 | 说明                            |
| -------- | ------------------------------- |
| () => void | 取消事件监听，不再强制横屏 |


静态常量:

`forceLandscape.DetectType.size` 宽度比高度大，认为是横屏 (0) 

`forceLandscape.DetectType.orientation` 设备方向是90或者-90，认为是横屏 (1) 

***

`forcePortrait`: 强制元素竖屏。参数、返回值、静态常量与 `forceLandscape` 完全一致，仅旋转方向相反（设备处于横屏时旋转，处于竖屏时直接铺满）。

参数:

| 属性       | 说明                                                         | 类型                                           | 默认值          |
| ---------- | ------------------------------------------------------------ | ---------------------------------------------- | --------------- |
| Id         | 需要强制竖屏的元素id                                         | string                                         | \#app           |
| detectType | 判断是否横屏的依据 <br> DetectType.size 宽度比高度大，认为是横屏 <br> DetectType.orientation 设备方向是90或者-90，认为是横屏 | DetectType.size \| DetectType.orientation | DetectType.size |
| delay      | 防抖时间(ms)                                                 | number                                         | 800             |
| onForceResize      | 强制转换元素时的回调方法，参数为设备是否已处于目标（竖屏）朝向 | function                                         | (isPortrait: boolean) => void            |

返回值:

返回一个函数，调用此函数取消事件监听

| 类型 | 说明                            |
| -------- | ------------------------------- |
| () => void | 取消事件监听，不再强制竖屏 |


静态常量:

`forcePortrait.DetectType.size` 宽度比高度大，认为是横屏 (0) 

`forcePortrait.DetectType.orientation` 设备方向是90或者-90，认为是横屏 (1) 

## Develop

```bash
yarn install

npm run dev

npm run build

npm run test
```
