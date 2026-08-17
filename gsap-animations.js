/**
 * 团支书工作台 · GSAP 动画引擎（聚焦优先版 v2 — codx 2026-08-07 20:18 落地，20:20 被团务 v2 覆盖，此备份留档）
 *
 * 原则（响应绳匠批评：华而不实/跳动/难以聚焦）：
 * 1. 干活的面，动画是打扰——只保留「有信息量的瞬时反馈」，砍掉一切表演性动画
 * 2. 页面切换 = 一次性 0.18s 纯淡入（无位移、无 stagger、无弹跳）
 * 3. 统计数字不滚动（数字滚动是华而不实的典型，直接显示）
 * 4. 无限循环动画全砍（粉璃呼吸/背景漂移——一直在动的元素让人无法聚焦）
 * 5. 尊重用户系统动效偏好：prefers-reduced-motion 时 GSAP 完全静默
 */
gsap.registerPlugin(ScrollTrigger);

// ═══ 全局默认：极短、极轻 ═══
gsap.defaults({ ease: "power1.out", duration: 0.18 });

// 系统动效偏好：用户要求减少动效时，GSAP 全部静默
var REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (REDUCED) { gsap.globalTimeline.pause(); }

// ═══ 页面切换：一次性纯淡入（无位移无 stagger，切换瞬间内容即可读）═══
function animatePageEnter() {
  if (REDUCED) return;
  // 内容区整体淡入：不碰 #gwrap（图谱节点呼吸是 CSS 活物感）
  gsap.fromTo("#content > *:not(#gwrap)", 
    { opacity: 0 },
    { opacity: 1, duration: 0.18, stagger: 0.02, ease: "power1.out", clearProps: "opacity" }
  );
}

// ═══ 主题切换：顶栏/侧栏瞬时平滑，无卡片位移 ═══
function animateThemeSwitch() {
  if (REDUCED) return;
  gsap.fromTo(".sidebar", 
    { opacity: 0.7 }, 
    { opacity: 1, duration: 0.25, ease: "power1.out" }
  );
}

// ═══ 弹窗入场：轻微缩放（反馈性，非表演性）═══
function animateModalOpen(modal) {
  if (REDUCED || !modal) return;
  gsap.fromTo(modal,
    { scale: 0.97, opacity: 0 },
    { scale: 1, opacity: 1, duration: 0.2, ease: "power1.out" }
  );
}

// ═══ Toast 提示：淡入淡出（信息传递本身需要）═══
function animateToast(el) {
  if (REDUCED || !el) return;
  gsap.fromTo(el,
    { opacity: 0 },
    { opacity: 1, duration: 0.2, ease: "power1.out" }
  );
  gsap.to(el, {
    opacity: 0, duration: 0.25, ease: "power1.in",
    delay: 1.8, onComplete: function() { el.classList.remove("show"); }
  });
}

// ═══ 按钮按下：极轻缩放反馈（0.05s，几乎感知不到的确认）═══
document.addEventListener("mousedown", function(e) {
  if (REDUCED) return;
  var btn = e.target.closest(".btn, .nav-item, .chip");
  if (!btn) return;
  gsap.to(btn, { scale: 0.98, duration: 0.06, ease: "power1.in", overwrite: "auto" });
});
document.addEventListener("mouseup", function(e) {
  if (REDUCED) return;
  var btn = e.target.closest(".btn, .nav-item, .chip");
  if (!btn) return;
  gsap.to(btn, { scale: 1, duration: 0.1, ease: "power1.out", overwrite: "auto" });
});

// ═══ 每主题短促元素动画（第四维：动画跟主题性格走，一个主题一个，≤0.4s 一次性）═══
function animateThemeElement() {
  if (REDUCED) return;
  var theme = document.documentElement.getAttribute("data-theme") || "paper";
  if (theme === "bamboo") {
    // 竹青：竹节生长——侧栏竹片竖线从节处向上淡入
    gsap.fromTo(".sidebar .nav-item",
      { opacity: 0.5, x: -4 },
      { opacity: 1, x: 0, duration: 0.3, ease: "power1.out", stagger: 0.02, clearProps: "transform" }
    );
  } else if (theme === "night") {
    // 墨夜：星光渐亮——顶部柔光起，金线收边浮现
    gsap.fromTo(".sidebar",
      { opacity: 0.75, borderRightColor: "rgba(212,168,92,0)" },
      { opacity: 1, borderRightColor: "rgba(212,168,92,.15)", duration: 0.4, ease: "power1.out", clearProps: "all" }
    );
  } else if (theme === "codex") {
    // Codex：扫描出稿——内容区一次扫描线闪过（一次，不循环）
    var sc = document.createElement("div");
    sc.style.cssText = "position:fixed;left:0;right:0;top:0;height:2px;background:rgba(46,59,221,.35);pointer-events:none;z-index:998";
    document.body.appendChild(sc);
    gsap.fromTo(sc,
      { y: -10, opacity: 0 },
      { y: "100vh", opacity: 0.7, duration: 0.4, ease: "power2.in", clearProps: "all",
        onComplete: function() { sc.remove(); } }
    );
  } else if (theme === "pink") {
    // 粉璃：柔光聚集——侧栏一道淡粉光晕收敛
    gsap.fromTo(".sidebar",
      { boxShadow: "0 0 0 rgba(224,96,128,0)" },
      { boxShadow: "0 0 24px rgba(224,96,128,.12)", duration: 0.4, ease: "power1.out", clearProps: "boxShadow" }
    );
  }
  // 宣纸/梅红：不加元素动画，保持最克制（纸和花本身安静）
}

// ═══ 路由拦截：页面切换触发入场（只做淡入，无滚动动画）═══
var _origNav = typeof N === "function" ? N : null;
if (_origNav) {
  N = function(page) {
    _origNav(page);
    setTimeout(animatePageEnter, 50);
    setTimeout(animateThemeElement, 90);
  };
}

console.log("🎬 GSAP 动画引擎就绪（聚焦优先版，动效偏好=" + (REDUCED ? "reduced" : "full") + "）");
