/**
 * 图片存储模块(IndexedDB 封装)
 * 存储用户日记的图片 base64,容量远大于 localStorage
 * 降级:若浏览器不支持 IndexedDB,调用方应回退到 localStorage 直接存 base64
 */

function PhotoStore() {
  this.db = null;
  this.dbName = 'ourstory_db';
  this.storeName = 'photos';
  this.ready = false;
}

/* 初始化数据库,回调返回是否成功 */
PhotoStore.prototype.init = function(callback) {
  var self = this;
  if (!window.indexedDB) {
    console.warn('IndexedDB not supported, photos will fall back to localStorage');
    this.ready = false;
    if (callback) callback(false);
    return;
  }
  try {
    var req = indexedDB.open(this.dbName, 1);
    req.onupgradeneeded = function(e) {
      var db = e.target.result;
      if (!db.objectStoreNames.contains(self.storeName)) {
        db.createObjectStore(self.storeName, { keyPath: 'id' });
      }
    };
    req.onsuccess = function(e) {
      self.db = e.target.result;
      self.ready = true;
      if (callback) callback(true);
    };
    req.onerror = function() {
      console.warn('IndexedDB open failed');
      self.ready = false;
      if (callback) callback(false);
    };
  } catch(e) {
    console.warn('IndexedDB init error:', e.message);
    self.ready = false;
    if (callback) callback(false);
  }
};

/* 保存一张图片,id 为字符串,base64 为数据。回调返回是否成功 */
PhotoStore.prototype.save = function(id, base64, callback) {
  if (!this.db) { if (callback) callback(false); return; }
  try {
    var tx = this.db.transaction(this.storeName, 'readwrite');
    var store = tx.objectStore(this.storeName);
    var req = store.put({ id: id, data: base64 });
    req.onsuccess = function() { if (callback) callback(true); };
    req.onerror = function() { if (callback) callback(false); };
  } catch(e) {
    if (callback) callback(false);
  }
};

/* 读取一张图片,回调返回 base64 或 null */
PhotoStore.prototype.get = function(id, callback) {
  if (!this.db) { if (callback) callback(null); return; }
  try {
    var tx = this.db.transaction(this.storeName, 'readonly');
    var store = tx.objectStore(this.storeName);
    var req = store.get(id);
    req.onsuccess = function(e) {
      var result = e.target.result;
      if (callback) callback(result ? result.data : null);
    };
    req.onerror = function() { if (callback) callback(null); };
  } catch(e) {
    if (callback) callback(null);
  }
};

/* 批量读取,回调返回 { id: base64 } 映射 */
PhotoStore.prototype.getMany = function(ids, callback) {
  var self = this;
  var result = {};
  if (!ids || ids.length === 0) { if (callback) callback(result); return; }
  var remaining = ids.length;
  ids.forEach(function(id) {
    self.get(id, function(data) {
      if (data) result[id] = data;
      remaining--;
      if (remaining <= 0 && callback) callback(result);
    });
  });
};

/* 删除一张图片 */
PhotoStore.prototype.delete = function(id, callback) {
  if (!this.db) { if (callback) callback(); return; }
  try {
    var tx = this.db.transaction(this.storeName, 'readwrite');
    var store = tx.objectStore(this.storeName);
    var req = store.delete(id);
    req.onsuccess = function() { if (callback) callback(); };
    req.onerror = function() { if (callback) callback(); };
  } catch(e) {
    if (callback) callback();
  }
};

/* 判断一个值是否是 IndexedDB 图片 id(以 img_ 开头) */
PhotoStore.prototype.isPhotoId = function(val) {
  return typeof val === 'string' && val.indexOf('img_') === 0;
};

window.PhotoStore = PhotoStore;
