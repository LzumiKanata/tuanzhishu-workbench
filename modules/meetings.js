function RMT(){
var evs=D.evaluations||[];
var h='<div class=card><div class=card-title>一 · 教育评议</div>';
h+='<div style="display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-bottom:12px"><span class="tag tag-q">三会 · 支部大会/委员会/团小组会</span><span class="tag tag-q">两制 · 教育评议/年度团籍注册</span><span class="tag tag-q">一课 · 团课</span><span class="tag" style="background:var(--gold-soft);color:var(--success)">优秀比例 ≤30% 硬校验</span></div>';
if(evs.length===0){
h+=EMP("seal","暂无评议记录",'<button class="btn btn-primary btn-sm" onclick="EVN()">发起一次教育评议</button>');
}else{
evs.forEach(function(ev){
var r=RULES.checkEvaluation(ev.grades);
h+='<div style="padding:12px 0;border-bottom:1px solid var(--line)"><div style=display:flex;justify-content:space-between;align-items:center><b>'+E(ev.round)+'</b><span style="display:flex;gap:10px;align-items:center"><span class="tag" style="'+(r.ok?'background:var(--gold-soft);color:var(--success)':'background:rgba(154,59,42,.08);color:var(--error)')+'">'+E(r.msg)+'</span><span style="cursor:pointer;color:var(--text3);font-size:11px" onclick="CONFIRM(function(){EVT(\''+ev.id+'\')})">删除</span></span></div><div style=font-size:11px;color:var(--text3);margin-top:4px>参评 '+ev.grades.length+' 人 · 优秀 '+r.excellent+' 人</div></div>';
});
h+='<button class="btn btn-primary btn-sm" style=margin-top:12px onclick="EVN()">再发起一次</button>';
}
h+='</div>';
var ms2=D.meetings||[];
h+='<div class=card><div class=card-title>二 · 会议记录</div>';
function HYSTAT(t){return ms2.filter(function(x){return x.type===t;}).length;}
var hyRows=[["支部大会",3],["支部委员会",5],["团小组会",3]];
h+='<div style="margin-bottom:10px"><div style="font-size:11px;color:var(--text2);margin-bottom:6px">年度组织生活（对照述职口径）</div>';
hyRows.forEach(function(o){var c0=HYSTAT(o[0]),g0=o[1],p0=g0>0?Math.min(100,Math.round(c0/g0*100)):0,ov=c0>g0;
h+='<div style="display:flex;align-items:center;gap:10px;padding:4px 0"><span style="font-size:12px;color:var(--text2);min-width:68px">'+o[0]+'</span><div style="flex:1;height:8px;border-radius:999px;background:var(--primary-soft);overflow:hidden"><i style="display:block;height:100%;width:'+p0+'%;border-radius:999px;background:'+(ov?'var(--ok)':'var(--primary)')+';transition:width .5s"></i></div><span style="font-size:11px;font-variant-numeric:tabular-nums;color:'+(ov?'var(--ok)':'var(--text2)')+'">'+c0+'/'+g0+(ov?' 超额':'')+'</span></div>';});
h+='<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px"><span class="tag tag-q">团课 '+HYSTAT("团课")+' 次</span><span class="tag tag-q">主题团日 '+HYSTAT("主题团日")+' 次</span></div></div>';
h+='<div id="hyDrop" style="border:1.5px dashed var(--line);border-radius:10px;padding:14px;text-align:center;font-size:12px;color:var(--text3);margin-bottom:12px" ondragover="event.preventDefault();HYOVER(this)" ondragleave="HYOUT(this)" ondrop="DROPDOC(event)">把 Word 会议记录（.docx）拖到这里，自动识别生成会议记录</div>';
if(ms2.length===0){h+=EMP("brush","还没有会议记录",'<button class="btn btn-primary" onclick="HYN()">新建会议</button>');}
else{
h+='<div style="font-size:11px;color:var(--text3);margin-bottom:8px">共 ' + ms2.length + ' 条记录 · 最新在前</div>';
h+='<div class="tbl-scroll" style="border:1px solid var(--line);border-radius:10px"><table><thead><tr><th>日期</th><th>类型</th><th>主题</th><th></th></tr></thead><tbody>';
ms2.slice().reverse().forEach(function(x){h+='<tr><td style="font-size:12px;color:var(--text2)">'+E(x.date||'')+'</td><td><span class="tag tag-p">'+E(x.type||'')+'</span></td><td style="font-size:13px">'+E(x.title||'')+(x.note?'<div style="font-size:11px;color:var(--text3)">'+E(x.note)+'</div>':'')+'</td><td style=text-align:right><span style="cursor:pointer;color:var(--text3);font-size:11px" onclick="CONFIRM(function(){HYD(\''+x.id+'\')})">删除</span></td></tr>';});
h+='</tbody></table></div><div style="margin-top:12px;text-align:right"><button class="btn btn-primary" onclick="HYN()">新建会议</button></div>';}
h+='</div>';
var regs=D.registry||[];
h+='<div class=card><div class=card-title>三 · 年度团籍注册</div>';
h+='<div style="font-size:12px;color:var(--text3);margin-bottom:10px">三态：正常注册 / 暂缓注册 / 不予注册。评议不合格→暂缓（暂缓期半年）；保留团籍的党员可不参加。注册后修订团员花名册报上级。</div>';
if(regs.length===0){h+=EMP("field","还没有注册记录",'<button class="btn btn-primary" onclick="RZN()">发起年度注册</button>');}
else{
regs.slice().reverse().forEach(function(rg){
var cn=rg.records.filter(function(x){return x.status==="正常";}).length;
var cz=rg.records.filter(function(x){return x.status==="暂缓";}).length;
var cw=rg.records.filter(function(x){return x.status==="不予";}).length;
h+='<div style="padding:10px 0;border-bottom:1px solid var(--line)"><div style=display:flex;justify-content:space-between;align-items:center><b>'+E(rg.year)+' 年度</b><span><span class="tag tag-q">正常 '+cn+'</span> <span class="tag tag-q">暂缓 '+cz+'</span> <span class="tag tag-q">不予 '+cw+'</span> <span style="cursor:pointer;color:var(--text3);font-size:11px;margin-left:8px" onclick="CONFIRM(function(){RZD(\''+rg.id+'\')})">删除</span></span></div><div style="font-size:11px;color:var(--text3);margin-top:4px">注册日期 '+E(rg.date||'')+' · 共 '+rg.records.length+' 人</div></div>';});
h+='<button class="btn btn-primary btn-sm" style=margin-top:12px onclick="RZN()">发起注册</button>';}
h+='</div>';
return h;}

/* ---- TZS 注册表(阶段A:全局名保留,仅登记) ---- */
window.TZS = window.TZS || {};
window.TZS.modules_meetings = {
  RMT,
};
