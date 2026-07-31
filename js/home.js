/**
 * 首页仪表盘模块
 * 今日记录卡片 + 未来信件入口 + 功能导航
 */

function HomeManager(diary, futureLetter, mood, gallery) {
  this.diary = diary;
  this.futureLetter = futureLetter;
  this.mood = mood;
  this.gallery = gallery;
  this.container = null;
  this.visible = false;
}

/* ===== 显示首页（主流程结束后） ===== */
HomeManager.prototype.show = function() {
  if (this.visible) return;
  this.visible = true;

  // 显示底部导航
  var nav = document.getElementById('bottom-nav');
  if (nav) nav.classList.add('active');

  // 显示首页
  var home = document.getElementById('home-dashboard');
  if (home) home.classList.add('active');

  this._renderTodayCard();
  this._bindNav();
};

HomeManager.prototype.hide = function() {
  this.visible = false;
  var nav = document.getElementById('bottom-nav');
  if (nav) nav.classList.remove('active');
  var home = document.getElementById('home-dashboard');
  if (home) home.classList.remove('active');
};

/* ===== 渲染今日记录卡片 ===== */
HomeManager.prototype._renderTodayCard = function() {
  var card = document.getElementById('home-today-card');
  if (!card) return;

  var latest = this.diary ? this.diary.getLatest() : null;

  if (!latest) {
    card.innerHTML =
      '<div class="home-card-header">今日记录</div>' +
      '<div class="home-card-empty">还没有日记，写下第一篇吧 ✍️</div>';
    return;
  }

  card.innerHTML =
    '<div class="home-card-date">' + this._formatDate(latest.date) + '</div>' +
    '<div class="home-card-title">' + latest.title + '</div>' +
    (latest.mood ? '<div class="home-card-mood">' + latest.mood + '</div>' : '') +
    '<div class="home-card-preview">' + this._trim(latest.content, 60) + '</div>' +
    '<div class="home-card-link">查看完整日记 →</div>';

  card.addEventListener('click', function() {
    var diaryMgr = window.__diary;
    if (diaryMgr) {
      diaryMgr.open(function() {});
    }
  });
};

/* ===== 底部导航 ===== */
HomeManager.prototype._bindNav = function() {
  var self = this;
  var nav = document.getElementById('bottom-nav');
  if (!nav) return;

  // 首页
  var homeBtn = document.getElementById('nav-home');
  if (homeBtn) {
    homeBtn.addEventListener('click', function() {
      self._showSection('home');
    });
  }

  // 日记
  var diaryBtn = document.getElementById('nav-diary');
  if (diaryBtn) {
    diaryBtn.addEventListener('click', function() {
      self._showSection('diary');
    });
  }

  // 心情
  var moodBtn = document.getElementById('nav-mood');
  if (moodBtn) {
    moodBtn.addEventListener('click', function() {
      self._showSection('mood');
    });
  }

  // 相册
  var galleryBtn = document.getElementById('nav-gallery');
  if (galleryBtn) {
    galleryBtn.addEventListener('click', function() {
      self._showSection('gallery');
    });
  }
};

HomeManager.prototype._showSection = function(section) {
  var home = document.getElementById('home-dashboard');
  if (!home) return;

  if (section === 'home') {
    home.classList.add('active');
    this._renderTodayCard();
    return;
  }

  // 进入子模块时隐藏首页
  home.classList.remove('active');

  if (section === 'diary' && this.diary) {
    this.diary.open(function() { home.classList.add('active'); });
  } else if (section === 'mood' && this.mood) {
    this.mood.open(function() { home.classList.add('active'); });
  } else if (section === 'gallery' && this.gallery) {
    this.gallery.open(function() { home.classList.add('active'); });
  }
};

/* ===== 工具 ===== */
HomeManager.prototype._formatDate = function(dateStr) {
  if (!dateStr) return '';
  var parts = dateStr.split('-');
  if (parts.length === 3) {
    return parts[0] + '年' + parseInt(parts[1], 10) + '月' + parseInt(parts[2], 10) + '日';
  }
  return dateStr;
};

HomeManager.prototype._trim = function(text, len) {
  if (!text) return '';
  text = text.replace(/\n/g, ' ');
  return text.length > len ? text.substring(0, len) + '…' : text;
};

window.HomeManager = HomeManager;
