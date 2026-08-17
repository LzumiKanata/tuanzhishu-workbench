/* Hermes 数据桥 + 知识星图（移植 Personal AI Workbench 优点）
   数据源：merge-bridge/bridge.py（8765）→ 小马儿-直接调用 / 团务档案 / Obsidian 知识库 / 微信明文
   原则：桥不可用时优雅降级为纯本地，不白屏不报错 */
var HERMES_API = "http://127.0.0.1:8765";
var HERMES_CACHE = {};
function HGET(p, ttl) {
  ttl = ttl || 60000;
  var k = p, now = Date.now();
  if (HERMES_CACHE[k] && now - HERMES_CACHE[k].t < ttl) return Promise.resolve(HERMES_CACHE[k].v);
  var ac = new AbortController();
  var timer = setTimeout(function(){ ac.abort(); }, 3500);
  return fetch(HERMES_API + p, { signal: ac.signal })
    .then(function(r){ if (!r.ok) throw new Error("http " + r.status); return r.json(); })
    .then(function(v){ HERMES_CACHE[k] = { t: now, v: v }; return v; })
    .catch(function(){ return null; })
    .then(function(v){ clearTimeout(timer); return v; });
}
function H_AVAIL() { return HGET("/api/ping", 5000).then(function(v){ return !!(v && v.status === "ok"); }); }
function H_PEOPLE() { return HGET("/api/people"); }
function H_ORGS() { return HGET("/api/org"); }
function H_KNOWLEDGE(q) { return HGET("/api/knowledge/search?q=" + encodeURIComponent(q || "")); }
function H_PERSON(name) { return HGET("/api/people/" + encodeURIComponent(name)); }
function H_WXSTATS() { return HGET("/api/wx/stats"); }

/* ═══ 知识星图（Workbench 风格：单色轴 + 明度分层 + 节点大小按度 + 检查器） ═══ */
var HK_STATE = { data: null, type: "all", q: "" };
function HK_TYPE_META(t) {
  var m = {
    module: { c: "var(--primary-dark)", label: "模块", code: "MOD" },
    person: { c: "var(--primary)", label: "人物", code: "PPL" },
    org: { c: "var(--gold)", label: "组织", code: "ORG" },
    tpl: { c: "var(--text3)", label: "模板", code: "TPL" }
  };
  return m[t] || { c: "var(--text3)", label: "其他", code: "ETC" };
}
function HK_NODE_RADIUS(n) {
  var degree = Math.max(0, Number(n.degree) || 0);
  var base = n.type === "module" ? 22 : (n.type === "person" ? 14 : (n.type === "org" ? 13 : 9));
  return Math.min(30, base + Math.sqrt(degree) * 2.2);
}
function HK_BUILD() {
  /* 团务模块节点 */
  var modules = [
    { id: "m_tz", label: "团员台账", type: "module", page: "members" },
    { id: "m_hy", label: "三会一课", type: "module", page: "meetings" },
    { id: "m_ry", label: "荣誉实践", type: "module", page: "awards" },
    { id: "m_bf", label: "班费考勤", type: "module", page: "classfund" },
    { id: "m_qb", label: "群情报", type: "module", page: "groups" },
    { id: "m_zs", label: "知识中心", type: "module", page: "knowledge" },
    { id: "m_mb", label: "norm", type: "module", page: "ai" }
  ];
  var nodes = modules.map(function(m, i){ return { id: m.id, label: m.label, type: m.type, page: m.page, degree: 0, index: i }; });
  var links = [];
  function link(a, b){ links.push({ source: a, target: b }); }
  /* 模块流程连线 */
  link("m_tz", "m_ry"); link("m_tz", "m_hy"); link("m_tz", "m_bf");
  link("m_hy", "m_ry"); link("m_ry", "m_qb"); link("m_qb", "m_zs");
  link("m_zs", "m_mb"); link("m_mb", "m_tz");

  var people = HK_STATE.data && HK_STATE.data.people || [];
  var orgs = HK_STATE.data && HK_STATE.data.orgs || [];
  var kls = HK_STATE.data && HK_STATE.data.knowledge || [];
  people.forEach(function(p){ nodes.push({ id: "p_" + p.name, label: p.name, type: "person", brief: p.brief || "", degree: 0 }); });
  orgs.forEach(function(o){ if (o.private) return; nodes.push({ id: "o_" + o.name, label: o.name, type: "org", degree: 0 }); });
  kls.forEach(function(k){ if (k.kind === "模板") nodes.push({ id: "t_" + k.name, label: k.name, type: "tpl", degree: 0 }); });

  /* 人物 → 班级组织 */
  var classOrg = orgs.filter(function(o){ return o.name.indexOf("通信工程X班") >= 0; })[0];
  if (classOrg) {
    people.forEach(function(p){ link("p_" + p.name, "o_" + classOrg.name); });
  }
  /* 模板 → 模块（按关键词） */
  kls.forEach(function(k){
    if (k.kind !== "模板") return;
    var kw = k.name;
    if (/会议|大会|团课|小组/.test(kw)) link("t_" + k.name, "m_hy");
    else if (/荣誉|评优|推优/.test(kw)) link("t_" + k.name, "m_ry");
    else if (/班费|财务|记账/.test(kw)) link("t_" + k.name, "m_bf");
    else link("t_" + k.name, "m_zs");
  });
  /* 度数 */
  var deg = {};
  nodes.forEach(function(n){ deg[n.id] = 0; });
  links.forEach(function(l){ if (deg[l.source] != null) deg[l.source]++; if (deg[l.target] != null) deg[l.target]++; });
  nodes.forEach(function(n){ n.degree = deg[n.id] || 0; n.r = HK_NODE_RADIUS(n); });
  return { nodes: nodes, links: links };
}
function HK_RENDER() {
  var wrap = document.getElementById("gwrap");
  if (!wrap) return;
  var gd = HK_BUILD();
  var W2 = 960, H2 = 600;
  var nodes = gd.nodes.filter(function(n){ return HK_STATE.type === "all" || n.type === HK_STATE.type; });
  var ids = {};
  nodes.forEach(function(n){ ids[n.id] = 1; });
  var links = gd.links.filter(function(l){ return ids[l.source] && ids[l.target]; });
  nodes.forEach(function(n, i){ n.index = i; });
  window._gdata = { nodes: nodes, links: links };
  var h = '<svg id="gnet" viewBox="0 0 ' + W2 + ' ' + H2 + '" data-w="' + W2 + '" data-h="' + H2 + '" style="width:100%;height:auto;display:block;background:transparent">';
  links.forEach(function(l, i){ h += '<line id="gl_' + i + '" x1="0" y1="0" x2="0" y2="0" stroke="var(--line)" stroke-width="1" opacity=".7"/>'; });
  nodes.forEach(function(n, i){
    var tm = HK_TYPE_META(n.type);
    h += '<g id="gn_' + i + '" transform="translate(480,300)" opacity="0">';
    h += '<circle r="' + n.r + '" fill="' + tm.c + '" fill-opacity=".16" stroke="' + tm.c + '" stroke-width="1.4" style="cursor:pointer"/>';
    h += '<text y="' + (n.r + 12) + '" text-anchor="middle" font-size="10.5" fill="var(--text2)" style="pointer-events:none">' + E(n.label.length > 14 ? n.label.slice(0, 13) + "…" : n.label) + '</text>';
    h += '</g>';
  });
  h += '</svg>';
  wrap.innerHTML = h;
  /* 节点点击 → 检查器 */
  nodes.forEach(function(n, i){
    var g = document.getElementById("gn_" + i);
    if (!g) return;
    g.addEventListener("click", function(ev){ ev.stopPropagation(); HK_INSPECT(n); });
    g.addEventListener("dblclick", function(){ if (n.page) N(n.page); });
  });
  HK_STATE.rendered = 1;
  if (window.G_SIM) { window.G_SIM.stop(); window.G_SIM = null; }
  if (window.GZOOM) window.GZOOM();
  if (window.GRAPH_SIM) { try { window.GRAPH_SIM(); } catch (e) {} }
  /* 检查器容器 */
  var old = document.getElementById("hkInsp");
  if (old) old.remove();
  var insp = document.createElement("div");
  insp.id = "hkInsp";
  insp.className = "hk-inspector";
  insp.innerHTML = '<div style="font-size:11px;color:var(--text3);margin-bottom:4px">知识星图</div><div style="font-size:13px;color:var(--text2)">点击节点查看详情 · 双击直达页面</div>';
  wrap.style.position = "relative";
  wrap.appendChild(insp);
}
function HK_FILTER(t) {
  HK_STATE.type = t;
  var btns = document.querySelectorAll("#gwrap button[data-hk]");
  btns.forEach(function(b){ b.className = "btn btn-sm" + (b.getAttribute("data-hk") === t ? " btn-primary" : ""); });
  HK_RENDER();
}
function HK_INSPECT(n) {
  var insp = document.getElementById("hkInsp");
  if (!insp) return;
  var tm = HK_TYPE_META(n.type);
  var h = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px"><b style="font-size:14px">' + E(n.label) + '</b><span class="tag" style="background:var(--primary-soft);color:var(--primary)">' + tm.label + '</span></div>';
  h += '<div style="font-size:11px;color:var(--text3);margin-bottom:8px">' + tm.code + ' · 连接 ' + (n.degree || 0) + ' 条</div>';
  if (n.type === "module" && n.page) {
    h += '<button class="btn btn-sm btn-primary" onclick="N(\'' + n.page + '\')">打开页面</button>';
  }
  if (n.type === "person") {
    h += '<div style="font-size:12px;color:var(--text2);line-height:1.6;margin-bottom:8px">' + E(n.brief || "人物画像") + '</div>';
    h += '<button class="btn btn-sm" onclick="HPDETAIL(\'' + E(n.label).replace(/'/g, "\\'") + '\')">查看画像</button>';
  }
  if (n.type === "org") {
    h += '<div style="font-size:12px;color:var(--text2);line-height:1.6">组织节点 · 工作群情报见「群情报」页</div>';
  }
  if (n.type === "tpl") {
    h += '<div style="font-size:12px;color:var(--text2);line-height:1.6">团务档案参考模板，可到知识中心检索</div>';
  }
  insp.innerHTML = h;
}
function HPDETAIL(name) {
  H_PERSON(name).then(function(p){
    var insp = document.getElementById("hkInsp");
    if (!insp || !p) return;
    var c = p.content || "";
    insp.innerHTML = '<div style="font-size:11px;color:var(--text3);margin-bottom:4px">人物画像</div><b style="font-size:14px">' + E(p.name) + '</b>'
      + (p.messages != null ? '<div style="font-size:11px;color:var(--text2);margin:4px 0">消息量 ' + p.messages + '</div>' : "")
      + '<div style="font-size:11.5px;color:var(--text2);line-height:1.65;margin-top:6px;white-space:pre-wrap;max-height:230px;overflow-y:auto">' + E(c.slice(0, 900)) + '</div>';
  });
}
function HKLOAD() {
  var wrap = document.getElementById("gwrap");
  if (!wrap) return;
  if (HK_STATE.data && HK_STATE.rendered) { HK_RENDER(); return; }
  wrap.innerHTML = '<div style="padding:30px;text-align:center;color:var(--text3);font-size:13px">正在连接知识库…（Hermes 桥 8765）</div>';
  Promise.all([H_PEOPLE(), H_ORGS(), H_KNOWLEDGE(""), H_AVAIL()]).then(function(arr){
    var people = arr[0] || [], orgs = arr[1] || [], kls = arr[2] || [], avail = arr[3];
    HK_STATE.data = { people: people, orgs: orgs, knowledge: kls };
    var h = '<div style="display:flex;gap:6px;margin-bottom:10px;flex-wrap:wrap">'
      + ['all', 'module', 'person', 'org', 'tpl'].map(function(t){
        var label = { all: "全部", module: "模块", person: "人物", org: "组织", tpl: "模板" }[t];
        return '<button class="btn btn-sm' + (t === "all" ? " btn-primary" : "") + '" data-hk="' + t + '" onclick="HK_FILTER(\'' + t + '\')">' + label + '</button>';
      }).join("")
      + (avail ? '<span style="font-size:11px;color:var(--ok);align-self:center;margin-left:auto">● 已连接 Hermes 知识库</span>'
                : '<span style="font-size:11px;color:var(--text3);align-self:center;margin-left:auto">Hermes 桥未启动，仅显示工作台模块</span>')
      + '</div>';
    wrap.insertAdjacentHTML("afterbegin", h);
    HK_RENDER();
  });
}
function HKB() {
  /* 知识中心 Hermes 面板（桥可用时显示） */
  var h = '<div class="card" style="margin-bottom:14px"><div class="card-title">Hermes 知识库 <span style="font-size:11px;color:var(--text3);font-weight:400">小马儿-直接调用 · 团务档案 · Obsidian（桥 8765）</span></div>'
    + '<div style="display:flex;gap:8px;margin-bottom:12px"><input id="hkQ" placeholder="搜 人物 / 组织 / 模板 / 笔记…" style="flex:1;padding:9px 12px;border:1px solid var(--line);border-radius:8px;font-size:13px;background:var(--card);color:var(--text)" onkeydown="if(event.key===\'Enter\')HKS()"><button class="btn btn-primary" onclick="HKS()">搜索</button></div>'
    + '<div id="hkRes" style="font-size:12px;color:var(--text3)">正在连接知识库…</div></div>';
  return h;
}
function HKS() {
  var q = (document.getElementById("hkQ") && document.getElementById("hkQ").value || "").trim();
  var box = document.getElementById("hkRes");
  if (!box) return;
  box.innerHTML = "搜索中…";
  Promise.all([H_KNOWLEDGE(q), q ? HGET("/api/vault/search?q=" + encodeURIComponent(q)) : Promise.resolve(null)]).then(function(arr){
    var kls = arr[0] || [], vault = arr[1] || [];
    var h = "";
    if (kls.length || vault.length) {
      h += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:10px">';
      kls.forEach(function(k){
        h += '<div style="border:1px solid var(--line);border-radius:10px;padding:10px 12px;background:var(--card)"><div style="display:flex;justify-content:space-between;gap:6px"><b style="font-size:12.5px">' + E(k.name) + '</b><span class="tag tag-q" style="font-size:10px">' + E(k.kind) + '</span></div><div style="font-size:11px;color:var(--text3);margin-top:3px">' + E(k.source || "") + '</div></div>';
      });
      vault.forEach(function(v){
        h += '<div style="border:1px solid var(--line);border-radius:10px;padding:10px 12px;background:var(--card)"><b style="font-size:12.5px">' + E(v.name) + '</b><div style="font-size:11px;color:var(--text3);margin-top:3px;line-height:1.5">' + E((v.snippet || "").slice(0, 90)) + '</div></div>';
      });
      h += '</div>';
    } else {
      h = '<div style="padding:14px;text-align:center;color:var(--text3)">没有匹配结果，或 Hermes 桥未启动（' + HERMES_API + '）</div>';
    }
    box.innerHTML = h;
  });
}
function HINSIGHT() {
  /* 群情报 · 人物洞察（微信明文 13 人） */
  var h = '<div class="card" style="margin-bottom:14px"><div class="card-title">人物洞察 <span style="font-size:11px;color:var(--text3);font-weight:400">微信明文 · 消息量排行 · 性格标签</span></div><div id="wxIns" style="font-size:12px;color:var(--text3)">加载中…</div></div>';
  H_WXSTATS().then(function(w){
    var box = document.getElementById("wxIns");
    if (!box) return;
    if (!w || !w.all_people || !w.all_people.length) {
      box.innerHTML = "Hermes 桥未启动，暂无人像数据";
      return;
    }
    var max = Math.max.apply(null, w.all_people.map(function(p){ return p.messages; })) || 1;
    var h2 = '<div style="font-size:11px;color:var(--text2);margin-bottom:8px">共 ' + w.total_people + ' 人 · ' + w.total_messages + ' 条消息 · ' + w.groups + ' 个组织</div>';
    w.all_people.slice(0, 8).forEach(function(p){
      var pct = Math.round(p.messages / max * 100);
      h2 += '<div style="margin-bottom:8px"><div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:3px"><span>' + E(p.name) + '</span><span style="color:var(--text2);font-variant-numeric:tabular-nums">' + p.messages + '</span></div>'
        + '<div style="height:6px;border-radius:999px;background:var(--primary-soft);overflow:hidden"><i style="display:block;height:100%;width:' + pct + '%;background:var(--primary);border-radius:999px"></i></div>'
        + (p.brief ? '<div style="font-size:10.5px;color:var(--text3);margin-top:2px">' + E(p.brief) + '</div>' : "")
        + '</div>';
    });
    box.innerHTML = h2;
  });
  return h;
}
window.TZS = window.TZS || {};
window.TZS.modules_hermes = { HKLOAD: HKLOAD, HKB: HKB, HKS: HKS, HINSIGHT: HINSIGHT, HGET: HGET };

/* ═══ Workbench 七层级移植：Wiki层 / 素材层 / 书架 / 每日热点 / 社媒洞察 / 灵感库 / 内容中心 ═══ */
var HK_LAYERS = {
  wiki:     { label: "Wiki 层", eyebrow: "KNOWLEDGE LAYER", root: "personal", dirs: ["wiki/concepts", "wiki/frameworks"], desc: "结构化知识：概念 · 框架（个人AI工作台）" },
  materials:{ label: "素材层", eyebrow: "RAW MATERIALS", root: "personal", dirs: ["10_raw/articles", "10_raw/my-thoughts"], desc: "原始素材：文章 · 思考笔记" },
  books:    { label: "书架", eyebrow: "BOOKSHELF", root: "personal", books: true, desc: "书籍与章节 · 记录阅读进度" },
  daily:    { label: "每日热点", eyebrow: "DAILY HOT", root: "personal", recent: true, desc: "最近更新的笔记与事件" },
  social:   { label: "社媒洞察", eyebrow: "SOCIAL INSIGHTS", root: "personal", dirs: ["10_raw/social-insights"], desc: "社媒分析报告" },
  ideas:    { label: "灵感库", eyebrow: "IDEA VAULT", root: "personal", dirs: ["40_topics/ideas"], desc: "灵感与选题" },
  content:  { label: "内容中心", eyebrow: "CONTENT STUDIO", root: "personal", dirs: ["30_self_media"], desc: "内容生产状态与账号数据" }
};
var HK_SEL = {};
function HESC(s) { return String(s == null ? "" : s).replace(/'/g, "\\'"); }
function HLAYER(kind) {
  var meta = HK_LAYERS[kind] || HK_LAYERS.wiki;
  var h = '<div class="card" style="margin-bottom:14px"><div id="hLayer" style="font-size:12px;color:var(--text3)">加载中…</div></div>';
  setTimeout(function(){ HLAYER_LOAD(kind); }, 0);
  return h;
}
function HLAYER_LOAD(kind) {
  var box = document.getElementById("hLayer");
  if (!box) return;
  var meta = HK_LAYERS[kind] || HK_LAYERS.wiki;
  var head = '<div style="margin-bottom:14px"><div style="font-size:10.5px;letter-spacing:.16em;color:var(--primary);font-weight:600">' + meta.eyebrow + '</div>'
    + '<div style="font-size:20px;font-family:var(--font-serif);margin:3px 0 4px;color:var(--text)">' + meta.label + '</div>'
    + '<div style="font-size:12px;color:var(--text2)">' + meta.desc + '</div></div>';
  box.innerHTML = head + '<div id="hlGroups" style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px"></div><div id="hlItems"></div>';
  var groupsEl = document.getElementById("hlGroups"), itemsEl = document.getElementById("hlItems");
  if (!groupsEl || !itemsEl) return;
  if (meta.books) {
    groupsEl.innerHTML = '<span style="font-size:11px;color:var(--text3)">个人AI工作台 · 10_raw/books</span>';
    HL_BOOKS(itemsEl);
    return;
  }
  if (kind === "content") {
    HL_CONTENT(itemsEl);
    return;
  }

  var jobs = [];
  if (meta.recent) {
    jobs.push(HGET("/api/vault/tree").then(function(t){ return { key: "recent", data: t }; }));
  } else {
    meta.dirs.forEach(function(d){ jobs.push(HGET("/api/vault/list?path=" + encodeURIComponent(d) + "&root=" + (meta.root || "obsidian")).then(function(r){ return { key: d, data: r }; })); });
  }
  Promise.all(jobs).then(function(results){
    var all = [];
    results.forEach(function(r){
      var d = r.data;
      if (!d) return;
      if (r.key === "recent") {
        all = (d.recent || []).map(function(f){ f._dir = "最近更新"; return f; });
      } else {
        (d.files || []).forEach(function(f){ f._dir = r.key; all.push(f); });
      }
    });
    /* 分组统计（Workbench MetricStat 风格） */
    var groups = {};
    all.forEach(function(f){ var g = f._dir; groups[g] = (groups[g] || 0) + 1; });
    var keys = Object.keys(groups);
    var sel = HK_SEL[kind] || "all";
    var gHtml = '<button class="hl-group' + (sel === "all" ? " hl-group--on" : "") + '" onclick="HL_FILTER(\'' + kind + '\',\'all\')"><b>' + all.length + '</b><span>全部</span></button>';
    keys.forEach(function(k){
      gHtml += '<button class="hl-group' + (sel === k ? " hl-group--on" : "") + '" data-hg="' + HESC(k) + '" onclick="HL_FILTER(\'' + kind + '\',\'' + HESC(k) + '\')"><b>' + groups[k] + '</b><span>' + E(k) + '</span></button>';
    });
    groupsEl.innerHTML = gHtml;
    HL_ITEMS(kind, all, sel, itemsEl);
  });
}
function HL_FILTER(kind, g) {
  HK_SEL[kind] = g;
  var groupsEl = document.getElementById("hlGroups"), itemsEl = document.getElementById("hlItems");
  if (groupsEl) groupsEl.querySelectorAll(".hl-group").forEach(function(b){
    var v = b.getAttribute("data-hg") || "all";
    b.className = "hl-group" + (v === g ? " hl-group--on" : "");
  });
  if (itemsEl) itemsEl.innerHTML = "加载中…";
  HLAYER_LOAD(kind);
}
function HL_ITEMS(kind, all, sel, el) {
  var list = sel === "all" ? all : all.filter(function(f){ return f._dir === sel; });
  list.sort(function(a, b){ return String(b.modified || "").localeCompare(String(a.modified || "")); });
  if (kind === "books") { HL_BOOKS(el); return; }
  if (kind === "daily") { el.innerHTML = HL_DAILY(list); return; }
  if (kind === "ideas") { HL_IDEAS(el, list); return; }
  if (kind === "ideas") { HL_IDEAS(el, list); return; }
  var h = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:10px">';
  list.slice(0, 80).forEach(function(f){ h += HL_CARD(f); });
  h += '</div>';
  el.innerHTML = h || '<div style="color:var(--text3)">该分组暂无内容</div>';
}
function HL_CARD(f) {
  var t = f.title || f.name;
  var typeTag = f.type ? '<span class="tag tag-q" style="font-size:10px;margin-left:6px">' + E(f.type) + '</span>' : "";
  var tag = f.tags ? '<div style="font-size:10px;color:var(--text3);margin-top:4px">' + E(String(f.tags).slice(0, 40)) + '</div>' : "";
  return '<div class="hl-card" onclick="HREAD(\'' + HESC(f.path) + '\')">'
    + '<div class="hl-card__t">' + E(t) + typeTag + '</div>'
    + '<div class="hl-card__s">' + E(f.first || "（无摘要）") + '</div>'
    + tag
    + '<div class="hl-card__d">' + E(String(f.modified || "").slice(0, 10)) + (f.status ? " · " + E(f.status) : "") + '</div></div>';
}
function HL_BOOKS(el) {
  el.innerHTML = "加载中…";
  HGET("/api/books").then(function(r){
    if (!r || !r.books || !r.books.length) { el.innerHTML = '<div style="color:var(--text3)">暂无书籍</div>'; return; }
    var h = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px">';
    r.books.forEach(function(bk){
      var done = 0, total = bk.chapters.length || 1;
      try { done = parseInt(localStorage.getItem("tzs_book_" + bk.dir) || "0", 10) || 0; } catch (e) {}
      h += '<div class="hl-book" onclick="HREAD(\'' + HESC((bk.chapters[0] || { path: "" }).path) + '\',true)">'
        + '<div style="display:flex;gap:12px;align-items:center;margin-bottom:8px">'
        + '<span style="width:42px;height:56px;border-radius:6px;background:var(--primary-soft);border:1px solid var(--line);display:flex;align-items:center;justify-content:center;font-size:9px;color:var(--primary);text-align:center;padding:2px;flex-shrink:0">' + E(bk.title.slice(0, 6)) + '</span>'
        + '<div style="flex:1;min-width:0"><div style="font-size:14px;font-weight:600">' + E(bk.title) + '</div>'
        + '<div style="font-size:11px;color:var(--text3);margin-top:2px">' + bk.chapters.length + ' 个章节 · ' + (done > 0 ? '已读 ' + Math.round(done / total * 100) + '%' : '未开始') + '</div></div></div>'
        + '<div style="border-top:1px dashed var(--line);padding-top:6px">' + bk.chapters.slice(0, 5).map(function(c, i){
          var ck = "tzs_book_" + bk.dir + "_" + i, cd = 0;
          try { cd = parseInt(localStorage.getItem(ck) || "0", 10) || 0; } catch (e) {}
          return '<div style="font-size:11.5px;padding:3px 0;display:flex;justify-content:space-between;gap:8px;cursor:pointer" onclick="event.stopPropagation();HL_CHAPTER(\'' + HESC(c.path) + '\',\'' + HESC(bk.dir) + '\',' + i + ',' + (bk.source === 'hermes' ? '\'hermes\'' : '\'\'') + ')"><span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + (i + 1) + '. ' + E(c.title || c.name) + '</span>' + (cd ? '<span style="color:var(--ok);font-size:10px">✓</span>' : '') + '</div>';
        }).join("") + (bk.chapters.length > 5 ? '<div style="font-size:10.5px;color:var(--text3);padding:3px 0">还有 ' + (bk.chapters.length - 5) + ' 章…</div>' : '') + '</div></div>';
    });
    h += '</div>';
    el.innerHTML = h;
  });
}
function HL_CHAPTER(file, book, idx, source) {
  try { localStorage.setItem("tzs_book_" + book + "_" + idx, "1"); } catch (e) {}
  if (source === "hermes") { HWREAD(file); return; }
  HREAD(file, true);
}
function HWREAD(rel) {
  HGET("/api/wiki/read?source=hermes&file=" + encodeURIComponent(rel)).then(function(r){
    if (!r || r.error || r.content == null) { Q("读取失败", "err"); return; }
    var m = document.getElementById("_modal");
    if (!m) {
      m = document.createElement("div"); m.id = "_modal";
      m.style = "position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:999;display:flex;align-items:center;justify-content:center";
      m.onclick = function(e){ if (e.target === this) this.remove(); };
      document.body.appendChild(m);
    }
    m.innerHTML = '<div style="background:var(--card);border-radius:var(--r);padding:20px;width:720px;max-width:94vw;max-height:86vh;overflow-y:auto;box-shadow:var(--shadow-lg)" onclick="event.stopPropagation()">'
      + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px"><b style="font-family:var(--font-serif);font-size:15px">' + E(rel.split("/").pop().replace(".md", "")) + '</b><button class="btn btn-sm" onclick="this.closest(\'#_modal\').remove()">关闭</button></div>'
      + '<div style="font-size:13px;color:var(--text);line-height:1.8;white-space:pre-wrap">' + E(r.content) + '</div></div>';
    m.style.display = "flex";
  });
}


function HL_CONTENT(el) {
  el.innerHTML = "加载中…";
  Promise.all([HGET("/api/vault/list?path=40_topics/ideas&root=personal"), HGET("/api/content")]).then(function(arr){
    var ideas = (arr[0] && arr[0].files) || [];
    var content = arr[1] || {};
    var cur = content.current || content.douyin || {};
    var published = (cur.works || (cur.douyin && cur.douyin.works) || []).map(function(w){
      return { id: w.id || w.title || "", t: w.title || w.name || "未命名", s: (w.contentLine || w.format || "") + (w.views ? " · " + w.views + " 播放" : ""), d: String(w.publishedAt || "").slice(0, 10), stage: w.reviewStatus || "公开" };
    });
    var mine = [];
    try { mine = JSON.parse(localStorage.getItem("tzs_ideas") || "[]"); } catch (e) {}
    var pipe = {};
    try { pipe = JSON.parse(localStorage.getItem("tzs_pipeline") || "{}"); } catch (e) {}
    function stageOf(id) { return pipe[id] || "candidate"; }
    function card(id, t, sub, d, tag, st) {
      var stColor = st === "published" ? "#16A34A" : st === "working" ? "#D97706" : "#7C3AED";
      var nextBtn = st === "candidate" ? '<button class="btn btn-xs" onclick="HL_PIPE(\'' + HESC(id) + '\',\'working\')">→ 制作中</button>'
        : st === "working" ? '<button class="btn btn-xs" onclick="HL_PIPE(\'' + HESC(id) + '\',\'published\')">→ 已发布</button><button class="btn btn-xs" onclick="HL_PIPE(\'' + HESC(id) + '\',\'candidate\')">← 候选</button>'
        : '<button class="btn btn-xs" onclick="HL_PIPE(\'' + HESC(id) + '\',\'candidate\')">← 候选</button>';
      return '<div style="border:1px solid var(--line-strong);border-left:3px solid ' + stColor + ';border-radius:10px;background:var(--surface);padding:11px 12px;margin-bottom:9px;box-shadow:var(--shadow-sm)">'
        + '<div style="font-size:13px;font-weight:600;color:var(--text);line-height:1.4">' + E(t) + '</div>'
        + (sub ? '<div style="font-size:11.5px;color:var(--text2);margin-top:4px;line-height:1.55">' + E(sub) + '</div>' : "")
        + '<div style="display:flex;gap:6px;align-items:center;margin-top:8px;flex-wrap:wrap">'
        + (tag ? '<span class="tag" style="font-size:10px;background:var(--accent-wash);color:var(--accent-strong)">' + E(tag) + '</span>' : "")
        + '<span style="font-size:10px;color:var(--text3);font-family:var(--font-mono)">' + E(d || "") + '</span>'
        + '<span style="margin-left:auto;display:flex;gap:5px">' + nextBtn + '</span></div></div>';
    }
    var cols = {
      candidate: { label: "候选", color: "#7C3AED", items: [] },
      working: { label: "制作中", color: "#D97706", items: [] },
      published: { label: "已发布", color: "#16A34A", items: [] }
    };
    ideas.forEach(function(f){ cols.candidate.items.push(card("kb_" + f.path, f.title || f.name, f.first || "", String(f.modified || "").slice(0, 10), "知识库灵感", stageOf("kb_" + f.path))); });
    mine.forEach(function(m, i){ cols.candidate.items.push(card("my_" + i, m.t, m.s || "", m.d || "", "我的灵感", stageOf("my_" + i))); });
    published.forEach(function(w){ cols.published.items.push(card("pub_" + w.id, w.t, w.s || "", w.d || "", w.stage || "作品", stageOf("pub_" + w.id))); });
    var h = '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:14px;align-items:start">';
    ["candidate", "working", "published"].forEach(function(k){
      var c = cols[k];
      h += '<div style="border:1px solid var(--line-strong);border-radius:14px;background:var(--surface-sunken);padding:12px;min-height:200px">'
        + '<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px"><span style="width:8px;height:8px;border-radius:50%;background:' + c.color + '"></span>'
        + '<span style="font-size:12.5px;font-weight:600;color:var(--text)">' + c.label + '</span>'
        + '<span class="tag" style="font-size:10px;background:var(--surface);border:1px solid var(--line-strong)">' + c.items.length + '</span></div>'
        + (c.items.length ? c.items.join("") : '<div style="text-align:center;color:var(--text3);font-size:11px;padding:22px 0">空</div>')
        + '</div>';
    });
    h += '</div>';
    h += '<div style="font-size:11px;color:var(--text3);margin-top:12px">候选=灵感库与随手记 · 制作中/已发布=手动推进（本地记录） · 已发布含抖音作品数据</div>';
    el.innerHTML = h;
  });
}
function HL_PIPE(id, st) {
  var pipe = {};
  try { pipe = JSON.parse(localStorage.getItem("tzs_pipeline") || "{}"); } catch (e) {}
  pipe[id] = st;
  try { localStorage.setItem("tzs_pipeline", JSON.stringify(pipe)); } catch (e) {}
  var box = document.getElementById("hlItems"); if (box) HLAYER_LOAD("content");
}
function HL_JSON(id) {
  HGET("/api/content").then(function(r){
    if (!r || !r.douyin) return;
    var w = (r.douyin.works || []).find(function(x){ return (x.id || x.title || "") === id; });
    if (!w) return;
    var m = document.getElementById("_modal");
    if (!m) {
      m = document.createElement("div"); m.id = "_modal";
      m.style = "position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:999;display:flex;align-items:center;justify-content:center";
      m.onclick = function(e){ if (e.target === this) this.remove(); };
      document.body.appendChild(m);
    }
    m.innerHTML = '<div style="background:var(--card);border-radius:var(--r);padding:20px;width:640px;max-width:94vw;max-height:84vh;overflow-y:auto;box-shadow:var(--shadow-lg)" onclick="event.stopPropagation()">'
      + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px"><b style="font-size:15px">' + E(w.title || w.name || "内容") + '</b><button class="btn btn-sm" onclick="this.closest(\'#_modal\').remove()">关闭</button></div>'
      + '<pre style="font-size:12px;line-height:1.7;white-space:pre-wrap;color:var(--text2)">' + E(JSON.stringify(w, null, 2)) + '</pre></div>';
    m.style.display = "flex";
  });
}

function HL_DAILY(list) {
  var h = "";
  var byDate = {};
  list.forEach(function(f){ var d = String(f.modified || "").slice(0, 10); (byDate[d] = byDate[d] || []).push(f); });
  Object.keys(byDate).sort().reverse().forEach(function(d){
    h += '<div style="font-size:11px;color:var(--text2);letter-spacing:.08em;margin:12px 0 6px">' + d + '</div>';
    h += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:10px">';
    byDate[d].forEach(function(f){ h += HL_CARD(f); });
    h += '</div>';
  });
  return h || '<div style="color:var(--text3)">暂无更新</div>';
}
function HREAD(file, personal) {
  HGET("/api/vault/read?file=" + encodeURIComponent(file) + "&root=" + (personal ? "personal" : "obsidian")).then(function(r){
    if (!r || r.error || r.content == null) { Q("读取失败：" + (r && r.error || "桥未启动"), "err"); return; }
    var m = document.getElementById("_modal");
    if (!m) {
      m = document.createElement("div"); m.id = "_modal";
      m.style = "position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:999;display:flex;align-items:center;justify-content:center";
      m.onclick = function(e){ if (e.target === this) this.remove(); };
      document.body.appendChild(m);
    }
    m.innerHTML = '<div style="background:var(--card);border-radius:var(--r);padding:20px;width:720px;max-width:94vw;max-height:86vh;overflow-y:auto;box-shadow:var(--shadow-lg)" onclick="event.stopPropagation()">'
      + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px"><b style="font-family:var(--font-serif);font-size:15px">' + E(file.split("/").pop()) + '</b><button class="btn btn-sm" onclick="this.closest(\'#_modal\').remove()">关闭</button></div>'
      + '<div style="font-size:13px;color:var(--text);line-height:1.8;white-space:pre-wrap">' + E(r.content) + '</div></div>';
    m.style.display = "flex";
  });
}
var WB_EMBED_READY = false;
function EMBED_PAGE(route) {
  if (document.head && !document.getElementById('wbEmbedCss')) {
    var lk = document.createElement('link');
    lk.id = 'wbEmbedCss'; lk.rel = 'stylesheet';
    lk.href = 'http://127.0.0.1:5174/wb-embed-scoped.css';
    document.head.appendChild(lk);
  }
  if (document.head && !WB_EMBED_READY && !document.getElementById('wbEmbedScript')) {
    var sc = document.createElement('script');
    sc.id = 'wbEmbedScript'; sc.type = 'module';
    sc.src = 'http://127.0.0.1:5174/wb-embed.js';
    sc.onload = function(){ WB_EMBED_READY = true; WB_MOUNT(route); };
    document.head.appendChild(sc);
  } else {
    setTimeout(function(){ WB_MOUNT(route); }, 0);
  }
  return '<div id="wbEmbedRoot" class="wb-embed-root" style="height:calc(100vh - 148px);overflow:auto;background:#fafafa"></div>';
}
function WB_MOUNT(route) {
  var el = document.getElementById('wbEmbedRoot');
  if (el && window.WB_EMBED_MOUNT) {
    window.__WB_API_BASE = 'http://127.0.0.1:5174';
    window.WB_EMBED_MOUNT(el, route);
  }
}
window.TZS.modules_hermes.EMBED_PAGE = EMBED_PAGE;
window.TZS.modules_hermes.AIWORK_HOME = AIWORK_HOME;
window.TZS.modules_hermes.AIWORK_SECTION = AIWORK_SECTION;
window.TZS.modules_hermes.HL_IDEAS = HL_IDEAS;
window.TZS.modules_hermes.THEME_SPRIG = THEME_SPRIG;
window.TZS.modules_hermes.HL_IDEAS = HL_IDEAS;

function AIWORK_HOME() {
  /* 个人AI工作台 · 原生总览（对齐原版：hero 状态 + 指标 + 最近更新 + 星图 + 七层级入口） */
  var layers = [
    { k: "wiki", label: "Wiki 层", desc: "结构化知识：概念 · 框架", icon: "KNOWLEDGE LAYER" },
    { k: "materials", label: "素材层", desc: "原始素材：文章 · 思考笔记", icon: "RAW MATERIALS" },
    { k: "books", label: "书架", desc: "书籍章节 · 阅读进度", icon: "BOOKSHELF" },
    { k: "daily", label: "每日热点", desc: "最近更新的笔记与事件", icon: "DAILY HOT" },
    { k: "social", label: "社媒洞察", desc: "社媒分析报告", icon: "SOCIAL INSIGHTS" },
    { k: "ideas", label: "灵感库", desc: "灵感与选题", icon: "IDEA VAULT" },
    { k: "content", label: "内容中心", desc: "内容生产状态 · 账号数据", icon: "CONTENT PIPELINE" }
  ];
  var h = '<div class="card" style="margin-bottom:14px;padding:20px 22px"><div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">'
    + '<div><div style="font-size:10.5px;letter-spacing:.16em;color:var(--primary);font-weight:600">PERSONAL AI WORKBENCH</div>'
    + '<div style="font-size:21px;font-family:var(--font-serif);font-weight:700;color:var(--text);margin:2px 0 4px">个人AI工作台</div>'
    + '<div style="font-size:12px;color:var(--text2)">个人知识库 · 与工作台同款技术栈与视觉</div></div>'
    + '<span id="aiwStatus" style="font-size:11px;color:var(--text3)">数据服务连接中…</span></div>'
    + '<div id="aiwMetrics" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:10px;margin-top:14px"></div></div>';
  h += '<div style="display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:14px;margin-bottom:14px">'
    + '<div class="card"><div class="card-title">知识星图 <span style="font-size:11px;color:var(--text3);font-weight:400">模块 · 人物 · 组织 · 模板</span></div><div id="gwrap" style="min-height:340px">加载中…</div></div>'
    + '<div class="card"><div class="card-title">最近更新 <span style="font-size:11px;color:var(--text3);font-weight:400">个人知识库</span></div><div id="aiwRecent" style="font-size:12px;color:var(--text3)">加载中…</div></div></div>';
  h += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px">';
  layers.forEach(function(L){
    h += '<div class="hl-card" style="padding:16px" onclick="N(\'' + L.k + '\')">'
      + '<div style="font-size:10px;letter-spacing:.14em;color:var(--primary);font-weight:600;margin-bottom:6px">' + L.icon + '</div>'
      + '<div style="font-size:15px;font-weight:600;color:var(--text)">' + L.label + '</div>'
      + '<div style="font-size:12px;color:var(--text2);margin-top:4px;line-height:1.55">' + L.desc + '</div>'
      + '<div style="font-size:11px;color:var(--primary);margin-top:8px">打开 →</div></div>';
  });
  h += '</div>';
  setTimeout(function(){
    Promise.all([HGET("/api/layers"), HGET("/api/content"), H_AVAIL()]).then(function(arr){
      var r = arr[0], content = arr[1], avail = arr[2];
      var st = document.getElementById("aiwStatus");
      if (st) st.innerHTML = avail ? '<span style="color:var(--ok)">● 数据服务在线</span>' : '<span style="color:var(--warn)">● 数据服务离线</span>';
      var box = document.getElementById("aiwMetrics");
      if (box && r) {
        var published = 0;
        try { var cur = content && (content.current || content.douyin) || {}; published = (cur.works || (cur.douyin && cur.douyin.works) || []).length; } catch (e) {}
        var items = [
          ["RAW 素材", r.materials && r.materials.count, "原始证据层"],
          ["WIKI 页面", r.wiki && r.wiki.count, "知识层", 1],
          ["灵感", r.ideas && r.ideas.count, "候选选题"],
          ["已发布作品", published, "抖音"]
        ];
        box.innerHTML = items.map(function(it){
          return '<div style="border:1px solid var(--line-strong);border-radius:12px;padding:12px 14px;background:var(--surface)">'
            + '<div style="font-size:11px;color:var(--text3)">' + it[0] + '</div>'
            + '<div style="font-size:24px;font-weight:700;font-family:var(--font-display);color:' + (it[3] ? "var(--primary)" : "var(--text)") + ';letter-spacing:-.02em;font-variant-numeric:tabular-nums">' + (it[1] || 0) + '</div>'
            + '<div style="font-size:10.5px;color:var(--text3)">' + it[2] + '</div></div>';
        }).join("");
      }
      var rc = document.getElementById("aiwRecent");
      if (rc && r && r.recent && r.recent.length) {
        rc.innerHTML = r.recent.slice(0, 8).map(function(f){
          return '<div style="display:flex;gap:10px;align-items:baseline;padding:7px 2px;border-bottom:1px dashed var(--line);cursor:pointer" onclick="HREAD(\'' + HESC(f.path) + '\',true)">'
            + '<span style="font-weight:500;font-size:12.5px;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + E(f.name) + '</span>'
            + '<span style="font-size:10.5px;color:var(--text3);font-family:var(--font-mono);white-space:nowrap">' + E(String(f.modified || "").slice(0, 10)) + '</span></div>';
        }).join("");
      } else if (rc) { rc.innerHTML = "暂无更新"; }
    });
    var gw = document.getElementById("gwrap");
    if (gw && window.HKLOAD) { gw.innerHTML = ""; HKLOAD(); }
  }, 0);
  return h;
}

window.TZS.modules_hermes.EMBED_PAGE = EMBED_PAGE;

function AIWORK_SECTION() {
  /* 个人AI工作台 · 合并进工作台总览（hero + 梅花树枝线绘 + 指标 + 星图 + 七层级入口） */
  var layers = [
    { k: "wiki", label: "Wiki 层", desc: "结构化知识：概念 · 框架", icon: "KNOWLEDGE" },
    { k: "materials", label: "素材层", desc: "原始素材：文章 · 思考笔记", icon: "RAW" },
    { k: "books", label: "书架", desc: "书籍章节 · 阅读进度", icon: "BOOKS" },
    { k: "daily", label: "每日热点", desc: "最近更新的笔记与事件", icon: "DAILY" },
    { k: "social", label: "社媒洞察", desc: "社媒分析报告", icon: "SOCIAL" },
    { k: "ideas", label: "灵感库", desc: "灵感与选题", icon: "IDEAS" },
    { k: "content", label: "内容中心", desc: "内容生产状态 · 账号数据", icon: "STUDIO" }
  ];
  var h = '<div class="card" style="margin-bottom:14px;padding:20px 22px"><div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px">'
    + '<div><div style="font-size:10.5px;letter-spacing:.16em;color:var(--primary);font-weight:600">PERSONAL AI WORKBENCH</div>'
    + '<div style="font-size:21px;font-family:var(--font-serif);font-weight:700;color:var(--text);margin:2px 0 4px">个人AI工作台</div>'
    + '<div style="font-size:12px;color:var(--text2)">个人知识库 · 与工作台同款技术栈与视觉</div></div>'
    + '<div style="display:flex;align-items:center;gap:14px"><span id="aiwSecStatus" style="font-size:11px;color:var(--text3)">连接中…</span><div id="aiwPlum" style="width:168px;height:128px;flex-shrink:0;position:relative"></div></div></div>'
    + '<div id="aiwSecMetrics" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:10px;margin-top:14px"></div></div>';
  h += '<div style="display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:14px;margin-bottom:14px">'
    + '<div class="card"><div class="card-title">知识星图 <span style="font-size:11px;color:var(--text3);font-weight:400">模块 · 人物 · 组织 · 模板</span></div><div id="gwrap" style="min-height:300px">加载中…</div></div>'
    + '<div style="display:flex;flex-direction:column;gap:12px"><div class="card" style="padding:14px 16px"><div class="card-title">最近更新 <span style="font-size:11px;color:var(--text3);font-weight:400">个人知识库</span></div><div id="aiwSecRecent" style="font-size:12px;color:var(--text3)">加载中…</div></div>'
    + '<div class="card" style="padding:14px 16px;flex:1"><div class="card-title">七层知识入口</div><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px">';
  layers.forEach(function(L){
    h += '<div class="hl-card" style="padding:10px 12px;display:flex;align-items:center;gap:8px" onclick="N(\'' + L.k + '\')">'
      + '<span style="font-size:9px;letter-spacing:.08em;color:var(--primary);font-weight:700;flex-shrink:0">' + L.icon + '</span>'
      + '<span style="font-size:12.5px;font-weight:600;color:var(--text)">' + L.label + '</span></div>';
  });
  h += '</div></div></div></div>';
  setTimeout(function(){
    /* 梅花树枝线绘 · 随鼠标轻摆（借鉴 p5.js Recursive Tree 的鼠标驱动角度 + 本地手绘线绘稿） */
    THEME_SPRIG(document.getElementById("aiwPlum"));
    Promise.all([HGET("/api/layers"), HGET("/api/content"), H_AVAIL()]).then(function(arr){
      var r = arr[0], content = arr[1], avail = arr[2];
      var st = document.getElementById("aiwSecStatus");
      if (st) st.textContent = avail ? "● 数据服务在线" : "● 数据服务离线";
      var box = document.getElementById("aiwSecMetrics");
      if (box && r) {
        var published = 0;
        try { var cur = content && (content.current || content.douyin) || {}; published = (cur.works || (cur.douyin && cur.douyin.works) || []).length; } catch (e) {}
        var items = [
          ["RAW 素材", r.materials && r.materials.count, "原始证据层"],
          ["WIKI 页面", r.wiki && r.wiki.count, "知识层", 1],
          ["灵感", r.ideas && r.ideas.count, "候选选题"],
          ["已发布作品", published, "抖音"]
        ];
        box.innerHTML = items.map(function(it){
          return '<div style="border:1px solid var(--line-strong);border-radius:12px;padding:12px 14px;background:var(--surface)">'
            + '<div style="font-size:11px;color:var(--text3)">' + it[0] + '</div>'
            + '<div style="font-size:23px;font-weight:700;font-family:var(--font-display);color:' + (it[3] ? "var(--primary)" : "var(--text)") + ';letter-spacing:-.02em;font-variant-numeric:tabular-nums">' + (it[1] || 0) + '</div>'
            + '<div style="font-size:10.5px;color:var(--text3)">' + it[2] + '</div></div>';
        }).join("");
      }
      var rc = document.getElementById("aiwSecRecent");
      if (rc) {
        if (r && r.recent && r.recent.length) {
          rc.innerHTML = r.recent.slice(0, 5).map(function(f){
            return '<div style="display:flex;gap:8px;align-items:baseline;padding:5px 2px;border-bottom:1px dashed var(--line);cursor:pointer" onclick="HREAD(\'' + HESC(f.path) + '\',true)">'
              + '<span style="font-weight:500;font-size:12px;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + E(f.name) + '</span>'
              + '<span style="font-size:10px;color:var(--text3);font-family:var(--font-mono);white-space:nowrap">' + E(String(f.modified || "").slice(0, 10)) + '</span></div>';
          }).join("");
        } else { rc.innerHTML = "暂无更新"; }
      }
    });
    var gw = document.getElementById("gwrap");
    if (gw && window.HKLOAD) { gw.innerHTML = ""; HKLOAD(); }
  }, 0);
  return h;
}
function THEME_SPRIG(host) {
  if (!host) return;
  if (host._busy) return;
  host._busy = 1;
  var T = function(){ var t = "ai"; try { t = localStorage.getItem("tzs_theme") || "ai"; } catch (e) {} var a = document.documentElement.getAttribute("data-theme"); if (a) t = a; return t; };

  /* 素材：Wikimedia CC0 线描五瓣梅（网上抓取） */
  var PLUM_SYMBOL = '<g stroke="#C00" stroke-linecap="round" fill="none"><path stroke-width="5" d="M55 42a35 34 0 0 1 70 0M72 66a30 30 0 0 1 36 0"/><path stroke-width="9" d="M65.5 35.2v0m48.8 0v0M90 30v0"/><path stroke-width="4" d="M90 30v30M66 36l12 27m24 0 12-27"/></g>';

  /* 素材：design.css 精修线绘（竹影/梅枝/金枝/竹叶/星月） */
  var BAMBOO = '<path d="M18 110 C20 80 30 60 44 40 C54 26 62 18 66 6" fill="none" stroke="#3D5A3D" stroke-width="3" stroke-linecap="round"/><path d="M34 62 C40 56 48 54 54 57 M22 78 C28 72 36 70 43 73 M14 92 C20 87 27 85 33 88" fill="none" stroke="#3D5A3D" stroke-width="1.6"/><path d="M96 110 C99 84 108 62 120 42 C130 26 136 14 139 4" fill="none" stroke="#3D5A3D" stroke-width="2.4" stroke-linecap="round"/><path d="M108 66 C113 61 120 59 126 62 M102 80 C108 75 115 73 121 76" fill="none" stroke="#3D5A3D" stroke-width="1.4"/><circle cx="66" cy="6" r="2" fill="#3D5A3D"/><circle cx="139" cy="4" r="1.6" fill="#3D5A3D"/>';
  var MEIZHI = '<path d="M4 82 C30 68 52 54 72 34 C84 21 100 16 122 11" fill="none" stroke="#A33A56" stroke-width="1.7" opacity=".6"/><path d="M44 62 C49 56 56 53 63 55 M34 68 C39 62 46 59 53 62" fill="none" stroke="#A33A56" stroke-width="1.2" opacity=".5"/><circle cx="72" cy="34" r="4.2" fill="#C44B6B" opacity=".55"/><circle cx="81" cy="27" r="3.1" fill="#D47B8B" opacity=".5"/><circle cx="100" cy="18" r="3.6" fill="#C44B6B" opacity=".55"/><circle cx="113" cy="13" r="2.7" fill="#E89AA8" opacity=".55"/><circle cx="63" cy="47" r="2.6" fill="#E89AA8" opacity=".45"/>';
  var JINZHI = '<path d="M2 58 C18 42 30 36 40 40 C52 44 62 36 74 28 C86 20 100 16 134 10" fill="none" stroke="#E8DCC0" stroke-width="1.6" opacity=".75"/><path d="M2 64 C24 54 42 50 58 54 C76 58 94 52 134 40" fill="none" stroke="#E8DCC0" stroke-width="1.1" opacity=".5"/><path d="M48 52 C52 49 57 48 62 49" fill="none" stroke="#E8DCC0" stroke-width="1" opacity=".45"/><rect x="86" y="22" width="7" height="7" fill="#C45070" opacity=".8" rx="1"/>';
  var ZHUYE = '<path d="M6 44 C8 30 14 18 26 4" fill="none" stroke="#3F6B45" stroke-width="1.8" stroke-linecap="round"/><path d="M14 30 C22 28 28 22 30 14 C24 20 18 22 13 25 Z" fill="none" stroke="#3F6B45" stroke-width="1.4"/><path d="M20 20 C26 16 30 10 30 4 C26 10 20 13 15 15 Z" fill="none" stroke="#3F6B45" stroke-width="1.2"/>';
  var XINGYUE = '<path d="M84 12 C66 16 54 30 54 46 C68 40 80 30 84 12 Z" fill="none" stroke="#D4A85C" stroke-width="1.6"/><path d="M30 16 l2.2 4.6 4.8.8-3.4 3.4.8 4.8-4.4-2.4-4.4 2.4.8-4.8-3.4-3.4 4.8-.8 Z" fill="#D4A85C" opacity=".7"/><path d="M108 34 l1.6 3.4 3.6.6-2.6 2.6.6 3.6-3.2-1.8-3.2 1.8.6-3.6-2.6-2.6 3.6-.6 Z" fill="#E9E0CF" opacity=".6"/>';

  var SCENES = {
    ai:     { branch: MEIZHI, tint: true,  anim: "drift", falls: [["dot",8,10,6.2,.2],["dot",20,8,5.4,1.4],["dot",33,12,7.1,2.6],["dot",45,9,6.8,3.2],["dot",58,11,5.1,4.4],["dot",70,7,6.6,.9],["dot",82,10,5.8,2.1],["dot",92,6,7.4,3.8],["dot",28,13,6.0,5.2],["dot",64,9,5.6,1.9],["dot",76,8,7.8,4.8],["dot",50,14,6.4,.6]], seal: "AI" },
    paper:  { branch: JINZHI, tint: false, anim: "ripple", falls: [["ink",10,12,4.2,.3],["ink",24,9,3.9,1.8],["ink",38,13,4.6,2.9],["ink",52,10,3.6,4.0],["ink",66,8,5.0,1.1],["ink",80,11,4.2,2.4],["ink",90,7,3.4,3.6],["ink",16,14,4.8,.8],["ink",58,12,3.8,5.4],["ink",74,9,4.4,4.5]], seal: "印" },
    bamboo: { branch: BAMBOO + ZHUYE, tint: false, anim: "sway", falls: [["leaf",8,15,4.2,.4],["leaf",22,11,3.8,1.6],["leaf",36,13,4.6,2.8],["leaf",50,10,3.4,4.0],["leaf",64,14,4.0,1.0],["dot",78,8,5.2,2.2],["leaf",88,12,3.6,3.4],["leaf",30,9,4.4,5.2],["leaf",70,16,4.8,4.6],["dot",58,7,5.6,.8]], seal: "竹" },
    plum:   { branch: MEIZHI, tint: false, anim: "fall", falls: [["petal",6,16,6.2,.2],["petal",18,12,5.5,1.3],["petal",30,14,6.9,2.5],["petal",42,10,5.3,3.7],["petal",54,17,6.6,.9],["petal",66,11,5.7,2.1],["petal",78,13,7.2,3.3],["petal",90,9,6.1,4.5],["dot",24,7,7.5,.6],["dot",72,8,6.4,5.3],["petal",48,8,8.0,1.8],["petal",84,10,5.9,4.9]], seal: "梅" },
    night:  { branch: XINGYUE, tint: false, anim: "twinkle", falls: [["star",8,12,3.2,.3],["star",20,9,2.8,1.5],["star",32,11,3.6,2.7],["star",44,8,2.4,3.9],["star",56,13,3.0,.7],["star",68,10,3.8,1.9],["star",80,12,2.6,3.1],["star",92,8,3.4,4.3],["dot",26,7,2.2,5.2],["dot",62,6,3.2,.5],["star",74,9,4.0,2.4],["dot",50,7,2.8,4.7]], seal: "夜" },
    pink:   { branch: MEIZHI, tint: true,  anim: "fall", falls: [["petal",5,16,5.8,.2],["petal",16,12,5.2,1.2],["petal",27,15,6.4,2.4],["petal",38,11,5.0,3.6],["petal",49,17,6.2,.8],["petal",60,12,5.4,2.0],["petal",71,14,6.8,3.2],["petal",82,10,5.6,4.4],["petal",93,13,6.0,5.0],["dot",22,8,7.2,.4],["dot",68,9,6.6,5.6],["petal",55,8,7.8,1.6]], seal: "樱" },
    codex:  { branch: JINZHI, tint: true,  anim: "drift", falls: [["dot",8,10,6.2,.3],["dot",20,8,5.8,1.5],["dot",32,12,7.0,2.7],["dot",44,9,6.4,3.9],["dot",56,11,5.6,.9],["dot",68,8,7.6,2.1],["dot",80,10,6.8,3.3],["dot",92,7,5.9,4.5],["dot",26,13,8.0,.5],["dot",62,14,7.2,5.3],["dot",74,6,6.6,1.7],["dot",50,12,7.8,4.1]], seal: "码" },
    tear:   { branch: XINGYUE, tint: true, anim: "float", falls: [["chip",8,13,5.6,.3],["chip",20,10,5.2,1.5],["chip",32,14,6.0,2.7],["chip",44,11,4.8,3.9],["chip",56,12,5.4,.9],["chip",68,9,6.4,2.1],["chip",80,13,5.0,3.3],["chip",92,10,5.8,4.5],["dot",26,8,6.2,.5],["dot",62,7,5.6,5.3],["chip",74,8,6.8,1.7],["dot",50,9,5.2,4.1]], seal: "裂" }
  };

  function fallShape(kind, color, size) {
    if (kind === "petal") return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24"><ellipse cx="12" cy="8" rx="5" ry="8" fill="' + color + '" opacity=".75" transform="rotate(30 12 12)"/></svg>';
    if (kind === "leaf") return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24"><path d="M4 20 C4 10 10 4 20 4 C20 14 14 20 4 20 Z" fill="none" stroke="' + color + '" stroke-width="1.6" opacity=".8"/></svg>';
    if (kind === "ink") return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4" fill="' + color + '" opacity=".55"/><circle cx="12" cy="12" r="1.6" fill="' + color + '" opacity=".3"/></svg>';
    if (kind === "star") return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24"><path d="M12 2 l2.4 7.2 7.6.5-6 4.6 2 7.2-6-4.4-6 4.4 2-7.2-6-4.6 7.6-.5 Z" fill="' + color + '" opacity=".8"/></svg>';
    if (kind === "chip") return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24"><path d="M4 16 L10 10 L8 8 L16 4 L14 12 L20 14 L12 20 Z" fill="' + color + '" opacity=".5"/></svg>';
    return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" fill="' + color + '" opacity=".7"/></svg>';
  }

  function render() {
    var t = T();
    function cssVar(n, depth) {
      try {
        var v = getComputedStyle(document.documentElement).getPropertyValue(n).trim();
        var m = v.match(/^var\((--[\w-]+)\)$/);
        if (m && depth < 4) return cssVar(m[1], (depth || 0) + 1);
        return v || "#555";
      } catch (e) { return "#555"; }
    }
    var ink = cssVar("--text"), glow = cssVar("--primary"), gold = cssVar("--gold") || glow;
    var color = (t === "paper") ? gold : glow;
    var scene = SCENES[t] || SCENES.ai;
    var branchSvg = scene.branch
      .replace(/#3D5A3D/g, ink).replace(/#A33A56/g, ink).replace(/#3F6B45/g, ink)
      .replace(/#E8DCC0/g, ink).replace(/#D4A85C/g, color).replace(/#C44B6B/g, color)
      .replace(/#D47B8B/g, color).replace(/#E89AA8/g, color).replace(/#C45070/g, color).replace(/#E9E0CF/g, color);
    var plum = (t === "plum" || t === "pink" || t === "ai") ? '<g transform="rotate(12 90 90) scale(0.42) translate(10 66)" stroke="' + color + '">' + PLUM_SYMBOL.replace(/stroke="#C00"/g, 'stroke="' + color + '"') + '</g>' : "";
    var falls = "";
    scene.falls.forEach(function(f) {
      falls += '<span class="plum-anim-' + scene.anim + '" style="left:' + f[1] + '%;top:-8px;animation-duration:' + f[3] + 's;animation-delay:' + f[4] + 's">'
        + fallShape(f[0], color, f[2]) + '</span>';
    });
    /* 静态元素：山影 / 云 / 散点花 / 月牙 */
    var statics = "";
    if (t !== "night" && t !== "tear") {
      statics += '<svg viewBox="0 0 170 40" style="position:absolute;left:0;bottom:0;width:100%;height:34px;opacity:.5;pointer-events:none;z-index:1">'
        + '<path d="M0 40 L28 12 L52 34 L82 4 L112 34 L138 14 L170 40 Z" fill="none" stroke="' + color + '" stroke-width="1.3" opacity=".28"/>'
        + '<path d="M-6 40 L34 20 L70 40 Z" fill="none" stroke="' + color + '" stroke-width="1" opacity=".16"/>'
        + '</svg>';
    }
    if (t === "night") {
      statics += '<svg viewBox="0 0 170 40" style="position:absolute;left:0;bottom:0;width:100%;height:34px;opacity:.6;pointer-events:none;z-index:1">'
        + '<path d="M0 40 L24 18 L48 34 L80 8 L110 34 L140 20 L170 40 Z" fill="none" stroke="' + color + '" stroke-width="1.2" opacity=".4"/>'
        + '</svg>';
    }
    if (t === "tear") {
      statics += '<svg viewBox="0 0 170 40" style="position:absolute;left:0;bottom:0;width:100%;height:34px;opacity:.6;pointer-events:none;z-index:1">'
        + '<path d="M0 40 L30 24 L20 18 L60 8 L54 14 L110 26 L120 20 L170 34 L170 40 Z" fill="none" stroke="' + color + '" stroke-width="1.1" opacity=".35"/>'
        + '</svg>';
    }
    var dots = "";
    for (var di = 0; di < 7; di++) {
      var dx = 6 + ((di * 23 + (t.length * 7)) % 84);
      var dy = 14 + ((di * 17 + (t.length * 5)) % 46);
      var dr = 1.6 + (di % 3) * 0.7;
      dots += '<circle cx="' + dx + '" cy="' + dy + '" r="' + dr + '" fill="' + color + '" opacity="' + (0.28 + (di % 3) * 0.14) + '"/>';
    }
    statics += '<svg viewBox="0 0 170 120" style="position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:1">' + dots + '</svg>';
    host.innerHTML = '<div class="plum-scene" style="position:absolute;inset:0;overflow:hidden">'
      + '<div class="plum-fall" style="position:absolute;inset:0;pointer-events:none;z-index:1">' + falls + '</div>'
      + statics
      + '<svg id="plumBranchG" viewBox="0 0 170 130" width="168" height="128" preserveAspectRatio="xMaxYMax meet" style="position:absolute;right:0;bottom:0;overflow:visible;display:block;z-index:2">'
      + '<g style="transform-origin:10px 118px;transition:transform .06s linear"><g transform="translate(14 12)">' + branchSvg + plum + '</g></g></svg>'
      + '<div style="position:absolute;right:10px;top:8px;width:22px;height:22px;border:1.5px solid ' + color + ';color:' + color + ';border-radius:4px;display:flex;align-items:center;justify-content:center;transform:rotate(6deg);font-size:12px;opacity:.85;z-index:3;font-family:serif;box-shadow:0 1px 3px rgba(0,0,0,.08)">' + scene.seal + '</div>'
      + '</div>';
    g = host.querySelector("#plumBranchG");
  }
  var g = null;
  render();
  if (!g) return;
  var curX = 0, curY = 0, targetX = 0, targetY = 0, raf = null;
  document.addEventListener("mousemove", function(e) {
    var r = host.getBoundingClientRect();
    if (!r.width) return;
    var cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    targetX = Math.max(-9, Math.min(9, (e.clientX - cx) / 14));
    targetY = Math.max(-6, Math.min(6, (e.clientY - cy) / 22));
    if (!raf) raf = requestAnimationFrame(step);
  });
  function step() {
    raf = null;
    curX += (targetX - curX) * 0.16;
    curY += (targetY - curY) * 0.16;
    var gg = g.querySelector("g");
    if (gg) gg.setAttribute("transform", "rotate(" + (curY * 0.6).toFixed(2) + " 10 118) translate(" + curX.toFixed(2) + " " + (curY * 0.35).toFixed(2) + ")");
    if (Math.abs(targetX - curX) > 0.08 || Math.abs(targetY - curY) > 0.08) {
      raf = requestAnimationFrame(step);
    }
  }
  var mo = new MutationObserver(function(muts) {
    muts.forEach(function(m) {
      if (m.type === "attributes" && m.attributeName === "data-theme") render();
    });
  });
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  THEME_AMBIENT();
}
function THEME_AMBIENT() {
  /* 全页氛围层：总览页四周轻飘主题元素（花瓣/星/叶/墨点/碎屑），不挡交互 */
  var amb = document.getElementById("tzsAmbient");
  if (!amb) {
    amb = document.createElement("div");
    amb.id = "tzsAmbient";
    amb.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:2;overflow:hidden";
    document.body.appendChild(amb);
  }
  function T() {
    var t = "ai";
    try { t = localStorage.getItem("tzs_theme") || "ai"; } catch (e) {}
    var a = document.documentElement.getAttribute("data-theme");
    if (a) t = a;
    return t;
  }
  var t = T();
  var kinds = { ai: "petal", paper: "ink", bamboo: "leaf", plum: "petal", night: "star", pink: "petal", codex: "dot", tear: "chip" };
  var anims = { ai: "drift", paper: "ripple", bamboo: "sway", plum: "fall", night: "twinkle", pink: "fall", codex: "drift", tear: "float" };
  var kind = kinds[t] || "petal";
  var anim = anims[t] || "fall";
  function cssVar(n, d) {
    try {
      var v = getComputedStyle(document.documentElement).getPropertyValue(n).trim();
      var m = v.match(/^var\((--[\w-]+)\)$/);
      if (m && d < 4) return cssVar(m[1], (d || 0) + 1);
      return v || "#888";
    } catch (e) { return "#888"; }
  }
  var color = cssVar("--primary");
  var html = "";
  for (var i = 0; i < 14; i++) {
    var left = (i * 7.3 + 3) % 96;
    var size = 9 + (i % 5) * 4;
    var dur = (anim === "twinkle" || anim === "ripple") ? 2.4 + (i % 5) * 0.8 : 11 + (i % 6) * 2.5;
    var delay = (i * 1.3) % 12;
    var sway = 14 + (i % 5) * 10;
    var op = 0.22 + (i % 3) * 0.1;
    html += '<span class="tzs-amb-' + anim + '" style="position:absolute;left:' + left + '%;top:-16px;--sway:' + sway + 'px;animation:tzs-amb-' + anim + ' ' + dur + 's ease-in-out ' + delay + 's infinite;opacity:' + op + '">'
      + '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24">';
    if (kind === "petal") html += '<ellipse cx="12" cy="8" rx="5" ry="8" fill="' + color + '" transform="rotate(30 12 12)"/>';
    else if (kind === "leaf") html += '<path d="M4 20 C4 10 10 4 20 4 C20 14 14 20 4 20 Z" fill="none" stroke="' + color + '" stroke-width="1.6"/>';
    else if (kind === "ink") html += '<circle cx="12" cy="12" r="4.5" fill="' + color + '" opacity=".5"/><circle cx="12" cy="12" r="1.8" fill="' + color + '" opacity=".3"/>';
    else if (kind === "star") html += '<path d="M12 2 l2.4 7.2 7.6.5-6 4.6 2 7.2-6-4.4-6 4.4 2-7.2-6-4.6 7.6-.5 Z" fill="' + color + '"/>';
    else if (kind === "chip") html += '<path d="M4 16 L10 10 L8 8 L16 4 L14 12 L20 14 L12 20 Z" fill="' + color + '" opacity=".6"/>';
    else html += '<circle cx="12" cy="12" r="3" fill="' + color + '"/>';
    html += '</svg></span>';
  }
  amb.innerHTML = html;
  amb.style.display = "block";
  if (!document.getElementById("tzsAmbCss")) {
    var st = document.createElement("style");
    st.id = "tzsAmbCss";
    st.textContent = ""
      + "@keyframes tzs-amb-fall{0%{transform:translateY(-20px) translateX(0) rotate(0deg);opacity:0}10%{opacity:1}55%{transform:translateY(48vh) translateX(calc(var(--sway, 20px) * -0.6)) rotate(160deg)}100%{transform:translateY(102vh) translateX(var(--sway, 20px)) rotate(320deg);opacity:.12}}"
      + "@keyframes tzs-amb-sway{0%,100%{transform:translateY(8vh) rotate(-16deg);opacity:.3}25%{opacity:.95}50%{transform:translateY(-3vh) rotate(12deg);opacity:.95}75%{transform:translateY(12vh) rotate(-8deg);opacity:.8}}"
      + "@keyframes tzs-amb-ripple{0%{transform:scale(.4);opacity:0}30%{opacity:.9}100%{transform:scale(1.8);opacity:0}}"
      + "@keyframes tzs-amb-twinkle{0%,100%{opacity:.2;transform:scale(.8)}50%{opacity:1;transform:scale(1.3)}}"
      + "@keyframes tzs-amb-drift{0%,100%{transform:translateY(6vh) translateX(calc(var(--sway, 20px) * -0.5));opacity:.3}50%{transform:translateY(calc(30vh - 40px)) translateX(var(--sway, 20px));opacity:.9}}"
      + "@keyframes tzs-amb-float{0%,100%{transform:translateY(10vh) rotate(-14deg);opacity:.3}50%{transform:translateY(calc(20vh - 30px)) rotate(10deg);opacity:.9}}";
    document.head.appendChild(st);
  }
}
window.TZS.modules_hermes.EMBED_PAGE = EMBED_PAGE;
window.TZS.modules_hermes.AIWORK_HOME = AIWORK_HOME;
window.TZS.modules_hermes.AIWORK_SECTION = AIWORK_SECTION;
window.TZS.modules_hermes.HL_IDEAS = HL_IDEAS;
window.TZS.modules_hermes.THEME_SPRIG = THEME_SPRIG;
window.TZS.modules_hermes.HL_IDEAS = HL_IDEAS;

function AIWORK_HOME() {
  /* 个人AI工作台 · 原生总览（对齐原版：hero 状态 + 指标 + 最近更新 + 星图 + 七层级入口） */
  var layers = [
    { k: "wiki", label: "Wiki 层", desc: "结构化知识：概念 · 框架", icon: "KNOWLEDGE LAYER" },
    { k: "materials", label: "素材层", desc: "原始素材：文章 · 思考笔记", icon: "RAW MATERIALS" },
    { k: "books", label: "书架", desc: "书籍章节 · 阅读进度", icon: "BOOKSHELF" },
    { k: "daily", label: "每日热点", desc: "最近更新的笔记与事件", icon: "DAILY HOT" },
    { k: "social", label: "社媒洞察", desc: "社媒分析报告", icon: "SOCIAL INSIGHTS" },
    { k: "ideas", label: "灵感库", desc: "灵感与选题", icon: "IDEA VAULT" },
    { k: "content", label: "内容中心", desc: "内容生产状态 · 账号数据", icon: "CONTENT PIPELINE" }
  ];
  var h = '<div class="card" style="margin-bottom:14px;padding:20px 22px"><div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">'
    + '<div><div style="font-size:10.5px;letter-spacing:.16em;color:var(--primary);font-weight:600">PERSONAL AI WORKBENCH</div>'
    + '<div style="font-size:21px;font-family:var(--font-serif);font-weight:700;color:var(--text);margin:2px 0 4px">个人AI工作台</div>'
    + '<div style="font-size:12px;color:var(--text2)">个人知识库 · 与工作台同款技术栈与视觉</div></div>'
    + '<span id="aiwStatus" style="font-size:11px;color:var(--text3)">数据服务连接中…</span></div>'
    + '<div id="aiwMetrics" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:10px;margin-top:14px"></div></div>';
  h += '<div style="display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:14px;margin-bottom:14px">'
    + '<div class="card"><div class="card-title">知识星图 <span style="font-size:11px;color:var(--text3);font-weight:400">模块 · 人物 · 组织 · 模板</span></div><div id="gwrap" style="min-height:340px">加载中…</div></div>'
    + '<div class="card"><div class="card-title">最近更新 <span style="font-size:11px;color:var(--text3);font-weight:400">个人知识库</span></div><div id="aiwRecent" style="font-size:12px;color:var(--text3)">加载中…</div></div></div>';
  h += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px">';
  layers.forEach(function(L){
    h += '<div class="hl-card" style="padding:16px" onclick="N(\'' + L.k + '\')">'
      + '<div style="font-size:10px;letter-spacing:.14em;color:var(--primary);font-weight:600;margin-bottom:6px">' + L.icon + '</div>'
      + '<div style="font-size:15px;font-weight:600;color:var(--text)">' + L.label + '</div>'
      + '<div style="font-size:12px;color:var(--text2);margin-top:4px;line-height:1.55">' + L.desc + '</div>'
      + '<div style="font-size:11px;color:var(--primary);margin-top:8px">打开 →</div></div>';
  });
  h += '</div>';
  setTimeout(function(){
    Promise.all([HGET("/api/layers"), HGET("/api/content"), H_AVAIL()]).then(function(arr){
      var r = arr[0], content = arr[1], avail = arr[2];
      var st = document.getElementById("aiwStatus");
      if (st) st.innerHTML = avail ? '<span style="color:var(--ok)">● 数据服务在线</span>' : '<span style="color:var(--warn)">● 数据服务离线</span>';
      var box = document.getElementById("aiwMetrics");
      if (box && r) {
        var published = 0;
        try { var cur = content && (content.current || content.douyin) || {}; published = (cur.works || (cur.douyin && cur.douyin.works) || []).length; } catch (e) {}
        var items = [
          ["RAW 素材", r.materials && r.materials.count, "原始证据层"],
          ["WIKI 页面", r.wiki && r.wiki.count, "知识层", 1],
          ["灵感", r.ideas && r.ideas.count, "候选选题"],
          ["已发布作品", published, "抖音"]
        ];
        box.innerHTML = items.map(function(it){
          return '<div style="border:1px solid var(--line-strong);border-radius:12px;padding:12px 14px;background:var(--surface)">'
            + '<div style="font-size:11px;color:var(--text3)">' + it[0] + '</div>'
            + '<div style="font-size:24px;font-weight:700;font-family:var(--font-display);color:' + (it[3] ? "var(--primary)" : "var(--text)") + ';letter-spacing:-.02em;font-variant-numeric:tabular-nums">' + (it[1] || 0) + '</div>'
            + '<div style="font-size:10.5px;color:var(--text3)">' + it[2] + '</div></div>';
        }).join("");
      }
      var rc = document.getElementById("aiwRecent");
      if (rc && r && r.recent && r.recent.length) {
        rc.innerHTML = r.recent.slice(0, 8).map(function(f){
          return '<div style="display:flex;gap:10px;align-items:baseline;padding:7px 2px;border-bottom:1px dashed var(--line);cursor:pointer" onclick="HREAD(\'' + HESC(f.path) + '\',true)">'
            + '<span style="font-weight:500;font-size:12.5px;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + E(f.name) + '</span>'
            + '<span style="font-size:10.5px;color:var(--text3);font-family:var(--font-mono);white-space:nowrap">' + E(String(f.modified || "").slice(0, 10)) + '</span></div>';
        }).join("");
      } else if (rc) { rc.innerHTML = "暂无更新"; }
    });
    var gw = document.getElementById("gwrap");
    if (gw && window.HKLOAD) { gw.innerHTML = ""; HKLOAD(); }
  }, 0);
  return h;
}

window.TZS.modules_hermes.EMBED_PAGE = EMBED_PAGE;

function HL_IDEAS(el, list) {
  var mine = [];
  try { mine = JSON.parse(localStorage.getItem("tzs_ideas") || "[]"); } catch (e) {}
  var tones = ["#7C3AED", "#6D28D9", "#8B5CF6", "#A78BFA", "#5B21B6", "#4C1D95"];
  function card(t, sub, tag, date, mineIdx) {
    var rot = (Math.random() * 2 - 1) * 1.2;
    var tone = tones[Math.floor(Math.random() * tones.length)];
    return '<div class="idea-note" style="transform:rotate(' + rot.toFixed(2) + 'deg)" onmouseover="this.style.transform=\'rotate(0deg) translateY(-4px)\'" onmouseout="this.style.transform=\'rotate(' + rot.toFixed(2) + 'deg)\'">'
      + '<div style="width:6px;height:100%;position:absolute;left:0;top:0;background:linear-gradient(180deg,' + tone + ',' + tone + '55)"></div>'
      + '<div style="font-size:15px;font-weight:600;color:var(--text);line-height:1.45">' + E(t) + '</div>'
      + (sub ? '<div style="font-size:12px;color:var(--text2);margin-top:6px;line-height:1.6">' + E(sub) + '</div>' : "")
      + '<div style="display:flex;gap:6px;align-items:center;margin-top:10px;flex-wrap:wrap">'
      + (tag ? '<span class="tag" style="background:var(--accent-wash);color:var(--accent-strong);font-size:10px">' + E(tag) + '</span>' : "")
      + '<span style="font-size:10.5px;color:var(--text3);font-family:var(--font-mono)">' + E(date || "") + '</span>'
      + (mineIdx != null ? '<span style="margin-left:auto;font-size:10.5px;color:var(--text3);cursor:pointer" onclick="event.stopPropagation();HL_IDEA_DEL(' + mineIdx + ')">✕</span>' : "")
      + '</div></div>';
  }
  var h = '<div style="display:flex;gap:10px;align-items:center;margin-bottom:14px;flex-wrap:wrap">'
    + '<span style="font-size:12px;color:var(--text2)">' + (list.length + mine.length) + ' 条灵感</span>'
    + '<button class="btn btn-sm btn-primary" onclick="HL_IDEA_ADD()">+ 记一条灵感</button>'
    + '<span style="font-size:11px;color:var(--text3)">灵感是碎片，先记下来，有空再长成内容</span></div>';
  h += '<div style="display:flex;flex-wrap:wrap;gap:14px;align-items:flex-start">';
  mine.slice().reverse().forEach(function(m, i){
    h += card(m.t, m.s || "", "我的", m.d || "", mine.length - 1 - i);
  });
  list.slice(0, 30).forEach(function(f){
    h += card(f.title || f.name, f.first || "", f.type || "灵感", String(f.modified || "").slice(0, 10), null);
  });
  if (!list.length && !mine.length) {
    h += '<div style="width:100%;text-align:center;padding:36px 0;color:var(--text3);font-size:13px">还没有灵感<br><span style="font-size:11px">点「+ 记一条灵感」随手记下第一个</span></div>';
  }
  h += '</div>';
  el.innerHTML = h;
}
function HL_IDEA_ADD() {
  var m = document.getElementById("_modal");
  if (!m) {
    m = document.createElement("div"); m.id = "_modal";
    m.style = "position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:999;display:flex;align-items:center;justify-content:center";
    m.onclick = function(e){ if (e.target === this) this.remove(); };
    document.body.appendChild(m);
  }
  m.innerHTML = '<div style="background:var(--card);border-radius:var(--r);padding:22px;width:480px;max-width:94vw;box-shadow:var(--shadow-lg)" onclick="event.stopPropagation()">'
    + '<div style="font-size:15px;font-weight:600;margin-bottom:12px">记一条灵感</div>'
    + '<input id="ideaT" placeholder="灵感标题（如：做一份班级月度热词）" style="width:100%;padding:9px 12px;border:1px solid var(--line-strong);border-radius:8px;font-size:13px;background:var(--surface);color:var(--text);margin-bottom:10px">'
    + '<textarea id="ideaS" rows="3" placeholder="补充一句（可空）" style="width:100%;padding:9px 12px;border:1px solid var(--line-strong);border-radius:8px;font-size:13px;background:var(--surface);color:var(--text);resize:vertical;margin-bottom:14px"></textarea>'
    + '<div style="display:flex;gap:10px;justify-content:flex-end"><button class="btn" onclick="this.closest(\'#_modal\').remove()">取消</button><button class="btn btn-primary" onclick="HL_IDEA_SAVE()">保存</button></div></div>';
  m.style.display = "flex";
}
function HL_IDEA_SAVE() {
  var t = (document.getElementById("ideaT") || {}).value || "";
  if (!t.trim()) { Q("写点什么吧", "warn"); return; }
  var s = (document.getElementById("ideaS") || {}).value || "";
  var mine = [];
  try { mine = JSON.parse(localStorage.getItem("tzs_ideas") || "[]"); } catch (e) {}
  mine.push({ t: t.trim(), s: s.trim(), d: new Date().toISOString().slice(0, 10) });
  try { localStorage.setItem("tzs_ideas", JSON.stringify(mine)); } catch (e) {}
  Q("灵感已记下");
  var m = document.getElementById("_modal"); if (m) m.remove();
  var box = document.getElementById("hlItems"); if (box) HLAYER_LOAD("ideas");
}
function HL_IDEA_DEL(idx) {
  var mine = [];
  try { mine = JSON.parse(localStorage.getItem("tzs_ideas") || "[]"); } catch (e) {}
  if (idx >= 0 && idx < mine.length) { mine.splice(idx, 1); try { localStorage.setItem("tzs_ideas", JSON.stringify(mine)); } catch (e) {} }
  var box = document.getElementById("hlItems"); if (box) HLAYER_LOAD("ideas");
}
