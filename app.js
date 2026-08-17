/* app.js 拆分后剩余部分(bootstrap 角色):W 注册表 + 导航绑定 + 顶层执行 */
/* 业务函数已拆入 core/ 与 modules/,加载顺序见 index.html */








/* 第九刀：关系图谱（模块地图 + 成员网络，Obsidian 式可视化） */

/* 成员网络 · 力导向引擎（2026-08-06 hermes：d3-force 本地化，Obsidian 式物理感） */

/* 总览 v2 配套：进度环 / 支部架构 / 本月任务 / 团务入口 */
/* 总览一键记录实践（VOLQ/VOLS 全局，2026-08-05 诗宝；LRN 是 RV 内部局部函数，内联 onclick 全局调用不可达，故新建全局版） */


/* ── 工作群情报 GRP 系列（2026-08-05 晚 诗宝改版：静态→可点）── */
/* 数据源：GRP_DATA 独立成源，明天团务活数据同形状替换即可，渲染层不写死来源 */
/* GRP_DATA 真实数据见 grp_data.js（2026-08-06 hermes：知识库→工作台一跳，07-31 快照；团务 cron 同步后重新生成） */
/* ── 全局搜索（GS/GSGO/PAGES，2026-08-05 诗宝）── */

NAVR();
FONTR();
document.addEventListener("click",function(){var b=document.getElementById("moreBox");if(b)b.style.display="none";});
/* ---- 第四刀：导入/导出/备份/AI 窗口 ---- */


function FS(){
  if (document.fullscreenElement || document.webkitFullscreenElement) {
    (document.exitFullscreen || document.webkitExitFullscreen || function(){}).call(document);
  } else {
    var el = document.documentElement;
    (el.requestFullscreen || el.webkitRequestFullscreen || function(){}).call(el).catch(function(){ Q("全屏不可用","info"); });
  }
}

var W={dash:RD,health:RHE,graph:RGRA,members:RM,meetings:RMT,students:RS,classfund:RFK,attendance:RA,classact:RX,activities:RAC,volunteer:RV,personal:RP,smart:RG,ai:RI,photos:RPH,knowledge:KGTAB,aiwork:AIWORK_HOME,wiki:function(){return HLAYER('wiki');},materials:function(){return HLAYER('materials');},books:function(){return HLAYER('books');},daily:function(){return HLAYER('daily');},social:function(){return HLAYER('social');},ideas:function(){return HLAYER('ideas');},content:function(){return HLAYER('content');},journey:RJ,tuitui:RTU,awards:REW,honors:RH,groups:GRP,todos:RT};

document.querySelectorAll(".nav-item").forEach(function(n){n.addEventListener("click",function(){N(n.dataset.page);});});
document.addEventListener("keydown",function(e){if(e.ctrlKey&&e.shiftKey&&(e.key==="t"||e.key==="T")){e.preventDefault();openAiWindow();}});
var dt=document.querySelector("#todayDate");if(dt)dt.textContent=new Date().toLocaleDateString("zh-CN",{year:"numeric",month:"long",day:"numeric",weekday:"long"});
V();N("dash");U();
(function(){try{(function(){var t=localStorage.getItem("tzs_theme");if(t==="ai"){document.documentElement.setAttribute("data-theme","ai");}else if(t==="paper"){document.documentElement.removeAttribute("data-theme");}else if(t==="bamboo"||t==="plum"||t==="night"||t==="pink"||t==="codex"||t==="tear"){document.documentElement.setAttribute("data-theme",t);}/* 无偏好：保留 index.html 设置的默认（ai） */})()}catch(e){}})();
(function(){var c=document.querySelector(".content");var b=document.getElementById("backTop");if(!c||!b)return;c.addEventListener("scroll",function(){if(c.scrollTop>300){b.classList.add("show");}else{b.classList.remove("show");}});})();
(function(){var b=document.getElementById("boot");if(b){b.style.opacity="0";setTimeout(function(){if(b&&b.parentNode)b.parentNode.removeChild(b);},200);}})();



/* ── 手机端侧边栏抽屉（2026-08-10 团务）── */
function toggleSidebar(){
  var s=document.querySelector(".sidebar--xiaodai");
  var o=document.getElementById("sidebarOverlay");
  if(!s)return;
  var open=s.classList.toggle("sidebar--open");
  if(o){if(open){o.classList.add("sidebar-overlay--show");}else{o.classList.remove("sidebar-overlay--show");}}
}
function closeSidebar(){
  var s=document.querySelector(".sidebar--xiaodai");
  var o=document.getElementById("sidebarOverlay");
  if(s)s.classList.remove("sidebar--open");
  if(o)o.classList.remove("sidebar-overlay--show");
}
/* 导航后自动关侧栏（手机端） */
(function(){
  var origN=window.N;
  window.N=function(p){
    closeSidebar();
    if(origN)origN(p);
  };
})();
