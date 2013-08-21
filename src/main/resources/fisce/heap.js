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
 * Abstract heap, without implementation of memory operations
 */
var FyHeap;

(function() {
	"use strict";

	/**
	 * 
	 * @param {FyContext}
	 *            context
	 */
	FyHeap = function(context) {
		this.context = context;

		this.statics = [];
		this.objects = new Array(FyConfig.maxObjects);

		this.toFinalize = [];
		this.protectMode = false;
		this.protectedObjects = [];
		this.literials = {};
		this.references = {};
		this.toEnqueue = [];
		this.nextHandle = 1;
		this.totalObjects = 0;
		Object.preventExtensions(this);
	};

	/**
	 * @param gced
	 * @returns {Number}
	 */
	FyHeap.prototype._fetchNextHandle = function(gced) {
		var handle = this.nextHandle;
		while (true) {
			if (!this.objects[handle]) {
				break;
			}
			handle++;
			if (handle >= FyConfig.maxObjects) {
				handle = 1;
			}
			if (handle === this.nextHandle) {
				if (gced) {
					throw new FyException(undefined, "Out of memory: handles");
				} else {
					this._fetchNextHandle(true);
				}
			}
		}
		return handle;
	};

	/**
	 * The underlying allocate logic
	 * 
	 * @param {Number}
	 *            size
	 * @param {FyClass}
	 *            clazz
	 * @param {Number}
	 *            multiUsageData
	 * @param {Number}
	 *            toHandle
	 * @returns {Number} object handle
	 */
	FyHeap.prototype._allocate = function(size, clazz, multiUsageData, toHandle) {
		throw "Abstract method";
	};

	FyHeap.prototype._release = function(handle) {
		throw "Abstract method";
	};

	FyHeap.prototype.release = function(handle) {
		this.objects[handle] = undefined;
	};

	/**
	 * Allocate for state-load
	 * 
	 * @param {Number}
	 *            size
	 * @param {FyClass}
	 *            clazz
	 * @param {Number}
	 *            multiUsageData
	 * @param {Number}
	 *            toHandle
	 * @returns {Number} object handle
	 */
	FyHeap.prototype.allocateDirect = function(size, clazz, multiUsageData,
			toHandle) {
		if (this.objects[toHandle]) {
			throw new FyException(FyConst.FY_EXCEPTION_INCOMPAT_CHANGE,
					"Handle " + toHandle + " already allocated.");
		}
		var ret = this._allocate(size, clazz, multiUsageData, toHandle);
		if (this.protectMode) {
			this.protectedObjects.push(ret);
		}
		return ret;
	};

	/**
	 * Allocate a new Object on heap
	 * 
	 * @param {FyClass}
	 *            clazz
	 * @return {Number} object handle
	 */
	FyHeap.prototype.allocate = function(clazz) {
		if (clazz.type != FyConst.TYPE_OBJECT) {
			throw new FyException(undefined,
					"Please use allocateArray to allocate arrays");
		}
		var ret = this._allocate(clazz.sizeAbs, clazz, 0, 0);
		if (this.protectMode) {
			this.protectedObjects.push(ret);
		}
		return ret;
	};

	/**
	 * Get array size in int32 from array's length (byte arrays put 4 bytes to
	 * one int32 and short arrays put 2 bytes to one int32 etc.)
	 * 
	 * @param {FyClass}
	 *            clazz class of the array
	 * @param {Number}
	 *            length length of the array
	 */
	FyHeap.prototype.getArraySizeFromLength = function(clazz, length) {
		switch (clazz.arrayType) {
		case FyConst.FY_AT_LONG:
			return length << 1;
		case FyConst.FY_AT_INT:
			return length;
		case FyConst.FY_AT_BYTE:
			return (length + 3) >> 2;
		case FyConst.FY_AT_SHORT:
			return (length + 1) >> 1;
		default:
			throw new FyException(undefined, "Illegal array type "
					+ clazz.arrayType + " for class " + clazz.name);
		}
	};

	/**
	 * Allocate a new array object in heap
	 * 
	 * @param {FyClass}
	 *            clazz
	 * @param {Number}
	 *            length
	 */
	FyHeap.prototype.allocateArray = function(clazz, length) {
		if (clazz.type !== FyConst.TYPE_ARRAY) {
			throw new FyException(undefined,
					"Please use allocate to allocate objects.");
		}
		var ret = this._allocate(this.getArraySizeFromLength(clazz, length),
				clazz, length, 0);
		if (this.protectMode) {
			this.protectedObjects.push(ret);
		}
		return ret;
	};

	FyHeap.prototype.beginProtect = function() {
		this.protectMode = true;
	};

	FyHeap.prototype.endProtect = function() {
		this.protectMode = false;
		this.protectedObjects.length = 0;
	};

	/**
	 * Get object
	 * 
	 * @param handle
	 * @returns {FyObject} obj
	 */
	FyHeap.prototype.getObject = function(handle) {
		if (handle === 0) {
			throw new FyException(FyConst.FY_EXCEPTION_NPT);
		}
		var ret = this.objects[handle];
		if (ret === undefined) {
			throw new FyException(undefined, "Illegal object #" + handle);
		}
		return ret;
	};

	/**
	 * Check whether a index is legal in an array
	 * 
	 * @param {FyObject}
	 *            arr array object
	 * @param idx
	 *            index
	 */
	FyHeap.prototype.checkLength = function(arr, idx) {
		if (idx < 0 || idx > arr.multiUsageData) {
			throw new FyException(FyConst.FY_EXCEPTION_IOOB, idx + "/"
					+ arr.multiUsageData);
		}
	};

	/**
	 * Get array's length
	 * 
	 * @param handle
	 *            handle of the array
	 */
	FyHeap.prototype.arrayLength = function(handle) {
		return this.getObject(handle).multiUsageData;
	};

	/**
	 * Get a javascript String from java String
	 * 
	 * @param {Number}
	 *            handle object handle
	 * @returns {String}
	 */
	FyHeap.prototype.getString = function(handle) {
		/**
		 * @returns {FyField}
		 */
		var valueField;
		/**
		 * @returns {FyField}
		 */
		var offsetField;
		/**
		 * @returns {FyField}
		 */
		var countField;
		var len;
		var ofs;
		var cah;
		var i;
		var ret = "";

		if (!handle) {
			throw new FyException(FyConst.FY_EXCEPTION_NPT, "");
		}
		if (this.context.lookupClass(FyConst.FY_BASE_STRING) === undefined) {
			throw new FyException(FyConst.FY_EXCEPTION_CLASSNOTFOUND,
					FyConst.FY_BASE_STRING);
		}
		valueField = this.context.getField(FyConst.stringValue);
		offsetField = this.context.getField(FyConst.stringOffset);
		countField = this.context.getField(FyConst.stringCount);

		ofs = this.getFieldInt(handle, offsetField.posAbs);
		len = this.getFieldInt(handle, countField.posAbs);
		cah = this.getFieldInt(handle, valueField.posAbs);

		for (i = 0; i < len; i++) {
			ret += String.fromCharCode(this.getArrayInt(cah, i + ofs) & 0xffff);
		}
		return ret;
	};

	/**
	 * @param {Number}
	 *            stringHandle
	 * @param {String}
	 *            str
	 * @returns {Number} handle
	 */
	FyHeap.prototype.fillString = function(stringHandle, str) {
		/**
		 * @returns {FyField}
		 */
		var valueField;
		/**
		 * @returns {FyField}
		 */
		var offsetField;
		/**
		 * @returns {FyField}
		 */
		var countField;
		var cah;
		var i;

		if (this.context.lookupClass(FyConst.FY_BASE_STRING) === undefined) {
			throw new FyException(FyConst.FY_EXCEPTION_CLASSNOTFOUND,
					FyConst.FY_BASE_STRING);
		}
		valueField = this.context.getField(FyConst.stringValue);
		offsetField = this.context.getField(FyConst.stringOffset);
		countField = this.context.getField(FyConst.stringCount);

		cah = this.allocateArray(this.context.lookupClass("[C"), str.length);

		this.putFieldInt(stringHandle, valueField.posAbs, cah);
		this.putFieldInt(stringHandle, offsetField.posAbs, 0);
		this.putFieldInt(stringHandle, countField.posAbs, str.length);

		for (i = 0; i < str.length; i++) {
			this.putArrayInt(cah, i, str.charCodeAt(i) & 0xffff);
		}
		return stringHandle;
	};

	/**
	 * @param {Number}
	 *            stringHandle
	 * @param {String}
	 *            str
	 * @returns {Number} handle
	 */
	FyHeap.prototype.fillStringWithArray = function(stringHandle, arr, pos, len) {
		/**
		 * @returns {FyField}
		 */
		var valueField;
		/**
		 * @returns {FyField}
		 */
		var offsetField;
		/**
		 * @returns {FyField}
		 */
		var countField;
		var cah;
		var i;

		if (this.context.lookupClass(FyConst.FY_BASE_STRING) === undefined) {
			throw new FyException(FyConst.FY_EXCEPTION_CLASSNOTFOUND,
					FyConst.FY_BASE_STRING);
		}
		valueField = this.context.getField(FyConst.stringValue);
		offsetField = this.context.getField(FyConst.stringOffset);
		countField = this.context.getField(FyConst.stringCount);

		cah = this.allocateArray(this.context.lookupClass("[C"), str.length);

		this.putFieldInt(stringHandle, valueField.posAbs, cah);
		this.putFieldInt(stringHandle, offsetField.posAbs, 0);
		this.putFieldInt(stringHandle, countField.posAbs, len);

		for (i = 0; i < len; i++) {
			this.putArrayInt(cah, i, arr[i + pos] & 0xffff);
		}
		return stringHandle;
	};

	/**
	 * 
	 * @param {String}
	 *            str
	 * @returns {Number} handle
	 */
	FyHeap.prototype.literal = function(str) {
		var handle = this.literials[str];
		if (handle === undefined) {
			handle = this.allocate(this.context
					.lookupClass(FyConst.FY_BASE_STRING));
			this.fillString(handle, str);
			this.literials[str] = handle;
		}
		return handle;
	};

	FyHeap.prototype.literalWithConstant = function(constant) {
		var ret = constant.value;
		if (ret === undefined) {
			ret = constant.value = this.literal(constant.string);
		}
		return ret;
	};

	FyHeap.prototype.putFieldString = function(handle, pos, str) {
		var strHandle = this.allocate(this.context
				.lookupClass(FyConst.FY_BASE_STRING));
		this.putFieldInt(handle, pos, strHandle);
		this.fillString(strHandle, str);
	};

	/**
	 * create multi arrays
	 * 
	 * @param {FyClass}
	 *            clazz class which this method creates for
	 * @param {Number}
	 *            layers total layers
	 * @param {Array}
	 *            counts arrays layers counts
	 * @param {Number}
	 *            pos
	 */
	FyHeap.prototype.multiNewArray = function(clazz, layers, counts, pos) {
		var size = counts[pos];
		var ret = this.allocateArray(clazz, size);
		var handle;
		var i;
		if (layers > 1) {
			for (i = 0; i < size; i++) {
				handle = this.multiNewArray(clazz.contentClass, layers - 1,
						counts, pos + 1);
				this.putArrayRaw(ret, i, handle);
			}
		}
		return ret;
	};

	/**
	 * 
	 * @param {Number}
	 *            handle
	 * @returns {Number}
	 */
	FyHeap.prototype.unwrapBoolean = function(handle) {
		var context = this.context;
		var clazz = context.lookupClass(FyConst.FY_BASE_BOOLEAN);
		var field = context.getField(FyConst.FY_VALUE_BOOLEAN);
		context.lookupClass(FyConst.FY_PRIM_BOOLEAN);
		if (this.getObject(handle).clazz !== clazz) {
			throw new FyException(FyConst.FY_EXCEPTION_ARGU,
					"Can't unwrap handle=" + handle + " as boolean");
		}
		return this.getFieldBoolean(handle, field.posAbs);
	};

	/**
	 * @param {Number}
	 *            value
	 * @returns {Number}
	 */
	FyHeap.prototype.wrapBoolean = function(value) {
		var context = this.context;
		var clazz = context.lookupClass(FyConst.FY_BASE_BOOLEAN);
		var field = context.getField(FyConst.FY_VALUE_BOOLEAN);
		var ret = context.heap.allocate(clazz);
		context.heap.putFieldBoolean(ret, field.posAbs, value);
		return ret;
	};

	/**
	 * 
	 * @param {Number}
	 *            handle
	 * @returns {Number}
	 */
	FyHeap.prototype.unwrapBooleanRaw = function(handle) {
		var context = this.context;
		var clazz = context.lookupClass(FyConst.FY_BASE_BOOLEAN);
		var field = context.getField(FyConst.FY_VALUE_BOOLEAN);
		context.lookupClass(FyConst.FY_PRIM_BOOLEAN);
		if (this.getObject(handle).clazz !== clazz) {
			throw new FyException(FyConst.FY_EXCEPTION_ARGU,
					"Can't unwrap handle=" + handle + " as boolean");
		}
		return this.getFieldRaw(handle, field.posAbs);
	};

	/**
	 * @param {Number}
	 *            value
	 * @returns {Number}
	 */
	FyHeap.prototype.wrapBooleanRaw = function(value) {
		var context = this.context;
		var clazz = context.lookupClass(FyConst.FY_BASE_BOOLEAN);
		var field = context.getField(FyConst.FY_VALUE_BOOLEAN);
		var ret = context.heap.allocate(clazz);
		context.heap.putFieldRaw(ret, field.posAbs, value);
		return ret;
	};

	/**
	 * 
	 * @param {Number}
	 *            handle
	 * @returns {Number}
	 */
	FyHeap.prototype.unwrapByte = function(handle) {
		var context = this.context;
		var clazz = context.lookupClass(FyConst.FY_BASE_BYTE);
		var field = context.getField(FyConst.FY_VALUE_BYTE);
		context.lookupClass(FyConst.FY_PRIM_BYTE);
		if (this.getObject(handle).clazz !== clazz) {
			throw new FyException(FyConst.FY_EXCEPTION_ARGU,
					"Can't unwrap handle=" + handle + " as byte");
		}
		return this.getFieldByte(handle, field.posAbs);
	};

	/**
	 * @param {Number}
	 *            value
	 * @returns {Number}
	 */
	FyHeap.prototype.wrapByte = function(value) {
		var context = this.context;
		var clazz = context.lookupClass(FyConst.FY_BASE_BYTE);
		var field = context.getField(FyConst.FY_VALUE_BYTE);
		var ret = context.heap.allocate(clazz);
		context.heap.putFieldByte(ret, field.posAbs, value);
		return ret;
	};

	/**
	 * 
	 * @param {Number}
	 *            handle
	 * @returns {Number}
	 */
	FyHeap.prototype.unwrapShort = function(handle) {
		var context = this.context;
		var clazz = context.lookupClass(FyConst.FY_BASE_SHORT);
		var field = context.getField(FyConst.FY_VALUE_SHORT);
		context.lookupClass(FyConst.FY_PRIM_SHORT);
		if (this.getObject(handle).clazz !== clazz) {
			throw new FyException(FyConst.FY_EXCEPTION_ARGU,
					"Can't unwrap handle=" + handle + " as short");
		}
		return this.getFieldShort(handle, field.posAbs);
	};

	/**
	 * @param {Number}
	 *            value
	 * @returns {Number}
	 */
	FyHeap.prototype.wrapShort = function(value) {
		var context = this.context;
		var clazz = context.lookupClass(FyConst.FY_BASE_SHORT);
		var field = context.getField(FyConst.FY_VALUE_SHORT);
		var ret = context.heap.allocate(clazz);
		context.heap.putFieldShort(ret, field.posAbs, value);
		return ret;
	};

	/**
	 * 
	 * @param {Number}
	 *            handle
	 * @returns {Number}
	 */
	FyHeap.prototype.unwrapChar = function(handle) {
		var context = this.context;
		var clazz = context.lookupClass(FyConst.FY_BASE_CHAR);
		var field = context.getField(FyConst.FY_VALUE_CHAR);
		context.lookupClass(FyConst.FY_PRIM_CHAR);
		if (this.getObject(handle).clazz !== clazz) {
			throw new FyException(FyConst.FY_EXCEPTION_ARGU,
					"Can't unwrap handle=" + handle + " as char");
		}
		return this.getFieldChar(handle, field.posAbs);
	};

	/**
	 * @param {Number}
	 *            value
	 * @returns {Number}
	 */
	FyHeap.prototype.wrapChar = function(value) {
		var context = this.context;
		var clazz = context.lookupClass(FyConst.FY_BASE_CHAR);
		var field = context.getField(FyConst.FY_VALUE_CHAR);
		var ret = context.heap.allocate(clazz);
		context.heap.putFieldChar(ret, field.posAbs, value);
		return ret;
	};

	/**
	 * 
	 * @param {Number}
	 *            handle
	 * @returns {Number}
	 */
	FyHeap.prototype.unwrapInt = function(handle) {
		var context = this.context;
		var clazz = context.lookupClass(FyConst.FY_BASE_INT);
		var field = context.getField(FyConst.FY_VALUE_INT);
		context.lookupClass(FyConst.FY_PRIM_INT);
		if (this.getObject(handle).clazz !== clazz) {
			throw new FyException(FyConst.FY_EXCEPTION_ARGU,
					"Can't unwrap handle=" + handle + " as int");
		}
		return this.getFieldInt(handle, field.posAbs);
	};

	/**
	 * @param {Number}
	 *            value
	 * @returns {Number}
	 */
	FyHeap.prototype.wrapInt = function(value) {
		var context = this.context;
		var clazz = context.lookupClass(FyConst.FY_BASE_INT);
		var field = context.getField(FyConst.FY_VALUE_INT);
		var ret = context.heap.allocate(clazz);
		context.heap.putFieldInt(ret, field.posAbs, value);
		return ret;
	};

	/**
	 * 
	 * @param {Number}
	 *            handle
	 * @returns {Number}
	 */
	FyHeap.prototype.unwrapFloat = function(handle) {
		var context = this.context;
		var clazz = context.lookupClass(FyConst.FY_BASE_FLOAT);
		var field = context.getField(FyConst.FY_VALUE_FLOAT);
		context.lookupClass(FyConst.FY_PRIM_FLOAT);
		if (this.getObject(handle).clazz !== clazz) {
			throw new FyException(FyConst.FY_EXCEPTION_ARGU,
					"Can't unwrap handle=" + handle + " as float");
		}
		return this.getFieldFloat(handle, field.posAbs);
	};

	/**
	 * @param {Number}
	 *            value
	 * @returns {Number}
	 */
	FyHeap.prototype.wrapFloat = function(value) {
		var context = this.context;
		var clazz = context.lookupClass(FyConst.FY_BASE_FLOAT);
		var field = context.getField(FyConst.FY_VALUE_FLOAT);
		var ret = context.heap.allocate(clazz);
		context.heap.putFieldFloat(ret, field.posAbs, value);
		return ret;
	};

	/**
	 * 
	 * @param {Number}
	 *            handle
	 * @returns {Number}
	 */
	FyHeap.prototype.unwrapFloatRaw = function(handle) {
		var context = this.context;
		var clazz = context.lookupClass(FyConst.FY_BASE_FLOAT);
		var field = context.getField(FyConst.FY_VALUE_FLOAT);
		context.lookupClass(FyConst.FY_PRIM_FLOAT);
		if (this.getObject(handle).clazz !== clazz) {
			throw new FyException(FyConst.FY_EXCEPTION_ARGU,
					"Can't unwrap handle=" + handle + " as float");
		}
		return this.getFieldRaw(handle, field.posAbs);
	};

	/**
	 * @param {Number}
	 *            value
	 * @returns {Number}
	 */
	FyHeap.prototype.wrapFloatRaw = function(value) {
		var context = this.context;
		var clazz = context.lookupClass(FyConst.FY_BASE_FLOAT);
		var field = context.getField(FyConst.FY_VALUE_FLOAT);
		var ret = context.heap.allocate(clazz);
		context.heap.putFieldRaw(ret, field.posAbs, value);
		return ret;
	};

	/**
	 * 
	 * @param {Number}
	 *            handle
	 * @returns {Number}
	 */
	FyHeap.prototype.unwrapLong = function(handle, container, pos) {
		var context = this.context;
		var clazz = context.lookupClass(FyConst.FY_BASE_LONG);
		var field = context.getField(FyConst.FY_VALUE_LONG);
		context.lookupClass(FyConst.FY_PRIM_LONG);
		if (this.getObject(handle).clazz !== clazz) {
			throw new FyException(FyConst.FY_EXCEPTION_ARGU,
					"Can't unwrap handle=" + handle + " as long");
		}

		this.getFieldLongTo(handle, field.posAbs, container, pos);
	};

	/**
	 * @param {Number}
	 *            value
	 * @returns {Number}
	 */
	FyHeap.prototype.wrapLong = function(container, ofs) {
		var context = this.context;
		var clazz = context.lookupClass(FyConst.FY_BASE_LONG);
		var field = context.getField(FyConst.FY_VALUE_LONG);
		var ret = context.heap.allocate(clazz);
		context.heap.putFieldLongFrom(ret, field.posAbs, container, ofs);
		return ret;
	};

	/**
	 * 
	 * @param {Number}
	 *            handle
	 * @returns {Number}
	 */
	FyHeap.prototype.unwrapDouble = function(handle) {
		var context = this.context;
		var clazz = context.lookupClass(FyConst.FY_BASE_DOUBLE);
		var field = context.getField(FyConst.FY_VALUE_DOUBLE);
		context.lookupClass(FyConst.FY_PRIM_DOUBLE);
		if (this.getObject(handle).clazz !== clazz) {
			throw new FyException(FyConst.FY_EXCEPTION_ARGU,
					"Can't unwrap handle=" + handle + " as double");
		}

		return this.getFieldDouble(handle, field.posAbs);
	};

	/**
	 * @param {Number}
	 *            value
	 * @returns {Number}
	 */
	FyHeap.prototype.wrapDouble = function(value) {
		var context = this.context;
		var clazz = context.lookupClass(FyConst.FY_BASE_DOUBLE);
		var field = context.getField(FyConst.FY_VALUE_DOUBLE);
		var ret = context.heap.allocate(clazz);
		context.heap.putFieldDouble(ret, field.posAbs, value)
		return ret;
	};

	/**
	 * 
	 * @param {Number}
	 *            handle
	 * @returns {Number}
	 */
	FyHeap.prototype.unwrapDoubleRaw = function(handle, container, pos) {
		var context = this.context;
		var clazz = context.lookupClass(FyConst.FY_BASE_DOUBLE);
		var field = context.getField(FyConst.FY_VALUE_DOUBLE);
		context.lookupClass(FyConst.FY_PRIM_DOUBLE);
		if (this.getObject(handle).clazz !== clazz) {
			throw new FyException(FyConst.FY_EXCEPTION_ARGU,
					"Can't unwrap handle=" + handle + " as double");
		}

		this.getFieldRawLongTo(handle, field.posAbs, container, pos);
	};

	/**
	 * @param {Number}
	 *            value
	 * @returns {Number}
	 */
	FyHeap.prototype.wrapDoubleRaw = function(container, ofs) {
		var context = this.context;
		var clazz = context.lookupClass(FyConst.FY_BASE_DOUBLE);
		var field = context.getField(FyConst.FY_VALUE_DOUBLE);
		var ret = context.heap.allocate(clazz);
		context.heap.putFieldLongFrom(ret, field.posAbs, container, ofs);
		return ret;
	};

	FyHeap.prototype.gc = function() {
		// TODO
	}
})();