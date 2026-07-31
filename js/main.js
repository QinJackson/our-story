/**
 * 主控制器
 * 时间配置统一来自 CONFIG.timing
 * 状态管理委托 STATE
 * 场景过渡委托 TRANSITION
 */
(function() {
  'use strict';

  var ps, heart, timeline, music, video, eggs;
  var diary, futureLetter, mood, gallery, home, calendar;
  var viz = null;
  var rafId = null;
  var lastTs = 0;

  var loading = document.getElementById('loading-screen');
  var storyTitle = document.getElementById('story-title');

  function init() {
    ps = new ParticleSystem(document.getElementById('main-canvas'));
    music = new MusicManager();
    viz = new AudioVisualizer(music.audio);
    heart = new HeartAnimation(ps, viz);
    timeline = new TimelineManager();
    timeline.build();
    video = new VideoManager();
    eggs = new EasterEggManager(ps, heart, video, music);

    // Phase 3 模块:先初始化存储,再加载日记
    STORAGE.initPhotoStore(function(store, ok) {
      diary = new DiaryManager();
      diary.photoStore = store;
      diary.load(function() {
        window.__diaryData = diary.data;
        // diary 就绪后才创建依赖它的模块,避免引用 undefined
        calendar = new CalendarManager(diary, mood, gallery);
        home = new HomeManager(diary, futureLetter, mood, gallery, calendar);
        window.__diary = diary;
        window.__showHome = function() { if (home) home.show(); };
        _showChoice();
      });
    });

    futureLetter = new FutureLetterManager(null);
    mood = new MoodManager();
    gallery = new GalleryManager();
    window.__showHome = function() { if (home) home.show(); };

    // Photo viewer close
    document.getElementById('photo-viewer-close').addEventListener('click', function() { eggs.closeViewer(); });
    document.getElementById('photo-viewer').addEventListener('click', function(e) {
      if (e.target === e.currentTarget) eggs.closeViewer();
    });

    STATE.setPhase('loading');
    ps.setPhase('loading');
    _loop(0);
  }

  /* ===== 加载完成后显示选择:看动画 / 直接进入 ===== */
  function _showChoice() {
    STATE.setPhase('choose');
    // 禁用主画布指针事件,确保按钮可点击
    var mainCanvas = document.getElementById('main-canvas');
    if (mainCanvas) mainCanvas.style.pointerEvents = 'none';
    var uiLayer = document.getElementById('ui-layer');
    if (uiLayer) uiLayer.style.pointerEvents = 'none';
    // 显式确保 loading-screen 和按钮可点击
    var loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      loadingScreen.classList.remove('hidden');
      loadingScreen.style.pointerEvents = 'auto';
    }

    var choice = document.getElementById('loading-choice');
    var loadingText = document.getElementById('loading-text');
    var loadingRing = document.getElementById('loading-ring');
    if (loadingText) loadingText.style.display = 'none';
    if (loadingRing) loadingRing.style.display = 'none';
    if (choice) {
      choice.style.display = 'flex';
      choice.style.pointerEvents = 'auto';
    }

    var watchBtn = document.getElementById('loading-watch');
    var skipBtn = document.getElementById('loading-skip');
    if (watchBtn) watchBtn.addEventListener('click', function() {
      if (choice) choice.style.display = 'none';
      if (loadingText) loadingText.style.display = '';
      if (loadingRing) loadingRing.style.display = '';
      _start();
    });
    if (skipBtn) skipBtn.addEventListener('click', function() {
      TRANSITION.start('fade', CONFIG.timing.transitionDuration, function() {
        loading.classList.add('hidden');
        home.show();
      });
    });
  }

  /* ===== 1. 加载 ===== */
  function _start() {
    STATE.setPhase('loading');
    ps.setPhase('loading');
    setTimeout(function() {
      TRANSITION.start('fade', CONFIG.timing.transitionDuration, function() {
        loading.classList.add('hidden');
        setTimeout(_float, CONFIG.timing.loadingFadeToFloat);
      });
    }, CONFIG.timing.loadingDuration);
  }

  /* ===== 2. 文字星海漂浮 ===== */
  function _float() {
    STATE.setPhase('floating');
    ps.setPhase('floating');
    setTimeout(_converge, CONFIG.timing.floatDuration);
  }

  /* ===== 3. 汇聚成心 ===== */
  function _converge() {
    STATE.setPhase('converging');
    ps.setPhase('converging');
    setTimeout(function() {
      STATE.setPhase('heart');
      ps.setPhase('heart');
      heart.fadeIn();

      setTimeout(function() {
        storyTitle.classList.add('visible');
      }, CONFIG.timing.storyTitleVisibleDelay);

      setTimeout(function() {
        storyTitle.classList.remove('visible');
        TRANSITION.start('radial', CONFIG.timing.transitionDuration, function() {
          setTimeout(_showTimeline, CONFIG.timing.storyTitleHideToTimeline);
        });
      }, CONFIG.timing.storyTitleHoldDuration);
    }, CONFIG.timing.convergeDuration + CONFIG.timing.heartFormExtraDelay);
  }

  /* ===== 4. 时间轴 ===== */
  var _tlShown = false;
  function _showTimeline() {
    if (_tlShown) return;
    _tlShown = true;
    STATE.setPhase('timeline');
    ps.setPhase('timeline');
    timeline.show();
    setTimeout(_showAvatar, CONFIG.timing.timelineDuration);
  }

  /* ===== 5. 头像 ===== */
  function _showAvatar() {
    timeline.hide();
    eggs.triggerAvatar(function() {
      setTimeout(_showPhotos, CONFIG.timing.avatarDuration);
    });
  }

  /* ===== 6. 照片 ===== */
  function _showPhotos() {
    eggs.triggerPhotos(function() {
      setTimeout(_startVideo, CONFIG.timing.photosDuration);
    });
  }

  /* ===== 7. 播放 MV ===== */
  function _startVideo() {
    music.pause();
    eggs.triggerVideo(function() {
      music.resume();
      setTimeout(_showFinal, CONFIG.timing.videoEndToFinalDelay);
    });
  }

  /* ===== 8. 最终结尾 ===== */
  function _showFinal() {
    eggs.triggerFinal();
  }

  /* ===== 动画循环 ===== */
  function _loop(ts) {
    var dt = ts - lastTs;
    lastTs = ts;
    if (viz) viz.update();
    ps.update(ts);
    ps.draw(ts);
    var phase = STATE.getPhase();
    if (phase === 'heart' || phase === 'timeline') {
      heart.drawGlow(ts);
      heart.drawBeat(ts);
    }
    TRANSITION.update(dt);
    rafId = requestAnimationFrame(_loop);
  }

  /* ===== 启动 ===== */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  addEventListener('load', function() { if (ps) ps._resize(); });
})();
