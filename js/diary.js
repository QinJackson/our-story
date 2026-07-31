/**
 * 我们的日记模块
 * 故事书翻页浏览 + 编写/编辑/删除 + IndexedDB 图片存储 + localStorage 文字持久化
 * 预置数据来自 data/diary.json(只读),用户数据存 localStorage(可编辑)
 * 图片存 IndexedDB(容量大),entry.photos 存图片 id;预置图片存路径
 */

function DiaryManager() {
  this.data = null;           // diary.json 原始数据
  this.presetEntries = [];    // 预置条目(只读)
  this.userEntries = [];      // 用户条目(可编辑,localStorage)
  this.entries = [];          // 合并后展示用(按 date 倒序)
  this.container = null;
  this.book = null;
  this.editor = null;
  this.currentPage = 0;
  this.isFlipping = false;
  this.onBack = null;
  this.loaded = false;
  this.storageKey = 'ourstory_user_diary';
  this._editingImages = [];   // 编辑器中的图片(base64 或路径,可显示)
  this._editingMood = '';
  this._editingEntry = null;
  this.photoStore = null;     // IndexedDB 图片存储
  this.moodOptions = [
    { emoji: '😊', label: '开心' },
    { emoji: '💕', label: '心动' },
    { emoji: '✨', label: '美好' },
    { emoji: '😌', label: '平静' },
    { emoji: '🥰', label: '甜蜜' },
    { emoji: '😔', label: '低落' },
    { emoji: '😴', label: '疲惫' },
    { emoji: '🎉', label: '兴奋' },
    { emoji: '🌙', label: '夜晚' }
  ];
}

/* ===== 加载数据:IndexedDB 初始化 + diary.json + localStorage ===== */
DiaryManager.prototype.load = function(callback) {
  var self = this;
  this._loadUser();
  this.photoStore = new PhotoStore();
  this.photoStore.init(function() {
    self._loadDiaryJson(callback);
  });
};

DiaryManager.prototype._loadDiaryJson = function(callback) {
  var self = this;
  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'data/diary.json', true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      if (xhr.status === 200 || xhr.status === 0) {
        try {
          self.data = JSON.parse(xhr.responseText);
          self.presetEntries = (self.data.entries || []).map(function(e) {
            e.isPreset = true;
            return e;
          });
        } catch(e) {
          console.warn('Diary data parse error:', e.message);
          self.data = { intro: { title: '我们的日记', subtitle: '', coverText: '' }, entries: [], futureLetter: null };
          self.presetEntries = [];
        }
      } else {
        console.warn('Diary load failed:', xhr.status);
        self.data = { intro: { title: '我们的日记', subtitle: '', coverText: '' }, entries: [], futureLetter: null };
        self.presetEntries = [];
      }
      self._merge();
      self.loaded = true;
      if (callback) callback();
    }
  };
  xhr.send();
};

DiaryManager.prototype._loadUser = function() {
  try {
    var saved = localStorage.getItem(this.storageKey);
    this.userEntries = saved ? JSON.parse(saved) : [];
  } catch(e) {
    this.userEntries = [];
  }
};

DiaryManager.prototype._saveUser = function() {
  try {
    localStorage.setItem(this.storageKey, JSON.stringify(this.userEntries));
    return true;
  } catch(e) {
    return false;
  }
};

DiaryManager.prototype._merge = function() {
  var all = this.presetEntries.concat(this.userEntries);
  all.sort(function(a, b) {
    return b.date < a.date ? -1 : (b.date > a.date ? 1 : 0);
  });
  this.entries = all;
  window.__diaryData = {
    entries: this.entries,
    intro: this.data ? this.data.intro : null,
    futureLetter: this.data ? this.data.futureLetter : null
  };
};

/* ===== 打开日记(故事书翻页浏览) ===== */
DiaryManager.prototype.open = function(onBack) {
  var self = this;
  this.onBack = onBack || null;

  var overlay = document.createElement('div');
  overlay.className = 'diary-overlay';
  overlay.innerHTML =
    '<div class="diary-header">' +
      '<button class="diary-back" id="diary-back">‹ 返回</button>' +
      '<div class="diary-title-small">我们的日记</div>' +
      '<button class="diary-write-btn" id="diary-write">✏️ 写日记</button>' +
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

  overlay.querySelector('#diary-back').addEventListener('click', function() { self.close(); });
  overlay.querySelector('#diary-write').addEventListener('click', function() {
    self.openEditor(null, null, function() { self._refreshBook(); });
  });
  overlay.querySelector('#diary-prev').addEventListener('click', function() { self.prevPage(); });
  overlay.querySelector('#diary-next').addEventListener('click', function() { self.nextPage(); });

  this._renderBook();
};

DiaryManager.prototype._refreshBook = function() {
  this._merge();
  if (this.book) this._renderBook();
};

DiaryManager.prototype.close = function() {
  if (this.container && this.container.parentNode) {
    this.container.parentNode.removeChild(this.container);
  }
  this.container = null;
  this.book = null;
  if (this.onBack) this.onBack();
};

/* ===== 渲染故事书 ===== */
DiaryManager.prototype._renderBook = function() {
  var self = this;
  if (!this.book) return;

  this.book.innerHTML = '';

  var cover = document.createElement('div');
  cover.className = 'diary-page diary-cover';
  var intro = this.data && this.data.intro ? this.data.intro : { title: '我们的日记', subtitle: '', coverText: '' };
  cover.innerHTML =
    '<div class="diary-cover-title">' + intro.title + '</div>' +
    '<div class="diary-cover-sub">' + (intro.subtitle || '') + '</div>' +
    '<div class="diary-cover-text">' + (intro.coverText || '') + '</div>';
  this.book.appendChild(cover);

  this.entries.forEach(function(entry, i) {
    var page = document.createElement('div');
    page.className = 'diary-page diary-entry-page';
    page.dataset.id = entry.id;

    var mood = entry.mood ? '<div class="diary-entry-mood">' + entry.mood + '</div>' : '';
    var photos = '';
    if (entry.photos && entry.photos.length > 0) {
      photos = '<div class="diary-entry-photos">';
      entry.photos.forEach(function(p) {
        if (self.photoStore && self.photoStore.isPhotoId(p)) {
          // IndexedDB 图片:先占位,异步加载
          photos += '<img alt="" class="diary-entry-photo" data-photo-id="' + p + '">';
        } else {
          photos += '<img src="' + p + '" alt="" class="diary-entry-photo" data-src="' + p + '">';
        }
      });
      photos += '</div>';
    }

    var editBtn = entry.isPreset ? '' : '<div class="diary-entry-edit" data-id="' + entry.id + '">✏️ 编辑 / 删除</div>';

    page.innerHTML =
      '<div class="diary-entry-date">' + self._formatDate(entry.date) + '</div>' +
      '<div class="diary-entry-title">' + entry.title + '</div>' +
      mood +
      '<div class="diary-entry-content">' + self._formatContent(entry.content) + '</div>' +
      photos +
      editBtn;

    var imgs = page.querySelectorAll('.diary-entry-photo');
    for (var j = 0; j < imgs.length; j++) {
      imgs[j].addEventListener('click', function() {
        var src = this.getAttribute('data-src') || this.src;
        if (src) self._showPhoto(src);
      });
    }

    var editEl = page.querySelector('.diary-entry-edit');
    if (editEl) {
      editEl.addEventListener('click', function() {
        var id = this.getAttribute('data-id');
        var entryToEdit = null;
        for (var k = 0; k < self.userEntries.length; k++) {
          if (String(self.userEntries[k].id) === String(id)) { entryToEdit = self.userEntries[k]; break; }
        }
        if (entryToEdit) {
          self.openEditor(entryToEdit.date, entryToEdit, function() { self._refreshBook(); });
        }
      });
    }

    self.book.appendChild(page);
  });

  var back = document.createElement('div');
  back.className = 'diary-page diary-back-cover';
  back.innerHTML = '<div class="diary-back-text">—— 未完待续 ——</div>';
  this.book.appendChild(back);

  this.totalPages = 1 + this.entries.length + 1;
  this.currentPage = 0;
  this._updatePage();
  // 异步加载 IndexedDB 图片
  this._loadPhotosAsync(this.book);
};

/* 异步加载容器内所有 data-photo-id 图片 */
DiaryManager.prototype._loadPhotosAsync = function(container) {
  if (!this.photoStore || !this.photoStore.ready) return;
  var self = this;
  var imgs = container.querySelectorAll('img[data-photo-id]');
  for (var i = 0; i < imgs.length; i++) {
    (function(img) {
      var id = img.getAttribute('data-photo-id');
      self.photoStore.get(id, function(data) {
        if (data) {
          img.src = data;
          img.setAttribute('data-src', data);
        }
      });
    })(imgs[i]);
  }
};

/* ===== 翻页 ===== */
DiaryManager.prototype.nextPage = function() {
  if (this.isFlipping) return;
  if (this.currentPage >= this.totalPages - 1) return;
  this.currentPage++;
  this.isFlipping = true;
  var self = this;
  var pages = this.book.querySelectorAll('.diary-page');
  var current = pages[this.currentPage - 1];
  if (current) current.classList.add('flip-out');
  var next = pages[this.currentPage];
  if (next) next.classList.add('flip-in');
  setTimeout(function() { self._updatePage(); self.isFlipping = false; }, 500);
};

DiaryManager.prototype.prevPage = function() {
  if (this.isFlipping) return;
  if (this.currentPage <= 0) return;
  this.currentPage--;
  this.isFlipping = true;
  var self = this;
  var pages = this.book.querySelectorAll('.diary-page');
  var current = pages[this.currentPage + 1];
  if (current) current.classList.remove('flip-in');
  var prev = pages[this.currentPage];
  if (prev) prev.classList.remove('flip-out');
  setTimeout(function() { self._updatePage(); self.isFlipping = false; }, 300);
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

/* ===== 编辑器(写日记 / 编辑日记) ===== */
DiaryManager.prototype.openEditor = function(date, entry, onSaved) {
  var self = this;
  this._editingEntry = entry || null;
  this._editingImages = entry && entry.photos ? entry.photos.slice(0) : [];
  this._editingMood = entry && entry.mood ? entry.mood : '';
  var editDate = date || (entry && entry.date) || this._todayStr();

  var overlay = document.createElement('div');
  overlay.className = 'diary-editor-overlay';
  document.body.appendChild(overlay);
  this.editor = overlay;

  var titleText = entry ? '编辑日记' : '写日记';

  overlay.innerHTML =
    '<div class="editor-header">' +
      '<button class="editor-back" id="editor-back">‹ 返回</button>' +
      '<div class="editor-title">' + titleText + '</div>' +
      '<button class="editor-save" id="editor-save">保存</button>' +
    '</div>' +
    '<div class="editor-body">' +
      '<div class="editor-row">' +
        '<label class="editor-label">日期</label>' +
        '<input type="date" class="editor-date" id="editor-date" value="' + editDate + '">' +
      '</div>' +
      '<div class="editor-row">' +
        '<label class="editor-label">心情</label>' +
        '<div class="editor-mood-options" id="editor-mood-options"></div>' +
      '</div>' +
      '<input type="text" class="editor-title-input" id="editor-title" placeholder="给这一天起个标题" maxlength="40">' +
      '<textarea class="editor-content" id="editor-content" placeholder="写下今天的故事……" maxlength="2000"></textarea>' +
      '<div class="editor-photo-section">' +
        '<div class="editor-label">图片(最多 6 张)</div>' +
        '<div class="editor-photos" id="editor-photos"></div>' +
        '<button class="editor-add-photo" id="editor-add-photo">+ 添加图片</button>' +
        '<input type="file" id="editor-file-input" accept="image/*" multiple style="display:none">' +
      '</div>' +
      (entry ? '<button class="editor-delete" id="editor-delete">🗑 删除这篇日记</button>' : '') +
    '</div>';

  if (entry) {
    overlay.querySelector('#editor-title').value = entry.title || '';
    overlay.querySelector('#editor-content').value = entry.content || '';
  }

  var moodBox = overlay.querySelector('#editor-mood-options');
  this.moodOptions.forEach(function(opt) {
    var btn = document.createElement('button');
    btn.className = 'editor-mood-btn' + (self._editingMood === opt.emoji ? ' selected' : '');
    btn.innerHTML = '<span class="editor-mood-emoji">' + opt.emoji + '</span>';
    btn.setAttribute('data-emoji', opt.emoji);
    btn.addEventListener('click', function() {
      var allBtns = moodBox.querySelectorAll('.editor-mood-btn');
      for (var i = 0; i < allBtns.length; i++) allBtns[i].classList.remove('selected');
      if (self._editingMood === opt.emoji) {
        self._editingMood = '';
      } else {
        self._editingMood = opt.emoji;
        btn.classList.add('selected');
      }
    });
    moodBox.appendChild(btn);
  });

  // 渲染已有图片(先渲染直接 URL,IndexedDB 图片异步加载后补显)
  this._renderEditorPhotos();
  this._loadEditorPhotosAsync();

  overlay.querySelector('#editor-back').addEventListener('click', function() { self._closeEditor(); });
  overlay.querySelector('#editor-save').addEventListener('click', function() { self._saveFromEditor(onSaved); });
  overlay.querySelector('#editor-add-photo').addEventListener('click', function() {
    overlay.querySelector('#editor-file-input').click();
  });
  overlay.querySelector('#editor-file-input').addEventListener('change', function(e) {
    self._handleFiles(e.target.files);
    this.value = '';
  });
  var delBtn = overlay.querySelector('#editor-delete');
  if (delBtn) {
    delBtn.addEventListener('click', function() {
      if (confirm('确定删除这篇日记吗?此操作不可撤销。')) {
        self.deleteEntry(entry.id);
        self._closeEditor();
        if (onSaved) onSaved();
      }
    });
  }
};

/* 把编辑器中 IndexedDB id 图片异步替换为 base64 以便显示 */
DiaryManager.prototype._loadEditorPhotosAsync = function() {
  if (!this.photoStore || !this.photoStore.ready) return;
  var self = this;
  var idsToLoad = this._editingImages.filter(function(p) { return self.photoStore.isPhotoId(p); });
  if (idsToLoad.length === 0) return;
  this.photoStore.getMany(idsToLoad, function(map) {
    self._editingImages = self._editingImages.map(function(p) {
      return map[p] || p;
    });
    if (self.editor) self._renderEditorPhotos();
  });
};

DiaryManager.prototype._renderEditorPhotos = function() {
  var box = this.editor.querySelector('#editor-photos');
  if (!box) return;
  box.innerHTML = '';
  var self = this;
  this._editingImages.forEach(function(src, i) {
    // 跳过尚未加载的 IndexedDB id(无法直接显示)
    if (self.photoStore && self.photoStore.isPhotoId(src)) return;
    var wrap = document.createElement('div');
    wrap.className = 'editor-photo-item';
    wrap.innerHTML = '<img src="' + src + '" alt=""><div class="editor-photo-remove" data-idx="' + i + '">✕</div>';
    wrap.querySelector('.editor-photo-remove').addEventListener('click', function() {
      var idx = parseInt(this.getAttribute('data-idx'), 10);
      self._editingImages.splice(idx, 1);
      self._renderEditorPhotos();
    });
    box.appendChild(wrap);
  });
};

DiaryManager.prototype._handleFiles = function(files) {
  var self = this;
  if (!files || files.length === 0) return;
  var remaining = this._editingImages.length + files.length;
  if (remaining > 6) {
    alert('最多 6 张图片,当前已有 ' + this._editingImages.length + ' 张');
    var canAdd = 6 - this._editingImages.length;
    if (canAdd <= 0) return;
    files = Array.prototype.slice.call(files, 0, canAdd);
  }
  var processed = 0;
  var total = files.length;
  for (var i = 0; i < files.length; i++) {
    this._compressImage(files[i], function(base64) {
      self._editingImages.push(base64);
      processed++;
      if (processed >= total) self._renderEditorPhotos();
    });
  }
};

DiaryManager.prototype._compressImage = function(file, callback) {
  if (!window.FileReader || !window.Image) {
    callback('');
    return;
  }
  var reader = new FileReader();
  reader.onload = function(e) {
    var img = new Image();
    img.onload = function() {
      var canvas = document.createElement('canvas');
      var maxW = 800;
      var w = img.width, h = img.height;
      if (w > maxW) { h = Math.round(h * maxW / w); w = maxW; }
      canvas.width = w; canvas.height = h;
      var ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);
      try {
        callback(canvas.toDataURL('image/jpeg', 0.7));
      } catch(e2) {
        callback(e.target.result);
      }
    };
    img.onerror = function() { callback(''); };
    img.src = e.target.result;
  };
  reader.onerror = function() { callback(''); };
  reader.readAsDataURL(file);
};

DiaryManager.prototype._saveFromEditor = function(onSaved) {
  var self = this;
  var title = this.editor.querySelector('#editor-title').value.trim();
  var content = this.editor.querySelector('#editor-content').value.trim();
  var date = this.editor.querySelector('#editor-date').value;
  if (!date) { alert('请选择日期'); return; }
  if (!title && !content) { alert('请填写标题或内容'); return; }

  var images = this._editingImages.slice(0, 6);
  var data = {
    date: date,
    title: title || '无题',
    content: content,
    mood: this._editingMood,
    photos: []
  };

  // 区分:IndexedDB id(已有图片)和 base64(新图片)
  var photoIds = [];
  var base64Images = [];
  images.forEach(function(img) {
    if (self.photoStore && self.photoStore.isPhotoId(img)) {
      photoIds.push(img);
    } else {
      base64Images.push(img);
    }
  });

  var finishSave = function() {
    data.photos = photoIds;
    var ok;
    if (self._editingEntry) {
      data.id = self._editingEntry.id;
      ok = self.updateEntry(data);
    } else {
      data.id = 'u' + Date.now();
      ok = self.addEntry(data);
    }
    if (!ok) {
      alert('保存失败:存储空间不足(localStorage 满)。');
      return;
    }
    self._closeEditor();
    if (onSaved) onSaved();
  };

  // IndexedDB 不可用:降级,base64 直接存 localStorage
  if (!this.photoStore || !this.photoStore.ready) {
    data.photos = images;
    finishSave();
    return;
  }

  // 无新图片:直接完成
  if (base64Images.length === 0) {
    finishSave();
    return;
  }

  // 新图片存 IndexedDB
  var remaining = base64Images.length;
  base64Images.forEach(function(base64) {
    var id = 'img_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    self.photoStore.save(id, base64, function(ok) {
      if (ok) photoIds.push(id);
      remaining--;
      if (remaining <= 0) finishSave();
    });
  });
};

DiaryManager.prototype._closeEditor = function() {
  if (this.editor && this.editor.parentNode) {
    this.editor.parentNode.removeChild(this.editor);
  }
  this.editor = null;
  this._editingEntry = null;
  this._editingImages = [];
  this._editingMood = '';
};

/* ===== 数据操作 ===== */
DiaryManager.prototype.addEntry = function(data) {
  this.userEntries.push(data);
  var ok = this._saveUser();
  if (ok) this._merge();
  return ok;
};

DiaryManager.prototype.updateEntry = function(data) {
  for (var i = 0; i < this.userEntries.length; i++) {
    if (String(this.userEntries[i].id) === String(data.id)) {
      this.userEntries[i] = data;
      break;
    }
  }
  var ok = this._saveUser();
  if (ok) this._merge();
  return ok;
};

DiaryManager.prototype.deleteEntry = function(id) {
  // 删除关联的 IndexedDB 图片
  var entry = null;
  for (var i = 0; i < this.userEntries.length; i++) {
    if (String(this.userEntries[i].id) === String(id)) { entry = this.userEntries[i]; break; }
  }
  if (entry && entry.photos && this.photoStore && this.photoStore.ready) {
    var self = this;
    entry.photos.forEach(function(p) {
      if (self.photoStore.isPhotoId(p)) self.photoStore.delete(p);
    });
  }
  this.userEntries = this.userEntries.filter(function(e) {
    return String(e.id) !== String(id);
  });
  this._saveUser();
  this._merge();
};

/* ===== 查询接口(供日历/相册调用) ===== */
DiaryManager.prototype.getByDate = function(dateStr) {
  var result = [];
  for (var i = 0; i < this.entries.length; i++) {
    if (this.entries[i].date === dateStr) result.push(this.entries[i]);
  }
  return result;
};

DiaryManager.prototype.getDates = function() {
  var set = {};
  this.entries.forEach(function(e) { set[e.date] = true; });
  return Object.keys(set);
};

DiaryManager.prototype.getLatest = function() {
  if (!this.loaded || this.entries.length === 0) return null;
  return this.entries[0];
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

DiaryManager.prototype._todayStr = function() {
  var d = new Date();
  var m = d.getMonth() + 1, day = d.getDate();
  return d.getFullYear() + '-' + (m < 10 ? '0' + m : '' + m) + '-' + (day < 10 ? '0' + day : '' + day);
};

window.DiaryManager = DiaryManager;
