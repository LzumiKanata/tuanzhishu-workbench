/**
 * 知识中心 · Obsidian + 微信社交深度联动
 * 对接 bridge.py API (127.0.0.1:8765)
 * 2026-08-07 团务 v2
 */
var BRIDGE = "http://127.0.0.1:8765";

function apiCall(path) {
  return fetch(BRIDGE + path)
    .then(function(r) { return r.json(); })
    .catch(function() { return { error: "API 未连接" }; });
}

function RK() {
  var h = '<div style="padding:4px 0">';
  
  // 搜索
  h += '<div class="card" style="margin-bottom:14px">';
  h += '<div class="card-title">🔍 搜索知识库</div>';
  h += '<div style="display:flex;gap:8px">';
  h += '<input id="ksInput" placeholder="搜笔记/人物/关键词…" style="flex:1;padding:8px 12px;border:1px solid var(--line);border-radius:8px;font-size:13px;background:var(--card);color:var(--text)" onkeydown="if(event.key===\'Enter\')KSEARCH()">';
  h += '<button class="btn btn-primary btn-sm" onclick="KSEARCH()" style="height:38px">搜索</button>';
  h += '</div><div id="ksResults" style="margin-top:12px"></div></div>';

  // 双栏：社交+笔记
  h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px"><div>';

  // 社交热力
  h += '<div class="card"><div class="card-title">💬 社交热力</div>';
  h += '<div id="socialDash" style="font-size:12px;color:var(--text3)">加载中…</div></div>';

  // 人物速览
  h += '<div class="card" style="margin-top:14px"><div class="card-title">👤 人物速览</div>';
  h += '<div id="peopleList" style="font-size:12px;color:var(--text3)">加载中…</div></div>';
  h += '</div><div>';

  // 工作台状态
  h += '<div class="card"><div class="card-title">📊 工作台状态</div>';
  h += '<div id="wbStatus" style="font-size:12px;color:var(--text3)">加载中…</div></div>';

  // 最近笔记
  h += '<div class="card" style="margin-top:14px"><div class="card-title">📝 最近笔记</div>';
  h += '<div id="recentNotes" style="font-size:12px;color:var(--text3)">加载中…</div></div>';

  // 快捷操作
  h += '<div class="card" style="margin-top:14px"><div class="card-title">⚡ 快捷操作</div>';
  h += '<div style="display:flex;flex-wrap:wrap;gap:6px">';
  h += '<button class="btn btn-sm" onclick="KSEARCH2(\'团支书\')">🔎 搜"团支书"</button>';
  h += '<button class="btn btn-sm" onclick="KSEARCH2(\'会议\')">📋 搜"会议"</button>';
  h += '<button class="btn btn-sm" onclick="KSEARCH2(\'张晨\')">💬 搜"张晨"</button>';
  h += '</div></div>';

  h += '</div></div></div>';
  setTimeout(loadKnowledge, 100);
  h += (window.HKB ? HKB() : '');
return h;
}

function loadKnowledge() {
  // 社交数据
  apiCall("/api/wx/stats").then(function(data) {
    var el = document.getElementById("socialDash");
    if (!el) return;
    if (data.error) { el.innerHTML = "⚡ " + data.error; return; }
    if (!data.total_people) { el.innerHTML = "暂无社交数据"; return; }
    var h = '<div style="margin-bottom:8px;font-size:11px;color:var(--text3)">👥 ' + data.total_people + '人 · ' + (data.total_messages||0).toLocaleString() + '条 · ' + data.groups + '群</div>';
    (data.all_people||[]).slice(0,8).forEach(function(p) {
      var pct = Math.min(100, (p.messages||0) / 55367 * 100);
      h += '<div style="display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid var(--line);cursor:pointer" onclick="KPEOPLE(quickEscape(\'' + p.name + '\'))">';
      h += '<span style="width:70px;font-size:12px;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + E(p.name) + '</span>';
      h += '<div style="flex:1;height:5px;background:var(--line);border-radius:3px;overflow:hidden"><div style="height:100%;background:var(--primary);border-radius:3px;width:' + pct + '%"></div></div>';
      h += '<span style="font-size:10px;color:var(--text3);width:50px;text-align:right">' + (p.messages||0).toLocaleString() + '</span></div>';
    });
    el.innerHTML = h;
  });

  // 最近笔记
  apiCall("/api/vault/recent?limit=6").then(function(data) {
    var el = document.getElementById("recentNotes");
    if (!el) return;
    if (data.error) { el.textContent = "⚠️ " + data.error; return; }
    if (!Array.isArray(data) || data.length === 0) { el.textContent = "暂无笔记"; return; }
    var h = '';
    data.forEach(function(note) {
      var name = E(note.name || note.path);
      var time = (note.modified || "").slice(0,10);
      var encoded = encodeURIComponent(note.path || "");
      h += '<div style="display:flex;align-items:center;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--line);cursor:pointer" onclick="KREAD(quickEscape(\'' + encoded + '\'))">';
      h += '<span style="color:var(--text);font-size:12px">📄 ' + name + '</span>';
      h += '<span style="color:var(--text3);font-size:10px">' + time + '</span></div>';
    });
    el.innerHTML = h;
  });

  // 人物
  apiCall("/api/people").then(function(data) {
    var el = document.getElementById("peopleList");
    if (!el) return;
    if (data.error || !Array.isArray(data) || data.length === 0) { el.innerHTML = "暂无人物数据"; return; }
    var h = '<div style="display:flex;flex-wrap:wrap;gap:6px">';
    data.forEach(function(p) {
      if (!p.name || p.name === "index" || p.name === "log" || p.name === "SCHEMA") return;
      h += '<span class="tag tag-p" style="cursor:pointer" onclick="KPEOPLE(quickEscape(\'' + p.name + '\'))">' + E(p.name) + '</span>';
    });
    h += '</div>'; el.innerHTML = h;
  });

  // 工作台状态
  apiCall("/api/workbench/status").then(function(data) {
    var el = document.getElementById("wbStatus");
    if (!el) return;
    if (data.error) { el.textContent = "⚠️ " + data.error; return; }
    var h = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">';
    h += '<div><span style="font-size:22px;font-weight:600;color:var(--primary)">' + (data.total_members||0) + '</span><br><span style="font-size:11px;color:var(--text3)">全班人数</span></div>';
    h += '<div><span style="font-size:22px;font-weight:600;color:var(--text)">' + (data.tuan_members||0) + '</span><br><span style="font-size:11px;color:var(--text3)">团员</span></div>';
    h += '</div>'; el.innerHTML = h;
  });
}

function quickEscape(s) { return (s||"").replace(/'/g, "%27").replace(/"/g, "%22"); }

function KSEARCH() {
  var q = document.getElementById("ksInput").value.trim();
  if (!q) return;
  var el = document.getElementById("ksResults");
  el.innerHTML = '<span style="color:var(--text3);font-size:12px">搜索中…</span>';
  apiCall("/api/vault/search?q=" + encodeURIComponent(q)).then(function(data) {
    if (data.error) { el.innerHTML = '<span style="color:var(--error)">' + data.error + '</span>'; return; }
    if (!Array.isArray(data) || data.length === 0) { el.innerHTML = '<span style="color:var(--text3)">未找到 "' + E(q) + '"</span>'; return; }
    var h = '<div style="font-size:12px;color:var(--text2);margin-bottom:8px">找到 ' + data.length + ' 条：</div>';
    data.forEach(function(r) {
      h += '<div style="padding:8px 0;border-bottom:1px solid var(--line);cursor:pointer" onclick="KREAD(quickEscape(\'' + (r.path||"") + '\'))">';
      h += '<div style="color:var(--primary);font-weight:500">📄 ' + E(r.name) + '</div>';
      h += '<div style="color:var(--text3);font-size:11px;margin-top:2px">' + E(r.snippet||"").substring(0,100) + '</div></div>';
    });
    el.innerHTML = h;
  });
}
function KSEARCH2(q) { var inp = document.getElementById("ksInput"); if (inp) { inp.value = q; KSEARCH(); } }

function KREAD(path) {
  apiCall("/api/vault/read?file=" + path).then(function(data) {
    if (data.error) { Q(data.error, "err"); return; }
    var m = document.createElement("div");
    m.style = "position:fixed;inset:0;background:rgba(0,0,0,.35);z-index:999;display:flex;align-items:center;justify-content:center";
    m.onclick = function(e) { if (e.target === this) this.remove(); };
    m.innerHTML = '<div onclick="event.stopPropagation()" style="background:var(--card);border-radius:14px;padding:24px;width:680px;max-height:80vh;overflow-y:auto;box-shadow:var(--shadow-lg)">'
      + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">'
      + '<div style="font-weight:500;color:var(--primary)">📄 ' + E(data.path||"") + '</div>'
      + '<button class="btn btn-sm" onclick="this.closest(\'div[style*=fixed]\').remove()">关闭</button></div>'
      + '<div style="font-size:13px;line-height:1.8;white-space:pre-wrap;color:var(--text)">' + E(data.content||"").substring(0,8000) + '</div></div>';
    document.body.appendChild(m);
  });
}

function KPEOPLE(name) {
  var decoded = decodeURIComponent(name);
  apiCall("/api/people/" + decoded).then(function(data) {
    if (!data.found) {
      // Try WeChat API
      apiCall("/api/wx/people/" + decoded).then(function(wxData) {
        if (wxData.error) { Q("未找到: " + decoded, "warn"); return; }
        showPersonModal(wxData.name, wxData.messages, wxData.content);
      });
      return;
    }
    showPersonModal(data.name, 0, data.content);
  });
}
function showPersonModal(name, msgs, content) {
  var m = document.createElement("div");
  m.style = "position:fixed;inset:0;background:rgba(0,0,0,.35);z-index:999;display:flex;align-items:center;justify-content:center";
  m.onclick = function(e) { if (e.target === this) this.remove(); };
  var title = name + (msgs ? " · " + msgs.toLocaleString() + "条消息" : "");
  m.innerHTML = '<div onclick="event.stopPropagation()" style="background:var(--card);border-radius:14px;padding:24px;width:600px;max-height:80vh;overflow-y:auto;box-shadow:var(--shadow-lg)">'
    + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">'
    + '<div style="font-size:18px;font-weight:500;color:var(--primary)">👤 ' + E(title) + '</div>'
    + '<button class="btn btn-sm" onclick="this.closest(\'div[style*=fixed]\').remove()">关闭</button></div>'
    + '<div style="font-size:13px;line-height:1.8;white-space:pre-wrap;color:var(--text)">' + E(content||"暂无数据").substring(0,5000) + '</div></div>';
  document.body.appendChild(m);
}
