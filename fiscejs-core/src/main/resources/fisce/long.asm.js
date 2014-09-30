/**
 * @constructor
 * @class
 * @struct
 * @export
 * @param {Int32Array} stack
 * @param {number} tmpOps
 */
function __FyLongOps(stack, tmpOps) {
  /**
   * @type {Int32Array}
   */
  this.stack = stack;

  this.TWO_PWR_63_DBL_ = 9223372036854776000.0;

  this.tmp0 = tmpOps;
  this.tmp1 = tmpOps + 2;

  this.tmp2 = tmpOps + 4;
  this.tmp3 = tmpOps + 6;

  this.tmp4 = tmpOps + 8;
  this.tmp5 = tmpOps + 10;
}

/**
 * @export
 * @param  {number} value1
 * @param  {number} value2
 */
__FyLongOps.prototype.fmax = function(value1, value2) {
  return (value1 > value2) ? value1 : value2;
};

/**
 * @export
 * @param  {number} pos
 */
__FyLongOps.prototype.not = function(pos) {
  var stack = this.stack;
  stack[pos] = ~stack[pos];
  stack[pos + 1] = ~stack[pos + 1];
};

/**
 * @export
 * @param  {number} pos
 */
__FyLongOps.prototype.neg = function(pos) {
  var stack = this.stack;
  stack[pos] = ~stack[pos];
  stack[pos + 1] = ~stack[pos + 1];
  this.add1(pos);
};

__FyLongOps.prototype.add1 = function(pos) {
  var stack = this.stack;
  if ((stack[pos + 1] | 0) === -1) {
    stack[pos + 1] = 0;
    stack[pos]++;
  } else {
    stack[pos + 1]++;
  }
};

/**
 * @export
 * @param  {number} pos
 * @return {number}
 */
__FyLongOps.prototype.longToNumber = function(pos) {
  return this.stack[pos] * 4294967296 + (this.stack[pos + 1] >>> 0);
};

/**
 * @export
 * @param  {number} pos
 * @param {number} value
 */
__FyLongOps.prototype.longFromNumber = function(pos, value) {
  var stack = this.stack;
  if ((value != value) | (value == 1.0 / 0.0)) {
    stack[pos] = stack[pos + 1] = 0;
    return;
  } else if (value <= (-this.TWO_PWR_63_DBL_)) {
    stack[pos] = 0x80000000;
    stack[pos + 1] = 0;
    return;
  } else if ((value + 1.0) >= this.TWO_PWR_63_DBL_) {
    stack[pos] = 0x7fffffff;
    stack[pos + 1] = 0xffffffff;
    return;
  } else if (value < 0.0) {
    this.longFromNumber(pos, -value);
    this.neg(pos);
    return;
  } else {
    stack[pos] = (value / 4294967296.0) >> 0;
    stack[pos + 1] = (value % 4294967296.0) >> 0;
    return;
  }
};

/**
 * @export
 * @param  {number} pos1
 * @param  {number} pos2
 */
__FyLongOps.prototype.compare = function(pos1, pos2) {
  var stack = this.stack;
  if (stack[pos1] > stack[pos2]) {
    return 1;
  } else if (stack[pos1] < stack[pos2]) {
    return -1;
  }
  if (stack[pos1 + 1] == stack[pos2 + 1]) {
    return 0;
  }
  if ((stack[pos1 + 1] >>> 0) > (stack[pos2 + 1] >>> 0)) {
    return 1;
  } else {
    return -1;
  }
};

/**
 * @export
 * @param  {number} pos1
 * @param  {number} pos2
 */
__FyLongOps.prototype.cmp = function(pos1, pos2) {
  var stack = this.stack;
  var ret = this.compare(pos1, pos2);
  switch (ret) {
    case -1:
      stack[pos1] = -1;
      stack[pos1 + 1] = -1;
      break;
    case 0:
      stack[pos1] = 0;
      stack[pos1 + 1] = 0;
      break;
    case 1:
      stack[pos1] = 0;
      stack[pos1 + 1] = 1;
      break;
    default:
      throw ("err! " + ret);
  }
};

/**
 * @export
 * @param  {number} pos1
 * @param  {number} pos2
 */
__FyLongOps.prototype.add = function(pos1, pos2) {
  var stack = this.stack;
  var tmp = (stack[pos1 + 1] >>> 0) + (stack[pos2 + 1] >>> 0);
  stack[pos1 + 1] = tmp | 0;
  stack[pos1] = (((tmp / 4294967296) >> 0) + (stack[pos1]) + (stack[pos2])) | 0;
};

/**
 * @export
 * @param  {number} pos1
 * @param  {number} pos2
 */
__FyLongOps.prototype.sub = function(pos1, pos2) {
  this.neg(pos1);
  this.add(pos1, pos2);
  this.neg(pos1);
};

/**
 * @export
 * @param  {number} pos1
 * @param  {number} pos2
 */
__FyLongOps.prototype.mul = function mul(pos1, pos2) {
  var stack = this.stack;
  var neged = 0;
  var pos2Neged = 0;

  if ((((stack[pos1] | 0) == (0 | 0)) & ((stack[(pos1 + 1)] | 0) == (0 | 0))) | (((stack[pos2] | 0) == (0 | 0)) & ((stack[(pos2 + 1)] | 0) == (0 | 0)))) {
    stack[pos1] = 0 | 0;
    stack[(pos1 + 1)] = 0 | 0;
  }
  if (((stack[(pos1)] | 0) == (0x80000000 | 0)) & ((stack[(pos1 + 1)] | 0) == (0 | 0))) {
    if ((stack[(pos2 + 1)] & 1 | 0) == (0 | 0)) {
      stack[pos1] = 0;
      stack[(pos1 + 1)] = 0;
    }
    return;
  } else if (((stack[(pos2)] | 0) == (0x80000000 | 0)) & ((stack[(pos2 + 1)] | 0) == (0 | 0))) {
    if ((stack[(pos1 + 1)] & 1 | 0) == (0 | 0)) {
      stack[pos1] = 0 | 0;
    } else {
      stack[pos1] = 0x80000000;
    }
    stack[(pos1 + 1)] = 0;
    return;
  }
  if (stack[pos1] >>> 31 == 1 | 0) {
    neged = (1 - neged) | 0;
    this.neg(pos1);
  }
  if (stack[pos2] >>> 31 == 1 | 0) {
    neged = (1 - neged) | 0;
    pos2Neged = 1 | 0;
    this.neg(pos2);
  }

  var a48 = stack[pos1] >>> 16;
  var a32 = stack[pos1] & 0xFFFF;
  var a16 = stack[(pos1 + 1)] >>> 16;
  var a00 = stack[(pos1 + 1)] & 0xFFFF;
  var b48 = stack[(pos2)] >>> 16;
  var b32 = stack[(pos2)] & 0xFFFF;
  var b16 = stack[(pos2 + 1)] >>> 16;
  var b00 = stack[(pos2 + 1)] & 0xFFFF;
  var c48 = 0,
    c32 = 0,
    c16 = 0,
    c00 = 0;
  c00 += a00 * b00;
  c16 += c00 >>> 16;
  c00 &= 0xFFFF;
  c16 += a16 * b00;
  c32 += c16 >>> 16;
  c16 &= 0xFFFF;
  c16 += a00 * b16;
  c32 += c16 >>> 16;
  c16 &= 0xFFFF;
  c32 += a32 * b00;
  c48 += c32 >>> 16;
  c32 &= 0xFFFF;
  c32 += a16 * b16;
  c48 += c32 >>> 16;
  c32 &= 0xFFFF;
  c32 += a00 * b32;
  c48 += c32 >>> 16;
  c32 &= 0xFFFF;
  c48 += a48 * b00 + a32 * b16 + a16 * b32 + a00 * b48;
  c48 &= 0xFFFF;
  stack[pos1] = ((c48 << 16) | c32) | 0;
  stack[(pos1 + 1)] = (c16 << 16) | c00 | 0;
  if (neged) {
    this.neg(pos1);
  }
  if (pos2Neged) {
    this.neg(pos2);
  }
};

/**
 * @export
 * @param  {number} pos1
 * @param  {number} pos2
 */
__FyLongOps.prototype.div = function(pos1, pos2) {
  var stack = this.stack;
  var neged = 0;
  var pos2Neged = 0;
  var approx = 0.0;
  var log2 = 0.0;
  var delta = 0.0;

  if (stack[pos2] == 0 && stack[pos2 + 1] == 0) {
    // Division by zero will be considered outside
    stack[pos1] = -1;
    stack[pos1 + 1] = -1;
    return;
  }

  if (stack[pos1] == (0x80000000 | 0) && stack[pos1 + 1] == 0) {
    if ((stack[pos2] == 0 && stack[pos2 + 1] == 1) || (stack[pos2] == -1 && stack[pos2 + 1] == -1)) {
      return;
    } else if (stack[pos2] == (0x80000000 | 0) && stack[pos2 + 1] == 0) {
      stack[pos1] = 0;
      stack[pos1 + 1] = 1;
      return;
    } else {
      stack[pos1] = (0xC0000000 | 0);
      this.div(pos1, pos2);
      stack[pos1] = (stack[pos1] << 1) + (stack[pos1 + 1] >>> 31);
      stack[pos1 + 1] <<= 1;
      if (stack[pos1] == 0 && stack[pos1 + 1] == 0) {
        if (stack[pos2] < 0) {
          stack[pos1] = 0;
          stack[pos1 + 1] = 1;
          return;
        } else {
          stack[pos1] = -1;
          stack[pos1 + 1] = -1;
          return;
        }
      } else {
        stack[this.tmp0] = (0x80000000 | 0);
        stack[this.tmp0 + 1] = 0;
        stack[this.tmp1] = stack[pos1];
        stack[this.tmp1 + 1] = stack[pos1 + 1];
        this.mul(pos1, pos2);
        this.sub(this.tmp0, pos1);
        this.div(this.tmp0, pos2);
        this.add(this.tmp1, this.tmp0);
        stack[pos1] = stack[this.tmp1];
        stack[pos1 + 1] = stack[this.tmp1 + 1];
        return;
      }
    }
  } else if (stack[pos2] == (0x80000000 | 0) && stack[pos2 + 1] == 0) {
    stack[pos1] = 0;
    stack[pos1 + 1] = 0;
    return;
  }

  if (stack[pos1] < 0) {
    neged = 1 - neged;
    this.neg(pos1);
  }

  if (stack[pos2] < 0) {
    neged = 1 - neged;
    pos2Neged = true;
    this.neg(pos2);
  }
  // tmp2 -> rem
  // pos1 res
  stack[this.tmp2] = stack[pos1];
  stack[this.tmp2 + 1] = stack[pos1 + 1];

  stack[pos1] = 0;
  stack[pos1 + 1] = 0;

  while (this.compare(this.tmp2, pos2) >= 0) {
    approx = this.fmax(1.0, Math.floor(this.longToNumber(this.tmp2) / this.longToNumber(pos2)));
    log2 = Math.ceil(Math.log(approx) / Math.LN2);
    delta = (log2 <= 48.0) ? 1.0 : Math.pow(2.0, log2 - 48.0);

    // tmp3 -> approxRes
    // tmp4 -> approxRem
    this.longFromNumber(this.tmp3, approx);
    stack[this.tmp4] = stack[this.tmp3];
    stack[this.tmp4 + 1] = stack[this.tmp3 + 1];

    this.mul(this.tmp4, pos2);

    while (stack[this.tmp4] < 0 || this.compare(this.tmp4, this.tmp2) > 0) {
      approx = approx - delta;
      this.longFromNumber(this.tmp3, approx);
      stack[this.tmp4] = stack[this.tmp3];
      stack[this.tmp4 + 1] = stack[this.tmp3 + 1];
      this.mul(this.tmp4, pos2);
    }
    if (stack[this.tmp3] == 0 && stack[this.tmp3 + 1] == 0) {
      stack[this.tmp3 + 1] = 1;
    }
    this.add(pos1, this.tmp3);
    this.sub(this.tmp2, this.tmp4);
  }

  if (neged) {
    this.neg(pos1);
  }
  if (pos2Neged) {
    this.neg(pos2);
  }
};

/**
 * @export
 * @param  {number} pos1
 * @param  {number} pos2
 */
__FyLongOps.prototype.rem = function(pos1, pos2) {
  this.stack[this.tmp5] = this.stack[pos1];
  this.stack[this.tmp5 + 1] = this.stack[pos1 + 1];

  if (this.stack[pos2] == 0 && this.stack[pos2 + 1] == 0) {
    this.stack[pos1] = -1;
    this.stack[pos1 + 1] = -1;
  }

  this.div(this.tmp5, pos2);
  this.mul(this.tmp5, pos2);
  this.sub(pos1, this.tmp5);
};

/**
 * @export
 * @param  {number} pos
 * @param  {number} ofs
 */
__FyLongOps.prototype.shl = function(pos, ofs) {
  var stack = this.stack;
  if (ofs >= 64) {
    stack[pos] = stack[pos + 1] = 0;
  } else if (ofs > 32) {
    stack[pos] = stack[pos + 1] << (ofs - 32);
    stack[pos + 1] = 0;
  } else {
    stack[pos] = (stack[pos] << ofs) | (stack[pos + 1] >>> (32 - ofs));
    stack[pos + 1] <<= ofs;
  }
};

/**
 * @export
 * @param  {number} pos
 * @param  {number} ofs
 */
__FyLongOps.prototype.shr = function(pos, ofs) {
  var stack = this.stack;
  if (ofs >= 64) {
    stack[pos + 1] = stack[pos] = stack[pos] >> 31;
  } else if (ofs >= 32) {
    stack[pos + 1] = stack[pos] >> (ofs - 32);
    stack[pos] >>= 31;
  } else {
    stack[pos + 1] = ((stack[pos + 1]) >>> ofs) | (stack[pos] << (32 - ofs));
    stack[pos] >>= ofs;
  }
};

/**
 * @export
 * @param  {number} pos
 * @param  {number} ofs
 */
__FyLongOps.prototype.ushr = function(pos, ofs) {
  var stack = this.stack;

  if (ofs >= 64) {
    stack[pos] = stack[pos + 1] = 0;
  } else if (ofs >= 32) {
    stack[pos + 1] = stack[pos] >>> (ofs - 32);
    stack[pos] = 0;
  } else {
    stack[pos + 1] = (stack[pos + 1] >>> ofs) | (stack[pos] << (32 - ofs));
    stack[pos] >>>= ofs;
  }
};