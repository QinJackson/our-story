/**
 * 日历模块
 * 月历视图,聚合日记/心情/照片,点击日期查看当天内容
 * 由 HomeManager 实例化,持有 diary / mood / gallery 的引用
 */

function CalendarManager(diary, mood, gallery) {
  this.diary = diary;
  this.mood = mood;
  this.gallery = gallery;
  this.container = null;
  this.onBack = null;
  this.viewDate = new Date();       // 当前显示的月份(任意日)
  this.selectedDate = null;         // 选中的日期 'YYYY-MM-DD'
}

CalendarManager.prototype.open = function(onBack) {
  this.onBack = onBack || null;
  var overlay = document.createElement('div');
  overlay.className = 'calendar-overlay';
  document.body.appendChild(overlay);
  this.container = overlay;
  this.viewDate = new Date();
  // 默认选中今天
  this.selectedDate = this._dateKey(new Date());
  this._render();
};

CalendarManager.prototype.close = function() {
  if (this.container && this.container.parentNode) {
    this.container.parentNode.removeChild(this.container);
  }
  this.container = null;
  if (this.onBack) this.onBack();
};

CalendarManager.prototype._render = function() {
  var self = this;
  this.container.innerHTML =
    '<div class="calendar-header">' +
      '<button class="calendar-back" id="cal-back">‹ 返回</button>' +
      '<div class="calendar-title">日历</div>' +
      '<button class="calendar-today-btn" id="cal-today">今天</button>' +
    '</div>' +
    '<div class="calendar-month-nav">' +
      '<button class="cal-month-btn" id="cal-prev">‹</button>' +
      '<div class="cal-month-label" id="cal-month-label"></div>' +
      '<button class="cal-month-btn" id="cal-next">›</button>' +
    '</div>' +
    '<div class="calendar-weekdays">' +
      '<span>日</span><span>一</span><span>二</span><span>三</span><span>四</span><span>五</span><span>六</span>' +
    '</div>' +
    '<div class="calendar-grid" id="cal-grid"></div>' +
    '<div class="calendar-legend">' +
      '<span class="cal-legend-item"><span class="cal-dot cal-dot-diary"></span>日记</span>' +
      '<span class="cal-legend-item"><span class="cal-legend-emoji">😊</span>心情</span>' +
      '<span class="cal-legend-item"><span class="cal-dot cal-dot-photo"></span>照片</span>' +
    '</div>' +
    '<div class="calendar-day-detail" id="cal-day-detail"></div>';

  this.container.querySelector('#cal-back').addEventListener('click', function() { self.close(); });
  this.container.querySelector('#cal-today').addEventListener('click', function() {
    self.viewDate = new Date();
    self.selectedDate = self._dateKey(new Date());
    self._renderMonth();
    self._renderDayDetail();
  });
  this.container.querySelector('#cal-prev').addEventListener('click', function() { self._changeMonth(-1); });
  this.container.querySelector('#cal-next').addEventListener('click', function() { self._changeMonth(1); });

  this._renderMonth();
  this._renderDayDetail();
};

CalendarManager.prototype._changeMonth = function(delta) {
  this.viewDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() + delta, 1);
  this._renderMonth();
};

CalendarManager.prototype._renderMonth = function() {
  var year = this.viewDate.getFullYear();
  var month = this.viewDate.getMonth();
  var label = this.container.querySelector('#cal-month-label');
  if (label) label.textContent = year + '年' + (month + 1) + '月';

  var grid = this.container.querySelector('#cal-grid');
  if (!grid) return;
  grid.innerHTML = '';

  var self = this;
  var todayKey = this._dateKey(new Date());
  var firstDay = new Date(year, month, 1).getDay();       // 本月 1 号是周几
  var daysInMonth = new Date(year, month + 1, 0).getDate(); // 本月天数
  var prevDays = new Date(year, month, 0).getDate();       // 上月天数

  // 上月尾部补格
  for (var i = firstDay - 1; i >= 0; i--) {
    var d = prevDays - i;
    var cell = this._mkCell(year, month - 1, d, true, todayKey);
    grid.appendChild(cell);
  }

  // 本月
  for (var day = 1; day <= daysInMonth; day++) {
    var cell2 = this._mkCell(year, month, day, false, todayKey);
    grid.appendChild(cell2);
  }

  // 下月头部补格至 6 行(42 格)
  var total = firstDay + daysInMonth;
  var tail = (7 - (total % 7)) % 7;
  for (var t = 1; t <= tail; t++) {
    var cell3 = this._mkCell(year, month + 1, t, true, todayKey);
    grid.appendChild(cell3);
  }
  // 不足 6 行补满
  var currentCells = grid.children.length;
  var fill = 42 - currentCells;
  for (var f = 1; f <= fill; f++) {
    var cell4 = this._mkCell(year, month + 1, tail + f, true, todayKey);
    grid.appendChild(cell4);
  }
};

CalendarManager.prototype._mkCell = function(year, month, day, isOther, todayKey) {
  var self = this;
  var realDate = new Date(year, month, day);
  var dateKey = this._dateKey(realDate);
  var info = this._getDayInfo(dateKey);
  var hasContent = info.hasDiary || info.hasMood || info.hasPhoto;

  var cell = document.createElement('div');
  cell.className = 'cal-day' + (isOther ? ' other-month' : '') + (dateKey === todayKey ? ' today' : '') + (dateKey === this.selectedDate ? ' selected' : '') + (hasContent ? ' has-content' : '');
  cell.setAttribute('data-date', dateKey);

  // 心情 emoji 直接显示在日期下方(大)
  var moodDisplay = info.hasMood ? '<div class="cal-day-mood">' + info.moodEmoji + '</div>' : '';
  // 日记/照片用彩色圆点指示(底部)
  var dots = '';
  if (info.hasDiary) dots += '<span class="cal-dot cal-dot-diary" title="有日记"></span>';
  if (info.hasPhoto) dots += '<span class="cal-dot cal-dot-photo" title="有照片"></span>';

  cell.innerHTML =
    '<span class="cal-day-num">' + day + '</span>' +
    moodDisplay +
    (dots ? '<div class="cal-day-dots">' + dots + '</div>' : '');

  cell.addEventListener('click', function() {
    self.selectedDate = dateKey;
    // 切换到该日期所在月份(点击邻月格子时)
    if (isOther) {
      self.viewDate = new Date(year, month, 1);
      self._renderMonth();
    } else {
      var all = self.container.querySelectorAll('.cal-day');
      for (var i = 0; i < all.length; i++) all[i].classList.remove('selected');
      cell.classList.add('selected');
    }
    self._renderDayDetail();
  });

  return cell;
};

/* 获取某天的内容信息 */
CalendarManager.prototype._getDayInfo = function(dateKey) {
  var info = { hasDiary: false, diaryCount: 0, hasMood: false, moodEmoji: '', hasPhoto: false, photoCount: 0 };
  var diaryMoodEmoji = '';

  if (this.diary) {
    var entries = this.diary.getByDate(dateKey);
    if (entries.length > 0) {
      info.hasDiary = true;
      info.diaryCount = entries.length;
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].photos && entries[i].photos.length > 0) {
          info.hasPhoto = true;
          info.photoCount += entries[i].photos.length;
        }
        // 记录日记自带的心情(作为回退)
        if (!diaryMoodEmoji && entries[i].mood) {
          diaryMoodEmoji = entries[i].mood;
        }
      }
    }
  }

  // 优先使用 MoodManager 的心情记录
  if (this.mood) {
    var mood = this.mood._getMoodForDate(dateKey);
    if (mood) {
      info.hasMood = true;
      info.moodEmoji = mood.emoji;
    }
  }

  // 若 MoodManager 无当天心情,回退到日记的心情
  if (!info.hasMood && diaryMoodEmoji) {
    info.hasMood = true;
    info.moodEmoji = diaryMoodEmoji;
  }

  return info;
};

CalendarManager.prototype._renderDayDetail = function() {
  var box = this.container.querySelector('#cal-day-detail');
  if (!box) return;
  var dateKey = this.selectedDate;
  if (!dateKey) { box.innerHTML = ''; return; }

  var info = this._getDayInfo(dateKey);
  var self = this;
  var dateObj = this._parseDate(dateKey);
  var weekday = this._weekday(dateObj);

  var html = '<div class="day-detail-date">' + this._formatDate(dateKey) + ' · ' + weekday + '</div>';

  if (!info.hasDiary && !info.hasMood && !info.hasPhoto) {
    html += '<div class="day-detail-empty">这一天还没有记录</div>';
  } else {
    // 心情
    if (info.hasMood) {
      html += '<div class="day-detail-section">' +
                '<div class="day-detail-section-title">当天心情</div>' +
                '<div class="day-detail-mood">' + info.moodEmoji + '</div>' +
              '</div>';
    }

    // 日记
    if (info.hasDiary) {
      var entries = this.diary.getByDate(dateKey);
      html += '<div class="day-detail-section">' +
                '<div class="day-detail-section-title">日记(' + entries.length + ')</div>';
      entries.forEach(function(entry) {
        var photos = '';
        if (entry.photos && entry.photos.length > 0) {
          photos = '<div class="day-diary-photos">';
          entry.photos.forEach(function(p) {
            if (self.diary.photoStore && self.diary.photoStore.isPhotoId(p)) {
              photos += '<img alt="" class="day-diary-photo" data-photo-id="' + p + '">';
            } else {
              photos += '<img src="' + p + '" alt="" class="day-diary-photo" data-src="' + p + '">';
            }
          });
          photos += '</div>';
        }
        var editBtn = entry.isPreset ? '' : '<button class="day-diary-edit" data-id="' + entry.id + '">编辑</button>';
        html += '<div class="day-diary-card" data-id="' + entry.id + '">' +
                  '<div class="day-diary-title">' + entry.title + '</div>' +
                  (entry.mood ? '<div class="day-diary-mood">' + entry.mood + '</div>' : '') +
                  '<div class="day-diary-content">' + self._escapeHtml(entry.content) + '</div>' +
                  photos +
                  editBtn +
                '</div>';
      });
      html += '</div>';
    }
  }

  // 写日记按钮
  html += '<button class="day-write-btn" id="day-write-btn">✏️ 为这一天写日记</button>';

  box.innerHTML = html;

  // 绑定事件
  var writeBtn = box.querySelector('#day-write-btn');
  if (writeBtn) {
    writeBtn.addEventListener('click', function() {
      if (self.diary) {
        self.diary.openEditor(dateKey, null, function() {
          // 保存后刷新日历(标记可能变化)+ 详情
          self._renderMonth();
          self._renderDayDetail();
        });
      }
    });
  }

  // 日记照片点击放大
  var imgs = box.querySelectorAll('.day-diary-photo');
  for (var i = 0; i < imgs.length; i++) {
    imgs[i].addEventListener('click', function() {
      var src = this.getAttribute('data-src');
      self._showPhoto(src);
    });
  }

  // 编辑按钮
  var editBtns = box.querySelectorAll('.day-diary-edit');
  for (var j = 0; j < editBtns.length; j++) {
    editBtns[j].addEventListener('click', function() {
      var id = this.getAttribute('data-id');
      var entryToEdit = null;
      if (self.diary) {
        for (var k = 0; k < self.diary.userEntries.length; k++) {
          if (String(self.diary.userEntries[k].id) === String(id)) {
            entryToEdit = self.diary.userEntries[k];
            break;
          }
        }
      }
      if (entryToEdit) {
        self.diary.openEditor(entryToEdit.date, entryToEdit, function() {
          self._renderMonth();
          self._renderDayDetail();
        });
      }
    });
  }

  // 异步加载 IndexedDB 图片
  if (this.diary && this.diary._loadPhotosAsync) {
    this.diary._loadPhotosAsync(box);
  }
};

/* ===== 工具 ===== */
CalendarManager.prototype._dateKey = function(d) {
  var m = d.getMonth() + 1, day = d.getDate();
  return d.getFullYear() + '-' + (m < 10 ? '0' + m : '' + m) + '-' + (day < 10 ? '0' + day : '' + day);
};

CalendarManager.prototype._parseDate = function(dateStr) {
  var parts = dateStr.split('-');
  return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
};

CalendarManager.prototype._formatDate = function(dateStr) {
  var parts = dateStr.split('-');
  if (parts.length === 3) {
    return parseInt(parts[1], 10) + '月' + parseInt(parts[2], 10) + '日';
  }
  return dateStr;
};

CalendarManager.prototype._weekday = function(d) {
  var names = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return names[d.getDay()];
};

CalendarManager.prototype._escapeHtml = function(text) {
  if (!text) return '';
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
};

CalendarManager.prototype._showPhoto = function(src) {
  var viewer = document.createElement('div');
  viewer.className = 'diary-photo-viewer';
  viewer.innerHTML = '<img src="' + src + '" alt=""><div class="close">✕</div>';
  viewer.addEventListener('click', function() {
    if (viewer.parentNode) viewer.parentNode.removeChild(viewer);
  });
  document.body.appendChild(viewer);
};

window.CalendarManager = CalendarManager;
