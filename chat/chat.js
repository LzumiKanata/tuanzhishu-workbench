/* norm聊天组件（统一实现，P0-1）
   主站内嵌（embed）与独立窗口（window）复用同一套逻辑。
   架构铁律：事件用 addEventListener/委托，不用内联 onclick；
   动态文本用 textContent 注入，不拼 innerHTML（XSS 防御）。 */
(function () {
  'use strict';

  var SUGGESTIONS = [
    '工作台有什么异常？',
    '帮我拟个活动通知',
    '谁缺勤最多？',
    '近期有什么要做的？'
  ];

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /* ---- 安全 Markdown 渲染(四.4) ----
     网络受限无法引入 marked.js,自写轻量渲染器。
     架构铁律不变:全 DOM API + textContent 构建,零 innerHTML。
     覆盖:标题/列表/代码块/引用/分割线 + 粗体/斜体/行内代码/链接。 */
  function inlineToNodes(text) {
    var frag = document.createDocumentFragment();
    var re = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
    var last = 0, m;
    while ((m = re.exec(text))) {
      if (m.index > last) frag.appendChild(document.createTextNode(text.slice(last, m.index)));
      var tok = m[0];
      var node;
      if (/^\*\*/.test(tok)) { node = document.createElement('strong'); node.textContent = tok.slice(2, -2); }
      else if (/^\*/.test(tok)) { node = document.createElement('em'); node.textContent = tok.slice(1, -1); }
      else if (/^`/.test(tok)) { node = document.createElement('code'); node.textContent = tok.slice(1, -1); }
      else if (/^\[/.test(tok)) {
        var mm = tok.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        node = document.createElement('a');
        node.textContent = mm ? mm[1] : tok;
        node.target = '_blank';
        node.rel = 'noopener';
        // 只放行 http(s),防 javascript: 协议注入
        node.href = (mm && /^https?:\/\//i.test(mm[2])) ? mm[2] : '#';
      }
      frag.appendChild(node);
      last = m.index + tok.length;
    }
    if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
    return frag;
  }

  function mdToNodes(text) {
    var frag = document.createDocumentFragment();
    var lines = String(text == null ? '' : text).split('\n');
    var i = 0, inList = null;
    var para = [];

    function flushPara() {
      if (!para.length) return;
      var p = document.createElement('p');
      para.forEach(function (ln, idx) {
        if (idx) p.appendChild(document.createElement('br'));
        p.appendChild(inlineToNodes(ln));
      });
      frag.appendChild(p);
      para = [];
    }
    function closeList() { inList = null; }

    while (i < lines.length) {
      var line = lines[i];
      var t = line.trim();
      if (!t) { i++; continue; }
      // 代码块
      if (/^```/.test(t)) {
        flushPara(); closeList();
        var code = [];
        i++;
        while (i < lines.length && !/^```/.test(lines[i].trim())) { code.push(lines[i]); i++; }
        i++;
        var pre = document.createElement('pre');
        var codeEl = document.createElement('code');
        codeEl.textContent = code.join('\n');
        pre.appendChild(codeEl);
        frag.appendChild(pre);
        continue;
      }
      // 标题
      var h = t.match(/^(#{1,6})\s+(.*)$/);
      if (h) {
        flushPara(); closeList();
        var hd = document.createElement('h' + Math.min(h[1].length, 6));
        hd.appendChild(inlineToNodes(h[2]));
        frag.appendChild(hd);
        i++; continue;
      }
      // 分割线
      if (/^(-{3,}|\*{3,})$/.test(t)) {
        flushPara(); closeList();
        frag.appendChild(document.createElement('hr'));
        i++; continue;
      }
      // 列表
      var ul = t.match(/^[-*+]\s+(.*)$/);
      var ol = t.match(/^\d+\.\s+(.*)$/);
      if (ul || ol) {
        flushPara();
        var tag = ul ? 'ul' : 'ol';
        if (!inList || inList.tagName.toLowerCase() !== tag) {
          inList = document.createElement(tag);
          frag.appendChild(inList);
        }
        var li = document.createElement('li');
        li.appendChild(inlineToNodes((ul || ol)[1]));
        inList.appendChild(li);
        i++; continue;
      }
      closeList();
      // 引用
      var q = t.match(/^>\s?(.*)$/);
      if (q) {
        flushPara();
        var bq = document.createElement('blockquote');
        bq.appendChild(inlineToNodes(q[1]));
        frag.appendChild(bq);
        i++; continue;
      }
      // 普通行:收集成段
      para.push(line);
      i++;
    }
    flushPara(); closeList();
    return frag;
  }

  /* 统一请求通道：主站走 API.askAi（api.js），独立窗口走 pywebview.api.ask_ai，浏览器模式走数字人服务器 */
  function askChannel(msg) {
    var db = '{}';
    try {
      if (window.D) { db = JSON.stringify(window.D); }
      else { db = localStorage.getItem('tzs_db') || '{}'; }
    } catch (e) { db = '{}'; }
    if (window.API && typeof API.askAi === 'function') {
      return API.askAi(msg, db);
    }
    if (window.pywebview && window.pywebview.api && typeof window.pywebview.api.ask_ai === 'function') {
      return window.pywebview.api.ask_ai(msg, db);
    }
    /* 数字人服务器 fallback（端口 8780） */
    return fetch('http://127.0.0.1:8780/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: msg, database: db, mode: 'biankuan' })
    }).then(function (r) {
      if (!r.ok) throw new Error('norm无响应 (' + r.status + ')');
      return r.json();
    }).then(function (d) {
      if (d.error) throw new Error(d.error);
      return d.reply;
    });
  }

  function makeEl(tag, cls, text) {
    var el = document.createElement(tag);
    if (cls) el.className = cls;
    if (text != null) el.textContent = text;
    return el;
  }

  function MB_INIT(container, opts) {
    if (!container) return;
    opts = opts || {};
    var mode = opts.mode === 'window' ? 'window' : 'embed';
    var busy = false;

    /* ---- 结构 ---- */
    var root = document.createElement('div');
    root.className = 'mambo-chat' + (mode === 'window' ? ' mambo-app' : '');

    if (mode === 'window') {
      var head = document.createElement('div');
      head.className = 'app-head';
      var logo = makeEl('div', 'logo', 'N');
      var titles = document.createElement('div');
      titles.className = 'titles';
      titles.appendChild(makeEl('h1', null, opts.title || 'norm AI 助手'));
      titles.appendChild(makeEl('div', 'status', opts.sub || '● 已连接工作台 · 数据实时可读'));
      var clearBtn = makeEl('button', 'btn', '🗑 清空');
      clearBtn.addEventListener('click', clearChat);
      head.appendChild(logo); head.appendChild(titles); head.appendChild(clearBtn);
      root.appendChild(head);
    }

    var body = document.createElement('div');
    body.className = 'chat-body';

    var qs = document.createElement('div');
    qs.className = 'quick-suggest';

    var bar = document.createElement('div');
    bar.className = 'input-bar';
    var input = document.createElement('input');
    input.id = 'mbInput';
    input.placeholder = '问norm：谁缺勤最多？帮我拟个活动通知…';
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); send(); }
    });
    var sendBtn = makeEl('button', null, '➤');
    sendBtn.addEventListener('click', send);
    bar.appendChild(input); bar.appendChild(sendBtn);

    root.appendChild(body); root.appendChild(qs); root.appendChild(bar);
    container.appendChild(root);

  /* ---- 消息渲染（DOM API + textContent/Markdown 安全渲染，四.4/四.5） ---- */
    var HISTORY_KEY = 'tzs_mb_history';
    var history = [];
    function saveHistory() {
      try { localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(-200))); } catch (e) {}
    }
    function loadHistory() {
      try {
        var r = localStorage.getItem(HISTORY_KEY);
        if (!r) return [];
        var h = JSON.parse(r);
        return Array.isArray(h) ? h.filter(function (x) { return x && x.role && typeof x.text === 'string'; }) : [];
      } catch (e) { return []; }
    }

    function addMsg(role, text) {
      var div = document.createElement('div');
      div.className = 'msg ' + role;
      div.appendChild(makeEl('div', 'avatar', role === 'ai' ? 'N' : '我'));
      var bubble = document.createElement('div');
      bubble.className = 'bubble';
      if (role === 'ai') {
        bubble.appendChild(mdToNodes(text));
      } else {
        bubble.textContent = text;
      }
      bubble.setAttribute('data-text', text);
      bubble.appendChild(makeEl('button', 'copy-btn', '复制'));
      div.appendChild(bubble);
      body.appendChild(div);
      body.scrollTop = body.scrollHeight;
      history.push({ role: role, text: text });
      saveHistory();
      return div;
    }

    function showTyping() {
      var div = document.createElement('div');
      div.className = 'msg ai';
      div.id = 'mbTyping';
      div.appendChild(makeEl('div', 'avatar', 'N'));
      var bubble = document.createElement('div');
      bubble.className = 'bubble';
      var t = document.createElement('span');
      t.className = 'typing';
      t.appendChild(makeEl('span')); t.appendChild(makeEl('span')); t.appendChild(makeEl('span'));
      bubble.appendChild(t);
      div.appendChild(bubble);
      body.appendChild(div);
      body.scrollTop = body.scrollHeight;
    }

    function removeTyping() {
      var t = document.getElementById('mbTyping');
      if (t) t.remove();
    }

    function greet() {
      addMsg('ai', '你好，我是norm，你的班团 AI 助手。\n\n我能读工作台的数据帮你：\n\n查统计：团员、考勤、劳动实践、班费、活动\n找问题：谁缺勤多、谁还没达标\n写材料：活动通知、会议纪要、工作总结\n提建议：推优、评优、时间安排\n\n直接提问即可。');
    }

    function clearChat() {
      body.innerHTML = '';
      history = [];
      try { localStorage.removeItem(HISTORY_KEY); } catch (e) {}
      greet();
    }

    function quickAsk(text) {
      input.value = text;
      send();
    }

    function send() {
      if (busy) return;
      var msg = input.value.trim();
      if (!msg) return;
      input.value = '';
      addMsg('user', msg);
      showTyping();
      busy = true;
      sendBtn.disabled = true;
      var timer = new Promise(function (_, rej) {
        setTimeout(function () { rej(new Error('服务超时（15秒），请稍后重试')); }, 15000);
      });
      askChannel(msg).then(function (reply) {
        removeTyping();
        addMsg('ai', reply);
      }).catch(function (e) {
        removeTyping();
        var hint = '';
        if (/401|404/.test(String(e && e.message))) {
          hint = '\n\n提示：如果提示 HTTP 401/404，请检查 DEEPSEEK_API_KEY 配置。';
        }
        addMsg('ai', '连接失败：' + (e && e.message ? e.message : '未知错误') + hint);
      }).then(function () {
        busy = false;
        sendBtn.disabled = false;
        input.focus();
      });
    }

    /* ---- 事件委托（不内联 onclick） ---- */
    qs.addEventListener('click', function (e) {
      var q = e.target.closest ? e.target.closest('.qs') : null;
      if (q) quickAsk(q.getAttribute('data-text') || '');
    });
    body.addEventListener('click', function (e) {
      var btn = e.target.closest ? e.target.closest('.copy-btn') : null;
      if (!btn) return;
      var bubble = btn.closest('.bubble');
      var text = bubble ? (bubble.getAttribute('data-text') || '') : '';
      var done = function () {
        btn.textContent = '✅ 已复制';
        setTimeout(function () { btn.textContent = '复制'; }, 1200);
      };
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(done).catch(function () {
          var ta = document.createElement('textarea');
          ta.value = text; ta.style.cssText = 'position:fixed;opacity:0';
          document.body.appendChild(ta); ta.select();
          try { document.execCommand('copy'); } catch (err) {}
          document.body.removeChild(ta);
          done();
        });
      }
    });

    /* ---- 快捷词渲染：data-text 存原文，事件委托取（P0-2 延续） ---- */
    SUGGESTIONS.forEach(function (s) {
      var span = document.createElement('span');
      span.className = 'qs';
      span.textContent = s;
      span.setAttribute('data-text', s);
      qs.appendChild(span);
    });

    /* ---- 初始化:恢复对话历史(四.5) ---- */
    var saved = loadHistory();
    if (saved.length) {
      saved.forEach(function (m) {
        var div = document.createElement('div');
        div.className = 'msg ' + m.role;
        div.appendChild(makeEl('div', 'avatar', m.role === 'ai' ? 'N' : '我'));
        var bubble = document.createElement('div');
        bubble.className = 'bubble';
        if (m.role === 'ai') {
          bubble.appendChild(mdToNodes(m.text));
        } else {
          bubble.textContent = m.text;
        }
        bubble.setAttribute('data-text', m.text);
        bubble.appendChild(makeEl('button', 'copy-btn', '复制'));
        div.appendChild(bubble);
        body.appendChild(div);
      });
      body.scrollTop = body.scrollHeight;
      history = saved.slice();
    } else {
      greet();
    }
    input.focus();
  }

  window.MB_INIT = MB_INIT;
})();
