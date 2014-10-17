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
 * @param {FyContext}
 *            context
 */
function fyRegisterNativeCore(context) {
  "use strict";

  /**
   * @param {FyContext}
   *            context
   * @param {FyThread}
   *            thread
   * @param {number}
   *            ops
   */
  function vmLogOut(context, thread, sp, ops) {
    // Level,Content
    var stack = thread.stack;

    var level = stack[sp];
    var content = context.heap.getString(stack[sp + 1]);
    context.log(level, content);

    return ops - 1;
  }

  /**
   * @param {FyContext}
   *            context
   * @param {FyThread}
   *            thread
   * @param {number}
   *            ops
   */
  function vmThrowOut(context, thread, sp, ops) {
    var stack = thread.stack;

    thread.currentThrowable = stack[sp];
    context.panic("Explicted FiScEVM.throwOut called", new Error());
    return ops - 1;
  }

  /**
   * @param {FyContext}
   *            context
   * @param {FyThread}
   *            thread
   * @param {number}
   *            ops
   */
  function vmExit(context, thread, sp, ops) {
    var stack = thread.stack;

    // TODO
    context.panic("Exited with code: " + stack[sp], new Error());

    return ops - 1;
  }

  /**
   * @param {FyContext}
   *            context
   * @param {FyThread}
   *            thread
   * @param {number}
   *            ops
   */
  function vmDecode(context, thread, sp, ops) {
    // String encoding, byte[] src, int ofs, int len
    var stack = thread.stack;

    var src = stack[sp + 1];
    var ofs = stack[sp + 2];
    var len = stack[sp + 3];
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
    thread.nativeReturnInt(sp, resultHandle);
    return ops - len;
  }

  /**
   * @param {FyContext}
   *            context
   * @param {FyThread}
   *            thread
   * @param {number}
   *            ops
   */
  function vmEncode(context, thread, sp, ops) {
    // String encoding, char[] src, int ofs, int len
    var stack = thread.stack;

    var src = stack[sp + 1];
    var ofs = stack[sp + 2];
    var len = stack[sp + 3];
    var resultPos = 0;
    var resultArr = new Array(len * 3);
    for (var i = 0; i < len; i++) {
      resultPos += FyUtils.utf8Encode(context.heap.getArrayChar(src, i + ofs), resultArr, resultPos);
      // console.log([ "encode#", context.heap.getArrayChar(src, i
      // + ofs) ]);
    }
    var resultHandle = context.heap.allocateArray(
      context.lookupClass("[B"), resultPos);
    for (var i = 0; i < resultPos; i++) {
      context.heap.putArrayByte(resultHandle, i, resultArr[i]);
    }
    // console.log([ "encode", resultArr ]);
    thread.nativeReturnInt(sp, resultHandle);
    return ops - len;
  }

  /**
   * @param {FyContext}
   *            context
   * @param {FyThread}
   *            thread
   * @param {number}
   *            ops
   */
  function vmStringToDouble(context, thread, sp, ops) {
    var stack = thread.stack;

    var str = context.heap.getString(stack[sp]);
    var num = Number(str);
    thread.nativeReturnDouble(sp, num);
    return ops - 1;
  }

  /**
   * @param {FyContext}
   *            context
   * @param {FyThread}
   *            thread
   * @param {number}
   *            ops
   */
  function vmDoubleToString(context, thread, sp, ops) {
    var stack = thread.stack;

    var num = FyPortable.ieee64ToDouble(stack, sp);
    var str = num.toString();
    var handle = context.heap.allocate(context
      .lookupClass(FyConst.FY_BASE_STRING));
    thread.nativeReturnInt(sp, handle);
    context.heap.fillString(handle, str);
    return ops - 1;
  }

  /**
   * @param {FyContext}
   *            context
   * @param {FyThread}
   *            thread
   * @param {number}
   *            ops
   */
  function vmStringToFloat(context, thread, sp, ops) {
    var stack = thread.stack;

    var str = context.heap.getString(stack[sp]);
    var num = Number(str);
    thread.nativeReturnFloat(sp, num);
    return ops - 1;
  }

  /**
   * @param {FyContext}
   *            context
   * @param {FyThread}
   *            thread
   * @param {number}
   *            ops
   */
  function vmFloatToString(context, thread, sp, ops) {
    var stack = thread.stack;

    var num = FyPortable.ieee32ToFloat(stack[sp]);
    var str = num.toString();
    var handle = context.heap.allocate(context
      .lookupClass(FyConst.FY_BASE_STRING));
    thread.nativeReturnInt(sp, handle);
    context.heap.fillString(handle, str);
    return ops - 1;
  }

  /**
   * @param {FyContext}
   *            context
   * @param {FyThread}
   *            thread
   * @param {number}
   *            ops
   */
  function vmBreakpoint(context, thread, sp, ops) {
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
   * @param {number}
   *            ops
   */
  function finalizerGetFinalizee(context, thread, sp, ops) {
    var heap = context.heap;
    thread.nativeReturnInt(sp, heap.getFinalizee());
    return ops - 1;
  }

  /**
   * @param {FyContext}
   *            context
   * @param {FyThread}
   *            thread
   * @param {number}
   *            ops
   */
  function finalizerGetReferencesToEnqueue(context, thread, sp, ops) {
    var heap = context.heap;
    thread.nativeReturnInt(sp, heap.getReferencesToEnqueue());
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
   * @param {number}
   *            ops
   */
  function throwableFillInStackTrace(context, thread, sp, ops) {
    var stack = thread.stack;

    thread.fillStackTrace(stack[sp], true);

    return ops - 1;
  }

  /**
   * @param {FyContext}
   *            context
   * @param {FyThread}
   *            thread
   * @param {number}
   *            ops
   */
  function systemInputStreamRead0(context, thread, sp, ops) {
    // TODO: stub
    thread.nativeReturnInt(sp, 0);
    return ops - 1;
  }

  var displayBuffer = [];

  /**
   * @param {FyContext}
   *            context
   * @param {FyThread}
   *            thread
   * @param {number}
   *            ops
   */
  function systemOutStreamWrite(context, thread, sp, ops) {
    var stack = thread.stack;

    if (stack[sp + 1] === 10 || stack[sp + 1] === 13) {
      console.log(String.fromCharCode.apply(null, displayBuffer));
      displayBuffer = [];
    } else {
      displayBuffer.push(stack[sp + 1]);
      if (displayBuffer.length >= 132) {
        // throw String.fromCharCode.apply(null, displayBuffer);
        console
          .log(String.fromCharCode
            .apply(null, displayBuffer));
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
   * @param {number}
   *            ops
   */
  function systemSetIn(context, thread, sp, ops) {
    // TODO: stub

    return ops - 1;
  }

  /**
   * @param {FyContext}
   *            context
   * @param {FyThread}
   *            thread
   * @param {number}
   *            ops
   */
  function systemSetOut(context, thread, sp, ops) {
    // TODO: stub

    return ops - 1;
  }

  /**
   * @param {FyContext}
   *            context
   * @param {FyThread}
   *            thread
   * @param {number}
   *            ops
   */
  function systemSetErr(context, thread, sp, ops) {
    // TODO: stub

    return ops - 1;
  }

  /**
   * @param {FyContext}
   *            context
   * @param {FyThread}
   *            thread
   * @param {number}
   *            ops
   */
  function systemGetProperty(context, thread, sp, ops) {
    // TODO: stub
    thread.nativeReturnInt(sp, 0);
    return ops - 1;
  }

  /**
   * @param {FyContext}
   *            context
   * @param {FyThread}
   *            thread
   * @param {number}
   *            ops
   */
  function systemSetProperty(context, thread, sp, ops) {
    // TODO: stub
    return ops - 1;
  }

  /**
   * @param {FyContext}
   *            context
   * @param {FyThread}
   *            thread
   * @param {number}
   *            ops
   */
  function systemGC(context, thread, sp, ops) {
    context.heap.gc(0);
    return ops - 1;
  }

  /**
   * @param {FyContext}
   *            context
   * @param {FyThread}
   *            thread
   * @param {number}
   *            ops
   */
  function systemExit(context, thread, sp, ops) {
    // TODO
    throw "exited";
    // return ops - 1;
  }

  /**
   * @param {FyContext}
   *            context
   * @param {FyThread}
   *            thread
   * @param {number}
   *            ops
   */
  function systemArrayCopy(context, thread, sp, ops) {
    var stack = thread.stack;

    context.heap.arrayCopy(stack[sp], stack[sp + 1], stack[sp + 2],
      stack[sp + 3], stack[sp + 4]);
    return ops - 1;
  }

  /**
   * @param {FyContext}
   *            context
   * @param {FyThread}
   *            thread
   * @param {number}
   *            ops
   */
  function systemTimeMS(context, thread, sp, ops) {

    thread.longOps.longFromNumber(sp, Date.now());
    return ops - 1;
  }

  /**
   * @param {FyContext}
   *            context
   * @param {FyThread}
   *            thread
   * @param {number}
   *            ops
   */
  function systemTimeNS(context, thread, sp, ops) {

    thread.longOps.longFromNumber(sp, performance.now() * 1000000);
    return ops - 1;
  }

  /**
   * @param {FyContext}
   *            context
   * @param {FyThread}
   *            thread
   * @param {number}
   *            ops
   */
  function systemIdentityHashCode(context, thread, sp, ops) {
    return ops - 1;
  }

  /**
   * @param {FyContext}
   *            context
   * @param {FyThread}
   *            thread
   * @param {number}
   *            ops
   */
  function runtimeFreeMemory(context, thread, sp, ops) {
    // TODO
    thread.nativeReturnLong(sp, [0, 0], 0);
    return ops - 1;
  }

  /**
   * @param {FyContext}
   *            context
   * @param {FyThread}
   *            thread
   * @param {number}
   *            ops
   */
  function runtimeTotalMemory(context, thread, sp, ops) {
    // TODO
    thread.nativeReturnLong(sp, [0, 0], 0);
    return ops - 1;
  }

  /**
   * @param {FyContext}
   *            context
   * @param {FyThread}
   *            thread
   * @param {number}
   *            ops
   */
  function runtimeMaxMemory(context, thread, sp, ops) {
    // TODO
    thread.nativeReturnLong(sp, [0, 0], 0);
    return ops - 1;
  }

  /**
   * @param {FyContext}
   *            context
   * @param {FyThread}
   *            thread
   * @param {number}
   *            ops
   */
  function stringIntern(context, thread, sp, ops) {
    var stack = thread.stack;

    var str = context.heap.getString(stack[sp]);
    thread.nativeReturnInt(sp, context.heap.literal(str));
    return ops - 1;
  }

  /**
   * @param {FyContext}
   *            context
   * @param {FyThread}
   *            thread
   * @param {number}
   *            ops
   */
  function doubleLongBitsToDouble(context, thread, sp, ops) {
    return ops;
  }

  /**
   * @param {FyContext}
   *            context
   * @param {FyThread}
   *            thread
   * @param {number}
   *            ops
   */
  function floatIntBitsToFloat(context, thread, sp, ops) {
    return ops - 1;
  }

  /**
   * @param {FyContext}
   *            context
   * @param {FyThread}
   *            thread
   * @param {number}
   *            ops
   */
  function objectGetClass(context, thread, sp, ops) {
    var stack = thread.stack;

    thread.nativeReturnInt(sp, context.getClassObjectHandle(context.heap
      .getObjectClass(stack[sp])));
    return ops - 1;
  }

  /**
   * @param {FyContext}
   *            context
   * @param {FyThread}
   *            thread
   * @param {number}
   *            ops
   */
  function objectClone(context, thread, sp, ops) {
    var stack = thread.stack;

    thread.nativeReturnInt(sp, context.heap.clone(stack[sp]));
    return ops - 1;
  }

  /**
   * @param {FyContext}
   *            context
   * @param {FyThread}
   *            thread
   * @param {number}
   *            ops
   */
  function objectWait(context, thread, sp, ops) {
    var stack = thread.stack;

    context.threadManager.wait(thread, stack[sp], thread.longOps
      .longToNumber(sp + 1));
    return 0;
  }

  /**
   * @param {FyContext}
   *            context
   * @param {FyThread}
   *            thread
   * @param {number}
   *            ops
   */
  function objectNotify(context, thread, sp, ops) {
    var stack = thread.stack;

    context.threadManager.notify(thread, stack[sp], false);
    return ops - 1;
  }

  /**
   * @param {FyContext}
   *            context
   * @param {FyThread}
   *            thread
   * @param {number}
   *            ops
   */
  function objectNorifyAll(context, thread, sp, ops) {
    var stack = thread.stack;

    context.threadManager.notify(thread, stack[sp], true);
    return ops - 1;
  }

  /**
   * @param {FyContext}
   *            context
   * @param {FyThread}
   *            thread
   * @param {number}
   *            ops
   */
  function threadCurrentThread(context, thread, sp, ops) {
    thread.nativeReturnInt(sp, thread.handle);
    return ops - 1;
  }

  /**
   * @param {FyContext}
   *            context
   * @param {FyThread}
   *            thread
   * @param {number}
   *            ops
   */
  function threadSetPriority(context, thread, sp, ops) {
    var stack = thread.stack;

    var target = context.threadManager._getThreadByHandle(stack[sp]);
    if (target) {
      target.priority = stack[sp + 1];
    }
    return ops - 1;
  }

  /**
   * @param {FyContext}
   *            context
   * @param {FyThread}
   *            thread
   * @param {number}
   *            ops
   */
  function threadIsAlive(context, thread, sp, ops) {
    var stack = thread.stack;

    thread.nativeReturnInt(sp, context.threadManager.isAlive(stack[sp]) ? 1 : 0);
    return ops - 1;
  }

  /**
   * @param {FyContext}
   *            context
   * @param {FyThread}
   *            thread
   * @param {number}
   *            ops
   */
  function threadInterrupt(context, thread, sp, ops) {
    var stack = thread.stack;

    context.threadManager.interrupt(stack[sp]);
    if (context.heap.getObjectMultiUsageData(stack[sp]) === thread.threadId) {
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
   * @param {number}
   *            ops
   */
  function threadInterrupted(context, thread, sp, ops) {
    var stack = thread.stack;

    thread.nativeReturnInt(sp, context.threadManager.isInterrupted(
      stack[sp], stack[sp + 1] ? true : false) ? 1 : 0);
    return ops - 1;
  }

  /**
   * @param {FyContext}
   *            context
   * @param {FyThread}
   *            thread
   * @param {number}
   *            ops
   */
  function threadStart(context, thread, sp, ops) {
    var stack = thread.stack;

    context.threadManager.pushThread(stack[sp]);
    return ops - 1;
  }

  /**
   * @param {FyContext}
   *            context
   * @param {FyThread}
   *            thread
   * @param {number}
   *            ops
   */
  function threadSleep(context, thread, sp, ops) {

    context.threadManager.sleep(thread, thread.longOps.longToNumber(sp));
    return 0;
  }

  /**
   * @param {FyContext}
   *            context
   * @param {FyThread}
   *            thread
   * @param {number}
   *            ops
   */
  function refRegister(context, thread, sp, ops) {
    var heap = context.heap;
    var stack = thread.stack;
    heap.registerReference(stack[sp], stack[sp + 1]);
    return ops - 1;
  }

  /**
   * @param {FyContext}
   *            context
   * @param {FyThread}
   *            thread
   * @param {number}
   *            ops
   */
  function refClear(context, thread, sp, ops) {
    var heap = context.heap;
    var stack = thread.stack;
    heap.clearReference(stack[sp]);
    return ops - 1;
  }

  /**
   * @param {FyContext}
   *            context
   * @param {FyThread}
   *            thread
   * @param {number}
   *            ops
   */
  function refGet(context, thread, sp, ops) {
    thread.nativeReturnInt(sp, context.heap.getReferent(thread.stack[sp]));
    return ops - 1;
  }

  /**
   * @param {FyContext}
   *            context
   * @param {FyThread}
   *            thread
   * @param {number}
   *            ops
   */
  function threadYield(context, thread, sp, ops) {
    thread.yield = true;
    return 0;
  }

  /**
   * @param {FyContext}
   *            context
   * @param {FyThread}
   *            thread
   * @param {number}
   *            ops
   */
  function proxyDefineClass(context, thread, sp, ops) {
    context.lookupClass("com/cirnoworks/fisce/js/ProxyHelper");
    var method = context
      .getMethod("com/cirnoworks/fisce/js/ProxyHelper.defineClass.(Ljava/lang/ClassLoader;Ljava/lang/String;[BII)Ljava/lang/Class;");
    // thread.sp += 3;
    thread.pushMethod(method, sp, ops - 1);
    return 0;
  }

  /**
   * @param {FyContext}
   *            context
   * @param {FyThread}
   *            thread
   * @param {number}
   *            ops
   */
  function risBind(context, thread, sp, ops) {
    var heap = context.heap;
    var stack = thread.stack;

    var nameHandle = stack[sp + 1];
    var pos = stack[sp + 2];
    if (nameHandle === 0) {
      throw new FyException(FyConst.FY_EXCEPTION_NPT, "name");
    }
    var name = heap.getString(nameHandle);
    // console.log("#VFS bind #" + stack[sp] + " to " + name);
    context.vfs.bindHandle(stack[sp], name, pos);
    return ops - 1;
  }

  /**
   * @param {FyContext}
   *            context
   * @param {FyThread}
   *            thread
   * @param {number}
   *            ops
   */
  function risRead(context, thread, sp, ops) {
    var stack = thread.stack;

    thread.nativeReturnInt(sp, context.vfs.read(stack[sp]));
    return ops - 1;
  }

  /**
   * @param {FyContext}
   *            context
   * @param {FyThread}
   *            thread
   * @param {number}
   *            ops
   */
  function risReadTo(context, thread, sp, ops) {
    var heap = context.heap;
    var _heap8 = heap.heap8;
    var stack = thread.stack;

    var targetHandle = stack[sp + 1];
    var pos = stack[sp + 2];
    var len = stack[sp + 3];
    if (targetHandle === 0) {
      throw new FyException(FyConst.FY_EXCEPTION_NPT, "b");
    }
    if (pos + len > heap.arrayLength(targetHandle)) {
      throw new FyException(FyConst.FY_EXCEPTION_AIOOB, pos + "+" + len + "/" + heap.arrayLength(targetHandle));
    }
    var heapPos = (heap.arrayPos(targetHandle) << 2) + pos;
    thread.nativeReturnInt(sp, context.vfs.readTo(stack[sp], _heap8,
      heapPos, len));
    return ops - 1;
  }

  /**
   * @param {FyContext}
   *            context
   * @param {FyThread}
   *            thread
   * @param {number}
   *            ops
   */
  function risClose(context, thread, sp, ops) {
    var stack = thread.stack;

    // console.log("#VFS close #" + stack[sp]);
    context.vfs.close(stack[sp]);
    return ops - 1;
  }

  /**
   * @param {FyContext}
   *            context
   * @param {FyThread}
   *            thread
   * @param {number}
   *            ops
   */
  function proxyHelperDefineClass(context, thread, sp, ops) {
    var str = context.heap.getString(thread.stack[sp]);
    context.addClassDef(str);
    return ops - 1;
  }

  context.registerNativeHandler(
    "com/cirnoworks/fisce/privat/SystemInputStream.read0.()I",
    systemInputStreamRead0);
  context.registerNativeHandler(
    "com/cirnoworks/fisce/privat/SystemOutputStream.write0.(IL" + FyConst.FY_BASE_STRING + ";)V", systemOutStreamWrite);

  context.registerNativeHandler(FyConst.FY_BASE_DOUBLE + ".longBitsToDouble.(J)D", doubleLongBitsToDouble);
  context.registerNativeHandler(FyConst.FY_BASE_DOUBLE + ".doubleToRawLongBits.(D)J", doubleLongBitsToDouble);
  context.registerNativeHandler(FyConst.FY_BASE_FLOAT + ".intBitsToFloat.(I)F", floatIntBitsToFloat);
  context.registerNativeHandler(FyConst.FY_BASE_FLOAT + ".floatToRawIntBits.(F)I", floatIntBitsToFloat);
  context.registerNativeHandler(FyConst.FY_BASE_STRING + ".intern.()L" + FyConst.FY_BASE_STRING + ";", stringIntern);

  context.registerNativeHandler(FyConst.FY_BASE_RUNTIME + ".freeMemory.()J",
    runtimeFreeMemory);
  context.registerNativeHandler(FyConst.FY_BASE_RUNTIME + ".totalMemory.()J",
    runtimeTotalMemory);
  context.registerNativeHandler(FyConst.FY_BASE_RUNTIME + ".maxMemory.()J",
    runtimeMaxMemory);

  context.registerNativeHandler(FyConst.FY_BASE_SYSTEM + ".setIn0.(L" + FyConst.FY_IO_INPUTSTREAM + ";)V", systemSetIn);
  context.registerNativeHandler(FyConst.FY_BASE_SYSTEM + ".setOut0.(L" + FyConst.FY_IO_PRINTSTREAM + ";)V", systemSetOut);
  context.registerNativeHandler(FyConst.FY_BASE_SYSTEM + ".setErr0.(L" + FyConst.FY_IO_PRINTSTREAM + ";)V", systemSetErr);
  context.registerNativeHandler(FyConst.FY_BASE_SYSTEM + ".setProperty0.(L" + FyConst.FY_BASE_STRING + ";L" + FyConst.FY_BASE_STRING + ";)L" + FyConst.FY_BASE_STRING + ";", systemSetProperty);
  context.registerNativeHandler(FyConst.FY_BASE_SYSTEM + ".getProperty0.(L" + FyConst.FY_BASE_STRING + ";)L" + FyConst.FY_BASE_STRING + ";",
    systemGetProperty);
  context
    .registerNativeHandler(FyConst.FY_BASE_SYSTEM + ".arraycopy.(L" + FyConst.FY_BASE_OBJECT + ";IL" + FyConst.FY_BASE_OBJECT + ";II)V", systemArrayCopy);
  context.registerNativeHandler(FyConst.FY_BASE_SYSTEM + ".currentTimeMillis.()J", systemTimeMS);
  context.registerNativeHandler(FyConst.FY_BASE_SYSTEM + ".nanoTime.()J",
    systemTimeNS);
  context.registerNativeHandler(FyConst.FY_BASE_SYSTEM + ".identityHashCode.(L" + FyConst.FY_BASE_OBJECT + ";)I",
    systemIdentityHashCode);
  context.registerNativeHandler(FyConst.FY_BASE_SYSTEM + ".gc.()V", systemGC);
  context.registerNativeHandler(FyConst.FY_BASE_SYSTEM + ".exit.(I)V",
    systemExit);

  context.registerNativeHandler(FyConst.FY_BASE_OBJECT + ".clone.()L" + FyConst.FY_BASE_OBJECT + ";", objectClone);
  context.registerNativeHandler(FyConst.FY_BASE_OBJECT + ".getClass.()L" + FyConst.FY_BASE_CLASS + ";", objectGetClass);
  context.registerNativeHandler(FyConst.FY_BASE_OBJECT + ".wait.(J)V",
    objectWait);
  context.registerNativeHandler(FyConst.FY_BASE_OBJECT + ".notify.()V",
    objectNotify);
  context.registerNativeHandler(FyConst.FY_BASE_OBJECT + ".notifyAll.()V",
    objectNorifyAll);

  context.registerNativeHandler(FyConst.FY_BASE_THROWABLE + ".fillInStackTrace0.()V", throwableFillInStackTrace);

  context.registerNativeHandler(FyConst.FY_BASE_VM + ".logOut0.(IL" + FyConst.FY_BASE_STRING + ";)V", vmLogOut);
  context.registerNativeHandler(FyConst.FY_BASE_VM + ".throwOut.(L" + FyConst.FY_BASE_THROWABLE + ";)V", vmThrowOut);
  context.registerNativeHandler(FyConst.FY_BASE_VM + ".exit.(I)V", vmExit);
  context.registerNativeHandler(FyConst.FY_BASE_VM + ".decode.(L" + FyConst.FY_BASE_STRING + ";[BII)[C", vmDecode);
  context.registerNativeHandler(FyConst.FY_BASE_VM + ".encode.(L" + FyConst.FY_BASE_STRING + ";[CII)[B", vmEncode);
  context.registerNativeHandler(FyConst.FY_BASE_VM + ".getDoubleRaw.(D)J",
    doubleLongBitsToDouble);
  context.registerNativeHandler(FyConst.FY_BASE_VM + ".getFloatRaw.(F)[I",
    floatIntBitsToFloat);
  context.registerNativeHandler(FyConst.FY_BASE_VM + ".stringToDouble.(L" + FyConst.FY_BASE_STRING + ";)D", vmStringToDouble);
  context.registerNativeHandler(FyConst.FY_BASE_VM + ".stringToFloat.(L" + FyConst.FY_BASE_STRING + ";)F", vmStringToFloat);
  context.registerNativeHandler(FyConst.FY_BASE_VM + ".floatToString.(F)L" + FyConst.FY_BASE_STRING + ";", vmFloatToString);
  context.registerNativeHandler(FyConst.FY_BASE_VM + ".doubleToString.(D)L" + FyConst.FY_BASE_STRING + ";", vmDoubleToString);
  context.registerNativeHandler(FyConst.FY_BASE_VM + ".breakpoint.()V",
    vmBreakpoint);

  context.registerNativeHandler(FyConst.FY_BASE_THREAD + ".currentThread.()L" + FyConst.FY_BASE_THREAD + ";", threadCurrentThread);
  context.registerNativeHandler(
    FyConst.FY_BASE_THREAD + ".setPriority0.(I)V", threadSetPriority);
  context.registerNativeHandler(FyConst.FY_BASE_THREAD + ".isAlive.()Z",
    threadIsAlive);
  context.registerNativeHandler(FyConst.FY_BASE_THREAD + ".start0.()V",
    threadStart);
  context.registerNativeHandler(FyConst.FY_BASE_THREAD + ".interrupt0.()V",
    threadInterrupt);
  context.registerNativeHandler(FyConst.FY_BASE_THREAD + ".isInterrupted.(Z)Z", threadInterrupted);
  context.registerNativeHandler(FyConst.FY_BASE_THREAD + ".sleep.(J)V",
    threadSleep);
  context.registerNativeHandler(FyConst.FY_BASE_THREAD + ".yield.()V",
    threadYield);

  context.registerNativeHandler(FyConst.FY_REF + ".register.(L" + FyConst.FY_BASE_OBJECT + ";)V", refRegister);
  context.registerNativeHandler(FyConst.FY_REF + ".clear0.()V", refClear);
  context.registerNativeHandler(FyConst.FY_REF + ".get0.()L" + FyConst.FY_BASE_OBJECT + ";", refGet);

  context.registerNativeHandler(FyConst.FY_BASE_FINALIZER + ".getReferencesToEnqueue.()[L" + FyConst.FY_REF + ";",
    finalizerGetReferencesToEnqueue);
  context.registerNativeHandler(FyConst.FY_BASE_FINALIZER + ".getFinalizee.()[L" + FyConst.FY_BASE_OBJECT + ";",
    finalizerGetFinalizee);
  context.registerNativeHandler("java/lang/ClassLoader.defineClassImpl.(L" + FyConst.FY_BASE_STRING + ";[BII)L" + FyConst.FY_BASE_CLASS + ";", proxyDefineClass);

  context.registerNativeHandler(
    "com/cirnoworks/fisce/js/ProxyHelper.defineClassViaJSON.(L" + FyConst.FY_BASE_STRING + ";)V", proxyHelperDefineClass);
  context
    .registerNativeHandler(
      "com/cirnoworks/fisce/privat/ResourceInputStream.bind0.(Ljava/lang/String;I)V",
      risBind);
  context.registerNativeHandler(
    "com/cirnoworks/fisce/privat/ResourceInputStream.read0.()I",
    risRead);
  context.registerNativeHandler(
    "com/cirnoworks/fisce/privat/ResourceInputStream.read0.([BII)I",
    risReadTo);
  context.registerNativeHandler(
    "com/cirnoworks/fisce/privat/ResourceInputStream.close0.()V",
    risClose);

  context.registerNativeHandler(
    "com/cirnoworks/fisce/privat/FiScEVM.save.()V", function() { /* TODO */
      return 0;
    });
}