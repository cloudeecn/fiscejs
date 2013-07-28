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
var FyObject;

(function() {
	var MAX_OBJECTS = 65536;

	FyObject = function() {
		this.clazz = undefined;
		this.finalizeStatus = 0;
		this.multiUsageData = 0;
		this.monitorOwnerId = 0;
		this.monitorOwnerTimes = 0;
		this.rawData = undefined;
		this.data = undefined;
	};

	FyObject.prototype.clear = function() {
		FyObject.call(this);
	};

	/**
	 * 
	 * @param {FyContext}
	 *            context
	 */
	FyHeap = function(context) {
		this.context = context;

		this.statics = [];
		this.objects = new Array(MAX_OBJECTS);

		this.toFinalize = [];
		this.protectMode = false;
		this.protectedObjects = {};
		this.literials = {};
		this.references = {};
		this.toEnqueue = [];
		this.nextHandle = 1;
		this.totalObjects = 0;

		this.usePreservedArea = false;

	};

	FyHeap.prototype.beginProtect = function() {
		this.protectMode = true;
	};

	FyHeap.prototype.endProtect = function() {
		this.protectMode = false;
		this.protectedObjects = {};
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
			if (handle >= MAX_OBJECTS) {
				handle = 1;
			}
			if (handle === this.nextHandle) {
				if (gced) {
					throw "Out of memory: handles";
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
		return this._allocate(size, clazz, multiUsageData, toHandle);
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
			throw "Please use allocateArray to allocate arrays";
		}
		return this._allocate(clazz.sizeAbs, clazz, 0, 0);
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
			throw "Illegal array type " + clazz.arrayType + " for class "
					+ clazz.name;
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
			throw "Please use allocate to allocate objects.";
		}
		return this._allocate(this.getArraySizeFromLength(clazz, length),
				clazz, length, 0);
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
		if (handle < 0 || handle > MAX_OBJECTS) {
			throw "Illegle handle " + handle;
		}
		return this.objects[handle];
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
			throw new FyException(FyConst.FY_EXCEPTION_IOOB, idx);
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
	 * 
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
		if (ret !== undefined) {
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

	FyHeap.prototype.getClassFromHandle = function(handle) {
		/**
		 * @returns {FyObject}
		 */
		var obj = this.objects[handle];
		return obj.clazz;
	};

	/**
	 * create multi arrays
	 * 
	 * @param {FyClass}
	 *            clazz class which this method creates for
	 * @param {Number}
	 *            count arrays layers count
	 * @param {Number}
	 *            pos
	 */
	FyHeap.prototype.multiNewArray = function(clazz, count, pos) {
		// TODO
	};
})();