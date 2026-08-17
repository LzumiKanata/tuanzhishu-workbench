/* 模块合并 V2（Codex 2026-08-10，按《V2主菜-落地执行单.md》）：荣誉实践（评优/推优/荣誉/活动/实践）· 班费考勤 · 群情报（含通知）· 知识中心（含图谱）。原则：不砍功能砍入口；数据保留，页面合并；Tab 状态记忆 localStorage */
function TAB_SHELL(id, tabs, active) {
  var h = '<div style="display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap">';
  tabs.forEach(function(t) {
    h += '<button class="btn btn-sm' + (t.k === active ? ' btn-primary' : '') + '" data-tab="' + t.k + '" onclick="TABGO(\'' + id + '\',\'' + t.k + '\')">' + t.label + '</button>';
  });
  h += '</div><div id="tabBody_' + id + '">' + TAB_RENDER(id, active) + '</div>';
  return h;
}
function TAB_RENDER(id, k) {
  if (id === "aiwork") {
    if (k === "wiki" || k === "materials" || k === "books" || k === "daily" || k === "social" || k === "ideas" || k === "content") return HLAYER(k);
    return HLAYER("wiki");
  }
  if (id === "rew") {
    if (k === "honors") return RH();
    if (k === "acts") return RX() + RV();
    return RW() + RTU();
  }
  if (id === "knowledge") {
    if (k === "graph") return RGRA();
    if (k === "wiki" || k === "materials" || k === "books" || k === "daily" || k === "social" || k === "ideas" || k === "content") return HLAYER(k);
    return RK();
  }
  return "";
}
function TABGO(id, k) {
  try { localStorage.setItem("tzs_tab_" + id, k); } catch (e) {}
  var box = document.getElementById("tabBody_" + id);
  if (!box) return;
  box.innerHTML = TAB_RENDER(id, k);
  box.parentNode.querySelectorAll("button[data-tab]").forEach(function(b) {
    b.className = "btn btn-sm" + (b.getAttribute("data-tab") === k ? " btn-primary" : "");
  });
  if (id === "knowledge" && k === "graph") {
    setTimeout(function() { try { GZOOM(); GRAPH_SIM(); } catch (e) {} }, 80);
  }
}
function REW() {
  var act = "awards";
  try { act = localStorage.getItem("tzs_tab_rew") || "awards"; } catch (e) {}
  return TAB_SHELL("rew",
    [{ k: "awards", label: "评优推优" }, { k: "honors", label: "荣誉墙" }, { k: "acts", label: "活动实践" }],
    act);
}
function AIWORK() {
  var act = "wiki";
  try { act = localStorage.getItem("tzs_tab_aiwork") || "wiki"; } catch (e) {}
  return TAB_SHELL("aiwork",
    [{ k: "wiki", label: "Wiki层" }, { k: "materials", label: "素材层" }, { k: "books", label: "书架" },
     { k: "daily", label: "每日热点" }, { k: "social", label: "社媒洞察" }, { k: "ideas", label: "灵感库" }, { k: "content", label: "内容中心" }],
    act);
}
function KGTAB() {
  var act = "knowledge";
  try { act = localStorage.getItem("tzs_tab_knowledge") || "knowledge"; } catch (e) {}
  return TAB_SHELL("knowledge",
    [{ k: "graph", label: "知识图谱" }, { k: "wiki", label: "Wiki层" }, { k: "materials", label: "素材层" }, { k: "books", label: "书架" },
     { k: "daily", label: "每日热点" }, { k: "social", label: "社媒洞察" }, { k: "ideas", label: "灵感库" }, { k: "content", label: "内容中心" }],
    act);
}
function RFK() { return RF() + RA(); }
function GRP() { return RGQ() + RAC(); }
function GOTO(p, tab) {
  if (tab) { try { localStorage.setItem("tzs_tab_" + p.replace('review','rew'), tab); } catch (e) {} }
  N(p);
}
window.TZS = window.TZS || {};
window.TZS.modules_tabs = { REW: REW, KGTAB: KGTAB, AIWORK: AIWORK, RFK: RFK, GRP: GRP, GOTO: GOTO, TABGO: TABGO };
