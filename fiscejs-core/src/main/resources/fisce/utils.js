/**
 * Copyright 2013 Yuxuan Huang. All rights reserved.
 *
 * This file is part of fiscejs.
 *
 * fiscejs is free software: you can redistribute it and/or modify it under the
 * terms of the GNU General Public License as published by the Free Software
 * Foundation, either version 3 of the License, or any later version.
 *
 * fiscejs is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
 * A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along with
 * fiscejs. If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * @class
 * @constructor
 * @export
 */
function __FyUtils() {};

/**
 *
 * @param {Array.<number>}
 *            src
 * @param {Array.<number>}
 *            dest
 */
__FyUtils.prototype.cloneIntArray = function(src, dest) {
  if (dest.length !== 0) {
    throw new FyException(null,
      "Dest array must be empty, dest.length=" + dest.length);
  }
  for (var i = 0, max = src.length; i < max; i++) {
    dest.push(src[i] | 0);
  }
};

/**
 * copy all attributes from src into dest
 * @export
 * @param {?} src
 * @param {?} dest
 */
__FyUtils.prototype.shallowClone = function(src, dest) {
  var keys = Object.keys(src);
  for (var i = 0, max = keys.length; i < max; i++) {
    var key = keys[i];
    dest[key] = src[key];
  }
};

/**
 * copy all strings and numbers from src into dest
 *
 * @param {?} src
 * @param {?} dest
 * @param {Array.<string>}
 *            keys
 */
__FyUtils.prototype.simpleClone = function(src, dest, keys) {
  var i, imax;
  var key, value;
  if (keys) {
    imax = keys.length;
    for (i = 0; i < imax; i++) {
      key = keys[i];
      value = src[key];
      if (value == null) {

      } else if (typeof value === "string" || typeof value === "number") {
        dest[key] = value;
      } else {
        throw new FyException(null, "Value of key[" + key + "] is not string or number");
      }
    }
  } else {
    keys = Object.keys(src);
    imax = keys.length;
    for (i = 0; i < imax; i++) {
      key = keys[i];
      value = src[key];
      if (typeof value === "string" || typeof value === "number") {
        dest[key] = value;
      }
    }
  }
};

/**
 *
 * @param {number}
 *            code
 * @returns {number}
 */
__FyUtils.prototype.utf8Size = function(code) {
  code = code & 0xffff;
  if (code > 0x0800) {
    return 3;
  } else if (code > 0x80 || code === 0) {
    return 2;
  } else {
    return 1;
  }
};

/**
 *
 * @param {number}
 *            first
 * @returns {number}
 */
__FyUtils.prototype.utf8SizeU = function(first) {
  first = first << 24 >> 24;
  if (first > 127) {
    first -= 256;
  }
  if (first >= 0) {
    return 1;
  } else if (first >= -16) {
    return -1;
  } else if (first >= -32) {
    return 3;
  } else if (first >= -64) {
    return 2;
  } else {
    return -1;
  }
};

/**
 *
 * @param {Array.<number>|Int32Array}
 *            utf8Array
 * @param {number}
 *            ofs
 * @param {Array.<number>|Int32Array}
 *            unicodeArray
 * @param {number}
 *            ofs1
 * @returns {number}
 */
__FyUtils.prototype.utf8Decode = function(utf8Array, ofs, unicodeArray, ofs1) {
  switch (this.utf8SizeU(utf8Array[ofs])) {
    case 1:
      unicodeArray[ofs1] = utf8Array[ofs];
      return 1;
    case 2:
      unicodeArray[ofs1] = ((utf8Array[ofs] & 0x1f) << 6) + (utf8Array[ofs + 1] & 0x3f);
      return 2;
    case 3:
      unicodeArray[ofs1] = ((utf8Array[ofs] & 0xf) << 12) + ((utf8Array[ofs + 1] & 0x3f) << 6) + (utf8Array[ofs + 2] & 0x3f);
      return 3;
    default:
      unicodeArray[ofs1] = 63;
      return 1;
  }
};

/**
 *
 * @param {number}
 *            unicode
 * @param {Array.<number>|Int32Array}
 *            utf8Array
 * @param {number}
 *            ofs
 * @returns {number}
 */
__FyUtils.prototype.utf8Encode = function(unicode, utf8Array, ofs) {
  unicode &= 0xffff;
  switch (this.utf8Size(unicode)) {
    case 3:
      utf8Array[ofs] = (unicode >> 12) - 32;
      utf8Array[ofs + 1] = ((unicode >> 6) & 0x3f) - 128;
      utf8Array[ofs + 2] = (unicode & 0x3f) - 128;
      return 3;
    case 2:
      utf8Array[ofs] = (unicode >> 6) - 64;
      utf8Array[ofs + 1] = (unicode & 0x3f) - 128;
      return 2;
    case 1:
      utf8Array[ofs] = unicode;
      return 1;
    default:
      utf8Array[ofs] = 63;
      return 1;
  }
};

/**
 *
 * @returns {number}
 */
__FyUtils.prototype.breakpoint = function() {
  var i = 0;
  i++;
  i++;
  return i;
};

/**
 *
 * @param {string}
 *            str
 * @returns {Uint8Array}
 */
__FyUtils.prototype.unbase64 = (function() {
  var base64Code = new HashMapI(-1, 7, 0.6);

  (function initCode(str) {
    var len = str.length;
    for (var i = len; i--;) {
      base64Code.put(str.charCodeAt(i), i);
    }
  })("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=");
  return function(str) {
    var slen = str.length;
    if (slen & 3 !== 0) {
      throw new FyException(FyConst.FY_EXCEPTION_IO,
        "Illegal base64 code");
    }
    var tlen = (slen >> 2) * 3;
    if (str.endsWith("==")) {
      tlen -= 2;
    } else if (str.endsWith("=")) {
      tlen--;
    }

    var len = tlen;
    var container = new Uint8Array(len);

    var i = 0;
    var p = 0;
    while (i < slen) {
      var c1 = base64Code.get(str.charCodeAt(i));
      if (c1 < 0) {
        throw new FyException(FyConst.FY_EXCEPTION_IO,
          "Illegal base64 code");
      }
      var c2 = base64Code.get(str.charCodeAt(i + 1));
      if (c2 < 0) {
        throw new FyException(FyConst.FY_EXCEPTION_IO,
          "Illegal base64 code");
      }
      var c3 = base64Code.get(str.charCodeAt(i + 2));
      if (c3 < 0) {
        throw new FyException(FyConst.FY_EXCEPTION_IO,
          "Illegal base64 code");
      }
      var c4 = base64Code.get(str.charCodeAt(i + 3));
      if (c4 < 0) {
        throw new FyException(FyConst.FY_EXCEPTION_IO,
          "Illegal base64 code for file.");
      }

      container[p] = ((c1 << 2) | (c2 >> 4)) & 0xff;
      if (c3 !== 64) {
        container[p + 1] = (((c2 & 15) << 4) | (c3 >> 2)) & 0xff;
      }

      if (c4 !== 64) {
        container[p + 2] = (((c3 & 3) << 6) | c4) & 0xff;
      }

      p += 3;
      i += 4;
    }
    return container;
  }
})();

/**
 * @export
 * @type {__FyUtils}
 */
var FyUtils = new __FyUtils();