/**
 * 写给未来模块
 * 到达指定日期自动解锁信件
 */

function FutureLetterManager(diaryData) {
  this.data = diaryData ? diaryData.futureLetter : null;
  this.container = null;
  this.onBack = null;
  this.unlocked = false;
}

FutureLetterManager.prototype.open = function(onBack) {
  var self = this;
  this.onBack = onBack || null;

  var overlay = document.createElement('div');
  overlay.className = 'future-overlay';
  document.body.appendChild(overlay);
  this.container = overlay;

  // 如果没有配置数据，直接显示占位
  if (!this.data) {
    overlay.innerHTML =
      '<div class="future-header"><button class="future-back" id="future-back">‹ 返回</button></div>' +
      '<div class="future-body"><div class="future-empty">还没有配置信件内容</div></div>';
  } else {
    this._checkUnlock();
    overlay.innerHTML =
      '<div class="future-header"><button class="future-back" id="future-back">‹ 返回</button></div>' +
      '<div class="future-body">' +
        '<div class="future-title">' + this.data.title + '</div>' +
        (this.unlocked ?
          '<div class="future-letter">' + this._formatContent(this.data.content) + '</div>' :
          '<div class="future-lock">' +
            '<div class="future-lock-icon">🔒</div>' +
            '<div class="future-lock-text">' + this.data.preview + '</div>' +
            '<div class="future-countdown" id="future-countdown"></div>' +
          '</div>'
        ) +
      '</div>';
  }

  overlay.querySelector('#future-back').addEventListener('click', function() {
    self.close();
  });

  // 锁定状态启动倒计时
  if (!this.unlocked && this.data) {
    this._startCountdown();
  }
};

FutureLetterManager.prototype.close = function() {
  if (this.container && this.container.parentNode) {
    this.container.parentNode.removeChild(this.container);
  }
  this.container = null;
  if (this.onBack) this.onBack();
};

FutureLetterManager.prototype._checkUnlock = function() {
  if (!this.data || !this.data.unlockDate) return;
  var now = new Date();
  var unlock = new Date(this.data.unlockDate + 'T00:00:00+08:00');
  this.unlocked = now >= unlock;
};

FutureLetterManager.prototype._startCountdown = function() {
  var self = this;
  var el = document.getElementById('future-countdown');
  if (!el || !this.data || !this.data.unlockDate) return;

  function update() {
    var now = new Date();
    var unlock = new Date(self.data.unlockDate + 'T00:00:00+08:00');
    var diff = unlock - now;
    if (diff <= 0) {
      el.textContent = '信件已解锁 ✉️';
      setTimeout(function() { self._reopen(); }, 1500);
      return;
    }
    var days = Math.floor(diff / 86400000);
    var hours = Math.floor((diff % 86400000) / 3600000);
    var mins = Math.floor((diff % 3600000) / 60000);
    el.textContent = '还有 ' + days + ' 天 ' + hours + ' 小时 ' + mins + ' 分钟';
  }
  update();
  this._countdownTimer = setInterval(update, 60000);
};

FutureLetterManager.prototype._reopen = function() {
  if (this._countdownTimer) clearInterval(this._countdownTimer);
  this.close();
  this.open(this.onBack);
};

FutureLetterManager.prototype._formatContent = function(content) {
  if (!content) return '';
  return content.replace(/\n/g, '<br>');
};

window.FutureLetterManager = FutureLetterManager;
