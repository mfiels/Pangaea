;(function(global) {

  var Pangaea = function() {
    this._tweens = [];
    this._clock = 0.0;
    this._playhead = 0.0;
    this._synced = true;
    this._playheadPaused = false;
    this._clockPaused = false;
    this._monitoredObjects = [];
  };

  Pangaea.prototype.tick = function(delta) {

    if (!this._clockPaused) {
      this._clock += delta;
    }

    if (!this._playheadPaused) {
      if (this._synced) {
        this._playhead = this._clock;
      } else {
        this._playhead += delta;
      }
      this._updateTweens();
    }
  };

  Pangaea.prototype.setPlayhead = function(value) {
    this._playhead = value;
    this._synced = false;

    if (this._playheadPaused) {
      this._updateTweens();
    }
  };

  Pangaea.prototype.getClock = function() {
    return this._clock;
  };

  Pangaea.prototype.getPlayhead = function() {
    return this._playhead;
  };

  Pangaea.prototype.sync = function() {
    this._playhead = this._clock;
  };

  Pangaea.prototype.pause = function() {
    this._playheadPaused = true;
  };

  Pangaea.prototype.resume = function() {
    this._playheadPaused = false;
  };

  Pangaea.prototype._updateTweens = function() {
    var alreadyUpdated = {};
    // TODO(mark): Looping through all tweens all the time is a bad idea, should prune
    for (var i = this._tweens.length - 1; i >= 0; i--) {
      var tween = this._tweens[i];

      if (tween.start > this._playhead) {
        continue;
      }

      if (!alreadyUpdated[tween.targetId]) {
        alreadyUpdated[tween.targetId] = {};
      }

      var t = (this._playhead - tween.start) / (tween.end - tween.start);
      t = Math.max(t, 0);
      t = Math.min(t, 1);

      var progress = tween.fn(t);
      for (var k in tween.to) {
        if (!alreadyUpdated[tween.targetId][k]) {
          tween.target[k] = tween.from[k] + progress * (tween.to[k] - tween.from[k]);
          alreadyUpdated[tween.targetId][k] = true;
        }
      }
    }
  };

  Pangaea.prototype.add = function(tween) {
    // TODO(mark): This is a bad idea, keeping a list like this and linearly scanning
    // will become slow for many objects on screen
    var targetId = this._monitoredObjects.indexOf(tween.target);
    if (targetId == -1) {
      targetId = this._monitoredObjects.length;
      this._monitoredObjects.push(tween.target);
    }

    if (!this._synced) {
      var playheadAt = this._playhead;
      this.sync();
      this._updateTweens();
      tween._setDefaults(this._clock, targetId);
      this.setPlayhead(playheadAt);
    } else {
      tween._setDefaults(this._clock, targetId);
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

  Tween.prototype._setDefaults = function(clock, targetId) {
    this.targetId = targetId;
    this.start = clock;
    this.end = clock + this.duration;
    this.from = {};
    for (var k in this.to) {
      this.from[k] = this.target[k];
    }
  };

  global.Tween = Tween;

})(this);