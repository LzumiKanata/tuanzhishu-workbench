/**
 * 数据可视化模块（④ 数据可视化 · codx 2026-08-07）
 * 热力图（本月团务分布）+ 雷达图（成员多维度对比）
 * 纯 SVG 内联，不引第三方库，离线可用，主题变量跟随
 */

/* ═══ 热力图：本月团务分布 ═══
 * 横轴：本月 1..N 天，纵轴：4 类（会议/活动/推优/考勤），色块深浅 = 当日该类型数量
 */
function HEATMAP() {
  var now = new Date();
  var pad = function(x) { return x < 10 ? "0" + x : String(x); };
  var rows = [
    { name: "会议", key: "mt", get: function(x) { return String(x.date || "").slice(0, 10); } },
    { name: "活动", key: "ac", get: function(x) { return String(x.date || "").slice(0, 10); } },
    { name: "推优", key: "aw", get: function(x) { return String(x.date || "").slice(0, 10); } },
    { name: "考勤", key: "kq", get: function(x) { return String(x.date || "").slice(0, 10); } }
  ];
  // 聚合指定月份
  function monthAgg(yr, mn) {
    var key = yr + "-" + pad(mn);
    var data = { mt: {}, ac: {}, aw: {}, kq: {} };
    (D.meetings || []).forEach(function(x) { var d = rows[0].get(x); if (d.slice(0, 7) === key) data.mt[d] = (data.mt[d] || 0) + 1; });
    (D.classActs || []).forEach(function(x) { var d = rows[1].get(x); if (d.slice(0, 7) === key) data.ac[d] = (data.ac[d] || 0) + 1; });
    (D.awards || []).forEach(function(x) { var d = rows[2].get(x); if (d.slice(0, 7) === key) data.aw[d] = (data.aw[d] || 0) + 1; });
    (D.attendance || []).forEach(function(x) { var d = rows[3].get(x); if (d.slice(0, 7) === key) data.kq[d] = (data.kq[d] || 0) + 1; });
    var max = 1, total = 0;
    Object.keys(data).forEach(function(t) { Object.keys(data[t]).forEach(function(d) { max = Math.max(max, data[t][d]); total += data[t][d]; }); });
    return { yr: yr, mn: mn, key: key, data: data, max: max, total: total };
  }
  // 当前月起往前找最近有数据的月份（最多 6 个月）
  var found = null;
  for (var back = 0; back < 6; back++) {
    var dt = new Date(now.getFullYear(), now.getMonth() - back, 1);
    var a = monthAgg(dt.getFullYear(), dt.getMonth() + 1);
    if (a.total > 0) { found = a; break; }
  }
  if (!found) {
    return '<div class="card"><div class="card-title">团务热力图 <span style="font-size:11px;color:var(--text3);font-weight:400">近 6 个月暂无团务记录</span></div>' +
      '<div style="padding:36px 20px;text-align:center;color:var(--text3);font-size:13px;border:1px dashed var(--line);border-radius:10px;background:var(--card-solid)">' +
      '这里会按月展示会议 / 活动 / 推优 / 考勤的分布热力图<br><span style="font-size:12px">录入几笔数据后，图会自动出现</span>' +
      '<div style="margin-top:16px;display:flex;gap:10px;justify-content:center"><button class="btn btn-sm" onclick="N(\'meetings\')">去记录会议</button><button class="btn btn-sm" onclick="N(\'classact\')">去发起活动</button></div></div></div>';
  }
  var yr = found.yr, mn = found.mn, key = found.key, data = found.data, max = found.max, total = found.total;
  var days = new Date(yr, mn, 0).getDate();
  var isCur = (yr === now.getFullYear() && mn === now.getMonth() + 1);
  var fallback = isCur ? "" : " · 本月暂无，回退展示 " + mn + " 月";

  var cellW = 20, cellH = 20, gap = 4, labelW = 44, labelH = 26;
  var W = labelW + days * (cellW + gap) + 8;
  var H = labelH + rows.length * (cellH + gap) + 30;

  var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" style="width:100%;max-width:860px;height:auto;display:block;margin:0 auto">';
  // 日期行（逢 5 标号，末位必标）
  for (var d = 1; d <= days; d++) {
    if (d === 1 || d % 5 === 0 || d === days) {
      var dx = labelW + (d - 1) * (cellW + gap) + cellW / 2;
      s += '<text x="' + dx + '" y="' + (labelH - 8) + '" text-anchor="middle" font-size="10" fill="var(--text3)">' + d + '</text>';
    }
  }
  // 今日列标记（仅展示当月时）
  if (isCur) {
    var tdx = labelW + (now.getDate() - 1) * (cellW + gap) + cellW / 2;
    s += '<line x1="' + tdx + '" y1="' + (labelH - 4) + '" x2="' + tdx + '" y2="' + (labelH + rows.length * (cellH + gap) - 4) + '" stroke="var(--primary)" stroke-width="1.4" stroke-dasharray="2 3" opacity=".6"/>';
    s += '<text x="' + tdx + '" y="' + (labelH - 17) + '" text-anchor="middle" font-size="9" fill="var(--primary)">今</text>';
  }

  // 色阶：无 / 1 / 2 / 3 / 4+。空格 = 浅色块（矩阵结构可见）；有值 = 主色四档 + 数字
  function level(v) {
    if (v <= 0) return { o: .5, c: "var(--line)", t: "", tc: "var(--text3)" };
    if (v === 1) return { o: .45, c: "var(--primary)", t: String(v), tc: "var(--primary-dark)" };
    if (v === 2) return { o: .68, c: "var(--primary)", t: String(v), tc: "var(--primary-dark)" };
    if (v === 3) return { o: .88, c: "var(--primary)", t: String(v), tc: "var(--on-primary)" };
    return { o: 1, c: "var(--primary-dark)", t: String(v), tc: "#FFFFFF" };
  }

  // 标题行（类型提示）
  rows.forEach(function(r, ri) {
    var y = labelH + ri * (cellH + gap);
    s += '<text x="' + (labelW - 6) + '" y="' + (y + cellH - 5) + '" text-anchor="end" font-size="11" fill="var(--text3)">' + r.name + '</text>';
    for (var d = 1; d <= days; d++) {
      var dateKey = key + "-" + pad(d);
      var v = data[r.key][dateKey] || 0;
      var x = labelW + (d - 1) * (cellW + gap);
      var lv = level(v);
      s += '<rect x="' + x + '" y="' + y + '" width="' + cellW + '" height="' + cellH + '" rx="2" fill="' + lv.c + '" opacity="' + lv.o + '" stroke="var(--line)" stroke-width="1">';
      s += '<title>' + dateKey + ' · ' + r.name + ' ' + v + ' 条</title></rect>';
      if (lv.t) {
        s += '<text x="' + (x + cellW / 2) + '" y="' + (y + cellH / 2 + 4) + '" text-anchor="middle" font-size="12" font-weight="700" fill="' + lv.tc + '">' + lv.t + '</text>';
      }
    }
  });
  // 周分隔线（每 7 天一条，让 31 天矩阵有节奏）
  for (var w7 = 7; w7 < days; w7 += 7) {
    var wx = labelW + w7 * (cellW + gap) - gap / 2;
    s += '<line x1="' + wx + '" y1="' + (labelH - 6) + '" x2="' + wx + '" y2="' + (labelH + rows.length * (cellH + gap) - 2) + '" stroke="var(--line)" stroke-width="1.5" opacity=".9"/>';
  }
  // 图例：无 / 1 / 2 / 3 / 4+ 五档 + 说明
  var lgY = H - 16;
  var stops = [
    ["无", 0, "var(--line)", 20],
    ["1", .45, "var(--primary)", 18],
    ["2", .68, "var(--primary)", 18],
    ["3", .88, "var(--primary)", 18],
    ["4+", 1, "var(--primary-dark)", 18]
  ];
  var lx = labelW;
  s += '<line x1="' + labelW + '" y1="' + (lgY - 16) + '" x2="' + (labelW + 262) + '" y2="' + (lgY - 16) + '" stroke="var(--line)" stroke-width="1" opacity=".6"/>';
  stops.forEach(function(st) {
    s += '<rect x="' + lx + '" y="' + (lgY - 12) + '" width="' + st[3] + '" height="12" rx="2" fill="' + st[2] + '" opacity="' + st[1] + '" stroke="var(--line)" stroke-width="1"/>';
    s += '<text x="' + (lx + st[3] / 2) + '" y="' + (lgY + 10) + '" text-anchor="middle" font-size="9" fill="var(--text3)">' + st[0] + '</text>';
    lx += st[3] + 26;
  });
  s += '<text x="' + lx + '" y="' + (lgY + 4) + '" font-size="9.5" fill="var(--text3)">格内数字 = 当天该类条数</text>';
  s += '</svg>';

  return '<div class="card" style="margin-bottom:14px"><div class="card-title">' + mn + '月 · 团务热力图 <span style="font-size:11px;color:var(--text3);font-weight:400">' + fallback + ' · 一屏看团务堆在哪几天 · 共 ' + total + ' 条</span></div>' + s + '</div>';
}

/* ═══ 雷达图：成员多维度对比 ═══
 * 五轴：出勤率 / 实践时长 / 获奖数 / 活动参与 / 任职贡献
 * 选参与度最高的 top 3 团员对比（避免 13 人叠成一团糊）
 */
function RADAR() {
  var tu = D.members.filter(function(m) { return m.memberType === "团员"; });
  if (tu.length === 0) return "";

  // 逐成员聚合五轴
  function memberDim(m) {
    var name = m.name;
    var attSum = 0, attCnt = 0;
    (D.attendance || []).forEach(function(a) {
      var ab = (a.absent || []).indexOf(name) < 0;
      if (a.total > 0) { attSum += ab ? 1 : 0; attCnt++; }
    });
    var attRate = attCnt > 0 ? attSum / attCnt : (m.memberType ? 1 : 0);
    var vol = 0;
    (D.volunteers || []).forEach(function(v) { if (String(v.name || "").trim() === name) vol += Number(v.hours) || 0; });
    var awd = 0;
    (D.awards || []).forEach(function(a) { (a.names || []).forEach(function(n) { if (String(n).trim() === name) awd++; }); });
    var act = 0;
    (D.classActs || []).forEach(function(a) { var ps = (a.participants || a.names || []); if (ps.indexOf(name) >= 0) act++; });
    var role = m.role ? 1 : 0; // 任职（班委/团干）计 1
    return { name: name, att: attRate, vol: Math.min(1, vol / 20), awd: Math.min(1, awd / 3), act: Math.min(1, act / 5), role: role };
  }
  var dims = tu.map(memberDim);

  // 参与度总分排序取 top3
  dims.forEach(function(d) { d._score = d.att * 2 + d.vol * 2 + d.awd + d.act + d.role; });
  dims.sort(function(a, b) { return b._score - a._score; });
  var top = dims.slice(0, 3);

  var axes = [
    { label: "出勤", get: function(d) { return d.att; } },
    { label: "实践", get: function(d) { return d.vol; } },
    { label: "获奖", get: function(d) { return d.awd; } },
    { label: "活动", get: function(d) { return d.act; } },
    { label: "任职", get: function(d) { return d.role; } }
  ];
  var CX = 200, CY = 170, R = 110, N = axes.length;
  function pt(i, r) {
    var ang = -Math.PI / 2 + i * 2 * Math.PI / N;
    return [CX + r * Math.cos(ang), CY + r * Math.sin(ang)];
  }
  var W2 = 420, H2 = 340;
  var s = '<svg viewBox="0 0 ' + W2 + ' ' + H2 + '" style="width:100%;max-width:560px;height:auto;display:block;margin:0 auto">';
  // 网格圆环（4 环）
  for (var ring = 1; ring <= 4; ring++) {
    var rr = R * ring / 4;
    var pts = [];
    for (var i = 0; i < N; i++) { var p = pt(i, rr); pts.push(p[0] + "," + p[1]); }
    s += '<polygon points="' + pts.join(" ") + '" fill="none" stroke="var(--line)" stroke-width="1" opacity=".5"/>';
  }
  // 轴线 + 标签
  axes.forEach(function(ax, i) {
    var p = pt(i, R);
    s += '<line x1="' + CX + '" y1="' + CY + '" x2="' + p[0] + '" y2="' + p[1] + '" stroke="var(--line)" stroke-width="1" opacity=".5"/>';
    var lp = pt(i, R + 18);
    s += '<text x="' + lp[0] + '" y="' + (lp[1] + 3) + '" text-anchor="middle" font-size="10" fill="var(--text3)">' + ax.label + '</text>';
  });
  // 中心
  s += '<circle cx="' + CX + '" cy="' + CY + '" r="2" fill="var(--text3)"/>';
  // 各成员多边形
  var colors = ["var(--primary)", "var(--gold)", "var(--text2)"];
  top.forEach(function(d, ti) {
    var pts = [];
    axes.forEach(function(ax, i) { var p = pt(i, R * Math.max(0.05, Math.min(1, ax.get(d)))); pts.push(p[0] + "," + p[1]); });
    s += '<polygon points="' + pts.join(" ") + '" fill="' + colors[ti] + '" fill-opacity=".14" stroke="' + colors[ti] + '" stroke-width="1.5"/>';
    // 顶点
    axes.forEach(function(ax, i) { var p = pt(i, R * Math.max(0.05, Math.min(1, ax.get(d)))); s += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="2" fill="' + colors[ti] + '"/>'; });
  });
  // 图例
  top.forEach(function(d, ti) {
    s += '<rect x="' + (14) + '" y="' + (14 + ti * 18) + '" width="10" height="10" rx="2" fill="' + colors[ti] + '" fill-opacity=".5"/>';
    s += '<text x="30" y="' + (23 + ti * 18) + '" font-size="11" fill="var(--text2)">' + E(d.name) + '（' + Math.round(d._score * 10) / 10 + ' 分）</text>';
  });
  s += '</svg>';

  return '<div class="card" style="margin-bottom:14px"><div class="card-title">成员活跃度雷达 <span style="font-size:11px;color:var(--text3);font-weight:400">top3 团员 · 出勤/实践/获奖/活动/任职 五维</span></div>' + s + '<div style="font-size:11px;color:var(--text3);text-align:center;margin-top:6px">出勤/实践按比例 · 获奖/活动按次数折算 · 任职按是否担任干部 · 总分满分 7 分</div></div>';
}

/* ---- TZS 注册表 ---- */
window.TZS = window.TZS || {};
window.TZS.modules_insight = { HEATMAP: HEATMAP, RADAR: RADAR };
