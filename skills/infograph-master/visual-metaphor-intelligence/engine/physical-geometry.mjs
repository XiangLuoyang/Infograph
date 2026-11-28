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
// Rich illustrative templates; selected explicitly, not inferred from role.
const richTemplates={
 "tank": {
  "shapes": [
   {
    "type": "path",
    "d": "M13 87 H87 L93 94 H7 Z",
    "fill": "metal",
    "stroke": "line",
    "sw": 1
   },
   {
    "type": "rect",
    "x": 18,
    "y": 16,
    "w": 64,
    "h": 72,
    "rx": 11,
    "fill": "metal",
    "stroke": "line",
    "sw": 1
   },
   {
    "type": "rect",
    "x": 24,
    "y": 23,
    "w": 52,
    "h": 58,
    "rx": 7,
    "fill": "surface",
    "stroke": "line",
    "sw": 1
   },
   {
    "type": "path",
    "d": "M25 51 Q38 45 50 51 Q62 57 75 51 V74 Q75 80 68 80 H32 Q25 80 25 74 Z",
    "fill": "accent",
    "stroke": "none",
    "sw": 0
   },
   {
    "type": "path",
    "d": "M27 27 Q31 24 38 24 H43 L29 48 Z",
    "fill": "highlight",
    "stroke": "none",
    "sw": 0
   },
   {
    "type": "rect",
    "x": 24,
    "y": 23,
    "w": 52,
    "h": 58,
    "rx": 7,
    "fill": "highlight",
    "stroke": "line",
    "sw": 0.8
   },
   {
    "type": "rect",
    "x": 33,
    "y": 8,
    "w": 34,
    "h": 11,
    "rx": 3,
    "fill": "metal",
    "stroke": "line",
    "sw": 1
   },
   {
    "type": "rect",
    "x": 39,
    "y": 4,
    "w": 22,
    "h": 6,
    "rx": 2,
    "fill": "metal",
    "stroke": "line",
    "sw": 1
   },
   {
    "type": "rect",
    "x": 80,
    "y": 61,
    "w": 15,
    "h": 13,
    "rx": 2,
    "fill": "metal",
    "stroke": "line",
    "sw": 1
   },
   {
    "type": "rect",
    "x": 91,
    "y": 59,
    "w": 6,
    "h": 17,
    "rx": 1,
    "fill": "metal",
    "stroke": "line",
    "sw": 1
   },
   {
    "type": "circle",
    "cx": 22,
    "cy": 19,
    "r": 1.8,
    "fill": "line",
    "stroke": "none",
    "sw": 0
   },
   {
    "type": "circle",
    "cx": 78,
    "cy": 19,
    "r": 1.8,
    "fill": "line",
    "stroke": "none",
    "sw": 0
   },
   {
    "type": "circle",
    "cx": 22,
    "cy": 84,
    "r": 1.8,
    "fill": "line",
    "stroke": "none",
    "sw": 0
   },
   {
    "type": "circle",
    "cx": 78,
    "cy": 84,
    "r": 1.8,
    "fill": "line",
    "stroke": "none",
    "sw": 0
   }
  ],
  "parts": [
   [
    0,
    "brushed-metal"
   ],
   [
    1,
    "brushed-metal"
   ],
   [
    3,
    "liquid"
   ],
   [
    5,
    "glass"
   ],
   [
    6,
    "brushed-metal"
   ],
   [
    8,
    "brushed-metal"
   ]
  ],
  "roles": [
   "buffer",
   "stock",
   "source",
   "container",
   "reservoir",
   "supply"
  ],
  "movingPart": null,
  "pivot": null
 },
 "handwheel-valve": {
  "shapes": [
   {
    "type": "rect",
    "x": 3,
    "y": 52,
    "w": 94,
    "h": 24,
    "rx": 6,
    "fill": "metal",
    "stroke": "line",
    "sw": 1
   },
   {
    "type": "rect",
    "x": 8,
    "y": 47,
    "w": 9,
    "h": 34,
    "rx": 2,
    "fill": "metal",
    "stroke": "line",
    "sw": 1
   },
   {
    "type": "rect",
    "x": 83,
    "y": 47,
    "w": 9,
    "h": 34,
    "rx": 2,
    "fill": "metal",
    "stroke": "line",
    "sw": 1
   },
   {
    "type": "path",
    "d": "M25 55 Q25 40 50 40 Q75 40 75 55 V73 Q75 86 50 86 Q25 86 25 73 Z",
    "fill": "metal",
    "stroke": "line",
    "sw": 1
   },
   {
    "type": "circle",
    "cx": 50,
    "cy": 64,
    "r": 17,
    "fill": "surface",
    "stroke": "line",
    "sw": 1
   },
   {
    "type": "rect",
    "x": 45,
    "y": 20,
    "w": 10,
    "h": 24,
    "rx": 2,
    "fill": "metal",
    "stroke": "line",
    "sw": 1
   },
   {
    "type": "rect",
    "x": 38,
    "y": 35,
    "w": 24,
    "h": 9,
    "rx": 2,
    "fill": "metal",
    "stroke": "line",
    "sw": 1
   },
   {
    "type": "circle",
    "cx": 50,
    "cy": 17,
    "r": 14,
    "fill": "accent",
    "stroke": "line",
    "sw": 1
   },
   {
    "type": "circle",
    "cx": 50,
    "cy": 17,
    "r": 9,
    "fill": "surface",
    "stroke": "line",
    "sw": 1
   },
   {
    "type": "path",
    "d": "M36 17 H64 M50 3 V31 M40 7 L60 27 M60 7 L40 27",
    "fill": "none",
    "stroke": "accent",
    "sw": 2.6
   },
   {
    "type": "circle",
    "cx": 50,
    "cy": 17,
    "r": 3,
    "fill": "metal",
    "stroke": "line",
    "sw": 1
   },
   {
    "type": "path",
    "d": "M38 64 H62",
    "fill": "none",
    "stroke": "accent",
    "sw": 5
   },
   {
    "type": "circle",
    "cx": 50,
    "cy": 64,
    "r": 3,
    "fill": "highlight",
    "stroke": "line",
    "sw": 1
   },
   {
    "type": "circle",
    "cx": 12,
    "cy": 51,
    "r": 1.8,
    "fill": "line",
    "stroke": "none",
    "sw": 0
   },
   {
    "type": "circle",
    "cx": 12,
    "cy": 77,
    "r": 1.8,
    "fill": "line",
    "stroke": "none",
    "sw": 0
   },
   {
    "type": "circle",
    "cx": 88,
    "cy": 51,
    "r": 1.8,
    "fill": "line",
    "stroke": "none",
    "sw": 0
   },
   {
    "type": "circle",
    "cx": 88,
    "cy": 77,
    "r": 1.8,
    "fill": "line",
    "stroke": "none",
    "sw": 0
   }
  ],
  "parts": [
   [
    0,
    "brushed-metal"
   ],
   [
    1,
    "brushed-metal"
   ],
   [
    2,
    "brushed-metal"
   ],
   [
    3,
    "brushed-metal"
   ],
   [
    5,
    "brushed-metal"
   ],
   [
    7,
    "matte-enamel"
   ],
   [
    10,
    "brushed-metal"
   ]
  ],
  "roles": [
   "actuator",
   "regulator",
   "controller",
   "control",
   "valve",
   "gate"
  ],
  "movingPart": 11,
  "pivot": [
   50,
   64
  ]
 },
 "manifold-four": {
  "shapes": [
   {
    "type": "rect",
    "x": 6,
    "y": 42,
    "w": 22,
    "h": 16,
    "rx": 2,
    "fill": "metal",
    "stroke": "line",
    "sw": 1
   },
   {
    "type": "rect",
    "x": 22,
    "y": 29,
    "w": 51,
    "h": 42,
    "rx": 5,
    "fill": "metal",
    "stroke": "line",
    "sw": 1
   },
   {
    "type": "rect",
    "x": 28,
    "y": 34,
    "w": 39,
    "h": 32,
    "rx": 4,
    "fill": "surface",
    "stroke": "line",
    "sw": 1
   },
   {
    "type": "path",
    "d": "M61 50 H76 V16 H89",
    "fill": "none",
    "stroke": "line",
    "sw": 5
   },
   {
    "type": "path",
    "d": "M61 50 H76 V16 H89",
    "fill": "none",
    "stroke": "metal",
    "sw": 3
   },
   {
    "type": "rect",
    "x": 86,
    "y": 12,
    "w": 10,
    "h": 8,
    "rx": 1,
    "fill": "metal",
    "stroke": "line",
    "sw": 1
   },
   {
    "type": "circle",
    "cx": 76,
    "cy": 16,
    "r": 2.4,
    "fill": "accent",
    "stroke": "line",
    "sw": 0.7
   },
   {
    "type": "path",
    "d": "M61 50 H76 V38 H89",
    "fill": "none",
    "stroke": "line",
    "sw": 5
   },
   {
    "type": "path",
    "d": "M61 50 H76 V38 H89",
    "fill": "none",
    "stroke": "metal",
    "sw": 3
   },
   {
    "type": "rect",
    "x": 86,
    "y": 34,
    "w": 10,
    "h": 8,
    "rx": 1,
    "fill": "metal",
    "stroke": "line",
    "sw": 1
   },
   {
    "type": "circle",
    "cx": 76,
    "cy": 38,
    "r": 2.4,
    "fill": "accent",
    "stroke": "line",
    "sw": 0.7
   },
   {
    "type": "path",
    "d": "M61 50 H76 V60 H89",
    "fill": "none",
    "stroke": "line",
    "sw": 5
   },
   {
    "type": "path",
    "d": "M61 50 H76 V60 H89",
    "fill": "none",
    "stroke": "metal",
    "sw": 3
   },
   {
    "type": "rect",
    "x": 86,
    "y": 56,
    "w": 10,
    "h": 8,
    "rx": 1,
    "fill": "metal",
    "stroke": "line",
    "sw": 1
   },
   {
    "type": "circle",
    "cx": 76,
    "cy": 60,
    "r": 2.4,
    "fill": "accent",
    "stroke": "line",
    "sw": 0.7
   },
   {
    "type": "path",
    "d": "M61 50 H76 V82 H89",
    "fill": "none",
    "stroke": "line",
    "sw": 5
   },
   {
    "type": "path",
    "d": "M61 50 H76 V82 H89",
    "fill": "none",
    "stroke": "metal",
    "sw": 3
   },
   {
    "type": "rect",
    "x": 86,
    "y": 78,
    "w": 10,
    "h": 8,
    "rx": 1,
    "fill": "metal",
    "stroke": "line",
    "sw": 1
   },
   {
    "type": "circle",
    "cx": 76,
    "cy": 82,
    "r": 2.4,
    "fill": "accent",
    "stroke": "line",
    "sw": 0.7
   },
   {
    "type": "circle",
    "cx": 26,
    "cy": 33,
    "r": 1.8,
    "fill": "line",
    "stroke": "none",
    "sw": 0
   },
   {
    "type": "circle",
    "cx": 69,
    "cy": 33,
    "r": 1.8,
    "fill": "line",
    "stroke": "none",
    "sw": 0
   },
   {
    "type": "circle",
    "cx": 26,
    "cy": 67,
    "r": 1.8,
    "fill": "line",
    "stroke": "none",
    "sw": 0
   },
   {
    "type": "circle",
    "cx": 69,
    "cy": 67,
    "r": 1.8,
    "fill": "line",
    "stroke": "none",
    "sw": 0
   }
  ],
  "parts": [
   [
    0,
    "brushed-metal"
   ],
   [
    1,
    "brushed-metal"
   ]
  ],
  "roles": [
   "distribution",
   "distributor",
   "branch",
   "sink",
   "channel",
   "output",
   "receiver",
   "consumer",
   "load"
  ],
  "branchCount": 4,
  "movingPart": null,
  "pivot": null
 },
 "dial-indicator": {
  "shapes": [
   {
    "type": "path",
    "d": "M42 79 H58 V94 H42 Z",
    "fill": "metal",
    "stroke": "line",
    "sw": 1
   },
   {
    "type": "rect",
    "x": 36,
    "y": 90,
    "w": 28,
    "h": 7,
    "rx": 2,
    "fill": "metal",
    "stroke": "line",
    "sw": 1
   },
   {
    "type": "circle",
    "cx": 50,
    "cy": 46,
    "r": 42,
    "fill": "metal",
    "stroke": "line",
    "sw": 1
   },
   {
    "type": "circle",
    "cx": 50,
    "cy": 46,
    "r": 35,
    "fill": "surface",
    "stroke": "line",
    "sw": 1
   },
   {
    "type": "path",
    "d": "M24 65 Q10 35 35 20 Q57 7 78 28 Q90 47 75 66",
    "fill": "none",
    "stroke": "line",
    "sw": 2
   },
   {
    "type": "path",
    "d": "M22 62 L28 58 M20 45 H27 M25 30 L31 34 M37 19 L40 25 M50 16 V23 M63 19 L60 25 M75 30 L69 34 M80 45 H73 M78 62 L72 58",
    "fill": "none",
    "stroke": "line",
    "sw": 1.7
   },
   {
    "type": "path",
    "d": "M47 48 L70 29 L53 49 Z",
    "fill": "accent",
    "stroke": "line",
    "sw": 0.5
   },
   {
    "type": "circle",
    "cx": 50,
    "cy": 46,
    "r": 5,
    "fill": "metal",
    "stroke": "line",
    "sw": 1
   },
   {
    "type": "path",
    "d": "M30 23 Q45 13 58 18",
    "fill": "none",
    "stroke": "highlight",
    "sw": 2.2
   },
   {
    "type": "circle",
    "cx": 50,
    "cy": 7,
    "r": 1.8,
    "fill": "line",
    "stroke": "none",
    "sw": 0
   },
   {
    "type": "circle",
    "cx": 50,
    "cy": 85,
    "r": 1.8,
    "fill": "line",
    "stroke": "none",
    "sw": 0
   }
  ],
  "parts": [
   [
    0,
    "brushed-metal"
   ],
   [
    1,
    "brushed-metal"
   ],
   [
    2,
    "brushed-metal"
   ],
   [
    6,
    "matte-enamel"
   ],
   [
    7,
    "brushed-metal"
   ]
  ],
  "roles": [
   "state",
   "indicator",
   "output",
   "measurement",
   "result",
   "outcome",
   "signal"
  ],
  "movingPart": 6,
  "pivot": [
   50,
   46
  ]
 }
};
Object.assign(templates,richTemplates);
export function geometryTemplate(kind){
 if(!Object.hasOwn(templates,kind))throw Error('unsupported geometry template');
 const t=templates[kind];
 return structuredClone({kind,...t,scope:'illustrative component only, not engineering geometry or measured values; confirm semantic correspondence; reservoir fill and tick marks are decorative and must not imply quantified capacity'});
}
export function geometryLibrary(){return Object.keys(templates).map(geometryTemplate)}

export function compilePhysicalGeometry(input,concept,corpus){
 if(!input.objects?.some(o=>o.geometry!==undefined))return input;
 const scene=JSON.parse(JSON.stringify(input)),parts=[],manifest=[],seen=new Set();
 for(const o of scene.objects){
  if(o.geometry===undefined)continue;
  const q=o.geometry,t=geometryTemplate(q.kind),target=concept.sceneObjects.find(x=>x.id===o.id);
  const valid=typeof q.ref==='string'&&q.ref.trim()&&typeof q.reason==='string'&&q.reason.trim()&&q.anchor&&target?.anchors?.some(a=>a.sourceId===q.anchor.sourceId&&a.nodeId===q.anchor.nodeId);
  if(!valid||o.shapes!==undefined||!t.roles)throw Error('explicit rich geometry binding required: '+o.id);
  const source=corpus.find(s=>s.id===q.anchor.sourceId)?.nodes.find(n=>n.id===q.anchor.nodeId);
  if(!source||!t.roles.includes(source.role))throw Error('geometry/source role mismatch: '+o.id);
  if(t.branchCount!==undefined&&(q.branchCount!==t.branchCount||typeof q.branchEvidence!=='string'||!q.branchEvidence.trim()))throw Error('explicit branch count evidence required: '+o.id);
  o.shapes=t.shapes;
  for(const [shapeIndex,material] of t.parts){const key=o.id+':'+shapeIndex;if(seen.has(key))throw Error('duplicate material');seen.add(key);parts.push({objectId:o.id,shapeIndex,material,encoding:'decorative-only',ref:q.ref})}
  manifest.push({objectId:o.id,kind:q.kind,sourceId:q.anchor.sourceId,nodeId:q.anchor.nodeId,sourceRole:source.role,ref:q.ref,reason:q.reason,branchCount:t.branchCount??null});
 }
 const existing=scene.surfaceRendering;
 if(existing&&(!Array.isArray(existing.parts)||existing.parts.some(p=>seen.has(p.objectId+':'+p.shapeIndex))))throw Error('invalid or duplicate authored/generated material binding');
 scene.surfaceRendering={version:existing?.version??1,rationale:existing?.rationale??'Illustrative physical geometry; decorative material only.',parts:[...(existing?.parts??[]),...parts],motions:existing?.motions??[]};
 scene.geometryManifest=manifest;
 return scene;
}
