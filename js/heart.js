/**
 * 爱心呼吸与脉冲发光
 */

class HeartAnimation {
  constructor(ps, viz) {
    this.ps = ps;
    this.viz = viz || null;
    this.ctx = ps.ctx;
    this.alpha = 0;
    this.glowParticles = [];
    for (let i = 0; i < 30; i++) {
      const t = (i / 30) * Math.PI * 2;
      this.glowParticles.push({
        x: 16 * Math.pow(Math.sin(t), 3),
        y: 13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t),
        size: Math.random() * 3 + 2,
        alpha: Math.random() * 0.3 + 0.1,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.5 + 0.3
      });
    }
  }

  drawGlow(ts) {
    if (this.alpha <= 0) return;
    const ctx = this.ctx;
    const vizAvg = (this.viz && this.viz.ready) ? this.viz.avgFreq : 0;
    const breath = 1 + Math.sin(this.ps.breath) * CONFIG.particles.breathAmplitude + vizAvg * 0.12;
    const scale = Math.min(this.ps.W, this.ps.H) * 0.18 * breath;
    const cx = this.ps.cx, cy = this.ps.cy;
    const aa = this.alpha;

    const g1 = ctx.createRadialGradient(cx, cy, scale * 0.3, cx, cy, scale * 1.5);
    g1.addColorStop(0, `rgba(255,80,130,${0.06 * aa})`);
    g1.addColorStop(0.4, `rgba(255,60,120,${0.03 * aa})`);
    g1.addColorStop(1, 'rgba(255,40,100,0)');
    ctx.fillStyle = g1;
    ctx.fillRect(0, 0, this.ps.W, this.ps.H);

    const g2 = ctx.createRadialGradient(cx, cy, 0, cx, cy, scale * 0.6);
    g2.addColorStop(0, `rgba(255,200,220,${0.08 * aa})`);
    g2.addColorStop(0.5, `rgba(255,120,160,${0.04 * aa})`);
    g2.addColorStop(1, 'rgba(255,80,130,0)');
    ctx.fillStyle = g2;
    ctx.fillRect(0, 0, this.ps.W, this.ps.H);

    this.glowParticles.forEach(gp => {
      const rx = gp.x * Math.cos(this.ps.rotation) - gp.y * Math.sin(this.ps.rotation);
      const ry = gp.x * Math.sin(this.ps.rotation) + gp.y * Math.cos(this.ps.rotation);
      const px = cx + rx * scale;
      const py = cy + ry * scale * 0.9;
      const flick = 0.5 + 0.5 * Math.sin(Date.now() * gp.speed * 0.003 + gp.phase);
      ctx.beginPath(); ctx.arc(px, py, gp.size * (0.8 + flick * 0.4), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,180,210,${gp.alpha * flick * aa})`;
      ctx.fill();
      ctx.beginPath(); ctx.arc(px, py, gp.size * 3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,150,190,${gp.alpha * flick * 0.1 * aa})`;
      ctx.fill();
    });
  }

  drawBeat(ts) {
    if (this.alpha <= 0) return;
    const ctx = this.ctx;
    const cx = this.ps.cx, cy = this.ps.cy;
    const vizBeat = (this.viz && this.viz.ready) ? this.viz.lowFreq : 0;
    const pulse = (Date.now() * 0.002) % (Math.PI * 2);
    const beatBoost = 1 + vizBeat * 0.6;
    const wr = Math.min(this.ps.W, this.ps.H) * 0.18 *
      (1 + CONFIG.particles.breathAmplitude) *
      (1 + 0.15 * Math.pow(Math.sin(pulse), 4)) * beatBoost;
    const wa = (0.12 + vizBeat * 0.18) * Math.pow(Math.abs(Math.cos(pulse)), 3) * this.alpha;
    if (wa > 0.01) {
      const gw = ctx.createRadialGradient(cx, cy, wr * 0.7, cx, cy, wr * 1.1);
      gw.addColorStop(0, 'rgba(255,80,130,0)');
      gw.addColorStop(0.5, `rgba(255,80,130,${wa})`);
      gw.addColorStop(1, 'rgba(255,50,100,0)');
      ctx.fillStyle = gw;
      ctx.beginPath(); ctx.arc(cx, cy, wr * 1.1 + 20, 0, Math.PI * 2); ctx.fill();
    }
  }

  fadeIn() { if (this.alpha < 1) this.alpha = Math.min(1, this.alpha + 0.02); }
  fadeOut() { if (this.alpha > 0) this.alpha = Math.max(0, this.alpha - 0.01); }
  reset() { this.alpha = 0; }
}

window.HeartAnimation = HeartAnimation;
