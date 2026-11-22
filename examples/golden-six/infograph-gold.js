/* Infograph Golden Six — dependency-free SVG renderers and semantic fixtures.
   Original educational diagrams; no external copyrighted graphics bundled.
   Browser API: InfographGold.mount(container, type, options)
   Validation API: InfographGold.verify() — independently runnable under Node.
*/
(function (root) {
  "use strict";
  const NS="http://www.w3.org/2000/svg";
  const C={paper:"#f8faf8",ink:"#1d3038",muted:"#667980",grid:"#dce5e2",green:"#638777",teal:"#438c91",gold:"#b29260",navy:"#445d70",rose:"#b47972"};
  const info=[
    {id:"exploded",title:"Exploded assembly",zh:"装配爆炸视图",domain:"机械与工业设计",purpose:"分离零件，但保留空间装配和标注关系",rule:"部件位移仅作示例；不是 CAD 或可制造公差图"},
    {id:"circuit",title:"Circuit schematic",zh:"电路原理图",domain:"电气工程",purpose:"符号和连接网表优先于物理位置",rule:"示意 R–C 串联；不是电气设计规则检查 ERC"},
    {id:"stratigraphy",title:"Stratigraphic column",zh:"地层柱状图",domain:"地质学",purpose:"深度、厚度、岩性与层序同时编码",rule:"深度从上向下增加，层位深度区间不得重叠"},
    {id:"hr",title:"Hertzsprung–Russell",zh:"赫罗图 H–R",domain:"天体物理",purpose:"温度（向右递减）与光度（对数轴）",rule:"温度向右降低、光度为对数；所有星点均为合成样例"},
    {id:"attack",title:"ATT&CK tactics matrix",zh:"ATT&CK 战术矩阵（精选）",domain:"网络安全",purpose:"按战术列组织技术卡片；非普通热力图",rule:"只展示选定的五列与五个已核对名称；不是 MITRE 全量矩阵"},
    {id:"rail",title:"Train time–distance",zh:"列车时距运行图",domain:"交通工程",purpose:"横轴时间、纵轴沿线距离；折线为列车轨迹",rule:"车次、停站时刻与沿线公里数均为合成示例"}
  ];
  const fixture={
    exploded:{parts:[
      {id:"cap",label:"P01 · Cover",desc:"合成上盖",z:0,dy:-132,fill:"#a8bcb4"},
      {id:"rotor",label:"P02 · Rotor",desc:"合成转子",z:1,dy:-54,fill:"#9bb2bf"},
      {id:"stator",label:"P03 · Stator",desc:"合成定子",z:2,dy:25,fill:"#cbb999"},
      {id:"base",label:"P04 · Base",desc:"合成底座",z:3,dy:100,fill:"#77978a"}
    ]},
    circuit:{netlist:[
      {net:"N1",from:"V1.+",to:"R1.1"},
      {net:"N2",from:"R1.2",to:"C1.1"},
      {net:"N3",from:"C1.2",to:"V1.-"}
    ],components:[
      {id:"V1",label:"V1 · 5V",desc:"理想合成电压源（示意）"},
      {id:"R1",label:"R1 · 1kΩ",desc:"电阻 IEC 矩形符号"},
      {id:"C1",label:"C1 · 10µF",desc:"无极性电容，RC 串联示意"}
    ]},
    stratigraphy:{totalDepthM:14,layers:[
      {id:"s1",top:0,bottom:2,label:"泥岩",en:"Mudstone",fill:"#9cacb2",pattern:"fine"},
      {id:"s2",top:2,bottom:5,label:"砂岩",en:"Sandstone",fill:"#d5bd8a",pattern:"dots"},
      {id:"s3",top:5,bottom:7,label:"粉砂岩",en:"Siltstone",fill:"#c4baaa",pattern:"lines"},
      {id:"s4",top:7,bottom:10,label:"灰岩",en:"Limestone",fill:"#a5bcb4",pattern:"brick"},
      {id:"s5",top:10,bottom:14,label:"砾岩",en:"Conglomerate",fill:"#bdab99",pattern:"pebbles"}
    ]},
    hr:{temperatureRangeK:[40000,2500],luminosityRangeSolar:[1e-4,1e6],stars:[
      {id:"h1",name:"Main sequence A",t:30000,l:40000,cls:"主序星（合成）",color:"#5f87b1"},
      {id:"h2",name:"Main sequence B",t:10000,l:120,cls:"主序星（合成）",color:"#83aac5"},
      {id:"h3",name:"Solar analogue",t:5800,l:1,cls:"太阳类似星（合成）",color:"#d8b47e"},
      {id:"h4",name:"Cool dwarf",t:3200,l:0.025,cls:"冷矮星（合成）",color:"#c38c7c"},
      {id:"h5",name:"Red giant",t:4200,l:2000,cls:"红巨星（合成）",color:"#bb826b"},
      {id:"h6",name:"White dwarf",t:18000,l:0.002,cls:"白矮星（合成）",color:"#a5b9ca"}
    ]},
    attack:{scope:"selected enterprise tactics; NOT full live ATT&CK",tactics:[
      {id:"TA0043",label:"Reconnaissance",techniques:[{id:"T1595",label:"Active Scanning"}]},
      {id:"TA0001",label:"Initial Access",techniques:[{id:"T1566",label:"Phishing"}]},
      {id:"TA0002",label:"Execution",techniques:[{id:"T1059",label:"Command and Scripting Interpreter"}]},
      {id:"TA0003",label:"Persistence",techniques:[{id:"T1547",label:"Boot or Logon Autostart Execution"}]},
      {id:"TA0040",label:"Impact",techniques:[{id:"T1486",label:"Data Encrypted for Impact"}]}
    ]},
    rail:{stations:[{name:"西站",km:0},{name:"中站",km:30},{name:"河湾站",km:60},{name:"东站",km:90}],trains:[
      {id:"G101",direction:"east",label:"G101 · 东行",color:"#367f81",path:[{m:0,km:0},{m:20,km:30},{m:43,km:60},{m:66,km:90}]},
      {id:"G102",direction:"west",label:"G102 · 西行",color:"#b18a5a",path:[{m:10,km:90},{m:33,km:60},{m:56,km:30},{m:82,km:0}]},
      {id:"D201",direction:"east",label:"D201 · 东行",color:"#ae796e",path:[{m:27,km:0},{m:52,km:30},{m:72,km:60},{m:90,km:90}]}
    ],timeOrigin:"09:00",durationMin:90}
  };
  const clone=o=>JSON.parse(JSON.stringify(o));
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const line=(x1,y1,x2,y2,color=C.grid,width=1,dash="")=>'<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" stroke="'+color+'" stroke-width="'+width+'" '+(dash?'stroke-dasharray="'+dash+'"':"")+'/>';
  const txt=(x,y,s,size=13,color=C.ink,attrs="")=>'<text x="'+x+'" y="'+y+'" font-size="'+size+'" fill="'+color+'" '+attrs+'>'+esc(s)+'</text>';
  const rect=(x,y,w,h,fill,r=0,attrs="")=>'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="'+r+'" fill="'+fill+'" '+attrs+'/>';
  const pill=(x,y,text)=>rect(x,y-17,150,27,"#e8eeea",6)+txt(x+10,y+1,text,12,C.ink);
  const svg=(content,defs="")=>'<svg xmlns="'+NS+'" viewBox="0 0 980 550" role="img" aria-label="Infograph visual representation example" preserveAspectRatio="xMidYMid meet"><defs>'+defs+'</defs>'+rect(0,0,980,550,C.paper)+content+'</svg>';
  const section=(n,subtitle)=>txt(46,42,n,23,C.ink,'font-weight="600"')+txt(46,66,subtitle,12,C.muted);
  const hit=(key,body)=>'<g data-key="'+esc(key)+'" class="hot" role="button" tabindex="0" aria-label="'+esc(key)+'">'+body+'</g>';
  const dimText=(t)=>txt(45,526,t,11,C.muted);
  function iso(x,y,w,h,d,fill){
    const top=x+','+y+' '+(x+38)+','+(y-22)+' '+(x+w+38)+','+(y-22)+' '+(x+w)+','+y;
    const right=(x+w)+','+y+' '+(x+w+38)+','+(y-22)+' '+(x+w+38)+','+(y-22+d)+' '+(x+w)+','+(y+d);
    const front=x+','+y+' '+(x+w)+','+y+' '+(x+w)+','+(y+d)+' '+x+','+(y+d);
    return '<polygon points="'+top+'" fill="'+fill+'" stroke="#566c72" stroke-width="1.5"/>'+
      '<polygon points="'+right+'" fill="#5d7777" fill-opacity=".68" stroke="#566c72"/>'+
      '<polygon points="'+front+'" fill="'+fill+'" stroke="#566c72" stroke-width="1.5"/>'+
      line(x+20,y+d/2,x+w-20,y+d/2,"#f9faf9",.8);
  }
  function drawExploded(s){
    const k=Math.max(0,Math.min(1,Number(s.progress??.75))),p=fixture.exploded.parts;
    let out=section("01 · Exploded view","Illustrative four-part assembly · component identity retained");
    out+=line(407,135,407,476,"#91a69d",2,"7 7");
    const original=[270,286,302,318],offset=[-140,-78,50,128];
    p.forEach((part,i)=>{
      const y=original[i]+offset[i]*k;
      const chosen=s.selected===part.id;
      const width=i===0?196:i===1?164:i===2?208:226,x=416-width/2,depth=i===1?24:30;
      const box=iso(x,y,width,60,depth,part.fill);
      out+=hit(part.id,'<g'+(chosen?' filter="url(#selectedglow)"':'')+'>'+box+'</g>');
      const ax=410+width/2+38,labX=680,labY=154+i*77;
      out+=line(ax,y+18,labX-10,labY-8,chosen?C.gold:"#c2ceca",chosen?2.4:1.3);
      out+=txt(labX,labY,part.label,15,chosen?C.teal:C.ink,'font-weight="600"')+txt(labX,labY+20,part.desc,12,C.muted);
    });
    out+=pill(52,116,"Explosion · "+Math.round(k*100)+"%")+dimText("Semantic contract: part IDs, assembly order, staged offsets. Illustrative geometry only.");
    return svg(out,'<filter id="selectedglow"><feDropShadow dx="0" dy="0" stdDeviation="5" flood-color="#b29260" flood-opacity=".45"/></filter>');
  }
  function drawCircuit(s){
    const selected=s.selected||"",incolor=k=>selected===k?C.gold:C.ink;
    let out=section("02 · Circuit schematic","Synthetic, three-net series RC loop · positions are schematic, not physical");
    out+=txt(52,124,"NETLIST",12,C.muted,'letter-spacing="1.5"');
    out+=txt(52,155,"N1  V1.+ → R1.1",13,C.teal)+txt(52,181,"N2  R1.2 → C1.1",13,C.teal)+txt(52,207,"N3  C1.2 → V1.-",13,C.teal);
    // Geometric wires from component terminals; no wire crosses any component body.
    out+=line(220,160,405,160,C.teal,3)+line(505,160,747,160,C.teal,3)+line(747,160,747,281,C.teal,3);
    out+=line(747,321,747,434,C.teal,3)+line(747,434,220,434,C.teal,3);
    out+=line(220,434,220,349,C.teal,3)+line(220,274,220,160,C.teal,3);
    out+=hit("R1",rect(405,144,100,32,"#ecdfc5",4,'stroke="'+incolor("R1")+'" stroke-width="2.5"')+txt(425,135,"R1 · 1 kΩ",13,C.ink));
    out+=hit("C1",rect(700,270,95,62,"transparent",3,'pointer-events="all"')+line(704,281,790,281,incolor("C1"),4)+line(704,321,790,321,incolor("C1"),4)+txt(802,305,"C1 · 10 µF",13,C.ink));
    out+=hit("V1",'<circle cx="220" cy="311.5" r="37.5" fill="#eaf0ed" stroke="'+incolor("V1")+'" stroke-width="2.5"/>'+txt(212,303,"+",22,C.ink)+txt(212,331,"−",22,C.ink)+txt(276,319,"V1 · 5 V",13,C.ink));
    for(const [x,y,label] of [[220,160,"N1"],[747,160,"N2"],[747,434,"N3"]])out+='<circle cx="'+x+'" cy="'+y+'" r="4.6" fill="'+C.teal+'"/>'+txt(x+12,y+22,label,11,C.muted);
    out+=txt(52,315,"原理图不代表物理元件位置",14,C.muted)+txt(52,341,"本例只验证连通性与符号说明。",13,C.muted);
    out+=dimText("KiCad ERC and physical electrical correctness are NOT claimed.");
    return svg(out);
  }
  const geoPatternDefs='<pattern id="fine" width="12" height="12" patternUnits="userSpaceOnUse"><path d="M0 5H8" stroke="#59747b" stroke-width="1"/></pattern>'+
    '<pattern id="dots" width="12" height="12" patternUnits="userSpaceOnUse"><circle cx="4" cy="4" r="1.6" fill="#a18960"/></pattern>'+
    '<pattern id="lines" width="14" height="10" patternUnits="userSpaceOnUse"><path d="M0 2H14M5 7H14" stroke="#857b71" stroke-width="1"/></pattern>'+
    '<pattern id="brick" width="30" height="16" patternUnits="userSpaceOnUse"><path d="M0 0H30M0 8H30M15 0V8M0 8V16M30 8V16" stroke="#577b76" stroke-width="1"/></pattern>'+
    '<pattern id="pebbles" width="29" height="23" patternUnits="userSpaceOnUse"><ellipse cx="8" cy="8" rx="6" ry="4" fill="none" stroke="#7d776b"/><ellipse cx="21" cy="17" rx="5" ry="3" fill="none" stroke="#7d776b"/></pattern>';
  function drawStrat(s){
    let out=section("03 · Stratigraphic column","Synthetic measured section · depth scale is proportional to metres");
    const x=272,y0=106,height=381,scale=height/14,w=160;
    [0,2,5,7,10,14].forEach(d=>{const yy=y0+d*scale;out+=line(198,yy,714,yy,C.grid,1,"3 4")+txt(181,yy+4,d+" m",13,C.muted,'text-anchor="end"')});
    fixture.stratigraphy.layers.forEach((l,i)=>{
      const yy=y0+l.top*scale,hh=(l.bottom-l.top)*scale,chosen=s.selected===l.id;
      out+=hit(l.id,rect(x,yy,w,hh,l.fill,0,'stroke="'+(chosen?C.gold:"#526972")+'" stroke-width="'+(chosen?3:1)+'"')+rect(x,yy,w,hh,'url(#'+l.pattern+')'));
      out+=line(x+w+8,yy+hh/2,x+w+60,yy+hh/2,"#9bada6",1.5)+txt(506,yy+hh/2+4,l.label+" · "+l.en,14,C.ink)+txt(740,yy+hh/2+4,(l.bottom-l.top)+" m",13,C.muted);
    });
    out+=txt(200,93,"深度 / Depth",12,C.muted)+txt(272,93,"岩性柱",12,C.muted)+txt(505,93,"岩性描述",12,C.muted)+txt(736,93,"厚度",12,C.muted);
    out+=txt(52,442,"上层较新",14,C.green)+txt(52,465,"底层较老*",14,C.rose);
    out+=dimText("*Undeformed-layer convention only; do not infer real field stratigraphy from synthetic layers.");
    return svg(out,geoPatternDefs);
  }
  const hrX=t=>148+(Math.log(40000)-Math.log(t))/(Math.log(40000)-Math.log(2500))*730;
  const hrY=l=>476-(Math.log10(l)+4)/10*350;
  function drawHR(s){
    let out=section("04 · Hertzsprung–Russell diagram","Luminosity [solar units, log] versus effective temperature [K, reversed]");
    const xx=[40000,20000,10000,5800,3000],yy=[1e-4,1e-2,1,1e2,1e4,1e6];
    for(const l of yy){const y=hrY(l);out+=line(148,y,878,y,C.grid,1)+(txt(132,y+4,l===1?"1":l<1?"10^"+Math.log10(l):"10^"+Math.log10(l),11,C.muted,'text-anchor="end"'));}
    for(const t of xx){const x=hrX(t);out+=line(x,126,x,476,C.grid,1)+txt(x,499,String(t),12,C.muted,'text-anchor="middle"')}
    out+=txt(490,530,"Effective temperature (K) · decreases →",14,C.ink,'text-anchor="middle"');
    out+=txt(29,287,"Luminosity / L☉",13,C.ink,'transform="rotate(-90 29 287)" text-anchor="middle"');
    const pts=[[30000,40000],[10000,120],[5800,1],[3200,.025]].map(p=>hrX(p[0])+","+hrY(p[1])).join(" ");
    out+='<polyline points="'+pts+'" stroke="'+C.teal+'" fill="none" stroke-width="11" opacity=".13" stroke-linejoin="round"/>';
    for(const z of fixture.hr.stars){const x=hrX(z.t),y=hrY(z.l),selected=s.selected===z.id;
      out+=hit(z.id,'<circle cx="'+x+'" cy="'+y+'" r="'+(selected?10:7)+'" fill="'+z.color+'" stroke="'+(selected?C.gold:C.paper)+'" stroke-width="'+(selected?3.5:2)+'"/>');
    }
    out+=txt(664,172,"HOT / BRIGHT",12,C.muted)+txt(665,435,"COOL / DIM",12,C.muted);
    out+=dimText("All stars synthetic; reversed temperature axis and log-luminosity scale are deliberate.");
    return svg(out);
  }
  function drawAttack(s){
    let out=section("05 · ATT&CK enterprise matrix · selected tactics","Five sourced tactic/technique pairs · not a full ATT&CK dataset or coverage result");
    const cols=fixture.attack.tactics,base=40,colW=180;
    cols.forEach((t,i)=>{
      const x=base+i*184,sel=s.selected===t.techniques[0].id;
      out+=rect(x,114,colW,86,"#28434a",7)+txt(x+12,145,t.label,14,"#f2f6f4",'font-weight="600"')+txt(x+12,169,t.id,12,"#c0d3ce");
      const y=220;
      out+=hit(t.techniques[0].id,rect(x,y,colW,136,sel?"#e4e3d6":"#e6eeea",7,'stroke="'+(sel?C.gold:"#c4d4cb")+'" stroke-width="'+(sel?3:1)+'"')+
        txt(x+13,y+28,t.techniques[0].id,13,C.green,'font-weight="600"')+
        '<foreignObject x="'+(x+12)+'" y="'+(y+40)+'" width="'+(colW-24)+'" height="83"><div xmlns="http://www.w3.org/1999/xhtml" style="font:13px/1.35 system-ui;color:#2d4246;overflow-wrap:break-word">'+esc(t.techniques[0].label)+'</div></foreignObject>');
      out+=rect(x,380,colW,55,"#f0f3ef",5)+txt(x+12,400,"示例列 · 非覆盖测评",11,C.muted)+txt(x+12,420,"Selected only",11,C.muted);
    });
    out+=dimText("Names/IDs linked to MITRE; cell layout is original. The enterprise model has 15 tactics as of 2026-11.");
    return svg(out);
  }
  function drawRail(s){
    let out=section("06 · Train time–distance graph","Synthetic timetable · horizontal time / vertical distance along route");
    const x0=143,xf=900,y0=476,yt=122;
    const xpos=m=>x0+m/90*(xf-x0),ypos=km=>y0-km/90*(y0-yt);
    [0,15,30,45,60,75,90].forEach(t=>{const x=xpos(t),h=9+Math.floor(t/60),min=t%60;out+=line(x,yt,x,y0,C.grid,1,"3 4")+txt(x,502,String(h).padStart(2,"0")+":"+String(min).padStart(2,"0"),12,C.muted,'text-anchor="middle"')});
    for(const st of fixture.rail.stations){const y=ypos(st.km);out+=line(x0,y,xf,y,C.grid,1)+txt(121,y+4,st.name,13,C.muted,'text-anchor="end"')+txt(915,y+4,st.km+" km",11,C.muted)}
    for(const t of fixture.rail.trains){const coords=t.path.map(q=>xpos(q.m)+","+ypos(q.km)).join(" ");const chosen=s.selected===t.id;out+=hit(t.id,
      '<polyline points="'+coords+'" fill="none" stroke="'+t.color+'" stroke-width="'+(chosen?6:3.4)+'" stroke-linecap="round" stroke-linejoin="round"/>'+
      t.path.map(q=>'<circle cx="'+xpos(q.m)+'" cy="'+ypos(q.km)+'" r="'+(chosen?5:3.6)+'" fill="'+t.color+'"/>').join(""));
      const p=t.path[t.path.length-1];out+=txt(xpos(p.m)-6,ypos(p.km)-13,t.id,13,t.color,'text-anchor="end" font-weight="600"');
    }
    out+=txt(506,535,"Time of day · 09:00–10:30",13,C.ink,'text-anchor="middle"');
    out+=dimText("Timetable movements are synthetic; station spacing is proportional to route kilometres.");
    return svg(out);
  }
  const renderers={exploded:drawExploded,circuit:drawCircuit,stratigraphy:drawStrat,hr:drawHR,attack:drawAttack,rail:drawRail};
  const getItem=(type,key)=>{
    if(!key)return null;
    if(type==="exploded")return fixture.exploded.parts.find(x=>x.id===key);
    if(type==="circuit")return fixture.circuit.components.find(x=>x.id===key);
    if(type==="stratigraphy")return fixture.stratigraphy.layers.find(x=>x.id===key);
    if(type==="hr")return fixture.hr.stars.find(x=>x.id===key);
    if(type==="attack"){for(const x of fixture.attack.tactics)for(const q of x.techniques)if(q.id===key)return q;}
    if(type==="rail")return fixture.rail.trains.find(x=>x.id===key);
    return null;
  };
  function verify() {
    const tests=[],check=(name,pass,details="")=>tests.push({name,pass:Boolean(pass),details});
    const e=fixture.exploded.parts;check("exploded.unique-parts",new Set(e.map(x=>x.id)).size===e.length);
    check("exploded.staged-order",e.length===4&&e.every((x,i)=>x.z===i));
    const nets=fixture.circuit.netlist;check("circuit.series-netlist",nets.length===3&&new Set(nets.map(x=>x.net)).size===3&&nets[0].from==="V1.+"&&nets[2].to==="V1.-");
    check("circuit.component-ids",new Set(fixture.circuit.components.map(x=>x.id)).size===3);
    const a=fixture.stratigraphy.layers;check("stratigraphy.depth-contiguity",a[0].top===0&&a.every((x,i)=>x.bottom>x.top&&(i===0||x.top===a[i-1].bottom))&&a[a.length-1].bottom===fixture.stratigraphy.totalDepthM);
    check("stratigraphy.thickness-sum",a.reduce((n,x)=>n+(x.bottom-x.top),0)===fixture.stratigraphy.totalDepthM);
    check("hr.reversed-temperature",fixture.hr.temperatureRangeK[0]>fixture.hr.temperatureRangeK[1]&&hrX(30000)<hrX(3000));
    check("hr.log-luminosity",hrY(.01)-hrY(1)===70&&hrY(1)-hrY(100)===70);
    check("hr.valid-synthetic-stars",fixture.hr.stars.every(x=>x.t>0&&x.l>0));
    const tactics=fixture.attack.tactics;check("attack.selected-five-tactics",tactics.length===5&&new Set(tactics.map(x=>x.id)).size===5);
    check("attack.technique-ids",tactics.every(x=>/^TA\d{4}$/.test(x.id)&&x.techniques.every(y=>/^T\d{4}$/.test(y.id))));
    const st=fixture.rail.stations, trains=fixture.rail.trains;
    check("rail.stations-ascending",st[0].km===0&&st.every((x,i)=>i===0||x.km>st[i-1].km));
    check("rail.monotonic-train-times",trains.every(t=>t.path.every((x,i)=>x.m>=0&&x.m<=90&&(i===0||x.m>t.path[i-1].m))));
    check("rail.distance-by-direction",trains.every(t=>t.path.every((x,i)=>x.km>=0&&x.km<=90&&(i===0||(t.direction==="east"?x.km>=t.path[i-1].km:x.km<=t.path[i-1].km)))));
    return {pass:tests.every(x=>x.pass),checked:tests.length,tests};
  }
  function mount(el,type,options={}){
    if(!renderers[type])throw Error("Unknown type: "+type);
    const state={selected:options.selected||"",progress:options.progress??.75};
    const draw=()=>{
      el.innerHTML=renderers[type](state);
      el.dataset.type=type;
      el.dataset.selected=state.selected;
      el.dataset.progress=String(state.progress);
      if(typeof options.onSelect==="function")options.onSelect(getItem(type,state.selected),state);
    };
    const select=key=>{state.selected=key;draw()};
    el.addEventListener("click",event=>{const item=event.target.closest("[data-key]");if(item&&el.contains(item))select(item.getAttribute("data-key"))});
    el.addEventListener("keydown",event=>{if(event.key==="Enter"||event.key===" "){const item=event.target.closest("[data-key]");if(item&&el.contains(item)){event.preventDefault();select(item.getAttribute("data-key"))}}});
    draw();
    return {type,setProgress:value=>{state.progress=Math.max(0,Math.min(1,Number(value)));draw()},select,getState:()=>clone(state),destroy:()=>{el.innerHTML=""}};
  }
  root.InfographGold={info:clone(info),fixtures:clone(fixture),verify,mount,render:(type,state={})=>{if(!renderers[type])throw Error("Unknown type: "+type);return renderers[type](state)}};
})(typeof window!=="undefined"?window:globalThis);
