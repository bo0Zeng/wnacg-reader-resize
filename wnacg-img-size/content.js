// 用带 !important 的 CSS 覆盖阅读器给 <img> 打的行内 max-width。
// 行内样式没有 !important，所以这里必胜；也因此不需要抢在页面脚本之前跑，
// 页面上的「宽度」按钮改行内样式也顶不掉这里的规则。

const DEFAULTS = {
  enabled: true,
  width: '1000px',       // 'auto' / '' / '0' = 不干预，交回页面自己的设置
  upscale: false,        // true: 小图也拉到该宽度；false: 只做上限
  applyToPageMode: false // 翻页（单页/双页）模式是否也限制最大宽度
};

const STYLE_ID = '__manga_img_size_style';

// 竖向模式的漫画图（排除 #v-loader 里的 loading.gif）
const V_IMG = '#v-container img[id^="img-"]';
// 翻页模式的漫画图
const P_IMG = '#content .slide-view .img-placeholder img';

function normalizeWidth(raw) {
  const s = String(raw == null ? '' : raw).trim().toLowerCase();
  if (!s || s === 'auto' || s === '0') return null;
  if (/^\d+(\.\d+)?$/.test(s)) return s + 'px';
  if (/^\d+(\.\d+)?(px|%|vw|rem|em)$/.test(s)) return s;
  return null; // 非法输入按「不干预」处理，避免写出坏 CSS
}

function buildCss(cfg) {
  const w = normalizeWidth(cfg.width);
  if (!cfg.enabled || !w) return '';

  const rules = [];
  if (cfg.upscale) {
    rules.push(`${V_IMG}{width:min(100%,${w})!important;max-width:none!important;height:auto!important}`);
  } else {
    rules.push(`${V_IMG}{max-width:min(100%,${w})!important;width:auto!important;height:auto!important}`);
  }
  if (cfg.applyToPageMode) {
    rules.push(`${P_IMG}{max-width:min(100%,${w})!important}`);
  }
  return rules.join('\n');
}

function apply(cfg) {
  let el = document.getElementById(STYLE_ID);
  if (!el) {
    el = document.createElement('style');
    el.id = STYLE_ID;
    (document.head || document.documentElement).appendChild(el);
  }
  el.textContent = buildCss(cfg);
}

chrome.storage.sync.get(DEFAULTS, apply);

// 弹窗里改设置后，已打开的页面立刻跟着变，不用刷新
chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'sync') return;
  chrome.storage.sync.get(DEFAULTS, apply);
});
