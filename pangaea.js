;(function(global) {

  var Pangaea = function() {
    this._tweens = [];
    this._clock = 0.0;
    this._playhead = 0.0;
    this._synced = true;
    this._paused = false;
  };

  Pangaea.prototype.tick = function(delta) {
    if (this._paused) {
      return;
    }

    this._clock += delta;

    if (this._synced) {
      this._playhead = this._clock;
    } else {
      this._playhead += delta;
    }

    this._updateTweens();
  };

  Pangaea.prototype.setPlayhead = function(value) {
    this._playhead = value;
    this._synced = false;

    if (this._paused) {
      this._updateTweens();
    }
  };

  Pangaea.prototype.sync = function() {
    this._playhead = this._clock;
  };

  Pangaea.prototype.pause = function() {
    this._paused = true;
  };

  Pangaea.prototype.resume = function() {
    this._paused = false;
  };

  Pangaea.prototype._updateTweens = function() {
    for (var i = 0; i < this._tweens.length; i++) {
      this._tweens[i]._update(this._playhead);
    }
  };

  Pangaea.prototype.add = function(tween) {
    tween.start = this._clock;
    tween.end = this._clock + tween.duration;

    tween.from = {};
    for (var k in tween.to) {
      tween.from[k] = tween.target[k];
    }

    this._tweens.push(tween);
  };

  global.Pangaea = Pangaea;

  var Tween = function(target, duration, to) {
    this.target = target;
    this.duration = duration;
    this.to = to;

    // Linear tween function
    this.fn = function(t) {
      return t;
    };
  };

  Tween.prototype._update = function(clock) {
    var t = (clock - this.start) / (this.end - this.start);
    t = Math.max(t, 0);
    t = Math.min(t, 1);

    var progress = this.fn(t);
    for (var k in this.to) {
      this.target[k] = progress * (this.to[k] - this.from[k]);
    }
  };

  global.Tween = Tween;

})(this);