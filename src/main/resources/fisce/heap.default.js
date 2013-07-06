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
 * Default heap Will use ArrayBuffer for backend and different TypedArrays for
 * Data View
 * 
 */

(function() {
	/**
	 * Allocate a static storage area for clazz
	 * 
	 * @param {FyClass}
	 *            clazz
	 * @param {Number}
	 *            size
	 */
	FyHeap.prototype.allocateStatic = function(clazz) {
		var id = clazz.classId;
		this.statics[id] = new Uint32Array(clazz.staticSize);
	};

	/**
	 * The underlying allocate logic 111
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
		var handle = toHandle;
		/**
		 * @returns {FyObject}
		 */
		var object;
		if (!handle) {
			handle = this._fetchNextHandle();
		}
		if (this.objects[handle]) {
			throw "Object " + handle + " already exists";
		}

		object = this.objects[handle] = new FyObject();

		object.multiUsageData = multiUsageData;
		object.clazz = clazz;
		var buf = new ArrayBuffer(size << 2);
		object.rawData = new Int32Array(buf);
		if (clazz.type === FyConst.TYPE_ARRAY) {
			switch (clazz.name.charAt(1)) {
			case 'Z':
			case 'B':
				object.data = new Int8Array(buf);
				break;
			case 'S':
				object.data = new Int16Array(buf);
				break;
			case 'C':
				object.data = new Uint16Array(buf);
				break;
			case 'L':
			case 'I':
				object.data = new Int32Array(buf);
				break;
			case 'F':
				object.data = new Float32Array(buf);
				break;
			case 'J':
				object.data = new Uint32Array(buf);
				break;
			case 'D':
				object.data = new Float64Array(buf);
				break;
			default:
				throw "Illegal array class: " + clazz.name;
			}
		} else {
			object.data = object.rawData;
		}

		if (this.protectMode) {
			this.protectedObjects[handle] = true;
		}
		this.totalObjects++;
		return handle;
	};

	FyHeap.prototype.getArrayRaw = function(handle, index) {
		var arr = this.getObject(handle);
		this.checkLength(arr, index);
		return arr.rawData[index];
	};

	FyHeap.prototype.getArrayRawLongTo = function(handle, index, tarray, tindex) {
		var arr = this.getObject(handle);
		this.checkLength(arr, index);
		var rawData = arr.rawData;
		tarray[tindex] = rawData[index << 1];
		tarray[tindex + 1] = rawData[(index << 1) + 1];
	};

	FyHeap.prototype.getArrayBoolean = function(handle, index) {
		var arr = this.getObject(handle);
		this.checkLength(arr, index);
		return arr.data[index] ? true : false;
	};

	FyHeap.prototype.getArrayByte = function(handle, index) {
		var arr = this.getObject(handle);
		this.checkLength(arr, index);
		return arr.data[index];
	};

	FyHeap.prototype.getArrayShort = function(handle, index) {
		var arr = this.getObject(handle);
		this.checkLength(arr, index);
		return arr.data[index];
	};

	FyHeap.prototype.getArrayChar = function(handle, index) {
		var arr = this.getObject(handle);
		this.checkLength(arr, index);
		return arr.data[index];
	};

	FyHeap.prototype.getArrayInt = function(handle, index) {
		var arr = this.getObject(handle);
		this.checkLength(arr, index);
		return arr.data[index];
	};

	FyHeap.prototype.getArrayFloat = function(handle, index) {
		var arr = this.getObject(handle);
		this.checkLength(arr, index);
		return arr.data[index];
	};

	FyHeap.prototype.getArrayLongTo = function(handle, index, tarray, tindex) {
		var arr = this.getObject(handle);
		this.checkLength(arr, index);
		var data = arr.data;
		tarray[tindex] = data[index << 1];
		tarray[tindex + 1] = data[(index << 1) + 1];
	};

	FyHeap.prototype.getArrayDouble = function(handle, index) {
		var arr = this.getObject(handle);
		this.checkLength(arr, index);
		return arr.data[index];
	};

	FyHeap.prototype.putArrayRaw = function(handle, index, value) {
		var arr = this.getObject(handle);
		this.checkLength(arr, index);
		arr.rawData[index] = value;
	};

	FyHeap.prototype.putArrayRawLongFrom = function(handle, index, varray,
			vindex) {
		var arr = this.getObject(handle);
		this.checkLength(arr, index);
		arr.rawData[index << 1] = varray[vindex];
		arr.rawData[(index << 1) + 1] = varray[vindex + 1];
	};

	FyHeap.prototype.putArrayBoolean = function(handle, index, value) {
		var arr = this.getObject(handle);
		this.checkLength(arr, index);
		arr.data[index] = value ? 1 : 0;
	};

	FyHeap.prototype.putArrayByte = function(handle, index, value) {
		var arr = this.getObject(handle);
		this.checkLength(arr, index);
		arr.data[index] = value;
	};

	FyHeap.prototype.putArrayShort = function(handle, index, value) {
		var arr = this.getObject(handle);
		this.checkLength(arr, index);
		arr.data[index] = value;
	};

	FyHeap.prototype.putArrayChar = function(handle, index, value) {
		var arr = this.getObject(handle);
		this.checkLength(arr, index);
		arr.data[index] = value;
	};

	FyHeap.prototype.putArrayInt = function(handle, index, value) {
		var arr = this.getObject(handle);
		this.checkLength(arr, index);
		arr.data[index] = value;
	};

	FyHeap.prototype.putArrayFloat = function(handle, index, value) {
		var arr = this.getObject(handle);
		this.checkLength(arr, index);
		arr.data[index] = value;
	};

	FyHeap.prototype.putArrayLongFrom = function(handle, index, varray, vindex) {
		var arr = this.getObject(handle);
		this.checkLength(arr, index);
		arr.data[index << 1] = varray[vindex];
		arr.data[(index << 1) + 1] = varray[vindex + 1];
	};

	FyHeap.prototype.putArrayDouble = function(handle, index, value) {
		var arr = this.getObject(handle);
		this.checkLength(arr, index);
		arr.data[index] = value;
	};

	FyHeap.prototype.getFieldRaw = function(handle, pos) {
		var obj = this.getObject(handle);
		return obj.rawData[pos];
	};

	FyHeap.prototype.getFieldRawLongTo = function(handle, pos, tarray, tindex) {
		var obj = this.getObject(handle);
		var data = obj.rawData;
		tarray[tindex] = data[pos];
		tarray[tindex + 1] = data[pos + 1];
	};

	FyHeap.prototype.getFieldBoolean = function(handle, pos) {
		var obj = this.getObject(handle);
		return obj.rawData[pos] ? true : false;
	};

	FyHeap.prototype.getFieldInt = function(handle, pos) {
		var obj = this.getObject(handle);
		return obj.rawData[pos];
	};

	FyHeap.prototype.getFieldFloat = function(handle, pos) {
		var obj = this.getObject(handle);
		return FyPortable.intToFloat(obj.rawData[pos]);
	};

	FyHeap.prototype.getFieldDouble = function(handle, pos) {
		var obj = this.getObject(handle);
		return FyPortable.longToDouble(obj.rawData, pos);
	};

	FyHeap.prototype.putFieldRaw = function(handle, pos, value) {
		var obj = this.getObject(handle);
		obj.rawData[pos] = value;
	};

	FyHeap.prototype.putFieldRawLongFrom = function(handle, pos, varray, vindex) {
		var obj = this.getObject(handle);
		obj.rawData[pos] = varray[vindex];
		obj.rawData[pos + 1] = varray[vindex + 1];
	};

	FyHeap.prototype.putFieldBoolean = function(handle, pos, value) {
		var obj = this.getObject(handle);
		obj.rawData[pos] = value ? 1 : 0;
	};

	FyHeap.prototype.putFieldInt = function(handle, pos, value) {
		var obj = this.getObject(handle);
		obj.rawData[pos] = value;
	};

	FyHeap.prototype.putFieldFloat = function(handle, pos, value) {
		var obj = this.getObject(handle);
		obj.rawData[pos] = FyPortable.floatToInt(value);
	};

	FyHeap.prototype.putFieldDouble = function(handle, pos, value) {
		var obj = this.getObject(handle);
		FyPortable.doubleToLong(value, obj.rawData, pos);
	};

	FyHeap.prototype.getStaticRaw = function(clazz, pos) {
		var rawData = this.statics[clazz.classId];
		return rawData[pos];
	};

	FyHeap.prototype.getStaticRawLongTo = function(clazz, pos, tarray, tindex) {
		var rawData = this.statics[clazz.classId];
		tarray[tindex] = rawData[pos];
		tarray[tindex + 1] = rawData[pos + 1];
	};

	FyHeap.prototype.getStaticBoolean = function(clazz, pos) {
		var rawData = this.statics[clazz.classId];
		return rawData[pos];
	};

	FyHeap.prototype.getStaticInt = function(clazz, pos) {
		var rawData = this.statics[clazz.classId];
		return rawData[pos];
	};

	FyHeap.prototype.getStaticFloat = function(clazz, pos) {
		var rawData = this.statics[clazz.classId];
		return FyPortable.intToFloat(rawData[pos]);
	};

	FyHeap.prototype.getStaticDouble = function(clazz, pos) {
		var rawData = this.statics[clazz.classId];
		return FyPortable.longToDouble(rawData, pos);
	};

	FyHeap.prototype.putStaticRaw = function(clazz, pos, value) {
		var rawData = this.statics[clazz.classId];
		rawData[pos] = value;
	};

	FyHeap.prototype.putStaticRawLongFrom = function(clazz, pos, varray, vindex) {
		var rawData = this.statics[clazz.classId];
		rawData[pos] = varray[vindex];
		rawData[pos + 1] = varray[vindex + 1];
	};

	FyHeap.prototype.putStaticBoolean = function(clazz, pos, value) {
		var rawData = this.statics[clazz.classId];
		rawData[pos] = value ? 1 : 0;
	};

	FyHeap.prototype.putStaticInt = function(clazz, pos, value) {
		var rawData = this.statics[clazz.classId];
		rawData[pos] = value;
	};

	FyHeap.prototype.putStaticFloat = function(clazz, pos, value) {
		var rawData = this.statics[clazz.classId];
		rawData[pos] = FyPortable.floatToInt(value);
	};

	FyHeap.prototype.putStaticDouble = function(clazz, pos, value) {
		var rawData = this.statics[clazz.classId];
		FyPortable.doubleToLong(value, rawData, pos);
	};

	FyHeap.prototype.arrayCopy = function(sHandle, sPos, dHandle, dPos, len) {
		var sObj = this.getObject(sHandle);
		var dObj = this.getObject(dHandle);
		/**
		 * @returns {FyClass}
		 */
		var sClass = sObj.clazz;
		/**
		 * @returns {FyClass}
		 */
		var dClass = dObj.clazz;
		var i;
		if (sClass.type != FyConst.TYPE_ARRAY) {
			throw new FyException(FyConst.FY_EXCEPTION_STORE,
					"src is not array");
		}
		if (dClass.type != FyConst.TYPE_ARRAY) {
			throw new FyException(FyConst.FY_EXCEPTION_STORE,
					"dest is not array");
		}
		if (!this.context.classLoader.canCast(sClass.contentClass,
				dClass.contentClass)) {
			throw new FyException(FyConst.FY_EXCEPTION_STORE, "Can't cast "
					+ sClass.contentClass.name + " to "
					+ dClass.contentClass.name);
		}
		if (sPos < 0 || dPos < 0 || (sPos + len > this.arrayLength(sHandle))
				|| (dPos + len > this.arrayLength(dHandle))) {
			throw new FyException(FyConst.FY_EXCEPTION_AIOOB, sPos + "/"
					+ this.arrayLength(sHandle) + " => " + dPos + "/"
					+ this.arrayLength(dHandle) + " len=" + len);
		}
		if (sClass.name === "[J") {
			len <<= 1;
			sPos <<= 1;
			dPos <<= 1;
		}
		for (i = 0; i < len; i++) {
			dObj.data[dPos + i] = sObj.data[sPos + i];
		}
	};

	FyHeap.prototype.clone = function(src) {
		var obj = this.getObject(src);
		/**
		 * @returns {FyClass}
		 */
		var clazz = obj.clazz;
		/**
		 * @returns {Number}
		 */
		var ret;
		/**
		 * @returns {FyObject}
		 */
		var rObj;
		var len;
		var i;
		if (clazz.type === FyConst.TYPE_OBJECT) {
			ret = this.allocate(clazz);
			rObj = this.getObject(ret);
			for (i = 0; i < clazz.sizeAbs; i++) {
				rObj.rawData[i] = obj.rawData[i];
			}
		} else if (clazz.type === FyConst.TYPE_Array) {
			ret = this.allocateArray(clazz, len);
			len = this.arrayLength(src);
			this.arrayCopy(src, 0, ret, 0, len);
		} else {
			throw "Illegal object type " + clazz.type + " for class to clone: "
					+ clazz.name;
		}
		return ret;
	};
})();