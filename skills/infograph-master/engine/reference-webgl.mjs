// Restricted, dependency-free opaque mechanical primitive renderer.
export function validateWebGLObject(o){
 if(o.fidelity!=='spatial'||o.geometry?.preset!=='mechanical-hub'||!o.material||o.material.opacity!==1)throw Error('WebGL adapter supports only opaque spatial mechanical-hub preset: '+o.id);
}
export function mountMechanicalHub(canvas,material,light){
 const gl=canvas.getContext('webgl',{alpha:true,antialias:true,premultipliedAlpha:false,preserveDrawingBuffer:true});
 if(!gl)throw Error('WebGL unavailable');
 const vertex='attribute vec3 p,n; attribute vec3 color; attribute vec2 mat; varying vec3 N,P,C; varying vec2 M; uniform float aspect; void main(){vec3 q=vec3(.866*p.x-.5*p.z,.25*p.x+.866*p.y+.433*p.z,.433*p.x-.5*p.y+.75*p.z); N=n; P=p; C=color; M=mat; gl_Position=vec4(q.x*.69/min(aspect,1.0),q.y*.69*min(aspect,1.0),q.z*.25,1.0); }';
 // Orthographic camera and direct-light GGX/Schlick BRDF; procedural reflection is not HDRI/IBL.
 const fragment='precision mediump float; varying vec3 N,P,C; varying vec2 M; uniform vec3 key; uniform float intensity,ambient; const float PI=3.14159265; vec3 direct(vec3 N,vec3 V,vec3 L,vec3 base,float metal,float rough,vec3 tint){vec3 H=normalize(L+V);float nl=max(dot(N,L),0.0),nv=max(dot(N,V),.001),nh=max(dot(N,H),0.0),vh=max(dot(V,H),0.0);float a=rough*rough,a2=a*a,d=nh*nh*(a2-1.0)+1.0;float D=a2/max(PI*d*d,.001);float k=(rough+1.0)*(rough+1.0)/8.0;float G=nl/(nl*(1.0-k)+k)*nv/(nv*(1.0-k)+k);vec3 F0=mix(vec3(.04),base,metal),F=F0+(1.0-F0)*pow(1.0-vh,5.0);return ((1.0-F)*(1.0-metal)*base/PI+D*G*F/max(4.0*nl*nv,.001))*nl*tint;} void main(){vec3 normal=normalize(N),view=normalize(vec3(-.433,.5,-.75));float rough=clamp(M.y,.12,1.0),metal=M.x;vec3 R=reflect(-view,normal);float band=pow(max(0.0,1.0-abs(R.y-.35)*3.0),2.0);vec3 env=mix(vec3(.035,.055,.08),vec3(.70,.82,.94),band);vec3 f0=mix(vec3(.04),C,metal);vec3 c=direct(normal,view,normalize(key),C,metal,rough,vec3(1.0,.86,.68)*intensity*3.0)+direct(normal,view,normalize(vec3(-.7,.5,.2)),C,metal,rough,vec3(.35,.65,1.0)*1.4)+C*(1.0-metal)*ambient*.25+env*f0*ambient*(1.0-.45*rough);c=c/(c+vec3(1.0));gl_FragColor=vec4(pow(max(c,vec3(0.0)),vec3(1.0/2.2)),1.0);}';
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
 cylinder(-.78,1.02,.14,dark,.35,.6);cylinder(-.65,.96,.11,steel,metal,rough);cylinder(-.56,.88,.06,gold,.7,.34);cylinder(-.47,.83,.12,dark,.45,.42);
 box(0,-.04,0,1.08,.8,.88,steel,metal,rough);box(0,.4,0,1.19,.10,.97,steel,metal,rough);box(0,.48,0,.96,.08,.78,dark,.45,.5);
 // opaque blue instrument panels (not optical glass)
 box(0,.02,-.446,.83,.48,.035,glass,.25,.22);box(-.546,.02,0,.035,.48,.62,glass,.25,.22);
 for(let i=0;i<4;i++){const x=i%2?.48:-.48,z=i<2?.39:-.39;box(x,-.02,z,.10,.77,.10,steel,metal,rough)}
 for(let i=0;i<12;i++){const a=i*Math.PI/6;cylinder(-.39,.035,.055,gold,.7,.32,.73*Math.cos(a),.73*Math.sin(a),12)}
 for(let i=0;i<5;i++)box(-.562,-.19+i*.07,0,.022,.017,.40,steel,metal,rough);
 const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data),gl.STATIC_DRAW);
 for(const [name,size,offset] of [['p',3,0],['n',3,3],['color',3,6],['mat',2,9]]){const loc=gl.getAttribLocation(pr,name);gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,size,gl.FLOAT,false,44,offset*4)}
 gl.enable(gl.DEPTH_TEST);gl.clearColor(0,0,0,0);
 function draw(){const w=Math.max(1,Math.round(canvas.clientWidth*Math.min(devicePixelRatio||1,2))),h=Math.max(1,Math.round(canvas.clientHeight*Math.min(devicePixelRatio||1,2)));if(canvas.width!==w)canvas.width=w;if(canvas.height!==h)canvas.height=h;gl.viewport(0,0,w,h);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.uniform1f(gl.getUniformLocation(pr,'aspect'),w/h);const a=(light.azimuth??315)*Math.PI/180;gl.uniform3f(gl.getUniformLocation(pr,'key'),Math.sin(a),.8,Math.cos(a));gl.uniform1f(gl.getUniformLocation(pr,'intensity'),light.intensity??.65);gl.uniform1f(gl.getUniformLocation(pr,'ambient'),light.ambient??.5);gl.drawArrays(gl.TRIANGLES,0,data.length/11);if(gl.getError()!==gl.NO_ERROR)throw Error('WebGL draw error');}
 draw();return {draw,dispose(){gl.deleteBuffer(buffer);gl.deleteProgram(pr)}};
}
