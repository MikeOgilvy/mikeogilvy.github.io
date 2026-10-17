import{C as e,D as t,E as n,O as r,S as i,T as a,_ as o,a as s,b as c,c as l,d as u,f as d,g as f,h as p,i as m,j as h,k as g,l as _,m as v,n as y,o as b,p as x,r as S,s as C,t as w,u as T,v as E,w as D,x as O,y as k}from"./Mouse.js";var A=h(S(),1),j=(e,t,n,r,i)=>(e-t)*(i-r)/(n-t)+r,M=class{constructor(e){this.scene=e,this.renderer=e.renderer,this.gl=this.gl,this.camera=e.camera,this.lastTime=0,this.everRendered=!1,this.ringPos=new t(0,0),this.cursorPos=new t(0,0),this.colorScheme=e.theme===`dark`?0:1,this.particleScale=this.scene.renderer.domElement.width/this.scene.pixelRatio/2e3*this.scene.particlesScale,this.createPoints(),this.init()}createPoints(){let e=new A.default({shape:[500,500],minDistance:j(this.scene.density,0,300,10,2),maxDistance:j(this.scene.density,0,300,11,3),tries:20}).fill();this.pointsData=[];for(let t=0;t<e.length;t++)this.pointsData.push(e[t][0]-250,e[t][1]-250);this.count=this.pointsData.length/2}createDataTexturePosition(){let e=new Float32Array(this.length*4);for(let t=0;t<this.count;t++){let n=t*4;e[n+0]=this.pointsData[t*2+0]*(1/250),e[n+1]=this.pointsData[t*2+1]*(1/250),e[n+2]=0,e[n+3]=0}let t=new d(e,this.size,this.size,i,x);return t.needsUpdate=!0,t}createRenderTarget(){return new g(this.size,this.size,{wrapS:D,wrapT:D,minFilter:o,magFilter:o,texture:this.posTex,format:i,type:v,depthBuffer:!1,stencilBuffer:!1})}init(){this.size=256,this.length=this.size*this.size,this.posTex=this.createDataTexturePosition(),this.rt1=this.createRenderTarget(),this.rt2=this.createRenderTarget(),this.renderer.setRenderTarget(this.rt1),this.renderer.setClearColor(0,0),this.renderer.clear(),this.renderer.setRenderTarget(this.rt2),this.renderer.setClearColor(0,0),this.renderer.clear(),this.renderer.setRenderTarget(null),this.noise=new y,this.simScene=new a,this.simCamera=new E(-1,1,1,-1,0,1),this.simMaterial=new n({uniforms:{uPosition:{value:this.posTex},uPosRefs:{value:this.posTex},uRingPos:{value:new t(0,0)},uRingRadius:{value:.2},uDeltaTime:{value:0},uRingWidth:{value:.05},uRingWidth2:{value:.015},uRingDisplacement:{value:this.scene.ringDisplacement},uTime:{value:0}},vertexShader:`
                void main() {
                    gl_Position = vec4(position, 1.0);
                }
            `,fragmentShader:`
                precision highp float;
                uniform sampler2D uPosition;
                uniform sampler2D uPosRefs;
                uniform vec2 uRingPos;
                uniform float uTime;
                uniform float uDeltaTime;
                uniform float uRingRadius;

                uniform float uRingWidth;
                uniform float uRingWidth2;
                uniform float uRingDisplacement;

                ${m.noise}

                void main() {

                    vec2 simTexCoords = gl_FragCoord.xy / vec2(${this.size.toFixed(1)}, ${this.size.toFixed(1)});
                    vec4 pFrame = texture2D(uPosition, simTexCoords);
                    // float pTime = pFrame.w - uDeltaTime;

                    float scale = pFrame.z;
                    float velocity = pFrame.w;
                    vec2 refPos = texture2D(uPosRefs, simTexCoords).xy;

                    float time = uTime * .5;
                    vec2 curentPos = refPos;

                    vec2 pos = pFrame.xy;
                    pos *= .8;

                    float dist = distance(curentPos.xy, uRingPos);
                    float noise0 = snoise(vec3(curentPos.xy * .2 + vec2(18.4924, 72.9744), time * 0.5));
                    float dist1 = distance(curentPos.xy + (noise0 * .005), uRingPos);


                    float t = smoothstep(uRingRadius - (uRingWidth * 2.), uRingRadius, dist) - smoothstep(uRingRadius, uRingRadius + uRingWidth, dist1);
                    float t2 = smoothstep(uRingRadius - (uRingWidth2 * 2.), uRingRadius, dist) - smoothstep(uRingRadius, uRingRadius + uRingWidth2, dist1);
                    float t3 = smoothstep(uRingRadius + uRingWidth2, uRingRadius, dist);

                    t = pow(t, 2.);
                    t2 = pow(t2, 3.);

                    t += t2 * 3.;
                    t += t3 * .4;
                    t += snoise(vec3(curentPos.xy * 30. + vec2(11.4924, 12.9744), time * 0.5)) * t3 * .5;

                    float nS = snoise(vec3(curentPos.xy * 2. + vec2(18.4924, 72.9744), time * 0.5));
                    t += pow((nS + 1.5) * .5, 2.) * .6;

                    // Mid scale noise
                    float noise1 = snoise(vec3(curentPos.xy * 4. + vec2(88.494, 32.4397), time * 0.35));
                    float noise2 = snoise(vec3(curentPos.xy * 4. + vec2(50.904, 120.947), time * 0.35));

                    // Close scale noise
                    float noise3 = snoise(vec3(curentPos.xy * 20. + vec2(18.4924, 72.9744), time * .5));
                    float noise4 = snoise(vec3(curentPos.xy * 20. + vec2(50.904, 120.947), time * .5));

                    // Far scale noise
                    // float noise5 = snoise(vec3(curentPos.xy * .5 + vec2(89.4924, 12.9744), time * 0.1));
                    // float noise6 = snoise(vec3(curentPos.xy * .5 + vec2(70.904, 120.947), time * 0.1));

                    vec2 disp = vec2(noise1, noise2) * .03;
                    disp += vec2(noise3, noise4) * .005;
                    // disp += vec2(noise5, noise6) * .05;

                    // Sin wave
                    disp.x += sin((refPos.x * 20.) + (time * 4.)) * .02 * clamp(dist, 0., 1.);
                    disp.y += cos((refPos.y * 20.) + (time * 3.)) * .02 * clamp(dist, 0., 1.);

                    pos -= (uRingPos - (curentPos + disp)) * pow(t2, .75) * uRingDisplacement;

                    // Add min scale
                    // t += .25;


                    // Add scale
                    float scaleDiff = t - scale;
                    scaleDiff *= .2;
                    scale += scaleDiff;


                    // Final position
                    vec2 finalPos = curentPos + disp + (pos * .25);

                    velocity *= .5;
                    velocity += scale * .25;

                    vec4 frame = vec4(finalPos, scale, velocity);

                    gl_FragColor = frame;

                }
            `});let e=new p(new c(2,2),this.simMaterial);this.simScene.add(e);let r=new l,i=new Float32Array(this.count*2),o=new Float32Array(this.count*3),s=new Float32Array(this.count*4);for(let e=0;e<this.count;e++){let t=e%this.size,n=Math.floor(e/this.size);i[e*2]=t/this.size,i[e*2+1]=n/this.size}for(let e=0;e<this.count;e++)s[e*4]=Math.random(),s[e*4+1]=Math.random(),s[e*4+2]=Math.random(),s[e*4+3]=Math.random();r.setAttribute(`position`,new C(o,3)),r.setAttribute(`uv`,new C(i,2)),r.setAttribute(`seeds`,new C(s,4)),this.renderMaterial=new n({uniforms:{uPosition:{value:this.posTex},uTime:{value:0},uColor1:{value:new T(this.scene.colorControls.color1)},uColor2:{value:new T(this.scene.colorControls.color2)},uColor3:{value:new T(this.scene.colorControls.color3)},uAlpha:{value:1},uRingPos:{value:new t(0,0)},uRez:{value:new t(this.scene.renderer.domElement.width,this.scene.renderer.domElement.height)},uParticleScale:{value:this.particleScale},uPixelRatio:{value:this.scene.pixelRatio},uColorScheme:{value:this.colorScheme}},vertexShader:`
                precision highp float;
                attribute vec4 seeds;

                uniform sampler2D uPosition;
                uniform float uTime;
                uniform float uParticleScale;
                uniform float uPixelRatio;
                uniform int uColorScheme;

                varying vec4 vSeeds;
                varying float vVelocity;
                varying vec2 vLocalPos;
                varying vec2 vScreenPos;
                varying float vScale;

                void main() {

                    vec4 pos = texture2D(uPosition, uv);
                    vSeeds = seeds;

                    vVelocity = pos.w;
                    vScale = pos.z;
                    vLocalPos = pos.xy;
                    vec4 viewSpace  = modelViewMatrix * vec4(vec3(pos.xy, 0.), 1.0);

                    gl_Position = projectionMatrix * viewSpace;
                    vScreenPos = gl_Position.xy;

                    gl_PointSize = ((vScale * 7.) * (uPixelRatio * 0.5) * uParticleScale);

                }
            `,fragmentShader:`
                precision highp float;

                varying vec4 vSeeds;
                varying vec2 vScreenPos;
                varying vec2 vLocalPos;
                varying float vScale;
                varying float vVelocity;

                uniform vec3 uColor1;
                uniform vec3 uColor2;
                uniform vec3 uColor3;

                uniform vec2 uRingPos;
                uniform vec2 uRez;

                uniform float uAlpha;
                uniform float uTime;

                uniform int uColorScheme;

                ${m.noise}

                #define PI 3.1415926535897932384626433832795

                float sdRoundBox( in vec2 p, in vec2 b, in vec4 r )
                {
                    r.xy = (p.x>0.0)?r.xy : r.zw;
                    r.x  = (p.y>0.0)?r.x  : r.y;
                    vec2 q = abs(p)-b+r.x;
                    return min(max(q.x,q.y),0.0) + length(max(q,0.0)) - r.x;
                }

                // rotate uv by angle
                vec2 rotate(vec2 v, float a) {
                    float s = sin(a);
                    float c = cos(a);
                    mat2 m = mat2(c, s, -s, c);
                    return m * v;
                }

                void main() {

                    float uBorderSize = 0.2;
                    vec2 center = vec2(.48, .4);
                    float ratio = uRez.x / uRez.y;

                    // Noise
                    float noiseAngle = snoise(vec3(vLocalPos * 10. + vec2(18.4924, 72.9744), uTime * .85));
                    float noiseColor = snoise(vec3(vLocalPos * 2. + vec2(74.664, 91.556), uTime * .5));
                    noiseColor = (noiseColor + 1.) * .5;

                    // get angle between
                    float angle = atan(vLocalPos.y - uRingPos.y, vLocalPos.x - uRingPos.x);

                    vec2 uv = gl_PointCoord.xy;
                    uv -= vec2(0.5);
                    uv.y *= -1.;
                    uv = rotate(uv, -angle + (noiseAngle * .5));

                    vec2 tuv = vScreenPos;
                    tuv = rotate(tuv, uTime * 1.);
                    tuv.y *= 1./ratio;
                    tuv += .5;

                    float h = 0.8; // adjust position of middleColor
                    float progress = smoothstep(0., .75, pow(noiseColor, 2.));
                    vec3 col = mix(mix(uColor1, uColor2, progress/h), mix(uColor2, uColor3, (progress - h)/(1.0 - h)), step(h, progress));
                    vec3 color = col;

                    float dist = sqrt(dot(uv, uv));

                    float dr = .5;
                    float t = smoothstep(dr+(uBorderSize + .0001), dr-uBorderSize, dist);
                    t = clamp(t, 0., 1.);

                    float rounded = sdRoundBox(uv, vec2(0.5, 0.2), vec4(.25));
                    rounded = smoothstep(.1, 0., rounded);

                    float a = uAlpha * rounded * smoothstep(0.1, 0.2, vScale);

                    if(a < 0.01){
                        discard;
                    }

                    color = clamp(color, 0., 1.);
                    color = mix(color, color * clamp(vVelocity, 0., 1.), float(uColorScheme));

                    gl_FragColor = vec4(color, clamp(a, 0., 1.));

                    #ifdef SRGB_TRANSFER
                        gl_FragColor = sRGBTransferOETF( gl_FragColor );
                    #endif

                }
            `,transparent:!0,depthTest:!1,depthWrite:!1}),this.mesh=new O(r,this.renderMaterial),this.mesh.position.set(0,0,0),this.mesh.scale.set(5,5,5),this.scene.scene.add(this.mesh)}resize(){this.renderMaterial.uniforms.uRez.value=new t(this.scene.renderer.domElement.width,this.scene.renderer.domElement.height),this.renderMaterial.uniforms.uPixelRatio.value=this.scene.pixelRatio}update(){let e=this.scene.clock.getElapsedTime()-this.lastTime;this.lastTime=this.scene.clock.getElapsedTime();let t=(this.noise.getVal(this.scene.time*.66+94.234)-.5)*2,n=(this.noise.getVal(this.scene.time*.75+21.028)-.5)*2;this.cursorPos.set(t*.2,n*.1),this.scene.isIntersecting?(this.cursorPos.set(this.scene.intersectionPoint.x*.175+t*.1,this.scene.intersectionPoint.y*.175+n*.1),this.ringPos.set(this.ringPos.x+(this.cursorPos.x-this.ringPos.x)*.02,this.ringPos.y+(this.cursorPos.y-this.ringPos.y)*.02)):(this.cursorPos.set(t*.2,n*.1),this.ringPos.set(this.ringPos.x+(this.cursorPos.x-this.ringPos.x)*.01,this.ringPos.y+(this.cursorPos.y-this.ringPos.y)*.01)),this.particleScale=this.scene.renderer.domElement.width/this.scene.pixelRatio/2e3*this.scene.particlesScale,this.simMaterial.uniforms.uPosition.value=this.everRendered?this.rt1.texture:this.posTex,this.simMaterial.uniforms.uTime.value=this.scene.clock.getElapsedTime(),this.simMaterial.uniforms.uDeltaTime.value=e,this.simMaterial.uniforms.uRingRadius.value=.175+Math.sin(this.scene.time*1)*.03+Math.cos(this.scene.time*3)*.02,this.simMaterial.uniforms.uRingPos.value=this.ringPos,this.simMaterial.uniforms.uRingWidth.value=this.scene.ringWidth,this.simMaterial.uniforms.uRingWidth2.value=this.scene.ringWidth2,this.simMaterial.uniforms.uRingDisplacement.value=this.scene.ringDisplacement,this.renderer.setRenderTarget(this.rt2),this.renderer.render(this.simScene,this.simCamera),this.renderer.setRenderTarget(null),this.renderMaterial.uniforms.uPosition.value=this.everRendered?this.rt2.texture:this.posTex,this.renderMaterial.uniforms.uTime.value=this.scene.clock.getElapsedTime(),this.renderMaterial.uniforms.uRingPos.value=this.ringPos,this.renderMaterial.uniforms.uParticleScale.value=this.particleScale}postRender(){let e=this.rt1;this.rt1=this.rt2,this.rt2=e,this.everRendered=!0}kill(){this.mesh.geometry.dispose(),this.mesh.material.dispose(),this.rt1.dispose(),this.rt2.dispose(),this.posTex.dispose(),this.simMaterial.dispose(),this.renderMaterial.dispose()}},N=class{constructor(n){let i=typeof window<`u`&&window.matchMedia(`(hover: hover) and (pointer: fine)`).matches,o=i?2:1.5;this.loaded=!1,this.texture=null,this.options=n,this.theme=n.theme||`dark`,this.interactive=!!n.interactive,this.options.background=this.theme===`dark`?new T(0):new T(16777215),this.pixelRatio=Math.min(n.pixelRatio||window.devicePixelRatio||1,o),this.particlesScale=n.particlesScale||1;let s=n.density||200;this.density=i?s:Math.min(s,140),this.verbose=n.verbose||!1,this.scene=new a,this.scene.background=null,this.canvas=document.createElement(`canvas`),this.options.container.appendChild(this.canvas),this.canvas.width=this.options.container.offsetWidth,this.canvas.height=this.options.container.offsetHeight,this.canvasRect=null,this.rectDirty=!0,u.enabled=!1,this.renderer=new b({canvas:this.canvas,antialias:i,alpha:!0,powerPreference:`high-performance`,preserveDrawingBuffer:!1,stencil:!1,precision:`highp`}),this.gl=this.renderer.getContext(),this.renderer.extensions.get(`EXT_color_buffer_float`),this.renderer.setSize(this.canvas.width,this.canvas.height),this.renderer.setPixelRatio(this.pixelRatio),this.onWindowResize=this.onWindowResize.bind(this),this.onWindowScroll=()=>{this.rectDirty=!0},this.initCamera(),this.initScene(),this.initEvents(),this.clock=new _,this.time=0,this.lastTime=0,this.dt=0,this.skipFrame=!1,this.isPaused=!1,this.raycaster=new e,this.mouse=new t,this.intersectionPoint=new r,this.isIntersecting=!1,this.mouseIsOver=!1,this.raycastPlane=new p(new c(12.5,12.5),new f({color:16711680,visible:!1,side:2})),this.scene.add(this.raycastPlane)}initEvents(){window.addEventListener(`resize`,this.onWindowResize,{passive:!0}),this.interactive&&window.addEventListener(`scroll`,this.onWindowScroll,{passive:!0})}onWindowResize(){this.rectDirty=!0,this.canvas.width=this.options.container.offsetWidth,this.canvas.height=this.options.container.offsetHeight,this.renderer.setSize(this.canvas.width,this.canvas.height),this.camera.aspect=this.canvas.width/this.canvas.height,this.camera.updateProjectionMatrix(),this.particles&&this.particles.resize()}initCamera(){this.camera=new k(40,this.gl.drawingBufferWidth/this.gl.drawingBufferHeight,.1,1e3),this.camera.position.z=3.1}initScene(){let cl=this.options.colorsLight||{color1:`#059669`,color2:`#0284c7`,color3:`#10b981`},cd=this.options.colorsDark||{color1:`#34d399`,color2:`#38bdf8`,color3:`#064e3b`};this.colorControls={color1:this.theme===`dark`?cd.color1:cl.color1,color2:this.theme===`dark`?cd.color2:cl.color2,color3:this.theme===`dark`?cd.color3:cl.color3};if(this.theme===`dark`){this.ringWidth=this.options.ringWidth||.15;this.ringWidth2=this.options.ringWidth2||.05;this.ringDisplacement=this.options.ringDisplacement||.23;this.particlesScale=this.options.particlesScale||.65;}else{this.ringWidth=this.options.ringWidth||.006;this.ringWidth2=this.options.ringWidth2||.107;this.ringDisplacement=this.options.ringDisplacement||.62;this.particlesScale=this.options.particlesScale||.59;}this.initParticles();this.options.gui&&this.initGUI();this.onLoaded()}setTheme(newTheme){this.theme=newTheme;let cl=this.options.colorsLight||{color1:`#059669`,color2:`#0284c7`,color3:`#10b981`},cd=this.options.colorsDark||{color1:`#34d399`,color2:`#38bdf8`,color3:`#064e3b`};this.colorControls={color1:newTheme===`dark`?cd.color1:cl.color1,color2:newTheme===`dark`?cd.color2:cl.color2,color3:newTheme===`dark`?cd.color3:cl.color3};if(newTheme===`dark`){this.ringWidth=.15;this.ringWidth2=.05;this.ringDisplacement=.23;this.particlesScale=.65;}else{this.ringWidth=.006;this.ringWidth2=.107;this.ringDisplacement=.62;this.particlesScale=.59;}if(this.particles&&this.particles.renderMaterial){this.particles.colorScheme=newTheme===`dark`?0:1;this.particles.renderMaterial.uniforms.uColor1.value.set(new T(this.colorControls.color1));this.particles.renderMaterial.uniforms.uColor2.value.set(new T(this.colorControls.color2));this.particles.renderMaterial.uniforms.uColor3.value.set(new T(this.colorControls.color3));this.particles.renderMaterial.uniforms.uColorScheme.value=this.particles.colorScheme;}}initParticles(){this.particles=new M(this)}initGUI(){this.gui=new s({autoPlace:!1}),this.options.container.appendChild(this.gui.domElement),this.gui.domElement.style.position=`absolute`,this.gui.domElement.style.top=`0`,this.gui.domElement.style.right=`0`,this.gui.domElement.style.zIndex=`1000`;let e=this.gui.addFolder(`Colors`);e.addColor(this.colorControls,`color1`).name(`Color 1`).onChange(e=>{this.particles.renderMaterial.uniforms.uColor1.value.set(new T(e))}),e.addColor(this.colorControls,`color2`).name(`Color 2`).onChange(e=>{this.particles.renderMaterial.uniforms.uColor2.value.set(new T(e))}),e.addColor(this.colorControls,`color3`).name(`Color 3`).onChange(e=>{this.particles.renderMaterial.uniforms.uColor3.value.set(new T(e))}),e.add(this,`ringWidth`).name(`Ring Width`).min(.001).max(.2).step(.001).onChange(e=>{this.ringWidth=e}),e.add(this,`ringWidth2`).name(`Ring Width 2`).min(.001).max(.2).step(.001).onChange(e=>{this.ringWidth2=e}),e.add(this,`particlesScale`).name(`Particles Scale`).min(.1).max(2).step(.01).onChange(e=>{this.particlesScale=e}),e.add(this,`ringDisplacement`).name(`Displacement`).min(.01).max(1).step(.01).onChange(e=>{this.ringDisplacement=e}),e.add(this,`density`).name(`Density`).min(100).max(300).step(10).onChange(e=>{this.density=e,this.verbose,this.killParticles(),this.initParticles()}),e.open()}stop(){this.isPaused=!0,this.clock.stop(),this.verbose}resume(){this.isPaused=!1,this.clock.start(),this.verbose}killParticles(){this.scene.remove(this.particles.mesh),this.particles.kill()}kill(){this.stop(),window.removeEventListener(`resize`,this.onWindowResize),window.removeEventListener(`scroll`,this.onWindowScroll),this.raycastPlane&&(this.scene.remove(this.raycastPlane),this.raycastPlane.geometry.dispose(),this.raycastPlane.material.dispose()),this.renderer&&this.renderer.dispose(),this.canvas&&this.canvas.parentElement&&this.canvas.parentElement.removeChild(this.canvas)}onLoaded(){this.loaded=!0}preRender(){if(this.dt=this.clock.getElapsedTime()-this.lastTime,this.lastTime=this.clock.getElapsedTime(),this.time+=this.dt,this.particles.update(),!this.interactive){this.isIntersecting=!1;return}if(this.skipFrame=!this.skipFrame,this.skipFrame||!w.hasMoved)return;(this.rectDirty||!this.canvasRect)&&(this.canvasRect=this.canvas.getBoundingClientRect(),this.rectDirty=!1);let e=this.canvasRect;if(!e.width||!e.height){this.mouseIsOver=!1,this.isIntersecting=!1;return}if(this.mouse.x=(w.cursor.x-e.left)*(w.screenWidth/e.width),this.mouse.y=(w.cursor.y-e.top)*(w.screenHeight/e.height),this.mouse.x=this.mouse.x/w.screenWidth*2-1,this.mouse.y=-(this.mouse.y/w.screenHeight)*2+1,this.mouse.x<-1||this.mouse.x>1||this.mouse.y<-1||this.mouse.y>1){this.mouseIsOver=!1,this.isIntersecting=!1;return}this.mouseIsOver=!0,this.raycaster.setFromCamera(this.mouse,this.camera);let t=this.raycaster.intersectObject(this.raycastPlane);t.length>0?(this.intersectionPoint.copy(t[0].point),this.isIntersecting=!0):this.isIntersecting=!1}render(){!this.loaded||this.isPaused||(this.preRender(),this.renderer.setRenderTarget(null),this.renderer.autoClear=!1,this.renderer.clear(),this.renderer.render(this.scene,this.camera),this.postRender())}postRender(){this.particles.postRender()}},P=0,F=()=>{P=0},I=()=>!!document.querySelector(`[data-custom-select-open="true"], .header.menu-open, dialog[open]`);typeof window<`u`&&(window.addEventListener(`pointerdown`,F,{passive:!0,capture:!0}),window.addEventListener(`touchstart`,F,{passive:!0,capture:!0}),window.addEventListener(`keydown`,F,{passive:!0,capture:!0}));
let currentAntigravityInstance=null;
function detectTheme(){
    let docEl=document.documentElement;
    let t=docEl.getAttribute(`data-theme`)||(document.body&&document.body.getAttribute(`data-theme`));
    if(t===`dark`)return `dark`;
    if(t===`light`)return `light`;
    if(document.body&&document.body.classList.contains(`dark`))return `dark`;
    if(localStorage.getItem(`pref-theme`)===`dark`)return `dark`;
    if(localStorage.getItem(`pref-theme`)===`light`)return `light`;
    return(window.matchMedia&&window.matchMedia(`(prefers-color-scheme: dark)`).matches)?`dark`:`light`;
}
function updateSiteTheme(){
    let theme=detectTheme();
    if(currentAntigravityInstance){
        currentAntigravityInstance.setTheme(theme);
    }
    return theme;
}
window.__antigravityUpdateTheme=updateSiteTheme;

let themeObs=new MutationObserver(()=>updateSiteTheme());
themeObs.observe(document.documentElement,{attributes:true,attributeFilter:[`data-theme`,`class`]});
if(document.body){themeObs.observe(document.body,{attributes:true,attributeFilter:[`data-theme`,`class`]});}
let toggleBtn=document.getElementById(`theme-toggle`);
if(toggleBtn){toggleBtn.addEventListener(`click`,()=>setTimeout(updateSiteTheme,35));}

function initAntigravityComponent(){
document.querySelectorAll(`[data-main-particles-component]`).forEach(e=>{let t=e.querySelector(`[data-container]`);if(!t)return;let n=detectTheme(),r=parseFloat(e.getAttribute(`data-ring-width`)||`0.15`),i=parseFloat(e.getAttribute(`data-ring-width2`)||`0.05`),a=parseFloat(e.getAttribute(`data-ring-displacement`)||`0.15`),o=parseInt(e.getAttribute(`data-density`)||`200`),s=parseFloat(e.getAttribute(`data-particles-scale`)||`0.75`),cl={color1:e.getAttribute(`data-color1-light`)||`#059669`,color2:e.getAttribute(`data-color2-light`)||`#0284c7`,color3:e.getAttribute(`data-color3-light`)||`#10b981`},cd={color1:e.getAttribute(`data-color1-dark`)||`#34d399`,color2:e.getAttribute(`data-color2-dark`)||`#38bdf8`,color3:e.getAttribute(`data-color3-dark`)||`#064e3b`},c=new URLSearchParams(window.location.search).get(`gui`)===`true`,l=null,u=!1,d=null,f=()=>l||(t.offsetWidth===0||t.offsetHeight===0?null:(l=new N({container:t,theme:n,particlesScale:s,density:o,interactive:!0,gui:c,verbose:!1,ringWidth:r,ringWidth2:i,ringDisplacement:a,colorsLight:cl,colorsDark:cd}),currentAntigravityInstance=l,l)),p=()=>{if(!u||document.hidden){d=null;return}d=requestAnimationFrame(p),!(performance.now()<P||I())&&l?.render()},m=()=>{let e=f();e&&(e.resume(),d===null&&(d=requestAnimationFrame(p)))},h=()=>{d!==null&&(cancelAnimationFrame(d),d=null),l?.stop()},g=new IntersectionObserver(e=>{e.forEach(e=>{u=e.isIntersecting,e.isIntersecting&&!document.hidden?m():h()})},{root:null,rootMargin:`100px 0px`,threshold:0});g.observe(t);let _=()=>{document.hidden?h():u&&m()};document.addEventListener(`visibilitychange`,_),window.addEventListener(`beforeunload`,()=>{g.disconnect(),document.removeEventListener(`visibilitychange`,_),h(),l?.kill()})});}
if(document.readyState===`loading`){document.addEventListener(`DOMContentLoaded`,initAntigravityComponent);}else{initAntigravityComponent();}