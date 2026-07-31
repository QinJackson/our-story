/**
 * 项目状态统一管理
 * phase: 当前流程阶段
 * listeners: 状态变更监听器
 * data: 跨模块共享的运行时数据
 */
var STATE = {
  phase: 'init',
  listeners: {},
  data: {}
};

STATE.setPhase = function(ph) {
  if (this.phase === ph) return;
  var old = this.phase;
  this.phase = ph;
  this._notify('phase', ph, old);
};

STATE.getPhase = function() {
  return this.phase;
};

STATE.set = function(key, value) {
  var old = this.data[key];
  this.data[key] = value;
  this._notify(key, value, old);
};

STATE.get = function(key) {
  return this.data[key];
};

STATE.on = function(key, fn) {
  if (!this.listeners[key]) this.listeners[key] = [];
  this.listeners[key].push(fn);
};

STATE._notify = function(key, value, old) {
  var fns = this.listeners[key];
  if (!fns) return;
  for (var i = 0; i < fns.length; i++) {
    try { fns[i](value, old); } catch(e) {}
  }
};

window.STATE = STATE;
