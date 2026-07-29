
var TRANSITION = {};

TRANSITION.active = false;
TRANSITION.progress = 0;
TRANSITION.duration = 800;
TRANSITION.type = 'fade';
TRANSITION.onComplete = null;
TRANSITION.overlayCanvas = null;
TRANSITION.overlayCtx = null;
TRANSITION.bufferCanvas = null;
TRANSITION.bufferCtx = null;

TRANSITION.init = function() {
  var oc = document.getElementById('overlay-canvas');
  if (!oc) {
    oc = document.createElement('canvas');
    oc.id = 'overlay-canvas';
    oc.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:8;pointer-events:none';
    document.body.appendChild(oc);
  }
  TRANSITION.overlayCanvas = oc;
  TRANSITION.overlayCtx = oc.getContext('2d');
  TRANSITION._resize();
};

TRANSITION._resize = function() {
  var W = innerWidth, H = innerHeight, dpr = Math.min(devicePixelRatio||1, 2);
  TRANSITION.overlayCanvas.width = W * dpr;
  TRANSITION.overlayCanvas.height = H * dpr;
  TRANSITION.overlayCanvas.style.width = W + 'px';
  TRANSITION.overlayCanvas.style.height = H + 'px';
  TRANSITION.overlayCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  TRANSITION.W = W; TRANSITION.H = H;
};

TRANSITION.start = function(type, duration, callback) {
  TRANSITION.type = type || 'fade';
  TRANSITION.duration = duration || 800;
  TRANSITION.onComplete = callback || null;
  TRANSITION.progress = 0;
  TRANSITION.active = true;
  TRANSITION._resize();
};

TRANSITION.update = function(dt) {
  if (!TRANSITION.active) return;
  TRANSITION.progress += dt / TRANSITION.duration;
  if (TRANSITION.progress >= 1) {
    TRANSITION.progress = 1;
    TRANSITION.active = false;
    var cb = TRANSITION.onComplete;
    TRANSITION.onComplete = null;
    TRANSITION.overlayCtx.clearRect(0, 0, TRANSITION.W, TRANSITION.H);
    if (cb) cb();
    return;
  }
  TRANSITION._draw();
};

TRANSITION._draw = function() {
  var ctx = TRANSITION.overlayCtx;
  var p = TRANSITION.progress;
  ctx.clearRect(0, 0, TRANSITION.W, TRANSITION.H);

  switch (TRANSITION.type) {
    case 'fade':
      ctx.fillStyle = 'rgba(10,14,26,' + (p * 0.85) + ')';
      ctx.fillRect(0, 0, TRANSITION.W, TRANSITION.H);
      break;

    case 'radial':
      var r = Math.max(TRANSITION.W, TRANSITION.H) * 0.8 * p;
      var g = ctx.createRadialGradient(
        TRANSITION.W/2, TRANSITION.H/2, 0,
        TRANSITION.W/2, TRANSITION.H/2, r
      );
      g.addColorStop(0, 'rgba(10,14,26,' + (0.9 * p) + ')');
      g.addColorStop(0.7, 'rgba(10,14,26,' + (0.7 * p) + ')');
      g.addColorStop(1, 'rgba(10,14,26,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, TRANSITION.W, TRANSITION.H);
      break;

    case 'wipe':
      var x = TRANSITION.W * p;
      ctx.fillStyle = 'rgba(10,14,26,0.95)';
      ctx.fillRect(0, 0, x, TRANSITION.H);
      break;
  }
};

TRANSITION.init();

window.TRANSITION = TRANSITION;
