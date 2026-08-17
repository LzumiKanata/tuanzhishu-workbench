function GVT(v){window._gv=v;try{localStorage.setItem("tzs_gv",v);}catch(e){}var w=document.querySelector("#gwrap");if(w){w.innerHTML=GBODY();if(window._gv==="d"){setTimeout(function(){if(window.HKLOAD)HKLOAD();},30);}else if(window._gv!=="c"){GZOOM();GRAPH_SIM();}}}
function GSETGV(v){GVT(v);Q(v==="b"?"总览图谱默认改为成员网络":v==="d"?"总览图谱默认改为知识星图":"总览图谱默认改为模块地图");N("personal");}
function GBODY(){
if(!window._gv){try{window._gv=(localStorage.getItem("tzs_gv")==="b")?"b":"a";}catch(e){window._gv="a";}}
var a='<button class="btn btn-sm'+(window._gv==="b"?'':' btn-primary')+'" onclick="GVT(\'a\')">模块地图</button>';
var b='<button class="btn btn-sm'+(window._gv==="b"?' btn-primary':'')+'" onclick="GVT(\'b\')">成员网络</button>';
var c='<button class="btn btn-sm'+(window._gv==="c"?' btn-primary':'')+'" onclick="GVT(\'c\')">知识图谱</button>';var d='<button class="btn btn-sm'+(window._gv==="d"?' btn-primary':'')+'" onclick="GVT(\'d\')">知识星图</button>';
var f='';
if(window._gv==="b"){var g1=window._gf||"all";f='<div style="display:flex;gap:6px;align-items:center;margin-bottom:8px"><span style="font-size:11px;color:var(--text3)">只看</span>'+[["all","全部成员"],["has","有荣誉"],["none","暂无荣誉"]].map(function(o){return '<button class="btn btn-xs'+(g1===o[0]?' btn-primary':'')+'" onclick="GFSET(\''+o[0]+'\')">'+o[1]+'</button>';}).join("")+'</div>';var g2=window._gg||"all";f+='<div style="display:flex;gap:6px;align-items:center;margin-bottom:8px"><span style="font-size:11px;color:var(--text3)">分组</span>'+[["all","全部"],["cadre","干部"],["member","普通团员"]].map(function(o){return '<button class="btn btn-xs'+(g2===o[0]?' btn-primary':'')+'" onclick="GGFSET(\''+o[0]+'\')">'+o[1]+'</button>';}).join("")+'</div>';}
return '<div style="display:flex;gap:6px;margin-bottom:10px">'+a+b+c+d+'</div>'+f+(window._gv==="b"||window._gv==="c"?"":'<div style="display:flex;gap:8px;align-items:center;margin-bottom:8px"><span class="btn btn-xs" style="cursor:pointer" title="放大" onclick="GZC(1.2)">＋</span><span class="btn btn-xs" style="cursor:pointer" title="缩小" onclick="GZC(0.85)">－</span><span class="btn btn-xs" style="cursor:pointer" title="复位" onclick="GZC(0)">复位</span><span style="font-size:11px;color:var(--text3)">滚轮缩放 · 双击还原</span></div>')+(window._gv==="d"?'<div id="gwrap"></div>':window._gv==="b"?GRAPHB():window._gv==="c"?RJ(true):GRAPHA());}
function GFSET(f){window._gf=f;var w=document.querySelector("#gwrap");if(w){w.innerHTML=GBODY();GZOOM();GRAPH_SIM();}}
function GGFSET(g){window._gg=g;var w=document.querySelector("#gwrap");if(w){w.innerHTML=GBODY();GZOOM();GRAPH_SIM();}}
function GRAPHA(){
/* 审稿修正：v 从 D 读（诗宝 18:45），图谱从快照变活图；口径对齐：团员台账=团员数（团务终审①） */
var mv=RULES.tuanYuanCount(D.members);
var mt=(D.meetings||[]).length;
var tc=(D.tuiyouCandidates||[]).length;
var vh=0;(D.volunteers||[]).forEach(function(v){vh+=Number(v.hours)||0;});
var cf=(D.classFund||[]).length;
var aw=(D.awards||[]).length;
var hs=(D.honors||[]).length;
var ac=(D.activities||[]).length+(D.classActs||[]).length;
var td=(D.todos||[]).filter(function(t){return !t.done;}).length;
var nodes=[
{n:'团员台账',v:mv,r:38,x:460,y:285,p:'members'},
{n:'三会一课',v:mt,r:34,x:232,y:285,p:'meetings'},
{n:'推优入党',v:tc,r:21,x:300,y:118,p:'awards',t:'awards'},
{n:'劳动实践',v:vh+'h',r:21,x:460,y:52,p:'awards',t:'acts'},
{n:'班费考勤',v:cf,r:21,x:620,y:118,p:'classfund'},
{n:'荣誉实践',v:aw,r:21,x:688,y:285,p:'awards',t:'awards'},
{n:'荣誉墙',v:hs,r:29,x:620,y:452,p:'awards',t:'honors'},
{n:'活动通知',v:ac,r:31,x:460,y:518,p:'activities'},
{n:'待办',v:td,r:21,x:300,y:452,p:'dash'}
];
var links=[[0,1,'参加'],[0,2,'来源'],[0,3,'参与'],[1,2,'评议依据'],[3,5,'时长门槛'],[5,6,'评出'],[7,3,'活动落地'],[0,7,'发布'],[8,1,'会议产生'],[4,7,'经费']];
var s='<svg viewBox="0 0 920 570" style="width:100%;max-width:980px;height:auto;display:block;margin:0 auto" id="gnet" data-w="920" data-h="570">';
s+='<defs><marker id=garr markerWidth="9" markerHeight="9" refX="6" refY="4.5" orient="auto"><path d="M0,0 L9,4.5 L0,9 z" fill="rgba(107,84,60,.55)"/></marker></defs>';
links.forEach(function(l){var a=nodes[l[0]],b=nodes[l[1]],mx=(a.x+b.x)/2,my=(a.y+b.y)/2;
s+='<path d="M'+a.x+','+a.y+' Q'+mx+','+my+' '+b.x+','+b.y+'" fill=none stroke="rgba(107,84,60,.5)" stroke-width="1.7" class="gmap-line" marker-end="url(#garr)"/>';
s+='<text x="'+mx+'" y="'+(my-9)+'" text-anchor=middle font-size="10" fill="var(--text2)" class="gmap-label">'+l[2]+'</text>';});
nodes.forEach(function(x){var empty=Number(String(x.v).replace(/h$/,""))===0,core=x.n==="团员台账";
s+='<g class="gmap-node'+(core?' gmap-core':'')+'" onclick="N(\''+x.p+'\')"><circle cx="'+x.x+'" cy="'+x.y+'" r="'+x.r+'" fill="'+(core?'var(--primary)':'var(--card)')+'" stroke="'+(core?'var(--primary-dark)':(empty?'var(--line)':'var(--primary)'))+'" stroke-width="'+(core?'2':(empty?'1.2':'1.5'))+'"'+(empty?' stroke-dasharray="4 3"':'')+'/>';
s+='<text x="'+x.x+'" y="'+(x.y-3)+'" text-anchor=middle font-size="'+(x.r>24?12:10)+'" fill="'+(core?'rgba(251,246,233,.92)':'var(--text2)')+'"'+(core?'':' class="gmap-label"')+'>'+x.n+'</text>';
s+='<text x="'+x.x+'" y="'+(x.y+17)+'" text-anchor=middle font-size="'+(x.r>24?16:13)+'" font-weight="600" fill="'+(core?'var(--on-primary)':(empty?'var(--text3)':'var(--text)'))+'" class="gmap-num">'+x.v+'</text></g>';});
s+='</svg>';
s+='<div style="font-size:11px;color:var(--text3);margin-top:6px">节点大小 = 数据量，虚线圆 = 空数据，箭头 = 业务流向（如：劳动实践时长是评优的门槛，会议产出待办）</div>';
return s;}
function GRAPHB(){
/* 成员网络 · 力导向版（2026-08-06 hermes：d3-force 本地化，替代固定两列静态排布）
   节点=团员/个人荣誉/班级荣誉，连线=荣誉归属；大小随连接数，hover 邻接高亮，拖拽实时跟随 */
var mems=[];
(D.members||[]).filter(function(m){return m.memberType==="团员";}).forEach(function(m){mems.push([m.name,0]);});
var pers=[],cls=[];
(D.honors||[]).forEach(function(h2){
  var owners=String(h2.holder||"").split(/[、,]/).map(function(s){return s.trim();}).filter(Boolean);
  if(String(h2.scope||"").indexOf("班")>=0){cls.push(h2.title);}
  else{pers.push([h2.title,owners]);}
});
var hasSet={};pers.forEach(function(p){p[1].forEach(function(nm){hasSet[nm]=1;});});
var roleMap={};(D.members||[]).forEach(function(x){if(x.role)roleMap[x.name]=x.role;});
var shown=mems.filter(function(m){if(window._gf==="has"&&!hasSet[m[0]])return false;if(window._gf==="none"&&hasSet[m[0]])return false;if(window._gg==="cadre"&&!roleMap[m[0]])return false;if(window._gg==="member"&&roleMap[m[0]])return false;return true;});
function SHT(s2){return (s2||"").length>20?s2.slice(0,20)+"…":s2;}
var nodes=[],links=[],nmap={};
function AN(id,n){nodes.push(n);nmap[id]=n;}
function AL(a,b){if(nmap[a]&&nmap[b])links.push({source:a,target:b});}
AN("class",{id:"class",type:"class",label:"班级",cnt:cls.length});
pers.forEach(function(p){AN("ph_"+p[0],{id:"ph_"+p[0],type:"honor",label:p[0]});});
cls.forEach(function(c){AN("ch_"+c,{id:"ch_"+c,type:"cls",label:c});});
shown.forEach(function(m){AN("m_"+m[0],{id:"m_"+m[0],type:"member",label:m[0],has:hasSet[m[0]]?1:0});});
pers.forEach(function(p){p[1].forEach(function(nm){AL("m_"+nm,"ph_"+p[0]);});});
cls.forEach(function(c){AL("class","ch_"+c);});
var deg={};nodes.forEach(function(n){deg[n.id]=0;});
links.forEach(function(l){deg[l.source]++;deg[l.target]++;});
nodes.forEach(function(n){n.deg=deg[n.id];
  if(n.type==="class")n.r=30;
  else if(n.type==="honor")n.r=14;
  else if(n.type==="cls")n.r=16;
  else n.r=11+Math.min(9,Math.round(n.deg*2.2));
});
var CW=960,CH=600;
nodes.forEach(function(n,i){var a=i/nodes.length*Math.PI*2;n.x=CW/2+Math.cos(a)*(210+(n.type==="class"?40:0));n.y=CH/2+Math.sin(a)*165;});
var s='<div style="display:flex;gap:8px;align-items:center;margin-bottom:8px"><input id=gsearch placeholder="搜成员 / 荣誉…" oninput="GSRC(this.value)" style="flex:1;min-width:0;padding:6px 10px;border:1px solid var(--line);border-radius:8px;font-size:12px;background:var(--card)"></div>';
s+='<svg viewBox="0 0 '+CW+' '+CH+'" style="width:100%;max-width:980px;height:auto;display:block;margin:0 auto" id=gnet data-w="'+CW+'" data-h="'+CH+'">';
s+='<text x="16" y="22" font-size="12" fill="var(--text2)">团员 '+shown.length+' 人 · 个人荣誉 '+pers.length+' 项 · 班级荣誉 '+cls.length+' 项</text>';
links.forEach(function(l,i){s+='<line id="gl_'+i+'" x1="0" y1="0" x2="0" y2="0" stroke="rgba(107,84,60,.55)" stroke-width="1.7" class="gmap-line"/>';});
nodes.forEach(function(n,i){
  var fill,stroke,sw;
  if(n.type==="class"){fill="var(--primary)";stroke="var(--primary-dark)";sw=2.2;}
  else if(n.type==="honor"){fill="var(--gold-soft)";stroke="var(--gold)";sw=1.5;}
  else if(n.type==="cls"){fill="var(--gold-soft)";stroke="var(--gold)";sw=1.6;}
  else{fill=n.has?"var(--primary-soft)":"var(--card)";stroke=n.has?"var(--primary)":"rgba(107,84,60,.38)";sw=n.has?1.8:1.4;}
  var clk=n.type==="member"?"GFOCUS('"+n.label+"')":"GOTO('awards','honors')";
  s+='<g class="gmap-node" id="gn_'+i+'" data-i="'+i+'" data-m="'+(n.type==="member"?n.label:"")+'" transform="translate('+Math.round(n.x)+','+Math.round(n.y)+')" onclick="'+clk+'" onmouseenter="GGH('+i+',1)" onmouseleave="GGH('+i+',0)" onpointerdown="GDRAG(event,'+i+')">';
  s+='<title>'+E(n.label)+'</title>';
  s+='<circle cx="0" cy="0" r="'+n.r+'" fill="'+fill+'" stroke="'+stroke+'" stroke-width="'+sw+'"/>';
  if(n.type==="class"){s+='<text x="0" y="-6" text-anchor=middle font-size="10.5" fill="rgba(251,246,233,.92)">25通信</text><text x="0" y="6" text-anchor=middle font-size="10.5" fill="rgba(251,246,233,.92)">工程2班</text><text x="0" y="20" text-anchor=middle font-size="12" font-weight="600" fill="var(--on-primary)">'+n.cnt+'</text>';}
  else if(n.type==="honor"){s+='<text x="0" y="'+(n.r+14)+'" text-anchor=middle font-size="10.5" fill="var(--text2)" class="gmap-label">'+SHT(n.label)+'</text>';}
  else if(n.type==="cls"){s+='<text x="0" y="'+(n.r+14)+'" text-anchor=middle font-size="10.5" fill="var(--text2)" class="gmap-label">'+SHT(n.label)+'</text>';}
  else{s+='<text x="'+(n.r+8)+'" y="4" font-size="12" fill="var(--text)" class="gmap-label">'+n.label+'</text>';}
  s+='</g>';
});
s+='</svg>';
s+='<div style="font-size:11px;color:var(--text3);margin-top:6px">拖拽随手拉（松手弹回），悬停看关系，点成员看轨迹。节点大小=荣誉连线数；班级荣誉归班级，个人荣誉归本人，会议/活动补录参与人后这层网还会长出更多连线</div>';
s+='<div style="display:flex;gap:14px;flex-wrap:wrap;font-size:11px;color:var(--text2);margin-top:6px"><span><b style="color:var(--primary)">●</b> 班级 / 有荣誉成员</span><span><b style="color:var(--text2)">○</b> 无荣誉成员</span><span><b style="color:var(--gold)">●</b> 荣誉节点</span><span>连线 = 荣誉归属 · 节点越大 = 连线越多</span></div>';
window._gdata={nodes:nodes,links:links};
return s;}
function GFOCUS(name){
var svg=document.querySelector("#gnet");if(!svg)return;
/* 邻接高亮改走力导向版 GGH（2026-08-06 hermes） */
var gd=window._gdata,idx=-1;
if(name&&gd){gd.nodes.forEach(function(n,i){if(n.type==="member"&&n.label===name)idx=i;});}
GGH(idx,name?1:0);
var det=document.querySelector("#gdetail");if(!det)return;
if(!name){det.innerHTML="";return;}
var m=(D.members||[]).find(function(x){return x.name===name;});
var myH=(D.honors||[]).filter(function(h2){return String(h2.holder||"").split(/[、,]/).indexOf(name)>=0;});
var parts=[];if(m&&m.role)parts.push(m.role);if(m&&m.dorm)parts.push(m.dorm);if(m&&m.joinDate)parts.push("入团 "+m.joinDate);else parts.push("入团 —");if(m&&m.birthMonth)parts.push("出生 "+m.birthMonth);var info=parts.join(" · ");
var d2='<div style="margin-top:12px;padding:14px 16px;border:1px solid var(--line);border-radius:var(--r);background:var(--card)"><div style="display:flex;align-items:baseline;justify-content:space-between;flex-wrap:wrap;gap:8px"><div><b style="font-size:14px">'+E(name)+'</b> <span style="font-size:11px;color:var(--text3)">'+info+'</span></div><span class="tag" style="background:var(--primary-soft);color:var(--primary)">'+myH.length+' 项荣誉</span></div>'+(myH.length?'<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:10px">'+myH.map(function(h2){return '<span class="tag tag-q">'+E(h2.title)+'</span>';}).join("")+'</div>':'<div style="font-size:12px;color:var(--text3);margin-top:8px">这位同学还没有个人荣誉记录，等你在荣誉墙里补上</div>')+'</div>';
det.innerHTML=d2;}
var G_SIM=null;
function GGH(i,on){
  if(window._gsearching)return;
  var gd=window._gdata;if(!gd)return;
  var adj={};if(i>=0)adj[i]=1;
  gd.links.forEach(function(l){
    var si=gd.nodes.indexOf(l.source),ti=gd.nodes.indexOf(l.target);
    if(si===i)adj[ti]=1;if(ti===i)adj[si]=1;
  });
  gd.nodes.forEach(function(n,idx){
    var g=document.getElementById("gn_"+idx);if(!g)return;
    g.style.opacity=(!on||adj[idx])?"":"0.16";
  });
  gd.links.forEach(function(l,li){
    var el=document.getElementById("gl_"+li);if(!el)return;
    var si=gd.nodes.indexOf(l.source),ti=gd.nodes.indexOf(l.target);
    el.style.opacity=(!on||si===i||ti===i)?"":"0.06";
  });
}
function GDRAG(ev,idx){
  if(!G_SIM)return;
  var gd=window._gdata;if(!gd||!gd.nodes[idx])return;
  var node=gd.nodes[idx];ev.preventDefault();
  var svg=document.getElementById("gnet");if(!svg)return;
  function toXY(e){
    var pt=svg.createSVGPoint();pt.x=e.clientX;pt.y=e.clientY;
    var m=svg.getScreenCTM();if(!m)return null;
    var p=pt.matrixTransform(m.inverse());return {x:p.x,y:p.y};
  }
  var p0=toXY(ev);if(!p0)return;
  node.fx=node.x;node.fy=node.y;
  if(G_SIM.alpha()<0.05)G_SIM.alphaTarget(0.06).restart();
  function mv(e2){var p=toXY(e2);if(!p)return;node.fx=p.x;node.fy=p.y;}
  function up(){node.fx=null;node.fy=null;G_SIM.alphaTarget(0);document.removeEventListener("pointermove",mv);}
  document.addEventListener("pointermove",mv);
  document.addEventListener("pointerup",up,{once:true});
}
function GRAPH_SIM(){
  if(window._gv==="a")return; /* 模块地图静态，不启力导向（视图守卫） */
  if(!window.d3||!d3.forceSimulation){if(!window._gd3w){window._gd3w=1;console.warn("[图谱] d3 未加载，力导向不可用，已降级静态");var q=document.getElementById("gwrap");if(q&&!document.getElementById("gd3warn")){var dd=document.createElement("div");dd.id="gd3warn";dd.style="padding:10px;border:1px dashed var(--warn);border-radius:8px;font-size:12px;color:var(--text2);margin-top:8px";dd.textContent="⚠ 力导向引擎未加载，图谱为静态展示——请确认 lib/d3-force 文件在 app 目录";q.appendChild(dd);}}return;}
  var svg=document.getElementById("gnet");if(!svg)return;
  var gd=window._gdata;if(!gd||!gd.nodes||!gd.nodes.length)return;
  if(G_SIM){G_SIM.stop();G_SIM=null;}
  var nodes=gd.nodes,links=gd.links;
  var sim=d3.forceSimulation(nodes)
    .force("link",d3.forceLink(links).id(function(n){return n.id;}).distance(function(l){return (l.source.type==="class"||l.target.type==="class")?135:95;}).strength(0.55))
    .force("charge",d3.forceManyBody().strength(-170))
    .force("collide",d3.forceCollide().radius(function(n){return n.r+9;}))
    .force("center",d3.forceCenter(480,300))
    .force("x",d3.forceX(480).strength(0.035))
    .force("y",d3.forceY(300).strength(0.035))
    .alphaDecay(0.07);
  G_SIM=sim;
  sim.on("tick",function(){
    links.forEach(function(l,i){
      var el=document.getElementById("gl_"+i);if(!el)return;
      el.setAttribute("x1",l.source.x);el.setAttribute("y1",l.source.y);
      el.setAttribute("x2",l.target.x);el.setAttribute("y2",l.target.y);
    });
    nodes.forEach(function(n,i){
      var g=document.getElementById("gn_"+i);if(!g)return;
      g.setAttribute("transform","translate("+n.x+","+n.y+")");
    });
  });
}
function GZC(f){
  var svg=document.getElementById("gnet");if(!svg)return;
  var vb=svg.viewBox.baseVal;
  var iw=parseFloat(svg.getAttribute("data-w"))||960,ih=parseFloat(svg.getAttribute("data-h"))||600;
  if(f===0){vb.x=0;vb.y=0;vb.width=iw;vb.height=ih;return;}
  var nw=Math.max(420,Math.min(2600,vb.width*f));
  var nr=nw/vb.width;
  var nh=Math.max(320,Math.min(1600,vb.height*nr));
  vb.x+=(vb.width-nw)/2;vb.y+=(vb.height-nh)/2;
  vb.width=nw;vb.height=nh;
}
function GSRC(kw){
  var svg=document.getElementById("gnet");if(!svg)return;
  var gd=window._gdata;if(!gd)return;
  kw=String(kw||"").trim().toLowerCase();
  window._gsearching=kw?1:0;
  var hit={};
  if(kw){
    gd.nodes.forEach(function(n,i){if(n.label&&String(n.label).toLowerCase().indexOf(kw)>=0)hit[i]=1;});
    gd.links.forEach(function(l){
      var si=gd.nodes.indexOf(l.source),ti=gd.nodes.indexOf(l.target);
      if(hit[si])hit[ti]=1;
      if(hit[ti])hit[si]=1;
    });
  }
  gd.nodes.forEach(function(n,i){
    var g=document.getElementById("gn_"+i);if(!g)return;
    g.style.opacity=kw?(hit[i]?"":"0.12"):"";
  });
  gd.links.forEach(function(l,li){
    var el=document.getElementById("gl_"+li);if(!el)return;
    var si=gd.nodes.indexOf(l.source),ti=gd.nodes.indexOf(l.target);
    el.style.opacity=kw?((hit[si]||hit[ti])?"":"0.06"):"";
  });
}
function GZOOM(){
  var svg=document.getElementById("gnet");if(!svg)return;
  if(svg._gz)return;svg._gz=1;
  svg.addEventListener("wheel",function(e){
    e.preventDefault();
    var vb=svg.viewBox.baseVal;
    var f=e.deltaY<0?0.88:1.15;
    var nw=Math.max(420,Math.min(2600,vb.width*f));
    var nr=nw/vb.width;
    var nh=Math.max(320,Math.min(1600,vb.height*nr));
    var r=svg.getBoundingClientRect();
    if(!r.width||!r.height)return;
    var mx=(e.clientX-r.left)/r.width*vb.width+vb.x;
    var my=(e.clientY-r.top)/r.height*vb.height+vb.y;
    vb.x=mx-(mx-vb.x)*nr;
    vb.y=my-(my-vb.y)*nr;
    vb.width=nw;
    vb.height=nh;
  },{passive:false});
  svg.addEventListener("dblclick",function(){
    var vb=svg.viewBox.baseVal;
    var iw=parseFloat(svg.getAttribute("data-w"))||960,ih=parseFloat(svg.getAttribute("data-h"))||600;
    vb.x=0;vb.y=0;vb.width=iw;vb.height=ih;
  });
}
function RGRA(){
var tu=RULES.tuanYuanCount(D.members),mt=D.meetings.length,ca=(D.classActs||[]).length,ac=(D.activities||[]).length,hr=(D.honors||[]).length;
var vh=0;D.volunteers.forEach(function(v){vh+=Number(v.hours)||0;});
var vt=D.settings.volunteerTarget||20;
var h='<div class=card><div class=card-title>知识图谱 <span style="font-size:11px;color:var(--text3);font-weight:400">模块地图 · 成员网络 · 团务知识，Obsidian 式可视化：节点是资料，连线是关系</span></div>';
h+='<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px">';
[["团员",tu],["会议",mt],["活动",ca],["通知",ac],["荣誉",hr],["实践",vh+"h / "+vt+"h"]].forEach(function(x){h+='<span class="tag tag-q">'+x[0]+' '+x[1]+'</span>';});
h+='</div>';
h+='<div id=gwrap>'+GBODY()+'</div>';
h+='<div id=gdetail></div>';
h+=INSIGHT();
h+='</div>';
return h;}

/* ---- TZS 注册表(阶段A:全局名保留,仅登记) ---- */
window.TZS = window.TZS || {};
window.TZS.modules_graph = {
  GVT,
  GSETGV,
  GBODY,
  GFSET,
  GGFSET,
  GRAPHA,
  GRAPHB,
  GFOCUS,
  GGH,
  GDRAG,
  GRAPH_SIM,
  GZC,
  GSRC,
  GZOOM,
  RGRA,
};
