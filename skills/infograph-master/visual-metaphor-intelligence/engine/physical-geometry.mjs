// Normalized decorative construction templates. No inference of source physics.
const rect=(x,y,w,h,rx,fill,stroke='line',sw=1)=>({type:'rect',x,y,w,h,rx,fill,stroke,sw});
const circle=(cx,cy,r,fill,stroke='line',sw=1)=>({type:'circle',cx,cy,r,fill,stroke,sw});
const path=(d,fill,stroke='line',sw=1)=>({type:'path',d,fill,stroke,sw});
const templates={
 rotor:{
  shapes:[rect(5,5,90,90,8,'surface'),circle(50,50,42,'metal'),circle(50,50,36,'surface'),circle(50,50,30,'metal'),path('M50 22 L57 42 L78 50 L57 58 L50 78 L43 58 L22 50 L43 42 Z','accent'),circle(50,50,13,'metal'),circle(50,50,5,'highlight'),...[[12,12],[88,12],[12,88],[88,88]].map(([x,y])=>circle(x,y,2.5,'line'))],
  parts:[[1,'brushed-metal'],[3,'brushed-metal'],[4,'matte-enamel'],[5,'brushed-metal']],movingPart:4,pivot:[50,50]
 },
 reservoir:{
  shapes:[rect(18,12,64,77,12,'metal'),rect(24,19,52,62,8,'surface'),rect(25,51,50,29,6,'accent'),rect(24,19,52,62,8,'highlight','line',.7),path('M26 25 L33 20 H42 L28 45 Z','highlight','none',0),rect(32,5,36,10,2,'metal'),rect(40,88,20,8,2,'metal'),rect(15,89,70,5,2,'line'),path('M31 32 H39 M31 43 H39 M31 54 H39 M31 65 H39','none','line',1)],
  parts:[[0,'brushed-metal'],[2,'liquid'],[3,'glass'],[5,'brushed-metal'],[6,'brushed-metal']],movingPart:null,pivot:null
 },
 valve:{
  shapes:[rect(3,42,94,30,6,'metal'),rect(10,36,10,42,2,'metal'),rect(80,36,10,42,2,'metal'),circle(50,57,24,'metal'),circle(50,57,16,'surface'),rect(45,14,10,31,2,'metal'),circle(50,16,13,'accent'),path('M39 16 H61 M50 5 V27','none','line',2),rect(40,52,20,10,2,'accent'),...[[15,40],[15,74],[85,40],[85,74]].map(([x,y])=>circle(x,y,2,'line'))],
  parts:[[0,'brushed-metal'],[1,'brushed-metal'],[2,'brushed-metal'],[3,'brushed-metal'],[5,'brushed-metal'],[6,'matte-enamel'],[8,'matte-enamel']],movingPart:8,pivot:[50,57]
 }
};
export function geometryTemplate(kind){
 if(!Object.hasOwn(templates,kind))throw Error('unsupported geometry template');
 const t=templates[kind];
 return structuredClone({kind,...t,scope:'illustrative component only, not engineering geometry or measured values; confirm semantic correspondence; reservoir fill and tick marks are decorative and must not imply quantified capacity'});
}
export function geometryLibrary(){return Object.keys(templates).map(geometryTemplate)}
