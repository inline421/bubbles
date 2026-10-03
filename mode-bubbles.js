/* ===========================================================================
   mode-bubbles.js — float, pop, finger-paint.
   Every mode exposes: { id, start(stage, ctx), stop() }
   =========================================================================== */
window.ModeBubbles = (function () {
  "use strict";
  var CFG, stage, tctx, fctx, W, H, DPR;
  var bubbles = [], particles = [], ripples = [], active = new Map();
  var raf = null, last = 0, trailInk = false, idleFrames = 0, running = false;

  function rand(a,b){ return a + Math.random()*(b-a); }
  function pick(a){ return a[Math.floor(Math.random()*a.length)]; }

  function makeBubble(entering) {
    var shortEdge = Math.min(W,H);
    var size = shortEdge * rand(CFG.bubbleSizeMin, CFG.bubbleSizeMax);
    var color = pick(CFG.colors);
    var el = document.createElement("button");
    el.className = "bubble" + (entering ? " entering" : "");
    el.type = "button";
    el.setAttribute("aria-label", "Bubble");
    el.style.width = size + "px";
    el.style.height = size + "px";
    el.style.setProperty("--c1", color.c1);
    el.style.setProperty("--c2", color.c2);
    el.style.setProperty("--glow", color.glow);

    var b = {
      el:el, size:size,
      x: rand(W*0.06, Math.max(W*0.06, W*0.94 - size)),
      y: rand(H*0.06, Math.max(H*0.06, H*0.94 - size)),
      vx: rand(-1,1)*CFG.driftSpeed*H,
      vy: rand(-1,1)*CFG.driftSpeed*H,
      color:color, note:pick(CFG.scale), alive:true
    };
    place(b);
    stage.appendChild(el);

    el.addEventListener("pointerdown", function (e) {
      e.preventDefault(); e.stopPropagation();
      popBubble(b, e.clientX, e.clientY);
    });
    el.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault(); popBubble(b, b.x + b.size/2, b.y + b.size/2);
      }
    });
    return b;
  }

  /* JS owns .bubble's transform. CSS animations run on ::before only —
     animating transform here too would discard this positioning. */
  function place(b){ b.el.style.transform = "translate3d("+b.x+"px,"+b.y+"px,0)"; }

  function popBubble(b, px, py) {
    if (!b.alive) return;
    b.alive = false;
    window.Sound.pop();
    window.Sound.note(b.note, 1);
    if (navigator.vibrate) { try { navigator.vibrate(12); } catch(e){} }
    burst(px, py, b.color.trail, b.size);
    b.el.classList.remove("entering");
    b.el.classList.add("popping");
    var i = bubbles.indexOf(b); if (i >= 0) bubbles.splice(i,1);
    setTimeout(function(){ if (b.el.parentNode) b.el.parentNode.removeChild(b.el); }, 400);
    setTimeout(function () {
      if (!running) return;
      if (bubbles.length < CFG.bubbleCount) {
        var nb = makeBubble(true);
        bubbles.push(nb);
        setTimeout(function(){ nb.el.classList.remove("entering"); }, 600);
      }
    }, CFG.respawnDelay);
  }

  function burst(x,y,color,size) {
    for (var i=0;i<14;i++){
      var a = (Math.PI*2*i)/14 + rand(-0.2,0.2);
      var sp = rand(size*0.35, size*0.9);
      particles.push({ x:x,y:y, vx:Math.cos(a)*sp, vy:Math.sin(a)*sp,
                       r:rand(3,9), life:1, color:color });
    }
  }
  function ripple(x,y,color){ ripples.push({x:x,y:y,r:8,life:1,color:color}); }

  function onDown(e) {
    e.preventDefault();
    var color = pick(CFG.colors);
    active.set(e.pointerId, { x:e.clientX, y:e.clientY, color:color.trail });
    ripple(e.clientX, e.clientY, color.trail);
    window.Sound.tick(pick(CFG.scale));
  }
  function onMove(e) {
    var p = active.get(e.pointerId); if (!p) return;
    e.preventDefault();
    tctx.globalCompositeOperation = "source-over";
    tctx.strokeStyle = p.color;
    tctx.globalAlpha = CFG.trailAlpha;
    tctx.lineWidth = CFG.trailWidth;
    tctx.beginPath(); tctx.moveTo(p.x,p.y); tctx.lineTo(e.clientX,e.clientY); tctx.stroke();
    tctx.globalAlpha = 1;
    trailInk = true;
    p.x = e.clientX; p.y = e.clientY;
  }
  function onUp(e){ active.delete(e.pointerId); }

  function frame(ts) {
    if (!running) return;
    var dt = last ? Math.min((ts-last)/1000, 0.05) : 0.016;
    last = ts;

    /* Fade trails by ERASING. destination-out asymptotes at 1/255 in 8-bit
       alpha and never reaches zero, so a hard clear follows once idle —
       without it, residue accumulates until the screen looks dirty. */
    if (trailInk) {
      tctx.globalCompositeOperation = "destination-out";
      tctx.fillStyle = "rgba(0,0,0,"+CFG.trailFadeSpeed+")";
      tctx.fillRect(0,0,W,H);
      tctx.globalCompositeOperation = "source-over";
      if (active.size === 0) {
        if (++idleFrames > 260) { tctx.clearRect(0,0,W,H); trailInk=false; idleFrames=0; }
      } else idleFrames = 0;
    }

    fctx.clearRect(0,0,W,H);

    var i,b;
    for (i=0;i<bubbles.length;i++){ b=bubbles[i]; b.x += b.vx*dt; b.y += b.vy*dt; }

    /* Keep bubbles from stacking into one ambiguous target. n is 7. */
    for (i=0;i<bubbles.length;i++) for (var j=i+1;j<bubbles.length;j++){
      var a=bubbles[i], c=bubbles[j];
      var ar=a.size/2, cr=c.size/2;
      var dx=(c.x+cr)-(a.x+ar), dy=(c.y+cr)-(a.y+ar);
      var d=Math.hypot(dx,dy)||0.001, want=(ar+cr)*CFG.bubbleSeparation;
      if (d<want){ var push=(want-d)/2, nx=dx/d, ny=dy/d;
        a.x-=nx*push; a.y-=ny*push; c.x+=nx*push; c.y+=ny*push; }
    }
    for (i=0;i<bubbles.length;i++){
      b=bubbles[i];
      var minX=W*0.04, maxX=W*0.96-b.size, minY=H*0.04, maxY=H*0.96-b.size;
      if (b.x<minX){b.x=minX;b.vx=Math.abs(b.vx);}
      if (b.x>maxX){b.x=maxX;b.vx=-Math.abs(b.vx);}
      if (b.y<minY){b.y=minY;b.vy=Math.abs(b.vy);}
      if (b.y>maxY){b.y=maxY;b.vy=-Math.abs(b.vy);}
      place(b);
    }

    fctx.globalCompositeOperation = "lighter";
    for (var k=particles.length-1;k>=0;k--){
      var p=particles[k];
      p.x+=p.vx*dt; p.y+=p.vy*dt; p.vy+=220*dt; p.life-=dt*1.5;
      if (p.life<=0){ particles.splice(k,1); continue; }
      fctx.globalAlpha=Math.max(p.life,0)*0.9; fctx.fillStyle=p.color;
      fctx.beginPath(); fctx.arc(p.x,p.y,p.r*p.life,0,Math.PI*2); fctx.fill();
    }
    for (var m=ripples.length-1;m>=0;m--){
      var r=ripples[m];
      r.r+=260*dt; r.life-=dt*1.8;
      if (r.life<=0){ ripples.splice(m,1); continue; }
      fctx.globalAlpha=Math.max(r.life,0)*0.55; fctx.strokeStyle=r.color; fctx.lineWidth=5;
      fctx.beginPath(); fctx.arc(r.x,r.y,r.r,0,Math.PI*2); fctx.stroke();
    }
    fctx.globalAlpha=1; fctx.globalCompositeOperation="source-over";
    raf = requestAnimationFrame(frame);
  }

  function resize(dims){ W=dims.W; H=dims.H; DPR=dims.DPR; }

  function start(host) {
    CFG = window.CONFIG;
    stage = host.stage; tctx = host.tctx; fctx = host.fctx;
    resize(host.dims());
    running = true; last = 0;
    bubbles = []; particles = []; ripples = []; active.clear(); trailInk = false;
    for (var i=0;i<CFG.bubbleCount;i++) bubbles.push(makeBubble(false));
    stage.addEventListener("pointerdown", onDown, {passive:false});
    stage.addEventListener("pointermove", onMove, {passive:false});
    stage.addEventListener("pointerup", onUp);
    stage.addEventListener("pointercancel", onUp);
    raf = requestAnimationFrame(frame);
  }

  function stop() {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    raf = null;
    stage.removeEventListener("pointerdown", onDown);
    stage.removeEventListener("pointermove", onMove);
    stage.removeEventListener("pointerup", onUp);
    stage.removeEventListener("pointercancel", onUp);
    bubbles.forEach(function(b){ if (b.el.parentNode) b.el.parentNode.removeChild(b.el); });
    bubbles=[]; particles=[]; ripples=[]; active.clear();
    tctx.clearRect(0,0,W,H); fctx.clearRect(0,0,W,H);
  }

  return { id:"bubbles", start:start, stop:stop, resize:resize };
})();
