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

var FyHeap;
(function() {
	"use strict";
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

	var MAX_OBJECTS = FyConfig.maxObjects | 0;
	var HEAP_SIZE = FyConfig.heapSize;
	var MAX_GEN = 8;
	var EDEN_SIZE = FyConfig.edenSize | 0;
	var COPY_SIZE = FyConfig.copySize | 0;
	/**
	 * We use one ArrayBuffer for all data
	 * 
	 * @param {FyContext}
	 *            context
	 */
	FyHeap = function(context) {
		this.context = context;
		this.OBJ_META_SIZE = OBJ_META_SIZE;
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

		this.toFinalize = [];
		this.protectMode = false;
		this.protectedObjects = [];
		this.literials = {};
		this.literialedObjs = [];
		this.references = [];
		this.toEnqueue = [];
		this.stackPool = [];
		this.nextHandle = 1;
		this.totalObjects = 0;

		var _buffer = new ArrayBuffer(HEAP_SIZE << 2);
		this.heap = new Int32Array(_buffer);
		this.heap8 = new Int8Array(_buffer);
		this.heap16 = new Int16Array(_buffer);
		this.heapFloat = new Float32Array(_buffer);
		this.edenBottom = MAX_OBJECTS | 0;
		this.edenTop = (this.edenBottom + EDEN_SIZE) | 0;
		this.copyBottom = this.edenTop;
		this.copyTop = (this.copyBottom + COPY_SIZE) | 0;
		this.copy2Bottom = this.copyTop;
		this.copy2Top = (this.copy2Bottom + COPY_SIZE) | 0;
		this.oldBottom = this.copy2Top;
		this.heapTop = HEAP_SIZE;

		this.edenPos = this.edenBottom;
		this.copyPos = this.copyBottom;
		this.copy2Pos = this.copy2Bottom;
		this.oldPos = this.oldBottom;

		this.gcInProgress = false;
		this.oldReleasedSize = 0;
		this.marks = new HashMapI(0, 12, 0.75);
		this.from = [];
		Object.preventExtensions(this);
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
	FyHeap.getArraySizeFromLength = function(clazz, length) {
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
	 * @param gced
	 * @returns {Number}
	 */
	FyHeap.prototype.fetchNextHandle = function(gced) {
		var handle = this.nextHandle;
		while (true) {
			if (this.heap[handle] === 0) {
				break;
			}
			handle++;
			if (handle >= MAX_OBJECTS) {
				handle = 1;
			}
			if (handle === this.nextHandle) {
				if (gced) {
					throw new FyException(undefined, "Out of memory: handles");
				} else {
					return this.fetchNextHandle(true);
				}
			}
		}
		this.nextHandle = handle + 1;
		return handle;
	};

	/**
	 * @param {Number}
	 *            pos
	 * @param {Number}
	 *            size
	 * @param {Number}
	 *            value
	 */
	FyHeap.prototype.memset32 = function(pos, size, value) {
		for (var i = size; i--;) {
			this.heap[pos + i] = value;
		}
	};

	FyHeap.prototype.beginProtect = function() {
		this.protectMode = true;
	};

	FyHeap.prototype.endProtect = function() {
		this.protectMode = 0;
		this.protectedObjects.length = 0;
	};

	FyHeap.prototype.get8 = function(pos) {
		return this.heap8[pos];
	};

	FyHeap.prototype.get16 = function(pos) {
		return this.heap16[pos];
	};

	FyHeap.prototype.get32 = function(pos) {
		return this.heap[pos];
	};

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
	FyHeap.prototype.objectExists = function(handle) {
		return this.heap[handle] > 0 ? 1 : 0;
	};

	/**
	 * @param {Number}
	 *            pos
	 */
	FyHeap.prototype.getOjbectHandleIn = function(pos) {
		pos = pos | 0;
		return this.heap[pos + OBJ_HANDLE];
	};

	FyHeap.prototype.createObject = function(handle, pos) {
		this.heap[handle] = pos;
		this.heap[pos + OBJ_HANDLE] = handle;
	};

	FyHeap.prototype.getObjectClassId = function(handle) {
		return this.heap[this.heap[handle] + OBJ_CLASS_ID];
	};

	FyHeap.prototype.setObjectClassId = function(handle, classId) {
		this.heap[this.heap[handle] + OBJ_CLASS_ID] = classId;
	};

	/**
	 * @returns {FyClass}
	 */
	FyHeap.prototype.getObjectClass = function(handle) {
		return this.context.classes[this.getObjectClassId(handle)];
	};

	/**
	 * @param {Number}
	 *            handle
	 * @param {FyClass}
	 *            clazz;
	 */
	FyHeap.prototype.setObjectClass = function(handle, clazz) {
		this.setObjectClassId(handle, clazz.classId);
	};

	FyHeap.prototype.getObjectFinalizeStatus = function(handle) {
		return this.heap[this.heap[handle] + OBJ_FINALIZE_STATUS];
	};

	FyHeap.prototype.setObjectFinalizeStatus = function(handle, value) {
		this.heap[this.heap[handle] + OBJ_FINALIZE_STATUS] = value;
	};

	FyHeap.prototype.getObjectMultiUsageData = function(handle) {
		return this.heap[this.heap[handle] + OBJ_MULTI_USAGE];
	};

	FyHeap.prototype.setObjectMultiUsageData = function(handle, value) {
		this.heap[this.heap[handle] + OBJ_MULTI_USAGE] = value;
	};

	FyHeap.prototype.getObjectMonitorOwnerId = function(handle) {
		return this.heap[this.heap[handle] + OBJ_MONITOR_OWNER_ID];
	};

	FyHeap.prototype.setObjectMonitorOwnerId = function(handle, value) {
		this.heap[this.heap[handle] + OBJ_MONITOR_OWNER_ID] = value;
	};

	FyHeap.prototype.getObjectMonitorOwnerTimes = function(handle) {
		return this.heap[this.heap[handle] + OBJ_MONITOR_OWNER_TIME];
	};

	FyHeap.prototype.setObjectMonitorOwnerTimes = function(handle, value) {
		this.heap[this.heap[handle] + OBJ_MONITOR_OWNER_TIME] = value;
	};

	FyHeap.prototype.getObjectFinalizeStatus = function(handle) {
		return this.heap[this.heap[handle] + OBJ_FINALIZE_STATUS];
	};

	FyHeap.prototype.setObjectFinalizeStatus = function(handle, value) {
		this.heap[this.heap[handle] + OBJ_FINALIZE_STATUS] = value;
	};

	FyHeap.prototype.getObjectBId = function(handle) {
		return this.heap[this.heap[handle] + OBJ_BID];
	};

	FyHeap.prototype.setObjectBId = function(handle, value) {
		this.heap[this.heap[handle] + OBJ_BID] = value;
	};

	FyHeap.prototype.getObjectGen = function(handle) {
		return this.heap[this.heap[handle] + OBJ_GEN];
	};

	FyHeap.prototype.setObjectGen = function(handle, value) {
		this.heap[this.heap[handle] + OBJ_GEN] = value;
	};

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
	FyHeap.prototype.allocatePerm = function(size, gced) {
		this.heapTop -= size;
		if (this.heapTop < this.oldPos) {
			if (gced) {
				throw new FyException(undefined, "Out of memory: perm");
			} else {
				this.gc(size);
				return this.allocatePerm(size, 1);
			}
		}
		return this.heapTop;
	};

	/**
	 * 
	 * @param {Number}
	 *            size
	 * @param {Number}
	 *            gced
	 * @returns {Number} the address in heap allocated
	 */
	FyHeap.prototype.allocateStatic = function(size, gced) {
		this.heapTop -= size;
		if (this.heapTop < this.oldPos) {
			if (gced) {
				throw new FyException(undefined, "Out of memory: perm");
			} else {
				this.gc(size);
				return this.allocatePerm(size, 1);
			}
		}
		return this.heapTop;
	};

	FyHeap.prototype.allocateStack = function(threadId) {
		var pos = this.stackPool[threadId];
		if (!pos) {
			// allocate new
			pos = this.allocatePerm(FyConfig.stackSize, 0);
			this.stackPool[threadId] = pos;
		}
		return pos;
	};

	FyHeap.prototype.releaseStack = function(threadId) {
		this.memset32(this.stackPool[threadId], FyConfig.stackSize, 0);
	};

	/**
	 * 
	 * @param {Number}
	 *            size
	 * @param {Number}
	 *            gced
	 * 
	 */
	FyHeap.prototype.allocateInEden = function(size, gced) {
		var ret = 0;
		var newEdenPos = this.edenPos + size;
		if (newEdenPos > this.edenTop) {
			if (gced) {
				throw new FyException(undefined, "Out of memory in eden! "
						+ newEdenPos + "/" + this.edenTop);
			} else {
				this.gc(size);
				return this.allocateInEden(size, 1);
			}
		} else {
			ret = this.edenPos;
			this.edenPos = newEdenPos;
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
	FyHeap.prototype.allocateInCopy = function(size, gced) {
		var ret = 0;
		var newCopyPos = this.copyPos + size;
		if (newCopyPos > this.copyTop) {
			if (gced) {
				throw new FyException(undefined, "Out of memory in copy! "
						+ newCopyPos + "/" + this.copyTop);
			} else {
				this.gc(size);
				return this.allocateInCopy(size, 1);
			}
		} else {
			ret = this.copyPos;
			this.copyPos = newCopyPos;
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
	FyHeap.prototype.allocateInOld = function(size, gced) {
		var ret = 0;
		var newOldPos = this.oldPos + size;
		if (newOldPos > this.heapTop) {
			if (gced) {
				throw new FyException(undefined, "Out of memory in old!"
						+ newOldPos + "/" + this.heapTop);
			} else {
				this.gc(size);
				return this.allocateInOld(size, 1);
			}
		} else {
			ret = this.oldPos;
			this.oldPos = newOldPos;
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
	FyHeap.prototype.allocateInternal = function(size, clazz, multiUsageData,
			toHandle, bid) {
		var handle = toHandle;
		if (handle === 0) {
			handle = this.fetchNextHandle();
		}

		// if (handle === 2875) {
		// new FyException();
		// }

		if (this.objectExists(handle)) {
			// TODO confirm
			throw new FyException("Object " + handle + " already exists");
		}

		switch (bid) {
		case 0/* BID_AUTO */:
			if (size > ((COPY_SIZE) >> 1)) {
				// allocate in old directly
				this.createObject(handle, this.allocateInOld(size
						+ OBJ_META_SIZE, 0));
				this.memset32(this.heap[handle] + 1, size + OBJ_META_SIZE - 1,
						0);
				this.setObjectBId(handle, BID_OLD);
			} else {
				// allocate in eden;
				this.createObject(handle, this.allocateInEden(size
						+ OBJ_META_SIZE, 0));
				this.memset32(this.heap[handle] + 1, size + OBJ_META_SIZE - 1,
						0);
				this.setObjectBId(handle, BID_EDEN);
			}
			break;
		case 1/* BID_EDEN */:
			// TODO check if we need to set obj->object_data->position
			this.createObject(handle, this.allocateInEden(size + OBJ_META_SIZE,
					1));
			break;
		case 2/* BID_YOUNG */:
			this.createObject(handle, this.allocateInCopy(size + OBJ_META_SIZE,
					1));
			break;
		case 3/* BID_OLD */:
			this.createObject(handle, this.allocateInOld(size + OBJ_META_SIZE,
					1));
			break;
		default:
			throw new FyException(undefined, "Illegal bid: " + bid);
		}
		this.setObjectMultiUsageData(handle, multiUsageData);
		this.setObjectClassId(handle, clazz.classId);
		if (this.protectMode) {
			this.protectedObjects.push(handle);
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
	FyHeap.prototype.allocateDirect = function(size, clazz, multiUsageData,
			toHandle, pos) {
		if (this.objectExists(toHandle)) {
			throw new FyException(FyConst.FY_EXCEPTION_INCOMPAT_CHANGE,
					"Handle " + toHandle + " already allocated.");
		}
		var ret = this.allocateInternal(size, clazz, multiUsageData, toHandle,
				pos);
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
		var ret = this.allocateInternal(clazz.sizeAbs, clazz, 0, 0, BID_AUTO);
		if (this.protectMode) {
			this.protectedObjects.push(ret);
		}
		return ret;
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
		var ret = this.allocateInternal(FyHeap.getArraySizeFromLength(clazz,
				length), clazz, length, 0, BID_AUTO);
		if (this.protectMode) {
			this.protectedObjects.push(ret);
		}
		return ret;
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
		var handle = 0;
		var i = 0;
		if (layers > 1) {
			for (i = 0; i < size; i++) {
				handle = this.multiNewArray(clazz.contentClass, layers - 1,
						counts, pos + 1);
				this.putArrayInt(ret, i, handle);
			}
		}
		return ret;
	};

	FyHeap.prototype.registerReference = function(reference, referent) {
		reference = reference | 0;
		if (reference === 0) {
			throw new FyException(undefined, "Reference is null");
		} else if (this.references[reference] !== undefined) {
			throw new FyException(undefined, "Reference #" + reference
					+ " is already registered with referent #"
					+ this.references[reference]);
		} else {
			// console.log("Register reference #" + reference + " "
			// + _getObjectClass(reference).name + " to referent #"
			// + referent);
			this.references[reference] = referent;
		}
	};

	FyHeap.prototype.clearReference = function(reference) {
		reference = reference | 0;
		delete this.references[reference];
	};

	FyHeap.prototype.getReferent = function(reference) {
		reference = reference | 0;
		return this.references[reference] | 0;
	};

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
	FyHeap.prototype.markObjectInitialUsing = function(handle) {
		if (!handle) {
			throw new FyException(undefined, "GC Internal error #1");
		}

		// if (FyConfig.debugMode && (handle < 0 || handle >
		// FyConfig.maxObjects)) {
		// throw new FyException(undefined, "Illegal handle #" + handle);
		// }
		// if(handle===4096){
		// new FyException(undefined,undefined);
		// }
		this.from.push(handle);
	};

	/**
	 * 
	 * @param {Boolean}
	 *            processSoft
	 */
	FyHeap.prototype.fillInitialHandles = function(processSoft) {

		var classClass = this.context.lookupClass(FyConst.FY_BASE_CLASS);
		var classMethod = this.context.lookupClass(FyConst.FY_REFLECT_METHOD);
		var classField = this.context.lookupClass(FyConst.FY_REFLECT_FIELD);
		var classConstructor = this.context
				.lookupClass(FyConst.FY_REFLECT_CONSTRUCTOR);

		var imax;

		var f1, f2, f3, f4, f5, f6, f7;
		f1 = performance.now();
		/* Reflection objects */
		imax = FyConfig.maxObjects;
		for (var i = 1; i < imax; i++) {
			if (this.objectExists(i)) {
				var clazz = this.getObjectClass(i);
				if (clazz === classClass || clazz === classMethod
						|| clazz === classField || clazz === classConstructor) {
					this.markObjectInitialUsing(i);
				}
			}
		}
		f2 = performance.now();
		/* Class static area */
		imax = this.context.classes.length;
		for (var i = 1; i < imax; i++) {
			/**
			 * @returns {FyClass}
			 */
			var clazz = this.context.classes[i];
			for (var j = 0; j < clazz.staticSize; j++) {
				/**
				 * @returns {FyField}
				 */
				var field = clazz.fieldStatic[j];
				if (field !== undefined) {
					switch (field.descriptor.charCodeAt(0)) {
					case 76/* FyConst.L */:
					case 91/* FyConst.ARR */:
						var value = this.getStaticInt(clazz, field.posAbs);
						if (value !== 0) {
							this.markObjectInitialUsing(value);
						}
						break;
					}
				}
			}
		}
		f3 = performance.now();
		/* Literals */
		imax = this.literialedObjs.length;
		for (var i = 0; i < imax; i++) {
			var handle = this.literialedObjs[i];
			this.markObjectInitialUsing(handle);
		}
		f4 = performance.now();
		/* Thread objects */
		imax = FyConfig.maxThreads;
		for (var i = 1; i < imax; i++) {
			/**
			 * @returns {FyThread}
			 */
			var thread = this.context.threadManager.threads[i];
			if (thread !== undefined) {
				this.markObjectInitialUsing(thread.handle);
				if (thread.waitForLockId !== 0) {
					this.markObjectInitialUsing(thread.waitForLockId);
				}
				if (thread.waitForNotifyId !== 0) {
					this.markObjectInitialUsing(thread.waitForNotifyId);
				}
				if (thread.currentThrowable !== 0) {
					this.markObjectInitialUsing(thread.currentThrowable);
				}
				thread.scanRef(this.from);
			}
		}
		f5 = performance.now();
		imax = this.toFinalize.length;
		for (var i = 0; i < imax; i++) {
			this.markObjectInitialUsing(this.toFinalize[i]);
		}
		imax = this.protectedObjects.length;
		for (var i = 0; i < imax; i++) {
			this.markObjectInitialUsing(this.protectedObjects[i]);
		}
		imax = this.toEnqueue.length;
		for (var i = 0; i < imax; i++) {
			this.markObjectInitialUsing(this.toEnqueue[i]);
		}
		f6 = performance.now();

		if (processSoft) {
			// console.log("process soft");
			var keys = Object.keys(this.references);
			imax = keys.length;
			for (var i = 0; i < imax; i++) {
				var reference = keys[i] | 0;
				var referent = this.references[reference];
				var referenceClass = this.getObjectClass(reference);
				console.log("reference #" + reference + " got");
				if (referenceClass === undefined) {
					throw new FyException(undefined,
							"Can't get class for reference #" + reference);
				}
				if (referenceClass.accessFlags & FyConst.FY_ACC_SOFT_REF) {
					// console.log("reference #" + reference + "(" +
					// referent
					// + ") is added as soft ref");
					this.markObjectInitialUsing(referent);
				}
			}
		}
		f7 = performance.now();
		this.context.log(0, [ (f2 - f1), (f3 - f2), (f4 - f3), (f5 - f4),
				(f6 - f5), (f7 - f6) ]);
		// for ( var idx in _from) {
		// console.log("#Initial: " + _from[idx]);
		// }
	};

	FyHeap.prototype.cleanAndEnqueue = function(reference) {
		reference = reference | 0;
		// console.log("#clear and enqueue #" + reference);
		this.toEnqueue.push(reference);
		delete this.references[reference];
	};

	FyHeap.prototype.scanRef = function() {
		var handle;
		while ((handle = this.from.pop()) !== undefined) {
			if (this.marks.contains(handle)) {
				continue;
			} else {
				this.marks.put(handle, 1);
			}
			var clazz = this.getObjectClass(handle);
			if (clazz === undefined) {
				throw new FyException(undefined, "Handle #" + handle
						+ " is released while using");
			}
			switch (clazz.type) {
			case 2/* FyConst.TYPE_ARRAY */:
				if (clazz.contentClass.type !== FyConst.TYPE_PRIMITIVE) {
					for (var i = this.arrayLength(handle) - 1; i >= 0; i--) {
						var handle2 = this.getArrayInt(handle, i);
						if (handle2 === 0) {
							continue;
						}
						if (!this.marks.contains(handle2)) {
							// console.log("!!Add #" + handle + "[" + i +
							// "]="
							// + handle2);
							if (FyConfig.debugMode
									&& (handle2 < 0 || handle2 > FyConfig.maxObjects)) {
								throw new FyException("Illegal handle #"
										+ handle2 + " in "
										+ this.getObjectClass(handle).name
										+ "#" + handle + "[" + i + "]");
							}
							this.from.push(handle2);
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
						// console.log("!!Discard #" + handle +
						// "[undefined@" +
						// i
						// + "]");
						continue;
					}
					var fieldType = field.descriptor.charCodeAt(0);
					if (fieldType === FyConst.L || fieldType === FyConst.ARR) {
						var handle2 = this.getFieldInt(handle, field.posAbs);
						if (handle2 === 0) {
							// console.log("!!Discard #" + handle + "["
							// + field.name + "]=" + handle2);
							continue;
						}
						if (!this.marks.contains(handle2)) {
							// console.log("!!Add #" + handle + "[" +
							// field.name
							// + "]=" + handle2);
							if (FyConfig.debugMode
									&& (handle2 < 0 || handle2 > FyConfig.maxObjects)) {
								throw new FyException("Illegal handle #"
										+ handle2 + " in "
										+ this.getObjectClass(handle).name
										+ "#" + handle + "." + field.fullName);
							}
							this.from.push(handle2);
						}
					} else {
						// console.log("!!Discard #" + handle + "[" +
						// field.name
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

	/**
	 * @param {Number}
	 *            handle
	 */
	FyHeap.prototype.getSizeFromObject = function(handle) {
		var clazz = this.getObjectClass(handle);
		switch (clazz.type) {
		case 2/* FyConst.TYPE_ARRAY */:
			return FyHeap.getArraySizeFromLength(clazz, this
					.arrayLength(handle))
					+ OBJ_META_SIZE;
		case 0/* FyConst.TYPE_OBJECT */:
			return clazz.sizeAbs + OBJ_META_SIZE;
		default:
			throw new FyException(undefined, "Illegal class type " + clazz.type
					+ " for class " + clazz.name + " in GC");
		}
	};

	FyHeap.prototype.release = function(handle) {
		// if (handle == 46) {
		// console.log("#Release " + handle + " ("
		// + _getObjectClass(handle).name + ")");
		// }
		if (this.getObjectBId(handle) === BID_OLD) {
			this.oldReleasedSize += this.getSizeFromObject(handle);
		}
		delete this.references[handle];
		this.memset32(this.heap[handle], this.getSizeFromObject(handle), 0);
		this.heap[handle] = 0;
	};

	/**
	 * 
	 * @param {HashMapI}
	 *            marks
	 */
	FyHeap.prototype.compatOld = function(marks) {
		var newPos = this.oldBottom;
		// TODO optimize
		for (var i = newPos; i < this.oldPos; i++) {
			var handle = this.heap[i];
			if (handle > 0 && handle < MAX_OBJECTS && this.heap[handle] === i) {
				// It's a real object
				var size = this.getSizeFromObject(handle);
				if (marks !== undefined && !marks.contains(handle)) {
					// this will be released
					this.release(handle);
				} else {
					// console.log("#GC Old get #" + handle + " to keep,
					// move "
					// + size + " dwords from " + i + " to " + newPos);
					// move
					if (newPos !== i) {
						this.memcpy32(i, newPos, size);
					}
					// TODO move up
					this.heap[handle] = newPos;
					newPos += size;
				}
				i += size - 1;
			}
		}
		this.context.log(1, "#GC: Compat old"
				+ (marks ? " with object release" : " for space") + ", "
				+ (this.oldPos - this.oldBottom) + " => "
				+ (newPos - this.oldBottom));
		this.oldPos = newPos;
		this.oldReleasedSize = 0;
	};

	/**
	 * @param {Number}
	 *            handle
	 */
	FyHeap.prototype.moveToOld = function(handle) {
		var size = this.getSizeFromObject(handle);
		if (this.oldPos + size >= this.heapTop) {
			this.compatOld();
			if (this.oldPos + size >= this.heapTop) {
				throw new FyException(undefined, "Old area full");
			}
		}
		// Don't gc here, as this method is called in gc process
		var pos = this.oldPos;
		this.oldPos += size;
		this.memcpy32(this.heap[handle], pos, size);
		this.memset32(this.heap[handle], size, 0);
		this.heap[handle] = pos;
		this.heap[pos] = handle;
		this.setObjectBId(handle, BID_OLD);
	};

	/**
	 * @param {Number}
	 *            handle
	 */
	FyHeap.prototype.moveToYoung = function(handle) {
		var size = this.getSizeFromObject(handle);
		if (this.copy2Pos + size >= this.copy2Top) {
			this.moveToOld(handle);
		} else {
			var pos = this.copy2Pos;
			this.copy2Pos += size;
			this.memcpy32(this.heap[handle], pos, size);
			this.memset32(this.heap[handle], size, 0);
			this.heap[handle] = pos;
			this.heap[pos] = handle;
			this.setObjectBId(handle, BID_YOUNG);
		}
	};

	FyHeap.prototype.swapCopy = function() {
		var tmp;

		tmp = this.copyBottom;
		this.copyBottom = this.copy2Bottom;
		this.copy2Bottom = tmp;

		tmp = this.copyTop;
		this.copyTop = this.copy2Top;
		this.copy2Top = tmp;

		this.copyPos = this.copy2Pos;
		this.copy2Pos = this.copy2Bottom;
	};

	FyHeap.prototype.move = function(handle) {
		var gen = this.getObjectGen(handle);
		if (gen > MAX_GEN) {
			// console.log("#GC move #" + handle + " to old");
			this.moveToOld(handle);
		} else {
			// console.log("#GC move #" + handle + " to young");
			this.setObjectGen(handle, gen + 1);
			this.moveToYoung(handle);
		}
		if (this.getObjectClass(handle) === undefined) {
			throw new FyException(undefined,
					"Fatal error occored in gc process...");
		}
	};

	FyHeap.prototype.validateObjects = function() {
		for (var handle = MAX_OBJECTS; --handle;) {
			if (this.heap[handle] !== 0
					&& this.heap[this.heap[handle]] !== handle) {
				throw new FyException(undefined, "Illegal status for object #"
						+ handle + " pos=" + this.heap[handle] + " value="
						+ this.heap[this.heap[handle]] + " ");
			}
		}
	};

	FyHeap.prototype.gcEnqueueFinalize = function() {
		for (var i = 1; i < MAX_OBJECTS; i++) {
			if (this.objectExists(i) && !this.marks.contains(i)
					&& this.getObjectClass(i).needFinalize
					&& this.getObjectFinalizeStatus(i) == FIN_NOT_FINALIZED) {
				this.toFinalize.push(i);
				this.from.push(i);
				this.setObjectFinalizeStatus(i, FIN_IN_FINALIZE_ARRAY);
			}
		}
	};

	FyHeap.prototype.gcEnqueueReferences = function() {
		var keys = Object.keys(this.references);
		var imax = keys.length;
		for (var i = 0; i < imax; i++) {
			// phase1
			var reference = keys[i] | 0;
			var referent = this.references[reference];
			if (!this.objectExists(referent)
					|| (!this.marks.contains(referent) && ((this
							.getObjectClass(reference).accessFlags & FyConst.FY_ACC_PHANTOM_REF) === 0))) {
				this.from.push(reference | 0);
				this.cleanAndEnqueue(reference | 0);
			}
		}
	};

	FyHeap.prototype.gcEnqueueReferences2 = function() {
		var keys = Object.keys(this.references);
		var imax = keys.length;
		for (var i = 0; i < imax; i++) {
			var reference = keys[i] | 0;
			var referent = this.references[reference];
			// phase2
			if (!this.objectExists(referent) && this.marks.contains(reference)) {
				this.cleanAndEnqueue(reference);
			}
		}
	};

	FyHeap.prototype.gcMove = function() {
		for (var i = 1; i < MAX_OBJECTS; i++) {
			if (this.objectExists(i)) {
				if (this.marks.contains(i)) {
					switch (this.getObjectBId(i)) {
					case 1/* BID_EDEN */:
					case 2/* BID_YOUNG */:
						this.move(i);
						break;
					case 3/* BID_OLD */:
						break;
					default:
						throw new FyException(undefined, "Illegal bid "
								+ this.getObjectBId(i) + " for object #" + i);
					}
				} else {
					this.release(i);
				}
			}
		}
		this.edenPos = this.edenBottom;
		this.swapCopy();
	};

	FyHeap.prototype.gc = function(requiredSize) {
		var timeStamp;
		var t1, t2, t3, t4, t5, t6, t7;
		var memoryStressed = false;
		if (this.gcInProgress) {
			throw new FyException(undefined, "Gc should not be reentried");
		}
		if (requiredSize + this.oldPos + this.copyPos - this.copyBottom
				+ this.edenPos - this.edenBottom >= this.heapTop) {
			memoryStressed = true;
		}
		this.context.log(1, "#GC "
				+ (memoryStressed ? "stressed" : "")
				+ " BEFORE "
				+ (this.edenPos - this.edenBottom)
				+ "+"
				+ (this.copyPos - this.copyBottom)
				+ "+"
				+ (this.oldPos - this.oldBottom)
				+ " total "
				+ (this.edenPos - this.edenBottom + this.copyPos
						- this.copyBottom + this.oldPos - this.oldBottom)
				+ " ints " + (HEAP_SIZE - this.heapTop) + " perm ints");
		if (FyConfig.debugMode) {
			this.validateObjects();
		}

		timeStamp = performance.now();
		this.marks.clear();
		this.from.length = 0;

		t1 = performance.now();
		this.fillInitialHandles(!memoryStressed);
		t2 = performance.now();
		this.scanRef();
		t3 = performance.now();
		this.from.length = 0;
		this.gcEnqueueFinalize();
		this.gcEnqueueReferences();

		t4 = performance.now();
		this.scanRef();
		this.from.length = 0;

		t5 = performance.now();
		if (memoryStressed) {
			this.compatOld(this.marks);
		}
		t6 = performance.now();
		this.gcMove();
		t7 = performance.now();
		this.gcEnqueueReferences2();

		this.marks.clear();
		this.gcInProgress = false;
		if (FyConfig.debugMode) {
			this.validateObjects();
		}
		this.context.log(1, "#GC AFTER "
				+ (this.edenPos - this.edenBottom)
				+ "+"
				+ (this.copyPos - this.copyBottom)
				+ "+"
				+ (this.oldPos - this.oldBottom)
				+ " total "
				+ (this.edenPos - this.edenBottom + this.copyPos
						- this.copyBottom + this.oldPos - this.oldBottom)
				+ " ints " + (HEAP_SIZE - this.heapTop) + " perm ints");
		this.context.log(1, "#GC time: " + ((t1 - timeStamp) | 0) + " "
				+ ((t2 - t1) | 0) + " " + ((t3 - t2) | 0) + " "
				+ ((t4 - t3) | 0) + " " + ((t5 - t4) | 0) + " "
				+ ((t6 - t5) | 0) + " " + ((t7 - t6) | 0) + " "
				+ ((performance.now() - t7) | 0));
	};

	FyHeap.prototype.getFinalizee = function() {
		if (this.toFinalize.length > 0) {
			var clazz = this.context.lookupClass("[L" + FyConst.FY_BASE_OBJECT
					+ ";");
			var ret = this.allocateArray(clazz, this.toFinalize.length);
			for (var i = 0; i < this.toFinalize.length; i++) {
				this.putArrayInt(ret, i, this.toFinalize[i]);
				this.setObjectFinalizeStatus(this.toFinalize[i], FIN_FINALIZED);
			}
			this.toFinalize.length = 0;
			return ret;
		} else {
			return 0;
		}
	};

	FyHeap.prototype.getReferencesToEnqueue = function() {
		if (this.toEnqueue.length > 0) {
			var clazz = this.context.lookupClass("[L" + FyConst.FY_BASE_OBJECT
					+ ";");
			var ret = this.allocateArray(clazz, this.toEnqueue.length);
			for (var i = 0; i < this.toEnqueue.length; i++) {
				this.putArrayInt(ret, i, this.toEnqueue[i]);
			}
			// console.log("#GC Get " + _toEnqueue.length
			// + " references to enqueue");
			this.toEnqueue.length = 0;
			return ret;
		} else {
			return 0;
		}
	};

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
	FyHeap.prototype.arrayLength = function(handle) {
		if (handle === 0) {
			throw new FyException(FyConst.FY_EXCEPTION_NPT, "");
		}
		if (this.getObjectClass(handle) === undefined) {
			throw new FyException(undefined, "Illegal object #" + handle);
		}
		return this.getObjectMultiUsageData(handle);
	};

	FyHeap.prototype.arrayPos = function(handle) {
		return this.heap[handle] + OBJ_META_SIZE;
	};

	/**
	 * Check whether a index is legal in an array
	 * 
	 * @param {Number}
	 *            handle
	 * @param {Number}
	 *            idx index
	 */
	FyHeap.prototype.checkLength = function(handle, idx) {
		if (idx < 0 || idx >= this.arrayLength(handle)) {
			throw new FyException(FyConst.FY_EXCEPTION_AIOOB, idx + "/"
					+ this.arrayLength(handle));
		}
	};
	// TODO AUTO BELOW!
	/**
	 * @param {Number}
	 *            handle
	 * @param {Number}
	 *            index
	 * @param {Number}pos
	 */
	FyHeap.prototype.getArrayRaw32ToHeap = function(handle, index, pos) {
		this.checkLength(handle, index);
		// console.log("#" + handle + "[" + index + "] = "
		// + this.heap[this.heap[handle] + OBJ_META_SIZE + index] + " => " +
		// pos);
		this.heap[pos] = this.heap[this.heap[handle] + OBJ_META_SIZE + index];
	};

	/**
	 * @param {Number}
	 *            handle
	 * @param {Number}
	 *            index
	 * @param {Number}pos
	 */
	FyHeap.prototype.getArrayRaw16ToHeap = function(handle, index, pos) {
		this.checkLength(handle, index);
		this.heap[pos] = this.heap16[((this.heap[handle] + OBJ_META_SIZE) << 1)
				+ index];
	};

	/**
	 * @param {Number}
	 *            handle
	 * @param {Number}
	 *            index
	 * @param {Number}pos
	 */
	FyHeap.prototype.getArrayRaw8ToHeap = function(handle, index, pos) {
		this.checkLength(handle, index);
		this.heap[pos] = this.heap8[((this.heap[handle] + OBJ_META_SIZE) << 2)
				+ index];
	};

	/**
	 * @param {Number}
	 *            handle
	 * @param {Number}
	 *            index
	 * @param {Number}pos
	 */
	FyHeap.prototype.getArrayRaw64ToHeap = function(handle, index, pos) {
		this.checkLength(handle, index);
		this.heap[pos] = this.heap[this.heap[handle] + OBJ_META_SIZE
				+ (index << 1)];
		this.heap[pos] = this.heap[this.heap[handle] + OBJ_META_SIZE
				+ (index << 1) + 1];
	};

	FyHeap.prototype.getArrayBoolean = function(handle, index) {
		this.checkLength(handle, index);
		return this.heap8[((this.heap[handle] + OBJ_META_SIZE) << 2) + index] ? true
				: false;
	};

	FyHeap.prototype.getArrayByte = function(handle, index) {
		this.checkLength(handle, index);
		return this.heap8[((this.heap[handle] + OBJ_META_SIZE) << 2) + index];
	};

	FyHeap.prototype.getArrayShort = function(handle, index) {
		this.checkLength(handle, index);
		return this.heap16[((this.heap[handle] + OBJ_META_SIZE) << 1) + index];
	};

	FyHeap.prototype.getArrayChar = function(handle, index) {
		this.checkLength(handle, index);
		return this.heap16[((this.heap[handle] + OBJ_META_SIZE) << 1) + index] & 0xffff;
	};

	FyHeap.prototype.getArrayInt = function(handle, index) {
		this.checkLength(handle, index);
		return this.heap[this.heap[handle] + OBJ_META_SIZE + index];
	};

	FyHeap.prototype.getArrayFloat = function(handle, index) {
		this.checkLength(handle, index);
		return this.heapFloat[this.heap[handle] + OBJ_META_SIZE + index];
	};

	FyHeap.prototype.getArrayLongTo = function(handle, index, tarray, tindex) {
		this.checkLength(handle, index);
		tarray[tindex] = this.heap[this.heap[handle] + OBJ_META_SIZE
				+ (index << 1)];
		tarray[tindex + 1] = this.heap[this.heap[handle] + OBJ_META_SIZE
				+ (index << 1) + 1];
		return tarray;
	};

	FyHeap.prototype.getArrayDouble = function(handle, index) {
		this.checkLength(handle, index);
		return FyPortable.ieee64ToDouble(this.heap, this.heap[handle]
				+ OBJ_META_SIZE + (index << 1));
	};

	FyHeap.prototype.putArrayRaw32FromHeap = function(handle, index, pos) {
		this.checkLength(handle, index);
		// console.log("#" + handle + "[" + index + "] <= " + pos + " = "
		// + this.heap[pos]);
		this.heap[this.heap[handle] + OBJ_META_SIZE + index] = this.heap[pos];
	};

	FyHeap.prototype.putArrayRaw16FromHeap = function(handle, index, pos) {
		this.checkLength(handle, index);
		this.heap16[((this.heap[handle] + OBJ_META_SIZE) << 1) + index] = this.heap[pos];
	};

	FyHeap.prototype.putArrayRaw8FromHeap = function(handle, index, pos) {
		this.checkLength(handle, index);
		this.heap8[((this.heap[handle] + OBJ_META_SIZE) << 2) + index] = this.heap[pos];
	};

	FyHeap.prototype.putArrayRaw64FromHeap = function(handle, index, pos) {
		this.checkLength(handle, index);
		this.heap[this.heap[handle] + OBJ_META_SIZE + (index << 1)] = this.heap[pos];
		this.heap[this.heap[handle] + OBJ_META_SIZE + (index << 1) + 1] = this.heap[pos];
	};

	FyHeap.prototype.putArrayBoolean = function(handle, index, value) {
		this.checkLength(handle, index);
		this.heap8[((this.heap[handle] + OBJ_META_SIZE) << 2) + index] = value | 0;
	};

	FyHeap.prototype.putArrayByte = function(handle, index, value) {
		this.checkLength(handle, index);
		this.heap8[((this.heap[handle] + OBJ_META_SIZE) << 2) + index] = value | 0;
	};

	FyHeap.prototype.putArrayShort = function(handle, index, value) {
		this.checkLength(handle, index);
		this.heap16[((this.heap[handle] + OBJ_META_SIZE) << 1) + index] = value;
	};

	FyHeap.prototype.putArrayChar = function(handle, index, value) {
		this.checkLength(handle, index);
		this.heap16[((this.heap[handle] + OBJ_META_SIZE) << 1) + index] = value & 0xffff;
	};

	FyHeap.prototype.putArrayInt = function(handle, index, value) {
		this.checkLength(handle, index);
		this.heap[this.heap[handle] + OBJ_META_SIZE + index] = value;
	};

	FyHeap.prototype.putArrayFloat = function(handle, index, value) {
		this.checkLength(handle, index);
		this.heapFloat[this.heap[handle] + OBJ_META_SIZE + index] = value;
	};

	FyHeap.prototype.putArrayLongFrom = function(handle, index, varray, vindex) {
		this.checkLength(handle, index);
		this.heap[this.heap[handle] + OBJ_META_SIZE + (index << 1)] = varray[vindex];
		this.heap[this.heap[handle] + OBJ_META_SIZE + (index << 1) + 1] = varray[vindex + 1];
	};

	FyHeap.prototype.putArrayDouble = function(handle, index, value) {
		this.checkLength(handle, index);
		FyPortable.doubleToIeee64(value, this.heap, this.heap[handle]
				+ OBJ_META_SIZE + (index << 1));
	};

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
	FyHeap.prototype.getFieldRaw32To = function(handle, posAbs, pos) {
		if (handle === 0) {
			throw new FyException(FyConst.FY_EXCEPTION_NPT, "");
		}
		this.heap[pos] = this.heap[this.heap[handle] + OBJ_META_SIZE + posAbs];
	};

	FyHeap.prototype.getFieldRaw64To = function(handle, posAbs, pos) {
		if (handle === 0) {
			throw new FyException(FyConst.FY_EXCEPTION_NPT, "");
		}
		this.heap[pos] = this.heap[this.heap[handle] + OBJ_META_SIZE + posAbs];
		this.heap[pos + 1] = this.heap[this.heap[handle] + OBJ_META_SIZE
				+ posAbs + 1];
	};

	FyHeap.prototype.getFieldBoolean = function(handle, posAbs) {
		if (handle === 0) {
			throw new FyException(FyConst.FY_EXCEPTION_NPT, "");
		}
		return this.heap[this.heap[handle] + OBJ_META_SIZE + posAbs] ? true
				: false;
	};

	FyHeap.prototype.getFieldByte = function(handle, posAbs) {
		if (handle === 0) {
			throw new FyException(FyConst.FY_EXCEPTION_NPT, "");
		}
		var ret = this.heap[this.heap[handle] + OBJ_META_SIZE + posAbs] & 0xff;
		return (ret >>> 7) ? ((ret - 256) | 0) : ret;
	};

	FyHeap.prototype.getFieldShort = function(handle, posAbs) {
		if (handle === 0) {
			throw new FyException(FyConst.FY_EXCEPTION_NPT, "");
		}
		var ret = this.heap[this.heap[handle] + OBJ_META_SIZE + posAbs] & 0xffff;
		return (ret >>> 15) ? ((ret - 65536) | 0) : ret;
	};

	FyHeap.prototype.getFieldChar = function(handle, posAbs) {
		if (handle === 0) {
			throw new FyException(FyConst.FY_EXCEPTION_NPT, "");
		}
		return this.heap[this.heap[handle] + OBJ_META_SIZE + posAbs] & 0xffff;
	};

	FyHeap.prototype.getFieldInt = function(handle, posAbs) {
		if (handle === 0) {
			throw new FyException(FyConst.FY_EXCEPTION_NPT, "");
		}
		return this.heap[this.heap[handle] + OBJ_META_SIZE + posAbs];
	};

	FyHeap.prototype.getFieldFloat = function(handle, posAbs) {
		if (handle === 0) {
			throw new FyException(FyConst.FY_EXCEPTION_NPT, "");
		}
		return this.heapFloat[this.heap[handle] + OBJ_META_SIZE + posAbs];
	};

	FyHeap.prototype.getFieldLongTo = function(handle, posAbs, tarray, tindex) {
		if (handle === 0) {
			throw new FyException(FyConst.FY_EXCEPTION_NPT, "");
		}
		tarray[tindex] = this.heap[this.heap[handle] + OBJ_META_SIZE + posAbs];
		tarray[tindex + 1] = this.heap[this.heap[handle] + OBJ_META_SIZE
				+ posAbs + 1];
		return tarray;
	};

	FyHeap.prototype.getFieldDouble = function(handle, posAbs) {
		if (handle === 0) {
			throw new FyException(FyConst.FY_EXCEPTION_NPT, "");
		}
		return FyPortable.ieee64ToDouble(this.heap, this.heap[handle]
				+ OBJ_META_SIZE + posAbs);
	};

	FyHeap.prototype.putFieldRaw32From = function(handle, posAbs, pos) {
		if (handle === 0) {
			throw new FyException(FyConst.FY_EXCEPTION_NPT, "");
		}
		this.heap[this.heap[handle] + OBJ_META_SIZE + posAbs] = this.heap[pos];
	};

	FyHeap.prototype.putFieldRaw64From = function(handle, posAbs, pos) {
		if (handle === 0) {
			throw new FyException(FyConst.FY_EXCEPTION_NPT, "");
		}
		this.heap[this.heap[handle] + OBJ_META_SIZE + posAbs] = this.heap[pos];
		this.heap[this.heap[handle] + OBJ_META_SIZE + posAbs + 1] = this.heap[pos + 1];
	};

	FyHeap.prototype.putFieldBoolean = function(handle, posAbs, value) {
		if (handle === 0) {
			throw new FyException(FyConst.FY_EXCEPTION_NPT, "");
		}
		this.heap[this.heap[handle] + OBJ_META_SIZE + posAbs] = value | 0;
	};

	FyHeap.prototype.putFieldByte = function(handle, posAbs, value) {
		if (handle === 0) {
			throw new FyException(FyConst.FY_EXCEPTION_NPT, "");
		}
		this.heap[this.heap[handle] + OBJ_META_SIZE + posAbs] = value & 0xff;
	};

	FyHeap.prototype.putFieldShort = function(handle, posAbs, value) {
		if (handle === 0) {
			throw new FyException(FyConst.FY_EXCEPTION_NPT, "");
		}
		this.heap[this.heap[handle] + OBJ_META_SIZE + posAbs] = value & 0xffff;
	};

	FyHeap.prototype.putFieldChar = function(handle, posAbs, value) {
		if (handle === 0) {
			throw new FyException(FyConst.FY_EXCEPTION_NPT, "");
		}
		this.heap[this.heap[handle] + OBJ_META_SIZE + posAbs] = value & 0xffff;
	};

	FyHeap.prototype.putFieldInt = function(handle, posAbs, value) {
		if (handle === 0) {
			throw new FyException(FyConst.FY_EXCEPTION_NPT, "");
		}
		this.heap[this.heap[handle] + OBJ_META_SIZE + posAbs] = value;
	};

	FyHeap.prototype.putFieldFloat = function(handle, posAbs, value) {
		if (handle === 0) {
			throw new FyException(FyConst.FY_EXCEPTION_NPT, "");
		}
		this.heapFloat[this.heap[handle] + OBJ_META_SIZE + posAbs] = value;
	};

	FyHeap.prototype.putFieldLongFrom = function(handle, posAbs, tarray, tindex) {
		if (handle === 0) {
			throw new FyException(FyConst.FY_EXCEPTION_NPT, "");
		}
		this.heap[this.heap[handle] + OBJ_META_SIZE + posAbs] = tarray[tindex];
		this.heap[this.heap[handle] + OBJ_META_SIZE + posAbs + 1] = tarray[tindex + 1];
	};

	FyHeap.prototype.putFieldDouble = function(handle, posAbs, value) {
		if (handle === 0) {
			throw new FyException(FyConst.FY_EXCEPTION_NPT, "");
		}
		FyPortable.doubleToIeee64(value, this.heap, this.heap[handle]
				+ OBJ_META_SIZE + posAbs);
	};

	/**
	 * BOOKMARK_STATIC
	 * 
	 * 
	 * 
	 * 
	 * 
	 * 
	 */

	FyHeap.prototype.getStaticRaw32To = function(clazz, posAbs, pos) {
		this.heap[pos] = this.heap[clazz.staticPos + posAbs];
	};

	FyHeap.prototype.getStaticRaw64To = function(clazz, posAbs, pos) {
		this.heap[pos] = this.heap[clazz.staticPos + posAbs];
		this.heap[pos + 1] = this.heap[clazz.staticPos + posAbs + 1];
	};

	FyHeap.prototype.getStaticBoolean = function(clazz, posAbs) {
		return this.heap[clazz.staticPos + posAbs] ? true : false;
	};

	FyHeap.prototype.getStaticByte = function(clazz, posAbs) {
		var ret = this.heap[clazz.staticPos + posAbs] & 0xff;
		return (ret >>> 7) ? ((ret - 256) | 0) : ret;
	};

	FyHeap.prototype.getStaticShort = function(clazz, posAbs) {
		var ret = this.heap[clazz.staticPos + posAbs] & 0xffff;
		return (ret >>> 15) ? ((ret - 65536) | 0) : ret;
	};

	FyHeap.prototype.getStaticChar = function(clazz, posAbs) {
		return this.heap[clazz.staticPos + posAbs] & 0xffff;
	};

	FyHeap.prototype.getStaticInt = function(clazz, posAbs) {
		return this.heap[clazz.staticPos + posAbs];
	};

	FyHeap.prototype.getStaticFloat = function(clazz, posAbs) {
		return this.heapFloat[clazz.staticPos + posAbs];
	};

	FyHeap.prototype.getStaticLongTo = function(clazz, posAbs, tarray, tindex) {
		tarray[tindex] = this.heap[clazz.staticPos + posAbs];
		tarray[tindex + 1] = this.heap[clazz.staticPos + posAbs + 1];
		return tarray;
	};

	FyHeap.prototype.getStaticDouble = function(clazz, posAbs) {
		return FyPortable.ieee64ToDouble(this.heap, clazz.staticPos + posAbs);
	};

	FyHeap.prototype.putStaticRaw32From = function(clazz, posAbs, pos) {
		// console.log("#PUTSTATIC " + clazz.name + "[" + posAbs + "] <= "
		// + this.heap[pos]);
		this.heap[clazz.staticPos + posAbs] = this.heap[pos];
	};

	FyHeap.prototype.putStaticRaw64From = function(clazz, posAbs, pos) {
		this.heap[clazz.staticPos + posAbs] = this.heap[pos];
		this.heap[clazz.staticPos + posAbs + 1] = this.heap[pos + 1];
	};

	FyHeap.prototype.putStaticBoolean = function(clazz, posAbs, value) {
		posAbs = posAbs | 0;
		this.heap[clazz.staticPos + posAbs] = value ? 1 : 0;
	};

	FyHeap.prototype.putStaticByte = function(clazz, posAbs, value) {
		posAbs = posAbs | 0;
		this.heap[clazz.staticPos + posAbs] = value & 0xff;
	};

	FyHeap.prototype.putStaticChar = function(clazz, posAbs, value) {
		posAbs = posAbs | 0;
		this.heap[clazz.staticPos + posAbs] = value & 0xffff;
	};

	FyHeap.prototype.putStaticShort = function(clazz, posAbs, value) {
		posAbs = posAbs | 0;
		this.heap[clazz.staticPos + posAbs] = value & 0xffff;
	};

	FyHeap.prototype.putStaticInt = function(clazz, posAbs, value) {
		posAbs = posAbs | 0;
		this.heap[clazz.staticPos + posAbs] = value;
	};

	FyHeap.prototype.putStaticFloat = function(clazz, posAbs, value) {
		posAbs = posAbs | 0;
		this.heapFloat[clazz.staticPos + posAbs] = value;
	};

	FyHeap.prototype.putStaticLongFrom = function(clazz, posAbs, varray, vindex) {
		this.heap[clazz.staticPos + posAbs] = varray[vindex];
		this.heap[clazz.staticPos + posAbs + 1] = varray[vindex + 1];
	};

	FyHeap.prototype.putStaticDouble = function(clazz, posAbs, value) {
		FyPortable.doubleToIeee64(value, this.heap, clazz.staticPos + posAbs);
	};

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
		var ret;

		if (handle === 0) {
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
		/**
		 * <code> In modern browser string appender is faster
		ret = new Array(len);
		for (i = 0; i < len; i++) {
			ret[i] = String.fromCharCode(this.getArrayChar(cah, i + ofs) & 0xffff);
		}
		return ret.join("").toString();
		 */
		ret = "";
		for (i = 0; i < len; i++) {
			ret += String
					.fromCharCode(this.getArrayChar(cah, i + ofs) & 0xffff);
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
			this.putArrayChar(cah, i, str.charCodeAt(i) & 0xffff);
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
		var handle;
		if (this.literials.hasOwnProperty(str)) {
			handle = this.literials[str];
		} else {
			handle = this.allocate(this.context
					.lookupClass(FyConst.FY_BASE_STRING));
			this.fillString(handle, str);
			this.literials[str] = handle;
			this.literialedObjs.push(handle);
		}
		return handle;
	};

	FyHeap.prototype.literalWithConstant = function(global, constant) {
		var constants = global.constants;
		if (!constants[constant + 2]) {
			constants[constant] = this
					.literal(global.strings[constants[constant]]);
			constants[constant + 2] = 1;
		}
		return constants[constant];
	};

	FyHeap.prototype.putFieldString = function(handle, pos, str) {
		var strHandle = this.allocate(this.context
				.lookupClass(FyConst.FY_BASE_STRING));
		this.putFieldInt(handle, pos, strHandle);
		this.fillString(strHandle, str);
	};

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

	FyHeap.prototype.memcpy8 = function(from, to, len) {
		// console.log("#memcpy8 from="+from+" to="+to+" len="+len);
		for (var i = 0; i < len; i++) {
			this.heap8[to + i] = this.heap8[from + i];
		}
	};
	FyHeap.prototype.memcpy16 = function(from, to, len) {
		// console.log("#memcpy16 from="+from+" to="+to+" len="+len);
		for (var i = 0; i < len; i++) {
			this.heap16[to + i] = this.heap16[from + i];
		}
	};
	FyHeap.prototype.memcpy32 = function(from, to, len) {
		// console.log("#memcpy32 from="+from+" to="+to+" len="+len);
		for (var i = 0; i < len; i++) {
			this.heap[to + i] = this.heap[from + i];
		}
	};
	/**
	 * 
	 */
	FyHeap.prototype.arrayCopy = function(sHandle, sPos, dHandle, dPos, len) {
		/**
		 * @returns {FyClass}
		 */
		var sClass = this.getObjectClass(sHandle);
		/**
		 * @returns {FyClass}
		 */
		var dClass = this.getObjectClass(dHandle);
		var i = 0;
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
			if (!this.context.classLoader.canCast(dClass.contentClass,
					sClass.contentClass)) {
				throw new FyException(FyConst.FY_EXCEPTION_STORE, "Can't cast "
						+ dClass.contentClass.name + " to "
						+ sClass.contentClass.name);
			}
			// TODO
			this.context.log(0, "TODO: enforce System.arrayCopy's type check");
			// throw new FyException(FyConst.FY_EXCEPTION_STORE, "Can't cast
			// "
			// + sClass.contentClass.name + " to "
			// + dClass.contentClass.name);
		}
		if (sPos < 0 || dPos < 0 || ((sPos + len) > this.arrayLength(sHandle))
				|| ((dPos + len) > this.arrayLength(dHandle))) {
			throw new FyException(FyConst.FY_EXCEPTION_AIOOB, sPos + "/"
					+ this.arrayLength(sHandle) + " => " + dPos + "/"
					+ this.arrayLength(dHandle) + " len=" + len);
		}
		switch (sClass.name.charCodeAt(1) | 0) {
		// 8bit
		case 90/* FyConst.Z */:
		case 66/* FyConst.B */:
			this.memcpy8(((this.heap[sHandle] + OBJ_META_SIZE) << 2) + sPos,
					((this.heap[dHandle] + OBJ_META_SIZE) << 2) + dPos, len);
			break;
		// 16bit
		case 83/* FyConst.S */:
		case 67/* FyConst.C */:
			this.memcpy16(((this.heap[sHandle] + OBJ_META_SIZE) << 1) + sPos,
					((this.heap[dHandle] + OBJ_META_SIZE) << 1) + dPos, len);
			break;
		// 32bit
		case 73/* FyConst.I */:
		case 70/* FyConst.F */:
		case 76/* FyConst.L */:
		case 91/* FyConst.ARR */:
			this.memcpy32(this.heap[sHandle] + OBJ_META_SIZE + sPos,
					this.heap[dHandle] + OBJ_META_SIZE + dPos, len);
			break;
		// 64bit
		case 68/* FyConst.D */:
		case 74/* FyConst.J */:
			this.memcpy32(this.heap[sHandle] + OBJ_META_SIZE + (sPos << 1),
					this.heap[dHandle] + OBJ_META_SIZE + (dPos << 1), len << 1);
			break;
		}
	};

	FyHeap.prototype.clone = function(src) {
		/**
		 * @returns {FyClass}
		 */
		var clazz = this.getObjectClass(src);
		/**
		 * @returns {Number}
		 */
		var ret = 0;
		var len = 0;
		var i = 0;
		var max = 0;
		if (clazz.type === FyConst.TYPE_OBJECT) {
			ret = this.allocate(clazz);
			max = clazz.sizeAbs;
			for (i = 0; i < max; i++) {
				this.heap[this.heap[ret] + OBJ_META_SIZE + i] = this.heap[this.heap[src]
						+ OBJ_META_SIZE + i];
			}
		} else if (clazz.type === FyConst.TYPE_ARRAY) {
			len = this.arrayLength(src);
			ret = this.allocateArray(clazz, len);
			this.arrayCopy(src, 0, ret, 0, len);
		} else {
			throw new FyException(undefined, "Illegal object type "
					+ clazz.type + " for class to clone: " + clazz.name);
		}
		return ret;
	};

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
	FyHeap.prototype.unwrapBooleanTo = function(handle, pos) {
		var clazz = this.context.lookupClass(FyConst.FY_BASE_BOOLEAN);
		var field = this.context.getField(FyConst.FY_VALUE_BOOLEAN);
		this.context.lookupClass(FyConst.FY_PRIM_BOOLEAN);
		if (this.getObjectClass(handle) !== clazz) {
			throw new FyException(FyConst.FY_EXCEPTION_ARGU,
					"Can't unwrap handle=" + handle + " as boolean");
		}
		this.getFieldRaw32To(handle, field.posAbs, pos);
	};

	/**
	 * @param {Number}
	 *            value
	 * @returns {Number}
	 */
	FyHeap.prototype.wrapBooleanFrom = function(pos) {
		var clazz = this.context.lookupClass(FyConst.FY_BASE_BOOLEAN);
		var field = this.context.getField(FyConst.FY_VALUE_BOOLEAN);
		var ret = this.allocate(clazz);
		this.putFieldRaw32From(ret, field.posAbs, pos);
		return ret;
	};

	/**
	 * 
	 * @param {Number}
	 *            handle
	 * @returns {Number}
	 */
	FyHeap.prototype.unwrapByteTo = function(handle, pos) {
		var clazz = this.context.lookupClass(FyConst.FY_BASE_BYTE);
		var field = this.context.getField(FyConst.FY_VALUE_BYTE);
		context.lookupClass(FyConst.FY_PRIM_BYTE);
		if (this.getObjectClass(handle) !== clazz) {
			throw new FyException(FyConst.FY_EXCEPTION_ARGU,
					"Can't unwrap handle=" + handle + " as byte");
		}
		this.getFieldRaw32To(handle, field.posAbs, pos);
	};

	/**
	 * @param {Number}
	 *            value
	 * @returns {Number}
	 */
	FyHeap.prototype.wrapByteFrom = function(pos) {
		var clazz = this.context.lookupClass(FyConst.FY_BASE_BYTE);
		var field = this.context.getField(FyConst.FY_VALUE_BYTE);
		var ret = this.allocate(clazz);
		this.putFieldRaw32From(ret, field.posAbs, pos);
	};

	/**
	 * 
	 * @param {Number}
	 *            handle
	 * @returns {Number}
	 */
	FyHeap.prototype.unwrapShortTo = function(handle, pos) {
		var clazz = this.context.lookupClass(FyConst.FY_BASE_SHORT);
		var field = this.context.getField(FyConst.FY_VALUE_SHORT);
		this.context.lookupClass(FyConst.FY_PRIM_SHORT);
		if (this.getObjectClass(handle) !== clazz) {
			throw new FyException(FyConst.FY_EXCEPTION_ARGU,
					"Can't unwrap handle=" + handle + " as short");
		}
		this.getFieldRaw32To(handle, field.posAbs, pos);
	};

	/**
	 * @param {Number}
	 *            value
	 * @returns {Number}
	 */
	FyHeap.prototype.wrapShortFrom = function(pos) {
		var clazz = this.context.lookupClass(FyConst.FY_BASE_SHORT);
		var field = this.context.getField(FyConst.FY_VALUE_SHORT);
		var ret = this.allocate(clazz);
		this.putFieldRaw32From(ret, field.posAbs, pos);
		return ret;
	};

	/**
	 * 
	 * @param {Number}
	 *            handle
	 * @returns {Number}
	 */
	FyHeap.prototype.unwrapCharTo = function(handle, pos) {
		var clazz = this.context.lookupClass(FyConst.FY_BASE_CHAR);
		var field = this.context.getField(FyConst.FY_VALUE_CHAR);
		this.context.lookupClass(FyConst.FY_PRIM_CHAR);
		if (this.getObjectClass(handle) !== clazz) {
			throw new FyException(FyConst.FY_EXCEPTION_ARGU,
					"Can't unwrap handle=" + handle + " as char");
		}
		this.getFieldRaw32To(handle, field.posAbs, pos);
	};

	/**
	 * @param {Number}
	 *            value
	 * @returns {Number}
	 */
	FyHeap.prototype.wrapCharFrom = function(pos) {
		var clazz = this.context.lookupClass(FyConst.FY_BASE_CHAR);
		var field = this.context.getField(FyConst.FY_VALUE_CHAR);
		var ret = this.allocate(clazz);
		this.putFieldRaw32From(ret, field.posAbs, pos);
		return ret;
	};

	/**
	 * 
	 * @param {Number}
	 *            handle
	 * @returns {Number}
	 */
	FyHeap.prototype.unwrapIntTo = function(handle, pos) {
		var clazz = this.context.lookupClass(FyConst.FY_BASE_INT);
		var field = this.context.getField(FyConst.FY_VALUE_INTEGER);
		this.context.lookupClass(FyConst.FY_PRIM_INT);
		if (this.getObjectClass(handle) !== clazz) {
			throw new FyException(FyConst.FY_EXCEPTION_ARGU,
					"Can't unwrap handle=" + handle + " as int");
		}
		this.getFieldRaw32To(handle, field.posAbs, pos);
	};

	/**
	 * @param {Number}
	 *            value
	 * @returns {Number}
	 */
	FyHeap.prototype.wrapIntFrom = function(pos) {
		var clazz = this.context.lookupClass(FyConst.FY_BASE_INT);
		var field = this.context.getField(FyConst.FY_VALUE_INTEGER);
		var ret = this.allocate(clazz);
		this.putFieldRaw32From(ret, field.posAbs, pos);
		return ret;
	};

	/**
	 * 
	 * @param {Number}
	 *            handle
	 * @returns {Number}
	 */
	FyHeap.prototype.unwrapFloatTo = function(handle, pos) {
		var clazz = this.context.lookupClass(FyConst.FY_BASE_FLOAT);
		var field = this.context.getField(FyConst.FY_VALUE_FLOAT);
		this.context.lookupClass(FyConst.FY_PRIM_FLOAT);
		if (this.getObjectClass(handle) !== clazz) {
			throw new FyException(FyConst.FY_EXCEPTION_ARGU,
					"Can't unwrap handle=" + handle + " as float");
		}
		this.getFieldRaw32To(handle, field.posAbs, pos);
	};

	/**
	 * @param {Number}
	 *            value
	 * @returns {Number}
	 */
	FyHeap.prototype.wrapFloatFrom = function(pos) {
		var clazz = this.context.lookupClass(FyConst.FY_BASE_FLOAT);
		var field = this.context.getField(FyConst.FY_VALUE_FLOAT);
		var ret = this.allocate(clazz);
		this.putFieldRaw32From(ret, field.posAbs, pos);
		return ret;
	};

	/**
	 * 
	 * @param {Number}
	 *            handle
	 * @returns {Number}
	 */
	FyHeap.prototype.unwrapLongTo = function(handle, pos) {
		var clazz = this.context.lookupClass(FyConst.FY_BASE_LONG);
		var field = this.context.getField(FyConst.FY_VALUE_LONG);
		this.context.lookupClass(FyConst.FY_PRIM_LONG);
		if (this.getObjectClass(handle) !== clazz) {
			throw new FyException(FyConst.FY_EXCEPTION_ARGU,
					"Can't unwrap handle=" + handle + " as long");
		}
		this.getFieldRaw64To(handle, field.posAbs, pos);
	};

	/**
	 * @param {Number}
	 *            value
	 * @returns {Number}
	 */
	FyHeap.prototype.wrapLongFrom = function(pos) {
		var clazz = this.context.lookupClass(FyConst.FY_BASE_LONG);
		var field = this.context.getField(FyConst.FY_VALUE_LONG);
		var ret = this.allocate(clazz);
		this.putFieldRaw64From(ret, field.posAbs, pos);
		return ret;
	};

	/**
	 * 
	 * @param {Number}
	 *            handle
	 * @returns {Number}
	 */
	FyHeap.prototype.unwrapDoubleTo = function(handle, pos) {
		var clazz = this.context.lookupClass(FyConst.FY_BASE_DOUBLE);
		var field = this.context.getField(FyConst.FY_VALUE_DOUBLE);
		this.context.lookupClass(FyConst.FY_PRIM_DOUBLE);
		if (this.getObjectClass(handle) !== clazz) {
			throw new FyException(FyConst.FY_EXCEPTION_ARGU,
					"Can't unwrap handle=" + handle + " as double");
		}

		this.getFieldRaw64To(handle, field.posAbs, pos);
	};

	/**
	 * @param {Number}
	 *            value
	 * @returns {Number}
	 */
	FyHeap.prototype.wrapDoubleFrom = function(pos) {
		var clazz = this.context.lookupClass(FyConst.FY_BASE_DOUBLE);
		var field = this.context.getField(FyConst.FY_VALUE_DOUBLE);
		var ret = this.allocate(clazz);
		this.putFieldRaw64From(ret, field.posAbs, pos);
		return ret;
	};

})();