/**
 * 时间轴模块 — 回忆展开 + 实时计数器
 */

class TimelineManager {
  constructor() {
    this.el = document.getElementById('timeline-container');
    this.scroll = document.getElementById('timeline-scroll');
    this.active = false;
    this.rafId = null;
    this.t1 = new Date(CONFIG.timeline.firstMeet);
    this.t2 = new Date(CONFIG.timeline.becomeCouple);
  }

  build() {
    this.scroll.innerHTML = '';
    this.scroll.appendChild(this._entry('01', CONFIG.texts.chapter1Title, CONFIG.texts.chapter1Time, 'c1', CONFIG.texts.chapter1Desc, this.t1));
    this.scroll.appendChild(this._entry('02', CONFIG.texts.chapter2Title, CONFIG.texts.chapter2Time, 'c2', CONFIG.texts.chapter2Desc, this.t2));
  }

  _entry(ch, title, time, id, desc, start) {
    const div = document.createElement('div');
    div.className = 'timeline-entry glass-card';
    div.innerHTML = `
      <div class="tl-chapter">${ch}</div>
      <div class="tl-title">${title}</div>
      <div class="tl-time">${time}</div>
      <div class="tl-counter" id="${id}">
        <div class="tl-citem"><span class="num" id="${id}-d">0</span><span class="lbl">天</span></div>
        <div class="tl-citem"><span class="num" id="${id}-h">0</span><span class="lbl">时</span></div>
        <div class="tl-citem"><span class="num" id="${id}-m">0</span><span class="lbl">分</span></div>
      </div>
      <div class="tl-desc">${desc}</div>`;
    return div;
  }

  show() {
    this.el.classList.add('active');
    this.active = true;
    const ents = this.scroll.querySelectorAll('.timeline-entry');
    ents.forEach((e, i) => setTimeout(() => e.classList.add('visible'), 300 + i * 400));
    this._tick();
  }

  hide() {
    this.el.classList.remove('active');
    this.active = false;
    if (this.rafId) { cancelAnimationFrame(this.rafId); this.rafId = null; }
  }

  _tick() {
    const now = new Date();
    this._upd('c1', this.t1, now);
    this._upd('c2', this.t2, now);
    if (this.active) this.rafId = requestAnimationFrame(() => this._tick());
  }

  _upd(pref, s, now) {
    if (now < s) return;
    const diff = now.getTime() - s.getTime();
    const totalM = Math.floor(diff / 60000);
    const totalH = Math.floor(totalM / 60);
    const totalD = Math.floor(totalH / 24);
    const el = (id) => document.getElementById(id);
    const set = (id, v) => { const e = el(id); if (e) e.textContent = v; };
    set(pref + '-d', totalD);
    set(pref + '-h', totalH % 24);
    set(pref + '-m', totalM % 60);
  }
}

window.TimelineManager = TimelineManager;
