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

if (!Date.now) {
	Date.now = function now() {
		return Number(new Date());
	};
}

if (!window.performance) {
	window.performance = {};
}
if (!performance.now) {
	console.log("Polyfill performance.now");
	performance.now = (function() {
		return performance.now || performance.mozNow || performance.msNow
				|| performance.oNow || performance.webkitNow || Date.now
				|| function() {
					// Doh! Crap browser!
					return new Date().getTime();
				};
	})();
}

if (typeof window.Math.imul !== 'function') {
	console.log("Polyfill Math.imul");
	// @see
	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/imul
	window.Math.imul = function(a, b) {
		var ah = (a >>> 16) & 0xffff;
		var al = a & 0xffff;
		var bh = (b >>> 16) & 0xffff;
		var bl = b & 0xffff;
		// the shift by 0 fixes the sign on the high part
		// the final |0 converts the unsigned value into a signed value
		return ((al * bl) + (((ah * bl + al * bh) << 16) >>> 0) | 0);
	};
}

if (typeof String.prototype.startsWith !== 'function') {
	console.log("Polyfill String.startsWith");
	String.prototype.startsWith = function(str) {
		return this.slice(0, str.length) == str;
	};
}

if (typeof String.prototype.endsWith !== 'function') {
	console.log("Polyfill String.endsWith");
	String.prototype.endsWith = function(str) {
		return this.slice(-str.length) == str;
	};
}

if (typeof Object.keys !== 'function') {
	console.log("Polyfill Object.keys");
	Object.keys = function(obj) {
		var ret = [];
		for ( var key in obj) {
			ret.push(key);
		}
		return ret;
	}
}