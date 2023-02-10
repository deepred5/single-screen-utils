# single-screen-utils

[![NPM version](https://img.shields.io/npm/v/single-screen-utils.svg?style=for-the-badge)](https://npmjs.org/package/single-screen-utils)
[![NPM downloads](http://img.shields.io/npm/dm/single-screen-utils.svg?style=for-the-badge)](https://npmjs.org/package/single-screen-utils)

## Install

```bash
npm install single-screen-utils

yarn add single-screen-utils
```

## Quickstart
```javascript
import { dynamicRem } from 'single-screen-utils';
dynamicRem();
```

```javascript
import { forceLandscape } from 'single-screen-utils';
forceLandscape();
```

## API

`dynamicRem`: 根据页面宽高比动态设置html的rem大小

| 属性            | 说明                    | 类型                                    | 默认值                 |
| :-------------- | ----------------------- | --------------------------------------- | ---------------------- |
| pageWidth       | 设计稿的宽度 (px)       | number                                  | 750                    |
| pageHeight      | 设计稿的高度 (px)       | number                                  | 1334                   |
| pageFontSize    | 页面html元素的字体 (px) | number                                  | 100                    |
| pageAspectRatio | 页面宽高比              | number                                  | 750 / 1334             |
| mode            | 横屏模式/竖屏模式       | ModeType.portrait \| ModeType.landscape | ModeType.portrait 竖屏 |


`forceLandscape`: 强制元素横屏
| 属性       | 说明                                                         | 类型                                           | 默认值          |
| ---------- | ------------------------------------------------------------ | ---------------------------------------------- | --------------- |
| Id         | 需要强制横屏的元素id                                         | string                                         | \#app           |
| detectType | 判断是否横屏的依据 <br> DetectType.size 宽度比高度大，认为是横屏 <br> DetectType.size.orientation 设备方向是90或者-90，认为是横屏 | DetectType.size \| DetectType.size.orientation | DetectType.size |
| delay      | 防抖时间(ms)                                                 | number                                         | 800             |
## Develop

```bash
yarn install
npm run dev
npm run build
```
