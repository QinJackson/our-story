/**
 * 首页仪表盘模块
 * 今日记录卡片 + 未来信件入口 + 功能导航
 */

function HomeManager(diary, futureLetter, mood, gallery, calendar) {
  this.diary = diary;
  this.futureLetter = futureLetter;
  this.mood = mood;
  this.gallery = gallery;
  this.calendar = calendar;
  this.container = null;
  this.visible = false;
}

/* ===== 显示首页（主流程结束后） ===== */
HomeManager.prototype.show = function() {
  if (this.visible) return;
  this.visible = true;

  // 隐藏主流程遗留的高层级元素,避免遮挡首页与底部导航
  var legacyIds = ['final-screen', 'photo-egg', 'avatar-egg', 'story-title', 'timeline-container', 'photo-viewer', 'egg-toast'];
  for (var i = 0; i < legacyIds.length; i++) {
    var el = document.getElementById(legacyIds[i]);
    if (el) el.style.display = 'none';
  }
  // 隐藏视频播放器(MV 结束后残留)
  var videos = document.querySelectorAll('video');
  for (var j = 0; j < videos.length; j++) {
    try { videos[j].pause(); } catch(e) {}
    videos[j].style.display = 'none';
  }
  // 禁用主画布与 UI 层的指针事件,避免遮挡 Phase 3 界面
  var mainCanvas = document.getElementById('main-canvas');
  if (mainCanvas) mainCanvas.style.pointerEvents = 'none';
  var uiLayer = document.getElementById('ui-layer');
  if (uiLayer) uiLayer.style.pointerEvents = 'none';

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
  var self = this;
  var card = document.getElementById('home-today-card');
  if (!card) return;

  var latest = this.diary ? this.diary.getLatest() : null;

  if (!latest) {
    card.innerHTML =
      '<div class="home-card-header">今日记录</div>' +
      '<div class="home-card-empty">还没有日记，写下第一篇吧 ✍️</div>';
    card.addEventListener('click', function() {
      self._showSection('diary');
    });
    return;
  }

  card.innerHTML =
    '<div class="home-card-date">' + this._formatDate(latest.date) + '</div>' +
    '<div class="home-card-title">' + latest.title + '</div>' +
    (latest.mood ? '<div class="home-card-mood">' + latest.mood + '</div>' : '') +
    '<div class="home-card-preview">' + this._trim(latest.content, 60) + '</div>' +
    '<div class="home-card-link">查看完整日记 →</div>';

  card.addEventListener('click', function() {
    self._showSection('diary');
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

  // 日历
  var calendarBtn = document.getElementById('nav-calendar');
  if (calendarBtn) {
    calendarBtn.addEventListener('click', function() {
      self._showSection('calendar');
    });
  }
};

HomeManager.prototype._setNavActive = function(section) {
  var navItems = document.querySelectorAll('#bottom-nav .nav-item');
  for (var i = 0; i < navItems.length; i++) navItems[i].classList.remove('active');
  var navMap = { home: 'nav-home', diary: 'nav-diary', mood: 'nav-mood', gallery: 'nav-gallery', calendar: 'nav-calendar' };
  var btn = document.getElementById(navMap[section]);
  if (btn) btn.classList.add('active');
};

HomeManager.prototype._showSection = function(section) {
  var self = this;
  var home = document.getElementById('home-dashboard');
  if (!home) return;

  this._setNavActive(section);

  if (section === 'home') {
    home.classList.add('active');
    this._renderTodayCard();
    return;
  }

  // 进入子模块时隐藏首页
  home.classList.remove('active');

  // 子模块关闭后回到首页
  var backHome = function() {
    self._setNavActive('home');
    home.classList.add('active');
  };

  if (section === 'diary' && this.diary) {
    this.diary.open(backHome);
  } else if (section === 'mood' && this.mood) {
    this.mood.open(backHome);
  } else if (section === 'gallery' && this.gallery) {
    this.gallery.open(backHome);
  } else if (section === 'calendar' && this.calendar) {
    this.calendar.open(backHome);
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
