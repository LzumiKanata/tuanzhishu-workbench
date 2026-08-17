/**
 * 页面缩放模块（每页独立记忆 · Ctrl +/- 调整）
 * codx 2026-08-07 · 需求：放大缩小按键 + CTRL+/- 快捷键，每个页面独立计算，大小互不影响
 *
 * 实现：
 * - 缩放值按 page 存入 localStorage（tzs_zoom），每页独立
 * - Ctrl+= / Ctrl+- 调整当前页缩放（步进 0.1，范围 0.6~1.8）
 * - 应用方式：给 #content 设 zoom，N() 页面切换时恢复对应页缩放值
 * - Ctrl+0 重置当前页到 100%
 * - 与 Ctrl+Shift+T（AI 窗口）不冲突（键位不同）
 */
(function() {
  var KEY = "tzs_zoom";
  var MIN = 0.6, MAX = 1.8, STEP = 0.1;

  function load() {
    try { var o = JSON.parse(localStorage.getItem(KEY) || "{}"); return (o && typeof o === "object") ? o : {}; }
    catch (e) { return {}; }
  }
  function save(map) {
    try { localStorage.setItem(KEY, JSON.stringify(map)); } catch (e) {}
  }

  // 应用缩放：切换页面/初始化时调用
  function applyZoom(page) {
    var map = load();
    var z = map[page] || 1;
    var content = document.getElementById("content");
    if (content) {
      content.style.zoom = z;
      content.style.transform = "none"; // 清掉 GSAP 可能残留的 transform，避免和 zoom 叠加
    }
  }

  // 调整当前页缩放
  function adjust(delta) {
    var page = (typeof window.P !== "undefined" && window.P) || "dash";
    var map = load();
    var cur = map[page] || 1;
    var next = Math.min(MAX, Math.max(MIN, Math.round((cur + delta) * 10) / 10));
    if (next === cur) return;
    map[page] = next;
    save(map);
    applyZoom(page);
    // toast 提示当前缩放
    var t = document.getElementById("toast");
    if (t) {
      t.textContent = "页面缩放 " + Math.round(next * 100) + "%";
      t.classList.add("show");
      clearTimeout(window.__zoomToastTimer);
      window.__zoomToastTimer = setTimeout(function() { t.classList.remove("show"); }, 1200);
    }
  }

  // 重置当前页
  function reset() {
    var page = (typeof window.P !== "undefined" && window.P) || "dash";
    var map = load();
    if (map[page]) { delete map[page]; save(map); }
    applyZoom(page);
  }

  // 键盘：Ctrl+= / Ctrl+- / Ctrl+0
  document.addEventListener("keydown", function(e) {
    if (!e.ctrlKey || e.shiftKey || e.altKey || e.metaKey) return;
    var k = e.key;
    if (k === "=" || k === "+") { e.preventDefault(); adjust(STEP); }
    else if (k === "-" || k === "_") { e.preventDefault(); adjust(-STEP); }
    else if (k === "0") { e.preventDefault(); reset(); }
  });

  // 页面切换时恢复缩放（hook 原 N）
  var _origZoomN = window.N;
  if (typeof _origZoomN === "function") {
    window.N = function(page) {
      _origZoomN(page);
      setTimeout(function() { applyZoom(page); }, 60);
    };
  }

  // 暴露给调试
  window.ZoomCtrl = { applyZoom: applyZoom, adjust: adjust, reset: reset };
})();
