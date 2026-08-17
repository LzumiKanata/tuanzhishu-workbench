function RAC(){var list=D.activities||[];
var h='<div style="font-size:12px;color:var(--text3);margin-bottom:10px">通知公告 · 面向同学的活动与通知从这里发布；活动完整档案在「活动记录」页</div><div class=card><div class=card-title>通知公告</div>';
if(list.length===0){h+=EMP("plum","还没有通知",'<button class="btn btn-primary" onclick="TZN()">发布通知</button>');}
else{
h+='<div style="border:1px solid var(--line);border-radius:10px;overflow:hidden"><table><thead><tr><th>日期</th><th>标题</th><th>内容</th><th></th></tr></thead><tbody>';
list.slice().reverse().forEach(function(x){h+='<tr><td style="font-size:12px;color:var(--text2)">'+E(x.date||'')+'</td><td style=font-weight:500>'+E(x.title)+'</td><td style="font-size:12px;color:var(--text3)">'+E(x.content||'')+'</td><td style=text-align:right><span style="cursor:pointer;color:var(--text3);font-size:11px" onclick="TZD(\''+x.id+'\')">删除</span></td></tr>';});
h+='</tbody></table></div><div style="margin-top:12px;text-align:right"><button class="btn btn-primary" onclick="TZN()">发布通知</button></div>';}
h+='</div>';return h;}
function TZN(){var m=document.querySelector("#_modal");if(!m){m=document.createElement("div");m.id="_modal";m.style="position:fixed;inset:0;background:rgba(0,0,0,.35);z-index:999;display:flex;align-items:center;justify-content:center";m.onclick=function(e){if(e.target===this)this.remove();};document.body.appendChild(m);}
m.innerHTML='<div style="background:var(--card);border-radius:18px;padding:26px;width:460px;max-height:80vh;overflow-y:auto;box-shadow:0 8px 40px rgba(0,0,0,.12)" onclick="event.stopPropagation()"><div style="font-size:16px;font-weight:500;margin-bottom:14px">发布通知</div><input id="tzTitle" placeholder="通知标题" style="width:100%;padding:8px;border:1px solid var(--line);border-radius:8px;margin-bottom:12px;font-size:13px;background:var(--card)"><textarea id="tzContent" placeholder="通知内容" rows="4" style="width:100%;padding:8px;border:1px solid var(--line);border-radius:8px;margin-bottom:12px;font-size:13px;background:var(--card);resize:vertical"></textarea><div style="display:flex;gap:10px;justify-content:flex-end"><button class="btn" onclick="this.closest(\'[style*=fixed]\').remove()">取消</button><button class="btn btn-primary" onclick="TZS()">发布</button></div></div>';m.style.display="flex";}
function TZS(){var title=(document.querySelector("#tzTitle").value||"").trim();if(!title){Q("标题不能空","warn");return;}var content=(document.querySelector("#tzContent").value||"").trim();D.activities=D.activities||[];D.activities.push({id:I(),title:title,content:content,date:T()});Z();N("groups");Q("通知已发布");var m=document.querySelector("#_modal");if(m)m.remove();}
function TZD(id){D.activities=D.activities||[];var i=D.activities.findIndex(function(x){return x.id===id;});if(i>=0){D.activities.splice(i,1);Z();N("groups");Q("已删除");}}

/* ---- TZS 注册表(阶段A:全局名保留,仅登记) ---- */
window.TZS = window.TZS || {};
window.TZS.modules_notice = {
  RAC,
  TZN,
  TZS,
  TZD,
};
