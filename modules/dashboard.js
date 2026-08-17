function RD(){
/* 总览样板页 v1（第一批 · 2026-08-06 晚，3 秒标准：逾期/待补录/待办/实践差 四要素首屏） */
var n=D.members.length;var tu=RULES.tuanYuanCount(D.members);
var td=(D.todos||[]).filter(function(t){return !t.done;}).length;
var vh=0;(D.volunteers||[]).forEach(function(v){vh+=Number(v.hours)||0;});
var vt=D.settings.volunteerTarget||20;var vs=RULES.volunteerStatus(vh,vt);
var ms=D.members.filter(function(m){return m.memberType==="团员";});
var ts=TUIYOU_SUMMARY(ms);
var noB=ts.noBirth,shortY=ts.shortY,ready=ts.ready;
var tcap=Math.max(1,Math.floor(ms.length*0.2));
var evs=(D.evaluations||[]).length;
/* 逾期：上月遗留未勾（MONTHCARD 同口径） */
var now=new Date(),mn=now.getMonth()+1,yr=now.getFullYear();
var prev=new Date(yr,mn-2,1),pmn=prev.getMonth()+1;
D.dashDone=D.dashDone||{};var pDone=D.dashDone[prev.getFullYear()+'-'+pmn]||{};
var overdue=(RULES.MONTHLY_RHYTHM[pmn]||[]).filter(function(x){return !pDone[x];}).length;
/* 三态计数（v1.3 口径：缺数据命中即止） */
var sts=[];
sts.push(noB>0?"gap":"ok");
sts.push(noB>0?"gap":(shortY>0?"pen":(ready>=tcap?"ok":"gap")));
sts.push(vh>=vt?"ok":"gap");
sts.push(td===0?"ok":"gap");
sts.push(evs>0?"ok":"gap");
var okN=sts.filter(function(s){return s==="ok";}).length;
var gapN=sts.filter(function(s){return s==="gap";}).length;
var penN=sts.filter(function(s){return s==="pen";}).length;
var h='';
/* ① 今天该干嘛：四要素首屏，3 秒可读 */
h+='<div class=card style="margin-bottom:14px"><div class=card-title>今天该干嘛</div>';
h+='<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(148px,1fr));gap:12px">';
h+=ACTCARD('逾期事项',overdue+' 项',overdue>0?'去处理':'清爽','dash',overdue>0?'var(--gap)':'var(--text3)');
h+=ACTCARD('待补录',noB+' 人',noB>0?'去台账补录':'已齐','members',noB>0?'var(--pending)':'var(--ok)');
h+=ACTCARD('待办',td+' 条个人待办',td>0?'去待办':'放心','dash',td>0?'var(--pending)':'var(--ok)');
h+=ACTCARD('实践',vs.pass?'已达标':'差 '+vs.remain+'h',vs.pass?'查看':'去记录','volunteer',vs.pass?'var(--ok)':'var(--gap)');
h+='</div><div style="font-size:11px;color:var(--text3);margin-top:10px">3 秒看清今天该动哪一步 · 点卡片直达对应页</div></div>';
/* ② 当前层的事（工作流盘点 v0.1：定位现在在哪层再给事） */
h+=CURRENTCARD();
/* ③ 数据健康度概览条：三态 + 名额 + 入口 */
h+='<div style="display:flex;gap:10px;align-items:center;margin-bottom:16px;padding:12px 16px;border:1px solid var(--line);border-radius:var(--r);background:var(--card);flex-wrap:wrap">';
h+='<span style="font-size:12px;color:var(--text2);margin-right:2px">数据健康度</span>';
h+='<span class="tag" style="background:var(--gold-soft);color:var(--ok)">'+okN+' 就绪</span>';
h+='<span class="tag" style="background:rgba(154,59,42,.1);color:var(--gap)">'+gapN+' 缺数据</span>';
h+='<span class="tag" style="background:rgba(166,124,61,.12);color:var(--pending)">'+penN+' 团龄不足</span>';
h+='<span style="margin-left:auto;font-size:12px;color:var(--text2)">推优 '+ready+'/'+tcap+'</span>';
h+='<button class="btn btn-sm" onclick="N(\'health\')">完整健康度</button></div>';
/* ③.5 数据可视化：本月热力图 + 成员雷达（④ 数据可视化 · codx） */
h+=HEATMAP();
/* 个人AI工作台合并进总览（V5.2） */
h+=(window.AIWORK_SECTION?AIWORK_SECTION():'');
/* V2：待办并总览 —— 总览页直接内嵌完整待办清单 */
h+='<div class=card><div class=card-title>待办清单 <span style="font-weight:400;font-size:11px;color:var(--text3)">未完成 '+D.todos.filter(function(x){return !x.done;}).length+' 项 · 会议/通知可一键转待办</span></div>'+RT()+'</div>';

return h;}
function CURRENTCARD(){
/* 工作流盘点 v0.1（诗宝 19:20）：定位「现在在哪层」再给事，月度节奏驱动 + 暑期/开学档提示 */
var now=new Date(),mn=now.getMonth()+1,yr=now.getFullYear(),key=yr+'-'+mn;
var prev=new Date(yr,mn-2,1),pmn=prev.getMonth()+1;
D.dashDone=D.dashDone||{};var done=D.dashDone[key]||{},pDone=D.dashDone[prev.getFullYear()+'-'+pmn]||{};
var items=RULES.MONTHLY_RHYTHM[mn]||[];
var leftover=(RULES.MONTHLY_RHYTHM[pmn]||[]).filter(function(x){return !pDone[x];});
/* 校历档位：配置层读（toukai 19:22），默认随 rules.js 出厂，另一学校改 D.settings.layerMap 覆盖 */
var lm=((D.settings&&D.settings.layerMap)||RULES.DEFAULT_LAYER_MAP||[]);
var hit=null;lm.forEach(function(x){if(x.months&&x.months.indexOf(mn)>=0)hit=x;});
var layer=hit?(hit.hint||"当前层"):"日常流 · 收通知 → 转达 → 待办 → 盯落实 → 收材料";
var h='<div class=card style="margin-bottom:14px"><div class=card-title>'+mn+'月 · 当前层的事</div>';
h+='<div style="font-size:12px;color:var(--text2);margin-bottom:10px">'+layer+'</div>';
h+='<ul class=task-list>';
items.forEach(function(x,i){var is=!!done[x];
h+='<li class="task-item'+(is?' done':'')+'"><button class=task-chk onclick="DD(\''+key+'\','+i+')" title="点击标记完成">✓</button><span class=task-t>'+E(x)+'</span><span class="task-tag '+(is?'ok':'pending')+'">'+(is?'已完成':'进行中')+'</span></li>';});
if(leftover.length){
h+='<li style="padding:8px 2px 2px;font-size:11px;color:var(--text3)">上月遗留（'+pmn+'月，逾期）</li>';
leftover.forEach(function(x,i){var is=!!pDone[x];
h+='<li class="task-item'+(is?' done':'')+'"><button class=task-chk onclick="DD(\''+prev.getFullYear()+'-'+pmn+'\','+RULES.MONTHLY_RHYTHM[pmn].indexOf(x)+')" title="点击标记完成">✓</button><span class=task-t>'+E(x)+'</span><span class="task-tag gap">逾期</span></li>';});}
h+='</ul></div>';
return h;}
function ACTCARD(l,v,act,pg,col){
return '<div class="stat" onclick="N(\''+pg+'\')" style="cursor:pointer;padding:14px 16px;gap:4px"><div class=l>'+l+'</div><div class=v style="font-size:28px;color:'+col+';margin-bottom:2px">'+v+'</div><span class="tag tag-q" style="align-self:flex-start">'+act+'</span></div>';}
function GRAPH_CARD(){
return '<div class=card><div class=card-title>团务关系图谱 <span style="font-size:11px;color:var(--text3);font-weight:400">Obsidian 式可视化：节点是资料，连线是关系，点节点直达</span></div><div id=gwrap>'+GBODY()+'</div></div>';}
function INSIGHT(){
var tu=D.members.filter(function(m){return m.memberType==="团员";});
var counts={};tu.forEach(function(m){counts[m.name]=0;});
(D.honors||[]).forEach(function(h2){String(h2.holder||"").split(/[、,]/).forEach(function(nm){nm=nm.trim();if(counts[nm]!==undefined)counts[nm]++;});});
var top=null,tmax=0;tu.forEach(function(m){if(counts[m.name]>tmax){tmax=counts[m.name];top=m.name;}});
var noB=tu.filter(function(m){return !m.birthMonth;}).length;
var vh=0;D.volunteers.forEach(function(v){vh+=Number(v.hours)||0;});
var vt=D.settings.volunteerTarget||20;
var da=D.meetings.filter(function(x){return x.type==="支部大会";}).length;
var clsH=(D.honors||[]).filter(function(h2){return String(h2.holder||"").indexOf("班")>=0;}).length;
var out=[];
if(top&&tmax>0)out.push("荣誉最亮的同学："+top+"（"+tmax+" 项个人荣誉）");
out.push(noB>0?"还有 "+noB+" 位团员缺出生年月，推优核查被卡住 → 数据健康度补录":"出生年月已全部补录，推优核查畅通");
out.push(vh>=vt?"劳动实践已达标，进度环是绿的":"劳动实践还差 "+(vt-vh)+"h，是这学期最大的缺口");
out.push("支部大会 "+da+"/3"+(da>=3?"（达标）":"（未达标）")+"，会议底子在积累");
out.push("班级荣誉 "+clsH+" 项，活力团支部的底气在这");
return '<div class=card style="margin-top:12px"><div class=card-title>这张网告诉你</div>'+out.map(function(x){return '<div style="padding:5px 0;font-size:13px;color:var(--text2)"><span style="color:var(--primary);margin-right:8px">·</span>'+x+'</div>';}).join("")+'</div>';}
function RING(vh,vt,vs){
var R=44,C=2*Math.PI*R,ratio=vt>0?Math.min(1,vh/vt):0,off=C*(1-ratio),okCls=vs.pass?' ok':'';
var t=vs.pass?'已达标':'还差 '+vs.remain+'h';
return '<div class=card><div class=card-title>劳动实践进度</div><div class=ring-wrap><div class="ring'+okCls+'"><svg width="104" height="104" viewBox="0 0 104 104"><circle class=ring-bg cx="52" cy="52" r="'+R+'" fill=none stroke-width="8"/><circle class=ring-fg cx="52" cy="52" r="'+R+'" fill=none stroke-width="8" stroke-linecap=round stroke-dasharray="'+C.toFixed(1)+'" stroke-dashoffset="'+off.toFixed(1)+'"/></svg><div class=ring-num><b>'+vh+'h</b><span>/ '+vt+'h</span></div></div><div class=ring-side><div class=l>'+t+'</div><div class=bar><i class="'+okCls+'" style="width:'+Math.round(ratio*100)+'%"></i></div><div style="font-size:11px;color:var(--text3);line-height:1.7">团员目标 '+vt+'h；入党积极分子按支部通知另行核算</div><div style="margin-top:10px"><button class="btn btn-sm btn-primary" onclick="VOLQ()">记录一次实践</button></div></div></div></div>';}
function VOLQ(){
  var opts='';D.members.forEach(function(m){opts+='<option value="'+m.id+'">'+E(m.name)+'</option>';});
  var m=document.querySelector("#_modal");if(!m){m=document.createElement("div");m.id="_modal";m.style="position:fixed;inset:0;background:rgba(0,0,0,.35);z-index:999;display:flex;align-items:center;justify-content:center";m.onclick=function(e){if(e.target===this)this.remove();};document.body.appendChild(m);}
  m.innerHTML='<div style="background:var(--card);border-radius:18px;padding:26px;width:420px;max-height:80vh;overflow-y:auto;box-shadow:0 8px 40px rgba(0,0,0,.12)" onclick="event.stopPropagation()"><div style="font-size:16px;font-weight:500;margin-bottom:14px">记录一次实践</div><div style="font-size:12px;color:var(--text3);margin-bottom:8px">成员</div><select id="vqWho" style="width:100%;padding:8px;border:1px solid var(--line);border-radius:8px;margin-bottom:12px;font-size:13px;background:var(--card)">'+opts+'</select><div style="font-size:12px;color:var(--text3);margin-bottom:8px">级别</div><select id="vqLevel" style="width:100%;padding:8px;border:1px solid var(--line);border-radius:8px;margin-bottom:12px;font-size:13px;background:var(--card)"><option value="团员及群众">团员及群众</option><option value="入党积极分子">入党积极分子</option></select><div style="font-size:12px;color:var(--text3);margin-bottom:8px">时长（小时）</div><input id="vqHours" type=number min=0 step=0.5 placeholder="如：2" style="width:100%;padding:8px;border:1px solid var(--line);border-radius:8px;margin-bottom:12px;font-size:13px;background:var(--card)"><div style="font-size:12px;color:var(--text3);margin-bottom:8px">说明（可空）</div><input id="vqNote" placeholder="如：社区志愿" style="width:100%;padding:8px;border:1px solid var(--line);border-radius:8px;margin-bottom:12px;font-size:13px;background:var(--card)"><div style="display:flex;gap:10px;justify-content:flex-end"><button class="btn" onclick="this.closest(\'[style*=fixed]\').remove()">取消</button><button class="btn btn-primary" onclick="VOLS()">保存</button></div></div>';m.style.display="flex";}
function VOLS(){
  var who=document.querySelector("#vqWho").value;
  var hours=parseFloat(document.querySelector("#vqHours").value);
  if(isNaN(hours)||hours<=0){Q("时长要填大于 0 的数字","warn");return;}
  var level=document.querySelector("#vqLevel").value;
  var note=(document.querySelector("#vqNote").value||"").trim();
  var mm=D.members.find(function(x){return x.id===who;});
  D.volunteers=D.volunteers||[];
  D.volunteers.push({id:I(),name:mm?mm.name:'',level:level,hours:Math.round(hours*10)/10,note:note,date:T()});
  Z();N("dash");Q("已记录 "+hours+"h");
  var m=document.querySelector("#_modal");if(m)m.remove();}
function ARCHCARD(n,tu){
var h='<div class=card><div class=card-title>支部架构</div><div>';
D.members.forEach(function(m){if(m.role){h+='<span class="tag tag-p" style=margin-right:6px>'+E(m.role)+'：'+E(m.name)+'</span>';}});
h+='</div><div style="font-size:11px;color:var(--text3);margin-top:10px">支部成员 '+n+' 人 · 团员 '+tu+' 人 · 群众 '+(n-tu)+' 人</div></div>';
return h;}
function MONTHCARD(){
var now=new Date(),mn=now.getMonth()+1,yr=now.getFullYear(),key=yr+'-'+mn;
var prev=new Date(yr,mn-2,1),pkey=prev.getFullYear()+'-'+(prev.getMonth()+1),pmn=prev.getMonth()+1;
D.dashDone=D.dashDone||{};
var done=D.dashDone[key]||{},pDone=D.dashDone[pkey]||{};
var items=RULES.MONTHLY_RHYTHM[mn]||[],leftover=(RULES.MONTHLY_RHYTHM[pmn]||[]).filter(function(x){return !pDone[x];});
var h='<div class=card><div class=card-title>'+mn+'月该忙的事</div><ul class=task-list>';
items.forEach(function(x,i){var is=!!done[x];
h+='<li class="task-item'+(is?' done':'')+'"><button class=task-chk onclick="DD(\''+key+'\','+i+')" title="点击标记完成">✓</button><span class=task-t>'+E(x)+'</span><span class="task-tag '+(is?'ok':'pending')+'">'+(is?'已完成':'进行中')+'</span></li>';});
if(leftover.length){
h+='<li style="padding:8px 2px 2px;font-size:11px;color:var(--text3)">上月遗留（'+pmn+'月）</li>';
leftover.forEach(function(x,i){var is=!!pDone[x];
h+='<li class="task-item'+(is?' done':'')+'"><button class=task-chk onclick="DD(\''+pkey+'\','+RULES.MONTHLY_RHYTHM[pmn].indexOf(x)+')" title="点击标记完成">✓</button><span class=task-t>'+E(x)+'</span><span class="task-tag gap">逾期</span></li>';});}
h+='</ul><div style="display:flex;align-items:center;justify-content:space-between;padding-top:6px;font-size:11px;color:var(--text3)"><span>按年度团务节奏自动生成，随月份变化；点勾标记完成</span><span style="cursor:pointer;color:var(--primary)" onclick="N(\'health\')">数据健康度 →</span></div></div>';
return h;}
function DD(key,idx){
var parts=String(key).split('-');var items=RULES.MONTHLY_RHYTHM[Number(parts[1])]||[];
var k=items[idx];if(!k)return;
D.dashDone=D.dashDone||{};D.dashDone[key]=D.dashDone[key]||{};
D.dashDone[key][k]=!D.dashDone[key][k];Z();N('dash');}
function MAMBOCARD(){
var st=MAMBO_STATE();
var hint={online:'桌面环境已连接，可直接提问',busy:'norm正在忙，稍后再试',offline:'浏览器预览模式，打开桌面版可对话'}[st]||'';
return '<div class=card><div class=card-title>norm</div><div class=mambo-card onclick="N(\'ai\')"><span class="mambo-dot '+st+'"></span><div class=mambo-txt><b>问norm</b><p>'+hint+' · 查统计、写通知、找问题、出材料</p></div><span class=mambo-go>去对话 →</span></div></div>';}
function MAMBO_STATE(){
try{return API.hasBridge()?'online':'offline';}catch(e){return 'offline';}}
function TUIYOU_SUMMARY(members){
var noBirth=members.filter(function(m){return !m.birthMonth;}).length;
var shortY=members.filter(function(m){var r=RULES.checkTuiyouMember(m);return r.pass===false&&(r.problems||[]).some(function(p){return String(p).indexOf("团龄")>=0;});}).length;
var ready=members.filter(function(m){return RULES.checkTuiyouMember(m).pass;}).length;
return {noBirth:noBirth,shortY:shortY,ready:ready};}
function RHE(){
var ms=D.members.filter(function(m){return m.memberType==="团员";});
var tsum=TUIYOU_SUMMARY(ms);
var vh=0;D.volunteers.forEach(function(v){vh+=Number(v.hours)||0;});
var vt=D.settings.volunteerTarget||20;
var todo=D.todos.filter(function(t){return !t.done;}).length;
var evs=(D.evaluations||[]).length;
var mt=(D.meetings||[]).length;
var tcap=Math.max(1,Math.floor(ms.length*0.2));
var map={ok:"ok",pending:"pending",gap:"gap"};
var items=[
{name:"团员台账补录",desc:ms.length+" 名团员，"+(tsum.noBirth?"还有 <b style=color:var(--primary)>"+tsum.noBirth+"</b> 人缺出生年月":"出生年月已全部补录"),st:tsum.noBirth>0?"gap":"ok",act:tsum.noBirth>0?"去补录":"已齐",pct:ms.length?Math.round((ms.length-tsum.noBirth)/ms.length*100):100,pg:"members"},
{name:"推优条件就绪",desc:"就绪 <b>"+tsum.ready+"</b> 人 / 名额 "+tcap+" 人"+(tsum.shortY?"，<b style=color:var(--primary)>"+tsum.shortY+"</b> 人团龄不足":""),st:tsum.ready>=tcap?"ok":(tsum.noBirth+tsum.shortY>0?"gap":"pending"),act:"去核查",pct:Math.min(100,Math.round(tsum.ready/tcap*100)),pg:"tuitui"},
{name:"劳动实践达标",desc:vh+" / "+vt+"h"+(vh>=vt?"，已达标":"，还差 <b style=color:var(--primary)>"+(vt-vh)+"h</b>"),st:vh>=vt?"ok":"gap",act:vh>=vt?"已达标":"去记录",pct:vt?Math.min(100,Math.round(vh/vt*100)):0,pg:"volunteer"},
{name:"待办清零",desc:todo===0?"暂无未完成待办":todo+" 条待办未完成",st:todo===0?"ok":"pending",act:todo===0?"查看":"去处理",pct:todo===0?100:Math.min(100,Math.max(20,todo*15)),pg:"todos"},
{name:"教育评议",desc:evs===0?"本学年尚未发起教育评议":"已记录 "+evs+" 轮评议",st:evs>0?"ok":"gap",act:evs>0?"查看":"去发起",pct:evs>0?100:0,pg:"meetings"},
{name:"会议记录",desc:mt+" 条会议记录在案",st:mt>0?"ok":"pending",act:"查看",pct:mt>0?100:30,pg:"meetings"}
];
var gCnt=items.filter(function(x){return x.st==="gap";}).length;
var pCnt=items.filter(function(x){return x.st==="pending";}).length;
var h='<div style="font-size:13px;color:var(--text2);margin-bottom:10px">全站数据体检 · 空着的数据不会自己填上，这里告诉你该动哪一步</div>';
h+='<div style="display:flex;align-items:center;gap:18px;padding:12px 16px;border:1px solid var(--line);border-radius:var(--r);background:var(--card);margin-bottom:14px"><div style="display:flex;align-items:center;gap:8px"><span style="width:9px;height:9px;border-radius:50%;background:var(--gap)"></span><b style="font-size:20px;color:var(--gap);font-variant-numeric:tabular-nums">'+gCnt+'</b><span style="font-size:12px;color:var(--text2)">项欠</span></div><div style="width:1px;height:24px;background:var(--line)"></div><div style="display:flex;align-items:center;gap:8px"><span style="width:9px;height:9px;border-radius:50%;background:var(--pending)"></span><b style="font-size:20px;color:var(--pending);font-variant-numeric:tabular-nums">'+pCnt+'</b><span style="font-size:12px;color:var(--text2)">项待办</span></div><div style="width:1px;height:24px;background:var(--line)"></div><div style="display:flex;align-items:center;gap:8px"><span style="width:9px;height:9px;border-radius:50%;background:var(--ok)"></span><b style="font-size:20px;color:var(--ok);font-variant-numeric:tabular-nums">'+(6-gCnt-pCnt)+'</b><span style="font-size:12px;color:var(--text2)">项达标</span></div></div>';
items.sort(function(a,b){var w={gap:0,pending:1,ok:2};return w[a.st]-w[b.st];});
h+='<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:14px;margin-bottom:16px">';
items.forEach(function(it){
var softBg=it.st==="gap"?"var(--primary-soft)":"var(--gold-soft)";
var stTxt=it.st==="gap"?"欠":(it.st==="pending"?"待":"达标");
h+='<div class=card style="padding:16px;margin-bottom:0;border-left:3px solid var(--'+map[it.st]+')"><div style="display:flex;align-items:center;gap:8px;margin-bottom:8px"><span class="health-dot" style="width:9px;height:9px;border-radius:50%;background:var(--'+map[it.st]+');flex-shrink:0;display:inline-block"></span><b style="font-size:13px">'+it.name+'</b><span class="tag" style="margin-left:auto;background:'+softBg+';color:var(--'+map[it.st]+')">'+stTxt+'</span></div><div style="font-size:12px;color:'+(it.st==="gap"?"var(--text)":"var(--text3)")+';line-height:1.6;margin-bottom:10px">'+it.desc+'</div><div style="height:6px;border-radius:999px;background:var(--primary-soft);overflow:hidden;margin-bottom:10px"><i style="display:block;height:100%;width:'+it.pct+'%;background:var(--'+map[it.st]+');border-radius:999px;transition:width .5s"></i></div><button class="btn btn-sm" style="padding:4px 14px" onclick="N(\''+it.pg+'\')">'+it.act+'</button></div>';});
h+='</div>';
var gaps=[];
if(tsum.noBirth)gaps.push({t:"缺出生年月（"+tsum.noBirth+" 人）",list:ms.filter(function(m){return !m.birthMonth;}).map(function(m){return m.name;})});
if(tsum.shortY)gaps.push({t:"团龄不足 1 年（"+tsum.shortY+" 人）",list:ms.filter(function(m){var r=RULES.checkTuiyouMember(m);return r.pass===false&&(r.problems||[]).some(function(p){return String(p).indexOf("团龄")>=0;});}).map(function(m){return m.name;})});
h+='<div class=card><div class=card-title>待处理清单</div>';
if(gaps.length===0){h+='<div style="font-size:13px;color:var(--text2);padding:6px 0">没有待处理的数据缺口，这台机器跑得很健康。</div>';}
else{
gaps.forEach(function(g){h+='<div style="margin-bottom:8px"><div style="font-size:12px;color:var(--text2);margin-bottom:4px">'+g.t+'</div><div style="display:flex;flex-wrap:wrap;gap:6px">';g.list.forEach(function(nm){h+='<button class="btn btn-xs" style="background:var(--primary-soft);color:var(--primary);border-color:rgba(166,58,43,.35)" onclick="N(\'members\')">'+E(nm)+'</button>';});h+='</div></div>';});
h+='<div style="margin-top:10px;font-size:11px;color:var(--text3)">点击姓名可前往台账补录 · 出生年月录完，推优年龄自动判定</div>';}
h+='</div>';
return h;}
var PAGES={dash:"总览",members:"团员台账",meetings:"三会两制一课",tuitui:"推优",classfund:"班费考勤",attendance:"考勤",classact:"活动记录",activities:"通知公告",volunteer:"实践",awards:"荣誉实践",honors:"荣誉墙",groups:"群情报",todos:"待办",personal:"个人",ai:"norm"};
function GS(kw){
  var box=document.querySelector("#gsBox");if(!box)return;
  kw=(kw||"").trim().toLowerCase();
  if(!kw){box.style.display="none";return;}
  var R=[];
  function push(page,label,text){if((label&&String(label).toLowerCase().includes(kw))||(text&&String(text).toLowerCase().includes(kw)))R.push([page,label||text]);}
  D.members.forEach(function(m){push("members",m.name,[m.studentId,m.dorm,m.role,m.note].join(" "));});
  D.meetings.forEach(function(m){push("meetings",m.title||"",(m.type||"")+" "+(m.note||"")+" "+(m.date||""));});
  (D.todos||[]).forEach(function(t){push("todos",t.text||"",t.date||"");});
  (D.honors||[]).forEach(function(x){push("honors",x.title||"",(x.level||"")+" "+(x.note||"")+" "+(x.date||""));});
  (D.awards||[]).forEach(function(x){push("awards",x.type||"",(x.names||[]).join(" ")+" "+(x.date||""));});
  GRP_DATA.forEach(function(g){push("groups",g.name,g.use+" "+g.msgs);});
  (D.activities||[]).forEach(function(x){push("activities",x.title||x.name||"",(x.note||"")+" "+(x.date||""));});
  (D.classActs||[]).forEach(function(x){push("classact",x.name||"",(x.note||"")+" "+(x.date||""));});
  (D.volunteers||[]).forEach(function(x){push("volunteer",x.name||"",(x.level||"")+" "+(x.note||"")+" "+(x.date||""));});
  R=R.slice(0,14);
  /* 二.4 统一空状态：线描插画 + 引导文案（2026-08-07 sunna） */
  if(!R.length){box.innerHTML='<div style="padding:26px 20px;text-align:center">'+'<svg width="52" height="52" viewBox="0 0 52 52" fill="none" style="opacity:.45;margin-bottom:10px"><circle cx="22" cy="22" r="13" stroke="var(--text3)" stroke-width="1.6"/><line x1="32" y1="32" x2="42" y2="42" stroke="var(--text3)" stroke-width="1.6" stroke-linecap="round"/></svg>'+'<div style="font-size:13px;color:var(--text2);margin-bottom:4px">没有找到「'+E(kw)+'」</div>'+'<div style="font-size:11px;color:var(--text3);line-height:1.7">换个关键词试试 · 姓名 / 会议主题 / 群名都行</div>'+'</div>';box.style.display="block";return;}
  /* 二.3 匹配词高亮：先转义再标亮，不破 HTML（阶段 B 前保持 E() 安全） */
  function hl(s){s=E(s);var i=s.toLowerCase().indexOf(kw);if(i<0)return s;return s.slice(0,i)+'<mark style="background:var(--primary-soft);color:var(--primary);border-radius:2px;padding:0 1px">'+s.slice(i,i+kw.length)+'</mark>'+s.slice(i+kw.length);}
  /* 二.3 结果按页面分组：组标题 + 组内条目（原 54px 标签列改成分组标题，一页一次） */
  var groups={},order=[];
  R.forEach(function(r){var t=PAGES[r[0]]||r[0];if(!groups[t]){groups[t]=[];order.push(t);}groups[t].push(r);});
  var h='';
  order.forEach(function(t){
    h+='<div style="padding:8px 14px 3px;font-size:10px;color:var(--text3);letter-spacing:2px;background:var(--primary-soft)">'+E(t)+'</div>';
    groups[t].forEach(function(r){
      h+='<div style="padding:9px 14px;cursor:pointer;display:flex;gap:10px;align-items:baseline" onmousedown="GSGO(\''+r[0]+'\')" onmouseover="this.style.background=\'var(--surface-hover)\'" onmouseout="this.style.background=\'\'"><span style="font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:290px">'+hl(r[1])+'</span></div>';
    });
  });
  box.innerHTML=h;
  box.style.display="block";}
function GSGO(p){var b=document.querySelector("#gsBox");if(b)b.style.display="none";var i=document.querySelector("#gsInput");if(i)i.value="";N(p);}
function RT(){
var ts=D.todos.slice().sort(function(a,b){return a.done-b.done;});
var h='<button class="btn btn-primary btn-sm" onclick="AT()">+ 添加</button><div style=margin-top:12px>';
ts.forEach(function(t){h+='<div class=card style=padding:12px;display:flex;align-items:center;gap:8px><input type=checkbox'+(t.done?' checked':'')+' onchange="var x=D.todos.find(function(i){return i.id===\''+t.id+'\';});if(x){x.done=this.checked;Z();N(\'todos\');}"><span style=flex:1;'+(t.done?'text-decoration:line-through;color:var(--text3)':'')+'>'+E(t.text)+'</span><span style=font-size:11px;color:var(--text3)>'+E(t.date||'')+'</span><span title="删除" style="cursor:pointer;color:var(--text3);font-size:11px" onclick="TDD(\''+t.id+'\')">✕</span></div>';});
if(ts.length===0)h+='<div class=empty>今日无待办<br><div style="font-size:12px;color:var(--text3);margin-top:6px">有会议/通知要跟进？一键转成待办</div><div style=margin-top:12px;display:flex;gap:8px;justify-content:center><button class="btn btn-primary btn-sm" onclick="AT()">+ 添加</button><button class="btn btn-sm" onclick="ATFROM(\'meeting\')">会议转待办</button><button class="btn btn-sm" onclick="ATFROM(\'notice\')">通知转待办</button></div></div>';
h+='</div>';return h;}
function AT(){var i='<input id=tt style="width:100%;padding:8px;border:1px solid var(--line);border-radius:6px;margin-bottom:10px" placeholder="待办内容…"><input type=date id=td value="'+T()+'" style="width:100%;padding:8px;border:1px solid var(--line);border-radius:6px;margin-bottom:10px"><button class="btn btn-primary" onclick="ST()">保存</button>';var m=document.querySelector("#_modal");if(!m){m=document.createElement("div");m.id="_modal";m.style="position:fixed;inset:0;background:rgba(0,0,0,.35);z-index:999;display:flex;align-items:center;justify-content:center";m.onclick=function(e){if(e.target===this)this.remove();};document.body.appendChild(m);}m.innerHTML='<div style="background:var(--card);border-radius:18px;padding:26px;width:400px;box-shadow:0 8px 40px rgba(0,0,0,.12)" onclick="event.stopPropagation()"><div style="font-size:16px;font-weight:600;margin-bottom:14px">添加待办</div>'+i+'<button class=btn onclick="this.closest(\'#_modal\').remove()">取消</button></div>';m.style.display="flex";}
function ST(){var n=document.querySelector("#tt").value.trim();if(!n)return Q("请填写内容");D.todos.push({id:I(),text:n,date:document.querySelector("#td").value,done:false});Z();U();N("dash");var m=document.querySelector("#_modal");if(m)m.remove();Q("已添加");}
function TDD(id){D.todos=D.todos||[];var i=D.todos.findIndex(function(x){return x.id===id;});if(i>=0){D.todos.splice(i,1);Z();N("dash");Q("已删除");}}
function ATFROM(kind){
/* P1⑤ 空态引导：从最近会议/通知一键转待办（toukai 19:48 修正，2026-08-06 sunna） */
var src=(kind==="meeting")?(D.meetings||[]):(D.activities||[]);
var last=src.length?src[src.length-1]:null;
if(!last){Q(kind==="meeting"?"还没有会议记录":"还没有通知","info");return;}
var txt=(kind==="meeting"?"跟进会议：":"跟进通知：")+(last.title||last.name||"待办事项");
D.todos=D.todos||[];D.todos.push({id:I(),text:txt,date:T(),done:false});Z();U();N("todos");Q("已转成待办");}
function RP(){
var h='<div class=card><div class=card-title>个人信息 <span style="font-weight:400;font-size:11px;color:var(--text3)">可编辑，随备份导出</span><button class="btn btn-sm" style="float:right" onclick="PROFEDIT()">编辑</button></div><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:0 30px">';
var pf=D.settings.profile||{};
var info=[["姓名",pf.name||"—"],["职务",pf.role||"—"],["班级",pf.className||"—"],["搭档",pf.partner||"—"],["宿舍",pf.dorm||"—"],["学号",pf.studentId||"—"]];
info.forEach(function(x){h+='<div style="display:flex;gap:12px;padding:9px 0;border-bottom:1px solid var(--line)"><span style="color:var(--text2);min-width:46px;font-size:13px">'+x[0]+'</span><span style="font-weight:500;font-size:14px">'+E(x[1])+'</span></div>';});
h+='</div></div>';
h+='<div class=card><div class=card-title>外观与数据</div><div style="margin-bottom:14px"><div style="font-size:12px;color:var(--text2);margin-bottom:6px">总览图谱默认视图</div><div style="display:flex;gap:8px"><button class="btn btn-sm'+(localStorage.getItem("tzs_gv")==="b"?'':' btn-primary')+'" onclick="GSETGV(\'a\')">模块地图</button><button class="btn btn-sm'+(localStorage.getItem("tzs_gv")==="b"?' btn-primary':'')+'" onclick="GSETGV(\'b\')">成员网络</button></div><div style="font-size:11px;color:var(--text3);margin-top:6px">两个视图都保留，这里选打开总览时先看到哪个</div></div><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px"><button class=btn style="justify-content:center;padding:16px 8px" onclick="C()">换主题</button><button class=btn style="justify-content:center;padding:16px 8px" onclick="exportData()">备份数据</button><button class=btn style="justify-content:center;padding:16px 8px" onclick="importData()">恢复备份</button></div><div style=font-size:11px;color:var(--text3);margin-top:10px>备份为 JSON 文件，可随时恢复；数据每天自动快照到 .backup</div></div>';
h+='<div class=card><div class=card-title>联动工具</div><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px"><button class="btn btn-primary" style="justify-content:center;padding:16px 8px" onclick="GENR()">生成述职报告</button><button class=btn style="justify-content:center;padding:16px 8px" onclick="EXPM()">导出材料</button><button class=btn style="justify-content:center;padding:16px 8px" onclick="BARC()">一键归档</button></div><div style=font-size:11px;color:var(--text3);margin-top:10px>述职与归档需桌面应用环境（pywebview 桥），浏览器预览模式不可用</div></div>';
return h;}
function PROFEDIT(){
var pf=D.settings.profile||{};
var m=document.querySelector("#_modal");if(!m){m=document.createElement("div");m.id="_modal";m.style="position:fixed;inset:0;background:rgba(0,0,0,.35);z-index:999;display:flex;align-items:center;justify-content:center";m.onclick=function(e){if(e.target===this)this.remove();};document.body.appendChild(m);}
m.innerHTML='<div style="background:var(--card);border-radius:18px;padding:26px;width:420px;max-height:82vh;overflow-y:auto;box-shadow:0 8px 40px rgba(0,0,0,.12)" onclick="event.stopPropagation()"><div style="font-size:16px;font-weight:600;margin-bottom:14px">编辑个人信息</div><div style="font-size:12px;color:var(--text3);margin-bottom:8px">姓名</div><input id="pfName" value="'+E(pf.name||"")+'" style="width:100%;padding:8px;border:1px solid var(--line);border-radius:8px;margin-bottom:10px;font-size:13px;background:var(--card)"><div style="font-size:12px;color:var(--text3);margin-bottom:8px">职务</div><input id="pfRole" value="'+E(pf.role||"")+'" style="width:100%;padding:8px;border:1px solid var(--line);border-radius:8px;margin-bottom:10px;font-size:13px;background:var(--card)"><div style="font-size:12px;color:var(--text3);margin-bottom:8px">班级</div><input id="pfClass" value="'+E(pf.className||"")+'" style="width:100%;padding:8px;border:1px solid var(--line);border-radius:8px;margin-bottom:10px;font-size:13px;background:var(--card)"><div style="font-size:12px;color:var(--text3);margin-bottom:8px">学号</div><input id="pfSid" value="'+E(pf.studentId||"")+'" style="width:100%;padding:8px;border:1px solid var(--line);border-radius:8px;margin-bottom:10px;font-size:13px;background:var(--card)"><div style="font-size:12px;color:var(--text3);margin-bottom:8px">搭档</div><input id="pfPartner" value="'+E(pf.partner||"")+'" style="width:100%;padding:8px;border:1px solid var(--line);border-radius:8px;margin-bottom:10px;font-size:13px;background:var(--card)"><div style="font-size:12px;color:var(--text3);margin-bottom:8px">宿舍</div><input id="pfDorm" value="'+E(pf.dorm||"")+'" style="width:100%;padding:8px;border:1px solid var(--line);border-radius:8px;margin-bottom:12px;font-size:13px;background:var(--card)"><div style="display:flex;gap:10px;justify-content:flex-end"><button class="btn" onclick="this.closest(\'[style*=fixed]\').remove()">取消</button><button class="btn btn-primary" onclick="PROFSAVE()">保存</button></div></div>';m.style.display="flex";}
function PROFSAVE(){
var pf=D.settings.profile=D.settings.profile||{};
pf.name=(document.querySelector("#pfName").value||"").trim();pf.role=(document.querySelector("#pfRole").value||"").trim();pf.className=(document.querySelector("#pfClass").value||"").trim();pf.studentId=(document.querySelector("#pfSid").value||"").trim();pf.partner=(document.querySelector("#pfPartner").value||"").trim();pf.dorm=(document.querySelector("#pfDorm").value||"").trim();
Z();N("members");Q("个人信息已保存");var m=document.querySelector("#_modal");if(m)m.remove();}
function GENR(){
if(!API.hasBridge()){Q("浏览器预览模式：述职报告生成需桌面应用环境","info");return;}
Q("正在生成述职报告…","info");
API.generateReport(JSON.stringify(D)).then(function(r){
if(!r||!r.ok)throw new Error((r&&r.error)||"生成失败");
var blob=new Blob([r.report],{type:"text/markdown"});var a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="团支书述职报告.md";document.body.appendChild(a);a.click();setTimeout(function(){document.body.removeChild(a);},100);
Q("述职报告已生成并下载");
}).catch(function(e){Q("生成失败："+(e.message||""),"err");});
}
function BARC(){
if(!API.hasBridge()){Q("浏览器预览模式：一键归档需桌面应用环境","info");return;}
Q("正在归档…","info");
API.batchArchive(JSON.stringify(D)).then(function(r){
if(!r||!r.ok)throw new Error((r&&r.error)||"归档失败");
var s=r.summary||{};var parts=[];Object.keys(s).forEach(function(k){parts.push(k+" +"+s[k].added+"/跳过"+s[k].skipped);});
Q("归档完成：新增 "+r.added+" 份"+(parts.length?"（"+parts.join("，")+"）":""));
}).catch(function(e){Q("归档失败："+(e.message||""),"err");});
}
function EXPM(){
var md='# 团支书工作台材料导出\n\n> 生成时间：'+new Date().toLocaleString('zh-CN')+'\n\n';
var tu=D.members.filter(function(m){return m.memberType==='团员';});
md+='## 一、团员台账（'+tu.length+'人）\n\n| 姓名 | 学号 | 职务 | 入团时间 | 状态 |\n|------|------|------|----------|------|\n';
tu.forEach(function(m){md+='| '+m.name+' | '+(m.studentId||'—')+' | '+(m.role||'—')+' | '+(m.joinDate||'—')+' | '+(m.status||'正常')+' |\n';});
md+='\n## 二、会议记录（'+(D.meetings||[]).length+'条）\n\n| 日期 | 类型 | 标题 | 备注 |\n|------|------|------|------|\n';
(D.meetings||[]).slice().reverse().forEach(function(x){md+='| '+x.date+' | '+x.type+' | '+x.title+' | '+(x.note||'')+' |\n';});
var evs=D.evaluations||[];
if(evs.length){md+='\n## 三、教育评议\n\n';evs.forEach(function(ev){md+='- **'+ev.round+'**：参评 '+ev.grades.length+' 人，优秀 '+ev.grades.filter(function(g){return g.grade==='优秀';}).length+' 人\n';});}
var ty=D.tuiyouBatches||[];
if(ty.length){md+='\n## 四、推优记录\n\n';ty.forEach(function(b){md+='- '+b.date+'：'+b.ids.length+' 人\n';});}
var vs=D.volunteers||[];
if(vs.length){md+='\n## 五、志愿时长\n\n| 日期 | 成员 | 级别 | 时长 | 说明 |\n|------|------|------|------|------|\n';vs.forEach(function(v){md+='| '+v.date+' | '+v.name+' | '+v.level+' | '+v.hours+'h | '+(v.note||'')+' |\n';});}
var aw=D.awards||[];
if(aw.length){md+='\n## 六、评优记录\n\n| 日期 | 类型 | 候选人 |\n|------|------|--------|\n';aw.forEach(function(x){md+='| '+x.date+' | '+x.type+' | '+(x.names||[]).join('、')+' |\n';});}
var cf=D.classFund||[];
if(cf.length){md+='\n## 七、班费收支\n\n| 日期 | 收支 | 金额 | 用途 | 经手人 |\n|------|------|------|------|--------|\n';cf.forEach(function(x){md+='| '+x.date+' | '+x.type+' | '+(x.amount>0?x.amount:'')+' | '+(x.desc||'')+' | '+(x.by||'')+' |\n';});}
var hs=D.honors||[];
if(hs.length){md+='\n## 八、荣誉墙\n\n| 日期 | 分类 | 荣誉 | 等级 | 获奖者/集体 | 备注 |\n|------|------|------|------|------------|------|\n';hs.forEach(function(x){md+='| '+x.date+' | '+x.scope+' | '+x.title+' | '+x.level+' | '+(x.holder||'')+' | '+(x.note||'')+' |\n';});}
md+='\n> 数据来源：团支书工作台本地数据\n';
var blob=new Blob([md],{type:'text/markdown;charset=utf-8'});
var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='工作台材料_'+T()+'.md';
document.body.appendChild(a);a.click();setTimeout(function(){document.body.removeChild(a);},100);
Q('材料已导出（Markdown）');
}
function RG(){
var h='<div class=card style="text-align:center;padding:44px 28px"><div style="font-family:var(--font-serif);font-size:20px;letter-spacing:1px;margin-bottom:10px">智慧团建 · 团中央系统</div><div style="font-size:13px;color:var(--text2);margin-bottom:8px;max-width:520px;margin-left:auto;margin-right:auto">为什么不能在工作台里直接嵌官网：智慧团建网站的安全规则加浏览器隔离机制，嵌在窗口内的登录状态无法保持（登录后瞬间回到未登录）。</div><div style="font-size:13px;color:var(--text2);margin-bottom:26px;max-width:520px;margin-left:auto;margin-right:auto">正确用法：点「主窗口打开」——工作台窗口直接变成智慧团建官网，登录状态能真正保持；用完关闭窗口，重新打开就是工作台。</div><div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap"><button class="btn btn-primary" style="min-width:170px" onclick="SMZ()">主窗口打开（推荐）</button><button class="btn" style="min-width:130px" onclick="SMO()">独立窗口</button><button class="btn" style="min-width:130px" onclick="SMW()">浏览器</button></div></div>';
return h;}
function SMZ(){if(!API.hasBridge()){Q("桌面版可用主窗口打开","info");return;}API.navZhtj().then(function(r){if(r&&r.ok)Q("已切换到智慧团建，登录状态可保持");else Q((r&&r.error)||"切换失败","err");}).catch(function(e){Q(e.message||"切换失败","err");});}
function SMO(){if(!API.hasBridge()){Q("桌面版可打开独立窗口","info");return;}API.openSmartWindow("https://zhtj.youth.cn/zhtj/signin").then(function(r){if(r&&r.ok)Q("已在独立窗口打开，登录一次以后都保持");else Q((r&&r.error)||"打开失败","err");}).catch(function(e){Q(e.message||"打开失败","err");});}
function SMW(){if(API.hasBridge()){API.call("open_browser",["https://zhtj.youth.cn/zhtj/signin"]).then(function(r){if(r&&r.ok)Q("已在系统浏览器打开");else Q((r&&r.error)||"打开失败","err");}).catch(function(e){Q(e.message||"打开失败","err");});}else{window.open("https://zhtj.youth.cn/zhtj/signin","_blank");}}
function NAVT(el){
var g=el.getAttribute("data-group");if(!g)return;
var fold=JSON.parse(localStorage.getItem("tzs_navfold")||"[]");
var i=fold.indexOf(g);
if(i>=0){fold.splice(i,1);el.classList.remove("folded");}else{fold.push(g);el.classList.add("folded");}
localStorage.setItem("tzs_navfold",JSON.stringify(fold));
var n=el.nextElementSibling;
while(n&&!n.classList.contains("nav-group-title")){n.style.display=(fold.indexOf(g)>=0)?"none":"";n=n.nextElementSibling;}}
function NAVR(){
var fold=JSON.parse(localStorage.getItem("tzs_navfold")||"[]");
if(fold.length===0){fold=["gongju"];localStorage.setItem("tzs_navfold",JSON.stringify(fold));}
document.querySelectorAll(".nav-group-title").forEach(function(el){
var g=el.getAttribute("data-group");
if(g&&fold.indexOf(g)>=0){el.classList.add("folded");var n=el.nextElementSibling;while(n&&!n.classList.contains("nav-group-title")){n.style.display="none";n=n.nextElementSibling;}}});}
function TM(ev){if(ev)ev.stopPropagation();var b=document.getElementById("moreBox");if(!b)return;b.style.display=b.style.display==="none"?"block":"none";}

/* ---- TZS 注册表(阶段A:全局名保留,仅登记) ---- */
window.TZS = window.TZS || {};
window.TZS.modules_dashboard = {
  RD,
  CURRENTCARD,
  ACTCARD,
  GRAPH_CARD,
  INSIGHT,
  RING,
  VOLQ,
  VOLS,
  ARCHCARD,
  MONTHCARD,
  DD,
  MAMBOCARD,
  MAMBO_STATE,
  TUIYOU_SUMMARY,
  RHE,
  GS,
  GSGO,
  RT,
  AT,
  ST,
  TDD,
  ATFROM,
  RP,
  PROFEDIT,
  PROFSAVE,
  GENR,
  BARC,
  EXPM,
  RG,
  SMZ,
  SMO,
  SMW,
  NAVT,
  NAVR,
  TM,
};
