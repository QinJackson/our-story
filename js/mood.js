/**
 * 心情记录模块
 * Emoji 记录当天心情 + 简单统计
 */

function MoodManager() {
  this.container = null;
  this.onBack = null;
  this.moods = [];
  this.storageKey = 'ourstory_moods';
  this.moodOptions = [
    { emoji: '😊', label: '开心' },
    { emoji: '💕', label: '心动' },
    { emoji: '✨', label: '美好' },
    { emoji: '😌', label: '平静' },
    { emoji: '🥰', label: '甜蜜' },
    { emoji: '😔', label: '低落' },
    { emoji: '😴', label: '疲惫' },
    { emoji: '🎉', label: '兴奋' }
  ];
  this._load();
}

MoodManager.prototype._load = function() {
  try {
    var saved = localStorage.getItem(this.storageKey);
    if (saved) this.moods = JSON.parse(saved);
  } catch(e) {
    this.moods = [];
  }
};

MoodManager.prototype._save = function() {
  try {
    localStorage.setItem(this.storageKey, JSON.stringify(this.moods));
  } catch(e) {}
};

MoodManager.prototype.open = function(onBack) {
  var self = this;
  this.onBack = onBack || null;

  var overlay = document.createElement('div');
  overlay.className = 'mood-overlay';
  document.body.appendChild(overlay);
  this.container = overlay;

  overlay.innerHTML =
    '<div class="mood-header"><button class="mood-back" id="mood-back">‹ 返回</button><div class="mood-title-small">心情记录</div></div>' +
    '<div class="mood-body">' +
      '<div class="mood-today-title">今天的心情是？</div>' +
      '<div class="mood-options" id="mood-options"></div>' +
      '<div class="mood-stats" id="mood-stats"></div>' +
    '</div>';

  overlay.querySelector('#mood-back').addEventListener('click', function() {
    self.close();
  });

  this._renderOptions();
  this._renderStats();
};

MoodManager.prototype.close = function() {
  if (this.container && this.container.parentNode) {
    this.container.parentNode.removeChild(this.container);
  }
  this.container = null;
  if (this.onBack) this.onBack();
};

MoodManager.prototype._renderOptions = function() {
  var self = this;
  var el = document.getElementById('mood-options');
  if (!el) return;

  var today = this._today();
  var todayMood = this._getMoodForDate(today);

  el.innerHTML = '';
  this.moodOptions.forEach(function(option) {
    var btn = document.createElement('button');
    btn.className = 'mood-option' + (todayMood && todayMood.emoji === option.emoji ? ' selected' : '');
    btn.innerHTML = '<span class="mood-emoji">' + option.emoji + '</span><span class="mood-label">' + option.label + '</span>';
    btn.addEventListener('click', function() {
      self._record(today, option.emoji);
      self._renderOptions();
      self._renderStats();
    });
    el.appendChild(btn);
  });
};

MoodManager.prototype._renderStats = function() {
  var self = this;
  var el = document.getElementById('mood-stats');
  if (!el) return;

  if (this.moods.length === 0) {
    el.innerHTML = '<div class="mood-stats-empty">还没有记录，从今天开始吧</div>';
    return;
  }

  // 统计
  var counts = {};
  this.moods.forEach(function(m) {
    counts[m.emoji] = (counts[m.emoji] || 0) + 1;
  });

  var html = '<div class="mood-stats-title">记录统计</div>' +
             '<div class="mood-stats-count">共 ' + this.moods.length + ' 天</div>' +
             '<div class="mood-stats-list">';
  this.moodOptions.forEach(function(option) {
    var c = counts[option.emoji] || 0;
    if (c > 0) {
      var pct = Math.round(c / self.moods.length * 100);
      html += '<div class="mood-stat-item">' +
                '<span class="mood-stat-emoji">' + option.emoji + '</span>' +
                '<span class="mood-stat-bar"><span class="mood-stat-fill" style="width:' + pct + '%"></span></span>' +
                '<span class="mood-stat-count">' + c + '天</span>' +
              '</div>';
    }
  });
  html += '</div>';

  // 最近7天
  html += '<div class="mood-week-title">最近记录</div><div class="mood-week">';
  for (var i = 6; i >= 0; i--) {
    var d = new Date();
    d.setDate(d.getDate() - i);
    var key = this._dateKey(d);
    var m = this._getMoodForDate(key);
    html += '<div class="mood-week-item' + (i === 0 ? ' today' : '') + '">' +
              '<div class="mood-week-day">' + this._weekday(d) + '</div>' +
              '<div class="mood-week-emoji">' + (m ? m.emoji : '·') + '</div>' +
            '</div>';
  }
  html += '</div>';

  el.innerHTML = html;
};

MoodManager.prototype._record = function(date, emoji) {
  // 移除同一天旧记录
  this.moods = this.moods.filter(function(m) { return m.date !== date; });
  this.moods.push({ date: date, emoji: emoji, time: Date.now() });
  this._save();
};

MoodManager.prototype._getMoodForDate = function(date) {
  for (var i = 0; i < this.moods.length; i++) {
    if (this.moods[i].date === date) return this.moods[i];
  }
  return null;
};

MoodManager.prototype._today = function() {
  return this._dateKey(new Date());
};

MoodManager.prototype._dateKey = function(d) {
  var m = d.getMonth() + 1;
  var day = d.getDate();
  var mm = m < 10 ? '0' + m : '' + m;
  var dd = day < 10 ? '0' + day : '' + day;
  return d.getFullYear() + '-' + mm + '-' + dd;
};

MoodManager.prototype._weekday = function(d) {
  var names = ['日', '一', '二', '三', '四', '五', '六'];
  return '周' + names[d.getDay()];
};

window.MoodManager = MoodManager;
