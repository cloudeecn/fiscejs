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

eval("try{window;}catch (e){window = global;}");

if (!("now" in Date)) {
  Date["now"] = function now() {
    return Number(new Date());
  };
}

if (!("performance" in window)) {
  window["performance"] = {};
}
if (typeof window["performance"]["now"] !== "function") {
  console.log("Polyfill performance.now");
  window["performance"]["now"] = (function() {
    return window["performance"]["now"] || window["performance"]["mozNow"] || window["performance"]["msNow"] || window["performance"]["oNow"] || window["performance"]["webkitNow"] || Date["now"] || function() {
      // Doh! Crap browser!
      return new Date().getTime();
    };
  })();
}

if (typeof Math["imul"] !== "function") {
  console.log("Polyfill Math.imul");
  // @see
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/imul
  Math["imul"] = function(a, b) {
    var ah = (a >>> 16) & 0xffff;
    var al = a & 0xffff;
    var bh = (b >>> 16) & 0xffff;
    var bl = b & 0xffff;
    // the shift by 0 fixes the sign on the high part
    // the final |0 converts the unsigned value into a signed value
    return ((al * bl) + (((ah * bl + al * bh) << 16) >>> 0) | 0);
  };
}

if (typeof String.prototype["startsWith"] !== 'function') {
  console.log("Polyfill String.startsWith");
  String.prototype["startsWith"] =
  /**
   * @param {string}
   *            str
   */
  function(str) {
    return this.slice(0, str.length) == str;
  };
}

if (typeof String.prototype["endsWith"] !== 'function') {
  console.log("Polyfill String.endsWith");
  String.prototype["endsWith"] =
  /**
   * @param {string}
   *            str
   */
  function(str) {
    return this.slice(-str.length) == str;
  };
}

if (typeof Object["keys"] !== 'function') {
  console.log("Polyfill Object.keys");
  Object["keys"] = function(obj) {
    /**
     * @type {Array.<?>}
     */
    var ret = [];
    for (var key in obj) {
      ret.push(key);
    }
    return ret;
  }
}

if (!("goog" in window)) {
  window["goog"] = {};
}

if (!("exportSymbol" in goog)) {
  goog.exportSymbol = function(name, value) {
    window[name] = value;
  }
  goog.exportProperty = function(object, key, value) {
    object[key] = value;
  }
}