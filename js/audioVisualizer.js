function AudioVisualizer(audioElement) {
  this.audio = audioElement;
  this.ctx = null;
  this.analyser = null;
  this.dataArray = null;
  this.bufferLength = 0;
  this.ready = false;
  this.beat = 0;
  this.avgFreq = 0;
  this.lowFreq = 0;
  this.midFreq = 0;
  this.highFreq = 0;
  this._init();
}

AudioVisualizer.prototype._init = function() {
  try {
    var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    this.ctx = audioCtx;
    this.analyser = audioCtx.createAnalyser();
    this.analyser.fftSize = 128;
    this.bufferLength = this.analyser.frequencyBinCount;
    this.dataArray = new Uint8Array(this.bufferLength);

    var source = audioCtx.createMediaElementSource(this.audio);
    source.connect(this.analyser);
    this.analyser.connect(audioCtx.destination);

    this.ready = true;
  } catch(e) {
    // AudioContext not available or already connected
    this.ready = false;
  }
};

AudioVisualizer.prototype.update = function() {
  if (!this.ready || !this.analyser) return;
  this.analyser.getByteFrequencyData(this.dataArray);

  var sum = 0, low = 0, mid = 0, high = 0;
  var len = this.bufferLength;
  var lowCount = Math.floor(len * 0.3);
  var midCount = Math.floor(len * 0.3);

  for (var i = 0; i < len; i++) {
    var v = this.dataArray[i];
    sum += v;
    if (i < lowCount) low += v;
    else if (i < lowCount + midCount) mid += v;
    else high += v;
  }

  this.avgFreq = sum / len / 255;
  this.lowFreq = low / lowCount / 255;
  this.midFreq = mid / midCount / 255;
  this.highFreq = high / (len - lowCount - midCount) / 255;

  // Beat detection: sudden jump in low frequencies
  this.beat = this.lowFreq > 0.35 ? this.lowFreq : 0;
};

window.AudioVisualizer = AudioVisualizer;