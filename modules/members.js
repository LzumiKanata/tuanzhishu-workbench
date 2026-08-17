function RM(){
var ms=D.members.filter(function(m){return m.memberType==="团员";});
var kw=(window._sk||"").toLowerCase();var fd=ms;
if(kw)fd=fd.filter(function(m){return m.name.includes(kw)||(m.studentId||"").includes(kw)||(m.dorm||"").includes(kw)||(m.role||"").includes(kw);});
if(fd.length===0){return '<div class=card>'+EMP("mountain","还没有团员数据",'<button class="btn btn-primary" onclick="importExcel()">导入名单（Excel）</button>')+'</div>';}
var missing=ms.filter(function(m){return !m.birthMonth;}).length;
var fillPct=ms.length?Math.round((ms.length-missing)/ms.length*100):0;
/* 第二批可视化①：构成速览（身份/性别/缺口，2026-08-06 sunna） */
var all=D.members||[];
var qzN=Math.max(0,all.length-ms.length);
var male=all.filter(function(m){return m.gender==="男";}).length;
var female=Math.max(0,all.length-male);
var tPct=all.length?Math.round(ms.length/all.length*100):0;
var mPct=all.length?Math.round(male/all.length*100):0;
var h='<div class=card style="padding:16px;margin-bottom:12px"><div class=card-title>构成速览</div>';
h+='<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:14px">';
h+='<div><div style="display:flex;align-items:center;gap:5px;font-size:11px;color:var(--text2);margin-bottom:6px"><span class="mini-ink">'+INK.mountain+'</span><span>身份构成（团员 '+ms.length+' · 群众 '+qzN+'）</span></div><div style="display:flex;height:10px;border-radius:999px;overflow:hidden;background:var(--line)"><i style="width:'+tPct+'%;background:var(--primary)"></i><i style="flex:1;background:var(--primary-soft)"></i></div><div style="font-size:11px;color:var(--text3);margin-top:4px">团员 '+tPct+'% · 群众 '+(100-tPct)+'%</div></div>';
h+='<div><div style="display:flex;align-items:center;gap:5px;font-size:11px;color:var(--text2);margin-bottom:6px"><span class="mini-ink">'+INK.plum+'</span><span>性别分布（男 '+male+' · 女 '+female+'）</span></div><div style="display:flex;height:10px;border-radius:999px;overflow:hidden;background:var(--line)"><i style="width:'+mPct+'%;background:var(--primary)"></i><i style="flex:1;background:var(--primary-soft)"></i></div><div style="font-size:11px;color:var(--text3);margin-top:4px">男 '+mPct+'% · 女 '+(100-mPct)+'%</div></div>';
h+='<div><div style="display:flex;align-items:center;gap:5px;font-size:11px;color:var(--text2);margin-bottom:6px"><span class="mini-ink">'+INK.seal+'</span><span>数据缺口</span></div><div style="font-size:16px;font-weight:600;color:'+(missing?'var(--pending)':'var(--ok)')+'">'+(missing?'待补录 '+missing+' 人':'已全部补录')+'</div><div style="font-size:11px;color:var(--text3);margin-top:2px">出生年月缺失，录完推优自动核查</div></div>';
h+='</div></div>';
h+='<div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;padding:11px 14px;border:1px solid var(--line);border-radius:var(--r);background:var(--card)"><span style="font-size:12px;color:var(--text2);white-space:nowrap">出生年月补录</span><div style="flex:1;height:8px;border-radius:999px;background:var(--primary-soft);overflow:hidden"><i style="display:block;height:100%;width:'+fillPct+'%;background:'+(missing?'var(--warn)':'var(--ok)')+';border-radius:999px;transition:width .5s"></i></div><span style="font-size:12px;color:var(--text2);font-variant-numeric:tabular-nums;white-space:nowrap">'+(ms.length-missing)+' / '+ms.length+'</span>'+(missing?'<button class="btn btn-sm" onclick="COPYREMIND()">复制催办提醒</button>':'<span class="tag" style="background:var(--gold-soft);color:var(--ok)">已全部补录</span>')+'</div>';
h+='<div style="display:flex;gap:8px;margin-bottom:12px"><input placeholder="搜索团员…" style="flex:1;padding:7px 10px;border:1px solid var(--line);border-radius:8px;font-size:13px" oninput="window._sk=this.value;N(\'members\')" value="'+E(kw)+'">'+(API.hasBridge()?'<button class="btn btn-primary btn-sm" onclick="importExcel()">导入名单</button>':'<span style="font-size:11px;color:var(--text3);align-self:center">桌面版可导入 Excel 名单</span>')+'</div>';
h+='<div class="card tbl-scroll" style=padding:0><table><thead><tr><th>姓名</th><th>学号</th><th>宿舍</th><th>出生年月</th><th>入团时间</th><th>申请入党</th><th>职务</th><th>电话</th><th>状态</th></tr></thead><tbody>';
fd.forEach(function(m){h+='<tr'+(m.birthMonth?'':' style="background:var(--primary-soft)"')+'><td style=font-weight:600>'+E(m.name)+(!m.birthMonth?' <span class="tag tag-p" style="font-size:10px;padding:1px 7px">待补</span>':'')+'</td><td style=font-size:11px;color:var(--text3)>'+E(m.studentId||'')+'</td><td style=font-size:11px;color:var(--text3)>'+E(m.dorm||'')+'</td><td style=font-size:11px>'+(m.birthMonth?'':'<span style="font-size:10px;color:var(--pending);margin-right:4px">未录入</span>')+'<input type=month value="'+E(m.birthMonth||'')+'" onchange="var m=D.members.find(function(x){return x.id===\''+m.id+'\';});if(m){m.birthMonth=this.value;Z();Q(\'已保存\');}" style="border:1px solid var(--line);border-radius:6px;padding:3px 6px;font-size:11px;width:120px"></td><td style=font-size:11px>'+E(m.joinDate||'—')+'</td><td style=font-size:11px><input type=month value="'+E(m.partyApplyDate||'')+'" onchange="var m=D.members.find(function(x){return x.id===\''+m.id+'\';});if(m){m.partyApplyDate=this.value;Z();Q(\'已保存\');}" style="border:1px solid var(--line);border-radius:6px;padding:3px 6px;font-size:11px;width:130px"></td><td>'+E(m.role||'')+'</td><td style=font-size:11px;color:var(--text3)>'+E(m.phone||'')+'</td><td><span class="tag tag-q">'+(m.status||'正常')+'</span></td></tr>';});
h+='</tbody></table></div><div style=text-align:center;font-size:11px;color:var(--text3);margin-top:8px>团员共'+fd.length+'人 · 出生年月可点选录入，录完推优年龄自动判定 · '+(D.members.length-fd.length)+'名群众在「班级学生」页查看</div>';

h+='<div style="display:flex;gap:8px;align-items:center;margin-top:12px;padding:10px 14px;border:1px solid var(--line);border-radius:var(--r);background:var(--card)">'+'<span style="font-size:12px;color:var(--text2)">个人事务</span>'+'<span style="font-size:11px;color:var(--text3);flex:1">个人信息 · 主题外观 · 数据备份 · 述职归档</span>'+'<button class="btn btn-sm" onclick="N(\'personal\')">打开</button></div>';
return h;}
function COPYREMIND(){
var ms=D.members.filter(function(m){return m.memberType==="团员"&&!m.birthMonth;});
if(ms.length===0){Q("团员出生年月已全部补录");return;}
var names=ms.map(function(m){return m.name;}).join("、");
var txt="各位团员好，请抽空在工作台「团员台账」补录出生年月（点选即可），推优入党年龄自动核查需要它。还差以下 "+ms.length+" 位："+names+"。谢谢配合！";
var m=document.querySelector("#_modal");if(!m){m=document.createElement("div");m.id="_modal";m.style="position:fixed;inset:0;background:rgba(0,0,0,.35);z-index:999;display:flex;align-items:center;justify-content:center";m.onclick=function(e){if(e.target===this)this.remove();};document.body.appendChild(m);}
m.innerHTML='<div style="background:var(--card);border-radius:18px;padding:26px;width:480px;box-shadow:0 8px 40px rgba(0,0,0,.12)" onclick="event.stopPropagation()"><div style="font-size:16px;font-weight:500;margin-bottom:12px">催办提醒文案（可复制到班群）</div><textarea id="cpTxt" rows="4" readonly style="width:100%;padding:10px;border:1px solid var(--line);border-radius:8px;font-size:13px;background:var(--card);color:var(--text);resize:none;margin-bottom:12px">'+E(txt)+'</textarea><div style="display:flex;gap:10px;justify-content:flex-end"><button class="btn" onclick="this.closest(\'[style*=fixed]\').remove()">关闭</button><button class="btn btn-primary" onclick="CPCOPY()">复制文案</button></div></div>';m.style.display="flex";}
function CPCOPY(){
var el=document.querySelector("#cpTxt");if(!el)return;
el.select();
try{document.execCommand("copy");Q("已复制，去班群粘贴吧");}catch(e){Q("请手动选择复制","info");}}
function EVT(id){D.evaluations=D.evaluations||[];var i=D.evaluations.findIndex(function(x){return x.id===id;});if(i>=0){D.evaluations.splice(i,1);Z();N("meetings");Q("评议已删除");}}
function HYOVER(el){el.style.borderColor="var(--primary)";el.style.color="var(--primary)";}
function HYOUT(el){el.style.borderColor="";el.style.color="";}
function DROPDOC(e){e.preventDefault();e.stopPropagation();var f=e.dataTransfer&&e.dataTransfer.files&&e.dataTransfer.files[0];if(!f){return;}if(!/\.docx$/i.test(f.name)){Q("请拖入 .docx 格式的 Word 文件","warn");return;}if(!API.hasBridge()){Q("桌面版可拖入 Word 识别","info");return;}var rd=new FileReader();rd.onload=function(){var b64=(rd.result||"").split(",")[1]||"";Q("正在识别…","info");API.parseDocx(b64,f.name).then(function(r){if(r&&r.ok){DOCPREP(r.title,r.text);}else{Q((r&&r.error)||"识别失败","err");}}).catch(function(e){Q(e.message||"识别失败","err");});};rd.readAsDataURL(f);}
function DOCPREP(title,text){
var m=document.querySelector("#_modal");if(!m){m=document.createElement("div");m.id="_modal";m.style="position:fixed;inset:0;background:rgba(0,0,0,.35);z-index:999;display:flex;align-items:center;justify-content:center";m.onclick=function(e){if(e.target===this)this.remove();};document.body.appendChild(m);}
m.innerHTML='<div style="background:var(--card);border-radius:18px;padding:26px;width:520px;max-height:82vh;overflow-y:auto;box-shadow:0 8px 40px rgba(0,0,0,.12)" onclick="event.stopPropagation()"><div style="font-size:16px;font-weight:500;margin-bottom:14px">识别完成，确认保存</div><div style="font-size:12px;color:var(--text3);margin-bottom:8px">会议类型</div><select id="hyType" style="width:100%;padding:8px;border:1px solid var(--line);border-radius:8px;margin-bottom:12px;font-size:13px;background:var(--card)"><option value="支部大会">支部大会</option><option value="支部委员会">支部委员会</option><option value="团小组会">团小组会</option><option value="团课">团课</option><option value="主题团日">主题团日</option><option value="活力团支部">活力团支部</option></select><div style="font-size:12px;color:var(--text3);margin-bottom:8px">标题</div><input id="hyTitle" value="'+E(title||"")+'" style="width:100%;padding:8px;border:1px solid var(--line);border-radius:8px;margin-bottom:12px;font-size:13px;background:var(--card)"><div style="font-size:12px;color:var(--text3);margin-bottom:8px">内容（可编辑）</div><textarea id="hyNote" rows="8" style="width:100%;padding:8px;border:1px solid var(--line);border-radius:8px;margin-bottom:12px;font-size:13px;background:var(--card);resize:vertical">'+E(text||"")+'</textarea><div style="display:flex;gap:10px;justify-content:flex-end"><button class="btn" onclick="this.closest(\'[style*=fixed]\').remove()">取消</button><button class="btn btn-primary" onclick="DOCS()">保存</button></div></div>';m.style.display="flex";}
function DOCS(){var type=document.querySelector("#hyType").value;var title=(document.querySelector("#hyTitle").value||"").trim();if(!title){Q("标题不能空","warn");return;}var note=(document.querySelector("#hyNote").value||"").trim();D.meetings=D.meetings||[];D.meetings.push({id:I(),type:type,date:T(),title:title,note:note});Z();N("meetings");Q("会议记录已保存");var m=document.querySelector("#_modal");if(m)m.remove();}
function HYN(){var m=document.querySelector("#_modal");if(!m){m=document.createElement("div");m.id="_modal";m.style="position:fixed;inset:0;background:rgba(0,0,0,.35);z-index:999;display:flex;align-items:center;justify-content:center";m.onclick=function(e){if(e.target===this)this.remove();};document.body.appendChild(m);}
m.innerHTML='<div style="background:var(--card);border-radius:18px;padding:26px;width:420px;max-height:80vh;overflow-y:auto;box-shadow:0 8px 40px rgba(0,0,0,.12)" onclick="event.stopPropagation()"><div style="font-size:16px;font-weight:500;margin-bottom:14px">新建会议</div><div style="font-size:12px;color:var(--text3);margin-bottom:8px">类型</div><select id="hyType" style="width:100%;padding:8px;border:1px solid var(--line);border-radius:8px;margin-bottom:12px;font-size:13px;background:var(--card)"><option value="支部大会">支部大会</option><option value="支部委员会">支部委员会</option><option value="团小组会">团小组会</option><option value="团课">团课</option><option value="主题团日">主题团日</option><option value="活力团支部">活力团支部</option></select><div style="font-size:12px;color:var(--text3);margin-bottom:8px">日期</div><input id="hyDate" type=date value="'+T()+'" style="width:100%;padding:8px;border:1px solid var(--line);border-radius:8px;margin-bottom:12px;font-size:13px;background:var(--card)"><div style="font-size:12px;color:var(--text3);margin-bottom:8px">主题</div><input id="hyTitle" placeholder="如：推优民主评议" style="width:100%;padding:8px;border:1px solid var(--line);border-radius:8px;margin-bottom:12px;font-size:13px;background:var(--card)"><div style="font-size:12px;color:var(--text3);margin-bottom:8px">记录要点（可空）</div><input id="hyNote" placeholder="会议结论/待办" style="width:100%;padding:8px;border:1px solid var(--line);border-radius:8px;margin-bottom:12px;font-size:13px;background:var(--card)"><div style="display:flex;gap:10px;justify-content:flex-end"><button class="btn" onclick="this.closest(\'[style*=fixed]\').remove()">取消</button><button class="btn btn-primary" onclick="HYS()">保存</button></div></div>';m.style.display="flex";}
function HYS(){var type=document.querySelector("#hyType").value;var date=document.querySelector("#hyDate").value;var title=(document.querySelector("#hyTitle").value||"").trim();if(!title){Q("主题不能空","warn");return;}var note=(document.querySelector("#hyNote").value||"").trim();D.meetings=D.meetings||[];D.meetings.push({id:I(),type:type,date:date,title:title,note:note});Z();N("meetings");Q("会议已记录");var m=document.querySelector("#_modal");if(m)m.remove();}
function HYD(id){D.meetings=D.meetings||[];var i=D.meetings.findIndex(function(x){return x.id===id;});if(i>=0){D.meetings.splice(i,1);Z();N("meetings");Q("已删除");}}
function RZN(){
var members=D.members.filter(function(m){return m.memberType==="团员";});
var rows='';members.forEach(function(m){rows+='<tr><td style="padding:5px 8px">'+E(m.name)+'</td><td><select id="rzg_'+m.id+'" onchange="RZMAP(this, \''+m.id+'\')" style="font-size:12px;padding:3px;border:1px solid var(--line);border-radius:5px;background:var(--card)"><option value="优秀">优秀</option><option value="合格" selected>合格</option><option value="基本合格">基本合格</option><option value="不合格">不合格</option></select></td><td><select id="rzs_'+m.id+'" style="font-size:12px;padding:3px;border:1px solid var(--line);border-radius:5px;background:var(--card)"><option value="正常" selected>正常注册</option><option value="暂缓">暂缓注册</option><option value="不予">不予注册</option></select></td></tr>';});
var m=document.querySelector("#_modal");if(!m){m=document.createElement("div");m.id="_modal";m.style="position:fixed;inset:0;background:rgba(0,0,0,.35);z-index:999;display:flex;align-items:center;justify-content:center";m.onclick=function(e){if(e.target===this)this.remove();};document.body.appendChild(m);}
m.innerHTML='<div style="background:var(--card);border-radius:18px;padding:26px;width:560px;max-height:82vh;overflow-y:auto;box-shadow:0 8px 40px rgba(0,0,0,.12)" onclick="event.stopPropagation()"><div style="font-size:16px;font-weight:500;margin-bottom:14px">发起年度团籍注册</div><input id="rzYear" value="'+String(new Date().getFullYear()) + '-' + String(new Date().getFullYear()+1)+'" style="width:100%;padding:8px;border:1px solid var(--line);border-radius:8px;margin-bottom:6px;font-size:13px;background:var(--card)"><div style="font-size:11px;color:var(--text3);margin-bottom:10px">选评议等次后注册状态自动映射（不合格→暂缓）；可手动改</div><table style=width:100%><thead><tr><th style=text-align:left>姓名</th><th>评议等次</th><th>注册状态</th></tr></thead><tbody>'+rows+'</tbody></table><div style="margin-top:14px;display:flex;gap:10px;justify-content:flex-end"><button class="btn" onclick="this.closest(\'[style*=fixed]\').remove()">取消</button><button class="btn btn-primary" onclick="RZS()">保存</button></div></div>';m.style.display="flex";}
function RZMAP(sel,id){var g=sel.value;var s=document.querySelector("#rzs_"+id);if(!s)return;if(g==="不合格"){s.value="暂缓";}else{s.value="正常";}}
function RZS(){
var year=(document.querySelector("#rzYear").value||"").trim();if(!year){Q("请填年度","warn");return;}
var records=[];D.members.forEach(function(m){if(m.memberType!=="团员")return;var g=document.querySelector("#rzg_"+m.id);var s=document.querySelector("#rzs_"+m.id);if(g&&s)records.push({name:m.name,grade:g.value,status:s.value});});
D.registry=D.registry||[];D.registry.push({id:I(),year:year,date:T(),records:records});Z();N("meetings");Q("年度团籍注册已保存");var m=document.querySelector("#_modal");if(m)m.remove();}
function RZD(id){D.registry=D.registry||[];var i=D.registry.findIndex(function(x){return x.id===id;});if(i>=0){D.registry.splice(i,1);Z();N("meetings");Q("已删除");}}
function EVN(){
var members=D.members.filter(function(m){return m.memberType==="团员";});
var rows='';members.forEach(function(m){rows+='<tr><td>'+E(m.name)+'</td><td><select id="g_'+m.id+'"><option value="合格">合格</option><option value="优秀">优秀</option><option value="基本合格">基本合格</option><option value="不合格">不合格</option></select></td></tr>';});
var m=document.querySelector("#_modal");if(!m){m=document.createElement("div");m.id="_modal";m.style="position:fixed;inset:0;background:rgba(0,0,0,.35);z-index:999;display:flex;align-items:center;justify-content:center";m.onclick=function(e){if(e.target===this)this.remove();};document.body.appendChild(m);}
m.innerHTML='<div style="background:var(--card);border-radius:18px;padding:26px;width:560px;max-height:80vh;overflow-y:auto;box-shadow:0 8px 40px rgba(0,0,0,.12)" onclick="event.stopPropagation()"><div style="font-size:16px;font-weight:500;margin-bottom:14px">教育评议</div><div style=font-size:12px;color:var(--text3);margin-bottom:10px>说明：新生（入学当年）可不参评（按本校惯例）；保留团籍的党员可不参评。评议维度参照学院民主评议测评表（团务档案存档）</div><div style=font-size:12px;color:var(--text3);margin-bottom:10px>评议轮次（如 2025-2026）</div><input id="evRound" style="width:100%;padding:8px;border:1px solid var(--line);border-radius:6px;margin-bottom:14px" value="'+new Date().getFullYear()+'-'+(new Date().getFullYear()+1)+'"><table style=width:100%><thead><tr><th>姓名</th><th>等次</th></tr></thead><tbody>'+rows+'</tbody></table><div style=margin-top:14px;display:flex;gap:8px><button class="btn btn-primary" onclick="EVS()">保存并校验</button><button class=btn onclick="this.closest(\'#_modal\').remove()">取消</button></div></div>';
m.style.display="flex";}
function EVS(){
var round=document.querySelector("#evRound").value.trim();if(!round){Q("请填评议轮次");return;}
var members=D.members.filter(function(m){return m.memberType==="团员";});
var grades=[];members.forEach(function(m){var sel=document.querySelector("#g_"+m.id);grades.push({memberId:m.id,name:m.name,grade:sel?sel.value:"合格"});});
var r=RULES.checkEvaluation(grades);
if(!r.ok){Q(r.msg);return;}
D.evaluations=D.evaluations||[];D.evaluations.push({round:round,grades:grades});
Z();U();N("meetings");Q(r.msg+"，已保存");var m=document.querySelector("#_modal");if(m)m.remove();}
function RS(){
var ms=D.members;
var f2=window._f2||"all";
var kw=(window._sk||"").toLowerCase();var fd=ms.filter(function(m){if(f2==="tuan")return m.memberType==="团员";if(f2==="group")return m.memberType!=="团员";return true;});
if(kw)fd=fd.filter(function(m){return m.name.includes(kw)||(m.studentId||"").includes(kw)||(m.dorm||"").includes(kw);});
var lead='<div style="display:flex;align-items:center;gap:10px;padding:10px 14px;border:1px solid var(--line);border-radius:var(--r);background:var(--card);margin-bottom:12px"><div style="flex:1"><div style="font-size:13px;color:var(--text)">全班 '+ms.length+' 人 · 团员 '+ms.filter(function(m){return m.memberType==="团员";}).length+' 人 · 群众 '+ms.filter(function(m){return m.memberType!=="团员";}).length+' 人</div><div style="font-size:11px;color:var(--text2);margin-top:2px">这页查人、导名单；团员信息补录与推优在<b>团员台账</b></div></div><button class="btn btn-sm" onclick="N(\'members\')">去团员台账 →</button></div>';var seg='<div style="display:flex;gap:4px;margin-bottom:10px">';
[["all","全部"],["tuan","团员"],["group","群众"]].forEach(function(o){var on=f2===o[0];seg+='<button class="btn btn-sm" style="'+(on?'background:var(--primary);color:var(--on-primary);border-color:transparent':'')+'" onclick="window._f2=\''+o[0]+'\';N(\'students\')">'+o[1]+'</button>';});
seg+='</div>';
if(fd.length===0){return '<div class=card>'+EMP("bamboo","还没有学生数据",'<button class="btn btn-primary" onclick="importExcel()">导入名单（Excel）</button>')+'</div>';}
var h=lead+seg+'<div style="display:flex;gap:8px;margin-bottom:12px"><input placeholder="搜索学生…" style="flex:1;padding:7px 10px;border:1px solid var(--line);border-radius:8px;font-size:13px" oninput="window._sk=this.value;N(\'students\')" value="'+E(kw)+'">'+(API.hasBridge()?'<button class="btn btn-primary btn-sm" onclick="importExcel()">导入名单</button>':'<span style="font-size:11px;color:var(--text3);align-self:center">桌面版可导入 Excel 名单</span>')+'</div>';
h+='<div class="card tbl-scroll" style=padding:0><table><thead><tr><th>姓名</th><th>学号</th><th>性别</th><th>宿舍</th><th>身份</th></tr></thead><tbody>';
fd.forEach(function(m){h+='<tr><td style=font-weight:600>'+E(m.name)+'</td><td style=font-size:11px;color:var(--text3)>'+E(m.studentId||'')+'</td><td style=font-size:11px>'+E(m.gender||'')+'</td><td style=font-size:11px;color:var(--text3)>'+E(m.dorm||'')+'</td><td><span class="tag '+(m.memberType=="团员"?"tag-p":"tag-q")+'">'+m.memberType+'</span></td></tr>';});
h+='</tbody></table></div><div style=text-align:center;font-size:11px;color:var(--text3);margin-top:8px>全班共'+fd.length+'人 · 团员'+ms.filter(function(m){return m.memberType==="团员";}).length+'人 · 群众'+ms.filter(function(m){return m.memberType!=="团员";}).length+'人</div>';
return h;}
function RA(){var list=D.attendance||[];
var h='<div class=card><div class=card-title>考勤记录</div>';
if(list.length===0){h+=EMP("brush","还没有考勤记录",'<button class="btn btn-primary" onclick="KQN()">新建考勤</button>');}
else{
/* 第二批可视化③：月度出勤率（hermes 口径：按月份 Σpresent/Σtotal 非简单平均，2026-08-06 sunna） */
var af={};
list.forEach(function(a){var k=String(a.date||"").slice(0,7);af[k]=af[k]||{p:0,t:0};af[k].p+=Number(a.present)||0;af[k].t+=Number(a.total)||0;});
var akeys=Object.keys(af).sort();
if(akeys.length){
var W2=560,H2=140;
var s2='<svg viewBox="0 0 '+W2+' '+(H2+20)+'" style="width:100%;height:auto">';
s2+='<line x1="34" y1="'+(H2-16)+'" x2="'+(W2-14)+'" y2="'+(H2-16)+'" stroke="var(--line)"/>';
var step2=akeys.length>1?(W2-70)/(akeys.length-1):(W2-70);
akeys.forEach(function(k,i){
var cx=48+i*step2;
var rate=af[k].t>0?af[k].p/af[k].t:0;
var col=rate>=0.95?'var(--ok)':(rate>=0.85?'var(--pending)':'var(--gap)');
var bh=Math.max(2,Math.round((H2-38)*rate));
s2+='<rect x="'+(cx-10)+'" y="'+(H2-16-bh)+'" width="20" height="'+bh+'" rx="3" fill="'+col+'"/>';
s2+='<text x="'+cx+'" y="'+(H2-16-bh-5)+'" text-anchor="middle" font-size="10" fill="var(--text3)">'+Math.round(rate*100)+'%</text>';
s2+='<text x="'+cx+'" y="'+(H2+8)+'" text-anchor="middle" font-size="10" fill="var(--text3)">'+k.slice(5)+'月</text>';});
s2+='</svg>';
h+='<div class=card style="margin-bottom:14px"><div class=card-title>月度出勤率 <span style="font-size:11px;color:var(--text3);font-weight:400">≥95% 绿 · 85-95% 琥珀 · ＜85% 红</span></div>'+s2+'<div style="font-size:11px;color:var(--text3)">按出勤人次/应到人次聚合，非简单平均</div></div>';
}
h+='<div style="border:1px solid var(--line);border-radius:10px;overflow:hidden"><table><thead><tr><th>日期</th><th>出勤</th><th>缺勤名单</th><th></th></tr></thead><tbody>';
list.slice().reverse().forEach(function(a){h+='<tr><td style="font-size:12px;color:var(--text2)">'+E(a.date)+'</td><td><span class="tag" style="background:var(--gold-soft);color:var(--success)">'+(a.present||0)+'/'+(a.total||0)+'</span></td><td style="font-size:12px;color:var(--text3)">'+(a.absent&&a.absent.length?a.absent.map(E).join('、'):'全员出勤')+'</td><td style=text-align:right><span style="cursor:pointer;color:var(--text3);font-size:11px" onclick="KQD(\''+a.id+'\')">删除</span></td></tr>';});
h+='</tbody></table></div><div style="margin-top:12px;text-align:right"><button class="btn btn-primary" onclick="KQN()">新建考勤</button></div>';}
h+='</div>';return h;}
function KQN(){var members=D.members;var rows='';members.forEach(function(m){rows+='<tr><td style="padding:5px 8px">'+E(m.name)+'</td><td style=text-align:center><input type=checkbox id="kq_'+m.id+'"></td></tr>';});
var m=document.querySelector("#_modal");if(!m){m=document.createElement("div");m.id="_modal";m.style="position:fixed;inset:0;background:rgba(0,0,0,.35);z-index:999;display:flex;align-items:center;justify-content:center";m.onclick=function(e){if(e.target===this)this.remove();};document.body.appendChild(m);}
m.innerHTML='<div style="background:var(--card);border-radius:18px;padding:26px;width:440px;max-height:80vh;overflow-y:auto;box-shadow:0 8px 40px rgba(0,0,0,.12)" onclick="event.stopPropagation()"><div style="font-size:16px;font-weight:500;margin-bottom:14px">新建考勤</div><input id="kqDate" type=date value="'+T()+'" style="width:100%;padding:8px;border:1px solid var(--line);border-radius:8px;margin-bottom:10px;font-size:13px;background:var(--card)"><div style="font-size:12px;color:var(--text3);margin-bottom:8px">勾选缺勤成员（不勾=全员出勤）</div><table style=width:100%><tbody>'+rows+'</tbody></table><div style="margin-top:14px;display:flex;gap:10px;justify-content:flex-end"><button class="btn" onclick="this.closest(\'[style*=fixed]\').remove()">取消</button><button class="btn btn-primary" onclick="KQS()">保存</button></div></div>';m.style.display="flex";}
function KQS(){var date=document.querySelector("#kqDate").value;if(!date){Q("请选日期","warn");return;}var absent=[];D.members.forEach(function(m){var c=document.querySelector("#kq_"+m.id);if(c&&c.checked)absent.push(m.name);});D.attendance=D.attendance||[];D.attendance.push({id:I(),date:date,absent:absent,present:D.members.length-absent.length,total:D.members.length});Z();N("classfund");Q("考勤已保存");var m=document.querySelector("#_modal");if(m)m.remove();}
function KQD(id){D.attendance=D.attendance||[];var i=D.attendance.findIndex(function(x){return x.id===id;});if(i>=0){D.attendance.splice(i,1);Z();N("classfund");Q("已删除");}}
function RX(){var list=D.classActs||[];
var h='<div style="font-size:12px;color:var(--text3);margin-bottom:10px">活动记录 · 班级活动从发起到落地全程存档；要发布给同学的通知去「通知公告」页</div><div class=card><div class=card-title>活动记录</div>';
if(list.length===0){h+=EMP("plum","还没有活动记录",'<button class="btn btn-primary" onclick="HDN()">发起活动</button>');}
else{
h+='<div style="border:1px solid var(--line);border-radius:10px;overflow:hidden"><table><thead><tr><th>日期</th><th>活动</th><th>地点</th><th>说明</th><th></th></tr></thead><tbody>';
list.slice().reverse().forEach(function(x){h+='<tr><td style="font-size:12px;color:var(--text2)">'+E(x.date||'')+'</td><td style=font-weight:500>'+E(x.name)+'</td><td style="font-size:12px;color:var(--text2)">'+E(x.place||'—')+'</td><td style="font-size:12px;color:var(--text3)">'+E(x.note||'')+'</td><td style=text-align:right><span style="cursor:pointer;color:var(--text3);font-size:11px" onclick="HDD(\''+x.id+'\')">删除</span></td></tr>';});
h+='</tbody></table></div><div style="margin-top:12px;text-align:right"><button class="btn btn-primary" onclick="HDN()">发起活动</button></div>';}
h+='</div>';return h;}
function HDN(){var m=document.querySelector("#_modal");if(!m){m=document.createElement("div");m.id="_modal";m.style="position:fixed;inset:0;background:rgba(0,0,0,.35);z-index:999;display:flex;align-items:center;justify-content:center";m.onclick=function(e){if(e.target===this)this.remove();};document.body.appendChild(m);}
m.innerHTML='<div style="background:var(--card);border-radius:18px;padding:26px;width:420px;max-height:80vh;overflow-y:auto;box-shadow:0 8px 40px rgba(0,0,0,.12)" onclick="event.stopPropagation()"><div style="font-size:16px;font-weight:500;margin-bottom:14px">发起活动</div><div style="font-size:12px;color:var(--text3);margin-bottom:8px">活动名称</div><input id="hdName" placeholder="如：班级团建" style="width:100%;padding:8px;border:1px solid var(--line);border-radius:8px;margin-bottom:12px;font-size:13px;background:var(--card)"><div style="font-size:12px;color:var(--text3);margin-bottom:8px">日期</div><input id="hdDate" type=date value="'+T()+'" style="width:100%;padding:8px;border:1px solid var(--line);border-radius:8px;margin-bottom:12px;font-size:13px;background:var(--card)"><div style="font-size:12px;color:var(--text3);margin-bottom:8px">地点（可空）</div><input id="hdPlace" placeholder="如：操场" style="width:100%;padding:8px;border:1px solid var(--line);border-radius:8px;margin-bottom:12px;font-size:13px;background:var(--card)"><div style="font-size:12px;color:var(--text3);margin-bottom:8px">说明（可空）</div><input id="hdNote" placeholder="活动内容" style="width:100%;padding:8px;border:1px solid var(--line);border-radius:8px;margin-bottom:12px;font-size:13px;background:var(--card)"><div style="display:flex;gap:10px;justify-content:flex-end"><button class="btn" onclick="this.closest(\'[style*=fixed]\').remove()">取消</button><button class="btn btn-primary" onclick="HDS()">保存</button></div></div>';m.style.display="flex";}
function HDS(){var name=(document.querySelector("#hdName").value||"").trim();if(!name){Q("活动名称不能空","warn");return;}var date=document.querySelector("#hdDate").value;var place=(document.querySelector("#hdPlace").value||"").trim();var note=(document.querySelector("#hdNote").value||"").trim();D.classActs=D.classActs||[];D.classActs.push({id:I(),name:name,date:date,place:place,note:note});Z();N("classact");Q("活动已保存");var m=document.querySelector("#_modal");if(m)m.remove();}
function HDD(id){D.classActs=D.classActs||[];var i=D.classActs.findIndex(function(x){return x.id===id;});if(i>=0){D.classActs.splice(i,1);Z();N("awards");Q("已删除");}}
function RV(){
var vs=D.volunteers||[];
var tg=D.settings.volunteerTargets||{normal:20,activist:20};
function lvHours(level){var s=0;vs.forEach(function(v){if((v.level||"团员及群众")===level)s+=Number(v.hours)||0;});return s;}
function lvCount(level){return vs.filter(function(v){return (v.level||"团员及群众")===level;}).length;}
var n=lvHours("团员及群众"),a=lvHours("入党积极分子");
function bar(h,t){var p=t>0?Math.min(100,Math.round(h/t*100)):0;return '<div style="margin-top:6px;height:8px;border-radius:4px;background:var(--line);overflow:hidden"><div style="height:100%;width:'+p+'%;background:var(--primary);border-radius:4px"></div></div><div style="font-size:11px;color:var(--text3);margin-top:4px">'+h+'/'+t+'h · '+p+'%</div>';}
function badge(lv,t){var s=RULES.volunteerStatus(lvHours(lv),t);return s.pass?'<span class="tag" style="background:var(--gold-soft);color:var(--success)">已达标</span>':'<span class="tag" style="background:rgba(166,124,61,.1);color:var(--warn)">还差 '+s.remain+'h</span>';}
var h='<div class=stats><div class=stat><div class=l>团员及群众</div><div class=v>'+n+'h</div>'+bar(n,tg.normal)+'<div style=font-size:11px;color:var(--text3);margin-top:4px>'+badge("团员及群众",tg.normal)+' · '+lvCount("团员及群众")+'条记录</div></div><div class=stat><div class=l>入党积极分子</div><div class=v>'+a+'h</div>'+bar(a,tg.activist)+'<div style=font-size:11px;color:var(--text3);margin-top:4px>'+badge("入党积极分子",tg.activist)+' · '+lvCount("入党积极分子")+'条记录</div></div></div>';
if(vs.length){
/* 第二批可视化④：个人达标榜（hermes 口径：volunteers 按 name 聚合 vs volunteerTarget，2026-08-06 sunna） */
var vtg2=D.settings.practiceTarget||20;/* 校规实践达标线（toukai 19:33：与推优线解耦，hermes 已加配置层） */
var vsum={};
vs.forEach(function(v){var nm=String(v.name||"").trim();if(nm)vsum[nm]=(vsum[nm]||0)+(Number(v.hours)||0);});
var vrows=D.members.filter(function(m){return m.memberType==="团员";}).map(function(m){var got=Math.round((vsum[m.name]||0)*10)/10;return {name:m.name,got:got,need:Math.round(Math.max(0,vtg2-got)*10)/10};}).sort(function(a,b){return b.got-a.got;});
var maxG=vtg2;vrows.forEach(function(r){if(r.got>maxG)maxG=r.got;});
var pr='<div class=card style="margin-bottom:14px"><div class=card-title>个人达标榜 <span style="font-size:11px;color:var(--text3);font-weight:400">校规实践达标线 '+vtg2+'h/学期 · 评优资格预览在评优页</span></div><div style="display:flex;flex-direction:column;gap:5px">';
vrows.forEach(function(r){
var pass=r.got>=vtg2;
var p=Math.min(100,Math.round(r.got/maxG*100));
pr+='<div style="display:flex;align-items:center;gap:10px"><span style="font-size:12px;min-width:60px">'+E(r.name)+'</span><div style="flex:1;height:8px;border-radius:999px;background:var(--line);overflow:hidden"><i style="display:block;height:100%;width:'+p+'%;border-radius:999px;background:'+(pass?'var(--ok)':'var(--pending)')+'"></i></div><span style="font-size:11px;font-variant-numeric:tabular-nums;min-width:72px;text-align:right;color:'+(pass?'var(--ok)':'var(--text2)')+'">'+r.got+'h'+(pass?' ✓':' 差 '+r.need+'h')+'</span></div>';});
pr+='</div></div>';
h+=pr;}
h+='<div class=card><div class=card-title>劳动实践记录</div>';
if(vs.length===0){h+=EMP("field","还没有实践记录",'<button class="btn btn-primary" onclick="LRN()">录入时长</button>');}
else{
h+='<div style="border:1px solid var(--line);border-radius:10px;overflow:hidden"><table><thead><tr><th>日期</th><th>成员</th><th>级别</th><th>时长</th><th>说明</th><th></th></tr></thead><tbody>';
vs.slice().reverse().forEach(function(x){h+='<tr><td style="font-size:12px;color:var(--text2)">'+E(x.date||'')+'</td><td style=font-weight:500>'+E(x.name||'')+'</td><td><span class="tag tag-q">'+E(x.level||'团员及群众')+'</span></td><td style="font-variant-numeric:tabular-nums">'+E(x.hours)+'h</td><td style="font-size:12px;color:var(--text3)">'+E(x.note||'')+'</td><td style=text-align:right><span style="cursor:pointer;color:var(--text3);font-size:11px" onclick="LRD(\''+x.id+'\')">删除</span></td></tr>';});
h+='</tbody></table></div><div style="margin-top:12px;text-align:right"><button class="btn btn-primary" onclick="LRN()">录入时长</button></div>';}
h+='<div style=font-size:11px;color:var(--text3);text-align:center;margin-top:8px>官方基线：团员年度志愿服务≥20小时（中青办发〔2020〕3号）；两级分别统计、分别达标，入党积极分子标准以学校要求为准</div></div>';
return h;}
function LRN(){var members=D.members;var opts='';members.forEach(function(m){opts+='<option value="'+m.id+'">'+E(m.name)+'</option>';});
var m=document.querySelector("#_modal");if(!m){m=document.createElement("div");m.id="_modal";m.style="position:fixed;inset:0;background:rgba(0,0,0,.35);z-index:999;display:flex;align-items:center;justify-content:center";m.onclick=function(e){if(e.target===this)this.remove();};document.body.appendChild(m);}
m.innerHTML='<div style="background:var(--card);border-radius:18px;padding:26px;width:420px;max-height:80vh;overflow-y:auto;box-shadow:0 8px 40px rgba(0,0,0,.12)" onclick="event.stopPropagation()"><div style="font-size:16px;font-weight:500;margin-bottom:14px">录入志愿时长</div><div style="font-size:12px;color:var(--text3);margin-bottom:8px">成员</div><select id="lrWho" style="width:100%;padding:8px;border:1px solid var(--line);border-radius:8px;margin-bottom:12px;font-size:13px;background:var(--card)">'+opts+'</select><div style="font-size:12px;color:var(--text3);margin-bottom:8px">级别</div><select id="lrLevel" style="width:100%;padding:8px;border:1px solid var(--line);border-radius:8px;margin-bottom:12px;font-size:13px;background:var(--card)"><option value="团员及群众">团员及群众</option><option value="入党积极分子">入党积极分子</option></select><div style="font-size:12px;color:var(--text3);margin-bottom:8px">时长（小时）</div><input id="lrHours" type=number min=0 step=0.5 placeholder="如：2" style="width:100%;padding:8px;border:1px solid var(--line);border-radius:8px;margin-bottom:12px;font-size:13px;background:var(--card)"><div style="font-size:12px;color:var(--text3);margin-bottom:8px">说明（可空）</div><input id="lrNote" placeholder="如：社区志愿" style="width:100%;padding:8px;border:1px solid var(--line);border-radius:8px;margin-bottom:12px;font-size:13px;background:var(--card)"><div style="display:flex;gap:10px;justify-content:flex-end"><button class="btn" onclick="this.closest(\'[style*=fixed]\').remove()">取消</button><button class="btn btn-primary" onclick="LRS()">保存</button></div></div>';m.style.display="flex";}
function LRS(){var who=document.querySelector("#lrWho").value;var hours=parseFloat(document.querySelector("#lrHours").value);if(isNaN(hours)||hours<=0){Q("时长要填大于 0 的数字","warn");return;}var level=document.querySelector("#lrLevel").value;var note=(document.querySelector("#lrNote").value||"").trim();var mm=D.members.find(function(x){return x.id===who;});D.volunteers=D.volunteers||[];D.volunteers.push({id:I(),name:mm?mm.name:'',level:level,hours:Math.round(hours*10)/10,note:note,date:T()});Z();N("awards");Q("时长已录入");var m=document.querySelector("#_modal");if(m)m.remove();}
function LRD(id){D.volunteers=D.volunteers||[];var i=D.volunteers.findIndex(function(x){return x.id===id;});if(i>=0){D.volunteers.splice(i,1);Z();N("awards");Q("已删除");}}
function RW(){
var list=D.awards||[];
var h='<div class=card><div class=card-title>评优评先</div>';
h+='<div style=font-size:12px;color:var(--text3);margin-bottom:12px>荣誉申报前置门槛（以当年评选文件为准）：</div>';
RULES.AWARD_HINTS.forEach(function(x){h+='<div style="padding:8px 0;border-bottom:1px solid var(--line)">'+x+'</div>';});
/* 劳动实践前置核查：volunteers 按人聚合，图谱「时长门槛」线从虚变实（2026-08-06 hermes） */
var vtg=D.settings.awardVolunteerTarget||30;/* 评优优秀线：实践门槛独立于推优合格线（toukai 19:22 提醒，配置层可调） */
var vsum={};
(D.volunteers||[]).forEach(function(v){var nm=String(v.name||"").trim();if(nm)vsum[nm]=(vsum[nm]||0)+(Number(v.hours)||0);});
var vrows=D.members.filter(function(m){return m.memberType==="团员";}).map(function(m){var got=Math.round((vsum[m.name]||0)*10)/10;return {name:m.name,got:got,need:Math.round(Math.max(0,vtg-got)*10)/10};}).sort(function(a,b){return b.got-a.got;});
h+='<div style="margin-top:12px"><div style="font-size:12px;color:var(--text2);margin-bottom:6px">劳动实践时长核查（目标 '+vtg+'h/学期 · 数据源：劳动实践页）</div>';
vrows.forEach(function(r){var ok=r.got>=vtg;h+='<div style="display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px dashed var(--line)"><span style="font-size:13px;width:84px">'+E(r.name)+'</span><span class="tag" style="'+(ok?'background:var(--gold-soft);color:var(--success)':'background:rgba(154,59,42,.08);color:var(--error)')+'">'+r.got+'h · '+(ok?'达标':'差 '+r.need+'h')+'</span></div>';});
h+='</div>';
h+='<div style=margin-top:12px>';
if(list.length===0){h+=EMP("seal","还没有评优记录",'<button class="btn btn-primary" onclick="PYN()">发起评优</button>');}
else{
h+='<div style="border:1px solid var(--line);border-radius:10px;overflow:hidden"><table><thead><tr><th>日期</th><th>评选类型</th><th>候选人</th><th></th></tr></thead><tbody>';
list.slice().reverse().forEach(function(x){h+='<tr><td style="font-size:12px;color:var(--text2)">'+E(x.date||'')+'</td><td><span class="tag tag-p">'+E(x.type)+'</span></td><td style="font-size:12px">'+E((x.names||[]).join('、')||'—')+'</td><td style=text-align:right><span style="cursor:pointer;color:var(--text3);font-size:11px" onclick="PYD(\''+x.id+'\')">删除</span></td></tr>';});
h+='</tbody></table></div><div style="margin-top:12px;text-align:right"><button class="btn btn-primary" onclick="PYN()">发起评优</button></div>';}
h+='</div></div>';return h;}
function PYN(){var members=D.members.filter(function(m){return m.memberType==="团员";});var rows='';members.forEach(function(m){rows+='<tr><td style="padding:5px 8px">'+E(m.name)+'</td><td style=text-align:center><input type=checkbox id="py_'+m.id+'"></td></tr>';});
var m=document.querySelector("#_modal");if(!m){m=document.createElement("div");m.id="_modal";m.style="position:fixed;inset:0;background:rgba(0,0,0,.35);z-index:999;display:flex;align-items:center;justify-content:center";m.onclick=function(e){if(e.target===this)this.remove();};document.body.appendChild(m);}
m.innerHTML='<div style="background:var(--card);border-radius:18px;padding:26px;width:440px;max-height:80vh;overflow-y:auto;box-shadow:0 8px 40px rgba(0,0,0,.12)" onclick="event.stopPropagation()"><div style="font-size:16px;font-weight:500;margin-bottom:14px">发起评优</div><select id="pyType" style="width:100%;padding:8px;border:1px solid var(--line);border-radius:8px;margin-bottom:12px;font-size:13px;background:var(--card)"><option value="优秀共青团员">优秀共青团员</option><option value="优秀共青团干部">优秀共青团干部</option><option value="五四红旗团支部候选">五四红旗团支部候选</option></select><div style="font-size:12px;color:var(--text3);margin-bottom:8px">勾选候选人（团员）</div><table style=width:100%><tbody>'+rows+'</tbody></table><div style="margin-top:14px;display:flex;gap:10px;justify-content:flex-end"><button class="btn" onclick="this.closest(\'[style*=fixed]\').remove()">取消</button><button class="btn btn-primary" onclick="PYS()">保存</button></div></div>';m.style.display="flex";}
function PYS(){var type=document.querySelector("#pyType").value;var names=[];D.members.forEach(function(m){var c=document.querySelector("#py_"+m.id);if(c&&c.checked)names.push(m.name);});if(names.length===0){Q("请至少勾选一名候选人","warn");return;}D.awards=D.awards||[];D.awards.push({id:I(),type:type,names:names,date:T()});Z();N("awards");Q("评优已记录");var m=document.querySelector("#_modal");if(m)m.remove();}
function PYD(id){D.awards=D.awards||[];var i=D.awards.findIndex(function(x){return x.id===id;});if(i>=0){D.awards.splice(i,1);Z();N("awards");Q("已删除");}}
function RH(){
var list=D.honors||[];
function lvTag(lv){var c="tag-q";if(lv==="校级"){c="tag-p";}if(lv==="省级"||lv==="国家级"){c="tag-p";return '<span class="tag" style="background:var(--primary-soft);color:var(--primary)">'+E(lv)+'</span>';}return '<span class="tag '+c+'">'+E(lv||"")+'</span>';}
function sec(scope,title,icon,btnLabel){
var items=list.filter(function(x){return x.scope===scope;});
var h2='<div class=card><div class=card-title>'+title+'</div>';
if(items.length===0){h2+=EMP(icon,"还没有"+title,'<button class="btn btn-primary" onclick="RHN(\''+scope+'\')">'+btnLabel+'</button>');}
else{
h2+='<div style="border:1px solid var(--line);border-radius:10px;overflow:hidden"><table><thead><tr><th>日期</th><th>荣誉名称</th><th>等级</th><th>获奖者/集体</th><th>备注</th><th></th></tr></thead><tbody>';
items.slice().reverse().forEach(function(x){h2+='<tr><td style="font-size:12px;color:var(--text2)">'+E(x.date||'')+'</td><td style=font-weight:500>'+E(x.title)+'</td><td>'+lvTag(x.level)+'</td><td style="font-size:12px">'+E(x.holder||'—')+'</td><td style="font-size:12px;color:var(--text3)">'+E(x.note||'')+'</td><td style=text-align:right><span style="cursor:pointer;color:var(--text3);font-size:11px" onclick="CONFIRM(function(){RHD(\''+x.id+'\')})">删除</span></td></tr>';});
h2+='</tbody></table></div><div style="margin-top:12px;text-align:right"><button class="btn btn-primary" onclick="RHN(\''+scope+'\')">'+btnLabel+'</button></div>';}
h2+='</div>';return h2;}
/* P2⑥ 概览卡：荣誉统计（sunna 2026-08-06） */
var cl=list.filter(function(x){return x.scope==="班级";}).length;
var pr=list.filter(function(x){return x.scope==="个人";}).length;
var cnt={},top="",tmax=0;
list.forEach(function(x){String(x.holder||"").split(/[、,]/).forEach(function(nm){nm=nm.trim();if(!nm)return;cnt[nm]=(cnt[nm]||0)+1;if(cnt[nm]>tmax){tmax=cnt[nm];top=nm;}});});
var lead='<div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:14px"><span class="tag tag-q">个人荣誉 '+pr+' 项</span><span class="tag tag-q">班级荣誉 '+cl+' 项</span>'+(top?'<span class="tag" style="background:var(--primary-soft);color:var(--primary)">荣誉最亮：'+E(top)+'（'+tmax+' 项）</span>':'')+'</div>';
return lead+sec("班级","班级荣誉","seal","添加班级荣誉")+sec("个人","个人荣誉","plum","添加个人荣誉");}
function RHN(scope){
var m=document.querySelector("#_modal");if(!m){m=document.createElement("div");m.id="_modal";m.style="position:fixed;inset:0;background:rgba(0,0,0,.35);z-index:999;display:flex;align-items:center;justify-content:center";m.onclick=function(e){if(e.target===this)this.remove();};document.body.appendChild(m);}
window.__rhScope=scope;
m.innerHTML='<div style="background:var(--card);border-radius:18px;padding:26px;width:440px;max-height:82vh;overflow-y:auto;box-shadow:0 8px 40px rgba(0,0,0,.12)" onclick="event.stopPropagation()"><div style="font-size:16px;font-weight:500;margin-bottom:14px">添加'+scope+'荣誉</div><div style="font-size:12px;color:var(--text3);margin-bottom:8px">荣誉名称</div><input id="rhTitle" placeholder="如：军训先进班集体 / 优秀共青团员" style="width:100%;padding:8px;border:1px solid var(--line);border-radius:8px;margin-bottom:12px;font-size:13px;background:var(--card)"><div style="font-size:12px;color:var(--text3);margin-bottom:8px">等级</div><select id="rhLevel" style="width:100%;padding:8px;border:1px solid var(--line);border-radius:8px;margin-bottom:12px;font-size:13px;background:var(--card)"><option value="待定" selected>待定</option><option value="院级">院级</option><option value="校级">校级</option><option value="省级">省级</option><option value="国家级">国家级</option></select><div style="font-size:12px;color:var(--text3);margin-bottom:8px">获奖者'+(scope==="班级"?'/集体（如 25通信工程X班，可空）':'（如 姓名）')+'</div><input id="rhHolder" style="width:100%;padding:8px;border:1px solid var(--line);border-radius:8px;margin-bottom:12px;font-size:13px;background:var(--card)"><div style="font-size:12px;color:var(--text3);margin-bottom:8px">日期（可空）</div><input id="rhDate" type=date value="'+T()+'" style="width:100%;padding:8px;border:1px solid var(--line);border-radius:8px;margin-bottom:12px;font-size:13px;background:var(--card)"><div style="font-size:12px;color:var(--text3);margin-bottom:8px">备注（可空）</div><input id="rhNote" placeholder="颁奖单位/证书编号等" style="width:100%;padding:8px;border:1px solid var(--line);border-radius:8px;margin-bottom:12px;font-size:13px;background:var(--card)"><div style="display:flex;gap:10px;justify-content:flex-end"><button class="btn" onclick="this.closest(\'[style*=fixed]\').remove()">取消</button><button class="btn btn-primary" onclick="RHS()">保存</button></div></div>';m.style.display="flex";}
function RHS(){var scope=window.__rhScope||"班级";var title=(document.querySelector("#rhTitle").value||"").trim();if(!title){Q("荣誉名称不能空","warn");return;}var level=document.querySelector("#rhLevel").value;var holder=(document.querySelector("#rhHolder").value||"").trim();var date=document.querySelector("#rhDate").value;var note=(document.querySelector("#rhNote").value||"").trim();D.honors=D.honors||[];D.honors.push({id:I(),scope:scope,title:title,level:level,holder:holder,date:date,note:note});Z();N("awards");Q(scope+"荣誉已添加");var m=document.querySelector("#_modal");if(m)m.remove();}
function RHD(id){D.honors=D.honors||[];var i=D.honors.findIndex(function(x){return x.id===id;});if(i>=0){D.honors.splice(i,1);Z();N("awards");Q("已删除");}}
var GRP_FILTER="全部";
function RGQ(){
  var h='<div class="card" style="padding:16px;margin-bottom:14px"><div class="card-title" style="margin-bottom:4px">工作群情报</div><div style="font-size:12px;color:var(--text3);margin-bottom:12px">工作群概览 · 共 '+GRP_DATA.length+' 个群（数据源：微信原始数据 07-31 快照，团务 cron 刷新）</div><div id="grpTab" style="display:flex;gap:8px;flex-wrap:wrap">'+GRP_TABS()+'</div></div><div id="grpList" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:12px">'+GRP_CARDS()+'</div>';
  h += (window.HINSIGHT ? HINSIGHT() : '');
return h;}
function GRP_TABS(){
  var tags=["全部"],seen={};
  GRP_DATA.forEach(function(g){if(!seen[g.tag]){seen[g.tag]=1;tags.push(g.tag);}});
  return tags.map(function(t){
    var on=t===GRP_FILTER;
    return '<button class="btn btn-sm" onclick="GRPF(\''+t+'\')" style="'+(on?'background:var(--primary-soft);color:var(--primary);border-color:var(--primary);font-weight:500;':'')+'">'+t+'</button>';
  }).join('');}
function GRPF(t){GRP_FILTER=t;var tb=document.querySelector("#grpTab");if(tb)tb.innerHTML=GRP_TABS();var ls=document.querySelector("#grpList");if(ls)ls.innerHTML=GRP_CARDS();}
function GRP_CARDS(){
  var list=GRP_FILTER==="全部"?GRP_DATA:GRP_DATA.filter(function(g){return g.tag===GRP_FILTER;});
  if(!list.length)return '<div style="grid-column:1/-1;padding:36px;text-align:center;color:var(--text3);font-size:13px">该分类暂无群</div>';
  /* 情报流 · 活跃分层（2026-08-06 sunna：轻重不警报，暖引导语言）按最新事件日期+消息量定层 */
  function LVL(g){
    var latest="";
    (g.ev||[]).forEach(function(x){if(String(x.d)>latest)latest=String(x.d);});
    var ms=parseFloat(String(g.msgs).replace(/[kK,，]/g,""))||0;
    if(latest>="2026-06"||ms>=40)return 2;
    if(latest>="2026-01"||ms>=15)return 1;
    return 0;
  }
  return list.map(function(g){
    var i=GRP_DATA.indexOf(g);
    var L=LVL(g);
    var edge=L===2?"var(--primary)":(L===1?"var(--gold)":"var(--line)");
    var lvlTxt=L===2?"最近很热闹":(L===1?"平稳有动静":"静置中");
    var lvlTag=L===2?"tag-p":"tag-q";
    var evs=(g.ev||[]).slice().sort(function(a,b){return String(a.d)>String(b.d)?-1:1;}).slice(0,2);
    var more=(g.ev||[]).length-2;
    var h='<div class="card" style="cursor:pointer;padding:14px;border-left:3px solid '+edge+'" onclick="GRPD('+i+')">';
    h+='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px"><b style="font-size:14px">'+E(g.name)+'</b><span class="tag '+lvlTag+'">'+lvlTxt+'</span></div>';
    h+='<div style="display:flex;gap:16px;margin-bottom:8px"><span style="font-size:12px;color:var(--text2)">消息 <b style="color:var(--text);font-variant-numeric:tabular-nums">'+E(g.msgs)+'</b> 条</span><span style="font-size:12px;color:var(--text3)">'+E(g.tag)+'</span></div>';
    h+='<div style="font-size:12px;color:var(--text2);line-height:1.5;margin-bottom:8px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">'+E(g.use)+'</div>';
    if(evs.length){
      h+='<div style="border-top:1px solid var(--line);padding-top:8px">'+evs.map(function(x){return '<div style="display:flex;gap:8px;align-items:baseline;font-size:11px;color:var(--text3);margin-bottom:2px"><span style="font-family:var(--font-mono);white-space:nowrap;flex-shrink:0">'+E(x.d)+'</span><span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+E(x.t)+'</span></div>';}).join('');
      h+='<div style="font-size:11px;color:var(--primary);margin-top:4px">'+(more>0?'还有 '+more+' 条事件 · ':'')+'点开看全部 →</div></div>';
    }else{
      h+='<div style="font-size:11px;color:var(--text3);margin-top:4px">暂无事件记录 · 点开看详情 →</div>';
    }
    h+='</div>';
    return h;
  }).join('');}
function GRPD(i){
  var g=GRP_DATA[i];if(!g)return;
  var m=document.querySelector("#_modal");
  if(!m){m=document.createElement("div");m.id="_modal";m.style="position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:999;display:flex;align-items:center;justify-content:center";m.onclick=function(e){if(e.target===this)this.remove();};document.body.appendChild(m);}
  m.innerHTML='<div style="background:var(--card);border-radius:var(--r);padding:20px;width:500px;max-width:92vw;max-height:84vh;overflow-y:auto;box-shadow:var(--shadow-lg)" onclick="event.stopPropagation()"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px"><b style="font-size:16px;font-family:var(--font-serif)">'+E(g.name)+'</b><span class="tag tag-q">'+E(g.tag)+' · '+E(g.msgs)+' 条</span></div><div style="font-size:13px;color:var(--text2);margin-bottom:12px;line-height:1.6">'+E(g.use)+'</div><div style="font-size:12px;color:var(--text3);margin-bottom:6px">事件时间线</div>'+(g.ev&&g.ev.length?g.ev.map(function(x){return '<div style="display:flex;gap:10px;align-items:baseline;padding:6px 0;border-bottom:1px dashed var(--line);font-size:13px"><span style="color:var(--text3);font-family:var(--font-mono);font-size:11px;white-space:nowrap">'+E(x.d)+'</span><span>'+E(x.t)+'</span></div>';}).join(''):'<div style="font-size:12px;color:var(--text3);padding:8px 0">暂无事件记录，完整分析见分析文件</div>')+'<div style="margin-top:14px;font-size:11px;color:var(--text3)">分析文件：D:\微信原始数据\entities\（按群名检索）</div><div style="text-align:right;margin-top:14px"><button class="btn" onclick="this.closest(\'#_modal\').remove()">关闭</button></div></div>';
  m.style.display="flex";}
function RTU(){
var members=D.members.filter(function(m){return m.memberType==="团员";});
var cands=D.tuiyouCandidates||[];
var h='<div class=card><div class=card-title>推优入党 · 条件自动核查</div>';
h+='<div style=font-size:12px;color:var(--text3);margin-bottom:12px>核查：年满18岁 · 团龄≥1年 · 本批人数≤团员总数20%（任一不满足标红原因）。提示：推优一般从已递交入党申请书的团员中择优推荐（高校通行做法）</div>';
var tsum=TUIYOU_SUMMARY(members);
var tcap=Math.max(1,Math.floor(members.length*0.2));
var tr=24,TC=2*Math.PI*tr,tratio=tsum.ready>0?Math.min(1,tsum.ready/tcap):0,toff=TC*(1-tratio);
h+='<div style="display:flex;gap:16px;align-items:center;margin-bottom:14px;padding:14px 16px;border:1px solid var(--line);border-radius:var(--r);background:var(--card)"><div class=ring style="width:76px;height:76px;flex-shrink:0"><svg width="76" height="76" viewBox="0 0 76 76"><circle class=ring-bg cx="38" cy="38" r="'+tr+'" fill=none stroke-width="7"/><circle class=ring-fg cx="38" cy="38" r="'+tr+'" fill=none stroke-width="7" stroke-linecap=round stroke-dasharray="'+TC.toFixed(1)+'" stroke-dashoffset="'+toff.toFixed(1)+'"/></svg><div class=ring-num><b style=font-size:18px>'+tsum.ready+'</b><span>/ '+tcap+'</span></div></div><div style="flex:1"><div style="font-size:13px;font-weight:500;margin-bottom:6px">当前合规 '+(tsum.ready>0?tsum.ready:'0')+' 人 / 本批名额 '+(tsum.ready>=tcap?'已满':'还剩 '+(tcap-tsum.ready)+' 人')+'</div><div style="font-size:12px;color:var(--text3);line-height:1.8">'+(tsum.noBirth?'缺出生年月 '+tsum.noBirth+' 人（推优页无法核查年龄，先去台账补录）':'出生年月已齐')+' · '+(tsum.shortY?'团龄不足 '+tsum.shortY+' 人':'团龄全部达标')+'</div></div>'+(tsum.noBirth>0?'<button class="btn btn-primary btn-sm" onclick="N(\'members\')">去台账补录</button>':'<span class="tag" style="background:var(--gold-soft);color:var(--ok)">数据就绪</span>')+'</div>';
var hh='<table style=width:100%><thead><tr><th>候选</th><th>姓名</th><th>年龄</th><th>团龄</th><th>核查结果</th></tr></thead><tbody>';
members.forEach(function(m){
var r=RULES.checkTuiyouMember(m);
var ck=cands.indexOf(m.id)>=0?'checked':'';
var cell=r.pass?'<span class="tag" style="background:var(--gold-soft);color:var(--success)">条件齐备</span>':'<span class="tag" style="background:rgba(154,59,42,.1);color:var(--error)">'+r.problems.join('；')+'</span>';
hh+='<tr><td><input type=checkbox '+ck+' onchange="TU(\''+m.id+'\',this.checked)"></td><td style=font-weight:600>'+E(m.name)+'</td><td style=font-size:11px>'+(r.age?r.age+'岁':'—')+'</td><td style=font-size:11px>'+(r.years?r.years+'年':'—')+'</td><td>'+cell+'</td></tr>';
});
hh+='</tbody></table>';
h+=hh;
var batch=RULES.checkTuiyouBatch(cands.length,members);
h+='<div style=margin-top:10px;font-size:12px;color:var(--text3)>当前批次：'+cands.length+'人 · '+E(batch.msg)+'（推优有效期 2 年，中青发〔2019〕9号）</div>';
h+='<div style=margin-top:10px><button class="btn btn-primary btn-sm" onclick="TUS()">发起推优</button></div>';
h+='</div>';
return h;}
function TU(id,on){
D.tuiyouCandidates=D.tuiyouCandidates||[];
var i=D.tuiyouCandidates.indexOf(id);
if(on&&i<0)D.tuiyouCandidates.push(id);
if(!on&&i>=0)D.tuiyouCandidates.splice(i,1);
Z();N("tuitui");}
function TUS(){
var members=D.members.filter(function(m){return m.memberType==="团员";});
var cands=D.tuiyouCandidates||[];
if(cands.length===0){Q("请先勾选候选人","info");return;}
var bad=members.filter(function(m){return cands.indexOf(m.id)>=0&&!RULES.checkTuiyouMember(m).pass;});
if(bad.length>0){Q("有 "+bad.length+" 人条件不齐（"+bad.map(function(m){return m.name;}).join("、")+"），请先补录或调整","err");return;}
var b=RULES.checkTuiyouBatch(cands.length,members);
if(!b.ok){Q(b.msg,"err");return;}
D.tuiyouBatches=D.tuiyouBatches||[];D.tuiyouBatches.push({date:T(),ids:cands.slice()});
Z();Q("推优发起成功：本批 "+cands.length+" 人，已记录（有效期 2 年）");}

/* ---- TZS 注册表(阶段A:全局名保留,仅登记) ---- */
window.TZS = window.TZS || {};
window.TZS.modules_members = {
  RM,
  COPYREMIND,
  CPCOPY,
  EVT,
  HYOVER,
  HYOUT,
  DROPDOC,
  DOCPREP,
  DOCS,
  HYN,
  HYS,
  HYD,
  RZN,
  RZMAP,
  RZS,
  RZD,
  EVN,
  EVS,
  RS,
  RA,
  KQN,
  KQS,
  KQD,
  RX,
  HDN,
  HDS,
  HDD,
  RV,
  LRN,
  LRS,
  LRD,
  RW,
  PYN,
  PYS,
  PYD,
  RH,
  RHN,
  RHS,
  RHD,
  RGQ,
  GRP_TABS,
  GRPF,
  GRP_CARDS,
  GRPD,
  RTU,
  TU,
  TUS,
};
