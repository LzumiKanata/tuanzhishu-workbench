"""
超级工作台 · 本地 API 桥 (bridge.py)
端口 8765，连接 Obsidian 知识库 + 团支书工作台 + Hermes Agent
启动: python bridge.py
"""
import http.server
import json
import os
import re
import urllib.parse
from datetime import datetime
from pathlib import Path

# ═══ 配置 ═══
PORT = 8765
OBSIDIAN_VAULT = Path(r"D:\小马儿-obsidian知识库\小马儿")
DIRECT_CALL = Path(r"D:\小马儿-直接调用")
WECHAT_RAW = Path(r"D:\微信原始数据")
WORKBENCH = Path(r"C:\Users\15090\Desktop\团支书工作台")
WORKBENCH_DATA = WORKBENCH / "tuanzhishu_data.json"
PEOPLE_DIR = DIRECT_CALL / "人物"

# ═══ 微信数据函数 ═══
def wx_people_summary():
    """13人物摘要：姓名+消息量+性格标签"""
    people = []
    if PEOPLE_DIR.exists():
        for f in sorted(PEOPLE_DIR.glob("*.md")):
            content = read_file_safe(f, 2000)
            msgs = re.search(r'消息量[：:]\s*([\d,]+)', content)
            msg_count = int(msgs.group(1).replace(",","")) if msgs else 0
            # 提取第一行正文
            lines = content.split("n")
            title = f.stem
            brief = ""
            for line in lines:
                if line.startswith("## ") and "数据" not in line:
                    brief = line.strip("# ")[:60]
                    break
            # 提取性格关键词
            traits = []
            for m in re.finditer(r'[*]{2}([^*]+)[*]{2}[：:]s*(.+)', content):
                traits.append({"dim": m.group(1).strip(), "desc": m.group(2).strip()[:40]})
            people.append({
                "name": title, "messages": msg_count,
                "brief": brief, "traits": traits[:3]
            })
    return sorted(people, key=lambda p: p["messages"], reverse=True)

def wx_person_detail(name):
    """人物完整性格画像"""
    fp = PEOPLE_DIR / f"{name}.md"
    if not fp.exists():
        return {"error": "未找到", "name": name}
    content = read_file_safe(fp)
    msgs = re.search(r'消息量[：:]\s*([\d,]+)', content)
    return {
        "name": name, "content": content,
        "messages": int(msgs.group(1).replace(",","")) if msgs else 0
    }

def wx_stats():
    """整体统计"""
    people = wx_people_summary()
    total_msgs = sum(p["messages"] for p in people)
    return {
        "total_people": len(people),
        "total_messages": total_msgs,
        "top5": people[:5],
        "groups": 131,
        "all_people": people
    }

def wx_entities(limit=50):
    """微信实体列表"""
    ents_dir = WECHAT_RAW / "entities"
    if not ents_dir.exists():
        return []
    items = []
    for f in sorted(ents_dir.glob("*.md"))[:limit]:
        items.append({"name": f.stem, "size": f.stat().st_size})
    return items


def read_file_safe(path, max_bytes=500_000):
    """安全读取文件"""
    try:
        with open(path, "r", encoding="utf-8") as f:
            return f.read(max_bytes)
    except Exception as e:
        return f"[ERROR] {e}"


def list_md_files(directory, pattern="*.md", max_depth=3):
    """列出目录下的 markdown 文件"""
    files = []
    base = Path(directory)
    for p in base.rglob(pattern):
        if len(p.relative_to(base).parts) <= max_depth:
            stat = p.stat()
            files.append({
                "name": p.name.replace(".md", ""),
                "path": str(p.relative_to(base)).replace("\\", "/"),
                "size": stat.st_size,
                "modified": datetime.fromtimestamp(stat.st_mtime).isoformat()
            })
    return sorted(files, key=lambda x: x["modified"], reverse=True)


def search_vault(query):
    """全文搜索 Obsidian vault"""
    results = []
    for md in OBSIDIAN_VAULT.rglob("*.md"):
        try:
            content = read_file_safe(md, 100_000)
            if query.lower() in content.lower():
                # 提取匹配上下文
                idx = content.lower().find(query.lower())
                start = max(0, idx - 80)
                end = min(len(content), idx + len(query) + 80)
                snippet = content[start:end].replace("\n", " ")
                results.append({
                    "name": md.stem,
                    "path": str(md.relative_to(OBSIDIAN_VAULT)).replace("\\", "/"),
                    "snippet": f"...{snippet}..."
                })
        except:
            pass
        if len(results) >= 20:
            break
    return results


def get_person(name):
    """从团务记录获取人物画像"""
    person_file = DIRECT_CALL / f"{name}.md"
    if person_file.exists():
        return {"name": name, "content": read_file_safe(person_file), "found": True}
    # 模糊搜索
    for f in DIRECT_CALL.glob("*.md"):
        if name in f.stem:
            return {"name": f.stem, "content": read_file_safe(f), "found": True}
    return {"name": name, "content": "", "found": False}


def get_workbench_status():
    """工作台数据摘要"""
    if not WORKBENCH_DATA.exists():
        return {"error": "tuanzhishu_data.json 不存在"}
    try:
        data = json.loads(read_file_safe(WORKBENCH_DATA))
        members = data.get("members", [])
        meetings = data.get("meetings", [])
        return {
            "total_members": len(members),
            "tuan_members": sum(1 for m in members if m.get("isTuan", False)),
            "meetings_count": len(meetings),
            "last_meeting": meetings[-1] if meetings else None,
            "updated": datetime.fromtimestamp(WORKBENCH_DATA.stat().st_mtime).isoformat()
        }
    except:
        return {"error": "数据解析失败"}


def api_recent_notes(limit=15):
    """最近修改的笔记"""
    files = list_md_files(OBSIDIAN_VAULT)[:limit]
    return [{
        "name": f["name"],
        "path": f["path"],
        "modified": f["modified"]
    } for f in files]


def api_top_people():
    """团务记录人物列表"""
    people = []
    for f in DIRECT_CALL.glob("*.md"):
        if f.stem not in ("关系图", "README", "INDEX"):
            content = read_file_safe(f, 500)
            # 提取第一句
            first_line = content.split("\n")[0].strip("# ")[:80] if content else ""
            people.append({"name": f.stem, "brief": first_line})
    return people


# ═══ HTTP 服务 ═══
class APIHandler(http.server.BaseHTTPRequestHandler):
    def _send_json(self, data, status=200):
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self._send_json({})

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        params = dict(urllib.parse.parse_qsl(parsed.query))

        try:
            if path == "/api/ping":
                self._send_json({"status": "ok", "time": datetime.now().isoformat()})

            elif path == "/api/vault/recent":
                self._send_json(api_recent_notes(int(params.get("limit", 15))))

            elif path == "/api/vault/search":
                q = params.get("q", "")
                if not q:
                    self._send_json({"error": "缺少 q 参数"}, 400)
                    return
                self._send_json(search_vault(q))

            elif path == "/api/vault/read":
                fp = params.get("file", "")
                if not fp:
                    self._send_json({"error": "缺少 file 参数"}, 400)
                    return
                full_path = OBSIDIAN_VAULT / fp
                if not full_path.exists():
                    self._send_json({"error": "文件不存在"}, 404)
                    return
                self._send_json({"path": fp, "content": read_file_safe(full_path)})

            elif path.startswith("/api/people/"):
                name = path.split("/api/people/")[-1]
                self._send_json(get_person(urllib.parse.unquote(name)))

            elif path == "/api/people":
                self._send_json(api_top_people())

            elif path == "/api/workbench/status":
                self._send_json(get_workbench_status())

            elif path == "/api/agent/ask":
                q = params.get("q", "")
                self._send_json({
                    "reply": f"团务收到：{q}n（Agent 直连功能开发中，当前可通过 Hermes 对话操作知识库和工作台）",
                    "pending": True
                })

            elif path == "/api/wx/stats":
                self._send_json(wx_stats())

            elif path.startswith("/api/wx/people/"):
                name = path.split("/api/wx/people/")[-1]
                self._send_json(wx_person_detail(urllib.parse.unquote(name)))

            elif path == "/api/wx/people":
                self._send_json(wx_people_summary())

            elif path == "/api/wx/entities":
                self._send_json(wx_entities(int(params.get("limit", 50))))

            else:
                self._send_json({
                    "api": "超级工作台 API v1",
                    "endpoints": [
                        "GET /api/ping",
                        "GET /api/vault/recent?limit=15",
                        "GET /api/vault/search?q=关键词",
                        "GET /api/vault/read?file=路径",
                        "GET /api/people",
                        "GET /api/people/:名称",
                        "GET /api/workbench/status",
                        "GET /api/agent/ask?q=问题"
                    ]
                })

        except Exception as e:
            self._send_json({"error": str(e)}, 500)

    def log_message(self, format, *args):
        pass  # 静默日志


if __name__ == "__main__":
    print(f"🚀 超级工作台 API 启动: http://127.0.0.1:{PORT}")
    print(f"   Obsidian: {OBSIDIAN_VAULT}")
    print(f"   直接调用: {DIRECT_CALL}")
    server = http.server.HTTPServer(("127.0.0.1", PORT), APIHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n👋 已停止")
        server.server_close()
