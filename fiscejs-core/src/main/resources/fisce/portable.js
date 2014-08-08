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
 * @returns {__FyPortable}
 */
var FyPortable;

var FyConfig = {
	littleEndian : undefined,
	maxObjects : 32768,
	maxThreads : 16,
	gcIdv : 10000,
	gcForceIdv : 120000,
	heapSize : 2097152,
	edenSize : 262144,
	copySize : 65536,
	stackSize : 16384,
	debugMode : true,
	verboseMode : false,
	aggresiveGC : false,
	_ : undefined
};

// now
(function(window) {
	"use strict";

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
					|| performance.oNow || performance.webkitNow || Date.now || function() {
						// Doh! Crap browser!
						return new Date().getTime();
					};
		})();
	}

	if (!window.Math.imul) {
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

	if (!Object.preventExtensions) {
		console.log("Polyfill Object.preventExtensions");
		Object.preventExtensions = function(obj) {
		};
	}

	if (typeof String.prototype.startsWith != 'function') {
		console.log("Polyfill String.startsWith");
		String.prototype.startsWith = function(str) {
			return this.slice(0, str.length) == str;
		};
	}

	if (typeof String.prototype.endsWith != 'function') {
		console.log("Polyfill String.endsWith");
		String.prototype.endsWith = function(str) {
			return this.slice(-str.length) == str;
		};
	}

	var darr = new Float64Array(1);
	var iarr = new Int32Array(darr.buffer);

	darr[0] = 1;
	if (iarr[0]) {
		// Big Endian
		console.log("Big endian");
		FyConfig.littleEndian = false;
	} else {
		// Little Endian
		console.log("Little endian");
		FyConfig.littleEndian = true;
	}

	// We use ArrayBuffer for converting floats from/to ieee754 integers by
	// default

	var buffer = new ArrayBuffer(8);
	var intView = new Int32Array(buffer);
	var floatView = new Float32Array(buffer);
	var doubleView = new Float64Array(buffer);

	var __FyPortable = function() {
		Object.preventExtensions(this);
	};

	/**
	 * convert float to ieee754 int
	 * 
	 * @param {Number}
	 *            floatValue
	 * @returns {Number} ieee754 int
	 */
	__FyPortable.prototype.floatToIeee32 = function(floatValue) {
		floatView[0] = floatValue;
		return intView[0];
	};

	/**
	 * convert ieee754 int to float
	 * 
	 * @param {Number}
	 *            intValue
	 * @returns {Number} floatValue
	 */
	__FyPortable.prototype.ieee32ToFloat = function(intValue) {
		intView[0] = intValue;
		return floatView[0];
	};

	if (FyConfig.littleEndian) {
		/**
		 * convert double to ieee754 int pair
		 * 
		 * @param {Number}
		 *            doubleValue
		 * @param {Int32Array}
		 *            container int pair container, if null/undefined,will
		 *            create a new one
		 * @returns {Array} int pair
		 */
		__FyPortable.prototype.doubleToIeee64 = function(doubleValue,
				container, ofs) {
			doubleView[0] = doubleValue;
			container[ofs] = intView[1];
			container[ofs + 1] = intView[0];
			return container;
		};

		/**
		 * convert int pair to double
		 * 
		 * @param {Int32Array}
		 *            container int pair container
		 * @returns {Number} doubleValue
		 */
		__FyPortable.prototype.ieee64ToDouble = function(container, ofs) {
			intView[1] = container[ofs];
			intView[0] = container[ofs + 1];
			return doubleView[0];
		};
	} else {

		__FyPortable.prototype.doubleToIeee64 = function(doubleValue,
				container, ofs) {
			doubleView[0] = doubleValue;
			container[ofs] = intView[0];
			container[ofs + 1] = intView[1];
			return container;
		};

		__FyPortable.prototype.ieee64ToDouble = function(container, ofs) {
			intView[0] = container[ofs];
			intView[1] = container[ofs + 1];
			return doubleView[0];
		};
	}

	__FyPortable.prototype.dcmpg = function(value1, value2) {
		var result = value1 - value2;
		if (result !== result) { // NaN
			return 1;
		} else {
			return result > 0 ? 1 : (result === 0 ? 0 : -1);
		}
	};

	__FyPortable.prototype.dcmpl = function(value1, value2) {
		var result = value1 - value2;
		if (result !== result) { // NaN
			return -1;
		} else {
			return result > 0 ? 1 : (result === 0 ? 0 : -1);
		}
	};

	__FyPortable.prototype.getLongOps = function(stack, tmpBegin) {
		return FyCreateLongOps(this, 0, stack, tmpBegin);
	};

	FyPortable = new __FyPortable();

})((function() {
	return this;
}.call()));
