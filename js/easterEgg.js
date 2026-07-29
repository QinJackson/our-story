
class EasterEggManager {
  constructor(ps, heartAnim, videoMgr, musicMgr) {
    this.ps = ps;
    this.heart = heartAnim;
    this.video = videoMgr;
    this.music = musicMgr;

    this.avatarDone = false;
    this.photoDone = false;
    this.finalDone = false;
    this.animating = false;

    this.avatarEgg = document.getElementById('avatar-egg');
    this.avatarMe = document.getElementById('avatar-me');
    this.avatarHer = document.getElementById('avatar-her');

    this.photoEgg = document.getElementById('photo-egg');
    this.photoViewer = document.getElementById('photo-viewer');
    this.photoViewerImg = document.getElementById('photo-viewer-img');

    this.finalScreen = document.getElementById('final-screen');
    this.finalLine1 = document.getElementById('final-line-1');
    this.finalLine2 = document.getElementById('final-line-2');

    this.toast = document.getElementById('egg-toast');

    this.avatarLoaded = false;
    this.herLoaded = false;

    this._preload(); this._bindRipple();
  }

  _preload() {
    var self = this;
    if (this.avatarMe) {
      this.avatarMe.onload = function() { self.avatarLoaded = true; };
      this.avatarMe.onerror = function() { self.avatarLoaded = true; };
      this.avatarMe.src = CONFIG.paths.avatarMe;
    } else {
      this.avatarLoaded = true;
    }
    if (this.avatarHer) {
      this.avatarHer.onload = function() { self.herLoaded = true; };
      this.avatarHer.onerror = function() { self.herLoaded = true; };
      this.avatarHer.src = CONFIG.paths.avatarHer;
    } else {
      this.herLoaded = true;
    }
  }

  /* ===== 1. Avatar ===== */
  triggerAvatar(callback) {
    if (this.avatarDone || this.animating) return;
    this.avatarDone = true;
    this.animating = true;
    this._vibrate(30);

    this.avatarEgg.classList.add('active');
    this.avatarMe.classList.add('visible');
    this.avatarHer.classList.add('visible');

    var self = this;
    setTimeout(function() {
      self.avatarMe.classList.add('combined');
      self.avatarHer.classList.add('combined');
      self._mkRing();
      setTimeout(function() {
        self.animating = false;
        if (callback) callback();
      }, 2000);
    }, 1500);
  }

  _mkRing() {
    var cx = this.ps.cx, cy = this.ps.cy;
    var r = document.createElement('div');
    r.className = 'avatar-glow-ring';
    r.style.cssText = 'top:' + (cy-75) + 'px;left:' + (cx-75) + 'px;width:150px;height:150px';
    document.body.appendChild(r);
  }

  /* ===== 2. Photos ===== */
  triggerPhotos(callback) {
    if (this.photoDone || this.animating) return;
    this.photoDone = true;
    this.animating = true;
    this._vibrate(30);

    this.photoEgg.classList.add('active');
    var paths = CONFIG.paths.photos;
    var cx = this.ps.cx, cy = this.ps.cy;
    var self = this;

    paths.forEach(function(path, i) {
      var card = document.createElement('img');
      card.className = 'photo-card';
      card.src = path;
      card.loading = 'lazy';
      var angle = (i / paths.length) * Math.PI * 2 - Math.PI / 2;
      var radius = Math.min(self.ps.W, self.ps.H) * 0.16;
      card.style.cssText =
        'left:' + (cx + Math.cos(angle) * radius - 65) + 'px;' +
        'top:' + (cy + Math.sin(angle) * radius * 0.8 - 92) + 'px;' +
        'transform:rotate(' + ((i - (paths.length-1)/2) * 10) + 'deg);' +
        'transition-delay:' + (i * 0.3) + 's';
      card.addEventListener('click', function() { self._openPhoto(path); });
      card.addEventListener('load', function() {
        setTimeout(function() { card.classList.add('visible'); }, 600 + i * 350);
      });
      self.photoEgg.appendChild(card);
    });

    setTimeout(function() {
      self.animating = false;
      if (callback) callback();
    }, 4000);
  }

  _openPhoto(path) {
    this.photoViewerImg.src = path;
    this.photoViewer.classList.add('active');
    this._vibrate(15);
  }

  closeViewer() { this.photoViewer.classList.remove('active'); }

  /* ===== 3. Video ===== */
  triggerVideo(callback) {
    var self = this;
    this.photoEgg.classList.remove('active');
    this.avatarEgg.classList.remove('active');

    if (this.music) this.music.pause();

    setTimeout(function() {
      self.video.play(function() {
        if (self.music) self.music.resume();
        if (callback) callback();
      });
    }, 500);
  }

  /* ===== 4. Final ===== */
  triggerFinal() {
    if (this.finalDone) return;
    this.finalDone = true;
    this._vibrate(40);
    var self = this;

    setTimeout(function() {
      self.finalScreen.classList.add('active');
      setTimeout(function() { self.finalLine1.classList.add('visible'); }, 800);
      setTimeout(function() { self.finalLine2.classList.add('visible'); }, 2200);
      setTimeout(function() {
        self.finalLine1.classList.remove('visible');
        self.finalLine2.classList.remove('visible');
        setTimeout(function() {
          self.finalScreen.classList.remove('active');
          // 鍥炲綊锛氭樉绀哄ご鍍忓拰鐓х墖鍗＄墖
          self._showFinalScene();
        }, 1200);
      }, CONFIG.timing.finalDisplay);
    }, 500);
  }

  /* ===== 鍥炲綊鍦烘櫙锛氬ご鍍?+ 鐓х墖鍗＄墖 ===== */
  _showFinalScene() {
    this.avatarEgg.classList.add('active');
    this.photoEgg.classList.add('active');
    var cards = document.querySelectorAll('.photo-card');
    for (var i = 0; i < cards.length; i++) {
      cards[i].classList.add('visible');
    }
  }

    _bindRipple() {
    var self = this;
    document.addEventListener('click', function(e) { self._spawnRipple(e.clientX, e.clientY); });
    document.addEventListener('touchstart', function(e) {
      var touch = e.touches[0];
      if (touch) self._spawnRipple(touch.clientX, touch.clientY);
    }, { passive: true });
  }

  _spawnRipple(x, y) {
    var el = document.createElement('div');
    el.style.cssText = 'position:fixed;left:' + (x-15) + 'px;top:' + (y-15) + 'px;width:30px;height:30px;border-radius:50%;border:2px solid rgba(255,180,210,0.5);z-index:60;pointer-events:none;animation:rippleAnim 0.8s ease-out forwards';
    document.body.appendChild(el);
    setTimeout(function() { if (el.parentNode) el.parentNode.removeChild(el); }, 900);
  }

  _vibrate(ms) { try { navigator.vibrate && navigator.vibrate(ms); } catch(e) {} }
  _toast(msg) {
    this.toast.textContent = msg;
    this.toast.classList.add('visible');
    setTimeout(function() { this.toast.classList.remove('visible'); }.bind(this), 1500);
  }
}

window.EasterEggManager = EasterEggManager;


