/**
 * 统一存储管理
 * diary   -> localStorage (ourstory_user_diary)
 * mood    -> localStorage (ourstory_moods)
 * photo   -> IndexedDB    (ourstory_db / photos)
 * futureLetter -> localStorage (ourstory_future_letter)
 *
 * 提供 load/save/delete 统一接口，内部根据 type 分发到 localStorage 或 IndexedDB
 */
var STORAGE = (function() {
  var keys = {
    diary: 'ourstory_user_diary',
    mood: 'ourstory_moods',
    futureLetter: 'ourstory_future_letter'
  };

  var photoStore = null;

  /* 初始化 IndexedDB 图片存储 */
  function initPhotoStore(callback) {
    photoStore = new PhotoStore();
    photoStore.init(function(ok) {
      if (callback) callback(photoStore, ok);
    });
  }

  /* ===== localStorage 通用 ===== */
  function _lsLoad(key) {
    try {
      var v = localStorage.getItem(key);
      return v ? JSON.parse(v) : null;
    } catch(e) {
      return null;
    }
  }

  function _lsSave(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch(e) {
      return false;
    }
  }

  function _lsDelete(key) {
    try { localStorage.removeItem(key); } catch(e) {}
  }

  /* ===== Diary ===== */
  function loadDiary() {
    return _lsLoad(keys.diary) || [];
  }

  function saveDiary(entries) {
    return _lsSave(keys.diary, entries);
  }

  /* ===== Mood ===== */
  function loadMood() {
    return _lsLoad(keys.mood) || [];
  }

  function saveMood(moods) {
    return _lsSave(keys.mood, moods);
  }

  /* ===== Future Letter ===== */
  function loadFutureLetter() {
    return _lsLoad(keys.futureLetter);
  }

  function saveFutureLetter(data) {
    return _lsSave(keys.futureLetter, data);
  }

  /* ===== Photo (IndexedDB) ===== */
  function savePhoto(id, base64, callback) {
    if (photoStore) photoStore.save(id, base64, callback);
    else if (callback) callback(false);
  }

  function getPhoto(id, callback) {
    if (photoStore) photoStore.get(id, callback);
    else if (callback) callback(null);
  }

  function getPhotos(ids, callback) {
    if (photoStore) photoStore.getMany(ids, callback);
    else if (callback) callback({});
  }

  function deletePhoto(id, callback) {
    if (photoStore) photoStore.delete(id, callback);
    else if (callback) callback();
  }

  function isPhotoId(val) {
    return photoStore ? photoStore.isPhotoId(val) :
      (typeof val === 'string' && val.indexOf('img_') === 0);
  }

  function getPhotoStore() {
    return photoStore;
  }

  return {
    keys: keys,
    initPhotoStore: initPhotoStore,
    loadDiary: loadDiary,
    saveDiary: saveDiary,
    loadMood: loadMood,
    saveMood: saveMood,
    loadFutureLetter: loadFutureLetter,
    saveFutureLetter: saveFutureLetter,
    savePhoto: savePhoto,
    getPhoto: getPhoto,
    getPhotos: getPhotos,
    deletePhoto: deletePhoto,
    isPhotoId: isPhotoId,
    getPhotoStore: getPhotoStore
  };
})();

window.STORAGE = STORAGE;
