import {createHash} from 'node:crypto';
const raw='iVBORw0KGgoAAAANSUhEUgAAAAwAAAAICAIAAABChommAAAAl0lEQVR42m2PMXICAQwDJdl3VNR0+f8TA2dLFDCpsrVmVsv74wcAAFZJBYpEAsT2ZhdAA6CkPlStKlIgkST2rnc8V5NSH9WnutUt1WdkL2dIAWhWqVpd1YeOU92kEnOGIJCkm19ESVJV13nb1xN2JFIkO18c2zZ2/OvEtmMnTtLZtT7uK0h2/j55xrPe6cSeC0DieP1f3Rt7w4RAouaAMQAAAABJRU5ErkJggg==';
const make=(id,label,role,bounds,more={})=>({id,label,role,bounds,depth:2,essential:true,provenance:'authored',sourceNote:'Synthetic neutral engineering fixture',fidelity:'flat',dynamic:false,...more});
export function referenceDemo(){
 const groups=[['brand',['Sales','Product lines','Retail','Online commerce','New offerings','Governance']],['partner',['Corporate returns','Department resources','Peer markets']],['external',['Regulation','Premises','Macroeconomy','Key customers','Platforms']]];
 const objects=[make('env','Synthetic raster ambient background','environment',[0,0,1,1],{fidelity:'raster',essential:false,depth:0}),make('hub','Operating entity','entity',[.34,.34,.32,.32],{depth:5,fidelity:'surface',dynamic:true,material:{family:'metal',roughness:.55,metalness:0,opacity:1},ports:{}}),make('title','OPERATING ENTITY','label',[.36,.47,.28,.07],{depth:6,dynamic:true})],links=[];
 const hub=objects[1];let i=0;
 for(const [theme,names] of groups)for(const label of names){
  const a=(i/14)*2*Math.PI-Math.PI/2,x=.5+.40*Math.cos(a),y=.5+.40*Math.sin(a),id='a'+i,port='p'+i;
  hub.ports[port]=[.5+.48*Math.cos(a),.5+.48*Math.sin(a)];
  objects.push(make(id,label,'anchor',[x-.077,y-.039,.154,.078],{theme,ports:{p:[.5,.5]}}));
  links.push({id:'l'+i,from:{object:id,port:'p'},to:{object:'hub',port},kind:'constraint'});i++;
 }
 const base=['env','hub','title'],all=[...base,...objects.slice(3).map(o=>o.id),...links.map(l=>l.id)];
 const scenes=[{id:'initial',intent:'Anchor the operating entity',visible:base}];
 for(let j=1;j<=14;j++)scenes.push({id:'reveal'+j,intent:'Reveal constraint '+j+' of 14',visible:[...base,...objects.slice(3,3+j).map(o=>o.id),...links.slice(0,j).map(l=>l.id)]});
 scenes.push({id:'focus',intent:'Illustrative market focus (not causal attribution)',visible:all});
 const transforms={};for(let j=1;j<=14;j++){const t={dx:Math.sin(j)*.014,dy:Math.cos(j)*.012,rotation:Math.sin(j)*4};transforms['reveal'+j]={hub:t,title:{dx:t.dx,dy:t.dy}}}
 const manifest={source:{kind:'synthetic',id:'neutral-layered-v1',width:1200,height:800},objects,links,scenes,staticScene:'reveal14'};
 return {manifest,options:{title:'Multi-stakeholder tension',description:'Synthetic 14-constraint scene · engineering reference, not a visual benchmark',assets:{env:{data:'data:image/png;base64,'+raw,sha256:createHash('sha256').update(Buffer.from(raw,'base64')).digest('hex'),source:'Procedural 12×8 gradient, generated for this neutral fixture',permission:'cleared'}},transforms,highlights:{focus:['l0']},duration:320,interval:1000}};
}
