/**
 * 我们的日记模块
 * 故事书翻页动画 + 日记列表 + 详情
 */

function DiaryManager() {
  this.data = null;
  this.entries = [];
  this.container = null;
  this.book = null;
  this.currentPage = 0;
  this.isFlipping = false;
  this.onBack = null;
  this.loaded = false;
}

/* ===== 加载数据 ===== */
DiaryManager.prototype.load = function(callback) {
  var self = this;
  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'data/diary.json', true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      if (xhr.status === 200 || xhr.status === 0) {
        try {
          self.data = JSON.parse(xhr.responseText);
          self.entries = self.data.entries || [];
          // 倒序：最新在前
          self.entries.sort(function(a, b) { return b.id - a.id; });
          self.loaded = true;
          if (callback) callback();
        } catch(e) {
          console.warn('Diary data parse error:', e.message);
          if (callback) callback();
        }
      } else {
        console.warn('Diary load failed:', xhr.status);
        if (callback) callback();
      }
    }
  };
  xhr.send();
};

/* ===== 打开日记 ===== */
DiaryManager.prototype.open = function(onBack) {
  var self = this;
  this.onBack = onBack || null;

  var overlay = document.createElement('div');
  overlay.className = 'diary-overlay';
  overlay.innerHTML =
    '<div class="diary-header">' +
      '<button class="diary-back" id="diary-back">‹ 返回</button>' +
      '<div class="diary-title-small">我们的日记</div>' +
    '</div>' +
    '<div class="diary-book" id="diary-book"></div>' +
    '<div class="diary-nav">' +
      '<button class="diary-nav-btn" id="diary-prev">‹ 上一页</button>' +
      '<span class="diary-page-indicator" id="diary-page-ind">1 / 1</span>' +
      '<button class="diary-nav-btn" id="diary-next">下一页 ›</button>' +
    '</div>';

  document.body.appendChild(overlay);
  this.container = overlay;
  this.book = overlay.querySelector('#diary-book');

  // 绑定事件
  overlay.querySelector('#diary-back').addEventListener('click', function() {
    self.close();
  });
  overlay.querySelector('#diary-prev').addEventListener('click', function() {
    self.prevPage();
  });
  overlay.querySelector('#diary-next').addEventListener('click', function() {
    self.nextPage();
  });

  // 渲染书页
  this._renderBook();
};

DiaryManager.prototype.close = function() {
  if (this.container && this.container.parentNode) {
    this.container.parentNode.removeChild(this.container);
  }
  this.container = null;
  this.book = null;
  if (this.onBack) this.onBack();
};

/* ===== 渲染书 ===== */
DiaryManager.prototype._renderBook = function() {
  var self = this;
  if (!this.book) return;

  this.book.innerHTML = '';

  // 封面页
  var cover = document.createElement('div');
  cover.className = 'diary-page diary-cover';
  cover.innerHTML =
    '<div class="diary-cover-title">' + (this.data.intro ? this.data.intro.title : '我们的日记') + '</div>' +
    '<div class="diary-cover-sub">' + (this.data.intro ? this.data.intro.subtitle : '') + '</div>' +
    '<div class="diary-cover-text">' + (this.data.intro ? this.data.intro.coverText : '') + '</div>';
  this.book.appendChild(cover);

  // 日记页（每页一篇）
  this.entries.forEach(function(entry, i) {
    var page = document.createElement('div');
    page.className = 'diary-page diary-entry-page';
    page.dataset.id = entry.id;

    var mood = entry.mood ? '<div class="diary-entry-mood">' + entry.mood + '</div>' : '';
    var photos = '';
    if (entry.photos && entry.photos.length > 0) {
      photos = '<div class="diary-entry-photos">';
      entry.photos.forEach(function(p) {
        photos += '<img src="' + p + '" alt="" class="diary-entry-photo" data-src="' + p + '">';
      });
      photos += '</div>';
    }

    page.innerHTML =
      '<div class="diary-entry-date">' + self._formatDate(entry.date) + '</div>' +
      '<div class="diary-entry-title">' + entry.title + '</div>' +
      mood +
      '<div class="diary-entry-content">' + self._formatContent(entry.content) + '</div>' +
      photos;

    // 照片点击放大
    var imgs = page.querySelectorAll('.diary-entry-photo');
    for (var j = 0; j < imgs.length; j++) {
      imgs[j].addEventListener('click', function() {
        var src = this.getAttribute('data-src');
        self._showPhoto(src);
      });
    }

    self.book.appendChild(page);
  });

  // 封底
  var back = document.createElement('div');
  back.className = 'diary-page diary-back-cover';
  back.innerHTML = '<div class="diary-back-text">—— 未完待续 ——</div>';
  this.book.appendChild(back);

  this.totalPages = 1 + this.entries.length + 1; // 封面 + 日记 + 封底
  this.currentPage = 0;
  this._updatePage();
};

/* ===== 翻页 ===== */
DiaryManager.prototype.nextPage = function() {
  if (this.isFlipping) return;
  if (this.currentPage >= this.totalPages - 1) return;

  this.currentPage++;
  this.isFlipping = true;
  var self = this;

  // 触发翻页动画
  var pages = this.book.querySelectorAll('.diary-page');
  var current = pages[this.currentPage - 1];
  if (current) {
    current.classList.add('flip-out');
  }
  var next = pages[this.currentPage];
  if (next) {
    next.classList.add('flip-in');
  }

  setTimeout(function() {
    self._updatePage();
    self.isFlipping = false;
  }, 500);
};

DiaryManager.prototype.prevPage = function() {
  if (this.isFlipping) return;
  if (this.currentPage <= 0) return;

  this.currentPage--;
  this.isFlipping = true;
  var self = this;

  var pages = this.book.querySelectorAll('.diary-page');
  var current = pages[this.currentPage + 1];
  if (current) {
    current.classList.remove('flip-in');
  }
  var prev = pages[this.currentPage];
  if (prev) {
    prev.classList.remove('flip-out');
  }

  setTimeout(function() {
    self._updatePage();
    self.isFlipping = false;
  }, 300);
};

DiaryManager.prototype._updatePage = function() {
  var pages = this.book.querySelectorAll('.diary-page');
  for (var i = 0; i < pages.length; i++) {
    if (i < this.currentPage) {
      pages[i].classList.add('done');
      pages[i].classList.remove('active');
    } else if (i === this.currentPage) {
      pages[i].classList.add('active');
      pages[i].classList.remove('done');
    } else {
      pages[i].classList.remove('active', 'done');
    }
  }
  var ind = document.getElementById('diary-page-ind');
  if (ind) ind.textContent = (this.currentPage + 1) + ' / ' + this.totalPages;
};

/* ===== 工具 ===== */
DiaryManager.prototype._formatDate = function(dateStr) {
  if (!dateStr) return '';
  var parts = dateStr.split('-');
  if (parts.length === 3) {
    return parts[0] + '年' + parseInt(parts[1], 10) + '月' + parseInt(parts[2], 10) + '日';
  }
  return dateStr;
};

DiaryManager.prototype._formatContent = function(content) {
  if (!content) return '';
  return content.replace(/\n/g, '<br>');
};

DiaryManager.prototype._showPhoto = function(src) {
  var viewer = document.createElement('div');
  viewer.className = 'diary-photo-viewer';
  viewer.innerHTML = '<img src="' + src + '" alt=""><div class="close">✕</div>';
  viewer.addEventListener('click', function() {
    if (viewer.parentNode) viewer.parentNode.removeChild(viewer);
  });
  document.body.appendChild(viewer);
};

/* ===== 获取最新日记（首页卡片用） ===== */
DiaryManager.prototype.getLatest = function() {
  if (!this.loaded || this.entries.length === 0) return null;
  return this.entries[0];
};

window.DiaryManager = DiaryManager;
