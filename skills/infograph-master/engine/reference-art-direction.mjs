import {studioEnvironment} from './reference-lighting3d.mjs';
import {validateGeometry,projectedObjectPorts} from './reference-geometry.mjs';
const presets={
  "industrial": {
    "catalogId": "industrial",
    "intent": "Precision instrument, clear constraints",
    "palette": {
      "canvas": "#101c23",
      "ink": "#edf2f3",
      "muted": "#b9c8cc",
      "stage": "#152830",
      "edge": "#0d171d",
      "surface": "#20343d",
      "border": "#8da6ae",
      "brand": "#9dd4f3",
      "partner": "#a9d5b6",
      "external": "#ebc38d",
      "neutral": "#c4d0d3",
      "focus": "#ffb49a",
      "shadow": "#071117"
    },
    "font": "mono",
    "camera": {
      "azimuth": 38,
      "elevation": 38,
      "zoom": 0.72
    },
    "light": {
      "azimuth": 315,
      "intensity": 0.7,
      "ambient": 0.55
    },
    "environment": "cool",
    "strength": 1.7,
    "keyElevation": 58,
    "shadow": 0.38,
    "duration": 280,
    "interval": 1000,
    "scaleY": 1,
    "materials": {
      "body": {
        "color": [
          0.32,
          0.42,
          0.49
        ],
        "metalness": 0.83,
        "roughness": 0.3
      },
      "base": {
        "color": [
          0.065,
          0.105,
          0.13
        ],
        "metalness": 0.35,
        "roughness": 0.48
      },
      "accent": {
        "color": [
          0.56,
          0.36,
          0.17
        ],
        "metalness": 0.72,
        "roughness": 0.34
      },
      "panel": {
        "color": [
          0.06,
          0.23,
          0.33
        ],
        "metalness": 0.25,
        "roughness": 0.26
      }
    }
  },
  "cinematic": {
    "catalogId": "cinematic",
    "intent": "Dramatic silhouette, warm and cool highlights, deliberate reveal",
    "palette": {
      "canvas": "#100f15",
      "ink": "#f6eee2",
      "muted": "#c7bcc2",
      "stage": "#272431",
      "edge": "#111019",
      "surface": "#25232e",
      "border": "#9b899a",
      "brand": "#acccec",
      "partner": "#b1d5b5",
      "external": "#f0c58c",
      "neutral": "#e0d5ce",
      "focus": "#ffb09b",
      "shadow": "#0b0a10"
    },
    "font": "sans",
    "camera": {
      "azimuth": 52,
      "elevation": 25,
      "zoom": 0.81
    },
    "light": {
      "azimuth": 290,
      "intensity": 0.83,
      "ambient": 0.42
    },
    "environment": "warm",
    "strength": 2.3,
    "keyElevation": 42,
    "shadow": 0.56,
    "duration": 620,
    "interval": 1500,
    "scaleY": 1.12,
    "materials": {
      "body": {
        "color": [
          0.26,
          0.24,
          0.3
        ],
        "metalness": 0.86,
        "roughness": 0.22
      },
      "base": {
        "color": [
          0.035,
          0.045,
          0.075
        ],
        "metalness": 0.4,
        "roughness": 0.4
      },
      "accent": {
        "color": [
          0.72,
          0.42,
          0.12
        ],
        "metalness": 0.84,
        "roughness": 0.26
      },
      "panel": {
        "color": [
          0.035,
          0.15,
          0.24
        ],
        "metalness": 0.3,
        "roughness": 0.18
      }
    }
  },
  "architectural": {
    "catalogId": "architectural",
    "intent": "Neutral daylight model, restrained surfaces, structural clarity",
    "palette": {
      "canvas": "#f2efe7",
      "ink": "#242e30",
      "muted": "#4b5b5e",
      "stage": "#dedcd3",
      "edge": "#efede6",
      "surface": "#f8f6f0",
      "border": "#6d7978",
      "brand": "#295f81",
      "partner": "#386b51",
      "external": "#8a592d",
      "neutral": "#59686b",
      "focus": "#a3362d",
      "shadow": "#d4d4ca"
    },
    "font": "sans",
    "camera": {
      "azimuth": 45,
      "elevation": 52,
      "zoom": 0.75
    },
    "light": {
      "azimuth": 320,
      "intensity": 0.64,
      "ambient": 0.72
    },
    "environment": "cool",
    "strength": 1.05,
    "keyElevation": 65,
    "shadow": 0.23,
    "duration": 160,
    "interval": 1000,
    "scaleY": 0.82,
    "materials": {
      "body": {
        "color": [
          0.7,
          0.72,
          0.68
        ],
        "metalness": 0.05,
        "roughness": 0.77
      },
      "base": {
        "color": [
          0.48,
          0.5,
          0.47
        ],
        "metalness": 0.03,
        "roughness": 0.85
      },
      "accent": {
        "color": [
          0.45,
          0.49,
          0.43
        ],
        "metalness": 0.12,
        "roughness": 0.67
      },
      "panel": {
        "color": [
          0.36,
          0.48,
          0.52
        ],
        "metalness": 0.08,
        "roughness": 0.5
      }
    }
  }
};
const clone=x=>JSON.parse(JSON.stringify(x));
export const referenceDirectionIds=Object.freeze(Object.keys(presets));
export function referenceDirection(id){if(!Object.hasOwn(presets,id))throw Error('unknown reference art direction');return clone(presets[id]);}
const lum=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);
const pairs=[["ink","canvas",4.5],["muted","canvas",4.5],["ink","surface",4.5],["focus","canvas",3],["border","surface",3],["brand","stage",3],["brand","edge",3],["partner","stage",3],["partner","edge",3],["external","stage",3],["external","edge",3],["neutral","stage",3],["neutral","edge",3],["focus","stage",3],["focus","edge",3]];
const contrast=(p,a,b)=>(Math.max(lum(p[a]),lum(p[b]))+.05)/(Math.min(lum(p[a]),lum(p[b]))+.05);
export function directionContrast(id){const p=referenceDirection(id).palette;return pairs.map(([a,b,min])=>({fg:a,bg:b,min,ratio:contrast(p,a,b),pass:contrast(p,a,b)>=min}));}
export function directionCSS(id){
 const d=referenceDirection(id),p=d.palette;if(directionContrast(id).some(r=>!r.pass))throw Error('palette contrast failed');
 const font=d.font==='mono'?'ui-monospace, Consolas, monospace':'system-ui, sans-serif';
 return 'body{background:'+p.canvas+';color:'+p.ink+';font-family:'+font+'}p,.kicker,.note,.status{color:'+p.muted+'}.stage{background:radial-gradient(ellipse at center,'+p.stage+','+p.edge+');border-color:'+p.border+';border-radius:'+(id==='cinematic'?14:3)+'px}.object[data-role=environment] img{opacity:.025}.object[data-role=anchor]{background:'+p.surface+';color:'+p.ink+';border-color:var(--accent);border-radius:'+(id==='cinematic'?'10%':'3px')+'}.label{color:'+p.ink+';background:'+p.surface+';border-radius:3px}.gl-fallback{color:'+p.ink+';background:'+p.surface+';border-color:'+p.border+'}.brand{--accent:'+p.brand+'}.partner{--accent:'+p.partner+'}.external{--accent:'+p.external+'}.neutral{--accent:'+p.neutral+'}.link .shadow{stroke:'+p.shadow+'}.link.emphasis .core{stroke:'+p.focus+'}.controls button{background:'+p.surface+';color:'+p.ink+';border-color:'+p.border+'}.controls button:focus-visible,.stage:focus-visible,summary:focus-visible{outline-color:'+p.focus+'}details{border-color:'+p.border+'}.warning{color:'+p.ink+'}';
}
export function applyReferenceDirection(manifest,options,id,{objectId,partRoles}={}){
 const d=referenceDirection(id),m=clone(manifest),o=m.objects.find(x=>x.id===objectId);
 if(!o||o.geometry?.preset!=='assembly'||!partRoles||typeof partRoles!=='object')throw Error('explicit assembly and role map required');
 const parts=o.geometry.parts;if(Object.keys(partRoles).length!==parts.length||parts.some(p=>!Object.hasOwn(partRoles,p.id)||!Object.hasOwn(d.materials,partRoles[p.id])))throw Error('complete valid part role map required');
 const sy=d.scaleY;
 o.geometry={...o.geometry,camera:d.camera,parts:parts.map(p=>({...p,...d.materials[partRoles[p.id]],center:[p.center[0],p.center[1]*sy,p.center[2]],...(p.type==='box'?{size:[p.size[0],p.size[1]*sy,p.size[2]]}:{height:p.height*sy})})),ports3d:Object.fromEntries(Object.entries(o.geometry.ports3d??{}).map(([k,p])=>[k,[p[0],p[1]*sy,p[2]]]))};
 validateGeometry(o);projectedObjectPorts(o,m.source.width/m.source.height);
 return {manifest:m,options:{...options,webgl:true,referenceDirection:id,light:d.light,lighting3d:{keyElevation:d.keyElevation,environment:studioEnvironment({variant:d.environment,strength:d.strength}),shadow:{opacity:d.shadow}},duration:d.duration,interval:d.interval},report:{id,catalogId:d.catalogId,intent:d.intent,scope:'authored parameter bundle; no aesthetic certification'}};
}
