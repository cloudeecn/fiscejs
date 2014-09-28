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
 * @export
 */
function persistStages() {
	eval("//" + arguments);
}

/**
 * @export
 */
function benchmark(fun) {
	var i = 0;
	var time = 0.1;
	time -= 0.1;
	var begin = performance.now();
	for (i = 0; i < 12; i++) {
		begin = performance.now();
		fun();
		if (i > 3) {
			time += (performance.now() - begin);
		}
	}
	return time / 8.0;
}

/**
 * @constructor
 * @class
 * @struct
 * @export
 * @private
 */
function __FyPortable() {
	var littleEndian;

	// We use ArrayBuffer for converting floats from/to ieee754 integers by
	// default

	var buffer = new ArrayBuffer(8);
	this.intView = new Int32Array(buffer);
	this.floatView = new Float32Array(buffer);
	this.doubleView = new Float64Array(buffer);

	(function() {
		var darr = new Float64Array(1);
		var iarr = new Int32Array(darr.buffer);

		darr[0] = 1;
		if (iarr[0]) {
			// Big Endian
			console.log("Big endian");
			this.littleEndian = false;
		} else {
			// Little Endian
			console.log("Little endian");
			this.littleEndian = true;
		}
	}).call(this);
};

/**
 * convert float to ieee754 int
 *
 * @export
 * @param {number}
 *            floatValue
 * @returns {number} ieee754 int
 */
__FyPortable.prototype.floatToIeee32 = function(floatValue) {
	this.floatView[0] = floatValue;
	return this.intView[0];
};

/**
 * convert ieee754 int to float
 * 
 * @param {number}
 *            intValue
 * @returns {number} floatValue
 */
__FyPortable.prototype.ieee32ToFloat = function(intValue) {
	this.intView[0] = intValue;
	return this.floatView[0];
};

/**
 * convert double to ieee754 int pair
 *
 * @export
 * @param {number}
 *            doubleValue
 * @param {Int32Array}
 *            container int pair container
 * @returns {Int32Array} int pair
 */
__FyPortable.prototype.doubleToIeee64 = function(doubleValue, container, ofs) {
	this.doubleView[0] = doubleValue;
	container[ofs] = this.intView[1];
	container[ofs + 1] = this.intView[0];
	return container;
};

/**
 * convert int pair to double
 *
 * @export
 * @param {Int32Array}
 *            container int pair container
 * @returns {number} doubleValue
 */
__FyPortable.prototype.ieee64ToDouble = function(container, ofs) {
	this.intView[1] = container[ofs];
	this.intView[0] = container[ofs + 1];
	return this.doubleView[0];
};

/**
 * @export
 * @param  {number} value1
 * @param  {number} value2
 * @return {number}
 */
__FyPortable.prototype.dcmpg = function(value1, value2) {
	var result = value1 - value2;
	if (result !== result) { // NaN
		return 1;
	} else {
		return result > 0 ? 1 : (result === 0 ? 0 : -1);
	}
};

/**
 * @export
 * @param  {number} value1
 * @param  {number} value2
 * @return {number}
 */
__FyPortable.prototype.dcmpl = function(value1, value2) {
	var result = value1 - value2;
	if (result !== result) { // NaN
		return -1;
	} else {
		return result > 0 ? 1 : (result === 0 ? 0 : -1);
	}
};

__FyPortable.prototype.getLongOps = function(stack, tmpBegin) {
	return new __FyLongOps(stack, tmpBegin);
};

/**
 * @export
 * @type {__FyPortable}
 */
var FyPortable=new __FyPortable();