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

// now
(function(window) {
	if (!Date.now) {
		Date.now = function now() {
			return Number(new Date());
		};
	}

	window.performance = window.performance || {};
	performance.now = (function() {
		return performance.now || performance.mozNow || performance.msNow
				|| performance.oNow || performance.webkitNow || function() {
					// Doh! Crap browser!
					return new Date().getTime();
				};
	})();
	console.log(performance);
}((function() {
	return this;
}.call())));

// We use ArrayBuffer for converting floats from/to ieee754 integers by default
(function() {
	"use strict";

	var buffer = new ArrayBuffer(8);
	var intView = new Int32Array(buffer);
	var floatView = new Float32Array(buffer);
	var doubleView = new Float64Array(buffer);

	var __FyPortable = function() {
	};

	__FyPortable.prototype.now = performance.now;

	/**
	 * convert float to ieee754 int
	 * 
	 * @param {Number}
	 *            floatValue
	 * @returns {Number} ieee754 int
	 */
	__FyPortable.prototype.floatToInt = function(floatValue) {
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
	__FyPortable.prototype.intToFloat = function(intValue) {
		intView[0] = intValue;
		return floatView[0];
	};

	/**
	 * convert double to ieee754 int pair
	 * 
	 * @param {Number}
	 *            doubleValue
	 * @param {Array}
	 *            container int pair container, if null/undefined,will create a
	 *            new one
	 * @returns {Array} int pair
	 */
	__FyPortable.prototype.doubleToLong = function(doubleValue, container, ofs) {
		if (!container) {
			container = new Array(2);
		}
		doubleView[0] = doubleValue;
		container[ofs] = intView[0];
		container[ofs + 1] = intView[1];
		return container;
	};

	/**
	 * convert int pair to double
	 * 
	 * @param {Array}
	 *            container int pair container
	 * @returns {Number} doubleValue
	 */
	__FyPortable.prototype.longToDouble = function(container, ofs) {
		intView[0] = container[ofs];
		intView[1] = container[ofs + 1];
		return doubleView[0];
	};

	FyPortable = new __FyPortable();
})();
