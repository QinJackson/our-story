class ParticleSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.W = 0; this.H = 0;
    this.cx = 0; this.cy = 0;
    this.dpr = 1;
    this.stars = [];
    this.starLayers = [];
    this.msgs = [];
    this.orbiters = [];
    this.lights = [];
    this.phase = 'init';
    this.converge = 0;
    this.breath = 0;
    this.rotation = 0;
    this.rotation3D = 0;
    this.heartPoints = [];
    this._buildHeart();
    this._resize();
    this._mkStars();
    this._mkStarLayers();
    this._mkLights();
    this._bindResize();
  }

  _buildHeart() {
    this.heartPoints = [];
    var n = CONFIG.particles.heartParticleCount;
    for (var i = 0; i < n; i++) {
      var t = (i / n) * Math.PI * 2;
      var s = 1 - Math.random() * 0.35;
      var x = 16 * Math.pow(Math.sin(t), 3) * s;
      var y = (13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t)) * s;
      var sp = i % 3 === 0 ? 0.2 : 0.06;
      this.heartPoints.push({
        x: x + (Math.random() - 0.5) * sp,
        y: y + (Math.random() - 0.5) * sp,
        z: (Math.random() - 0.5) * 3
      });
    }
  }

  _resize() {
    this.dpr = CONFIG.performance.retinaScale ? Math.min(devicePixelRatio||1, 2) : 1;
    this.W = innerWidth; this.H = innerHeight;
    this.cx = this.W / 2; this.cy = this.H / 2;
    this.canvas.width = this.W * this.dpr;
    this.canvas.height = this.H * this.dpr;
    this.canvas.style.width = this.W + 'px';
    this.canvas.style.height = this.H + 'px';
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }
  _bindResize() {
    var t, self = this;
    addEventListener('resize', function() { clearTimeout(t); t = setTimeout(function() { self._resize(); }, 200); });
  }

  /* --- Multi-layer stars --- */
  _mkStars() {
    this.stars = [];
    for (var i = 0; i < CONFIG.particles.starCount; i++) {
      this.stars.push({
        x: Math.random() * this.W, y: Math.random() * this.H,
        r: Math.random() * 1.5 + 0.3, a: Math.random() * 0.5 + 0.2,
        sp: Math.random() * 0.0004 + 0.0001, ph: Math.random() * Math.PI * 2
      });
    }
  }

  _mkStarLayers() {
    this.starLayers = [];
    var layers = [
      { c: 30, rl: 0.3, rh: 0.8, sp: 0.0002, al: 0.1, ah: 0.25, lb: 'far' },
      { c: 40, rl: 0.8, rh: 1.8, sp: 0.0005, al: 0.2, ah: 0.4, lb: 'mid' },
      { c: 15, rl: 1.8, rh: 3.5, sp: 0.0008, al: 0.3, ah: 0.6, lb: 'near' }
    ];
    for (var l = 0; l < layers.length; l++) {
      var L = layers[l];
      for (var i = 0; i < L.c; i++) {
        this.starLayers.push({
          x: Math.random() * this.W, y: Math.random() * this.H,
          r: L.rl + Math.random() * (L.rh - L.rl),
          a: L.al + Math.random() * (L.ah - L.al),
          sp: L.sp * (0.8 + Math.random() * 0.4), ph: Math.random() * Math.PI * 2,
          layer: L.lb
        });
      }
    }
  }

  _mkLights() {
    this.lights = [];
    for (var i = 0; i < 12; i++) {
      this.lights.push({
        x: Math.random() * this.W, y: Math.random() * this.H,
        r: Math.random() * 50 + 25, a: Math.random() * 0.04 + 0.015,
        sx: (Math.random() - 0.5) * 0.15, sy: (Math.random() - 0.5) * 0.12,
        ph: Math.random() * Math.PI * 2
      });
    }
  }

  /* --- Text particles with trails + lifecycle --- */
  _mkText() {
    this.msgs = [];
    var list = CONFIG.messages;
    for (var i = 0; i < list.length; i++) {
      this.msgs.push(this._newTextParticle(list[i]));
    }
  }

  _newTextParticle(text) {
    var h = CONFIG.colors.textHueRange[0] + Math.random() * (CONFIG.colors.textHueRange[1] - CONFIG.colors.textHueRange[0]);
    var l = CONFIG.colors.textLightness[0] + Math.random() * (CONFIG.colors.textLightness[1] - CONFIG.colors.textLightness[0]);
    var fs = CONFIG.particles.msgMinFont + Math.random() * (CONFIG.particles.msgMaxFont - CONFIG.particles.msgMinFont);
    var trail = [];
    for (var t = 0; t < 5; t++) trail.push({ x: 0, y: 0 });
    var maxLife = 8000 + Math.random() * 6000;
    return {
      text: text, fontSize: fs,
      color: 'hsl(' + h + ',' + CONFIG.colors.textSaturation + '%,' + l + '%)',
      alpha: 0, targetAlpha: Math.random() * 0.45 + 0.4,
      x: Math.random() * this.W, y: Math.random() * this.H,
      vx: (Math.random() - 0.5) * 0.7, vy: (Math.random() - 0.5) * 0.7 - 0.15,
      ph: Math.random() * Math.PI * 2, floatSpd: Math.random() * 0.002 + 0.001,
      hi: Math.floor(Math.random() * this.heartPoints.length),
      tx: this.cx, ty: this.cy,
      trail: trail, trailIdx: 0,
      life: 0, maxLife: maxLife,
      born: Date.now()
    };
  }

  _mkOrbiters() {
    this.orbiters = [];
    var n = CONFIG.particles.orbitCount;
    var baseR = Math.min(this.W, this.H) * 0.22;
    for (var i = 0; i < n; i++) {
      var a = (i / n) * Math.PI * 2;
      this.orbiters.push({
        angle: a, radius: baseR + Math.random() * baseR * 0.35,
        speed: (Math.random() * 0.6 + 0.2) * 0.002,
        size: Math.random() * 2 + 0.8, alpha: Math.random() * 0.35 + 0.2,
        hue: CONFIG.colors.textHueRange[0] + Math.random() * (CONFIG.colors.textHueRange[1] - CONFIG.colors.textHueRange[0])
      });
    }
  }

  setPhase(ph) {
    this.phase = ph;
    switch (ph) {
      case 'floating': this._mkText(); break;
      case 'converging':
        this.converge = 0;
        for (var i = 0; i < this.msgs.length; i++) {
          var p = this.msgs[i];
          var hp = this.heartPoints[p.hi % this.heartPoints.length];
          var s = Math.min(this.W, this.H) * 0.18;
          p.tx = this.cx + hp.x * s;
          p.ty = this.cy + hp.y * s * 0.9;
        }
        break;
      case 'heart': this._mkOrbiters(); break;
    }
  }

  update(ts) {
    this.breath = (ts * 0.001) / 3 * Math.PI * 2;
    this.rotation += 0.0003;
    this.rotation3D += 0.0005;
    this._updStars(ts);
    this._updLights(ts);
    switch (this.phase) {
      case 'floating': this._updFloat(ts); break;
      case 'converging': this._updConverge(ts); break;
      case 'heart': case 'timeline': this._updHeart(ts); break;
    }
  }

  _updStars(ts) {
    for (var i = 0; i < this.stars.length; i++) {
      var s = this.stars[i];
      s.a = 0.3 + Math.sin(ts * s.sp + s.ph) * 0.2;
    }
    for (var i = 0; i < this.starLayers.length; i++) {
      var s = this.starLayers[i];
      s.a = Math.max(0.05, s.a + Math.sin(ts * s.sp + s.ph) * 0.03);
    }
  }

  _updLights(ts) {
    for (var i = 0; i < this.lights.length; i++) {
      var l = this.lights[i];
      l.x += Math.sin(ts * 0.0005 + l.ph) * l.sx;
      l.y += Math.cos(ts * 0.0004 + l.ph * 1.3) * l.sy;
      if (l.x < -l.r) l.x = this.W + l.r;
      if (l.x > this.W + l.r) l.x = -l.r;
      if (l.y < -l.r) l.y = this.H + l.r;
      if (l.y > this.H + l.r) l.y = -l.r;
    }
  }

  _updFloat(ts) {
    var now = Date.now();
    for (var i = 0; i < this.msgs.length; i++) {
      var p = this.msgs[i];
      p.life = now - p.born;
      // 生命周期:淡入(前15%)→稳定→淡出(后25%)
      var lp = p.life / p.maxLife;
      if (lp < 0.15) {
        p.alpha = p.targetAlpha * (lp / 0.15);
      } else if (lp > 0.75) {
        p.alpha = p.targetAlpha * Math.max(0, (1 - lp) / 0.25);
      } else {
        p.alpha = p.targetAlpha;
      }
      // 生命周期结束:重生
      if (lp >= 1) {
        this.msgs[i] = this._newTextParticle(p.text);
        continue;
      }
      p.trail[p.trailIdx] = { x: p.x, y: p.y };
      p.trailIdx = (p.trailIdx + 1) % p.trail.length;
      // 自然运动:多频正弦扰动模拟流体
      p.x += p.vx + Math.sin(ts * p.floatSpd + p.ph) * 0.25 + Math.sin(ts * p.floatSpd * 2.3 + p.ph) * 0.08;
      p.y += p.vy + Math.cos(ts * p.floatSpd * 0.8 + p.ph * 1.2) * 0.18 + Math.cos(ts * p.floatSpd * 1.7 + p.ph) * 0.06;
      if (p.x < -200) p.x = this.W + 200;
      if (p.x > this.W + 200) p.x = -200;
      if (p.y < -100) p.y = this.H + 100;
      if (p.y > this.H + 100) p.y = -100;
      // 自然扰动:微小随机加速度 + 阻尼
      p.vx += (Math.random() - 0.5) * 0.012;
      p.vy += (Math.random() - 0.5) * 0.012;
      p.vx *= 0.995;
      p.vy *= 0.995;
      p.vx = Math.max(-0.7, Math.min(0.7, p.vx));
      p.vy = Math.max(-0.7, Math.min(0.7, p.vy));
    }
  }

  _updConverge(ts) {
    if (this.converge < 1) this.converge = Math.min(1, this.converge + CONFIG.particles.convergeSpeed);
    var t = this.converge;
    var ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    for (var i = 0; i < this.msgs.length; i++) {
      var p = this.msgs[i];
      p.trail[p.trailIdx] = { x: p.x, y: p.y };
      p.trailIdx = (p.trailIdx + 1) % p.trail.length;
      p.x += (p.tx - p.x) * ease * 0.035;
      p.y += (p.ty - p.y) * ease * 0.035;
    }
  }

  _updHeart(ts) {
    var breath = 1 + Math.sin(this.breath) * CONFIG.particles.breathAmplitude;
    var s = Math.min(this.W, this.H) * 0.18 * breath;
    for (var i = 0; i < this.msgs.length; i++) {
      var p = this.msgs[i];
      var hp = this.heartPoints[p.hi % this.heartPoints.length];
      var cosR = Math.cos(this.rotation3D);
      var sinR = Math.sin(this.rotation3D);
      var px = hp.x, py = hp.y, pz = hp.z || 0;
      var rx = px * cosR - (pz * 0.5) * sinR;
      var rz = px * sinR + (pz * 0.5) * cosR;
      var persp = 1 / (1 + rz * 0.08);
      p.trail[p.trailIdx] = { x: p.x, y: p.y };
      p.trailIdx = (p.trailIdx + 1) % p.trail.length;
      p.x = this.cx + rx * s * persp;
      p.y = this.cy + py * s * 0.9 * persp;
      if (p.alpha < 0.7) p.alpha = Math.min(0.7, p.alpha + 0.015);
      if (p.fontSize < CONFIG.particles.msgMinFont) p.fontSize = Math.min(CONFIG.particles.msgMinFont, p.fontSize + 0.15);
    }
    for (var i = 0; i < this.orbiters.length; i++) {
      this.orbiters[i].angle += this.orbiters[i].speed;
    }
  }

  draw(ts) {
    var ctx = this.ctx;
    ctx.clearRect(0, 0, this.W, this.H);
    this._drawStars(ctx);
    this._drawLights(ctx);
    if (this.phase === 'converging' && this.converge > 0.6) this._drawGlow(ctx);
    if (this.phase === 'heart' || this.phase === 'timeline') { this._drawGlow(ctx); this._drawOrbiters(ctx); }
    this._drawMsgs(ctx);
  }

  _drawStars(ctx) {
    // Far layer
    for (var i = 0; i < this.starLayers.length; i++) {
      var s = this.starLayers[i];
      if (s.layer !== 'far') continue;
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(200,210,255,' + s.a + ')';
      ctx.fill();
    }
    // Mid base
    for (var i = 0; i < this.stars.length; i++) {
      var s = this.stars[i];
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,' + s.a + ')';
      ctx.fill();
    }
    // Mid layer
    for (var i = 0; i < this.starLayers.length; i++) {
      var s = this.starLayers[i];
      if (s.layer !== 'mid') continue;
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(230,235,255,' + s.a + ')';
      ctx.fill();
    }
    // Near layer with glow
    for (var i = 0; i < this.starLayers.length; i++) {
      var s = this.starLayers[i];
      if (s.layer !== 'near') continue;
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r * 3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(200,210,255,' + (s.a * 0.08) + ')';
      ctx.fill();
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,' + s.a + ')';
      ctx.fill();
    }
  }

  _drawLights(ctx) {
    for (var i = 0; i < this.lights.length; i++) {
      var l = this.lights[i];
      var g = ctx.createRadialGradient(l.x, l.y, 0, l.x, l.y, l.r);
      g.addColorStop(0, 'rgba(255,180,200,' + (l.a * 0.5) + ')');
      g.addColorStop(0.4, 'rgba(255,140,175,' + (l.a * 0.25) + ')');
      g.addColorStop(1, 'rgba(255,100,150,0)');
      ctx.fillStyle = g;
      ctx.fillRect(l.x - l.r, l.y - l.r, l.r * 2, l.r * 2);
    }
  }

  _drawMsgs(ctx) {
    for (var i = 0; i < this.msgs.length; i++) {
      var p = this.msgs[i];
      if (p.alpha <= 0.01) continue;
      // Trail
      var tl = p.trail.length;
      for (var t = 0; t < tl; t++) {
        var idx = (p.trailIdx - t - 1 + tl) % tl;
        var tp = p.trail[idx];
        if (!tp || !tp.x) continue;
        var ta = p.alpha * (1 - t / tl) * 0.12;
        if (ta < 0.01) continue;
        ctx.save();
        ctx.globalAlpha = ta;
        ctx.font = Math.round(p.fontSize * (1 - t / tl * 0.3)) + 'px "PingFang SC","Helvetica Neue",sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = p.color;
        ctx.fillText(p.text, tp.x, tp.y);
        ctx.restore();
      }
      // Main text
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.font = Math.round(p.fontSize) + 'px "PingFang SC","Helvetica Neue",sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(255,150,200,0.2)';
      ctx.shadowBlur = 20;
      ctx.fillStyle = p.color;
      ctx.fillText(p.text, p.x, p.y);
      ctx.shadowBlur = 8;
      ctx.fillText(p.text, p.x, p.y);
      ctx.restore();
    }
  }

  _drawGlow(ctx) {
    var g = ctx.createRadialGradient(this.cx, this.cy, 0, this.cx, this.cy, Math.min(this.W, this.H) * 0.35);
    g.addColorStop(0, 'rgba(255,80,130,0.045)');
    g.addColorStop(0.3, 'rgba(255,60,120,0.025)');
    g.addColorStop(0.6, 'rgba(255,50,110,0.012)');
    g.addColorStop(1, 'rgba(255,40,100,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, this.W, this.H);
  }

  _drawOrbiters(ctx) {
    for (var i = 0; i < this.orbiters.length; i++) {
      var o = this.orbiters[i];
      var x = this.cx + Math.cos(o.angle) * o.radius;
      var y = this.cy + Math.sin(o.angle) * o.radius;
      ctx.beginPath(); ctx.arc(x, y, o.size * 4, 0, Math.PI * 2);
      ctx.fillStyle = 'hsla(' + o.hue + ',75%,75%,' + (o.alpha * 0.06) + ')';
      ctx.fill();
      ctx.beginPath(); ctx.arc(x, y, o.size, 0, Math.PI * 2);
      ctx.fillStyle = 'hsla(' + o.hue + ',75%,75%,' + o.alpha + ')';
      ctx.fill();
    }
  }

  getHeartCenter() { return { x: this.cx, y: this.cy }; }
}

window.ParticleSystem = ParticleSystem;