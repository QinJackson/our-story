/**
 * 回忆相册模块
 * 网格缩略图列表 + 点击全屏放大滑动浏览
 * 支持 IndexedDB 图片异步加载
 */

function GalleryManager() {
  this.container = null;   // 网格视图容器
  this.viewer = null;      // 全屏查看器
  this.onBack = null;
  this.photos = [];        // [{ src, isPhotoId, id }]
  this.currentIndex = 0;
}

/* ===== 打开相册（网格视图） ===== */
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
      '<div class="gallery-header">' +
        '<button class="gallery-back" id="gallery-back">‹ 返回</button>' +
        '<span class="gallery-title">相册</span><span></span>' +
      '</div>' +
      '<div class="gallery-empty">还没有照片，快去日记里添加吧</div>';
    overlay.querySelector('#gallery-back').addEventListener('click', function() { self.close(); });
    return;
  }

  this._renderGrid();
};

GalleryManager.prototype.close = function() {
  if (this.viewer) this._closeViewer();
  if (this.container && this.container.parentNode) {
    this.container.parentNode.removeChild(this.container);
  }
  this.container = null;
  if (this.onBack) this.onBack();
};

/* ===== 收集照片 ===== */
GalleryManager.prototype._collectPhotos = function() {
  var self = this;
  this.photos = [];
  var diary = window.__diary;
  var photoStore = diary && diary.photoStore ? diary.photoStore : null;

  // 原有照片（URL 路径）
  var existing = CONFIG.paths.photos || [];
  existing.forEach(function(p) {
    self.photos.push({ src: p, isPhotoId: false, id: null });
  });

  // 日记照片
  if (window.__diaryData && window.__diaryData.entries) {
    window.__diaryData.entries.forEach(function(entry) {
      if (entry.photos) {
        entry.photos.forEach(function(p) {
          var exists = self.photos.some(function(ph) { return ph.src === p || ph.id === p; });
          if (!exists) {
            if (photoStore && photoStore.isPhotoId(p)) {
              self.photos.push({ src: '', isPhotoId: true, id: p });
            } else {
              self.photos.push({ src: p, isPhotoId: false, id: null });
            }
          }
        });
      }
    });
  }
};

/* ===== 渲染缩略图网格 ===== */
GalleryManager.prototype._renderGrid = function() {
  var self = this;
  var overlay = this.container;
  overlay.innerHTML =
    '<div class="gallery-header">' +
      '<button class="gallery-back" id="gallery-back">‹ 返回</button>' +
      '<span class="gallery-title">相册</span>' +
      '<span class="gallery-count">' + this.photos.length + ' 张</span>' +
    '</div>' +
    '<div class="gallery-grid" id="gallery-grid"></div>';

  overlay.querySelector('#gallery-back').addEventListener('click', function() { self.close(); });

  var grid = overlay.querySelector('#gallery-grid');
  this.photos.forEach(function(photo, i) {
    var thumb = document.createElement('div');
    thumb.className = 'gallery-thumb';
    thumb.dataset.index = i;
    if (photo.isPhotoId) {
      thumb.innerHTML = '<img alt="" data-photo-id="' + photo.id + '">';
    } else {
      thumb.innerHTML = '<img src="' + photo.src + '" alt="">';
    }
    thumb.addEventListener('click', function() {
      self._openViewer(parseInt(this.dataset.index, 10));
    });
    grid.appendChild(thumb);
  });

  this._loadPhotosAsync(grid);
};

/* 异步加载容器内 IndexedDB 图片 */
GalleryManager.prototype._loadPhotosAsync = function(container) {
  var diary = window.__diary;
  if (!diary || !diary.photoStore || !diary.photoStore.ready) return;
  var imgs = container.querySelectorAll('img[data-photo-id]');
  for (var i = 0; i < imgs.length; i++) {
    (function(img) {
      var id = img.getAttribute('data-photo-id');
      diary.photoStore.get(id, function(data) {
        if (data) img.src = data;
      });
    })(imgs[i]);
  }
};

/* ===== 打开全屏查看器 ===== */
GalleryManager.prototype._openViewer = function(index) {
  var self = this;
  this.currentIndex = index;

  var viewer = document.createElement('div');
  viewer.className = 'gallery-viewer';
  viewer.innerHTML =
    '<div class="gallery-header">' +
      '<button class="gallery-back" id="viewer-back">‹ 返回</button>' +
      '<span class="gallery-count" id="viewer-count">' + (index + 1) + ' / ' + this.photos.length + '</span>' +
      '<span></span>' +
    '</div>' +
    '<div class="gallery-stage" id="viewer-stage">' +
      '<div class="gallery-track" id="viewer-track"></div>' +
    '</div>' +
    '<div class="gallery-dots" id="viewer-dots"></div>';

  document.body.appendChild(viewer);
  this.viewer = viewer;

  viewer.querySelector('#viewer-back').addEventListener('click', function() { self._closeViewer(); });

  this._renderTrack();
  this._bindSwipe();
  this._goTo(index);
};

GalleryManager.prototype._closeViewer = function() {
  if (this.viewer && this.viewer.parentNode) {
    this.viewer.parentNode.removeChild(this.viewer);
  }
  this.viewer = null;
};

/* ===== 渲染全屏轨道 ===== */
GalleryManager.prototype._renderTrack = function() {
  if (!this.viewer) return;
  var track = this.viewer.querySelector('#viewer-track');
  if (!track) return;
  track.innerHTML = '';
  var self = this;

  this.photos.forEach(function(photo, i) {
    var item = document.createElement('div');
    item.className = 'gallery-item';
    if (photo.isPhotoId) {
      item.innerHTML = '<img alt="" data-photo-id="' + photo.id + '">';
    } else {
      item.innerHTML = '<img src="' + photo.src + '" alt="">';
    }
    track.appendChild(item);
  });

  this._loadPhotosAsync(track);

  var dots = this.viewer.querySelector('#viewer-dots');
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
  if (!this.viewer) return;
  var self = this;
  var stage = this.viewer.querySelector('#viewer-stage');
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
    var track = self.viewer.querySelector('#viewer-track');
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

  stage.addEventListener('mousedown', function(e) {
    startX = e.clientX;
    isDragging = true;
  });
  stage.addEventListener('mousemove', function(e) {
    if (!isDragging) return;
    var dx = e.clientX - startX;
    var track = self.viewer.querySelector('#viewer-track');
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
  if (!this.viewer) return;

  var track = this.viewer.querySelector('#viewer-track');
  if (track) {
    track.style.transform = 'translateX(-' + (index * 100) + '%)';
  }

  var count = this.viewer.querySelector('#viewer-count');
  if (count) count.textContent = (index + 1) + ' / ' + this.photos.length;

  var dots = this.viewer.querySelectorAll('.gallery-dot');
  for (var i = 0; i < dots.length; i++) {
    dots[i].classList.toggle('active', i === index);
  }
};

window.GalleryManager = GalleryManager;
