
(function() {
  'use strict';

  var ps, heart, timeline, music, video, eggs;
  var diary, futureLetter, mood, gallery, home;
  var rafId = null;
  var phase = 'init';

  var loading = document.getElementById('loading-screen');
  var storyTitle = document.getElementById('story-title');

  function init() {
    ps = new ParticleSystem(document.getElementById('main-canvas'));
    heart = new HeartAnimation(ps);
    timeline = new TimelineManager();
    timeline.build();
    music = new MusicManager();
    video = new VideoManager();
    eggs = new EasterEggManager(ps, heart, video, music);
        // Phase 3 modules
    diary = new DiaryManager();
    diary.load(function() {
      // 暴露日记数据给相册
      window.__diaryData = diary.data;
    });
    futureLetter = new FutureLetterManager(null);
    mood = new MoodManager();
    gallery = new GalleryManager();
    home = new HomeManager(diary, futureLetter, mood, gallery);
    window.__diary = diary;
  // Photo viewer close
  document.getElementById('photo-viewer-close').addEventListener('click', function() { eggs.closeViewer(); });
  document.getElementById('photo-viewer').addEventListener('click', function(e) {
    if (e.target === e.currentTarget) eggs.closeViewer();
  });


    _start();
    _loop(0);
  }

  /* ===== 1. 鍔犺浇 ===== */
  function _start() {
    phase = 'loading';
    ps.setPhase('loading');
    setTimeout(function() {
      loading.classList.add('hidden');
      setTimeout(_float, 1500);
    }, CONFIG.timing.loadingDuration);
  }

  /* ===== 2. 鏂囧瓧鏄熸捣婕傛诞 ===== */
  function _float() {
    phase = 'floating';
    ps.setPhase('floating');
    setTimeout(_converge, CONFIG.timing.floatDuration);
  }

  /* ===== 3. 姹囪仛鎴愬績 ===== */
  function _converge() {
    phase = 'converging';
    ps.setPhase('converging');
    setTimeout(function() {
      phase = 'heart';
      ps.setPhase('heart');
      heart.fadeIn();

      setTimeout(function() { storyTitle.classList.add('visible'); }, 1000);
      setTimeout(function() {
        storyTitle.classList.remove('visible');
        setTimeout(_showTimeline, 800);
      }, 4000);
    }, CONFIG.timing.convergeDuration + 1500);
  }

  /* ===== 4. 鏃堕棿杞达紙鏂囧瓧鏄熸捣缁х画婕傛诞锛?===== */
  var _tlShown = false;
  function _showTimeline() {
    if (_tlShown) return;
    _tlShown = true;
    phase = 'timeline';
    ps.setPhase('timeline');
    timeline.show();
    setTimeout(_showAvatar, 10000);
  }

  /* ===== 5. 澶村儚锛堝仠鐣?绉掞級 ===== */
  function _showAvatar() {
    timeline.hide();
    eggs.triggerAvatar(function() {
      setTimeout(_showPhotos, 8000);
    });
  }

  /* ===== 6. 鐓х墖锛堝仠鐣?绉掞級 ===== */
  function _showPhotos() {
    eggs.triggerPhotos(function() {
      setTimeout(_startVideo, 8000);
    });
  }

  /* ===== 7. 鎾斁MV锛堟枃瀛楁槦娴疯瑙嗛瑕嗙洊锛?===== */
  function _startVideo() {
    music.pause();
    eggs.triggerVideo(function() {
      music.resume();
      setTimeout(_showFinal, 2000);
    });
  }

  /* ===== 8. 鏈€缁堢粨灏?鈫?鏂囧瓧鏄熸捣鍥炲綊 ===== */
  function _showFinal() {
    eggs.triggerFinal();
  }

  /* ===== 鍔ㄧ敾寰幆 ===== */
  function _loop(ts) {
    ps.update(ts);
    ps.draw(ts);
    if (phase === 'heart' || phase === 'timeline') {
      heart.drawGlow(ts);
      heart.drawBeat(ts);
    }
    rafId = requestAnimationFrame(_loop);
  }

  /* ===== 鍚姩 ===== */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  addEventListener('load', function() { if (ps) ps._resize(); });
})();


