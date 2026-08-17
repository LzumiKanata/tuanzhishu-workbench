function RF(){var list=D.classFund||[];var inc=0,exp=0;list.forEach(function(x){if(x.type==="in")inc+=Number(x.amount)||0;else exp+=Number(x.amount)||0;});var bal=inc-exp;
var h='<div class=card><div class=card-title>班费管理</div>';
h+='<div style="display:flex;gap:12px;margin-bottom:14px"><div style="flex:1;background:var(--primary-soft);border-radius:10px;padding:12px 14px"><div style="font-size:11px;color:var(--text2);margin-bottom:2px">当前余额</div><div style="font-size:22px;font-weight:600;color:var(--primary)">¥'+bal.toFixed(2)+'</div></div><div style="flex:1;background:var(--card);border:1px solid var(--line);border-radius:10px;padding:12px 14px"><div style="font-size:11px;color:var(--text2);margin-bottom:2px">总收入</div><div style="font-size:16px;font-weight:500;color:var(--success)">¥'+inc.toFixed(2)+'</div></div><div style="flex:1;background:var(--card);border:1px solid var(--line);border-radius:10px;padding:12px 14px"><div style="font-size:11px;color:var(--text2);margin-bottom:2px">总支出</div><div style="font-size:16px;font-weight:500;color:var(--error)">¥'+exp.toFixed(2)+'</div></div></div>';
if(list.length===0){h+=EMP("coin","还没有收支记录",'<button class="btn btn-primary" onclick="JZ()">记一笔</button>');}
else{
/* 第二批可视化②：月度收支双柱（hermes 口径：按 YYYY-MM 分组 in/out Σamount，2026-08-06 sunna） */
var mf={};
list.forEach(function(x){var k=String(x.date||"").slice(0,7);if(!k)return;mf[k]=mf[k]||{in:0,out:0};if(x.type==="in")mf[k].in+=Number(x.amount)||0;else mf[k].out+=Number(x.amount)||0;});
var keys=Object.keys(mf).sort();
if(keys.length){
var W=560,H=140,bw=18,max=1;keys.forEach(function(k){max=Math.max(max,mf[k].in,mf[k].out);});
var step=keys.length>1?(W-70)/(keys.length-1):(W-70);
var s='<svg viewBox="0 0 '+W+' '+(H+20)+'" style="width:100%;height:auto">';
s+='<line x1="34" y1="'+(H-16)+'" x2="'+(W-14)+'" y2="'+(H-16)+'" stroke="var(--line)"/>';
keys.forEach(function(k,i){
var cx=48+i*step;
var hin=Math.max(2,Math.round((H-38)*mf[k].in/max)),hout=Math.max(2,Math.round((H-38)*mf[k].out/max));
s+='<rect x="'+(cx-bw-2)+'" y="'+(H-16-hin)+'" width="'+bw+'" height="'+hin+'" rx="3" fill="var(--ok)"/>';
s+='<rect x="'+(cx+2)+'" y="'+(H-16-hout)+'" width="'+bw+'" height="'+hout+'" rx="3" fill="var(--gap)"/>';
s+='<text x="'+cx+'" y="'+(H+8)+'" text-anchor="middle" font-size="10" fill="var(--text3)">'+k.slice(5)+'月</text>';});
s+='</svg>';
h+='<div class=card style="margin-bottom:14px"><div class=card-title>月度收支 <span style="font-size:11px;color:var(--text3);font-weight:400">绿=收入 红=支出</span></div>'+s+'<div style="font-size:11px;color:var(--text3)">当前余额 ¥'+bal.toFixed(2)+(inc>0?' · 结余率 '+Math.round(bal/inc*100)+'%（=余额÷累计收入，toukai 19:33 累计口径）':'')+'</div></div>';
}
h+='<div style="border:1px solid var(--line);border-radius:10px;overflow:hidden"><table><thead><tr><th>日期</th><th>类型</th><th>用途</th><th>金额</th><th>经手</th><th></th></tr></thead><tbody>';
list.slice().reverse().forEach(function(x){h+='<tr><td style="font-size:12px;color:var(--text2)">'+E(x.date||"—")+'</td><td>'+(x.type==="in"?'<span class="tag" style="background:var(--gold-soft);color:var(--success)">收入</span>':'<span class="tag" style="background:rgba(154,59,42,.1);color:var(--error)">支出</span>')+'</td><td>'+E(x.desc||"")+'</td><td style="font-weight:600">'+(x.type==="in"?"+":"−")+Number(x.amount).toFixed(2)+'</td><td style="font-size:12px;color:var(--text2)">'+E(x.by||"—")+'</td><td style="text-align:right"><span style="cursor:pointer;color:var(--text3);font-size:11px" onclick="CONFIRM(function(){JZD(\''+x.id+'\')})">删除</span></td></tr>';});
h+='</tbody></table></div><div style="margin-top:12px;text-align:right"><button class="btn btn-primary" onclick="JZ()">记一笔</button></div>';}
h+='</div>';return h;}
function JZ(){var m=document.querySelector("#_modal");if(!m){m=document.createElement("div");m.id="_modal";m.style="position:fixed;inset:0;background:rgba(0,0,0,.35);z-index:999;display:flex;align-items:center;justify-content:center";m.onclick=function(e){if(e.target===this)this.remove();};document.body.appendChild(m);}
m.innerHTML='<div style="background:var(--card);border-radius:18px;padding:26px;width:420px;max-height:80vh;overflow-y:auto;box-shadow:0 8px 40px rgba(0,0,0,.12)" onclick="event.stopPropagation()"><div style="font-size:16px;font-weight:500;margin-bottom:14px">记一笔班费</div><div style="font-size:12px;color:var(--text3);margin-bottom:8px">类型</div><select id="jzType" style="width:100%;padding:8px;border:1px solid var(--line);border-radius:8px;margin-bottom:12px;font-size:13px;background:var(--card)"><option value="in">收入（收班费/入账）</option><option value="out">支出（花销）</option></select><div style="font-size:12px;color:var(--text3);margin-bottom:8px">金额（元）</div><input id="jzAmt" type="number" min="0" step="0.01" placeholder="0.00" style="width:100%;padding:8px;border:1px solid var(--line);border-radius:8px;margin-bottom:12px;font-size:13px;background:var(--card)"><div style="font-size:12px;color:var(--text3);margin-bottom:8px">用途 / 说明</div><input id="jzDesc" placeholder="如：收班费 20 元/人" style="width:100%;padding:8px;border:1px solid var(--line);border-radius:8px;margin-bottom:12px;font-size:13px;background:var(--card)"><div style="font-size:12px;color:var(--text3);margin-bottom:8px">经手人（可空）</div><input id="jzBy" placeholder="谁经手的" style="width:100%;padding:8px;border:1px solid var(--line);border-radius:8px;margin-bottom:12px;font-size:13px;background:var(--card)"><div style="display:flex;gap:10px;justify-content:flex-end"><button class="btn" onclick="this.closest(\'[style*=fixed]\').remove()">取消</button><button class="btn btn-primary" onclick="JZS()">保存</button></div></div>';}
function JZS(){var amt=parseFloat(document.querySelector("#jzAmt").value);if(isNaN(amt)||amt<=0){Q("金额要填大于 0 的数字","warn");return;}var type=document.querySelector("#jzType").value;var desc=(document.querySelector("#jzDesc").value||"").trim();if(!desc){Q("用途说明不能空","warn");return;}var by=(document.querySelector("#jzBy").value||"").trim();D.classFund=D.classFund||[];D.classFund.push({id:I(),type:type,amount:Math.round(amt*100)/100,desc:desc,by:by,date:T()});Z();N("classfund");Q("已记账");var m=document.querySelector("#_modal");if(m)m.remove();}
function JZD(id){D.classFund=D.classFund||[];var i=D.classFund.findIndex(function(x){return x.id===id;});if(i>=0){D.classFund.splice(i,1);Z();N("classfund");Q("已删除");}}

/* ---- TZS 注册表(阶段A:全局名保留,仅登记) ---- */
window.TZS = window.TZS || {};
window.TZS.modules_fund = {
  RF,
  JZ,
  JZS,
  JZD,
};
