/**
 * 视频/MV 沉浸播放模块
 */

class VideoManager {
  constructor() {
    this.screen = document.getElementById('video-screen');
    this.video = document.getElementById('memory-video');
    this.introText = document.getElementById('video-intro-text');
    this.overlayContainer = document.getElementById('video-overlay-text');

    this.playing = false;
    this.callback = null;
    this._buildOverlays();

    // 让 video 在暂停后保留画面（不白屏）
    this.video.setAttribute('playsinline', '');
  }

  _buildOverlays() {
    this.overlayContainer.innerHTML = '';
    CONFIG.texts.videoOverlays.forEach((txt) => {
      const el = document.createElement('div');
      el.className = 'video-msg';
      el.textContent = txt;
      this.overlayContainer.appendChild(el);
    });
  }

  /**
   * 播放视频（完整沉浸流程）
   */
  play(onEnd) {
    if (this.playing) return;
    this.playing = true;
    this.callback = onEnd || null;

    navigator.vibrate && navigator.vibrate(30);

    // 1) 淡入黑色背景 + 显示过渡文字
    this.screen.classList.add('active');

    this.introText.textContent = CONFIG.texts.videoIntro;
    this.introText.classList.remove('hidden');
    setTimeout(() => this.introText.classList.add('visible'), 100);

    // 2) 2.5秒后开始播视频
    setTimeout(() => {
      this.introText.classList.remove('visible');
      this.introText.classList.add('hidden');

      this.video.src = CONFIG.paths.video;
      this.video.load();

      // 先关闭静音，再播放
      this.video.muted = false;

      this.video.play().then(() => {
        // 播放成功后确保声音打开
        this.video.muted = false;
      }).catch(() => {
        // 某些浏览器强制要求静音播放，尝试静音播放
        this.video.muted = true;
        this.video.play().catch(() => {});
      });

      setTimeout(() => this.video.classList.add('visible'), 300);

      // 3) 视频播放中叠加温暖文字
      this._showOverlays();

    }, CONFIG.timing.videoIntroDisplay);

    // 4) 视频结束回调
    this.video.addEventListener('ended', () => {
      this._end();
    }, { once: true });

    this.video.addEventListener('error', () => {
      setTimeout(() => this._end(), 2000);
    }, { once: true });
  }

  _showOverlays() {
    const msgs = this.overlayContainer.querySelectorAll('.video-msg');
    const duration = 6000;

    msgs.forEach((el, i) => {
      setTimeout(() => {
        el.classList.add('visible');
        setTimeout(() => { el.classList.remove('visible'); }, duration - 1000);
      }, 2000 + i * 800);
    });
  }

  _end() {
    if (!this.playing) return;
    this.playing = false;

    this.video.classList.remove('visible');
    this.video.pause();
    this.video.currentTime = 0;

    setTimeout(() => {
      this.screen.classList.remove('active');
      if (this.callback) this.callback();
    }, CONFIG.timing.videoFadeTransition);
  }
}

window.VideoManager = VideoManager;
