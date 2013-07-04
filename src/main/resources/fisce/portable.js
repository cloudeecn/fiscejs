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
	var arrayView = new DataView(new ArrayBuffer(8), 0, 8);

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
		arrayView.setFloat32(0, floatValue);
		return arrayView.getInt32(0);
	};

	/**
	 * convert ieee754 int to float
	 * 
	 * @param {Number}
	 *            intValue
	 * @returns {Number} floatValue
	 */
	__FyPortable.prototype.intToFloat = function(intValue) {
		arrayView.setInt32(0, floatValue);
		return arrayView.getFloat32(0);
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
		arrayView.setFloat64(0, doubleValue);
		container[ofs] = arrayView.getInt32(0);
		container[ofs + 1] = arrayView.getInt32(4);
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
		arrayView.setInt32(0, container[ofs]);
		arrayView.setInt32(4, container[ofs + 1]);
		return arrayView.getFloat64(0);
	};

	FyPortable = new __FyPortable();
})();
