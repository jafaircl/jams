const concat = Array.prototype.concat;
const slice = Array.prototype.slice;
const toString = Object.prototype.toString;

function calcRdx(n, m) {
  var val = n > m ? n : m;
  return Math.pow(10,
                  17 - ~~(Math.log(((val > 0) ? val : -val)) * Math.LOG10E));
}

var isArray = Array.isArray || function isArray(arg) {
  return toString.call(arg) === "[object Array]";
};


function isFunction(arg) {
  return toString.call(arg) === "[object Function]";
}


function isNumber(arg) {
  return typeof arg === "number" && arg === arg;
}


// Converts the jStat matrix to vector.
function toVector(arr) {
  return concat.apply([], arr);
}

function retZero() { return 0; }

function ascNum(a, b) { return a - b; }

function clip(arg, min, max) {
  return Math.max(min, Math.min(arg, max));
}

export class jStat  {
  constructor(args) {
    this.arguments = args;
  }
  
  betacf(x, a, b) {
    var fpmin = 1e-30;
    var m = 1;
    var qab = a + b;
    var qap = a + 1;
    var qam = a - 1;
    var c = 1;
    var d = 1 - qab * x / qap;
    var m2, aa, del, h;

    // These q's will be used in factors that occur in the coefficients
    if (Math.abs(d) < fpmin)
      d = fpmin;
    d = 1 / d;
    h = d;

    for (; m <= 100; m++) {
      m2 = 2 * m;
      aa = m * (b - m) * x / ((qam + m2) * (a + m2));
      // One step (the even one) of the recurrence
      d = 1 + aa * d;
      if (Math.abs(d) < fpmin)
        d = fpmin;
      c = 1 + aa / c;
      if (Math.abs(c) < fpmin)
        c = fpmin;
      d = 1 / d;
      h *= d * c;
      aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
      // Next step of the recurrence (the odd one)
      d = 1 + aa * d;
      if (Math.abs(d) < fpmin)
        d = fpmin;
      c = 1 + aa / c;
      if (Math.abs(c) < fpmin)
        c = fpmin;
      d = 1 / d;
      del = d * c;
      h *= del;
      if (Math.abs(del - 1.0) < 3e-7)
        break;
    }

    return h;
  }
  
  betafn(x, y) {
    // ensure arguments are positive
    if (x <= 0 || y <= 0)
      return undefined;
    // make sure x + y doesn't exceed the upper limit of usable values
    return (x + y > 170)
        ? Math.exp(this.betaln(x, y))
        : this.gammafn(x) * this.gammafn(y) / this.gammafn(x + y);
  }
  
  betaln(x, y) {
    return this.gammaln(x) + this.gammaln(y) - this.gammaln(x + y);
  }
  
  coeffvar(arr) {
    return this.stdev(arr) / this.mean(arr);
  }
  
  combination(n, m) {
    // make sure n or m don't exceed the upper limit of usable values
    return (n > 170 || m > 170)
        ? Math.exp(this.combinationln(n, m))
        : (this.factorial(n) / this.factorial(m)) / this.factorial(n - m);
  }
  
  combinationln(n, m) {
    return this.factorialln(n) - this.factorialln(m) - this.factorialln(n - m);
  }
  
  corrcoeff(arr1, arr2) {
    return this.covariance(arr1, arr2) /
        this.stdev(arr1, 1) /
        this.stdev(arr2, 1);
  }
  
  covariance(arr1, arr2) {
    var u = this.mean(arr1);
    var v = this.mean(arr2);
    var arr1Len = arr1.length;
    var sq_dev = new Array(arr1Len);
    var i;

    for (i = 0; i < arr1Len; i++)
      sq_dev[i] = (arr1[i] - u) * (arr2[i] - v);

    return this.sum(sq_dev) / (arr1Len - 1);
  }
  
  create(rows, cols, func) {
    var res = new Array(rows);
    var i, j;

    if (isFunction(cols)) {
      func = cols;
      cols = rows;
    }

    for (i = 0; i < rows; i++) {
      res[i] = new Array(cols);
      for (j = 0; j < cols; j++)
        res[i][j] = func(i, j);
    }

    return res;
  }
  
  cumsum(arr) {
    return jStat.cumreduce(arr, function (a, b) { return a + b; });
  }
  
  cumprod(arr) {
    return jStat.cumreduce(arr, function (a, b) { return a * b; });
  }
  
  deviation(arr) {
    var mean = this.mean(arr);
    var arrlen = arr.length;
    var dev = new Array(arrlen);
    for (var i = 0; i < arrlen; i++) {
      dev[i] = arr[i] - mean;
    }
    return dev;
  }
  
  diff(arr) {
    var diffs = [];
    var arrLen = arr.length;
    var i;
    for (i = 1; i < arrLen; i++)
      diffs.push(arr[i] - arr[i - 1]);
    return diffs;
  }
  
  erf(x) {
    var cof = [
      -1.3026537197817094, 6.4196979235649026e-1, 1.9476473204185836e-2,
      -9.561514786808631e-3, -9.46595344482036e-4, 3.66839497852761e-4,
      4.2523324806907e-5, -2.0278578112534e-5, -1.624290004647e-6,
      1.303655835580e-6, 1.5626441722e-8, -8.5238095915e-8,
      6.529054439e-9, 5.059343495e-9, -9.91364156e-10,
      -2.27365122e-10, 9.6467911e-11, 2.394038e-12,
      -6.886027e-12, 8.94487e-13, 3.13092e-13,
      -1.12708e-13, 3.81e-16, 7.106e-15,
      -1.523e-15, -9.4e-17, 1.21e-16,
      -2.8e-17
    ];
    var j = cof.length - 1;
    var isneg = false;
    var d = 0;
    var dd = 0;
    var t, ty, tmp, res;

    if (x < 0) {
      x = -x;
      isneg = true;
    }

    t = 2 / (2 + x);
    ty = 4 * t - 2;

    for(; j > 0; j--) {
      tmp = d;
      d = ty * d - dd + cof[j];
      dd = tmp;
    }

    res = t * Math.exp(-x * x + 0.5 * (cof[0] + ty * d) - dd);
    return isneg ? res - 1 : 1 - res;
  }
  
  erfc(x) {
    return 1 - this.erf(x);
  }
  
  erfcinv(p) {
    var j = 0;
    var x, err, t, pp;
    if (p >= 2)
      return -100;
    if (p <= 0)
      return 100;
    pp = (p < 1) ? p : 2 - p;
    t = Math.sqrt(-2 * Math.log(pp / 2));
    x = -0.70711 * ((2.30753 + t * 0.27061) /
                    (1 + t * (0.99229 + t * 0.04481)) - t);
    for (; j < 2; j++) {
      err = this.erfc(x) - pp;
      x += err / (1.12837916709551257 * Math.exp(-x * x) - x * err);
    }
    return (p < 1) ? x : -x;
  }
  
  factorial(n) {
    return n < 0 ? NaN : this.gammafn(n + 1);
  }
  
  factorialln(n) {
    return n < 0 ? NaN : this.gammaln(n + 1);
  }
  
  gammafn(x) {
    var p = [
      -1.716185138865495, 24.76565080557592, -379.80425647094563,
      629.3311553128184, 866.9662027904133, -31451.272968848367,
      -36144.413418691176, 66456.14382024054
    ];
    var q = [
      -30.8402300119739, 315.35062697960416, -1015.1563674902192,
      -3107.771671572311, 22538.118420980151, 4755.8462775278811,
      -134659.9598649693, -115132.2596755535
    ];
    var fact = false;
    var n = 0;
    var xden = 0;
    var xnum = 0;
    var y = x;
    var i, z, yi, res;
    if (y <= 0) {
      res = y % 1 + 3.6e-16;
      if (res) {
        fact = (!(y & 1) ? 1 : -1) * Math.PI / Math.sin(Math.PI * res);
        y = 1 - y;
      } else {
        return Infinity;
      }
    }
    yi = y;
    if (y < 1) {
      z = y++;
    } else {
      z = (y -= n = (y | 0) - 1) - 1;
    }
    for (i = 0; i < 8; ++i) {
      xnum = (xnum + p[i]) * z;
      xden = xden * z + q[i];
    }
    res = xnum / xden + 1;
    if (yi < y) {
      res /= yi;
    } else if (yi > y) {
      for (i = 0; i < n; ++i) {
        res *= y;
        y++;
      }
    }
    if (fact) {
      res = fact / res;
    }
    return res;
  }
  
  gammaln(x) {
    var j = 0;
    var cof = [
      76.18009172947146, -86.50532032941677, 24.01409824083091,
      -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5
    ];
    var ser = 1.000000000190015;
    var xx, y, tmp;
    tmp = (y = xx = x) + 5.5;
    tmp -= (xx + 0.5) * Math.log(tmp);
    for (; j < 6; j++)
      ser += cof[j] / ++y;
    return Math.log(2.5066282746310005 * ser / xx) - tmp;
  }
  
  gammap(a, x) {
    return this.lowRegGamma(a, x) * this.gammafn(a);
  }
  
  gammapinv(p, a) {
    var j = 0;
    var a1 = a - 1;
    var EPS = 1e-8;
    var gln = this.gammaln(a);
    var x, err, t, u, pp, lna1, afac;

    if (p >= 1)
      return Math.max(100, a + 100 * Math.sqrt(a));
    if (p <= 0)
      return 0;
    if (a > 1) {
      lna1 = Math.log(a1);
      afac = Math.exp(a1 * (lna1 - 1) - gln);
      pp = (p < 0.5) ? p : 1 - p;
      t = Math.sqrt(-2 * Math.log(pp));
      x = (2.30753 + t * 0.27061) / (1 + t * (0.99229 + t * 0.04481)) - t;
      if (p < 0.5)
        x = -x;
      x = Math.max(1e-3,
                   a * Math.pow(1 - 1 / (9 * a) - x / (3 * Math.sqrt(a)), 3));
    } else {
      t = 1 - a * (0.253 + a * 0.12);
      if (p < t)
        x = Math.pow(p / t, 1 / a);
      else
        x = 1 - Math.log(1 - (p - t) / (1 - t));
    }

    for(; j < 12; j++) {
      if (x <= 0)
        return 0;
      err = this.lowRegGamma(a, x) - p;
      if (a > 1)
        t = afac * Math.exp(-(x - a1) + a1 * (Math.log(x) - lna1));
      else
        t = Math.exp(-x + a1 * Math.log(x) - gln);
      u = err / t;
      x -= (t = u / (1 - 0.5 * Math.min(1, u * ((a - 1) / x - 1))));
      if (x <= 0)
        x = 0.5 * (x + t);
      if (Math.abs(t) < EPS * x)
        break;
    }

    return x;
  }
  
  geomean(arr) {
    return Math.pow(this.product(arr), 1 / arr.length);
  }
  
  histogram(arr, bins = []) {
    var first = this.min(arr);
    var binCnt = bins || 4;
    var binWidth = (jStat.max(arr) - first) / binCnt;
    var len = arr.length;
    var i;

    for (i = 0; i < binCnt; i++)
      bins[i] = 0;
    for (i = 0; i < len; i++)
      bins[Math.min(Math.floor(((arr[i] - first) / binWidth)), binCnt - 1)] += 1;

    return bins;
  }
  
  ibeta(x, a, b) {
    // Factors in front of the continued fraction.
    var bt = (x === 0 || x === 1) ?  0 :
      Math.exp(this.gammaln(a + b) - this.gammaln(a) -
               this.gammaln(b) + a * Math.log(x) + b *
               Math.log(1 - x));
    if (x < 0 || x > 1)
      return false;
    if (x < (a + 1) / (a + b + 2))
      // Use continued fraction directly.
      return bt * this.betacf(x, a, b) / a;
    // else use continued fraction after making the symmetry transformation.
    return 1 - bt * this.betacf(1 - x, b, a) / b;
  }
  
  ibetainv(p, a, b) {
    var EPS = 1e-8;
    var a1 = a - 1;
    var b1 = b - 1;
    var j = 0;
    var lna, lnb, pp, t, u, err, x, al, h, w, afac;
    if (p <= 0)
      return 0;
    if (p >= 1)
      return 1;
    if (a >= 1 && b >= 1) {
      pp = (p < 0.5) ? p : 1 - p;
      t = Math.sqrt(-2 * Math.log(pp));
      x = (2.30753 + t * 0.27061) / (1 + t* (0.99229 + t * 0.04481)) - t;
      if (p < 0.5)
        x = -x;
      al = (x * x - 3) / 6;
      h = 2 / (1 / (2 * a - 1)  + 1 / (2 * b - 1));
      w = (x * Math.sqrt(al + h) / h) - (1 / (2 * b - 1) - 1 / (2 * a - 1)) *
          (al + 5 / 6 - 2 / (3 * h));
      x = a / (a + b * Math.exp(2 * w));
    } else {
      lna = Math.log(a / (a + b));
      lnb = Math.log(b / (a + b));
      t = Math.exp(a * lna) / a;
      u = Math.exp(b * lnb) / b;
      w = t + u;
      if (p < t / w)
        x = Math.pow(a * w * p, 1 / a);
      else
        x = 1 - Math.pow(b * w * (1 - p), 1 / b);
    }
    afac = -this.gammaln(a) - this.gammaln(b) + this.gammaln(a + b);
    for(; j < 10; j++) {
      if (x === 0 || x === 1)
        return x;
      err = this.ibeta(x, a, b) - p;
      t = Math.exp(a1 * Math.log(x) + b1 * Math.log(1 - x) + afac);
      u = err / t;
      x -= (t = u / (1 - 0.5 * Math.min(1, u * (a1 / x - b1 / (1 - x)))));
      if (x <= 0)
        x = 0.5 * (x + t);
      if (x >= 1)
        x = 0.5 * (x + t + 1);
      if (Math.abs(t) < EPS * x && j > 0)
        break;
    }
    return x;
  }
  
  kurtosis(arr) {
    return this.stanMoment(arr, 4) - 3;
  }
  
  lowRegGamma(a, x) {
    var aln = this.gammaln(a);
    var ap = a;
    var sum = 1 / a;
    var del = sum;
    var b = x + 1 - a;
    var c = 1 / 1.0e-30;
    var d = 1 / b;
    var h = d;
    var i = 1;
    // calculate maximum number of itterations required for a
    var ITMAX = -~(Math.log((a >= 1) ? a : 1 / a) * 8.5 + a * 0.4 + 17);
    var an;

    if (x < 0 || a <= 0) {
      return NaN;
    } else if (x < a + 1) {
      for (; i <= ITMAX; i++) {
        sum += del *= x / ++ap;
      }
      return (sum * Math.exp(-x + a * Math.log(x) - (aln)));
    }

    for (; i <= ITMAX; i++) {
      an = -i * (i - a);
      b += 2;
      d = an * d + b;
      c = b + an / c;
      d = 1 / d;
      h *= d * c;
    }

    return (1 - h * Math.exp(-x + a * Math.log(x) - (aln)));
  }
  
  max(arr) {
    var high = arr[0];
    var i = 0;
    while (++i < arr.length)
      if (arr[i] > high)
        high = arr[i];
    return high;
  }
  
  mean(arr) {
    return this.sum(arr) / arr.length;
  }
  
  meandev(arr) {
    var devSum = 0;
    var mean = this.mean(arr);
    var i;
    for (i = arr.length - 1; i >= 0; i--)
      devSum += Math.abs(arr[i] - mean);
    return devSum / arr.length;
  }
  
  meansqerr(arr) {
    return this.sumsqerr(arr) / arr.length;
  }
  
  meddev(arr) {
    var devSum = 0;
    var median = this.median(arr);
    var i;
    for (i = arr.length - 1; i >= 0; i--)
      devSum += Math.abs(arr[i] - median);
    return devSum / arr.length;
  }
  
  median(arr) {
    var arrlen = arr.length;
    var _arr = arr.slice().sort(ascNum);
    // check if array is even or odd, then return the appropriate
    return !(arrlen & 1)
      ? (_arr[(arrlen / 2) - 1 ] + _arr[(arrlen / 2)]) / 2
      : _arr[(arrlen / 2) | 0 ];
  }
  
  min(arr) {
    var low = arr[0];
    var i = 0;
    while (++i < arr.length)
      if (arr[i] < low)
        low = arr[i];
    return low;
  }
  
  mode(arr) {
    var arrLen = arr.length;
    var _arr = arr.slice().sort(ascNum);
    var count = 1;
    var maxCount = 0;
    var numMaxCount = 0;
    var mode_arr = [];
    var i;

    for (i = 0; i < arrLen; i++) {
      if (_arr[i] === _arr[i + 1]) {
        count++;
      } else {
        if (count > maxCount) {
          mode_arr = [_arr[i]];
          maxCount = count;
          numMaxCount = 0;
        }
        // are there multiple max counts
        else if (count === maxCount) {
          mode_arr.push(_arr[i]);
          numMaxCount++;
        }
        // resetting count for new value in array
        count = 1;
      }
    }

    return numMaxCount === 0 ? mode_arr[0] : mode_arr;
  }
  
  percentile(arr, k) {
    var _arr = arr.slice().sort(ascNum);
    var realIndex = k * (_arr.length - 1);
    var index = parseInt(realIndex);
    var frac = realIndex - index;

    if (index + 1 < _arr.length) {
      return _arr[index] * (1 - frac) + _arr[index + 1] * frac;
    } else {
      return _arr[index];
    }
  }
  
  percentileOfScore(arr, score, kind) {
    var counter = 0;
    var len = arr.length;
    var strict = false;
    var value, i;

    if (kind === "strict")
      strict = true;

    for (i = 0; i < len; i++) {
      value = arr[i];
      if ((strict && value < score) ||
          (!strict && value <= score)) {
        counter++;
      }
    }

    return counter / len;
  }
  
  permutation(n, m) {
    return this.factorial(n) / this.factorial(n - m);
  }
  
  product(arr) {
    var prod = 1;
    var i = arr.length;
    while (--i >= 0)
      prod *= arr[i];
    return prod;
  }
  
  quantiles(arr, quantilesArray, alphap, betap) {
    var sortedArray = arr.slice().sort(ascNum);
    var quantileVals = [quantilesArray.length];
    var n = arr.length;
    var i, p, m, aleph, k, gamma;

    if (typeof alphap === "undefined")
      alphap = 3 / 8;
    if (typeof betap === "undefined")
      betap = 3 / 8;

    for (i = 0; i < quantilesArray.length; i++) {
      p = quantilesArray[i];
      m = alphap + p * (1 - alphap - betap);
      aleph = n * p + m;
      k = Math.floor(clip(aleph, 1, n - 1));
      gamma = clip(aleph - k, 0, 1);
      quantileVals[i] = (1 - gamma) * sortedArray[k - 1] + gamma * sortedArray[k];
    }

    return quantileVals;
  }
  
  quartiles(arr) {
    var arrlen = arr.length;
    var _arr = arr.slice().sort(ascNum);
    return [
      _arr[ Math.round((arrlen) / 4) - 1 ],
      _arr[ Math.round((arrlen) / 2) - 1 ],
      _arr[ Math.round((arrlen) * 3 / 4) - 1 ]
    ];
  }
  
  randg(shape, n, m) {
    var oalph = shape;
    var a1, a2, u, v, x, mat;
    if (!m)
      m = n;
    if (!shape)
      shape = 1;
    if (n) {
      mat = this.zeros(n,m);
      mat.alter(function() { return this.randg(shape); });
      return mat;
    }
    if (shape < 1)
      shape += 1;
    a1 = shape - 1 / 3;
    a2 = 1 / Math.sqrt(9 * a1);
    do {
      do {
        x = this.randn();
        v = 1 + a2 * x;
      } while(v <= 0);
      v = v * v * v;
      u = Math.random();
    } while(u > 1 - 0.331 * Math.pow(x, 4) &&
            Math.log(u) > 0.5 * x*x + a1 * (1 - v + Math.log(v)));
    // alpha > 1
    if (shape == oalph)
      return a1 * v;
    // alpha < 1
    do {
      u = Math.random();
    } while(u === 0);
    return Math.pow(u, 1 / oalph) * a1 * v;
  }
  
  randn(n, m) {
    var u, v, x, y, q;
    if (!m)
      m = n;
    if (n)
      return this.create(n, m, function() { return this.randn(); });
    do {
      u = Math.random();
      v = 1.7156 * (Math.random() - 0.5);
      x = u - 0.449871;
      y = Math.abs(v) + 0.386595;
      q = x * x + y * (0.19600 * y - 0.25472 * x);
    } while (q > 0.27597 && (q > 0.27846 || v * v > -4 * Math.log(u) * u * u));
    return v / u;
  }
  
  range(arr) {
    return this.max(arr) - this.min(arr);
  }
  
  rank(arr) {
    var arrlen = arr.length;
    var sorted = arr.slice().sort(ascNum);
    var ranks = new Array(arrlen);
    var val, i;
    
    for (i = 0; i < arrlen; i++) {
      var first = sorted.indexOf(arr[i]);
      var last = sorted.lastIndexOf(arr[i]);
      if (first === last) {
        val = first;
      } else {
        val = (first + last) / 2;
      }
      ranks[i] = val + 1;
    }
    return ranks;
  }
  
  skewness(arr) {
    return this.stanMoment(arr, 3);
  }
  
  spearmancoeff(arr1, arr2) {
    arr1 = this.rank(arr1);
    arr2 = this.rank(arr2);
    var arr1dev = this.deviation(arr1);
    var arr2dev = this.deviation(arr2);
    return this.sum(arr1dev.map(function (x, i) {
      return x * arr2dev[i];
    })) /
    Math.sqrt(this.sum(arr1dev.map(function (x) {
      return Math.pow(x, 2);
    })) * this.sum(arr2dev.map(function (x) {
      return Math.pow(x, 2);
    }))
    );
  }
  
  stanMoment(arr, n) {
    var mu = this.mean(arr);
    var sigma = this.stdev(arr);
    var len = arr.length;
    var skewSum = 0;

    for (var i = 0; i < len; i++)
      skewSum += Math.pow((arr[i] - mu) / sigma, n);

    return skewSum / arr.length;
  }
  
  stdev(arr, flag) {
    return Math.sqrt(this.variance(arr, flag));
  }
  
  sum(arr) {
    var sum = 0;
    var i = arr.length;
    while (--i >= 0)
      sum += arr[i];
    return sum;
  }
  
  sumrow(arr) {
    var sum = 0;
    var i = arr.length;
    while (--i >= 0)
      sum += arr[i];
    return sum;
  }
  
  sumsqrd(arr) {
    var sum = 0;
    var i = arr.length;
    while (--i >= 0)
      sum += arr[i] * arr[i];
    return sum;
  }
  
  sumsqerr(arr) {
    var mean = this.mean(arr);
    var sum = 0;
    var i = arr.length;
    var tmp;
    while (--i >= 0) {
      tmp = arr[i] - mean;
      sum += tmp * tmp;
    }
    return sum;
  }
  
  tscore(value, mean, sd, n) {
    var args = slice.call(arguments);
    return (args.length === 4) ?
      ((value - mean) / (sd / Math.sqrt(n))) :
      ((value - this.mean(mean)) /
       (this.stdev(mean, true) / Math.sqrt(n)));
  }
  
  unique(arr) {
    var hash = {}, _arr = [];
    for(var i = 0; i < arr.length; i++) {
      if (!hash[arr[i]]) {
        hash[arr[i]] = true;
        _arr.push(arr[i]);
      }
    }
    return _arr;
  }
  
  variance(arr, flag) {
    return this.sumsqerr(arr) / (arr.length - (flag ? 1 : 0));
  }
  
  zeros(rows, cols) {
    if (!isNumber(cols))
      cols = rows;
    return this.create(rows, cols, retZero);
  }
  
  zscore(value, mean, sd) {
    if (isNumber(mean)) {
      return (value - mean) / sd;
    }
    return (value - this.mean(mean)) / this.stdev(mean, sd);
  }
  
  ztest(value, mean, sd, sides) {
    var z;
    if (isArray(mean)) {
      // (value, array, sides, flag)
      z = this.zscore(value, mean, sides);
      return (sd === 1) ?
        (j$.normal.cdf(-Math.abs(z), 0, 1)) :
        (j$.normal.cdf(-Math.abs(z), 0, 1)*2);
    } else {
      if (sd) {
        // (value, mean, sd, sides)
        z = j$.zscore(value, mean, sd);
        return (args[3] === 1) ?
          (j$.normal.cdf(-Math.abs(z),0,1)) :
          (j$.normal.cdf(-Math.abs(z),0,1)* 2);
      } else {
        // (zscore, sides)
        z = args[0];
        return (args[1] === 1) ?
          (j$.normal.cdf(-Math.abs(z),0,1)) :
          (j$.normal.cdf(-Math.abs(z),0,1)*2);
      }
    }
  }
}

export class j$Beta {
  pdf(x, alpha, beta) {
    // PDF is zero outside the support
    if (x > 1 || x < 0)
      return 0;
    // PDF is one for the uniform case
    if (alpha == 1 && beta == 1)
      return 1;

    if (alpha < 512 && beta < 512) {
      return (Math.pow(x, alpha - 1) * Math.pow(1 - x, beta - 1)) /
          j$.betafn(alpha, beta);
    } else {
      return Math.exp((alpha - 1) * Math.log(x) +
                      (beta - 1) * Math.log(1 - x) -
                      j$.betaln(alpha, beta));
    }
  }

  cdf(x, alpha, beta) {
    return (x > 1 || x < 0) ? (x > 1) * 1 : j$.ibeta(x, alpha, beta);
  }

  inv(x, alpha, beta) {
    return j$.ibetainv(x, alpha, beta);
  }

  mean(alpha, beta) {
    return alpha / (alpha + beta);
  }

  median(alpha, beta) {
    return j$.ibetainv(0.5, alpha, beta);
  }

  mode(alpha, beta) {
    return (alpha - 1 ) / ( alpha + beta - 2);
  }

  // return a random sample
  sample(alpha, beta) {
    var u = j$.randg(alpha);
    return u / (u + j$.randg(beta));
  }

  variance(alpha, beta) {
    return (alpha * beta) / (Math.pow(alpha + beta, 2) * (alpha + beta + 1));
  }
}

export class j$Binomial {
  pdf(k, n, p) {
    return (p === 0 || p === 1) ?
      ((n * p) === k ? 1 : 0) :
      j$.combination(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
  }

  cdf(x, n, p) {
    var binomarr = [],
      k = 0;
    if (x < 0) {
      return 0;
    }
    if (x < n) {
      for (; k <= x; k++) {
        binomarr[ k ] = this.pdf(k, n, p);
      }
      return j$.sum(binomarr);
    }
    return 1;
  }
}

export class j$Cauchy {
  pdf(x, local, scale) {
    if (scale < 0) { return 0; }

    return (scale / (Math.pow(x - local, 2) + Math.pow(scale, 2))) / Math.PI;
  }

  cdf(x, local, scale) {
    return Math.atan((x - local) / scale) / Math.PI + 0.5;
  }

  inv(p, local, scale) {
    return local + scale * Math.tan(Math.PI * (p - 0.5));
  }

  median(local, scale) {
    return local;
  }

  mode(local, scale) {
    return local;
  }

  sample(local, scale) {
    return jStat.randn() *
        Math.sqrt(1 / (2 * j$.randg(0.5))) * scale + local;
  }
}

export class j$CentralF {
  pdf(x, df1, df2) {
    var p, q, f;

    if (x < 0)
      return 0;

    if (df1 <= 2) {
      if (x === 0 && df1 < 2) {
        return Infinity;
      }
      if (x === 0 && df1 === 2) {
        return 1;
      }
      return Math.sqrt((Math.pow(df1 * x, df1) * Math.pow(df2, df2)) /
                       (Math.pow(df1 * x + df2, df1 + df2))) /
                       (x * j$.betafn(df1/2, df2/2));
    }

    p = (df1 * x) / (df2 + x * df1);
    q = df2 / (df2 + x * df1);
    f = df1 * q / 2.0;
    return f * j$.binomial.pdf((df1 - 2) / 2, (df1 + df2 - 2) / 2, p);
  }

  cdf(x, df1, df2) {
    if (x < 0)
      return 0;
    return j$.ibeta((df1 * x) / (df1 * x + df2), df1 / 2, df2 / 2);
  }

  inv(x, df1, df2) {
    return df2 / (df1 * (1 / j$.ibetainv(x, df1 / 2, df2 / 2) - 1));
  }

  mean(df1, df2) {
    return (df2 > 2) ? df2 / (df2 - 2) : undefined;
  }

  mode(df1, df2) {
    return (df1 > 2) ? (df2 * (df1 - 2)) / (df1 * (df2 + 2)) : undefined;
  }

  // return a random sample
  sample(df1, df2) {
    var x1 = j$.randg(df1 / 2) * 2;
    var x2 = j$.randg(df2 / 2) * 2;
    return (x1 / df1) / (x2 / df2);
  }

  variance(df1, df2) {
    if (df2 <= 4)
      return undefined;
    return 2 * df2 * df2 * (df1 + df2 - 2) /
        (df1 * (df2 - 2) * (df2 - 2) * (df2 - 4));
  }
}

export class j$Chisquare {
  pdf(x, dof) {
    if (x < 0)
      return 0;
    return (x === 0 && dof === 2) ? 0.5 :
        Math.exp((dof / 2 - 1) * Math.log(x) - x / 2 - (dof / 2) *
                 Math.log(2) - j$.gammaln(dof / 2));
  }

  cdf(x, dof) {
    if (x < 0)
      return 0;
    return j$.lowRegGamma(dof / 2, x / 2);
  }

  inv(p, dof) {
    return 2 * j$.gammapinv(p, 0.5 * dof);
  }

  mean(dof) {
    return dof;
  }

  // TODO: this is an approximation (is there a better way?)
  median(dof) {
    return dof * Math.pow(1 - (2 / (9 * dof)), 3);
  }

  mode(dof) {
    return (dof - 2 > 0) ? dof - 2 : 0;
  }

  sample(dof) {
    return j$.randg(dof / 2) * 2;
  }

  variance(dof) {
    return 2 * dof;
  }
}

export class j$Exponential {
  pdf(x, rate) {
    return x < 0 ? 0 : rate * Math.exp(-rate * x);
  }

  cdf(x, rate) {
    return x < 0 ? 0 : 1 - Math.exp(-rate * x);
  }

  inv(p, rate) {
    return -Math.log(1 - p) / rate;
  }

  mean(rate) {
    return 1 / rate;
  }

  median(rate) {
    return (1 / rate) * Math.log(2);
  }

  mode(rate) {
    return 0;
  }

  sample(rate) {
    return -1 / rate * Math.log(Math.random());
  }

  variance(rate) {
    return Math.pow(rate, -2);
  }
}

export class j$Gamma {
  pdf(x, shape, scale) {
    if (x < 0)
      return 0;
    return (x === 0 && shape === 1) ? 1 / scale :
            Math.exp((shape - 1) * Math.log(x) - x / scale -
                    j$.gammaln(shape) - shape * Math.log(scale));
  }

  cdf(x, shape, scale) {
    if (x < 0)
      return 0;
    return j$.lowRegGamma(shape, x / scale);
  }

  inv(p, shape, scale) {
    return j$.gammapinv(p, shape) * scale;
  }

  mean(shape, scale) {
    return shape * scale;
  }

  mode(shape, scale) {
    if(shape > 1) return (shape - 1) * scale;
    return undefined;
  }

  sample(shape, scale) {
    return j$.randg(shape) * scale;
  }

  variance(shape, scale) {
    return shape * scale * scale;
  }
}

export class j$Hypgeom {
  pdf(k, N, m, n) {
    // Hypergeometric PDF.

    // A simplification of the CDF algorithm below.

    // k = number of successes drawn
    // N = population size
    // m = number of successes in population
    // n = number of items drawn from population

    if(k !== k | 0) {
      return false;
    } else if(k < 0 || k < m - (N - n)) {
      // It's impossible to have this few successes drawn.
      return 0;
    } else if(k > n || k > m) {
      // It's impossible to have this many successes drawn.
      return 0;
    } else if (m * 2 > N) {
      // More than half the population is successes.

      if(n * 2 > N) {
        // More than half the population is sampled.

        return this.pdf(N - m - n + k, N, N - m, N - n)
      } else {
        // Half or less of the population is sampled.

        return this.pdf(n - k, N, N - m, n);
      }

    } else if(n * 2 > N) {
      // Half or less is successes.

      return this.pdf(m - k, N, m, N - n);

    } else if(m < n) {
      // We want to have the number of things sampled to be less than the
      // successes available. So swap the definitions of successful and sampled.
      return this.pdf(k, N, n, m);
    } else {
      // If we get here, half or less of the population was sampled, half or
      // less of it was successes, and we had fewer sampled things than
      // successes. Now we can do this complicated iterative algorithm in an
      // efficient way.

      // The basic premise of the algorithm is that we partially normalize our
      // intermediate product to keep it in a numerically good region, and then
      // finish the normalization at the end.

      // This variable holds the scaled probability of the current number of
      // successes.
      var scaledPDF = 1;

      // This keeps track of how much we have normalized.
      var samplesDone = 0;

      for(var i = 0; i < k; i++) {
        // For every possible number of successes up to that observed...

        while(scaledPDF > 1 && samplesDone < n) {
          // Intermediate result is growing too big. Apply some of the
          // normalization to shrink everything.

          scaledPDF *= 1 - (m / (N - samplesDone));

          // Say we've normalized by this sample already.
          samplesDone++;
        }

        // Work out the partially-normalized hypergeometric PDF for the next
        // number of successes
        scaledPDF *= (n - i) * (m - i) / ((i + 1) * (N - m - n + i + 1));
      }

      for(; samplesDone < n; samplesDone++) {
        // Apply all the rest of the normalization
        scaledPDF *= 1 - (m / (N - samplesDone));
      }

      // Bound answer sanely before returning.
      return Math.min(1, Math.max(0, scaledPDF));
    }
  }

  cdf(x, N, m, n) {
    // Hypergeometric CDF.

    // This algorithm is due to Prof. Thomas S. Ferguson, <tom@math.ucla.edu>,
    // and comes from his hypergeometric test calculator at
    // <http://www.math.ucla.edu/~tom/distributions/Hypergeometric.html>.

    // x = number of successes drawn
    // N = population size
    // m = number of successes in population
    // n = number of items drawn from population

    if(x < 0 || x < m - (N - n)) {
      // It's impossible to have this few successes drawn or fewer.
      return 0;
    } else if(x >= n || x >= m) {
      // We will always have this many successes or fewer.
      return 1;
    } else if (m * 2 > N) {
      // More than half the population is successes.

      if(n * 2 > N) {
        // More than half the population is sampled.

        return this.cdf(N - m - n + x, N, N - m, N - n)
      } else {
        // Half or less of the population is sampled.

        return 1 - this.cdf(n - x - 1, N, N - m, n);
      }

    } else if(n * 2 > N) {
      // Half or less is successes.

      return 1 - this.cdf(m - x - 1, N, m, N - n);

    } else if(m < n) {
      // We want to have the number of things sampled to be less than the
      // successes available. So swap the definitions of successful and sampled.
      return this.cdf(x, N, n, m);
    } else {
      // If we get here, half or less of the population was sampled, half or
      // less of it was successes, and we had fewer sampled things than
      // successes. Now we can do this complicated iterative algorithm in an
      // efficient way.

      // The basic premise of the algorithm is that we partially normalize our
      // intermediate sum to keep it in a numerically good region, and then
      // finish the normalization at the end.

      // Holds the intermediate, scaled total CDF.
      var scaledCDF = 1;

      // This variable holds the scaled probability of the current number of
      // successes.
      var scaledPDF = 1;

      // This keeps track of how much we have normalized.
      var samplesDone = 0;

      for(var i = 0; i < x; i++) {
        // For every possible number of successes up to that observed...

        while(scaledCDF > 1 && samplesDone < n) {
          // Intermediate result is growing too big. Apply some of the
          // normalization to shrink everything.

          var factor = 1 - (m / (N - samplesDone));

          scaledPDF *= factor;
          scaledCDF *= factor;

          // Say we've normalized by this sample already.
          samplesDone++;
        }

        // Work out the partially-normalized hypergeometric PDF for the next
        // number of successes
        scaledPDF *= (n - i) * (m - i) / ((i + 1) * (N - m - n + i + 1));

        // Add to the CDF answer.
        scaledCDF += scaledPDF;
      }

      for(; samplesDone < n; samplesDone++) {
        // Apply all the rest of the normalization
        scaledCDF *= 1 - (m / (N - samplesDone));
      }

      // Bound answer sanely before returning.
      return Math.min(1, Math.max(0, scaledCDF));
    }
  }
}

export class j$Invgamma {
  pdf(x, shape, scale) {
    if (x <= 0)
      return 0;
    return Math.exp(-(shape + 1) * Math.log(x) - scale / x -
                    j$.gammaln(shape) + shape * Math.log(scale));
  }

  cdf(x, shape, scale) {
    if (x <= 0)
      return 0;
    return 1 - j$.lowRegGamma(shape, scale / x);
  }

  inv(p, shape, scale) {
    return scale / j$.gammapinv(1 - p, shape);
  }

  mean(shape, scale) {
    return (shape > 1) ? scale / (shape - 1) : undefined;
  }

  mode(shape, scale) {
    return scale / (shape + 1);
  }

  sample(shape, scale) {
    return scale / j$.randg(shape);
  }

  variance(shape, scale) {
    if (shape <= 2)
      return undefined;
    return scale * scale / ((shape - 1) * (shape - 1) * (shape - 2));
  }
}

export class j$Kumaraswamy {
  pdf(x, alpha, beta) {
    if (x === 0 && alpha === 1)
      return beta;
    else if (x === 1 && beta === 1)
      return alpha;
    return Math.exp(Math.log(alpha) + Math.log(beta) + (alpha - 1) *
                    Math.log(x) + (beta - 1) *
                    Math.log(1 - Math.pow(x, alpha)));
  }

  cdf(x, alpha, beta) {
    if (x < 0)
      return 0;
    else if (x > 1)
      return 1;
    return (1 - Math.pow(1 - Math.pow(x, alpha), beta));
  }

  inv(p, alpha, beta) {
    return Math.pow(1 - Math.pow(1 - p, 1 / beta), 1 / alpha);
  }

  mean(alpha, beta) {
    return (beta * j$.gammafn(1 + 1 / alpha) *
            j$.gammafn(beta)) / (j$.gammafn(1 + 1 / alpha + beta));
  }

  median(alpha, beta) {
    return Math.pow(1 - Math.pow(2, -1 / beta), 1 / alpha);
  }

  mode(alpha, beta) {
    if (!(alpha >= 1 && beta >= 1 && (alpha !== 1 && beta !== 1)))
      return undefined;
    return Math.pow((alpha - 1) / (alpha * beta - 1), 1 / alpha);
  }

  variance(alpha, beta) {
    throw new Error('variance not yet implemented');
    // TODO: complete this
  }
}

export class j$Lognormal {
  pdf(x, mu, sigma) {
    if (x <= 0)
      return 0;
    return Math.exp(-Math.log(x) - 0.5 * Math.log(2 * Math.PI) -
                    Math.log(sigma) - Math.pow(Math.log(x) - mu, 2) /
                    (2 * sigma * sigma));
  }

  cdf(x, mu, sigma) {
    if (x < 0)
      return 0;
    return 0.5 +
        (0.5 * j$.erf((Math.log(x) - mu) / Math.sqrt(2 * sigma * sigma)));
  }

  inv(p, mu, sigma) {
    return Math.exp(-1.41421356237309505 * sigma * j$.erfcinv(2 * p) + mu);
  }

  mean(mu, sigma) {
    return Math.exp(mu + sigma * sigma / 2);
  }

  median(mu, sigma) {
    return Math.exp(mu);
  }

  mode(mu, sigma) {
    return Math.exp(mu - sigma * sigma);
  }

  sample(mu, sigma) {
    return Math.exp(j$.randn() * sigma + mu);
  }

  variance(mu, sigma) {
    return (Math.exp(sigma * sigma) - 1) * Math.exp(2 * mu + sigma * sigma);
  }
}

export class j$Negbin {
  pdf(k, r, p) {
    if (k !== k >>> 0)
      return false;
    if (k < 0)
      return 0;
    return jStat.combination(k + r - 1, r - 1) *
        Math.pow(1 - p, k) * Math.pow(p, r);
  }

  cdf(x, r, p) {
    var sum = 0,
      k = 0;
    if (x < 0) return 0;
    for (; k <= x; k++) {
      sum += jStat.negbin.pdf(k, r, p);
    }
    return sum;
  }
}

export class j$Normal {
  pdf(x, mu, sigma) {
    if (x <= 0)
      return 0;
    return Math.exp(-Math.log(x) - 0.5 * Math.log(2 * Math.PI) -
                    Math.log(sigma) - Math.pow(Math.log(x) - mu, 2) /
                    (2 * sigma * sigma));
  }

  cdf(x, mu, sigma) {
    if (x < 0)
      return 0;
    return 0.5 +
        (0.5 * j$.erf((Math.log(x) - mu) / Math.sqrt(2 * sigma * sigma)));
  }

  inv(p, mu, sigma) {
    return Math.exp(-1.41421356237309505 * sigma * j$.erfcinv(2 * p) + mu);
  }

  mean(mu, sigma) {
    return Math.exp(mu + sigma * sigma / 2);
  }

  median(mu) {
    return Math.exp(mu);
  }

  mode(mu, sigma) {
    return Math.exp(mu - sigma * sigma);
  }

  sample(mu, sigma) {
    return Math.exp(j$.randn() * sigma + mu);
  }

  variance(mu, sigma) {
    return (Math.exp(sigma * sigma) - 1) * Math.exp(2 * mu + sigma * sigma);
  }
}

export class j$Pareto {
  pdf(x, scale, shape) {
    if (x < scale)
      return 0;
    return (shape * Math.pow(scale, shape)) / Math.pow(x, shape + 1);
  }

  cdf(x, scale, shape) {
    if (x < scale)
      return 0;
    return 1 - Math.pow(scale / x, shape);
  }

  inv(p, scale, shape) {
    return scale / Math.pow(1 - p, 1 / shape);
  }

  mean(scale, shape) {
    if (shape <= 1)
      return undefined;
    return (shape * Math.pow(scale, shape)) / (shape - 1);
  }

  median(scale, shape) {
    return scale * (shape * Math.SQRT2);
  }

  mode(scale, shape) {
    return scale;
  }

  variance(scale, shape) {
    if (shape <= 2)
      return undefined;
    return (scale*scale * shape) / (Math.pow(shape - 1, 2) * (shape - 2));
  }
}

export class j$Poisson {
  pdf(k, l) {
    if (l < 0 || (k % 1) !== 0 || k < 0) {
      return 0;
    }

    return Math.pow(l, k) * Math.exp(-l) / j$.factorial(k);
  }

  cdf(x, l) {
    var sumarr = [],
      k = 0;
    if (x < 0) return 0;
    for (; k <= x; k++) {
      sumarr.push(this.pdf(k, l));
    }
    return j$.sum(sumarr);
  }

  mean (l) {
    return l;
  }

  variance(l) {
    return l;
  }

  sample(l) {
    var p = 1, k = 0, L = Math.exp(-l);
    do {
      k++;
      p *= Math.random();
    } while (p > L);
    return k - 1;
  }
}

export class j$Studentt {
  pdf(x, dof) {
    dof = dof > 1e100 ? 1e100 : dof;
    return (1/(Math.sqrt(dof) * j$.betafn(0.5, dof/2))) *
        Math.pow(1 + ((x * x) / dof), -((dof + 1) / 2));
  }

  cdf(x, dof) {
    var dof2 = dof / 2;
    return jStat.ibeta((x + Math.sqrt(x * x + dof)) /
                       (2 * Math.sqrt(x * x + dof)), dof2, dof2);
  }

  inv(p, dof) {
    var x = j$.ibetainv(2 * Math.min(p, 1 - p), 0.5 * dof, 0.5);
    x = Math.sqrt(dof * (1 - x) / x);
    return (p > 0.5) ? x : -x;
  }

  mean(dof) {
    return (dof > 1) ? 0 : undefined;
  }

  median(dof) {
    return 0;
  }

  mode(dof) {
    return 0;
  }

  sample(dof) {
    return j$.randn() * Math.sqrt(dof / (2 * j$.randg(dof / 2)));
  }

  variance(dof) {
    return (dof  > 2) ? dof / (dof - 2) : (dof > 1) ? Infinity : undefined;
  }
}

export class j$Triangular {
  pdf(x, a, b, c) {
    if (b <= a || c < a || c > b) {
      return NaN;
    } else {
      if (x < a || x > b) {
        return 0;
      } else if (x < c) {
        return (2 * (x - a)) / ((b - a) * (c - a));
      } else if (x === c) {
        return (2 / (b - a));
      } else { // x > c
        return (2 * (b - x)) / ((b - a) * (b - c));
      }
    }
  }

  cdf(x, a, b, c) {
    if (b <= a || c < a || c > b)
      return NaN;
    if (x <= a)
      return 0;
    else if (x >= b)
      return 1;
    if (x <= c)
      return Math.pow(x - a, 2) / ((b - a) * (c - a));
    else // x > c
      return 1 - Math.pow(b - x, 2) / ((b - a) * (b - c));
  }

  inv(p, a, b, c) {
    if (b <= a || c < a || c > b) {
      return NaN;
    } else {
      if (p <= ((c - a) / (b - a))) {
        return a + (b - a) * Math.sqrt(p * ((c - a) / (b - a)));
      } else { // p > ((c - a) / (b - a))
        return a + (b - a) * (1 - Math.sqrt((1 - p) * (1 - ((c - a) / (b - a)))));
      }
    }
  }

  mean(a, b, c) {
    return (a + b + c) / 3;
  }

  median(a, b, c) {
    if (c <= (a + b) / 2) {
      return b - Math.sqrt((b - a) * (b - c)) / Math.sqrt(2);
    } else if (c > (a + b) / 2) {
      return a + Math.sqrt((b - a) * (c - a)) / Math.sqrt(2);
    }
  }

  mode(a, b, c) {
    return c;
  }

  sample(a, b, c) {
    var u = Math.random();
    if (u < ((c - a) / (b - a)))
      return a + Math.sqrt(u * (b - a) * (c - a))
    return b - Math.sqrt((1 - u) * (b - a) * (b - c));
  }

  variance(a, b, c) {
    return (a * a + b * b + c * c - a * b - a * c - b * c) / 18;
  }
}

export class j$Uniform {
  pdf(x, a, b) {
    return (x < a || x > b) ? 0 : 1 / (b - a);
  }

  cdf(x, a, b) {
    if (x < a)
      return 0;
    else if (x < b)
      return (x - a) / (b - a);
    return 1;
  }

  inv(p, a, b) {
    return a + (p * (b - a));
  }

  mean(a, b) {
    return 0.5 * (a + b);
  }

  median(a, b) {
    return this.mean(a, b);
  }

  mode() {
    throw new Error("mode is not yet implemented");
  }

  sample(a, b) {
    return (a / 2 + b / 2) + (b / 2 - a / 2) * (2 * Math.random() - 1);
  }

  variance(a, b) {
    return Math.pow(b - a, 2) / 12;
  }
}

export class j$Weibull {
  pdf(x, scale, shape) {
    if (x < 0 || scale < 0 || shape < 0)
      return 0;
    return (shape / scale) * Math.pow((x / scale), (shape - 1)) *
        Math.exp(-(Math.pow((x / scale), shape)));
  }

  cdf(x, scale, shape) {
    return x < 0 ? 0 : 1 - Math.exp(-Math.pow((x / scale), shape));
  }

  inv(p, scale, shape) {
    return scale * Math.pow(-Math.log(1 - p), 1 / shape);
  }

  mean(scale, shape) {
    return scale * j$.gammafn(1 + 1 / shape);
  }

  median(scale, shape) {
    return scale * Math.pow(Math.log(2), 1 / shape);
  }

  mode(scale, shape) {
    if (shape <= 1)
      return 0;
    return scale * Math.pow((shape - 1) / shape, 1 / shape);
  }

  sample(scale, shape) {
    return scale * Math.pow(-Math.log(Math.random()), 1 / shape);
  }

  variance(scale, shape) {
    return scale * scale * jStat.gammafn(1 + 2 / shape) -
        Math.pow(this.mean(scale, shape), 2);
  }
}

jStat.prototype.beta = new j$Beta();
jStat.prototype.binomial = new j$Binomial();
jStat.prototype.cuchy = new j$Cauchy();
jStat.prototype.centralF = new j$CentralF();
jStat.prototype.chisquare = new j$Chisquare();
jStat.prototype.exponential = new j$Exponential();
jStat.prototype.gamma = new j$Gamma();
jStat.prototype.hypgeom = new j$Hypgeom();
jStat.prototype.invgamma = new j$Invgamma();
jStat.prototype.kumaraswamy = new j$Kumaraswamy();
jStat.prototype.lognormal = new j$Lognormal();
jStat.prototype.negbin = new j$Negbin();
jStat.prototype.normal = new j$Normal();
jStat.prototype.pareto = new j$Pareto();
jStat.prototype.poisson = new j$Poisson();
jStat.prototype.studentt = new j$Studentt();
jStat.prototype.triangular = new j$Triangular();
jStat.prototype.uniform = new j$Uniform();
jStat.prototype.weibull = new j$Weibull();

export const j$ = new jStat();