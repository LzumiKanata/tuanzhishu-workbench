function openAiWindow(){
if(API.hasBridge()){API.openAiWindow().catch(function(e){Q(e.message||"窗口打开失败","err");});return;}
window.open("ai.html");
}
function RI(){
/* P0-1：AI 聊天统一组件 chat/chat.js，主站内嵌与独立窗口复用同一套 */
var h='<div class=card style="display:flex;flex-direction:column;height:calc(100vh - 190px)">';
h+='<div class=card-title>norm <span style="font-size:11px;color:var(--text3);font-weight:400">可读工作台数据，帮分析团务/班级事务</span></div>';
h+='<div id=mamboEmbed style="flex:1;min-height:0"></div>';
h+='</div>';
setTimeout(function(){var c=document.getElementById("mamboEmbed");if(c&&window.MB_INIT)MB_INIT(c,{mode:"embed"});},0);
return h+'<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:12px;margin-top:12px">'+'<div class=card style="cursor:pointer;padding:16px" onclick="N(\'smart\')"><div style="font-size:13px;font-weight:500;margin-bottom:4px">智慧团建助手</div><div style="font-size:11px;color:var(--text3)">团建小工具 · 快速入口</div></div>'+'<div class=card style="cursor:pointer;padding:16px" onclick="N(\'photos\')"><div style="font-size:13px;font-weight:500;margin-bottom:4px">班级相册</div><div style="font-size:11px;color:var(--text3)">活动照片归档 · 桌面版可看</div></div>'+'</div>';}
function RPH(){setTimeout(function(){LP();},50);return '<div class=card><div class=card-title>班级相册</div><div id=phWrap style="min-height:120px;color:var(--text2);font-size:13px">加载中…</div></div>';}
function LP(){var w=document.querySelector("#phWrap");if(!w)return;if(!API.hasBridge()){w.innerHTML='<div style="text-align:center;padding:24px;font-size:13px;color:var(--text2)">桌面版可查看班级相册（照片存放在工作台目录的 photos/ 文件夹）</div>';return;}API.listPhotos().then(function(r){var ph=(r&&r.photos)||[];if(ph.length===0){w.innerHTML='<div class=empty style="padding:16px">'+INK.mountain+'<div style="font-size:13px;color:var(--text3)">还没有照片<br><span style="font-size:11px">把活动照片放进 photos/ 文件夹，这里就会显示</span></div></div>';return;}var h='<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px">';ph.forEach(function(p){h+='<div style="border:1px solid var(--line);border-radius:10px;overflow:hidden;background:var(--card)"><div style="height:110px;overflow:hidden;background:rgba(107,84,60,.06);cursor:pointer" onclick="PHL(\''+encodeURIComponent(p.filename)+'\')"><img src="photos/'+encodeURIComponent(p.filename)+'" alt="'+E(p.filename)+'" style="width:100%;height:100%;object-fit:cover" onerror="this.style.display=\'none\'"></div><div style="padding:6px 8px"><div style="font-size:11px;color:var(--text2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+E(p.filename)+'</div><div style="display:flex;justify-content:space-between;align-items:center;margin-top:2px"><span style="font-size:11px;color:var(--text3)">'+E(p.mtime||"")+'</span><span style="cursor:pointer;font-size:11px;color:var(--text3)" onclick="PHDEL(\''+encodeURIComponent(p.filename)+'\')">删除</span></div></div></div>';});h+='</div>';w.innerHTML=h;}).catch(function(e){w.innerHTML='<div style="text-align:center;padding:24px;color:var(--error);font-size:13px">加载失败：'+E(e.message||"未知错误")+'</div>';});}
function PHL(name){var dec=decodeURIComponent(name);var m=document.querySelector("#_modal");if(!m){m=document.createElement("div");m.id="_modal";m.style="position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:999;display:flex;align-items:center;justify-content:center";m.onclick=function(e){if(e.target===this)this.remove();};document.body.appendChild(m);}m.innerHTML='<div style="background:var(--card);border-radius:14px;padding:16px;max-width:90vw;max-height:88vh;overflow:auto;box-shadow:0 8px 40px rgba(0,0,0,.3)" onclick="event.stopPropagation()"><img src="photos/'+encodeURIComponent(dec)+'" style="max-width:100%;max-height:76vh;border-radius:8px;display:block" onerror="this.alt=\'图片无法显示\'"><div style="text-align:center;font-size:12px;color:var(--text2);margin-top:10px">'+E(dec)+'</div><div style="text-align:center;margin-top:10px"><button class="btn btn-sm" onclick="this.closest(\'[style*=fixed]\').remove()">关闭</button></div></div>';}
function PHDEL(name){var dec=decodeURIComponent(name);if(!confirm("删除照片：\n"+dec+"？"))return;API.deletePhoto(dec).then(function(r){if(r&&r.ok){Q("照片已删除");N("photos");}else{Q((r&&r.error)||"删除失败","err");}}).catch(function(e){Q(e.message||"删除失败","err");});}
function BT(){var c=document.querySelector(".content");if(c)c.scrollTo({top:0,behavior:"smooth"});}

/* ---- TZS 注册表(阶段A:全局名保留,仅登记) ---- */
window.TZS = window.TZS || {};
window.TZS.modules_ai = {
  openAiWindow,
  RI,
  RPH,
  LP,
  PHL,
  PHDEL,
  BT,
};
