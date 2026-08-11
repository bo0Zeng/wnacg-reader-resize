# 漫画阅读器图片尺寸（Edge 扩展）

改掉阅读器默认的图片显示宽度。原站只提供 `自適應 / 1280 / 1600 / 2560` 四档，且只在竖向模式生效；这个扩展让你用任意宽度（含百分比）、可选把小图放大、可选连翻页模式一起限制。

## 原理

阅读器脚本给每张图打的是**行内样式**：

```js
// reader.txt:455
const imgStyleAttr = wVal > 0 ? `style="max-width: min(100%, ${wVal}px);"` : `style="max-width: 100%;"`;
// reader.txt:504（点宽度按钮时）
$('#v-container img').css('max-width', w === 0 ? '100%' : `min(100%,${w}px)`)
```

行内样式没有 `!important`，而 CSS 层叠里 `!important` 的作者样式**优先级高于普通行内样式**。所以扩展只需注入一段带 `!important` 的 CSS 即可：

- 不用抢在页面脚本之前执行，也不用注入 `MAIN` world 去改它闭包里的 `V_WIDTH_OPTS`（那是 `const`，闭包外拿不到）；
- 页面上的宽度按钮再点也顶不掉扩展的规则（想让按钮恢复作用，把宽度填 `auto` 或取消「启用」）。

选择器：

| 模式 | 选择器 |
| --- | --- |
| 竖向 | `#v-container img[id^="img-"]`（用 id 前缀排除 `#v-loader` 里的 loading.gif） |
| 翻页（单页/双页） | `#content .slide-view .img-placeholder img` |

## 安装（Edge）

1. 打开 `edge://extensions/`
2. 左下角打开**开发人员模式**
3. 点**加载解压缩的扩展**，选中本文件夹（`wnacg-img-size/`）
4. 点工具栏图标（可先在扩展列表里固定），填宽度即可

## 先确认域名

`manifest.json` 里的 `matches` 只列了几个常见 wnacg 域名。**如果你实际访问的域名不在里面，扩展不会生效** —— 打开阅读页看地址栏，把域名按同样格式加一行：

```json
"matches": [
  "*://*.你的域名.com/*"
]
```

改完在 `edge://extensions/` 点这个扩展的**重新加载**。

## 选项说明

| 选项 | 作用 |
| --- | --- |
| 竖向模式宽度 | `1000px` / `85%` / `auto`。`auto`（或留空、`0`）= 不干预，交回页面自己的设置。非法输入也按不干预处理。 |
| 小图也放大到该宽度 | 关：只做上限（`max-width`），比设定值窄的图保持原样。开：改用 `width`，比设定值窄的图会被拉大（会有插值模糊）。 |
| 翻页模式也限制宽度 | 翻页模式原本是 `object-contain` 撑满视口，勾上后同样受该宽度约束。 |

设置存在 `chrome.storage.sync`，改完已打开的页面立即生效（`content.js` 监听 `storage.onChanged`），不用刷新。

## 不用扩展的做法

如果你要的尺寸正好是 `1280 / 1600 / 2560` 之一，直接点页面上的宽度按钮就行 —— 它会写进 localStorage（`wnacg_reader_settings.vWidthIdx`，见 `reader.txt:128`），下次打开自动沿用。扩展只是为了突破这四档、以及覆盖翻页模式。

## 文件

```
manifest.json   MV3 清单（域名白名单在这里）
content.js      注入 <style>，按设置生成 CSS
popup.html/js   设置面板
```
