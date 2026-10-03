/* ===========================================================================
   mode-float.js — the float game, driven entirely by a theme.

   One engine, five themes. Objects drift slowly, a tap pops one with its own
   synthesised call plus its spoken name, and a new one drifts in. Dragging
   paints a trail. Replaces the old bubbles-only mode: a moving object she can
   chase is better than a static grid, and it means Animals, Balls, Halloween
   and Body all come free from data.
   =========================================================================== */
window.ModeFloat = (function () {
  "use strict";
  var CFG, stage, tctx, fctx, W, H;
  var items = [], particles = [], ripples = [], active = new Map();
  var raf = null, last = 0, trailInk = false, idleFrames = 0, running = false;
  var theme = null, labelEl = null;

  function rand(a,b){ return a+Math.random()*(b-a); }
  function pick(a){ return a[Math.floor(Math.random()*a.length)]; }

  /* Prefer an object that is not already on screen. With 8 animals in 7
     slots, plain random-with-replacement gave three bees at once, which is
     worse for learning and looks like a bug. */
  function pickDef() {
    var onScreen = {};
    items.forEach(function(i){ onScreen[i.def.id] = true; });
    var fresh = theme.objects.filter(function(o){ return !onScreen[o.id]; });
    return pick(fresh.length ? fresh : theme.objects);
  }

  function makeItem(entering) {
    var shortEdge = Math.min(W,H);
    var size = shortEdge * rand(CFG.objectSizeMin, CFG.objectSizeMax);
    var def = pickDef();
    var colour = pick(CFG.bubbleColors);

    var el = document.createElement("button");
    el.className = "floater" + (entering ? " entering" : "");
    el.type = "button";
    el.setAttribute("aria-label", def.name);
    el.style.width = size + "px";
    el.style.height = size + "px";
    el.style.setProperty("--glow", def.id === "bubble" ? colour.glow : theme.glow);

    /* A cut-out sticker when the theme ships one, the drawn sprite otherwise.
       The hand-drawn SVGs were the weakest artwork in the app; Bubbles keeps
       its sprite because a bubble is drawn parametrically, per colour. */
    var art;
    if (theme.objectDir && def.f) {
      art = '<img class="floater-img" src="' + theme.objectDir + def.f + '.webp' +
            (CFG.assetVersion || "") + '" alt="" draggable="false">';
    } else {
      art = window.Sprites.draw(def.id, { c1: colour.c1, c2: colour.c2 });
    }
    el.innerHTML = '<span class="floater-art">' + art + '</span>';

    var it = {
      el:el, size:size, def:def,
      trail: def.trail || colour.trail,
      x: rand(W*0.06, Math.max(W*0.06, W*0.94 - size)),
      y: rand(H*0.06, Math.max(H*0.06, H*0.94 - size)),
      vx: rand(-1,1)*CFG.driftSpeed*H,
      vy: rand(-1,1)*CFG.driftSpeed*H,
      note: pick(CFG.scale), alive:true
    };
    place(it);
    stage.appendChild(el);

    el.addEventListener("pointerdown", function (e) {
      e.preventDefault(); e.stopPropagation(); popItem(it, e.clientX, e.clientY);
    });
    el.addEventListener("keydown", function (e) {
      if (e.key==="Enter"||e.key===" ") { e.preventDefault(); popItem(it, it.x+it.size/2, it.y+it.size/2); }
    });
    return it;
  }

  /* JS owns .floater's transform. CSS animations run on the inner art only —
     animating transform here too would discard this positioning. */
  function place(it){ it.el.style.transform = "translate3d("+it.x+"px,"+it.y+"px,0)"; }

  /* Beside the thing she popped, not in a bar at the bottom. */
  function showLabel(text, it) {
    if (!labelEl || !text) return;
    labelEl.textContent = text;
    labelEl.classList.remove("show", "below");
    void labelEl.offsetWidth;
    if (it) {
      labelEl.style.left = (it.x + it.size / 2) + "px";
      if (it.y - 64 < 0) { labelEl.classList.add("below");
                           labelEl.style.top = (it.y + it.size + 10) + "px"; }
      else               { labelEl.style.top = (it.y - 10) + "px"; }
    }
    labelEl.classList.add("show");
  }

  function popItem(it, px, py) {
    if (!it.alive) return;
    it.alive = false;

    /* The word first and synchronously, for the same iOS activation reason as
       mode-body. Then the object's own sound - a moo or a bounce is content.
       The musical note and the generic pop were not, so they are gone. */
    /* The word, a beat, then the creature's own noise. Said together they
       ran into each other - "pigoink" - and the name is the part she is
       meant to learn, so it goes first and gets clear air. */
    if (it.def.say) window.Sound.sayThen(it.def.say, it.def.sound, it.def.call, it.def.sfx);
    else if (it.def.call) window.Sound.call(it.def.call);
    else window.Sound.call("pop");
    countPop();
    if (it.def.name && it.def.id !== "bubble") showLabel(it.def.name, it);
    if (navigator.vibrate) { try { navigator.vibrate(12); } catch(e){} }

    burst(px, py, it.trail, it.size);
    it.el.classList.remove("entering");
    it.el.classList.add("popping");
    var i = items.indexOf(it); if (i>=0) items.splice(i,1);
    setTimeout(function(){ if (it.el.parentNode) it.el.parentNode.removeChild(it.el); }, 420);
    setTimeout(function () {
      if (!running) return;
      if (items.length < CFG.objectCount) {
        var ni = makeItem(true);
        items.push(ni);
        setTimeout(function(){ ni.el.classList.remove("entering"); }, 620);
      }
    }, CFG.respawnDelay);
  }

  function burst(x,y,color,size) {
    for (var i=0;i<14;i++){
      var a=(Math.PI*2*i)/14 + rand(-0.2,0.2), sp=rand(size*0.35,size*0.9);
      particles.push({x:x,y:y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,r:rand(3,9),life:1,color:color});
    }
  }
  function ripple(x,y,c){ ripples.push({x:x,y:y,r:8,life:1,color:c}); }

  function onDown(e) {
    e.preventDefault();
    var c = pick(CFG.bubbleColors);
    active.set(e.pointerId,{x:e.clientX,y:e.clientY,color:c.trail});
    ripple(e.clientX,e.clientY,c.trail);
    window.Sound.tick(pick(CFG.scale));
  }
  function onMove(e) {
    var p = active.get(e.pointerId); if (!p) return;
    e.preventDefault();
    tctx.globalCompositeOperation="source-over";
    tctx.strokeStyle=p.color; tctx.globalAlpha=CFG.trailAlpha; tctx.lineWidth=CFG.trailWidth;
    tctx.beginPath(); tctx.moveTo(p.x,p.y); tctx.lineTo(e.clientX,e.clientY); tctx.stroke();
    tctx.globalAlpha=1; trailInk=true;
    p.x=e.clientX; p.y=e.clientY;
  }
  function onUp(e){ active.delete(e.pointerId); }

  function frame(ts) {
    if (!running) return;
    var dt = last ? Math.min((ts-last)/1000,0.05) : 0.016;
    last = ts;

    /* Fade trails by ERASING; destination-out asymptotes at 1/255 in 8-bit
       alpha, so a hard clear follows once idle or residue accumulates. */
    if (trailInk) {
      tctx.globalCompositeOperation="destination-out";
      tctx.fillStyle="rgba(0,0,0,"+CFG.trailFadeSpeed+")";
      tctx.fillRect(0,0,W,H);
      tctx.globalCompositeOperation="source-over";
      if (active.size===0){ if(++idleFrames>260){ tctx.clearRect(0,0,W,H); trailInk=false; idleFrames=0; } }
      else idleFrames=0;
    }
    fctx.clearRect(0,0,W,H);

    var i,it;
    for (i=0;i<items.length;i++){ it=items[i]; it.x+=it.vx*dt; it.y+=it.vy*dt; }
    for (i=0;i<items.length;i++) for (var j=i+1;j<items.length;j++){
      var a=items[i], c=items[j], ar=a.size/2, cr=c.size/2;
      var dx=(c.x+cr)-(a.x+ar), dy=(c.y+cr)-(a.y+ar);
      var d=Math.hypot(dx,dy)||0.001, want=(ar+cr)*CFG.objectSeparation;
      if (d<want){ var push=(want-d)/2, nx=dx/d, ny=dy/d;
        a.x-=nx*push; a.y-=ny*push; c.x+=nx*push; c.y+=ny*push; }
    }
    for (i=0;i<items.length;i++){
      it=items[i];
      var minX=W*0.04,maxX=W*0.96-it.size,minY=H*0.04,maxY=H*0.96-it.size;
      if(it.x<minX){it.x=minX;it.vx=Math.abs(it.vx);}
      if(it.x>maxX){it.x=maxX;it.vx=-Math.abs(it.vx);}
      if(it.y<minY){it.y=minY;it.vy=Math.abs(it.vy);}
      if(it.y>maxY){it.y=maxY;it.vy=-Math.abs(it.vy);}
      place(it);
    }

    fctx.globalCompositeOperation="lighter";
    for (var k=particles.length-1;k>=0;k--){
      var p=particles[k];
      p.x+=p.vx*dt; p.y+=p.vy*dt; p.vy+=220*dt; p.life-=dt*1.5;
      if(p.life<=0){particles.splice(k,1);continue;}
      fctx.globalAlpha=Math.max(p.life,0)*0.9; fctx.fillStyle=p.color;
      fctx.beginPath(); fctx.arc(p.x,p.y,p.r*p.life,0,Math.PI*2); fctx.fill();
    }
    for (var m=ripples.length-1;m>=0;m--){
      var r=ripples[m]; r.r+=260*dt; r.life-=dt*1.8;
      if(r.life<=0){ripples.splice(m,1);continue;}
      fctx.globalAlpha=Math.max(r.life,0)*0.55; fctx.strokeStyle=r.color; fctx.lineWidth=5;
      fctx.beginPath(); fctx.arc(r.x,r.y,r.r,0,Math.PI*2); fctx.stroke();
    }
    fctx.globalAlpha=1; fctx.globalCompositeOperation="source-over";
    raf = requestAnimationFrame(frame);
  }

  function resize(d){ W=d.W; H=d.H; }

  function start(host, themeId) {
    CFG = window.CONFIG;
    theme = CFG.themes[themeId] || CFG.themes.bubbles;
    stage = host.stage; tctx = host.tctx; fctx = host.fctx;
    resize(host.dims());
    running = true; last = 0;
    items=[]; particles=[]; ripples=[]; active.clear(); trailInk=false;

    labelEl = document.createElement("div");
    labelEl.className = "spot-label";
    labelEl.setAttribute("aria-live","polite");
    stage.appendChild(labelEl);
    counterEl = null;
    if (theme.counter) makeCounter();

    for (var i=0;i<CFG.objectCount;i++) items.push(makeItem(false));
    stage.addEventListener("pointerdown", onDown, {passive:false});
    stage.addEventListener("pointermove", onMove, {passive:false});
    stage.addEventListener("pointerup", onUp);
    stage.addEventListener("pointercancel", onUp);
    raf = requestAnimationFrame(frame);
  }

  /* A running tally, for Bubbles only. It is the first thing in the app that
     keeps score, and at this age the number itself means nothing - the point
     is that something visibly grows when she does the thing. */
  var counterEl = null, popped = 0;

  function makeCounter() {
    popped = 0;
    counterEl = document.createElement("div");
    counterEl.className = "pop-counter";
    counterEl.setAttribute("aria-live", "polite");
    counterEl.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true">' +
      '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/>' +
      '<ellipse cx="9" cy="8.5" rx="3" ry="2" fill="currentColor" opacity=".75" transform="rotate(-28 9 8.5)"/>' +
      '</svg><span class="pop-n">0</span>';
    stage.appendChild(counterEl);
  }

  function countPop() {
    if (!counterEl) return;
    popped++;
    counterEl.querySelector(".pop-n").textContent = String(popped);
    counterEl.classList.remove("bump"); void counterEl.offsetWidth;
    counterEl.classList.add("bump");
  }

  function stop() {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    raf = null;
    stage.removeEventListener("pointerdown", onDown);
    stage.removeEventListener("pointermove", onMove);
    stage.removeEventListener("pointerup", onUp);
    stage.removeEventListener("pointercancel", onUp);
    items.forEach(function(i){ if(i.el.parentNode) i.el.parentNode.removeChild(i.el); });
    items=[]; particles=[]; ripples=[]; active.clear();
    stage.innerHTML = ""; labelEl = null; counterEl = null;
    tctx.clearRect(0,0,W,H); fctx.clearRect(0,0,W,H);
  }

  return { id:"float", start:start, stop:stop, resize:resize };
})();
