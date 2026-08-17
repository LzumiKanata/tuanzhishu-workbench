/**
 * 团务知识图谱 · Journey 本土化
 * 参考 Hermes Studio 学习轨迹页
 * D3-force 节点图 + 分类统计条 + 节点卡片
 * 2026-08-07 团务
 */
var JOURNEY_NODES = [];
var JOURNEY_SIM = null;

function RJ(embed) {
  var h = '';
  
  // ═══ 分类统计条 ═══
  h += '<div' + (embed ? '' : ' class="card" style="margin-bottom:10px;padding:14px 18px"') + '>';
  h += '<div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">';
  h += '<span style="font-size:12px;color:var(--text2)">◇ 团务条目</span>';
  h += '<span style="color:var(--text3);font-size:11px">→</span>';
  h += '<span style="font-size:12px;color:var(--text2)">○ 模板/流程</span>';
  h += '<span style="flex:1"></span>';
  h += '<button class="btn btn-xs" onclick="RJZOOM(1.5)">+</button>';
  h += '<button class="btn btn-xs" onclick="RJZOOM(0.7)">−</button>';
  h += '<button class="btn btn-xs" onclick="RJRESET()">重置</button>';
  h += '</div>';
  
  // 分类条
  h += '<div id="jCatBar" style="margin-top:8px;display:flex;align-items:center;gap:6px;font-size:10px">';
  h += '<span style="color:var(--text3)">加载中…</span>';
  h += '</div>';
  h += '</div>';

  // ═══ 图谱画布 ═══
  h += '<div id="jGraph" style="position:relative;background:var(--card);border:1px solid var(--line);border-radius:12px;height:460px;overflow:hidden">';
  h += '<svg id="jSvg" width="100%" height="100%" style="cursor:grab"></svg>';
  // 小地图
  h += '<div id="jMini" style="position:absolute;bottom:10px;right:10px;width:120px;height:80px;border:1px solid var(--line);border-radius:6px;background:rgba(0,0,0,.03);overflow:hidden">';
  h += '<svg id="jMiniSvg" width="100%" height="100%"></svg>';
  h += '</div>';
  // 状态栏
  h += '<div style="position:absolute;bottom:10px;left:10px;display:flex;gap:10px;font-size:10px;color:var(--text3)">';
  h += '<span id="jNodeCount">0 节点</span>';
  h += '<span id="jLinkCount">0 关系</span>';
  h += '</div>';
  h += '</div>';

  // ═══ 节点详情弹窗 ═══
  h += '<div id="jDetail" style="display:none;position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:999;background:var(--card);border:1px solid var(--line);border-radius:14px;padding:20px;width:360px;box-shadow:var(--shadow-lg)">';
  h += '<div id="jDetailContent"></div>';
  h += '</div>';

  setTimeout(buildJourney, 150);
  return h;
}

function buildJourney() {
  if (!document.getElementById("jCatBar")) return;
  // 收集团务数据构建节点
  var nodes = [];
  var links = [];
  var categories = {};
  
  // 类型A：团务条目（会议/活动/推优等）
  function addNode(id, label, type, cat, extra) {
    if (!categories[cat]) categories[cat] = { count: 0, color: getCatColor(cat) };
    categories[cat].count++;
    nodes.push({
      id: id, label: label, type: type, cat: cat,
      time: extra.time || "", count: extra.count || 0, rels: extra.rels || 0,
      group: type === "memory" ? 1 : 2
    });
  }
  
  // 内存节点：会议记录
  if (typeof D !== "undefined" && D.meetings) {
    D.meetings.forEach(function(m, i) {
      addNode("m"+i, (m.title||"会议").substring(0,18), "memory", "三会一课", 
        { time: m.date||"", count: (m.attendees||"").length||0, rels: 1 });
    });
  }
  // 活动记录
  if (typeof D !== "undefined" && D.classActs) {
    D.classActs.forEach(function(a, i) {
      addNode("a"+i, (a.title||"活动").substring(0,18), "memory", "班级活动",
        { time: a.date||"", count: (a.photos||[]).length||0, rels: 0 });
    });
  }
  // 推优
  if (typeof D !== "undefined" && D.tuitui) {
    D.tuitui.forEach(function(t, i) {
      addNode("t"+i, (t.name||"推优").substring(0,18), "memory", "推优入党",
        { time: t.date||"", rels: 1 });
    });
  }
  // 荣誉
  if (typeof D !== "undefined" && D.awards) {
    D.awards.forEach(function(w, i) {
      addNode("w"+i, (w.title||"荣誉").substring(0,18), "memory", "荣誉墙",
        { time: w.date||"", rels: 0 });
    });
  }
  
  // 类型B：模板/流程节点
  var templates = [
    { id: "tmp1", label: "三会一课记录模板", cat: "团务模板", time: "常驻" },
    { id: "tmp2", label: "推优入党流程", cat: "推优入党", time: "常驻" },
    { id: "tmp3", label: "班费收支表模板", cat: "班级事务", time: "常驻" },
    { id: "tmp4", label: "评优评先标准", cat: "评优评先", time: "常驻" },
    { id: "tmp5", label: "劳动实践认定", cat: "实践成长", time: "常驻" },
    { id: "tmp6", label: "团员教育评议", cat: "团务模板", time: "常驻" },
    { id: "tmp7", label: "团日活动策划", cat: "团务模板", time: "常驻" },
  ];
  templates.forEach(function(t) {
    addNode(t.id, t.label, "skill", t.cat, { time: t.time, count: 0, rels: 1 });
  });

  // 连线：模板关联到相关条目
  nodes.forEach(function(n) {
    if (n.type === "memory" && n.cat === "三会一课") {
      links.push({ source: n.id, target: "tmp1" });
    }
    if (n.type === "memory" && n.cat === "推优入党") {
      links.push({ source: n.id, target: "tmp2" });
    }
    if (n.type === "memory" && n.cat === "荣誉墙") {
      links.push({ source: n.id, target: "tmp4" });
    }
  });

  JOURNEY_NODES = nodes;

  // 渲染分类统计条
  renderCatBar(categories);
  
  // 渲染图谱
  renderJourneyGraph(nodes, links);

  // 更新状态
  document.getElementById("jNodeCount").textContent = nodes.length + " 节点";
  document.getElementById("jLinkCount").textContent = links.length + " 关系";
}

function getCatColor(cat) {
  var map = {
    "三会一课": "#D4A85C", "班级活动": "#5B9BD5", "推优入党": "#C45070",
    "荣誉墙": "#D29922", "团务模板": "#5B8C5B", "班级事务": "#9B7A85",
    "评优评先": "#8BB87B", "实践成长": "#7BB8E0"
  };
  return map[cat] || "#8B949E";
}

function renderCatBar(cats) {
  var bar = document.getElementById("jCatBar");
  if (!bar) return;
  var total = Object.values(cats).reduce(function(s, c) { return s + c.count; }, 0);
  var h = '';
  var keys = Object.keys(cats).sort(function(a, b) { return cats[b].count - cats[a].count; });
  
  // 堆叠条
  h += '<div style="display:flex;height:8px;border-radius:4px;overflow:hidden;flex:1;min-width:200px">';
  keys.forEach(function(k) {
    var pct = (cats[k].count / total * 100).toFixed(1);
    h += '<div title="' + k + ': ' + cats[k].count + '" style="width:' + pct + '%;background:' + cats[k].color + '"></div>';
  });
  h += '</div>';
  
  // 图例
  h += '<div style="display:flex;flex-wrap:wrap;gap:4px 12px">';
  keys.forEach(function(k) {
    h += '<span style="display:inline-flex;align-items:center;gap:4px">';
    h += '<span style="width:6px;height:6px;border-radius:50%;background:' + cats[k].color + '"></span>';
    h += '<span style="color:var(--text2)">' + k + '</span>';
    h += '<span style="color:var(--text3)">· ' + cats[k].count + '</span>';
    h += '</span>';
  });
  h += '</div>';

  bar.innerHTML = h;
}

function renderJourneyGraph(nodes, links) {
  if (!document.getElementById("jSvg") || !document.getElementById("jGraph")) return;
  var svg = d3.select("#jSvg");
  var width = document.getElementById("jGraph").clientWidth;
  var height = 460;
  svg.attr("viewBox", [0, 0, width, height]);

  svg.selectAll("*").remove();
  
  var g = svg.append("g");

  // 缩放
  var zoom = d3.zoom().scaleExtent([0.3, 3]).on("zoom", function(e) {
    g.attr("transform", e.transform);
    updateMiniMap(e.transform);
  });
  svg.call(zoom);

  // 力导向
  var sim = d3.forceSimulation(nodes)
    .force("link", d3.forceLink(links).id(function(d) { return d.id; }).distance(100))
    .force("charge", d3.forceManyBody().strength(-300))
    .force("center", d3.forceCenter(width/2, height/2))
    .force("collision", d3.forceCollide(40));

  // 连线
  var link = g.append("g").selectAll("line")
    .data(links).join("line")
    .attr("stroke", "var(--line)")
    .attr("stroke-width", 1.5)
    .attr("stroke-dasharray", "4,3");

  // 节点
  var node = g.append("g").selectAll("g")
    .data(nodes).join("g")
    .call(d3.drag()
      .on("start", function(e, d) { if (!e.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
      .on("drag", function(e, d) { d.fx = e.x; d.fy = e.y; })
      .on("end", function(e, d) { if (!e.active) sim.alphaTarget(0); d.fx = null; d.fy = null; })
    )
    .on("click", function(e, d) { showJourneyDetail(d); });

  // 节点卡片背景
  node.append("rect")
    .attr("rx", 8).attr("ry", 8)
    .attr("fill", "var(--card)")
    .attr("stroke", function(d) { return getCatColor(d.cat); })
    .attr("stroke-width", 1.5)
    .attr("stroke-opacity", 0.6)
    .attr("filter", "drop-shadow(0 1px 3px rgba(0,0,0,.06))");

  // 类型标签
  node.append("text")
    .attr("text-anchor", "start")
    .attr("dy", "-0.3em")
    .attr("font-size", "9px")
    .attr("fill", function(d) { return getCatColor(d.cat); })
    .attr("font-weight", "500")
    .text(function(d) { return d.type === "memory" ? "◇ 条目" : "○ 模板"; });

  // 标题
  node.append("text")
    .attr("text-anchor", "start")
    .attr("dy", "0.8em")
    .attr("font-size", "11px")
    .attr("fill", "var(--text)")
    .text(function(d) { return d.label.substring(0, 12); });

  // 底部信息
  node.append("text")
    .attr("text-anchor", "start")
    .attr("dy", "2em")
    .attr("font-size", "8px")
    .attr("fill", "var(--text3)")
    .text(function(d) { return d.time.substring(0, 10) + " · " + d.rels + "关系"; });

  // 动态调整卡片大小
  node.each(function(d) {
    var labelLen = d.label.length;
    var w = Math.max(92, labelLen * 6.5 + 18);
    var h = 52;
    d3.select(this).select("rect").attr("width", w).attr("height", h).attr("x", -w/2).attr("y", -h/2);
    d3.select(this).selectAll("text").attr("x", -w/2 + 8);
  });

  sim.on("tick", function() {
    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });
    node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
    updateMiniMap(d3.zoomTransform(svg.node()));
  });

  JOURNEY_SIM = sim;

  // 小地图
  renderMiniMap(nodes, links);
}

function renderMiniMap(nodes, links) {
  var mini = d3.select("#jMiniSvg");
  if (mini.empty()) return;
  mini.selectAll("*").remove();
  var mw = 120, mh = 80;
  mini.attr("viewBox", [0, 0, mw, mh]);
  
  // 缩放比例
  var xs = nodes.map(function(d) { return d.x||0; });
  var ys = nodes.map(function(d) { return d.y||0; });
  var minX = Math.min.apply(null, xs), maxX = Math.max.apply(null, xs);
  var minY = Math.min.apply(null, ys), maxY = Math.max.apply(null, ys);
  var scale = Math.min(mw/(maxX-minX+100), mh/(maxY-minY+100), 1);

  mini.selectAll("circle")
    .data(nodes).join("circle")
    .attr("cx", function(d) { return ((d.x||0)-minX)*scale + 10; })
    .attr("cy", function(d) { return ((d.y||0)-minY)*scale + 10; })
    .attr("r", 2)
    .attr("fill", function(d) { return getCatColor(d.cat); })
    .attr("opacity", 0.6);
}

function updateMiniMap(transform) {
  // 简化：更新小地图视口框
}

function showJourneyDetail(d) {
  var detail = document.getElementById("jDetail");
  if (!detail) return;
  var h = '<div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:14px">';
  h += '<div><span class="tag tag-p" style="background:' + getCatColor(d.cat) + '20;color:' + getCatColor(d.cat) + '">' + E(d.cat) + '</span></div>';
  h += '<button class="btn btn-xs" onclick="document.getElementById(\'jDetail\').style.display=\'none\'">✕</button>';
  h += '</div>';
  h += '<div style="font-size:15px;font-weight:500;color:var(--text);margin-bottom:6px">' + E(d.label) + '</div>';
  h += '<div style="font-size:11px;color:var(--text3);display:flex;gap:14px">';
  h += '<span>🕐 ' + (d.time||"未知") + '</span>';
  h += '<span>🔗 ' + d.rels + ' 关系</span>';
  if (d.count) h += '<span>📎 ' + d.count + ' 项</span>';
  h += '</div>';
  document.getElementById("jDetailContent").innerHTML = h;
  detail.style.display = "block";
  
  // 点击外部关闭
  setTimeout(function() {
    document.addEventListener("click", function closeJ(e) {
      if (!e.target.closest("#jDetail") && !e.target.closest("g")) {
        document.getElementById("jDetail").style.display = "none";
        document.removeEventListener("click", closeJ);
      }
    });
  }, 100);
}

function RJZOOM(scale) {
  var svg = d3.select("#jSvg");
  svg.transition().duration(300).call(
    d3.zoom().scaleBy, scale
  );
}

function RJRESET() {
  var svg = d3.select("#jSvg");
  svg.transition().duration(400).call(
    d3.zoom().transform, d3.zoomIdentity
  );
}
