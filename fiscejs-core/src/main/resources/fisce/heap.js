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
 * We use one ArrayBuffer for all data
 * 
 * @param {FyContext}
 *            _context
 */
function FyHeap(_context) {
	"use strict";
	/**
	 * Heap layout:<code>
	 * 
	 * MAX_OBJECTS || Object pointer table 
	 * EDEN_SIZE || Eden 
	 * COPY_SIZE || Copy1
	 * COPY_SIZE || Copy2 
	 * ??? || Old 
	 * ??? || Perm(stacks, class static area)
	 */

	/**
	 * 
	 */
	var BID_AUTO = 0;
	var BID_EDEN = 1;
	var BID_YOUNG = 2;
	var BID_OLD = 3;

	var FIN_NOT_FINALIZED = 0;
	var FIN_IN_FINALIZE_ARRAY = 1;
	var FIN_FINALIZED = 2;

	var OBJ_HANDLE = 0;
	var OBJ_CLASS_ID = 1;
	var OBJ_FINALIZE_STATUS = 2;
	var OBJ_BID = 3;
	var OBJ_GEN = 4;
	var OBJ_MULTI_USAGE = 5;
	var OBJ_MONITOR_OWNER_ID = 6;
	var OBJ_MONITOR_OWNER_TIME = 7;

	var OBJ_META_SIZE = 8;
	this.OBJ_META_SIZE = OBJ_META_SIZE;

	var MAX_OBJECTS = FyConfig.maxObjects | 0;
	var HEAP_SIZE = FyConfig.heapSize;
	var MAX_GEN = 8;
	var EDEN_SIZE = FyConfig.edenSize | 0;
	var COPY_SIZE = FyConfig.copySize | 0;

	var _toFinalize = [];
	var _protectMode = 0;
	var _protectedObjects = [];
	var _literials = {};
	var _references = [];
	var _toEnqueue = [];
	var _stackPool = [];
	var _nextHandle = 1;
	var _totalObjects = 0;

	var _buffer = new ArrayBuffer(HEAP_SIZE << 2);
	var _heap = new Int32Array(_buffer);
	this._heap = _heap;
	var _heap8 = new Int8Array(_buffer);
	this._heap8 = _heap8;
	var _heap16 = new Int16Array(_buffer);
	this._heap16 = _heap16;
	var _heapFloat = new Float32Array(_buffer);
	this._heapFloat = _heapFloat;
	var _edenBottom = MAX_OBJECTS | 0;
	var _edenTop = (_edenBottom + EDEN_SIZE) | 0;
	var _copyBottom = _edenTop;
	var _copyTop = (_copyBottom + COPY_SIZE) | 0;
	var _copy2Bottom = _copyTop;
	var _copy2Top = (_copy2Bottom + COPY_SIZE) | 0;
	var _oldBottom = _copy2Top;
	var _heapTop = HEAP_SIZE;

	var _edenPos = _edenBottom;
	var _copyPos = _copyBottom;
	var _copy2Pos = _copy2Bottom;
	var _oldPos = _oldBottom;

	var _gcInProgress = false;
	var _oldReleasedSize = 0;
	var _marks = [];
	var _from = [];

	/**
	 * @param gced
	 * @returns {Number}
	 */
	var _fetchNextHandle = function(gced) {
		var handle = _nextHandle;
		while (true) {
			if (_heap[handle] === 0) {
				break;
			}
			handle++;
			if (handle >= MAX_OBJECTS) {
				handle = 1;
			}
			if (handle === _nextHandle) {
				if (gced) {
					throw new FyException(undefined, "Out of memory: handles");
				} else {
					return _fetchNextHandle(true);
				}
			}
		}
		_nextHandle = handle + 1;
		return handle;
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
	var _getArraySizeFromLength = function(clazz, length) {
		switch (clazz.arrayType) {
		case 3/* FyConst.FY_AT_LONG */:
			return length << 1;
		case 2/* FyConst.FY_AT_INT */:
			return length;
		case 0/* FyConst.FY_AT_BYTE */:
			return (length + 3) >> 2;
		case 1/* FyConst.FY_AT_SHORT */:
			return (length + 1) >> 1;
		default:
			throw new FyException(undefined, "Illegal array type "
					+ clazz.arrayType + " for class " + clazz.name);
		}
	};

	/**
	 * @param {Number}
	 *            pos
	 * @param {Number}
	 *            size
	 * @param {Number}
	 *            value
	 */
	var _memset32 = function(pos, size, value) {
		value = value | 0;
		for (var i = size; i--;) {
			_heap[pos + i] = value;
		}
	};
	this.memset32 = _memset32;

	var _beginProtect = function() {
		_protectMode = 1;
	};
	this.beginProtect = _beginProtect;

	var _endProtect = function() {
		_protectMode = 0;
		_protectedObjects.length = 0;
	};
	this.endProtect = _endProtect;

	var _get8 = function(pos) {
		return _heap8[pos];
	};
	this.get8 = _get8;

	var _get16 = function(pos) {
		return _heap16[pos];
	};
	this.get16 = _get16;

	var _get32 = function(pos) {
		return _heap[pos];
	};
	this.get32 = _get32;

	/***************************************************************************
	 * BOOKMARK_OBJECT
	 * 
	 * 
	 * 
	 * 
	 * 
	 * 
	 */

	/**
	 * @param {Number}
	 *            handle
	 */
	var _objectExists = function(handle) {
		return _heap[handle] > 0 ? 1 : 0;
	};
	this.objectExists = _objectExists;

	/**
	 * @param {Number}
	 *            pos
	 */
	var _getOjbectHandleIn = function(pos) {
		pos = pos | 0;
		return _heap[pos + OBJ_HANDLE];
	};

	var _createObject = function(handle, pos) {
		_heap[handle] = pos;
		_heap[pos + OBJ_HANDLE] = handle;
	};

	var _getObjectClassId = function(handle) {
		return _heap[_heap[handle] + OBJ_CLASS_ID];
	};
	this.getObjectClassId = _getObjectClassId;

	var _setObjectClassId = function(handle, classId) {
		_heap[_heap[handle] + OBJ_CLASS_ID] = classId;
	};
	this.setObjectClassId = _setObjectClassId;

	var _getObjectClass =
	/**
	 * @returns {FyClass}
	 */
	function(handle) {
		return _context.classes[_getObjectClassId(handle)];
	};
	this.getObjectClass = _getObjectClass;

	/**
	 * @param {Number}
	 *            handle
	 * @param {FyClass}
	 *            clazz;
	 */
	var _setObjectClass = function(handle, clazz) {
		this.setObjectClassId(handle, clazz.classId);
	};
	this.setObjectClass = _setObjectClass;

	var _getObjectFinalizeStatus = function(handle) {
		return _heap[_heap[handle] + OBJ_FINALIZE_STATUS];
	};
	this.getObjectFinalizeStatus = _getObjectFinalizeStatus;

	var _setObjectFinalizeStatus = function(handle, value) {
		_heap[_heap[handle] + OBJ_FINALIZE_STATUS] = value;
	};
	this.setObjectFinalizeStatus = _setObjectFinalizeStatus;

	var _getObjectMultiUsageData = function(handle) {
		return _heap[_heap[handle] + OBJ_MULTI_USAGE];
	};
	this.getObjectMultiUsageData = _getObjectMultiUsageData;

	var _setObjectMultiUsageData = function(handle, value) {
		_heap[_heap[handle] + OBJ_MULTI_USAGE] = value;
	};
	this.setObjectMultiUsageData = _setObjectMultiUsageData;

	var _getObjectMonitorOwnerId = function(handle) {
		return _heap[_heap[handle] + OBJ_MONITOR_OWNER_ID];
	};
	this.getObjectMonitorOwnerId = _getObjectMonitorOwnerId;

	var _setObjectMonitorOwnerId = function(handle, value) {
		_heap[_heap[handle] + OBJ_MONITOR_OWNER_ID] = value;
	};
	this.setObjectMonitorOwnerId = _setObjectMonitorOwnerId;

	var _getObjectMonitorOwnerTimes = function(handle) {
		return _heap[_heap[handle] + OBJ_MONITOR_OWNER_TIME];
	};
	this.getObjectMonitorOwnerTimes = _getObjectMonitorOwnerTimes;

	var _setObjectMonitorOwnerTimes = function(handle, value) {
		_heap[_heap[handle] + OBJ_MONITOR_OWNER_TIME] = value;
	};
	this.setObjectMonitorOwnerTimes = _setObjectMonitorOwnerTimes;

	var _getObjectFinalizeStatus = function(handle) {
		return _heap[_heap[handle] + OBJ_FINALIZE_STATUS];
	};
	this.getObjectFinalizeStatus = _getObjectFinalizeStatus;

	var _setObjectFinalizeStatus = function(handle, value) {
		_heap[_heap[handle] + OBJ_FINALIZE_STATUS] = value;
	};
	this.setObjectFinalizeStatus = _setObjectFinalizeStatus;

	var _getObjectBId = function(handle) {
		return _heap[_heap[handle] + OBJ_BID];
	};
	this.getObjectBId = _getObjectBId;

	var _setObjectBId = function(handle, value) {
		_heap[_heap[handle] + OBJ_BID] = value;
	};
	this.setObjectBId = _setObjectBId;

	var _getObjectGen = function(handle) {
		return _heap[_heap[handle] + OBJ_GEN];
	};
	this.getObjectGen = _getObjectGen;

	var _setObjectGen = function(handle, value) {
		_heap[_heap[handle] + OBJ_GEN] = value;
	};
	this.setObjectGen = _setObjectGen;

	/**
	 * BOOKMARK_ALLOCATE
	 * 
	 * 
	 * 
	 * 
	 * 
	 * 
	 * 
	 * 
	 */

	/**
	 * 
	 * @param {Number}
	 *            size
	 * @param {Number}
	 *            gced
	 * @returns {Number} the address in heap allocated
	 */
	var _allocatePerm = function(size, gced) {
		_heapTop -= size;
		if (_heapTop < _oldPos) {
			if (gced) {
				throw new FyException(undefined, "Out of memory: perm");
			} else {
				this.gc(size);
				return _allocatePerm(size, 1);
			}
		}
		return _heapTop;
	};
	this.allocatePerm = _allocatePerm;
	this.allocateStatic = _allocatePerm;

	var _allocateStack = function(threadId) {
		var pos = _stackPool[threadId];
		if (!pos) {
			// allocate new
			pos = _allocatePerm(FyConfig.stackSize, 0);
			_stackPool[threadId] = pos;
		}
		return pos;
	};
	this.allocateStack = _allocateStack;

	var _releaseStack = function(threadId) {
		_memset32(_stackPool[threadId], FyConfig.stackSize, 0);
	};
	this.releaseStack = _releaseStack;

	/**
	 * 
	 * @param {Number}
	 *            size
	 * @param {Number}
	 *            gced
	 * 
	 */
	var _allocateInEden = function(size, gced) {
		var ret = 0;
		var newEdenPos = _edenPos + size;
		if (newEdenPos > _edenTop) {
			if (gced) {
				throw new FyException(undefined, "Out of memory in eden! "
						+ newEdenPos + "/" + _edenTop);
			} else {
				_gc(size);
				return _allocateInEden(size, 1);
			}
		} else {
			ret = _edenPos;
			_edenPos = newEdenPos;
			return ret;
		}
	};

	/**
	 * 
	 * @param {Number}
	 *            size
	 * @param {Number}
	 *            gced
	 * 
	 */
	var _allocateInCopy = function(size, gced) {
		var ret = 0;
		var newCopyPos = _copyPos + size;
		if (newCopyPos > _copyTop) {
			if (gced) {
				throw new FyException(undefined, "Out of memory in copy! "
						+ newCopyPos + "/" + _copyTop);
			} else {
				_gc(size);
				return _allocateInCopy(size, 1);
			}
		} else {
			ret = _copyPos;
			_copyPos = newCopyPos;
			return ret;
		}
	};

	/**
	 * 
	 * @param {Number}
	 *            size
	 * @param {Number}
	 *            gced
	 */
	var _allocateInOld = function(size, gced) {
		var ret = 0;
		var newOldPos = _oldPos + size;
		if (newOldPos > _heapTop) {
			if (gced) {
				throw new FyException(undefined, "Out of memory in old!"
						+ newOldPos + "/" + _heapTop);
			} else {
				_gc(size);
				return _allocateInOld(size, 1);
			}
		} else {
			ret = _oldPos;
			_oldPos = newOldPos;
			return ret;
		}
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
	 * @param {Number}
	 *            bid
	 * @returns {Number} object handle
	 */
	var _allocateInternal = function(size, clazz, multiUsageData, toHandle, bid) {
		var handle = toHandle;
		if (handle === 0) {
			handle = _fetchNextHandle();
		}

		// if (handle === 2875) {
		// new FyException();
		// }

		if (_objectExists(handle)) {
			// TODO confirm
			throw new FyException("Object " + handle + " already exists");
		}

		switch (bid) {
		case 0/* BID_AUTO */:
			if (size > ((COPY_SIZE) >> 1)) {
				// allocate in old directly
				_createObject(handle, _allocateInOld(size + OBJ_META_SIZE, 0));
				_memset32(_heap[handle] + 1, size + OBJ_META_SIZE - 1, 0);
				_setObjectBId(handle, BID_OLD);
			} else {
				// allocate in eden;
				_createObject(handle, _allocateInEden(size + OBJ_META_SIZE, 0));
				_memset32(_heap[handle] + 1, size + OBJ_META_SIZE - 1, 0);
				_setObjectBId(handle, BID_EDEN);
			}
			break;
		case 1/* BID_EDEN */:
			// TODO check if we need to set obj->object_data->position
			_createObject(handle, _allocateInEden(size + OBJ_META_SIZE, 1));
			break;
		case 2/* BID_YOUNG */:
			_createObject(handle, _allocateInCopy(size + OBJ_META_SIZE, 1));
			break;
		case 3/* BID_OLD */:
			_createObject(handle, _allocateInOld(size + OBJ_META_SIZE, 1));
			break;
		default:
			throw new FyException(undefined, "Illegal bid: " + bid);
		}
		_setObjectMultiUsageData(handle, multiUsageData);
		_setObjectClassId(handle, clazz.classId);
		if (_protectMode) {
			_protectedObjects.push(handle);
		}
		return handle;
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
	 * @param {Number}
	 *            pos position
	 * @returns {Number} object handle
	 */
	var _allocateDirect = function(size, clazz, multiUsageData, toHandle, pos) {
		if (objects[toHandle]) {
			throw new FyException(FyConst.FY_EXCEPTION_INCOMPAT_CHANGE,
					"Handle " + toHandle + " already allocated.");
		}
		var ret = _allocateInternal(size, clazz, multiUsageData, toHandle, pos);
		if (_protectMode) {
			_protectedObjects.push(ret);
		}
		return ret;
	};
	this.allocateDirect = _allocateDirect;

	/**
	 * Allocate a new Object on heap
	 * 
	 * @param {FyClass}
	 *            clazz
	 * @return {Number} object handle
	 */
	var _allocate = function(clazz) {
		if (clazz.type != FyConst.TYPE_OBJECT) {
			throw new FyException(undefined,
					"Please use allocateArray to allocate arrays");
		}
		var ret = _allocateInternal(clazz.sizeAbs, clazz, 0, 0, BID_AUTO);
		if (_protectMode) {
			_protectedObjects.push(ret);
		}
		return ret;
	};
	this.allocate = _allocate;

	/**
	 * Allocate a new array object in heap
	 * 
	 * @param {FyClass}
	 *            clazz
	 * @param {Number}
	 *            length
	 */
	var _allocateArray = function(clazz, length) {
		if (clazz.type !== FyConst.TYPE_ARRAY) {
			throw new FyException(undefined,
					"Please use allocate to allocate objects.");
		}
		var ret = _allocateInternal(_getArraySizeFromLength(clazz, length),
				clazz, length, 0, BID_AUTO);
		if (_protectMode) {
			_protectedObjects.push(ret);
		}
		return ret;
	};
	this.allocateArray = _allocateArray;

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
	var _multiNewArray = function(clazz, layers, counts, pos) {
		var size = counts[pos];
		var ret = _allocateArray(clazz, size);
		var handle = 0;
		var i = 0;
		if (layers > 1) {
			for (i = 0; i < size; i++) {
				handle = _multiNewArray(clazz.contentClass, layers - 1, counts,
						pos + 1);
				_putArrayInt(ret, i, handle);
			}
		}
		return ret;
	};
	this.multiNewArray = _multiNewArray;

	var _registerReference = function(reference, referent) {
		reference = reference | 0;
		if (_references[reference] !== undefined) {
			throw new FyException(undefined, "Reference #" + reference
					+ " is already registered with referent #"
					+ _references[reference]);
		} else {
			// console.log("Register reference #" + reference + " "
			// + _getObjectClass(reference).name + " to referent #"
			// + referent);
			_references[reference] = referent;
		}
	};
	this.registerReference = _registerReference;

	var _clearReference = function(reference) {
		reference = reference | 0;
		delete _references[reference];
	};
	this.clearReference = _clearReference;

	var _getReferent = function(reference) {
		reference = reference | 0;
		return _references[reference] | 0;
	};
	this.getReferent = _getReferent;

	/**
	 * BOOKMARK_GC
	 * 
	 * 
	 * 
	 * 
	 */

	/**
	 * @param {GcData}
	 *            gcData
	 * @param {Number}
	 *            handle
	 */
	var _markObjectInitialUsing = function(handle) {
		if (handle === 0) {
			throw new FyException(undefined, "GC Internal error #1");
		}

		// if (FyConfig.debugMode && (handle < 0 || handle >
		// FyConfig.maxObjects)) {
		// throw new FyException(undefined, "Illegal handle #" + handle);
		// }
		// if(handle===4096){
		// new FyException(undefined,undefined);
		// }
		_from.push(handle);
	};

	/**
	 * 
	 * @param {Boolean}
	 *            processSoft
	 */
	var _fillInitialHandles = function(processSoft) {

		var classClass = _context.lookupClass(FyConst.FY_BASE_CLASS);
		var classMethod = _context.lookupClass(FyConst.FY_REFLECT_METHOD);
		var classField = _context.lookupClass(FyConst.FY_REFLECT_FIELD);
		var classConstructor = _context
				.lookupClass(FyConst.FY_REFLECT_CONSTRUCTOR);

		var imax;

		/* Reflection objects */
		imax = FyConfig.maxObjects;
		for (var i = 1; i < imax; i++) {
			if (_objectExists(i)) {
				var clazz = _getObjectClass(i);
				if (clazz === classClass || clazz === classMethod
						|| clazz === classField || clazz === classConstructor) {
					_markObjectInitialUsing(i);
				}
			}
		}

		/* Class static area */
		imax = _context.classes.length;
		for (var i = 1; i < imax; i++) {
			/**
			 * @returns {FyClass}
			 */
			var clazz = _context.classes[i];
			for (var j = 0; j < clazz.staticSize; j++) {
				/**
				 * @returns {FyField}
				 */
				var field = clazz.fieldStatic[j];
				if (field !== undefined) {
					switch (field.descriptor.charCodeAt(0)) {
					case 76/* FyConst.L */:
					case 91/* FyConst.ARR */:
						var value = _getStaticInt(clazz, field.posAbs);
						if (value !== 0) {
							// console.log("#GC Add static " + clazz.name + "."
							// + field.name + " = " + value);
							_markObjectInitialUsing(value);
						}
						break;
					}
				}
			}
		}

		/* Literals */
		for ( var literal in _literials) {
			var handle = _literials[literal];
			_markObjectInitialUsing(handle);
		}

		/* Thread objects */
		imax = FyConfig.maxThreads;
		for (var i = 1; i < imax; i++) {
			/**
			 * @returns {FyThread}
			 */
			var thread = _context.threadManager.threads[i];
			if (thread !== undefined) {
				_markObjectInitialUsing(thread.handle);
				if (thread.waitForLockId !== 0) {
					_markObjectInitialUsing(thread.waitForLockId);
				}
				if (thread.waitForNotifyId !== 0) {
					_markObjectInitialUsing(thread.waitForNotifyId);
				}
				if (thread.currentThrowable !== 0) {
					_markObjectInitialUsing();
				}
				thread.scanRef(_from);
			}
		}

		imax = _toFinalize.length;
		for (var i = 0; i < imax; i++) {
			_markObjectInitialUsing(_toFinalize[i]);
		}

		imax = _protectedObjects.length;
		for (var i = 0; i < imax; i++) {
			_markObjectInitialUsing(_protectedObjects[i]);
		}

		imax = _toEnqueue.length;
		for (var i = 0; i < imax; i++) {
			_markObjectInitialUsing(_toEnqueue[i]);
		}

		if (processSoft) {
			// console.log("process soft");
			for ( var key in _references) {
				var reference = key | 0;
				var referent = _references[key];
				var referenceClass = _getObjectClass(reference);
				// console.log("reference #" + reference + " got");
				if (referenceClass.accessFlags & FyConst.FY_ACC_SOFT_REF) {
					// console.log("reference #" + reference + "(" + referent
					// + ") is added as soft ref");
					_markObjectInitialUsing(referent);
				}
			}
		}

		// for ( var idx in _from) {
		// console.log("#Initial: " + _from[idx]);
		// }
	};

	var _cleanAndEnqueue = function(reference) {
		reference = reference | 0;
		// console.log("#clear and enqueue #" + reference);
		_toEnqueue.push(reference);
		delete _references[reference];
	};

	var _scanRef = function() {
		var handle;
		while ((handle = _from.pop()) !== undefined) {
			if (_marks[handle]) {
				continue;
			} else {
				_marks[handle] = true;
			}
			var clazz = _getObjectClass(handle);
			if (clazz === undefined) {
				throw new FyException(undefined, "Handle #" + handle
						+ " is released while using");
			}
			switch (clazz.type) {
			case 2/* FyConst.TYPE_ARRAY */:
				if (clazz.contentClass.type !== FyConst.TYPE_PRIMITIVE) {
					for (var i = _arrayLength(handle) - 1; i >= 0; i--) {
						var handle2 = _getArrayInt(handle, i);
						if (handle2 === 0) {
							continue;
						}
						if (!_marks[handle2]) {
							// console.log("!!Add #" + handle + "[" + i + "]="
							// + handle2);
							if (FyConfig.debugMode
									&& (handle2 < 0 || handle2 > FyConfig.maxObjects)) {
								throw new FyException("Illegal handle #"
										+ handle2 + " in "
										+ _getObjectClass(handle).name + "#"
										+ handle + "[" + i + "]");
							}
							_from.push(handle2);
						}
					}
				}
				break;
			case 0/* FyConst.TYPE_OBJECT */:
				for (var i = clazz.sizeAbs - 1; i >= 0; i--) {
					/**
					 * @returns {FyField}
					 */
					var field = clazz.fieldAbs[i];
					if (field === undefined) {
						// console.log("!!Discard #" + handle + "[undefined@" +
						// i
						// + "]");
						continue;
					}
					var fieldType = field.descriptor.charCodeAt(0);
					if (fieldType === FyConst.L || fieldType === FyConst.ARR) {
						var handle2 = _getFieldInt(handle, field.posAbs);
						if (handle2 === 0) {
							// console.log("!!Discard #" + handle + "["
							// + field.name + "]=" + handle2);
							continue;
						}
						if (!_marks[handle2]) {
							// console.log("!!Add #" + handle + "[" + field.name
							// + "]=" + handle2);
							if (FyConfig.debugMode
									&& (handle2 < 0 || handle2 > FyConfig.maxObjects)) {
								throw new FyException("Illegal handle #"
										+ handle2 + " in "
										+ _getObjectClass(handle).name + "#"
										+ handle + "." + field.fullName);
							}
							_from.push(handle2);
						}
					} else {
						// console.log("!!Discard #" + handle + "[" + field.name
						// + "](" + field.descriptor + ")");
					}
				}
				break;
			default:
				throw new FyException(undefined,
						"Illegal object type for object #" + handle + "("
								+ clazz.name + ")");
			}
		}
	};

	var _getSizeFromObject =
	/**
	 * @param {Number}
	 *            handle
	 */
	function(handle) {
		var clazz = _getObjectClass(handle);
		switch (clazz.type) {
		case 2/* FyConst.TYPE_ARRAY */:
			return _getArraySizeFromLength(clazz, _arrayLength(handle))
					+ OBJ_META_SIZE;
		case 0/* FyConst.TYPE_OBJECT */:
			return clazz.sizeAbs + OBJ_META_SIZE;
		default:
			throw new FyException(undefined, "Illegal class type " + clazz.type
					+ " for class " + clazz.name + " in GC");
		}
	};

	var _release = function(handle) {
		// if (handle == 46) {
		// console.log("#Release " + handle + " ("
		// + _getObjectClass(handle).name + ")");
		// }
		if (_getObjectBId(handle) === BID_OLD) {
			_oldReleasedSize += _getSizeFromObject(handle);
		}
		delete _references[handle];
		_memset32(_heap[handle], _getSizeFromObject(handle), 0);
		_heap[handle] = 0;
	};

	var _compatOld = function(marks) {
		var newPos = _oldBottom;
		for (var i = _oldBottom; i < _oldPos; i++) {
			var handle = _heap[i];
			if (handle > 0 && handle < MAX_OBJECTS && _heap[handle] === i) {
				// It's a real object
				var size = _getSizeFromObject(handle);
				if (marks !== undefined && !marks[handle]) {
					// this will be released
					_release(handle);
				} else {
					// console.log("#GC Old get #" + handle + " to keep, move "
					// + size + " dwords from " + i + " to " + newPos);
					// move
					if (newPos !== i) {
						_memcpy32(i, newPos, size);
					}
					_heap[handle] = newPos;
					newPos += size;
				}
				i += size - 1;
			}
		}
		console.log("#GC: Compat old"
				+ (marks ? " with object release" : " for space") + ", "
				+ (_oldPos - _oldBottom) + " => " + (newPos - _oldBottom));
		_oldPos = newPos;
		_oldReleasedSize = 0;
	};

	var _moveToOld =
	/**
	 * @param {Number}
	 *            handle
	 */
	function(handle) {
		var size = _getSizeFromObject(handle);
		if (_oldPos + size >= _heapTop) {
			_compatOld();
			if (_oldPos + size >= _heapTop) {
				throw new FyException(undefined, "Old area full");
			}
		}
		// Don't gc here, as this method is called in gc process
		var pos = _oldPos;
		_oldPos += size;
		_memcpy32(_heap[handle], pos, size);
		_memset32(_heap[handle], size, 0);
		_heap[handle] = pos;
		_heap[pos] = handle;
		_setObjectBId(handle, BID_OLD);
	};

	var _moveToYoung =
	/**
	 * @param {Number}
	 *            handle
	 */
	function(handle) {
		var size = _getSizeFromObject(handle);
		if (_copy2Pos + size >= _copy2Top) {
			_moveToOld(handle);
		} else {
			var pos = _copy2Pos;
			_copy2Pos += size;
			_memcpy32(_heap[handle], pos, size);
			_memset32(_heap[handle], size, 0);
			_heap[handle] = pos;
			_heap[pos] = handle;
			_setObjectBId(handle, BID_YOUNG);
			_setObjectGen(handle, _getObjectGen(handle) + 1);
		}
	};

	var _swapCopy = function() {
		var tmp;

		tmp = _copyBottom;
		_copyBottom = _copy2Bottom;
		_copy2Bottom = tmp;

		tmp = _copyTop;
		_copyTop = _copy2Top;
		_copy2Top = tmp;

		_copyPos = _copy2Pos;
		_copy2Pos = _copy2Bottom;
	};

	var _move = function(handle) {
		if (_getObjectGen(handle) > MAX_GEN) {
			// console.log("#GC move #" + handle + " to old");
			_moveToOld(handle);
		} else {
			// console.log("#GC move #" + handle + " to young");
			_moveToYoung(handle);
		}
		if (_getObjectClass(handle) === undefined) {
			throw new FyException(undefined,
					"Fatal error occored in gc process...");
		}
	};

	var _validateObjects = function() {
		for (var handle = MAX_OBJECTS; --handle;) {
			if (_heap[handle] !== 0 && _heap[_heap[handle]] !== handle) {
				throw new FyException(undefined, "Illegal status for object #"
						+ handle + " pos=" + _heap[handle] + " value="
						+ _heap[_heap[handle]] + " ");
			}
		}
	};

	var _gc = function(requiredSize) {
		var timeStamp;
		var t1, t2, t3, t4, t5, t6, t7;
		var memoryStressed = false;
		if (_gcInProgress) {
			throw new FyException(undefined, "Gc should not be reentried");
		}
		if (requiredSize + _oldPos + _copyPos - _copyBottom + _edenPos
				- _edenBottom >= _heapTop) {
			memoryStressed = true;
		}
		_context.log(1,
				"#GC "
						+ (memoryStressed ? "stressed" : "")
						+ " BEFORE "
						+ (_edenPos - _edenBottom)
						+ "+"
						+ (_copyPos - _copyBottom)
						+ "+"
						+ (_oldPos - _oldBottom)
						+ " total "
						+ (_edenPos - _edenBottom + _copyPos - _copyBottom
								+ _oldPos - _oldBottom) + " ints "
						+ (HEAP_SIZE - _heapTop) + " perm ints");
		if (FyConfig.debugMode) {
			_validateObjects();
		}

		timeStamp = performance.now();
		_marks.length = 0;
		_from.length = 0;

		t1 = performance.now();
		_fillInitialHandles(!memoryStressed);

		t2 = performance.now();
		_scanRef();

		t3 = performance.now();
		_from.length = 0;
		for (var i = 1; i < MAX_OBJECTS; i++) {
			if (_objectExists(i) && !_marks[i]
					&& _getObjectClass(i).needFinalize
					&& _getObjectFinalizeStatus(i) == FIN_NOT_FINALIZED) {
				_toFinalize.push(i);
				_from.push(i);
				_setObjectFinalizeStatus(i, FIN_IN_FINALIZE_ARRAY);
				// console.log("queue and keep #" + i + " for finalize");
			}
		}
		for ( var reference in _references) {
			// phase1
			var referent = _references[reference];
			if (!_objectExists(referent)
					|| (!_marks[referent] && ((_getObjectClass(reference).accessFlags & FyConst.FY_ACC_PHANTOM_REF) === 0))) {
				_from.push(reference | 0);
				_cleanAndEnqueue(reference | 0);
			}
		}

		t4 = performance.now();
		_scanRef();
		_from.length = 0;

		t5 = performance.now();
		if (memoryStressed) {
			_compatOld(_marks);
		}

		t6 = performance.now();
		for (var i = 1; i < MAX_OBJECTS; i++) {
			if (_objectExists(i)) {
				if (_marks[i]) {
					switch (_getObjectBId(i)) {
					case 1/* BID_EDEN */:
					case 2/* BID_YOUNG */:
						_move(i);
						break;
					case 3/* BID_OLD */:
						break;
					default:
						throw new FyException(undefined, "Illegal bid "
								+ _getObjectBId(i) + " for object #" + i);
					}
				} else {
					_release(i);
				}
			}
		}
		_edenPos = _edenBottom;
		_swapCopy();
		t7 = performance.now();

		for ( var reference in _references) {
			var referent = _references[reference];
			// phase2
			if (!_objectExists(referent) && _marks[reference]) {
				_cleanAndEnqueue(reference);
			}
		}

		_marks.length = 0;
		_gcInProgress = false;
		if (FyConfig.debugMode) {
			_validateObjects();
		}
		_context.log(1,
				"#GC AFTER "
						+ (_edenPos - _edenBottom)
						+ "+"
						+ (_copyPos - _copyBottom)
						+ "+"
						+ (_oldPos - _oldBottom)
						+ " total "
						+ (_edenPos - _edenBottom + _copyPos - _copyBottom
								+ _oldPos - _oldBottom) + " ints "
						+ (HEAP_SIZE - _heapTop) + " perm ints");
		_context.log(1, "#GC time: " + ((t1 - timeStamp) | 0) + " "
				+ ((t2 - t1) | 0) + " " + ((t3 - t2) | 0) + " "
				+ ((t4 - t3) | 0) + " " + ((t5 - t4) | 0) + " "
				+ ((t6 - t5) | 0) + " " + ((t7 - t6) | 0) + " "
				+ ((performance.now() - t7) | 0));
	};
	this.gc = _gc;

	var _getFinalizee = function() {
		if (_toFinalize.length > 0) {
			var clazz = _context.lookupClass("[L" + FyConst.FY_BASE_OBJECT
					+ ";");
			var ret = _allocateArray(clazz, _toFinalize.length);
			for (var i = 0; i < _toFinalize.length; i++) {
				_putArrayInt(ret, i, _toFinalize[i]);
				_setObjectFinalizeStatus(_toFinalize[i], FIN_FINALIZED);
			}
			_toFinalize.length = 0;
			return ret;
		} else {
			return 0;
		}
	};
	this.getFinalizee = _getFinalizee;

	var _getReferencesToEnqueue = function() {
		if (_toEnqueue.length > 0) {
			var clazz = _context.lookupClass("[L" + FyConst.FY_BASE_OBJECT
					+ ";");
			var ret = _allocateArray(clazz, _toEnqueue.length);
			for (var i = 0; i < _toEnqueue.length; i++) {
				_putArrayInt(ret, i, _toEnqueue[i]);
			}
			// console.log("#GC Get " + _toEnqueue.length
			// + " references to enqueue");
			_toEnqueue.length = 0;
			return ret;
		} else {
			return 0;
		}
	};
	this.getReferencesToEnqueue = _getReferencesToEnqueue;

	/**
	 * BOOKMARK_HEAP_OPERATION_ARRAY
	 * 
	 * 
	 * 
	 * 
	 * 
	 * 
	 * 
	 */

	/**
	 * Get array's length
	 * 
	 * @param handle
	 *            handle of the array
	 */
	var _arrayLength = function(handle) {
		if (handle === 0) {
			throw new FyException(FyConst.FY_EXCEPTION_NPT, "");
		}
		return _getObjectMultiUsageData(handle);
	};
	this.arrayLength = _arrayLength;

	var _arrayPos = function(handle) {
		return _heap[handle] + OBJ_META_SIZE;
	};
	this.arrayPos = _arrayPos;

	/**
	 * Check whether a index is legal in an array
	 * 
	 * @param {Number}
	 *            handle
	 * @param {Number}
	 *            idx index
	 */
	var _checkLength = function(handle, idx) {
		if (idx < 0 || idx >= _arrayLength(handle)) {
			throw new FyException(FyConst.FY_EXCEPTION_IOOB, idx + "/"
					+ _arrayLength(handle));
		}
	};
	/**
	 * @param {Number}
	 *            handle
	 * @param {Number}
	 *            index
	 * @param {Number}pos
	 */
	var _getArrayRaw32ToHeap = function(handle, index, pos) {
		_checkLength(handle, index);
		// console.log("#" + handle + "[" + index + "] = "
		// + _heap[_heap[handle] + OBJ_META_SIZE + index] + " => " + pos);
		_heap[pos] = _heap[_heap[handle] + OBJ_META_SIZE + index];
	};
	this.getArrayRaw32ToHeap = _getArrayRaw32ToHeap;

	/**
	 * @param {Number}
	 *            handle
	 * @param {Number}
	 *            index
	 * @param {Number}pos
	 */
	var _getArrayRaw16ToHeap = function(handle, index, pos) {
		_checkLength(handle, index);
		_heap[pos] = _heap16[((_heap[handle] + OBJ_META_SIZE) << 1) + index];
	};
	this.getArrayRaw16ToHeap = _getArrayRaw16ToHeap;

	/**
	 * @param {Number}
	 *            handle
	 * @param {Number}
	 *            index
	 * @param {Number}pos
	 */
	var _getArrayRaw8ToHeap = function(handle, index, pos) {
		_checkLength(handle, index);
		_heap[pos] = _heap8[((_heap[handle] + OBJ_META_SIZE) << 2) + index];
	};
	this.getArrayRaw8ToHeap = _getArrayRaw8ToHeap;

	/**
	 * @param {Number}
	 *            handle
	 * @param {Number}
	 *            index
	 * @param {Number}pos
	 */
	var _getArrayRaw64ToHeap = function(handle, index, pos) {
		_checkLength(handle, index);
		_heap[pos] = _heap[_heap[handle] + OBJ_META_SIZE + (index << 1)];
		_heap[pos] = _heap[_heap[handle] + OBJ_META_SIZE + (index << 1) + 1];
	};
	this.getArrayRaw64ToHeap = _getArrayRaw64ToHeap;

	var _getArrayBoolean = function(handle, index) {
		_checkLength(handle, index);
		return _heap8[((_heap[handle] + OBJ_META_SIZE) << 2) + index] ? true
				: false;
	};
	this.getArrayBoolean = _getArrayBoolean;

	var _getArrayByte = function(handle, index) {
		_checkLength(handle, index);
		return _heap8[((_heap[handle] + OBJ_META_SIZE) << 2) + index];
	};
	this.getArrayByte = _getArrayByte;

	var _getArrayShort = function(handle, index) {
		_checkLength(handle, index);
		return _heap16[((_heap[handle] + OBJ_META_SIZE) << 1) + index];
	};
	this.getArrayShort = _getArrayShort;

	var _getArrayChar = function(handle, index) {
		_checkLength(handle, index);
		return _heap16[((_heap[handle] + OBJ_META_SIZE) << 1) + index] & 0xffff;
	};
	this.getArrayChar = _getArrayChar;

	var _getArrayInt = function(handle, index) {
		_checkLength(handle, index);
		return _heap[_heap[handle] + OBJ_META_SIZE + index];
	};
	this.getArrayInt = _getArrayInt;

	var _getArrayFloat = function(handle, index) {
		_checkLength(handle, index);
		return _heapFloat[_heap[handle] + OBJ_META_SIZE + index];
	};
	this.getArrayFloat = _getArrayFloat;

	var _getArrayLongTo = function(handle, index, tarray, tindex) {
		_checkLength(handle, index);
		tarray[tindex] = _heap[_heap[handle] + OBJ_META_SIZE + (index << 1)];
		tarray[tindex + 1] = _heap[_heap[handle] + OBJ_META_SIZE + (index << 1)
				+ 1];
		return tarray;
	};
	this.getArrayLongTo = _getArrayLongTo;

	var _getArrayDouble = function(handle, index) {
		_checkLength(handle, index);
		return FyPortable.ieee64ToDouble(_heap, _heap[handle] + OBJ_META_SIZE
				+ (index << 1));
	};
	this.getArrayDouble = _getArrayDouble;

	var _putArrayRaw32FromHeap = function(handle, index, pos) {
		_checkLength(handle, index);
		// console.log("#" + handle + "[" + index + "] <= " + pos + " = "
		// + _heap[pos]);
		_heap[_heap[handle] + OBJ_META_SIZE + index] = _heap[pos];
	};
	this.putArrayRaw32FromHeap = _putArrayRaw32FromHeap;

	var _putArrayRaw16FromHeap = function(handle, index, pos) {
		_checkLength(handle, index);
		_heap16[((_heap[handle] + OBJ_META_SIZE) << 1) + index] = _heap[pos];
	};
	this.putArrayRaw16FromHeap = _putArrayRaw16FromHeap;

	var _putArrayRaw8FromHeap = function(handle, index, pos) {
		_checkLength(handle, index);
		_heap8[((_heap[handle] + OBJ_META_SIZE) << 2) + index] = _heap[pos];
	};
	this.putArrayRaw8FromHeap = _putArrayRaw8FromHeap;

	var _putArrayRaw64FromHeap = function(handle, index, pos) {
		_checkLength(handle, index);
		_heap[_heap[handle] + OBJ_META_SIZE + (index << 1)] = _heap[pos];
		_heap[_heap[handle] + OBJ_META_SIZE + (index << 1) + 1] = _heap[pos];
	};
	this.putArrayRaw64FromHeap = _putArrayRaw64FromHeap;

	var _putArrayBoolean = function(handle, index, value) {
		_checkLength(handle, index);
		_heap8[((_heap[handle] + OBJ_META_SIZE) << 2) + index] = value | 0;
	};
	this.putArrayBoolean = _putArrayBoolean;

	var _putArrayByte = function(handle, index, value) {
		_checkLength(handle, index);
		_heap8[((_heap[handle] + OBJ_META_SIZE) << 2) + index] = value | 0;
	};
	this.putArrayByte = _putArrayByte;

	var _putArrayShort = function(handle, index, value) {
		_checkLength(handle, index);
		_heap16[((_heap[handle] + OBJ_META_SIZE) << 1) + index] = value;
	};
	this.putArrayShort = _putArrayShort;

	var _putArrayChar = function(handle, index, value) {
		_checkLength(handle, index);
		_heap16[((_heap[handle] + OBJ_META_SIZE) << 1) + index] = value & 0xffff;
	};
	this.putArrayChar = _putArrayChar;

	var _putArrayInt = function(handle, index, value) {
		_checkLength(handle, index);
		_heap[_heap[handle] + OBJ_META_SIZE + index] = value;
	};
	this.putArrayInt = _putArrayInt;

	var _putArrayFloat = function(handle, index, value) {
		_checkLength(handle, index);
		_heapFloat[_heap[handle] + OBJ_META_SIZE + index] = value;
	};
	this.putArrayFloat = _putArrayFloat;

	var _putArrayLongFrom = function(handle, index, varray, vindex) {
		_checkLength(handle, index);
		_heap[_heap[handle] + OBJ_META_SIZE + (index << 1)] = varray[vindex];
		_heap[_heap[handle] + OBJ_META_SIZE + (index << 1) + 1] = varray[vindex + 1];
	};
	this.putArrayLongFrom = _putArrayLongFrom;

	var _putArrayDouble = function(handle, index, value) {
		_checkLength(handle, index);
		FyPortable.doubleToIeee64(value, _heap, _heap[handle] + OBJ_META_SIZE
				+ (index << 1));
	};
	this.putArrayDouble = _putArrayDouble;

	/**
	 * BOOKMARK_HEAP_OPERATION_OBJECT
	 * 
	 * 
	 * 
	 * 
	 * 
	 * 
	 * 
	 */
	/**
	 * 
	 */
	var _getFieldRaw32To = function(handle, posAbs, pos) {
		if (handle === 0) {
			throw new FyException(FyConst.FY_EXCEPTION_NPT, "");
		}
		_heap[pos] = _heap[_heap[handle] + OBJ_META_SIZE + posAbs];
	};
	this.getFieldRaw32To = _getFieldRaw32To;

	var _getFieldRaw64To = function(handle, posAbs, pos) {
		if (handle === 0) {
			throw new FyException(FyConst.FY_EXCEPTION_NPT, "");
		}
		_heap[pos] = _heap[_heap[handle] + OBJ_META_SIZE + posAbs];
		_heap[pos + 1] = _heap[_heap[handle] + OBJ_META_SIZE + posAbs + 1];
	};
	this.getFieldRaw64To = _getFieldRaw64To;

	var _getFieldBoolean = function(handle, posAbs) {
		if (handle === 0) {
			throw new FyException(FyConst.FY_EXCEPTION_NPT, "");
		}
		return _heap[_heap[handle] + OBJ_META_SIZE + posAbs] ? true : false;
	};
	this.getFieldBoolean = _getFieldBoolean;

	var _getFieldByte = function(handle, posAbs) {
		if (handle === 0) {
			throw new FyException(FyConst.FY_EXCEPTION_NPT, "");
		}
		var ret = _heap[_heap[handle] + OBJ_META_SIZE + posAbs] & 0xff;
		return (ret >>> 7) ? ((ret - 256) | 0) : ret;
	};
	this.getFieldByte = _getFieldByte;

	var _getFieldShort = function(handle, posAbs) {
		if (handle === 0) {
			throw new FyException(FyConst.FY_EXCEPTION_NPT, "");
		}
		var ret = _heap[_heap[handle] + OBJ_META_SIZE + posAbs] & 0xffff;
		return (ret >>> 15) ? ((ret - 65536) | 0) : ret;
	};
	this.getFieldShort = _getFieldShort;

	var _getFieldChar = function(handle, posAbs) {
		if (handle === 0) {
			throw new FyException(FyConst.FY_EXCEPTION_NPT, "");
		}
		return _heap[_heap[handle] + OBJ_META_SIZE + posAbs] & 0xffff;
	};
	this.getFieldChar = _getFieldChar;

	var _getFieldInt = function(handle, posAbs) {
		if (handle === 0) {
			throw new FyException(FyConst.FY_EXCEPTION_NPT, "");
		}
		return _heap[_heap[handle] + OBJ_META_SIZE + posAbs];
	};
	this.getFieldInt = _getFieldInt;

	var _getFieldFloat = function(handle, posAbs) {
		if (handle === 0) {
			throw new FyException(FyConst.FY_EXCEPTION_NPT, "");
		}
		return _heapFloat[_heap[handle] + OBJ_META_SIZE + posAbs];
	};
	this.getFieldFloat = _getFieldFloat;

	var _getFieldLongTo = function(handle, posAbs, tarray, tindex) {
		if (handle === 0) {
			throw new FyException(FyConst.FY_EXCEPTION_NPT, "");
		}
		tarray[tindex] = _heap[_heap[handle] + OBJ_META_SIZE + posAbs];
		tarray[tindex + 1] = _heap[_heap[handle] + OBJ_META_SIZE + posAbs + 1];
		return tarray;
	};
	this.getFieldLongTo = _getFieldLongTo;

	var _getFieldDouble = function(handle, posAbs) {
		if (handle === 0) {
			throw new FyException(FyConst.FY_EXCEPTION_NPT, "");
		}
		return FyPortable.ieee64ToDouble(_heap, _heap[handle] + OBJ_META_SIZE
				+ posAbs);
	};
	this.getFieldDouble = _getFieldDouble;

	var _putFieldRaw32From = function(handle, posAbs, pos) {
		if (handle === 0) {
			throw new FyException(FyConst.FY_EXCEPTION_NPT, "");
		}
		_heap[_heap[handle] + OBJ_META_SIZE + posAbs] = _heap[pos];
	};
	this.putFieldRaw32From = _putFieldRaw32From;

	var _putFieldRaw64From = function(handle, posAbs, pos) {
		if (handle === 0) {
			throw new FyException(FyConst.FY_EXCEPTION_NPT, "");
		}
		_heap[_heap[handle] + OBJ_META_SIZE + posAbs] = _heap[pos];
		_heap[_heap[handle] + OBJ_META_SIZE + posAbs + 1] = _heap[pos + 1];
	};
	this.putFieldRaw64From = _putFieldRaw64From;

	var _putFieldBoolean = function(handle, posAbs, value) {
		if (handle === 0) {
			throw new FyException(FyConst.FY_EXCEPTION_NPT, "");
		}
		_heap[_heap[handle] + OBJ_META_SIZE + posAbs] = value | 0;
	};
	this.putFieldBoolean = _putFieldBoolean;

	var _putFieldByte = function(handle, posAbs, value) {
		if (handle === 0) {
			throw new FyException(FyConst.FY_EXCEPTION_NPT, "");
		}
		_heap[_heap[handle] + OBJ_META_SIZE + posAbs] = value & 0xff;
	};
	this.putFieldByte = _putFieldByte;

	var _putFieldShort = function(handle, posAbs, value) {
		if (handle === 0) {
			throw new FyException(FyConst.FY_EXCEPTION_NPT, "");
		}
		_heap[_heap[handle] + OBJ_META_SIZE + posAbs] = value & 0xffff;
	};
	this.putFieldShort = _putFieldShort;

	var _putFieldChar = function(handle, posAbs, value) {
		if (handle === 0) {
			throw new FyException(FyConst.FY_EXCEPTION_NPT, "");
		}
		_heap[_heap[handle] + OBJ_META_SIZE + posAbs] = value & 0xffff;
	};
	this.putFieldChar = _putFieldChar;

	var _putFieldInt = function(handle, posAbs, value) {
		if (handle === 0) {
			throw new FyException(FyConst.FY_EXCEPTION_NPT, "");
		}
		_heap[_heap[handle] + OBJ_META_SIZE + posAbs] = value;
	};
	this.putFieldInt = _putFieldInt;

	var _putFieldFloat = function(handle, posAbs, value) {
		if (handle === 0) {
			throw new FyException(FyConst.FY_EXCEPTION_NPT, "");
		}
		_heapFloat[_heap[handle] + OBJ_META_SIZE + posAbs] = value;
	};
	this.putFieldFloat = _putFieldFloat;

	var _putFieldLongFrom = function(handle, posAbs, tarray, tindex) {
		if (handle === 0) {
			throw new FyException(FyConst.FY_EXCEPTION_NPT, "");
		}
		_heap[_heap[handle] + OBJ_META_SIZE + posAbs] = tarray[tindex];
		_heap[_heap[handle] + OBJ_META_SIZE + posAbs + 1] = tarray[tindex + 1];
	};
	this.putFieldLongFrom = _putFieldLongFrom;

	var _putFieldDouble = function(handle, posAbs, value) {
		if (handle === 0) {
			throw new FyException(FyConst.FY_EXCEPTION_NPT, "");
		}
		FyPortable.doubleToIeee64(value, _heap, _heap[handle] + OBJ_META_SIZE
				+ posAbs);
	};
	this.putFieldDouble = _putFieldDouble;

	/**
	 * BOOKMARK_STATIC
	 * 
	 * 
	 * 
	 * 
	 * 
	 * 
	 */

	var _getStaticRaw32To = function(clazz, posAbs, pos) {
		_heap[pos] = _heap[clazz.staticPos + posAbs];
	};
	this.getStaticRaw32To = _getStaticRaw32To;

	var _getStaticRaw64To = function(clazz, posAbs, pos) {
		_heap[pos] = _heap[clazz.staticPos + posAbs];
		_heap[pos + 1] = _heap[clazz.staticPos + posAbs + 1];
	};
	this.getStaticRaw64To = _getStaticRaw64To;

	var _getStaticBoolean = function(clazz, posAbs) {
		return _heap[clazz.staticPos + posAbs] ? true : false;
	};
	this.getStaticBoolean = _getStaticBoolean;

	var _getStaticByte = function(clazz, posAbs) {
		var ret = _heap[clazz.staticPos + posAbs] & 0xff;
		return (ret >>> 7) ? ((ret - 256) | 0) : ret;
	};
	this.getStaticByte = _getStaticByte;

	var _getStaticShort = function(clazz, posAbs) {
		var ret = _heap[clazz.staticPos + posAbs] & 0xffff;
		return (ret >>> 15) ? ((ret - 65536) | 0) : ret;
	};
	this.getStaticShort = _getStaticShort;

	var _getStaticChar = function(clazz, posAbs) {
		return _heap[clazz.staticPos + posAbs] & 0xffff;
	};
	this.getStaticChar = _getStaticChar;

	var _getStaticInt = function(clazz, posAbs) {
		return _heap[clazz.staticPos + posAbs];
	};
	this.getStaticInt = _getStaticInt;

	var _getStaticFloat = function(clazz, posAbs) {
		return _heapFloat[clazz.staticPos + posAbs];
	};
	this.getStaticFloat = _getStaticFloat;

	var _getStaticLongTo = function(clazz, posAbs, tarray, tindex) {
		tarray[tindex] = _heap[clazz.staticPos + posAbs];
		tarray[tindex + 1] = _heap[clazz.staticPos + posAbs + 1];
		return tarray;
	};
	this.getStaticLongTo = _getStaticLongTo;

	var _getStaticDouble = function(clazz, posAbs) {
		return FyPortable.ieee64ToDouble(_heap, clazz.staticPos + posAbs);
	};
	this.getStaticDouble = _getStaticDouble;

	var _putStaticRaw32From = function(clazz, posAbs, pos) {
		// console.log("#PUTSTATIC " + clazz.name + "[" + posAbs + "] <= "
		// + _heap[pos]);
		_heap[clazz.staticPos + posAbs] = _heap[pos];
	};
	this.putStaticRaw32From = _putStaticRaw32From;

	var _putStaticRaw64From = function(clazz, posAbs, pos) {
		_heap[clazz.staticPos + posAbs] = _heap[pos];
		_heap[clazz.staticPos + posAbs + 1] = _heap[pos + 1];
	};
	this.putStaticRaw64From = _putStaticRaw64From;

	var _putStaticBoolean = function(clazz, posAbs, value) {
		posAbs = posAbs | 0;
		_heap[clazz.staticPos + posAbs] = value ? 1 : 0;
	};
	this.putStaticBoolean = _putStaticBoolean;

	var _putStaticByte = function(clazz, posAbs, value) {
		posAbs = posAbs | 0;
		_heap[clazz.staticPos + posAbs] = value & 0xff;
	};
	this.putStaticByte = _putStaticByte;

	var _putStaticChar = function(clazz, posAbs, value) {
		posAbs = posAbs | 0;
		_heap[clazz.staticPos + posAbs] = value & 0xffff;
	};
	this.putStaticChar = _putStaticChar;

	var _putStaticShort = function(clazz, posAbs, value) {
		posAbs = posAbs | 0;
		_heap[clazz.staticPos + posAbs] = value & 0xffff;
	};
	this.putStaticShort = _putStaticShort;

	var _putStaticInt = function(clazz, posAbs, value) {
		posAbs = posAbs | 0;
		_heap[clazz.staticPos + posAbs] = value;
	};
	this.putStaticInt = _putStaticInt;

	var _putStaticFloat = function(clazz, posAbs, value) {
		posAbs = posAbs | 0;
		_heapFloat[clazz.staticPos + posAbs] = value;
	};
	this.putStaticFloat = _putStaticFloat;

	var _putStaticLongFrom = function(clazz, posAbs, varray, vindex) {
		_heap[clazz.staticPos + posAbs] = varray[vindex];
		_heap[clazz.staticPos + posAbs + 1] = varray[vindex + 1];
	};
	this.putStaticLongFrom = _putStaticLongFrom;

	var _putStaticDouble = function(clazz, posAbs, value) {
		FyPortable.doubleToIeee64(value, _heap, clazz.staticPos + posAbs);
	};
	this.putStaticDouble = _putStaticDouble;

	/**
	 * BOOKMARK_STRING
	 * 
	 * 
	 * 
	 * 
	 */

	/**
	 * Get a javascript String from java String
	 * 
	 * @param {Number}
	 *            handle object handle
	 * @returns {String}
	 */
	var _getString = function(handle) {
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
		var ret;

		if (handle === 0) {
			throw new FyException(FyConst.FY_EXCEPTION_NPT, "");
		}
		if (_context.lookupClass(FyConst.FY_BASE_STRING) === undefined) {
			throw new FyException(FyConst.FY_EXCEPTION_CLASSNOTFOUND,
					FyConst.FY_BASE_STRING);
		}
		valueField = _context.getField(FyConst.stringValue);
		offsetField = _context.getField(FyConst.stringOffset);
		countField = _context.getField(FyConst.stringCount);

		ofs = _getFieldInt(handle, offsetField.posAbs);
		len = _getFieldInt(handle, countField.posAbs);
		cah = _getFieldInt(handle, valueField.posAbs);
		/**
		 * <code> In modern browser string appender is faster
		ret = new Array(len);
		for (i = 0; i < len; i++) {
			ret[i] = String.fromCharCode(_getArrayChar(cah, i + ofs) & 0xffff);
		}
		return ret.join("").toString();
		 */
		ret = "";
		for (i = 0; i < len; i++) {
			ret += String.fromCharCode(_getArrayChar(cah, i + ofs) & 0xffff);
		}
		return ret;
	};
	this.getString = _getString;

	/**
	 * @param {Number}
	 *            stringHandle
	 * @param {String}
	 *            str
	 * @returns {Number} handle
	 */
	var _fillString = function(stringHandle, str) {
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

		if (_context.lookupClass(FyConst.FY_BASE_STRING) === undefined) {
			throw new FyException(FyConst.FY_EXCEPTION_CLASSNOTFOUND,
					FyConst.FY_BASE_STRING);
		}
		valueField = _context.getField(FyConst.stringValue);
		offsetField = _context.getField(FyConst.stringOffset);
		countField = _context.getField(FyConst.stringCount);

		cah = _allocateArray(_context.lookupClass("[C"), str.length);

		_putFieldInt(stringHandle, valueField.posAbs, cah);
		_putFieldInt(stringHandle, offsetField.posAbs, 0);
		_putFieldInt(stringHandle, countField.posAbs, str.length);

		for (i = 0; i < str.length; i++) {
			_putArrayChar(cah, i, str.charCodeAt(i) & 0xffff);
		}
		return stringHandle;
	};
	this.fillString = _fillString;

	/**
	 * 
	 * @param {String}
	 *            str
	 * @returns {Number} handle
	 */
	var _literal = function(str) {
		var handle;
		if (_literials.hasOwnProperty(str)) {
			handle = _literials[str];
		} else {
			handle = _allocate(_context.lookupClass(FyConst.FY_BASE_STRING));
			_fillString(handle, str);
			_literials[str] = handle;
		}
		return handle;
	};
	this.literal = _literal;

	var _literalWithConstant = function(constant) {
		var ret = constant.value;
		if (ret === undefined) {
			ret = constant.value = _literal(constant.string);
		}
		return ret;
	};
	this.literalWithConstant = _literalWithConstant;

	var _putFieldString = function(handle, pos, str) {
		var strHandle = _allocate(_context.lookupClass(FyConst.FY_BASE_STRING));
		_putFieldInt(handle, pos, strHandle);
		_fillString(strHandle, str);
	};
	this.putFieldString = _putFieldString;

	/**
	 * BOOKMARK_COPYING
	 * 
	 * 
	 * 
	 * 
	 */
	/**
	 * 
	 */

	var _memcpy8 = function(from, to, len) {
		// console.log("#memcpy8 from="+from+" to="+to+" len="+len);
		for (var i = 0; i < len; i++) {
			_heap8[to + i] = _heap8[from + i];
		}
	};
	var _memcpy16 = function(from, to, len) {
		// console.log("#memcpy16 from="+from+" to="+to+" len="+len);
		for (var i = 0; i < len; i++) {
			_heap16[to + i] = _heap16[from + i];
		}
	};
	var _memcpy32 = function(from, to, len) {
		// console.log("#memcpy32 from="+from+" to="+to+" len="+len);
		for (var i = 0; i < len; i++) {
			_heap[to + i] = _heap[from + i];
		}
	};
	this.memcpy32 = _memcpy32;
	/**
	 * 
	 */
	var _arrayCopy = function(sHandle, sPos, dHandle, dPos, len) {
		/**
		 * @returns {FyClass}
		 */
		var sClass = _getObjectClass(sHandle);
		/**
		 * @returns {FyClass}
		 */
		var dClass = _getObjectClass(dHandle);
		var i = 0;
		if (sClass.type != FyConst.TYPE_ARRAY) {
			throw new FyException(FyConst.FY_EXCEPTION_STORE,
					"src is not array");
		}
		if (dClass.type != FyConst.TYPE_ARRAY) {
			throw new FyException(FyConst.FY_EXCEPTION_STORE,
					"dest is not array");
		}
		if (!_context.classLoader.canCast(sClass.contentClass,
				dClass.contentClass)) {
			if (!_context.classLoader.canCast(dClass.contentClass,
					sClass.contentClass)) {
				throw new FyException(FyConst.FY_EXCEPTION_STORE, "Can't cast "
						+ dClass.contentClass.name + " to "
						+ sClass.contentClass.name);
			}
			// TODO
			_context.log(0, "TODO: enforce System.arrayCopy's type check");
			// throw new FyException(FyConst.FY_EXCEPTION_STORE, "Can't cast "
			// + sClass.contentClass.name + " to "
			// + dClass.contentClass.name);
		}
		if (sPos < 0 || dPos < 0 || ((sPos + len) > _arrayLength(sHandle))
				|| ((dPos + len) > _arrayLength(dHandle))) {
			throw new FyException(FyConst.FY_EXCEPTION_AIOOB, sPos + "/"
					+ _arrayLength(sHandle) + " => " + dPos + "/"
					+ _arrayLength(dHandle) + " len=" + len);
		}
		switch (sClass.name.charCodeAt(1) | 0) {
		// 8bit
		case 90/* FyConst.Z */:
		case 66/* FyConst.B */:
			_memcpy8(((_heap[sHandle] + OBJ_META_SIZE) << 2) + sPos,
					((_heap[dHandle] + OBJ_META_SIZE) << 2) + dPos, len);
			break;
		// 16bit
		case 83/* FyConst.S */:
		case 67/* FyConst.C */:
			_memcpy16(((_heap[sHandle] + OBJ_META_SIZE) << 1) + sPos,
					((_heap[dHandle] + OBJ_META_SIZE) << 1) + dPos, len);
			break;
		// 32bit
		case 73/* FyConst.I */:
		case 70/* FyConst.F */:
		case 76/* FyConst.L */:
		case 91/* FyConst.ARR */:
			_memcpy32(_heap[sHandle] + OBJ_META_SIZE + sPos, _heap[dHandle]
					+ OBJ_META_SIZE + dPos, len);
			break;
		// 64bit
		case 68/* FyConst.D */:
		case 74/* FyConst.J */:
			_memcpy32(_heap[sHandle] + OBJ_META_SIZE + (sPos << 1),
					_heap[dHandle] + OBJ_META_SIZE + (dPos << 1), len << 1);
			break;
		}
	};
	this.arrayCopy = _arrayCopy;

	var _clone = function(src) {
		/**
		 * @returns {FyClass}
		 */
		var clazz = _getObjectClass(src);
		/**
		 * @returns {Number}
		 */
		var ret = 0;
		var len = 0;
		var i = 0;
		var max = 0;
		if (clazz.type === FyConst.TYPE_OBJECT) {
			ret = _allocate(clazz);
			max = clazz.sizeAbs;
			for (i = 0; i < max; i++) {
				_heap[_heap[ret] + OBJ_META_SIZE + i] = _heap[_heap[src]
						+ OBJ_META_SIZE + i];
			}
		} else if (clazz.type === FyConst.TYPE_ARRAY) {
			len = _arrayLength(src);
			ret = _allocateArray(clazz, len);
			_arrayCopy(src, 0, ret, 0, len);
		} else {
			throw new FyException(undefined, "Illegal object type "
					+ clazz.type + " for class to clone: " + clazz.name);
		}
		return ret;
	};
	this.clone = _clone;

	/**
	 * BOOKMARK_WRAP
	 * 
	 * 
	 * 
	 * 
	 */
	/**
	 * 
	 * @param {Number}
	 *            handle
	 * @returns {Number}
	 */
	var _unwrapBooleanTo = function(handle, pos) {
		var clazz = _context.lookupClass(FyConst.FY_BASE_BOOLEAN);
		var field = _context.getField(FyConst.FY_VALUE_BOOLEAN);
		_context.lookupClass(FyConst.FY_PRIM_BOOLEAN);
		if (_getObjectClass(handle) !== clazz) {
			throw new FyException(FyConst.FY_EXCEPTION_ARGU,
					"Can't unwrap handle=" + handle + " as boolean");
		}
		_getFieldRaw32To(handle, field.posAbs, pos);
	};
	this.unwrapBooleanTo = _unwrapBooleanTo;

	/**
	 * @param {Number}
	 *            value
	 * @returns {Number}
	 */
	var _wrapBooleanFrom = function(pos) {
		var clazz = _context.lookupClass(FyConst.FY_BASE_BOOLEAN);
		var field = _context.getField(FyConst.FY_VALUE_BOOLEAN);
		var ret = _allocate(clazz);
		_putFieldRaw32From(ret, field.posAbs, pos);
		return ret;
	};
	this.wrapBooleanFrom = _wrapBooleanFrom;

	/**
	 * 
	 * @param {Number}
	 *            handle
	 * @returns {Number}
	 */
	var _unwrapByteTo = function(handle, pos) {
		var clazz = _context.lookupClass(FyConst.FY_BASE_BYTE);
		var field = _context.getField(FyConst.FY_VALUE_BYTE);
		context.lookupClass(FyConst.FY_PRIM_BYTE);
		if (_getObjectClass(handle) !== clazz) {
			throw new FyException(FyConst.FY_EXCEPTION_ARGU,
					"Can't unwrap handle=" + handle + " as byte");
		}
		_getFieldRaw32To(handle, field.posAbs, pos);
	};
	this.unwrapByteTo = _unwrapByteTo;

	/**
	 * @param {Number}
	 *            value
	 * @returns {Number}
	 */
	var _wrapByteFrom = function(pos) {
		var clazz = _context.lookupClass(FyConst.FY_BASE_BYTE);
		var field = _context.getField(FyConst.FY_VALUE_BYTE);
		var ret = _allocate(clazz);
		_putFieldRaw32From(ret, field.posAbs, pos);
	};
	this.wrapByteFrom = _wrapByteFrom;

	/**
	 * 
	 * @param {Number}
	 *            handle
	 * @returns {Number}
	 */
	var _unwrapShortTo = function(handle, pos) {
		var clazz = _context.lookupClass(FyConst.FY_BASE_SHORT);
		var field = _context.getField(FyConst.FY_VALUE_SHORT);
		_context.lookupClass(FyConst.FY_PRIM_SHORT);
		if (_getObjectClass(handle) !== clazz) {
			throw new FyException(FyConst.FY_EXCEPTION_ARGU,
					"Can't unwrap handle=" + handle + " as short");
		}
		_getFieldRaw32To(handle, field.posAbs, pos);
	};
	this.unwrapShortTo = _unwrapShortTo;

	/**
	 * @param {Number}
	 *            value
	 * @returns {Number}
	 */
	var _wrapShortFrom = function(pos) {
		var clazz = _context.lookupClass(FyConst.FY_BASE_SHORT);
		var field = _context.getField(FyConst.FY_VALUE_SHORT);
		var ret = _allocate(clazz);
		_putFieldRaw32From(ret, field.posAbs, pos);
		return ret;
	};
	this.wrapShortFrom = _wrapShortFrom;

	/**
	 * 
	 * @param {Number}
	 *            handle
	 * @returns {Number}
	 */
	var _unwrapCharTo = function(handle, pos) {
		var clazz = _context.lookupClass(FyConst.FY_BASE_CHAR);
		var field = _context.getField(FyConst.FY_VALUE_CHAR);
		_context.lookupClass(FyConst.FY_PRIM_CHAR);
		if (_getObjectClass(handle) !== clazz) {
			throw new FyException(FyConst.FY_EXCEPTION_ARGU,
					"Can't unwrap handle=" + handle + " as char");
		}
		_getFieldRaw32To(handle, field.posAbs, pos);
	};
	this.unwrapCharTo = _unwrapCharTo;

	/**
	 * @param {Number}
	 *            value
	 * @returns {Number}
	 */
	var _wrapCharFrom = function(pos) {
		var clazz = _context.lookupClass(FyConst.FY_BASE_CHAR);
		var field = _context.getField(FyConst.FY_VALUE_CHAR);
		var ret = _allocate(clazz);
		_putFieldRaw32From(ret, field.posAbs, pos);
		return ret;
	};
	this.wrapCharFrom = _wrapCharFrom;

	/**
	 * 
	 * @param {Number}
	 *            handle
	 * @returns {Number}
	 */
	var _unwrapIntTo = function(handle, pos) {
		var clazz = _context.lookupClass(FyConst.FY_BASE_INT);
		var field = _context.getField(FyConst.FY_VALUE_INTEGER);
		_context.lookupClass(FyConst.FY_PRIM_INT);
		if (_getObjectClass(handle) !== clazz) {
			throw new FyException(FyConst.FY_EXCEPTION_ARGU,
					"Can't unwrap handle=" + handle + " as int");
		}
		_getFieldRaw32To(handle, field.posAbs, pos);
	};
	this.unwrapIntTo = _unwrapIntTo;

	/**
	 * @param {Number}
	 *            value
	 * @returns {Number}
	 */
	var _wrapIntFrom = function(pos) {
		var clazz = _context.lookupClass(FyConst.FY_BASE_INT);
		var field = _context.getField(FyConst.FY_VALUE_INTEGER);
		var ret = _allocate(clazz);
		_putFieldRaw32From(ret, field.posAbs, pos);
		return ret;
	};
	this.wrapIntFrom = _wrapIntFrom;

	/**
	 * 
	 * @param {Number}
	 *            handle
	 * @returns {Number}
	 */
	var _unwrapFloatTo = function(handle, pos) {
		var clazz = _context.lookupClass(FyConst.FY_BASE_FLOAT);
		var field = _context.getField(FyConst.FY_VALUE_FLOAT);
		_context.lookupClass(FyConst.FY_PRIM_FLOAT);
		if (_getObjectClass(handle) !== clazz) {
			throw new FyException(FyConst.FY_EXCEPTION_ARGU,
					"Can't unwrap handle=" + handle + " as float");
		}
		_getFieldRaw32To(handle, field.posAbs, pos);
	};
	this.unwrapFloatTo = _unwrapFloatTo;

	/**
	 * @param {Number}
	 *            value
	 * @returns {Number}
	 */
	var _wrapFloatFrom = function(pos) {
		var clazz = _context.lookupClass(FyConst.FY_BASE_FLOAT);
		var field = _context.getField(FyConst.FY_VALUE_FLOAT);
		var ret = _allocate(clazz);
		_putFieldRaw32From(ret, field.posAbs, pos);
		return ret;
	};
	this.wrapFloatFrom = _wrapFloatFrom;

	/**
	 * 
	 * @param {Number}
	 *            handle
	 * @returns {Number}
	 */
	var _unwrapLongTo = function(handle, pos) {
		var clazz = _context.lookupClass(FyConst.FY_BASE_LONG);
		var field = _context.getField(FyConst.FY_VALUE_LONG);
		_context.lookupClass(FyConst.FY_PRIM_LONG);
		if (_getObjectClass(handle) !== clazz) {
			throw new FyException(FyConst.FY_EXCEPTION_ARGU,
					"Can't unwrap handle=" + handle + " as long");
		}
		_getFieldRaw64To(handle, field.posAbs, pos);
	};
	this.unwrapLongTo = _unwrapLongTo;

	/**
	 * @param {Number}
	 *            value
	 * @returns {Number}
	 */
	var _wrapLongFrom = function(pos) {
		var clazz = _context.lookupClass(FyConst.FY_BASE_LONG);
		var field = _context.getField(FyConst.FY_VALUE_LONG);
		var ret = _allocate(clazz);
		_putFieldRaw64From(ret, field.posAbs, pos);
		return ret;
	};
	this.wrapLongFrom = _wrapLongFrom;

	/**
	 * 
	 * @param {Number}
	 *            handle
	 * @returns {Number}
	 */
	var _unwrapDoubleTo = function(handle, pos) {
		var clazz = _context.lookupClass(FyConst.FY_BASE_DOUBLE);
		var field = _context.getField(FyConst.FY_VALUE_DOUBLE);
		_context.lookupClass(FyConst.FY_PRIM_DOUBLE);
		if (_getObjectClass(handle) !== clazz) {
			throw new FyException(FyConst.FY_EXCEPTION_ARGU,
					"Can't unwrap handle=" + handle + " as double");
		}

		_getFieldRaw64To(handle, field.posAbs, pos);
	};
	this.unwrapDoubleTo = _unwrapDoubleTo;

	/**
	 * @param {Number}
	 *            value
	 * @returns {Number}
	 */
	var _wrapDoubleFrom = function(pos) {
		var clazz = _context.lookupClass(FyConst.FY_BASE_DOUBLE);
		var field = _context.getField(FyConst.FY_VALUE_DOUBLE);
		var ret = _allocate(clazz);
		_putFieldRaw64From(ret, field.posAbs, pos);
		return ret;
	};
	this.wrapDoubleFrom = _wrapDoubleFrom;
	Object.preventExtensions(this);
}