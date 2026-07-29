
class MusicManager {
  constructor() {
    this.audio = null;
    this.playing = false;
    this.loaded = false;
    this.blocked = true;
    this.fadeTimer = null;
    this.btn = document.getElementById('music-toggle');
    this._init();
  }

  _init() {
    var a = new Audio();
    a.loop = true;
    a.volume = 0;
    a.preload = 'auto';
    this.audio = a;
    this._load();

    this.btn.addEventListener('click', function(self) {
      return function() { self.toggle(); };
    }(this));

    document.addEventListener('touchstart', function(self) {
      return function() { if (self.blocked && self.loaded) self._autoplay(); };
    }(this), { once: true });
    document.addEventListener('click', function(self) {
      return function() { if (self.blocked && self.loaded) self._autoplay(); };
    }(this), { once: true });
  }

  _load() {
    var self = this;
    this.audio.src = CONFIG.paths.music;
    this.audio.addEventListener('canplaythrough', function() {
      self.loaded = true;
      self.btn.classList.add('visible');
      self._autoplay();
    });
    this.audio.addEventListener('error', function() {
      self.btn.classList.add('visible');
    });
    this.audio.load();
  }

  _autoplay() {
    if (!this.loaded || !this.audio) return;
    var self = this;
    this.audio.play().then(function() {
      self.blocked = false;
      self._fadeIn();
      self.playing = true;
      self.btn.classList.add('playing');
    }).catch(function() {});
  }

  toggle() {
    if (!this.loaded || !this.audio) return;
    var self = this;
    if (this.playing) {
      this._fadeOut();
    } else {
      this.audio.play().then(function() {
        self._fadeIn();
        self.playing = true;
        self.btn.classList.add('playing');
      }).catch(function() {});
    }
  }

  _fadeIn() {
    if (this.fadeTimer) clearInterval(this.fadeTimer);
    var v = this.audio.volume;
    var self = this;
    this.fadeTimer = setInterval(function() {
      v += 0.025;
      if (v >= 0.35) { v = 0.35; clearInterval(self.fadeTimer); self.fadeTimer = null; }
      self.audio.volume = v;
    }, 80);
  }

  _fadeOut() {
    if (this.fadeTimer) clearInterval(this.fadeTimer);
    var v = this.audio.volume;
    var self = this;
    this.fadeTimer = setInterval(function() {
      v -= 0.03;
      if (v <= 0.01) {
        v = 0;
        clearInterval(self.fadeTimer);
        self.fadeTimer = null;
        self.audio.pause();
        self.playing = false;
        self.btn.classList.remove('playing');
      }
      self.audio.volume = v;
    }, 80);
  }

  pause() {
    if (this.audio && this.playing) {
      this.audio.pause();
      this.playing = false;
      this.btn.classList.remove('playing');
    }
  }

  resume() {
    var self = this;
    if (!this.loaded || !this.audio) return;
    this.audio.play().then(function() {
      self.audio.volume = 0.35;
      self.playing = true;
      self.btn.classList.add('playing');
    }).catch(function() {});
  }

  play() {
    if (!this.loaded || !this.audio || this.playing) return;
    var self = this;
    this.audio.play().then(function() {
      self.audio.volume = 0.35;
      self.playing = true;
      self.btn.classList.add('playing');
      self.blocked = false;
    }).catch(function() {});
  }
}

window.MusicManager = MusicManager;
