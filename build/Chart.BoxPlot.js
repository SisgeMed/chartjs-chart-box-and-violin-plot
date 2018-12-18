(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('chart.js')) :
	typeof define === 'function' && define.amd ? define(['exports', 'chart.js'], factory) :
	(factory((global.ChartBoxPlot = global.ChartBoxPlot || {}),global.Chart));
}(this, (function (exports,Chart) { 'use strict';

var ascending = function (a, b) {
  return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
};

var bisector = function (compare) {
  if (compare.length === 1) compare = ascendingComparator(compare);
  return {
    left: function left(a, x, lo, hi) {
      if (lo == null) lo = 0;
      if (hi == null) hi = a.length;
      while (lo < hi) {
        var mid = lo + hi >>> 1;
        if (compare(a[mid], x) < 0) lo = mid + 1;else hi = mid;
      }
      return lo;
    },
    right: function right(a, x, lo, hi) {
      if (lo == null) lo = 0;
      if (hi == null) hi = a.length;
      while (lo < hi) {
        var mid = lo + hi >>> 1;
        if (compare(a[mid], x) > 0) hi = mid;else lo = mid + 1;
      }
      return lo;
    }
  };
};

function ascendingComparator(f) {
  return function (d, x) {
    return ascending(f(d), x);
  };
}

var ascendingBisect = bisector(ascending);
var bisectRight = ascendingBisect.right;

function pair(a, b) {
  return [a, b];
}

var number = function (x) {
  return x === null ? NaN : +x;
};

var extent = function (values, valueof) {
  var n = values.length,
      i = -1,
      value,
      min,
      max;

  if (valueof == null) {
    while (++i < n) {
      // Find the first comparable value.
      if ((value = values[i]) != null && value >= value) {
        min = max = value;
        while (++i < n) {
          // Compare the remaining values.
          if ((value = values[i]) != null) {
            if (min > value) min = value;
            if (max < value) max = value;
          }
        }
      }
    }
  } else {
    while (++i < n) {
      // Find the first comparable value.
      if ((value = valueof(values[i], i, values)) != null && value >= value) {
        min = max = value;
        while (++i < n) {
          // Compare the remaining values.
          if ((value = valueof(values[i], i, values)) != null) {
            if (min > value) min = value;
            if (max < value) max = value;
          }
        }
      }
    }
  }

  return [min, max];
};

var identity = function (x) {
  return x;
};

var d3range = function (start, stop, step) {
  start = +start, stop = +stop, step = (n = arguments.length) < 2 ? (stop = start, start = 0, 1) : n < 3 ? 1 : +step;

  var i = -1,
      n = Math.max(0, Math.ceil((stop - start) / step)) | 0,
      range = new Array(n);

  while (++i < n) {
    range[i] = start + i * step;
  }

  return range;
};

var e10 = Math.sqrt(50);
var e5 = Math.sqrt(10);
var e2 = Math.sqrt(2);

function tickIncrement(start, stop, count) {
    var step = (stop - start) / Math.max(0, count),
        power = Math.floor(Math.log(step) / Math.LN10),
        error = step / Math.pow(10, power);
    return power >= 0 ? (error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1) * Math.pow(10, power) : -Math.pow(10, -power) / (error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1);
}

function tickStep(start, stop, count) {
    var step0 = Math.abs(stop - start) / Math.max(0, count),
        step1 = Math.pow(10, Math.floor(Math.log(step0) / Math.LN10)),
        error = step0 / step1;
    if (error >= e10) step1 *= 10;else if (error >= e5) step1 *= 5;else if (error >= e2) step1 *= 2;
    return stop < start ? -step1 : step1;
}

var sturges = function (values) {
  return Math.ceil(Math.log(values.length) / Math.LN2) + 1;
};

var quantile = function (values, p, valueof) {
  if (valueof == null) valueof = number;
  if (!(n = values.length)) return;
  if ((p = +p) <= 0 || n < 2) return +valueof(values[0], 0, values);
  if (p >= 1) return +valueof(values[n - 1], n - 1, values);
  var n,
      i = (n - 1) * p,
      i0 = Math.floor(i),
      value0 = +valueof(values[i0], i0, values),
      value1 = +valueof(values[i0 + 1], i0 + 1, values);
  return value0 + (value1 - value0) * (i - i0);
};

var d3max = function (values, valueof) {
  var n = values.length,
      i = -1,
      value,
      max;

  if (valueof == null) {
    while (++i < n) {
      // Find the first comparable value.
      if ((value = values[i]) != null && value >= value) {
        max = value;
        while (++i < n) {
          // Compare the remaining values.
          if ((value = values[i]) != null && value > max) {
            max = value;
          }
        }
      }
    }
  } else {
    while (++i < n) {
      // Find the first comparable value.
      if ((value = valueof(values[i], i, values)) != null && value >= value) {
        max = value;
        while (++i < n) {
          // Compare the remaining values.
          if ((value = valueof(values[i], i, values)) != null && value > max) {
            max = value;
          }
        }
      }
    }
  }

  return max;
};

var min = function (values, valueof) {
  var n = values.length,
      i = -1,
      value,
      min;

  if (valueof == null) {
    while (++i < n) {
      // Find the first comparable value.
      if ((value = values[i]) != null && value >= value) {
        min = value;
        while (++i < n) {
          // Compare the remaining values.
          if ((value = values[i]) != null && min > value) {
            min = value;
          }
        }
      }
    }
  } else {
    while (++i < n) {
      // Find the first comparable value.
      if ((value = valueof(values[i], i, values)) != null && value >= value) {
        min = value;
        while (++i < n) {
          // Compare the remaining values.
          if ((value = valueof(values[i], i, values)) != null && min > value) {
            min = value;
          }
        }
      }
    }
  }

  return min;
};

function length(d) {
  return d.length;
}

// See <http://en.wikipedia.org/wiki/Kernel_(statistics)>.










function gaussian(u) {
	return 1 / Math.sqrt(2 * Math.PI) * Math.exp(-.5 * u * u);
}

// Welford's algorithm.
function mean$1(x) {
  var n = x.length;
  if (n === 0) return NaN;
  var m = 0,
      i = -1;
  while (++i < n) {
    m += (x[i] - m) / (i + 1);
  }return m;
}


// Unbiased estimate of a sample's variance.
// Also known as the sample variance, where the denominator is n - 1.
function variance$1(x) {
  var n = x.length;
  if (n < 1) return NaN;
  if (n === 1) return 0;
  var mean = mean$1(x),
      i = -1,
      s = 0;
  while (++i < n) {
    var v = x[i] - mean;
    s += v * v;
  }
  return s / (n - 1);
}

function ascending$1(a, b) {
  return a - b;
}

// Uses R's quantile algorithm type=7.
function quantiles(d, quantiles) {
  d = d.slice().sort(ascending$1);
  var n_1 = d.length - 1;
  return quantiles.map(function (q) {
    if (q === 0) return d[0];else if (q === 1) return d[n_1];

    var index = 1 + q * n_1,
        lo = Math.floor(index),
        h = index - lo,
        a = d[lo - 1];

    return h === 0 ? a : a + h * (d[lo] - a);
  });
}

function iqr(x) {
  var quartiles = quantiles(x, [.25, .75]);
  return quartiles[1] - quartiles[0];
}

// Bandwidth selectors for Gaussian kernels.
// Based on R's implementations in `stats.bw`.

// Silverman, B. W. (1986) Density Estimation. London: Chapman and Hall.


// Scott, D. W. (1992) Multivariate Density Estimation: Theory, Practice, and
// Visualization. Wiley.
function nrd(x) {
    var h = iqr(x) / 1.34;
    return 1.06 * Math.min(Math.sqrt(variance$1(x)), h) * Math.pow(x.length, -1 / 5);
}

function functor(v) {
  return typeof v === "function" ? v : function () {
    return v;
  };
}

// http://exploringdata.net/den_trac.htm
function kde() {
  var kernel = gaussian,
      sample = [],
      bandwidth = nrd;

  function kde(points, i) {
    var bw = bandwidth.call(this, sample);
    return points.map(function (x) {
      var i = -1,
          y = 0,
          n = sample.length;
      while (++i < n) {
        y += kernel((x - sample[i]) / bw);
      }
      return [x, y / bw / n];
    });
  }

  kde.kernel = function (x) {
    if (!arguments.length) return kernel;
    kernel = x;
    return kde;
  };

  kde.sample = function (x) {
    if (!arguments.length) return sample;
    sample = x;
    return kde;
  };

  kde.bandwidth = function (x) {
    if (!arguments.length) return bandwidth;
    bandwidth = functor(x);
    return kde;
  };

  return kde;
}

function whiskers(boxplot) {
  var iqr = boxplot.q3 - boxplot.q1;
  // since top left is max
  var whiskerMin = Math.max(boxplot.min, boxplot.q1 - iqr);
  var whiskerMax = Math.min(boxplot.max, boxplot.q3 + iqr);

  //var whiskerMin = boxplot.q1 - (1.5 * iqr);
  //var whiskerMax = boxplot.q3 + (1.5 * iqr);

  return {
    whiskerMin: whiskerMin,
    whiskerMax: whiskerMax
  };
}

function boxplotStats(arr) {
  // console.assert(Array.isArray(arr));
  if (arr.length === 0) {
    return {
      min: NaN,
      max: NaN,
      mean: NaN,
      median: NaN,
      q1: NaN,
      q3: NaN,
      whiskerMin: NaN,
      whiskerMax: NaN,
      outliers: [],
      total: NaN
    };
  }
  arr = arr.filter(function (v) {
    return typeof v === 'number' && !isNaN(v);
  });
  arr.sort(function (a, b) {
    return a - b;
  });

  var minmax = extent(arr);
  var base = {
    min: minmax[0],
    max: minmax[1],
    mean: mean$1(arr),
    median: quantile(arr, 0.5),
    q1: quantile(arr, 0.25),
    q3: quantile(arr, 0.75),
    outliers: [],
    total: arr.length
  };

  var _whiskers = whiskers(base),
      whiskerMin = _whiskers.whiskerMin,
      whiskerMax = _whiskers.whiskerMax;

  base.outliers = arr.filter(function (v) {
    return v < whiskerMin || v > whiskerMax;
  });
  base.whiskerMin = whiskerMin;
  base.whiskerMax = whiskerMax;
  return base;
}

function violinStats(arr) {
  // console.assert(Array.isArray(arr));
  if (arr.length === 0) {
    return {
      outliers: []
    };
  }

  var stats = null;
  if(arr.__stats) {
    // stats = {...arr.__stats};
    stats = Object.assign({}, arr.__stats);
  }

  arr = arr.filter(function (v) {
    return typeof v === 'number' && !isNaN(v);
  });
  arr.sort(function (a, b) {
    return a - b;
  });

  var minmax = extent(arr);
  if(stats) {
    return {
      min: minmax[0],
      max: minmax[1],
      median: quantile(arr, 0.5),
      kde: kde().sample(arr),
      mean: stats.mean,
      q1: stats.q1,
      q3: stats.q3
    };
  }
  return {
    min: minmax[0],
    max: minmax[1],
    median: quantile(arr, 0.5),
    kde: kde().sample(arr)
  };
}

function asBoxPlotStats(value) {
  if (!value) {
    return null;
  }
  if (typeof value.median === 'number' && typeof value.q1 === 'number' && typeof value.q3 === 'number') {
    // sounds good, check for helper
    if (typeof value.whiskerMin === 'undefined') {
      var _whiskers2 = whiskers(value),
          whiskerMin = _whiskers2.whiskerMin,
          whiskerMax = _whiskers2.whiskerMax;

      value.whiskerMin = whiskerMin;
      value.whiskerMax = whiskerMax;
    }
    return value;
  }
  if (!Array.isArray(value)) {
    return undefined;
  }
  if (value.__stats === undefined) {
    value.__stats = boxplotStats(value);
  }
  return value.__stats;
}

function asViolinStats(value) {
  if (!value) {
    return null;
  }
  if (typeof value.median === 'number' && (typeof value.kde === 'function' || Array.isArray(value.coords))) {
    return value;
  }
  if (!Array.isArray(value)) {
    return undefined;
  }
  if (value.__kde === undefined) {
    value.__kde = violinStats(value);
  }
  return value.__kde;
}

function asValueStats(value, minStats, maxStats) {
  if (typeof value[minStats] === 'number' && typeof value[maxStats] === 'number') {
    return value;
  }
  if (!Array.isArray(value)) {
    return undefined;
  }
  return asBoxPlotStats(value);
}

function getRightValue(rawValue) {
  if (!rawValue) {
    return rawValue;
  }
  if (typeof rawValue === 'number' || typeof rawValue === 'string') {
    return Number(rawValue);
  }
  var b = asBoxPlotStats(rawValue);
  return b ? b.median : rawValue;
}

var commonScaleOptions = {
  ticks: {
    minStats: 'min',
    maxStats: 'max'
  }
};

function commonDataLimits(extraCallback) {
  var _this = this;

  var chart = this.chart;
  var isHorizontal = this.isHorizontal();
  var tickOpts = this.options.ticks;
  var minStats = tickOpts.minStats;
  var maxStats = tickOpts.maxStats;

  var matchID = function matchID(meta) {
    return isHorizontal ? meta.xAxisID === _this.id : meta.yAxisID === _this.id;
  };

  // First Calculate the range
  this.min = null;
  this.max = null;

  // Regular charts use x, y values
  // For the boxplot chart we have rawValue.min and rawValue.max for each point
  chart.data.datasets.forEach(function (d, i) {
    var meta = chart.getDatasetMeta(i);
    if (!chart.isDatasetVisible(i) || !matchID(meta)) {
      return;
    }
    d.data.forEach(function (value, j) {
      if (!value || meta.data[j].hidden) {
        return;
      }
      var stats = asValueStats(value, minStats, maxStats);
      if (!stats) {
        return;
      }

      if (_this.min === null || stats[minStats] < _this.min) {
        _this.min = stats[minStats];
      }

      if (_this.max === null || stats[maxStats] > _this.max) {
        _this.max = stats[maxStats];
      }

      if (extraCallback) {
        extraCallback(stats);
      }
    });
  });
}

function rnd(seed) {
  // Adapted from http://indiegamr.com/generate-repeatable-random-numbers-in-js/
  if (seed === undefined) {
    seed = Date.now();
  }
  return function () {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

var defaults$1 = Object.assign({}, Chart.defaults.global.elements.rectangle, {
  borderWidth: 1,
  outlierRadius: 2,
  outlierColor: Chart.defaults.global.elements.rectangle.backgroundColor,
  itemRadius: 2,
  itemStyle: 'circle',
  itemBackgroundColor: Chart.defaults.global.elements.rectangle.backgroundColor,
  itemBorderColor: Chart.defaults.global.elements.rectangle.borderColor
});

var ArrayElementBase = Chart.Element.extend({
  isVertical: function isVertical() {
    return this._view.width !== undefined;
  },
  draw: function draw() {
    // abstract
  },
  _drawItems: function _drawItems(vm, container, ctx, vert) {
    if (vm.itemRadius <= 0 || !container.items || container.items.length <= 0) {
      return;
    }
    ctx.save();
    ctx.strokeStle = vm.itemBorderColor;
    ctx.fillStyle = vm.itemBackgroundColor;
    // jitter based on random data
    // use the median to initialize the random number generator
    var random = rnd(container.median);

    if (vert) {
      container.items.forEach(function (v) {
        Chart.canvasHelpers.drawPoint(ctx, vm.itemStyle, vm.itemRadius, vm.x - vm.width / 2 + random() * vm.width, v);
      });
    } else {
      container.items.forEach(function (v) {
        Chart.canvasHelpers.drawPoint(ctx, vm.itemStyle, vm.itemRadius, v, vm.y - vm.height / 2 + random() * vm.height);
      });
    }
    ctx.restore();
  },
  _drawOutliers: function _drawOutliers(vm, container, ctx, vert) {
    if (!container.outliers) {
      return;
    }
    ctx.fillStyle = vm.outlierColor;
    ctx.beginPath();
    if (vert) {
      container.outliers.forEach(function (v) {
        ctx.arc(vm.x, v, vm.outlierRadius, 0, Math.PI * 2);
      });
    } else {
      container.outliers.forEach(function (v) {
        ctx.arc(v, vm.y, vm.outlierRadius, 0, Math.PI * 2);
      });
    }
    ctx.fill();
    ctx.closePath();
  },
  _getBounds: function _getBounds() {
    // abstract
    return {
      left: 0,
      top: 0,
      right: 0,
      bottom: 0
    };
  },
  height: function height() {
    return 0; // abstract
  },
  inRange: function inRange(mouseX, mouseY) {
    if (!this._view) {
      return false;
    }
    var bounds = this._getBounds();
    if(bounds){
      return mouseX >= bounds.left && mouseX <= bounds.right && mouseY >= bounds.top && mouseY <= bounds.bottom;
    }
    return null;
  },
  inLabelRange: function inLabelRange(mouseX, mouseY) {
    if (!this._view) {
      return false;
    }
    var bounds = this._getBounds();
    if (this.isVertical()) {
      return mouseX >= bounds.left && mouseX <= bounds.right;
    }
    return mouseY >= bounds.top && mouseY <= bounds.bottom;
  },
  inXRange: function inXRange(mouseX) {
    var bounds = this._getBounds();
    return mouseX >= bounds.left && mouseX <= bounds.right;
  },
  inYRange: function inYRange(mouseY) {
    var bounds = this._getBounds();
    return mouseY >= bounds.top && mouseY <= bounds.bottom;
  },
  getCenterPoint: function getCenterPoint() {
    var _view = this._view,
        x = _view.x,
        y = _view.y;

    return { x: x, y: y };
  },
  getArea: function getArea() {
    return 0; // abstract
  },
  tooltipPosition_: function tooltipPosition_() {
    return this.getCenterPoint();
  }
});

Chart.defaults.global.elements.boxandwhiskers = Object.assign({}, defaults$1);

var BoxAndWiskers = Chart.elements.BoxAndWhiskers = ArrayElementBase.extend({
  draw: function draw() {
    var ctx = this._chart.ctx;
    var vm = this._view;

    var boxplot = vm.boxplot;
    var vert = this.isVertical();

    this._drawItems(vm, boxplot, ctx, vert);

    ctx.save();

    ctx.fillStyle = vm.backgroundColor;
    ctx.strokeStyle = vm.borderColor;
    ctx.lineWidth = vm.borderWidth;

    this._drawBoxPlot(vm, boxplot, ctx, vert);
    this._drawOutliers(vm, boxplot, ctx, vert);

    ctx.restore();
  },
  _drawBoxPlot: function _drawBoxPlot(vm, boxplot, ctx, vert) {
    ctx.beginPath();
    if (vert) {
      var x = vm.x;
      var width = vm.width/2;
      var x0 = x - width / 2;
      ctx.strokeStyle="#000000";
      ctx.fillRect(x0, boxplot.q1, width, boxplot.q3 - boxplot.q1);
      ctx.strokeRect(x0, boxplot.q1, width, boxplot.q3 - boxplot.q1);
      ctx.strokeStyle="#3B31AA";

      ctx.beginPath();
      ctx.moveTo(x0, boxplot.whiskerMin);
      ctx.lineTo(x0 + width, boxplot.whiskerMin);
      ctx.moveTo(x, boxplot.whiskerMin);
      ctx.lineTo(x, boxplot.q1);
      ctx.moveTo(x0, boxplot.whiskerMax);
      ctx.lineTo(x0 + width, boxplot.whiskerMax);
      ctx.moveTo(x, boxplot.whiskerMax);
      ctx.lineTo(x, boxplot.q3);
      ctx.stroke();

      // median
      ctx.beginPath();
      ctx.moveTo(x0, boxplot.median);
      ctx.lineTo(x0 + width, boxplot.median);
      ctx.strokeStyle="#FF0000";
      ctx.stroke();

      // draw mean
      ctx.beginPath();
      ctx.moveTo(x0 + width/2 - 5, boxplot.mean - 5);
      ctx.lineTo(x0 + width/2 + 5, boxplot.mean + 5);

      ctx.moveTo(x0 + width/2 + 5, boxplot.mean - 5);
      ctx.lineTo(x0 + width/2 - 5, boxplot.mean + 5);
      ctx.strokeStyle="#3B31AA";
      ctx.stroke();

      // draw min
      ctx.beginPath();
      ctx.moveTo(x0 + width/2 - 4, boxplot.min + 8);
      ctx.lineTo(x0 + width/2 + 4, boxplot.min + 8);
      ctx.lineTo(x0 + width/2 , boxplot.min);
      ctx.lineTo(x0 + width/2 - 4, boxplot.min + 8);
      ctx.fillStyle = '#3B31AA';
      ctx.fill();
      ctx.strokeStyle="#000000";
      ctx.stroke();


      // draw max
      ctx.beginPath();
      ctx.moveTo(x0 + width/2 - 4, boxplot.max - 8);
      ctx.lineTo(x0 + width/2 + 4, boxplot.max - 8);
      ctx.lineTo(x0 + width/2 , boxplot.max);
      ctx.lineTo(x0 + width/2 - 4, boxplot.max - 8);
      ctx.fill();
      ctx.strokeStyle="#000000";
      ctx.stroke();


      // var outliers_perc = (boxplot.outliers.length / boxplot.total).toPrecision(2);

      // ctx.fillText(outliers_perc, x0 + width/2 - 20 ,320);
      // ctx.stroke();


    } else {
      var y = vm.y;
      var height = vm.height;
      var y0 = y - height / 2;
      ctx.fillRect(boxplot.q1, y0, boxplot.q3 - boxplot.q1, height);
      ctx.strokeRect(boxplot.q1, y0, boxplot.q3 - boxplot.q1, height);

      ctx.moveTo(boxplot.whiskerMin, y0);
      ctx.lineTo(boxplot.whiskerMin, y0 + height);
      ctx.moveTo(boxplot.whiskerMin, y);
      ctx.lineTo(boxplot.q1, y);
      ctx.moveTo(boxplot.whiskerMax, y0);
      ctx.lineTo(boxplot.whiskerMax, y0 + height);
      ctx.moveTo(boxplot.whiskerMax, y);
      ctx.lineTo(boxplot.q3, y);
      ctx.moveTo(boxplot.median, y0);
      ctx.lineTo(boxplot.median, y0 + height);

      // draw mean
      ctx.moveTo(boxplot.mean - 10, y0 + height/2 - 10);
      ctx.lineTo(boxplot.mean + 10, y0 + height/2 + 10);
      ctx.stroke();

      ctx.moveTo(boxplot.mean - 10, y0 + height/2 + 10);
      ctx.lineTo(boxplot.mean + 10, y0 + height/2 - 10);
      ctx.stroke();
    }
    ctx.stroke();
    ctx.closePath();


  },
  _getBounds: function _getBounds() {
    var vm = this._view;

    var vert = this.isVertical();
    var boxplot = vm.boxplot;

    if (!boxplot) {
      return {
        left: 0,
        top: 0,
        right: 0,
        bottom: 0
      };
    }

    if (vert) {
      var x = vm.x,
          width = vm.width;

      var x0 = x - width / 2;
      return {
        left: x0,
        top: boxplot.whiskerMax,
        right: x0 + width,
        bottom: boxplot.whiskerMin
      };
    }
    var y = vm.y,
        height = vm.height;

    var y0 = y - height / 2;
    return {
      left: boxplot.whiskerMin,
      top: y0,
      right: boxplot.whiskerMax,
      bottom: y0 + height
    };
  },
  height: function height() {
    var vm = this._view;
    return vm.base - Math.min(vm.boxplot.q1, vm.boxplot.q3);
  },
  getArea: function getArea() {
    var vm = this._view;
    var iqr = Math.abs(vm.boxplot.q3 - vm.boxplot.q1);
    if (this.isVertical()) {
      return iqr * vm.width;
    }
    return iqr * vm.height;
  }
});

Chart.defaults.global.elements.violin = Object.assign({
  points: 100
}, defaults$1);

var Violin = Chart.elements.Violin = ArrayElementBase.extend({
  draw: function draw() {
    var ctx = this._chart.ctx;
    var vm = this._view;

    var violin = vm.violin;
    var vert = this.isVertical();

    this._drawItems(vm, violin, ctx, vert);

    ctx.save();

    ctx.fillStyle = vm.backgroundColor;
    ctx.strokeStyle = vm.borderColor;
    ctx.lineWidth = vm.borderWidth;

    var coords = violin.coords;

    Chart.canvasHelpers.drawPoint(ctx, 'rectRot', 5, vm.x, vm.y);
    ctx.stroke();


    if (vert) {
      ctx.beginPath();
      var x = vm.x;
      var width = vm.width;
      var factor = width / 2 / violin.maxEstimate;
      ctx.moveTo(x, violin.min);
      coords.forEach(function (_ref) {
        var v = _ref.v,
            estimate = _ref.estimate;

        ctx.lineTo(x - estimate * factor, v);
      });
      ctx.lineTo(x, violin.max);
      ctx.moveTo(x, violin.min);
      coords.forEach(function (_ref2) {
        var v = _ref2.v,
            estimate = _ref2.estimate;

        ctx.lineTo(x + estimate * factor, v);
      });
      ctx.lineTo(x, violin.max);

      ctx.stroke();
      ctx.fill();
      ctx.closePath();

      // draw median
      ctx.beginPath();
      ctx.arc(x, violin.median, 2, 0, 2 * Math.PI, false);
      ctx.fillStyle = '#ddd';
      ctx.stroke();
      ctx.fill();
      ctx.closePath();

    } else {
      var y = vm.y;
      var height = vm.height;
      var _factor = height / 2 / violin.maxEstimate;
      ctx.moveTo(violin.min, y);
      coords.forEach(function (_ref3) {
        var v = _ref3.v,
            estimate = _ref3.estimate;

        ctx.lineTo(v, y - estimate * _factor);
      });
      ctx.lineTo(violin.max, y);
      ctx.moveTo(violin.min, y);
      coords.forEach(function (_ref4) {
        var v = _ref4.v,
            estimate = _ref4.estimate;

        ctx.lineTo(v, y + estimate * _factor);
      });
      ctx.lineTo(violin.max, y);
    }


    this._drawOutliers(vm, violin, ctx, vert);

    ctx.restore();
  },
  _getBounds: function _getBounds() {
    var vm = this._view;

    var vert = this.isVertical();
    var violin = vm.violin;

    if(violin){
      if (vert) {
        var x = vm.x,
            width = vm.width;

        var x0 = x - width / 2;
        return {
          left: x0,
          top: violin.max,
          right: x0 + width,
          bottom: violin.min
        };
      }
      var y = vm.y,
          height = vm.height;

      var y0 = y - height / 2;
      return {
        left: violin.min,
        top: y0,
        right: violin.max,
        bottom: y0 + height
      };
    }
    return null;
  },
  height: function height() {
    var vm = this._view;
    return vm.base - Math.min(vm.violin.min, vm.violin.max);
  },
  getArea: function getArea() {
    var vm = this._view;
    var iqr = Math.abs(vm.violin.max - vm.violin.min);
    if (this.isVertical()) {
      return iqr * vm.width;
    }
    return iqr * vm.height;
  }
});

var verticalDefaults = {
  scales: {
    yAxes: [{
      type: 'arrayLinear'
    }]
  }
};
var horizontalDefaults = {
  scales: {
    xAxes: [{
      type: 'arrayLinear'
    }]
  }
};

var array$1 = {
  _elementOptions: function _elementOptions() {
    return {};
  },
  updateElement: function updateElement(elem, index, reset) {
    var dataset = this.getDataset();
    var custom = elem.custom || {};
    var options = this._elementOptions();

    Chart.controllers.bar.prototype.updateElement.call(this, elem, index, reset);
    ['outlierRadius', 'itemRadius', 'itemStyle', 'itemBackgroundColor', 'itemBorderColor', 'outlierColor'].forEach(function (item) {
      elem._model[item] = custom[item] !== undefined ? custom[item] : Chart.helpers.valueAtIndexOrDefault(dataset[item], index, options[item]);
    });
  },
  _calculateCommonModel: function _calculateCommonModel(r, data, container, scale) {
    if (container.outliers) {
      r.outliers = container.outliers.map(function (d) {
        return scale.getPixelForValue(Number(d));
      });
    }

    if (Array.isArray(data)) {
      r.items = data.map(function (d) {
        return scale.getPixelForValue(Number(d));
      });
    }
  }
};

var defaults$2 = {
  tooltips: {
    enabled: false,
    custom: function(tooltipModel, data) {
      // Tooltip Element
      var tooltipEl = document.getElementById('chartjs-tooltip');
      var wrapper = document.getElementsByClassName('chart-wrapper');

      if(tooltipEl) {
        tooltipEl.remove();
      }

      if (tooltipModel.body) {
        tooltipEl = document.createElement('div');
        tooltipEl.id = 'chartjs-tooltip';
        tooltipEl.style.padding = 0;
        wrapper[0].appendChild(tooltipEl);

        var tooltip_width = 300;
        var tooltip_height =  350;
        var tooltip_x =  0;
        var tooltip_y =  0;

        var c = document.createElement('canvas');
        c.id = "mycanvas";
        c.width  = tooltip_width;
        c.height = tooltip_height;
        c.style.zIndex   = 8;
        c.style.position = "absolute";
        c.style.border   = "1px solid";
        c.style.boxShadow = '5px 5px 10px #888888';
        tooltipEl.appendChild(c);

        var ctx = c.getContext('2d');

        ctx.rect(tooltip_x,tooltip_y,tooltip_width,tooltip_height);
        ctx.fillStyle = '#FEFFE0';
        ctx.fill();

        // wisker (max)
        ctx.moveTo(10, 50);
        ctx.lineTo(40, 50);
        ctx.moveTo(25, 50);
        ctx.lineTo(25, 90);

        // box
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(10,90,30,60);
        ctx.strokeRect(10,90,30,60);
        // mediana
        ctx.moveTo(10, 126);
        ctx.lineTo(40, 126);

        // wisker (min)
        ctx.moveTo(10, 190);
        ctx.lineTo(40, 190);
        ctx.moveTo(25, 150);
        ctx.lineTo(25, 190);
        ctx.stroke();

        // labels
        ctx.font = "12px Arial";
        ctx.fillStyle = '#000000';
        ctx.fillText("Nr. rilevazioni",65,24);
        ctx.fillText("Q3 + 1,5(Q3 - Q1)",50,54);
        ctx.fillText("Q3 + (75th Percentile)",50,94);
        ctx.fillText("Mediana",50,130);
        ctx.fillText("Q1 + (25th Percentile)",50,154);
        ctx.fillText("Q1 - 1,5(Q3 - Q1)",50,194);

        ctx.fillText("Massimo",65,230);
        ctx.fillText("Media",65,250);
        ctx.fillText("Mimimo",65,270);
        ctx.fillText("Outliers %",65,300);

        var stringValues = tooltipModel.body[0].lines[0].split('(')[1].replace(')','');
        var labels = stringValues.split(',');
        ctx.font = "bold 12px Arial";

        var min = convertToHourMinString(labels[0].split(':')[1].trim());
        var q1 = convertToHourMinString(labels[1].split(':')[1].trim());
        var median = convertToHourMinString(labels[2].split(':')[1].trim());
        var mean = convertToHourMinString(labels[3].split(':')[1].trim());
        var q3 = convertToHourMinString(labels[4].split(':')[1].trim());
        var max = convertToHourMinString(labels[5].split(':')[1].trim());
        var total = labels[6].split(':')[1].trim();
        var whiskerMin = convertToHourMinString(labels[7].split(':')[1].trim());
        var whiskerMax = convertToHourMinString(labels[8].split(':')[1].trim());
        var outliers_perc =  labels[9].split(':')[1].trim();

        ctx.fillText(total,200,24);
        ctx.fillText(q3,200,94);
        ctx.fillText(median,200,130);
        ctx.fillText(q1,200,154);
        ctx.fillText(max,200,230);
        ctx.fillText(mean,200,250);
        ctx.fillText(min,200,270);
        ctx.fillText(whiskerMax,200,54);
        ctx.fillText(whiskerMin,200,194);
        ctx.fillText(outliers_perc,200,300);

        var linkX = 80;
        var linkY = 340;
        var linkHeight = 15;
        var linkWidth;
        var isLink = false;
        var linkText = "Dettaglio distribuzione";
        ctx.fillStyle = "#0000ff";
        ctx.font = "12px Arial";
        ctx.fillText(linkText, linkX, linkY);
        var linkWidth = ctx.measureText(linkText).width;
        c.addEventListener("mousemove", CanvasMouseMove, false);
        c.addEventListener("click", Link_click, false);
      }

      // Set caret Position
      tooltipEl.classList.remove('above', 'below', 'no-transform');
      if (tooltipModel.yAlign) {
          tooltipEl.classList.add(tooltipModel.yAlign);
      } else {
          tooltipEl.classList.add('no-transform');
      }


      var position = this._chart.canvas.getBoundingClientRect();

      var x_tooltip = tooltipModel.caretX;
      if(x_tooltip + tooltip_width < position.width){
        tooltipEl.style.left = x_tooltip + 20 + 'px';
      } else {
        tooltipEl.style.left = x_tooltip - (tooltip_width + 30 ) + 'px';
      }

      // Display, position, and set styles for font
      tooltipEl.style.opacity = 1;
      tooltipEl.style.position = 'absolute';
      tooltipEl.style.top = 0 + 'px';//position.top + tooltipModel.caretY + 'px';
      tooltipEl.style.fontFamily = tooltipModel._bodyFontFamily;
      tooltipEl.style.fontSize = tooltipModel.bodyFontSize + 'px';
      tooltipEl.style.fontStyle = tooltipModel._bodyFontStyle;
      tooltipEl.style.padding = tooltipModel.yPadding + 'px ' + tooltipModel.xPadding + 'px';


      function getBody(bodyItem) {
          return bodyItem.lines;
      }

      function convertToHourMinString(val) {
        var value = parseFloat(val);
        const minutes = Math.floor(value % 60);
        const hours = Math.floor(value / 60);
        return hours + 'h ' + minutes + '\'';
      }

      function CanvasMouseMove(e) {
          var x, y;
          if (e.layerX || e.layerX == 0) { // for firefox
              x = e.layerX;
              y = e.layerY;
          }
          x -= c.offsetLeft;
          y -= c.offsetTop;

          if (x >= linkX && x <= (linkX + linkWidth)
                  && y <= linkY && y >= (linkY - linkHeight)) {
              document.body.style.cursor = "pointer";
              isLink = true;
          }
          else {
              document.body.style.cursor = "";
              isLink = false;
          }
      }

      function Link_click(e) {
        var event = new CustomEvent("onClickLink");
        wrapper[0].dispatchEvent(event);
      }



    },
    callbacks: {
      label: function label(item, data) {
        var datasetLabel = data.datasets[item.datasetIndex].label || '';
        var value = data.datasets[item.datasetIndex].data[item.index];
        var b = asBoxPlotStats(value);
        var label = datasetLabel + ' ' + (typeof item.xLabel === 'string' ? item.xLabel : item.yLabel);
        if (!b) {
          return label + 'NaN';
        }
        if(b.outlier_ext ) {
          label += label + ' (min: ' + b.min + ', q1: ' + b.q1 + ', median: ' + b.median + ', mean: '+ b.mean +', q3: ' + b.q3 + ', max: ' + b.max + ', total: ' + b.total + ', wiskerMin: ' + b.whiskerMin + ', wiskerMax: ' + b.whiskerMax + ', outliers: ' + b.outlier_ext +')';
        }else {
          label += label + ' (min: ' + b.min + ', q1: ' + b.q1 + ', median: ' + b.median + ', mean: '+ b.mean +', q3: ' + b.q3 + ', max: ' + b.max + ', total: ' + b.total + ', wiskerMin: ' + b.whiskerMin + ', wiskerMax: ' + b.whiskerMax + ', outliers%: ' + parseFloat(b.outliers.length / b.total).toPrecision(3) * 100 +')';
        }
        return label
      }
    }
  }
};

Chart.defaults.boxplot = Chart.helpers.merge({}, [Chart.defaults.bar, verticalDefaults, defaults$2]);
Chart.defaults.horizontalBoxplot = Chart.helpers.merge({}, [Chart.defaults.horizontalBar, horizontalDefaults, defaults$2]);

var boxplot = Object.assign({}, array$1, {

  dataElementType: Chart.elements.BoxAndWhiskers,

  _elementOptions: function _elementOptions() {
    return this.chart.options.elements.boxandwhiskers;
  },

  /**
   * @private
   */
  updateElementGeometry: function updateElementGeometry(elem, index, reset) {
    Chart.controllers.bar.prototype.updateElementGeometry.call(this, elem, index, reset);
    elem._model.boxplot = this._calculateBoxPlotValuesPixels(this.index, index);
  },


  /**
   * @private
   */

  _calculateBoxPlotValuesPixels: function _calculateBoxPlotValuesPixels(datasetIndex, index) {
    var scale = this.getValueScale();
    var data = this.chart.data.datasets[datasetIndex].data[index];
    if (!data) {
      return null;
    }
    var v = asBoxPlotStats(data);

    var r = {};
    Object.keys(v).forEach(function (key) {
      if (key !== 'outliers') {
        r[key] = scale.getPixelForValue(Number(v[key]));
      }
    });
    this._calculateCommonModel(r, data, v, scale);
    return r;
  }
});
/**
 * This class is based off controller.bar.js from the upstream Chart.js library
 */
var BoxPlot = Chart.controllers.boxplot = Chart.controllers.bar.extend(boxplot);
var HorizontalBoxPlot = Chart.controllers.horizontalBoxplot = Chart.controllers.horizontalBar.extend(boxplot);

var draw_violinShape = function(context, left, top, width, height) {
  var base64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAH0AAAFgCAYAAACWv3bUAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyRpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoTWFjaW50b3NoKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpFNjY4RUQ2RkM0ODkxMUU4QTg4RkQ5NEJFMEVCRTZDMCIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpFNjY4RUQ3MEM0ODkxMUU4QTg4RkQ5NEJFMEVCRTZDMCI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOkU2NjhFRDZEQzQ4OTExRThBODhGRDk0QkUwRUJFNkMwIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOkU2NjhFRDZFQzQ4OTExRThBODhGRDk0QkUwRUJFNkMwIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+8h0ISQAAPWNJREFUeNrsfQl8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';
  var base64_color = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAH0AAAFgCAYAAACWv3bUAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyRpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoTWFjaW50b3NoKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpFNjY4RUQ3M0M0ODkxMUU4QTg4RkQ5NEJFMEVCRTZDMCIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpFNjY4RUQ3NEM0ODkxMUU4QTg4RkQ5NEJFMEVCRTZDMCI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOkU2NjhFRDcxQzQ4OTExRThBODhGRDk0QkUwRUJFNkMwIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOkU2NjhFRDcyQzQ4OTExRThBODhGRDk0QkUwRUJFNkMwIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+7tahpAAARj9JREFUeNrsfQlw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';
  var image = new Image();
  
  image.onload = function() {
    context.drawImage(image, left, top, width, height);
  };
  image.src = base64_color;
}


var defaults$3 = {
  tooltips: {
    enabled: false,
    custom: function(tooltipModel, data) {
      // Tooltip Element
      var tooltipEl = document.getElementById('chartjs-tooltip');
      var wrapper = document.getElementsByClassName('chart-wrapper');

      if(tooltipEl) {
        tooltipEl.remove();
      }

      if (tooltipModel.body) {
        tooltipEl = document.createElement('div');
        tooltipEl.id = 'chartjs-tooltip';
        tooltipEl.style.padding = 0;
        wrapper[0].appendChild(tooltipEl);

        var tooltip_width = 300;
        var tooltip_height =  350;
        var tooltip_x =  0;
        var tooltip_y =  0;

        var c = document.createElement('canvas');
        c.id = "mycanvas";
        c.width  = tooltip_width;
        c.height = tooltip_height;
        c.style.zIndex   = 8;
        c.style.position = "absolute";
        c.style.border   = "1px solid";
        c.style.boxShadow = '5px 5px 10px #888888';
        tooltipEl.appendChild(c);

        var ctx = c.getContext('2d');

        ctx.rect(tooltip_x,tooltip_y,tooltip_width,tooltip_height);
        ctx.fillStyle = '#FEFFE0';
        ctx.fill();


        draw_violinShape(ctx, '5', '50', '40', '140');
 /*       
        // wisker (max)
        ctx.moveTo(10, 50);
        ctx.lineTo(40, 50);
        ctx.moveTo(25, 50);
        ctx.lineTo(25, 90);

        // box
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(10,90,30,60);
        ctx.strokeRect(10,90,30,60);
        // mediana
        ctx.moveTo(10, 126);
        ctx.lineTo(40, 126);

        // wisker (min)
        ctx.moveTo(10, 190);
        ctx.lineTo(40, 190);
        ctx.moveTo(25, 150);
        ctx.lineTo(25, 190);
        ctx.stroke();
*/
        // labels
        ctx.font = "12px Arial";
        ctx.fillStyle = '#000000';
        ctx.fillText("Nr. rilevazioni",65,24);
        ctx.fillText("Q3 + 1,5(Q3 - Q1)",50,54);
        ctx.fillText("Q3 + (75th Percentile)",50,94);
        ctx.fillText("Mediana",50,130);
        ctx.fillText("Q1 + (25th Percentile)",50,154);
        ctx.fillText("Q1 - 1,5(Q3 - Q1)",50,194);

        ctx.fillText("Massimo",65,230);
        ctx.fillText("Media",65,250);
        ctx.fillText("Mimimo",65,270);
        ctx.fillText("Outliers %",65,300);

        var stringValues = tooltipModel.body[0].lines[0].split('(')[1].replace(')','');
        var labels = stringValues.split(',');
        ctx.font = "bold 12px Arial";

        var min = convertToHourMinString(labels[0].split(':')[1].trim());
        var q1 = convertToHourMinString(labels[1].split(':')[1].trim());
        var median = convertToHourMinString(labels[2].split(':')[1].trim());
        var mean = convertToHourMinString(labels[3].split(':')[1].trim());
        var q3 = convertToHourMinString(labels[4].split(':')[1].trim());
        var max = convertToHourMinString(labels[5].split(':')[1].trim());
        var total = labels[6].split(':')[1].trim();
        var whiskerMin = convertToHourMinString(labels[7].split(':')[1].trim());
        var whiskerMax = convertToHourMinString(labels[8].split(':')[1].trim());
        var outliers_perc =  labels[9].split(':')[1].trim();

        ctx.fillText(total,200,24);
        ctx.fillText(q3,200,94);
        ctx.fillText(median,200,130);
        ctx.fillText(q1,200,154);
        ctx.fillText(max,200,230);
        ctx.fillText(mean,200,250);
        ctx.fillText(min,200,270);
        ctx.fillText(whiskerMax,200,54);
        ctx.fillText(whiskerMin,200,194);
        ctx.fillText(outliers_perc,200,300);

        var linkX = 80;
        var linkY = 340;
        var linkHeight = 15;
        var linkWidth;
        var isLink = false;
        var linkText = "Dettaglio distribuzione";
        ctx.fillStyle = "#0000ff";
        ctx.font = "12px Arial";
        ctx.fillText(linkText, linkX, linkY);
        var linkWidth = ctx.measureText(linkText).width;
        c.addEventListener("mousemove", CanvasMouseMove, false);
        c.addEventListener("click", Link_click, false);
      }

      // Set caret Position
      tooltipEl.classList.remove('above', 'below', 'no-transform');
      if (tooltipModel.yAlign) {
          tooltipEl.classList.add(tooltipModel.yAlign);
      } else {
          tooltipEl.classList.add('no-transform');
      }


      var position = this._chart.canvas.getBoundingClientRect();

      var x_tooltip = tooltipModel.caretX;
      if(x_tooltip + tooltip_width < position.width){
        tooltipEl.style.left = x_tooltip + 20 + 'px';
      } else {
        tooltipEl.style.left = x_tooltip - (tooltip_width + 30 ) + 'px';
      }

      // Display, position, and set styles for font
      tooltipEl.style.opacity = 1;
      tooltipEl.style.position = 'absolute';
      tooltipEl.style.top = 0 + 'px';//position.top + tooltipModel.caretY + 'px';
      tooltipEl.style.fontFamily = tooltipModel._bodyFontFamily;
      tooltipEl.style.fontSize = tooltipModel.bodyFontSize + 'px';
      tooltipEl.style.fontStyle = tooltipModel._bodyFontStyle;
      tooltipEl.style.padding = tooltipModel.yPadding + 'px ' + tooltipModel.xPadding + 'px';


      function getBody(bodyItem) {
          return bodyItem.lines;
      }

      function convertToHourMinString(val) {
        var value = parseFloat(val);
        const minutes = Math.floor(value % 60);
        const hours = Math.floor(value / 60);
        return hours + 'h ' + minutes + '\'';
      }

      function CanvasMouseMove(e) {
          var x, y;
          if (e.layerX || e.layerX == 0) { // for firefox
              x = e.layerX;
              y = e.layerY;
          }
          x -= c.offsetLeft;
          y -= c.offsetTop;

          if (x >= linkX && x <= (linkX + linkWidth)
                  && y <= linkY && y >= (linkY - linkHeight)) {
              document.body.style.cursor = "pointer";
              isLink = true;
          }
          else {
              document.body.style.cursor = "";
              isLink = false;
          }
      }

      function Link_click(e) {
        var event = new CustomEvent("onClickLink");
        wrapper[0].dispatchEvent(event);
      }



    },
    callbacks: {
      label: function label(item, data) {
        var datasetLabel = data.datasets[item.datasetIndex].label || '';
        var value = data.datasets[item.datasetIndex].data[item.index];
        var b = asBoxPlotStats(value);
        var label = datasetLabel + ' ' + (typeof item.xLabel === 'string' ? item.xLabel : item.yLabel);
        if (!b) {
          return label + 'NaN';
        }
        if(b.outlier_ext ) {
          label += label + ' (min: ' + b.min + ', q1: ' + b.q1 + ', median: ' + b.median + ', mean: '+ b.mean +', q3: ' + b.q3 + ', max: ' + b.max + ', total: ' + b.total + ', wiskerMin: ' + b.whiskerMin + ', wiskerMax: ' + b.whiskerMax + ', outliers: ' + b.outlier_ext +')';
        }else {
          label += label + ' (min: ' + b.min + ', q1: ' + b.q1 + ', median: ' + b.median + ', mean: '+ b.mean +', q3: ' + b.q3 + ', max: ' + b.max + ', total: ' + b.total + ', wiskerMin: ' + b.whiskerMin + ', wiskerMax: ' + b.whiskerMax + ', outliers%: ' + parseFloat(b.outliers.length / b.total).toPrecision(3) * 100 +')';
        }
        return label
      }
    }
  }
};

Chart.defaults.violin = Chart.helpers.merge({}, [Chart.defaults.bar, verticalDefaults, defaults$3]);
Chart.defaults.horizontalViolin = Chart.helpers.merge({}, [Chart.defaults.horizontalBar, horizontalDefaults, defaults$3]);

var controller = Object.assign({}, array$1, {

  dataElementType: Chart.elements.Violin,

  _elementOptions: function _elementOptions() {
    return this.chart.options.elements.violin;
  },

  /**
   * @private
   */
  updateElementGeometry: function updateElementGeometry(elem, index, reset) {
    Chart.controllers.bar.prototype.updateElementGeometry.call(this, elem, index, reset);
    var custom = elem.custom || {};
    var options = this._elementOptions();
    elem._model.violin = this._calculateViolinValuesPixels(this.index, index, custom.points !== undefined ? custom.points : options.points);
  },


  /**
   * @private
   */

  _calculateViolinValuesPixels: function _calculateViolinValuesPixels(datasetIndex, index, points) {
    var scale = this.getValueScale();
    var data = this.chart.data.datasets[datasetIndex].data[index];
    var violin = asViolinStats(data);

    if(violin.kde) {
      var range$$1 = violin.max - violin.min;
      var samples = d3range(violin.min, violin.max, range$$1 / points);
      if (samples[samples.length - 1] !== violin.max) {
        samples.push(violin.max);
      }
      var coords = violin.coords || violin.kde(samples).map(function (v) {
        return { v: v[0], estimate: v[1] };
      });
      var r = {
        min: scale.getPixelForValue(violin.min),
        max: scale.getPixelForValue(violin.max),
        median: scale.getPixelForValue(violin.median),
        coords: coords.map(function (_ref) {
          var v = _ref.v,
              estimate = _ref.estimate;
          return { v: scale.getPixelForValue(v), estimate: estimate };
        }),
        maxEstimate: d3max(coords, function (d) {
          return d.estimate;
        }),
        mean: violin.mean,
        q1: violin.q1,
        q3: violin.q3
      };
      this._calculateCommonModel(r, data, violin, scale);
      return r;
    }
    return null;
  }
});
/**
 * This class is based off controller.bar.js from the upstream Chart.js library
 */
var Violin$2 = Chart.controllers.violin = Chart.controllers.bar.extend(controller);
var HorizontalViolin = Chart.controllers.horizontalViolin = Chart.controllers.horizontalBar.extend(controller);

var helpers$1 = Chart.helpers;

var ArrayLinearScaleOptions = helpers$1.merge({}, [commonScaleOptions, Chart.scaleService.getScaleDefaults('linear')]);

var ArrayLinearScale = Chart.scaleService.getScaleConstructor('linear').extend({
  getRightValue: function getRightValue$$1(rawValue) {
    return Chart.LinearScaleBase.prototype.getRightValue.call(this, getRightValue(rawValue));
  },
  determineDataLimits: function determineDataLimits() {
    commonDataLimits.call(this);
    // Common base implementation to handle ticks.min, ticks.max, ticks.beginAtZero
    this.handleTickRangeOptions();
  }
});
Chart.scaleService.registerScaleType('arrayLinear', ArrayLinearScale, ArrayLinearScaleOptions);

var helpers$2 = Chart.helpers;

var ArrayLogarithmicScaleOptions = helpers$2.merge({}, [commonScaleOptions, Chart.scaleService.getScaleDefaults('logarithmic')]);

var ArrayLogarithmicScale = Chart.scaleService.getScaleConstructor('logarithmic').extend({
  getRightValue: function getRightValue$$1(rawValue) {
    return Chart.LinearScaleBase.prototype.getRightValue.call(this, getRightValue(rawValue));
  },
  determineDataLimits: function determineDataLimits() {
    var _this = this;

    // Add whitespace around bars. Axis shouldn't go exactly from min to max
    var tickOpts = this.options.ticks;
    this.minNotZero = null;
    commonDataLimits.call(this, function (boxPlot) {
      var value = boxPlot[tickOpts.minStats];
      if (value !== 0 && (_this.minNotZero === null || value < _this.minNotZero)) {
        _this.minNotZero = value;
      }
    });

    this.min = helpers$2.valueOrDefault(tickOpts.min, this.min - this.min * 0.05);
    this.max = helpers$2.valueOrDefault(tickOpts.max, this.max + this.max * 0.05);

    if (this.min === this.max) {
      if (this.min !== 0 && this.min !== null) {
        this.min = Math.pow(10, Math.floor(helpers$2.log10(this.min)) - 1);
        this.max = Math.pow(10, Math.floor(helpers$2.log10(this.max)) + 1);
      } else {
        this.min = 1;
        this.max = 10;
      }
    }
  }
});
Chart.scaleService.registerScaleType('arrayLogarithmic', ArrayLogarithmicScale, ArrayLogarithmicScaleOptions);

exports.BoxAndWhiskers = BoxAndWiskers;
exports.Violin = Violin;
exports.ArrayLinearScale = ArrayLinearScale;
exports.ArrayLogarithmicScale = ArrayLogarithmicScale;
exports.BoxPlot = BoxPlot;
exports.HorizontalBoxPlot = HorizontalBoxPlot;
exports.HorizontalViolin = HorizontalViolin;

Object.defineProperty(exports, '__esModule', { value: true });

})));
