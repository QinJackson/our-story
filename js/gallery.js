/**
 * 回忆相册模块
 * 收集日记中的照片 + 原有照片，全屏浏览滑动切换
 */

function GalleryManager() {
  this.container = null;
  this.onBack = null;
  this.photos = [];
  this.currentIndex = 0;
}

/* ===== 打开相册 ===== */
GalleryManager.prototype.open = function(onBack) {
  var self = this;
  this.onBack = onBack || null;

  this._collectPhotos();

  var overlay = document.createElement('div');
  overlay.className = 'gallery-overlay';
  document.body.appendChild(overlay);
  this.container = overlay;

  if (this.photos.length === 0) {
    overlay.innerHTML =
      '<div class="gallery-header"><button class="gallery-back" id="gallery-back">‹ 返回</button></div>' +
      '<div class="gallery-empty">还没有照片，快去日记里添加吧</div>';
    overlay.querySelector('#gallery-back').addEventListener('click', function() { self.close(); });
    return;
  }

  overlay.innerHTML =
    '<div class="gallery-header">' +
      '<button class="gallery-back" id="gallery-back">‹ 返回</button>' +
      '<span class="gallery-count" id="gallery-count">1 / ' + this.photos.length + '</span>' +
    '</div>' +
    '<div class="gallery-stage" id="gallery-stage">' +
      '<div class="gallery-track" id="gallery-track"></div>' +
    '</div>' +
    '<div class="gallery-dots" id="gallery-dots"></div>';

  overlay.querySelector('#gallery-back').addEventListener('click', function() { self.close(); });

  this._renderTrack();
  this._bindSwipe();
  this._goTo(0);
};

GalleryManager.prototype.close = function() {
  if (this.container && this.container.parentNode) {
    this.container.parentNode.removeChild(this.container);
  }
  this.container = null;
  if (this.onBack) this.onBack();
};

/* ===== 收集照片 ===== */
GalleryManager.prototype._collectPhotos = function() {
  this.photos = [];

  // 原有照片
  var existing = CONFIG.paths.photos || [];
  existing.forEach(function(p) { self.photos.push(p); });

  // 日记照片（需要从全局拿到 diary 数据）
  var self = this;
  if (window.__diaryData && window.__diaryData.entries) {
    window.__diaryData.entries.forEach(function(entry) {
      if (entry.photos) {
        entry.photos.forEach(function(p) {
          if (self.photos.indexOf(p) === -1) self.photos.push(p);
        });
      }
    });
  }

  // 去重
  this.photos = this.photos.filter(function(v, i, a) { return a.indexOf(v) === i; });
};

/* ===== 渲染 ===== */
GalleryManager.prototype._renderTrack = function() {
  var track = document.getElementById('gallery-track');
  if (!track) return;

  track.innerHTML = '';
  var self = this;

  this.photos.forEach(function(p, i) {
    var item = document.createElement('div');
    item.className = 'gallery-item';
    item.innerHTML = '<img src="' + p + '" alt="" data-index="' + i + '">';
    track.appendChild(item);
  });

  // 圆点
  var dots = document.getElementById('gallery-dots');
  if (dots) {
    dots.innerHTML = '';
    this.photos.forEach(function(_, i) {
      var dot = document.createElement('span');
      dot.className = 'gallery-dot';
      dot.dataset.index = i;
      dot.addEventListener('click', function() {
        self._goTo(parseInt(this.dataset.index, 10));
      });
      dots.appendChild(dot);
    });
  }
};

/* ===== 滑动切换 ===== */
GalleryManager.prototype._bindSwipe = function() {
  var self = this;
  var stage = document.getElementById('gallery-stage');
  if (!stage) return;

  var startX = 0;
  var isDragging = false;

  stage.addEventListener('touchstart', function(e) {
    startX = e.touches[0].clientX;
    isDragging = true;
  }, { passive: true });

  stage.addEventListener('touchmove', function(e) {
    if (!isDragging) return;
    var dx = e.touches[0].clientX - startX;
    var track = document.getElementById('gallery-track');
    if (track) {
      track.style.transform = 'translateX(calc(' + (-self.currentIndex * 100) + '% + ' + dx + 'px))';
    }
  }, { passive: true });

  stage.addEventListener('touchend', function(e) {
    if (!isDragging) return;
    isDragging = false;
    var dx = e.changedTouches[0].clientX - startX;
    if (dx < -50) self._goTo(self.currentIndex + 1);
    else if (dx > 50) self._goTo(self.currentIndex - 1);
    else self._goTo(self.currentIndex);
  }, { passive: true });

  // 桌面支持
  stage.addEventListener('mousedown', function(e) {
    startX = e.clientX;
    isDragging = true;
  });
  stage.addEventListener('mousemove', function(e) {
    if (!isDragging) return;
    var dx = e.clientX - startX;
    var track = document.getElementById('gallery-track');
    if (track) {
      track.style.transform = 'translateX(calc(' + (-self.currentIndex * 100) + '% + ' + dx + 'px))';
    }
  });
  stage.addEventListener('mouseup', function(e) {
    if (!isDragging) return;
    isDragging = false;
    var dx = e.clientX - startX;
    if (dx < -50) self._goTo(self.currentIndex + 1);
    else if (dx > 50) self._goTo(self.currentIndex - 1);
    else self._goTo(self.currentIndex);
  });
};

GalleryManager.prototype._goTo = function(index) {
  if (index < 0 || index >= this.photos.length) {
    this._goTo(this.currentIndex);
    return;
  }

  this.currentIndex = index;
  var track = document.getElementById('gallery-track');
  if (track) {
    track.style.transform = 'translateX(-' + (index * 100) + '%)';
  }

  var count = document.getElementById('gallery-count');
  if (count) count.textContent = (index + 1) + ' / ' + this.photos.length;

  var dots = document.querySelectorAll('.gallery-dot');
  for (var i = 0; i < dots.length; i++) {
    dots[i].classList.toggle('active', i === index);
  }
};

window.GalleryManager = GalleryManager;
