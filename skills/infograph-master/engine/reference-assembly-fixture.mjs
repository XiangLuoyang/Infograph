import {referenceDemo} from './reference-renderer-fixture.mjs';
const material=(color,metalness,roughness)=>({color,metalness,roughness});
const steel=material([.32,.42,.49],.8,.28),dark=material([.045,.08,.12],.3,.58),bronze=material([.62,.36,.12],.72,.36),blue=material([.055,.23,.33],.22,.24);
const cylinder=(id,center,radius,height,mat,segments=64)=>({id,type:'cylinder',center,radius,height,segments,...mat});
const box=(id,center,size,mat)=>({id,type:'box',center,size,...mat});
export function assemblyDemo(){
 const {manifest,options}=referenceDemo(),hub=manifest.objects.find(o=>o.id==='hub');
 hub.fidelity='spatial';hub.material.metalness=.8;
 hub.geometry={preset:'assembly',camera:{azimuth:38,elevation:38,zoom:.72},ports3d:{},parts:[
 cylinder('base',[0,-.78,0],1.03,.14,dark),cylinder('platform',[0,-.64,0],.95,.13,steel),cylinder('rim',[0,-.54,0],.88,.06,bronze),
 box('chassis',[0,-.06,0],[1.06,.82,.86],steel),box('roof',[0,.39,0],[1.2,.11,.98],steel),box('cap',[0,.48,0],[.92,.08,.75],dark),
 box('panel-front',[0,.01,-.445],[.82,.47,.035],blue),box('panel-side',[-.545,.01,0],[.035,.47,.63],blue)
 ]};
 for(let i=0;i<14;i++){const a=i*Math.PI*2/14,center=[.83*Math.cos(a),-.45,.83*Math.sin(a)];hub.geometry.parts.push(cylinder('lug'+i,center,.065,.14,bronze,20));hub.geometry.ports3d['p'+i]=[center[0],-.38,center[2]];}
 for(let i=0;i<4;i++)hub.geometry.parts.push(box('frame'+i,[i%2?.49:-.49,-.02,i<2?.39:-.39],[.10,.79,.1],steel));
 return {manifest,options:{...options,webgl:true,title:'Reference assembly / projected anchors',description:'Neutral mechanical composition · physical geometry with qualitative constraints'}};
}
