// Restricted, dependency-free opaque mechanical primitive renderer.
import {cameraBasis,validateGeometry} from './reference-geometry.mjs';
import {directionalKey} from './reference-lighting3d.mjs';
export function validateWebGLObject(o){
 validateGeometry(o);
}
export function mountMechanicalHub(canvas,material,light,geometry={preset:'mechanical-hub'},lighting3d={}){
 const gl=canvas.getContext('webgl',{alpha:true,antialias:true,premultipliedAlpha:false,preserveDrawingBuffer:true,stencil:!!lighting3d.shadow});
 if(!gl)throw Error('WebGL unavailable');
 if(lighting3d.shadow&&gl.getParameter(gl.STENCIL_BITS)<1)throw Error('planar shadow requires stencil buffer');
 const vertex='attribute vec3 p,n; attribute vec3 color; attribute vec2 mat; varying vec3 N,P,C; varying vec2 M; uniform float aspect,zoom,groundY; uniform mediump float shadowMode; uniform vec3 right,up,depth; uniform mediump vec3 key; void main(){vec3 pos=p;if(shadowMode>.5){pos.xz-=key.xz*(p.y-groundY)/key.y;pos.y=groundY;}vec3 q=vec3(dot(right,pos),dot(up,pos),dot(depth,pos)); N=n; P=p; C=color; M=mat; gl_Position=vec4(q.x*zoom/max(aspect,1.0),q.y*zoom*min(aspect,1.0),q.z*.25,1.0); }';
 // Orthographic camera and direct-light GGX/Schlick BRDF; procedural reflection is not HDRI/IBL.
 const fragment='precision mediump float; varying vec3 N,P,C; varying vec2 M; uniform vec3 key,viewDir; uniform float intensity,ambient,shadowMode,shadowOpacity,environmentEnabled,environmentStrength; uniform sampler2D environmentMap; const float PI=3.14159265; vec3 direct(vec3 N,vec3 V,vec3 L,vec3 base,float metal,float rough,vec3 tint){vec3 H=normalize(L+V);float nl=max(dot(N,L),0.0),nv=max(dot(N,V),.001),nh=max(dot(N,H),0.0),vh=max(dot(V,H),0.0);float a=rough*rough,a2=a*a,d=nh*nh*(a2-1.0)+1.0;float D=a2/max(PI*d*d,.001);float k=(rough+1.0)*(rough+1.0)/8.0;float G=nl/(nl*(1.0-k)+k)*nv/(nv*(1.0-k)+k);vec3 F0=mix(vec3(.04),base,metal),F=F0+(1.0-F0)*pow(1.0-vh,5.0);return ((1.0-F)*(1.0-metal)*base/PI+D*G*F/max(4.0*nl*nv,.001))*nl*tint;} void main(){if(shadowMode>.5){gl_FragColor=vec4(.015,.022,.035,shadowOpacity);return;}vec3 normal=normalize(N),view=normalize(viewDir);float rough=clamp(M.y,.12,1.0),metal=M.x;vec3 R=reflect(-view,normal);float band=pow(max(0.0,1.0-abs(R.y-.35)*3.0),2.0);vec3 env=mix(vec3(.035,.055,.08),vec3(.70,.82,.94),band);if(environmentEnabled>.5){vec2 uv=vec2(fract(atan(R.z,R.x)/(2.0*PI)+.5),asin(clamp(R.y,-1.0,1.0))/PI+.5);vec3 sampleColor=texture2D(environmentMap,uv,rough*4.0).rgb;env=pow(sampleColor,vec3(2.2))*environmentStrength;}vec3 f0=mix(vec3(.04),C,metal);vec3 c=direct(normal,view,normalize(key),C,metal,rough,vec3(1.0,.86,.68)*intensity*3.0)+direct(normal,view,normalize(vec3(-.7,.5,.2)),C,metal,rough,vec3(.35,.65,1.0)*1.4)+C*(1.0-metal)*ambient*.25+env*f0*ambient*(1.0-.45*rough);c=c/(c+vec3(1.0));gl_FragColor=vec4(pow(max(c,vec3(0.0)),vec3(1.0/2.2)),1.0);}';
 function shader(kind,src){const s=gl.createShader(kind);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s}
 const pr=gl.createProgram();gl.attachShader(pr,shader(gl.VERTEX_SHADER,vertex));gl.attachShader(pr,shader(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(pr);if(!gl.getProgramParameter(pr,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(pr));gl.useProgram(pr);
 const data=[],steel=[.32,.42,.49],dark=[.06,.11,.15],gold=[.64,.38,.13],glass=[.07,.25,.32],metal=material.metalness,rough=material.roughness;
 function tri(a,b,c,n,col,m,r){for(const v of [a,b,c])data.push(...v,...n,...col,m,r)}
 function quad(a,b,c,d,n,col,m,r){tri(a,b,c,n,col,m,r);tri(a,c,d,n,col,m,r)}
 function box(x,y,z,w,h,d,col,m,r){const a=x-w/2,b=x+w/2,c=y-h/2,e=y+h/2,f=z-d/2,g=z+d/2;
  quad([a,c,g],[b,c,g],[b,e,g],[a,e,g],[0,0,1],col,m,r);
  quad([b,c,f],[a,c,f],[a,e,f],[b,e,f],[0,0,-1],col,m,r);
  quad([b,c,g],[b,c,f],[b,e,f],[b,e,g],[1,0,0],col,m,r);
  quad([a,c,f],[a,c,g],[a,e,g],[a,e,f],[-1,0,0],col,m,r);
  quad([a,e,g],[b,e,g],[b,e,f],[a,e,f],[0,1,0],col,m,r);
  quad([a,c,f],[b,c,f],[b,c,g],[a,c,g],[0,-1,0],col,m,r);
 }
 function cylinder(y,r,h,col,m,rough,x=0,z=0,segments=48){const b=y-h/2,t=y+h/2;for(let i=0;i<segments;i++){const a=i*2*Math.PI/segments,k=(i+1)*2*Math.PI/segments,u=[x+r*Math.cos(a),z+r*Math.sin(a)],v=[x+r*Math.cos(k),z+r*Math.sin(k)],n=[Math.cos((a+k)/2),0,Math.sin((a+k)/2)];
  quad([u[0],b,u[1]],[v[0],b,v[1]],[v[0],t,v[1]],[u[0],t,u[1]],n,col,m,rough);
  tri([x,t,z],[u[0],t,u[1]],[v[0],t,v[1]],[0,1,0],col,m,rough);
  tri([x,b,z],[v[0],b,v[1]],[u[0],b,u[1]],[0,-1,0],col,m,rough)
 }}
 if(geometry.preset==='assembly'){for(const p of geometry.parts){const [x,y,z]=p.center;if(p.type==='box')box(x,y,z,...p.size,p.color,p.metalness,p.roughness);else cylinder(y,p.radius,p.height,p.color,p.metalness,p.roughness,x,z,p.segments??48)}}else{
 cylinder(-.78,1.02,.14,dark,.35,.6);cylinder(-.65,.96,.11,steel,metal,rough);cylinder(-.56,.88,.06,gold,.7,.34);cylinder(-.47,.83,.12,dark,.45,.42);
 box(0,-.04,0,1.08,.8,.88,steel,metal,rough);box(0,.4,0,1.19,.10,.97,steel,metal,rough);box(0,.48,0,.96,.08,.78,dark,.45,.5);
 // opaque blue instrument panels (not optical glass)
 box(0,.02,-.446,.83,.48,.035,glass,.25,.22);box(-.546,.02,0,.035,.48,.62,glass,.25,.22);
 for(let i=0;i<4;i++){const x=i%2?.48:-.48,z=i<2?.39:-.39;box(x,-.02,z,.10,.77,.10,steel,metal,rough)}
 for(let i=0;i<12;i++){const a=i*Math.PI/6;cylinder(-.39,.035,.055,gold,.7,.32,.73*Math.cos(a),.73*Math.sin(a),12)}
 for(let i=0;i<5;i++)box(-.562,-.19+i*.07,0,.022,.017,.40,steel,metal,rough);
 }
 const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data),gl.STATIC_DRAW);
 for(const [name,size,offset] of [['p',3,0],['n',3,3],['color',3,6],['mat',2,9]]){const loc=gl.getAttribLocation(pr,name);gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,size,gl.FLOAT,false,44,offset*4)}
 gl.enable(gl.DEPTH_TEST);gl.clearColor(0,0,0,0);
 const env=lighting3d.environment,tex=gl.createTexture();gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,tex);gl.pixelStorei(gl.UNPACK_ALIGNMENT,1);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,env?.width??1,env?.height??1,0,gl.RGB,gl.UNSIGNED_BYTE,new Uint8Array(env?.rgb??[0,0,0]));gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,env?gl.LINEAR_MIPMAP_LINEAR:gl.LINEAR);if(env)gl.generateMipmap(gl.TEXTURE_2D);gl.uniform1i(gl.getUniformLocation(pr,'environmentMap'),0);gl.uniform1f(gl.getUniformLocation(pr,'environmentEnabled'),env?1:0);gl.uniform1f(gl.getUniformLocation(pr,'environmentStrength'),env?.strength??1);
 let groundY=Infinity;for(let i=1;i<data.length;i+=11)groundY=Math.min(groundY,data[i]);groundY-=lighting3d.shadow?.groundOffset??.025;gl.uniform1f(gl.getUniformLocation(pr,'groundY'),groundY);gl.uniform1f(gl.getUniformLocation(pr,'shadowOpacity'),lighting3d.shadow?.opacity??0);const basis=cameraBasis(geometry.camera);for(const name of ['right','up','depth'])gl.uniform3fv(gl.getUniformLocation(pr,name),basis[name]);gl.uniform3fv(gl.getUniformLocation(pr,'viewDir'),basis.depth.map(x=>-x));gl.uniform1f(gl.getUniformLocation(pr,'zoom'),basis.zoom);
 function draw(){const w=Math.max(1,Math.round(canvas.clientWidth*Math.min(devicePixelRatio||1,2))),h=Math.max(1,Math.round(canvas.clientHeight*Math.min(devicePixelRatio||1,2)));if(canvas.width!==w)canvas.width=w;if(canvas.height!==h)canvas.height=h;gl.viewport(0,0,w,h);gl.stencilMask(255);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT|(lighting3d.shadow?gl.STENCIL_BUFFER_BIT:0));gl.uniform1f(gl.getUniformLocation(pr,'aspect'),w/h);gl.uniform3fv(gl.getUniformLocation(pr,'key'),directionalKey(light.azimuth??315,lighting3d.keyElevation??38.659808254));gl.uniform1f(gl.getUniformLocation(pr,'intensity'),light.intensity??.65);gl.uniform1f(gl.getUniformLocation(pr,'ambient'),light.ambient??.5);if(lighting3d.shadow){gl.disable(gl.DEPTH_TEST);gl.depthMask(false);gl.enable(gl.STENCIL_TEST);gl.stencilFunc(gl.EQUAL,0,255);gl.stencilOp(gl.KEEP,gl.KEEP,gl.INCR);gl.uniform1f(gl.getUniformLocation(pr,'shadowMode'),1);gl.drawArrays(gl.TRIANGLES,0,data.length/11);gl.disable(gl.STENCIL_TEST);gl.depthMask(true);gl.enable(gl.DEPTH_TEST);}gl.uniform1f(gl.getUniformLocation(pr,'shadowMode'),0);gl.drawArrays(gl.TRIANGLES,0,data.length/11);if(gl.getError()!==gl.NO_ERROR)throw Error('WebGL draw error');}
 draw();return {draw,dispose(){gl.deleteBuffer(buffer);gl.deleteTexture(tex);gl.deleteProgram(pr)}};
}
