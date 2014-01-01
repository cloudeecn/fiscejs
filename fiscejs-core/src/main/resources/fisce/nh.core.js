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

(function() {
	"use strict";

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {Number}
	 *            ops
	 */
	function vmLogOut(context, thread, ops) {
		// Level,Content
		var stack = thread.stack;
		var sb = thread.sp;
		var level = stack[sb];
		var content = context.heap.getString(stack[sb + 1]);
		context.log(level, content);

		return ops - 1;
	}

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {Number}
	 *            ops
	 */
	function vmThrowOut(context, thread, ops) {
		var stack = thread.stack;
		var sb = thread.sp;
		thread.currentThrowable = stack[sb];
		context.panic("Explicted FiScEVM.throwOut called", new Error());
		return ops - 1;
	}

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {Number}
	 *            ops
	 */
	function vmExit(context, thread, ops) {
		var stack = thread.stack;
		var sb = thread.sp;
		// TODO
		context.panic("Exited with code: " + stack[sb], new Error());

		return ops - 1;
	}

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {Number}
	 *            ops
	 */
	function vmDecode(context, thread, ops) {
		// String encoding, byte[] src, int ofs, int len
		var stack = thread.stack;
		var sb = thread.sp;
		var src = stack[sb + 1];
		var ofs = stack[sb + 2];
		var len = stack[sb + 3];
		var arr = new Array(len);
		var i = 0;
		var resultArr = new Array(len);
		for (i = 0; i < len; i++) {
			arr[i] = context.heap.getArrayByte(src, i + ofs);
		}
		ofs = 0;
		i = 0;
		while (ofs < len) {
			ofs += FyUtils.utf8Decode(arr, ofs, resultArr, i);
			i++;
		}
		var resultHandle = context.heap.allocateArray(
				context.lookupClass("[C"), i);
		while (i > 0) {
			i--;
			context.heap.putArrayChar(resultHandle, i, resultArr[i]);
		}
		// console.log([ "decode", arr, resultArr ]);
		thread.nativeReturnInt(resultHandle);
		return ops - len;
	}

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {Number}
	 *            ops
	 */
	function vmEncode(context, thread, ops) {
		// String encoding, char[] src, int ofs, int len
		var stack = thread.stack;
		var sb = thread.sp;
		var src = stack[sb + 1];
		var ofs = stack[sb + 2];
		var len = stack[sb + 3];
		var resultPos = 0;
		var resultArr = new Array(len * 3);
		for (var i = 0; i < len; i++) {
			resultPos += FyUtils.utf8Encode(context.heap.getArrayChar(src, i
					+ ofs), resultArr, resultPos);
			// console.log([ "encode#", context.heap.getArrayChar(src, i
			// + ofs) ]);
		}
		var resultHandle = context.heap.allocateArray(
				context.lookupClass("[B"), resultPos);
		for (var i = 0; i < resultPos; i++) {
			context.heap.putArrayByte(resultHandle, i, resultArr[i]);
		}
		// console.log([ "encode", resultArr ]);
		thread.nativeReturnInt(resultHandle);
		return ops - len;
	}

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {Number}
	 *            ops
	 */
	function vmStringToDouble(context, thread, ops) {
		var stack = thread.stack;
		var sb = thread.sp;
		var str = context.heap.getString(stack[sb]);
		var num = Number(str);
		thread.nativeReturnDouble(num);
		return ops - 1;
	}

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {Number}
	 *            ops
	 */
	function vmDoubleToString(context, thread, ops) {
		var stack = thread.stack;
		var sb = thread.sp;
		var num = FyPortable.ieee64ToDouble(stack, sb);
		var str = num.toString();
		var handle = context.heap.allocate(context
				.lookupClass(FyConst.FY_BASE_STRING));
		thread.nativeReturnInt(handle);
		context.heap.fillString(handle, str);
		return ops - 1;
	}

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {Number}
	 *            ops
	 */
	function vmStringToFloat(context, thread, ops) {
		var stack = thread.stack;
		var sb = thread.sp;
		var str = context.heap.getString(stack[sb]);
		var num = Number(str);
		thread.nativeReturnFloat(num);
		return ops - 1;
	}

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {Number}
	 *            ops
	 */
	function vmFloatToString(context, thread, ops) {
		var stack = thread.stack;
		var sb = thread.sp;
		var num = FyPortable.ieee32ToFloat(stack[sb]);
		var str = num.toString();
		var handle = context.heap.allocate(context
				.lookupClass(FyConst.FY_BASE_STRING));
		thread.nativeReturnInt(handle);
		context.heap.fillString(handle, str);
		return ops - 1;
	}

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {Number}
	 *            ops
	 */
	function vmBreakpoint(context, thread, ops) {
		var i = 0;
		i++;
		// TODO put breakpoint here
		i++;

		return ops - 1;
	}

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {Number}
	 *            ops
	 */
	function finalizerGetFinalizee(context, thread, ops) {
		var heap = context.heap;
		thread.nativeReturnInt(heap.getFinalizee());
		return ops - 1;
	}

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {Number}
	 *            ops
	 */
	function finalizerGetReferencesToEnqueue(context, thread, ops) {
		var heap = context.heap;
		thread.nativeReturnInt(heap.getReferencesToEnqueue());
		return ops - 1;
	}

	/**
	 * <code>
	 * 
	 * 
	 * 
	 * 
	 * 
	 * 
	 * 
	 * 
	 * 
	 * 
	 * 
	 * 
	 * 
	 * 
	 * 
	 * 
	 * 
	 * 
	 * 
	 * 
	 * 
	 * 
	 * 
	 * 
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
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {Number}
	 *            ops
	 */
	function throwableFillInStackTrace(context, thread, ops) {
		var stack = thread.stack;
		var sb = thread.sp;
		thread.fillStackTrace(stack[sb], true);

		return ops - 1;
	}

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {Number}
	 *            ops
	 */
	function systemInputStreamRead0(context, thread, ops) {
		// TODO: stub
		thread.nativeReturnInt(0);
		return ops - 1;
	}

	var displayBuffer = [];

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {Number}
	 *            ops
	 */
	function systemOutStreamWrite(context, thread, ops) {
		var stack = thread.stack;
		var sb = thread.sp;
		if (stack[sb + 1] === 10 || stack[sb + 1] === 13) {
			console.log(String.fromCharCode.apply(undefined, displayBuffer));
			displayBuffer = [];
		} else {
			displayBuffer.push(stack[sb + 1]);
			if (displayBuffer.length >= 132) {
				// throw String.fromCharCode.apply(undefined, displayBuffer);
				console
						.log(String.fromCharCode
								.apply(undefined, displayBuffer));
				displayBuffer = [];
			}
		}

		return ops - 1;
	}

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {Number}
	 *            ops
	 */
	function systemSetIn(context, thread, ops) {
		// TODO: stub

		return ops - 1;
	}

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {Number}
	 *            ops
	 */
	function systemSetOut(context, thread, ops) {
		// TODO: stub

		return ops - 1;
	}

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {Number}
	 *            ops
	 */
	function systemSetErr(context, thread, ops) {
		// TODO: stub

		return ops - 1;
	}

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {Number}
	 *            ops
	 */
	function systemGetProperty(context, thread, ops) {
		// TODO: stub
		thread.nativeReturnInt(0);
		return ops - 1;
	}

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {Number}
	 *            ops
	 */
	function systemSetProperty(context, thread, ops) {
		// TODO: stub
		return ops - 1;
	}

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {Number}
	 *            ops
	 */
	function systemGC(context, thread, ops) {
		context.heap.gc(0);
		return ops - 1;
	}

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {Number}
	 *            ops
	 */
	function systemExit(context, thread, ops) {
		// TODO
		throw "exited";
		return ops - 1;
	}

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {Number}
	 *            ops
	 */
	function systemArrayCopy(context, thread, ops) {
		var stack = thread.stack;
		var sb = thread.sp;
		context.heap.arrayCopy(stack[sb], stack[sb + 1], stack[sb + 2],
				stack[sb + 3], stack[sb + 4]);
		return ops - 1;
	}

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {Number}
	 *            ops
	 */
	function systemTimeMS(context, thread, ops) {
		var sb = thread.sp;
		thread.longOps.longFromNumber(sb, Date.now());
		thread.nativeReturn(2);
		return ops - 1;
	}

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {Number}
	 *            ops
	 */
	function systemTimeNS(context, thread, ops) {
		var sb = thread.sp;
		thread.longOps.longFromNumber(sb, performance.now() * 1000000);
		thread.nativeReturn(2);
		return ops - 1;
	}

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {Number}
	 *            ops
	 */
	function systemIdentityHashCode(context, thread, ops) {
		var stack = thread.stack;
		var sb = thread.sp;
		thread.nativeReturnInt(stack[sb]);
		return ops - 1;
	}

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {Number}
	 *            ops
	 */
	function runtimeFreeMemory(context, thread, ops) {
		// TODO
		thread.nativeReturnLong([ 0, 0 ], 0);
		return ops - 1;
	}

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {Number}
	 *            ops
	 */
	function runtimeTotalMemory(context, thread, ops) {
		// TODO
		thread.nativeReturnLong([ 0, 0 ], 0);
		return ops - 1;
	}

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {Number}
	 *            ops
	 */
	function runtimeMaxMemory(context, thread, ops) {
		// TODO
		thread.nativeReturnLong([ 0, 0 ], 0);
		return ops - 1;
	}

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {Number}
	 *            ops
	 */
	function stringIntern(context, thread, ops) {
		var stack = thread.stack;
		var sb = thread.sp;
		var str = context.heap.getString(stack[sb]);
		thread.nativeReturnInt(context.heap.literal(str));
		return ops - 1;
	}

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {Number}
	 *            ops
	 */
	function doubleLongBitsToDouble(context, thread, ops) {
		thread.nativeReturn(2);
		return ops;
	}

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {Number}
	 *            ops
	 */
	function floatIntBitsToFloat(context, thread, ops) {
		thread.nativeReturn(1);
		return ops - 1;
	}

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {Number}
	 *            ops
	 */
	function objectGetClass(context, thread, ops) {
		var stack = thread.stack;
		var sb = thread.sp;
		thread.nativeReturnInt(context.getClassObjectHandle(context.heap
				.getObjectClass(stack[sb])));
		return ops - 1;
	}

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {Number}
	 *            ops
	 */
	function objectClone(context, thread, ops) {
		var stack = thread.stack;
		var sb = thread.sp;
		thread.nativeReturnInt(context.heap.clone(stack[sb]));
		return ops - 1;
	}

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {Number}
	 *            ops
	 */
	function objectWait(context, thread, ops) {
		var stack = thread.stack;
		var sb = thread.sp;
		context.threadManager.wait(thread, stack[sb], thread.longOps
				.longToNumber(sb + 1));
		return 0;
	}

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {Number}
	 *            ops
	 */
	function objectNotify(context, thread, ops) {
		var stack = thread.stack;
		var sb = thread.sp;
		context.threadManager.notify(thread, stack[sb], false);
		return ops - 1;
	}

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {Number}
	 *            ops
	 */
	function objectNorifyAll(context, thread, ops) {
		var stack = thread.stack;
		var sb = thread.sp;
		context.threadManager.notify(thread, stack[sb], true);
		return ops - 1;
	}

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {Number}
	 *            ops
	 */
	function threadCurrentThread(context, thread, ops) {
		thread.nativeReturnInt(thread.handle);
		return ops - 1;
	}

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {Number}
	 *            ops
	 */
	function threadSetPriority(context, thread, ops) {
		var stack = thread.stack;
		var sb = thread.sp;
		var target = context.threadManager._getThreadByHandle(stack[sb]);
		if (target) {
			target.priority = stack[sb + 1];
		}
		return ops - 1;
	}

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {Number}
	 *            ops
	 */
	function threadIsAlive(context, thread, ops) {
		var stack = thread.stack;
		var sb = thread.sp;
		thread
				.nativeReturnInt(context.threadManager.isAlive(stack[sb]) ? 1
						: 0);
		return ops - 1;
	}

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {Number}
	 *            ops
	 */
	function threadInterrupt(context, thread, ops) {
		var stack = thread.stack;
		var sb = thread.sp;
		context.threadManager.interrupt(stack[sb]);
		if (context.heap.getObjectMultiUsageData(stack[sb]) === thread.threadId) {
			return 0;
		} else {
			return ops - 1;
		}
	}

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {Number}
	 *            ops
	 */
	function threadInterrupted(context, thread, ops) {
		var stack = thread.stack;
		var sb = thread.sp;
		thread.nativeReturnInt(context.threadManager.isInterrupted(stack[sb],
				stack[sb + 1] ? true : false) ? 1 : 0);
		return ops - 1;
	}

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {Number}
	 *            ops
	 */
	function threadStart(context, thread, ops) {
		var stack = thread.stack;
		var sb = thread.sp;
		context.threadManager.pushThread(stack[sb]);
		return ops - 1;
	}

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {Number}
	 *            ops
	 */
	function threadSleep(context, thread, ops) {
		var sb = thread.sp;
		context.threadManager.sleep(thread, thread.longOps.longToNumber(sb));
		return 0;
	}

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {Number}
	 *            ops
	 */
	function refRegister(context, thread, ops) {
		var heap = context.heap;
		var stack = thread.stack;
		heap.registerReference(stack[thread.sp], stack[thread.sp + 1]);
		return ops - 1;
	}

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {Number}
	 *            ops
	 */
	function refClear(context, thread, ops) {
		var heap = context.heap;
		var stack = thread.stack;
		heap.clearReference(stack[thread.sp]);
		return ops - 1;
	}

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {Number}
	 *            ops
	 */
	function refGet(context, thread, ops) {
		thread.nativeReturnInt(context.heap
				.getReferent(thread.stack[thread.sp]));
		return ops - 1;
	}

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {Number}
	 *            ops
	 */
	function threadYield(context, thread, ops) {
		thread.yield = true;
		return 0;
	}

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {Number}
	 *            ops
	 */
	function proxyDefineClass(context, thread, ops) {
		context.lookupClass("com/cirnoworks/fisce/js/ProxyHelper");
		var method = context
				.getMethod("com/cirnoworks/fisce/js/ProxyHelper.defineClass.(Ljava/lang/ClassLoader;Ljava/lang/String;[B)Ljava/lang/Class;");
		// thread.sp += 3;
		thread.pushMethod(method, ops - 1);
		return 0;
	}

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {Number}
	 *            ops
	 */
	function risBind(context, thread, ops) {
		var heap = context.heap;
		var stack = thread.stack;
		var sb = thread.sp;
		var nameHandle = stack[sb + 1];
		var pos = stack[sb + 2];
		if (nameHandle === 0) {
			throw new FyException(FyConst.FY_EXCEPTION_NPT, "name");
		}
		var name = heap.getString(nameHandle);
		// console.log("#VFS bind #" + stack[sb] + " to " + name);
		context.vfs.bind(stack[sb], name, pos);
		return ops - 1;
	}

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {Number}
	 *            ops
	 */
	function risRead(context, thread, ops) {
		var stack = thread.stack;
		var sb = thread.sp;
		thread.nativeReturnInt(context.vfs.read(stack[sb]));
		return ops - 1;
	}

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {Number}
	 *            ops
	 */
	function risReadTo(context, thread, ops) {
		var heap = context.heap;
		var _heap8 = heap._heap8;
		var stack = thread.stack;
		var sb = thread.sp;
		var targetHandle = stack[sb + 1];
		var pos = stack[sb + 2];
		var len = stack[sb + 3];
		if (targetHandle === 0) {
			throw new FyException(FyConst.FY_EXCEPTION_NPT, "b");
		}
		if (pos + len > heap.arrayLength(targetHandle)) {
			throw new FyException(FyConst.FY_EXCEPTION_AIOOB, pos + "+" + len
					+ "/" + heap.arrayLength(targetHandle));
		}
		var heapPos = (heap.arrayPos(targetHandle) << 2) + pos;
		thread.nativeReturnInt(context.vfs.readTo(stack[sb], _heap8, heapPos,
				len));
		return ops - 1;
	}

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {Number}
	 *            ops
	 */
	function risClose(context, thread, ops) {
		var stack = thread.stack;
		var sb = thread.sp;
		// console.log("#VFS close #" + stack[sb]);
		context.vfs.close(stack[sb]);
		return ops - 1;
	}

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {Number}
	 *            ops
	 */
	function proxyHelperDefineClass(context, thread, ops) {
		var str = context.heap.getString(thread.stack[thread.sp]);
		var data = JSON.parse(str);
		context.addClassDef(data);
		return ops - 1;
	}

	FyContext.registerStaticNH(
			"com/cirnoworks/fisce/privat/SystemInputStream.read0.()I",
			systemInputStreamRead0);
	FyContext.registerStaticNH(
			"com/cirnoworks/fisce/privat/SystemOutputStream.write0.(IL"
					+ FyConst.FY_BASE_STRING + ";)V", systemOutStreamWrite);

	FyContext.registerStaticNH(FyConst.FY_BASE_DOUBLE
			+ ".longBitsToDouble.(J)D", doubleLongBitsToDouble);
	FyContext.registerStaticNH(FyConst.FY_BASE_DOUBLE
			+ ".doubleToRawLongBits.(D)J", doubleLongBitsToDouble);
	FyContext.registerStaticNH(FyConst.FY_BASE_FLOAT + ".intBitsToFloat.(I)F",
			floatIntBitsToFloat);
	FyContext.registerStaticNH(FyConst.FY_BASE_FLOAT
			+ ".floatToRawIntBits.(F)I", floatIntBitsToFloat);
	FyContext.registerStaticNH(FyConst.FY_BASE_STRING + ".intern.()L"
			+ FyConst.FY_BASE_STRING + ";", stringIntern);

	FyContext.registerStaticNH(FyConst.FY_BASE_RUNTIME + ".freeMemory.()J",
			runtimeFreeMemory);
	FyContext.registerStaticNH(FyConst.FY_BASE_RUNTIME + ".totalMemory.()J",
			runtimeTotalMemory);
	FyContext.registerStaticNH(FyConst.FY_BASE_RUNTIME + ".maxMemory.()J",
			runtimeMaxMemory);

	FyContext.registerStaticNH(FyConst.FY_BASE_SYSTEM + ".setIn0.(L"
			+ FyConst.FY_IO_INPUTSTREAM + ";)V", systemSetIn);
	FyContext.registerStaticNH(FyConst.FY_BASE_SYSTEM + ".setOut0.(L"
			+ FyConst.FY_IO_PRINTSTREAM + ";)V", systemSetOut);
	FyContext.registerStaticNH(FyConst.FY_BASE_SYSTEM + ".setErr0.(L"
			+ FyConst.FY_IO_PRINTSTREAM + ";)V", systemSetErr);
	FyContext.registerStaticNH(FyConst.FY_BASE_SYSTEM + ".setProperty0.(L"
			+ FyConst.FY_BASE_STRING + ";L" + FyConst.FY_BASE_STRING + ";)L"
			+ FyConst.FY_BASE_STRING + ";", systemSetProperty);
	FyContext.registerStaticNH(FyConst.FY_BASE_SYSTEM + ".getProperty0.(L"
			+ FyConst.FY_BASE_STRING + ";)L" + FyConst.FY_BASE_STRING + ";",
			systemGetProperty);
	FyContext
			.registerStaticNH(FyConst.FY_BASE_SYSTEM + ".arraycopy.(L"
					+ FyConst.FY_BASE_OBJECT + ";IL" + FyConst.FY_BASE_OBJECT
					+ ";II)V", systemArrayCopy);
	FyContext.registerStaticNH(FyConst.FY_BASE_SYSTEM
			+ ".currentTimeMillis.()J", systemTimeMS);
	FyContext.registerStaticNH(FyConst.FY_BASE_SYSTEM + ".nanoTime.()J",
			systemTimeNS);
	FyContext.registerStaticNH(FyConst.FY_BASE_SYSTEM + ".identityHashCode.(L"
			+ FyConst.FY_BASE_OBJECT + ";)I", systemIdentityHashCode);
	FyContext.registerStaticNH(FyConst.FY_BASE_SYSTEM + ".gc.()V", systemGC);
	FyContext.registerStaticNH(FyConst.FY_BASE_SYSTEM + ".exit.(I)V",
			systemExit);

	FyContext.registerStaticNH(FyConst.FY_BASE_OBJECT + ".clone.()L"
			+ FyConst.FY_BASE_OBJECT + ";", objectClone);
	FyContext.registerStaticNH(FyConst.FY_BASE_OBJECT + ".getClass.()L"
			+ FyConst.FY_BASE_CLASS + ";", objectGetClass);
	FyContext.registerStaticNH(FyConst.FY_BASE_OBJECT + ".wait.(J)V",
			objectWait);
	FyContext.registerStaticNH(FyConst.FY_BASE_OBJECT + ".notify.()V",
			objectNotify);
	FyContext.registerStaticNH(FyConst.FY_BASE_OBJECT + ".notifyAll.()V",
			objectNorifyAll);

	FyContext.registerStaticNH(FyConst.FY_BASE_THROWABLE
			+ ".fillInStackTrace0.()V", throwableFillInStackTrace);

	FyContext.registerStaticNH(FyConst.FY_BASE_VM + ".logOut0.(IL"
			+ FyConst.FY_BASE_STRING + ";)V", vmLogOut);
	FyContext.registerStaticNH(FyConst.FY_BASE_VM + ".throwOut.(L"
			+ FyConst.FY_BASE_THROWABLE + ";)V", vmThrowOut);
	FyContext.registerStaticNH(FyConst.FY_BASE_VM + ".exit.(I)V", vmExit);
	FyContext.registerStaticNH(FyConst.FY_BASE_VM + ".decode.(L"
			+ FyConst.FY_BASE_STRING + ";[BII)[C", vmDecode);
	FyContext.registerStaticNH(FyConst.FY_BASE_VM + ".encode.(L"
			+ FyConst.FY_BASE_STRING + ";[CII)[B", vmEncode);
	FyContext.registerStaticNH(FyConst.FY_BASE_VM + ".getDoubleRaw.(D)J",
			doubleLongBitsToDouble);
	FyContext.registerStaticNH(FyConst.FY_BASE_VM + ".getFloatRaw.(F)[I",
			floatIntBitsToFloat);
	FyContext.registerStaticNH(FyConst.FY_BASE_VM + ".stringToDouble.(L"
			+ FyConst.FY_BASE_STRING + ";)D", vmStringToDouble);
	FyContext.registerStaticNH(FyConst.FY_BASE_VM + ".stringToFloat.(L"
			+ FyConst.FY_BASE_STRING + ";)F", vmStringToFloat);
	FyContext.registerStaticNH(FyConst.FY_BASE_VM + ".floatToString.(F)L"
			+ FyConst.FY_BASE_STRING + ";", vmFloatToString);
	FyContext.registerStaticNH(FyConst.FY_BASE_VM + ".doubleToString.(D)L"
			+ FyConst.FY_BASE_STRING + ";", vmDoubleToString);
	FyContext.registerStaticNH(FyConst.FY_BASE_VM + ".breakpoint.()V",
			vmBreakpoint);

	FyContext.registerStaticNH(FyConst.FY_BASE_THREAD + ".currentThread.()L"
			+ FyConst.FY_BASE_THREAD + ";", threadCurrentThread);
	FyContext.registerStaticNH(FyConst.FY_BASE_THREAD + ".setPriority0.(I)V",
			threadSetPriority);
	FyContext.registerStaticNH(FyConst.FY_BASE_THREAD + ".isAlive.()Z",
			threadIsAlive);
	FyContext.registerStaticNH(FyConst.FY_BASE_THREAD + ".start0.()V",
			threadStart);
	FyContext.registerStaticNH(FyConst.FY_BASE_THREAD + ".interrupt0.()V",
			threadInterrupt);
	FyContext.registerStaticNH(FyConst.FY_BASE_THREAD + ".isInterrupted.(Z)Z",
			threadInterrupted);
	FyContext.registerStaticNH(FyConst.FY_BASE_THREAD + ".sleep.(J)V",
			threadSleep);
	FyContext.registerStaticNH(FyConst.FY_BASE_THREAD + ".yield.()V",
			threadYield);

	FyContext.registerStaticNH(FyConst.FY_REF + ".register.(L"
			+ FyConst.FY_BASE_OBJECT + ";)V", refRegister);
	FyContext.registerStaticNH(FyConst.FY_REF + ".clear0.()V", refClear);
	FyContext.registerStaticNH(FyConst.FY_REF + ".get0.()L"
			+ FyConst.FY_BASE_OBJECT + ";", refGet);

	FyContext.registerStaticNH(FyConst.FY_BASE_FINALIZER
			+ ".getReferencesToEnqueue.()[L" + FyConst.FY_REF + ";",
			finalizerGetReferencesToEnqueue);
	FyContext.registerStaticNH(FyConst.FY_BASE_FINALIZER + ".getFinalizee.()[L"
			+ FyConst.FY_BASE_OBJECT + ";", finalizerGetFinalizee);
	FyContext.registerStaticNH("java/lang/reflect/Proxy.defineClassImpl.(L"
			+ FyConst.FY_BASE_CLASSLOADER + ";L" + FyConst.FY_BASE_STRING
			+ ";[B)L" + FyConst.FY_BASE_CLASS + ";", proxyDefineClass);

	FyContext.registerStaticNH(
			"com/cirnoworks/fisce/js/ProxyHelper.defineClassViaJSON.(L"
					+ FyConst.FY_BASE_STRING + ";)V", proxyHelperDefineClass);
	FyContext
			.registerStaticNH(
					"com/cirnoworks/fisce/privat/ResourceInputStream.bind0.(Ljava/lang/String;I)V",
					risBind);
	FyContext.registerStaticNH(
			"com/cirnoworks/fisce/privat/ResourceInputStream.read0.()I",
			risRead);
	FyContext.registerStaticNH(
			"com/cirnoworks/fisce/privat/ResourceInputStream.read0.([BII)I",
			risReadTo);
	FyContext.registerStaticNH(
			"com/cirnoworks/fisce/privat/ResourceInputStream.close0.()V",
			risClose);

	FyContext.registerStaticNH("com/cirnoworks/fisce/privat/FiScEVM.save.()V",
			function() {/* TODO */
		return 0;
			});
})();