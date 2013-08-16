(function() {
	"use strict";

	var coreHandlers = {};

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {Number}
	 *            ops
	 */
	function vmNewArray(context, thread, ops) {
		// TODO move to Array
		var stack = thread.stack;
		var sb = thread.sp;
		var clazz = context.getClassFromClassObject(stack[sb]);
		clazz = context.lookupClass(FyClassLoader.getArrayName(clazz.name));
		stack[sb] = context.heap.allocateArray(clazz, stack[sb + 1]);
		thread.nativeReturn(1);
		return ops - 5;
	}

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
		thread.nativeReturn();
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
		context.panic("Explicted FiScEVM.throwOut called");
		thread.nativeReturn();
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
		context.panic("Exited with code: " + stack[sb]);
		thread.nativeReturn();
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
		for ( var i = 0; i < len; i++) {
			resultPos += FyUtils.utf8Encode(context.heap.getArrayChar(src, i
					+ ofs), resultArr, resultPos);
		}
		var resultHandle = context.heap.allocateArray(
				context.lookupClass("[B"), resultPos);
		for ( var i = 0; i < resultPos; i++) {
			context.heap.putArrayByte(resultHandle, i, resultArr[i]);
		}
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
		thread.nativeReturn();
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
		var stack = thread.stack;
		var sb = thread.sp;
		// TODO
		thread.nativeReturnInt(context.heap.allocateArray(
				context.lookupClass(FyClassLoader
						.getArrayName(FyConst.FY_BASE_OBJECT)), 0));
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
		var stack = thread.stack;
		var sb = thread.sp;
		// TODO
		thread.nativeReturnInt(context.heap.allocateArray(
				context.lookupClass(FyClassLoader
						.getArrayName(FyConst.FY_BASE_OBJECT)), 0));
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
		thread.nativeReturn();
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
//				throw String.fromCharCode.apply(undefined, displayBuffer);
				console
						.log(String.fromCharCode
								.apply(undefined, displayBuffer));
				displayBuffer = [];
			}
		}
		thread.nativeReturn();
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
		thread.nativeReturn();
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
		thread.nativeReturn();
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
		thread.nativeReturn();
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
		thread.nativeReturn();
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
		// TODO: stub
		thread.nativeReturn();
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
		thread.nativeReturn();
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
		thread.nativeReturn();
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
		var stack = thread.stack;
		var sb = thread.sp;
		FyPortable.doubleToLong(FyPortable.now(), stack, sb);
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
		var stack = thread.stack;
		var sb = thread.sp;
		FyPortable.doubleToLong(FyPortable.now() * 1000000, stack, sb);
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
		var obj = context.heap.getObject(stack[sb]);
		thread.nativeReturnInt(context.getClassObjectHandle(obj.clazz));
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
		// TODO
		thread.nativeReturn();
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
	function objectNotify(context, thread, ops) {
		var stack = thread.stack;
		var sb = thread.sp;
		// TODO
		thread.nativeReturn();
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
		// TODO
		thread.nativeReturn();
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
		// TODO
		thread.nativeReturn();
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
		// TODO
		thread.nativeReturnInt(1);
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
		// TODO
		thread.nativeReturn();
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
	function threadInterrupted(context, thread, ops) {
		var stack = thread.stack;
		var sb = thread.sp;
		// TODO
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
	function threadStart(context, thread, ops) {
		var stack = thread.stack;
		var sb = thread.sp;
		// TODO
		thread.nativeReturn();
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
		var stack = thread.stack;
		var sb = thread.sp;
		// TODO
		thread.nativeReturn();
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
		thread.nativeReturn();
		return 0;
	}

	FyContext.registerStaticNH(
			"com/cirnoworks/fisce/privat/SystemInputStream.read0.()I",
			systemInputStreamRead0);
	FyContext.registerStaticNH(
			"com/cirnoworks/fisce/privat/SystemOutputStream.write0.(IL"
					+ FyConst.FY_BASE_STRING + ";)V", systemOutStreamWrite);

	FyContext.registerStaticNH(FyConst.FY_BASE_DOUBLE
			+ ".longBitsToDouble.(J)D", doubleLongBitsToDouble);
	FyContext.registerStaticNH(FyConst.FY_BASE_FLOAT + ".intBitsToFloat.(I)F",
			floatIntBitsToFloat);
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

})();