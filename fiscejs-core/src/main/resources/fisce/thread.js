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
 * Thread
 
 * @class
 * @constructor
 * @struct
 * @export
 * @param {FyContext}
 *            context
 * @param {number}
 *            threadId
 */
function FyThread(context, threadId) {
  /**
   * @type {FyContext}
   */
  this.context = context;
  /**
   * @type {FyConfig}
   */
  this.config = context.config;
  /**
   * @type {number}
   */
  this.threadId = threadId;
  /**
   * @type {Int32Array}
   */
  this.stack = context.heap.heap;
  /**
   * @type {Float32Array}
   */
  this.floatStack = context.heap.heapFloat;
  /**
   * @private
   * @type {number}
   */
  this.bottom = context.heap.allocateStack(threadId) + 16;
  /**
   * @type {number}
   */
  this.top = (this.bottom + this.config.stackSize - 16) | 0;

  /**
   * @type {number}
   */
  this.framePos = this.top;
  /**
   * @type {boolean}
   */
  this.yield = false;
  /**
   * @type {number}
   */
  this.handle = 0;

  /**
   * @type {number}
   */
  this.currentThrowable = 0;
  /**
   * @private
   * @type {number}
   */
  this.status = 0;
  /**
   * @type {number}
   */
  this.priority = 0;

  /**
   * @type {number}
   */
  this.waitForLockId = 0;
  /**
   * @type {number}
   */
  this.waitForNotifyId = 0;
  /**
   * @type {number}
   */
  this.pendingLockCount = 0;
  /**
   * @type {number}
   */
  this.nextWakeTime = 0;
  /**
   * @type {boolean}
   */
  this.interrupted = false;
  /**
   * @type {boolean}
   */
  this.daemon = false;
  /**
   * @type {boolean}
   */
  this.destroyPending = false;

  /**
   * @type {FyMethod}
   */
  this.pendingNative = null;
  /**
   * @type {number}
   */
  this.pendingNativeSP = 0;

  /**
   * @type {__FyLongOps}
   */
  this.longOps = FyPortable.getLongOps(context.heap.heap, this.bottom - 16);
};

/**
 * <code>
FyThread.frame_methodId = 0;
FyThread.frame_sb = 1;
FyThread.frame_ip = 2;
FyThread.frame_lip = 3;
 */

/**
 * @export
 * @return {Int32Array}
 */
FyThread.prototype.getStack = function() {
  return this.stack;
};

/**
 * @export
 * @return {Float32Array}
 */
FyThread.prototype.getFloatStack = function() {
  return this.floatStack;
};

/**
 * @export
 * @return {__FyLongOps}
 */
FyThread.prototype.getLongOps = function() {
  return this.longOps;
};

/**
 * @returns {FyMethod}
 */
FyThread.prototype.getCurrentMethod = function() {
  return this.context.methods.get(this.stack[this.framePos]);
};

/**
 * @returns {number}
 */
FyThread.prototype.getCurrentStackBase = function() {
  return this.stack[this.framePos + 1];
};

/**
 * @export
 * @returns {number}
 */
FyThread.prototype.getCurrentIp = function() {
  return this.stack[this.framePos + 2];
};

/**
 *
 * @returns {number}
 */
FyThread.prototype.getCurrentLastIp = function() {
  return this.stack[this.framePos + 3];
};

/**
 * @export
 * @return {number}
 */
FyThread.prototype.getThreadId = function() {
  return this.threadId;
}

/**
 * @export
 * @param {number} handle
 */
FyThread.prototype.setCurrentThrowable = function(handle) {
  this.currentThrowable = handle;
}

/**
 *
 */
FyThread.prototype.rollbackCurrentIp = function() {
  this.stack[this.framePos + 2] = this.stack[this.framePos + 3];
};

/**
 * @export
 */
FyThread.prototype.forwardCurrentLIp = function() {
  this.stack[this.framePos + 3] = this.stack[this.framePos + 2];
};

/**
 * @param {number}
 *            frameId
 * @returns {number}
 */
FyThread.prototype.getStackBase = function(frameId) {
  return this.stack[this.top - ((frameId + 1) << 2) + 1];
};

/**
 *
 * @param frameId
 * @returns {FyMethod}
 */
FyThread.prototype.getFrameMethod = function(frameId) {
  return this.context.methods
    .get(this.stack[this.top - ((frameId + 1) << 2)]);
};

/**
 * @returns {number}
 */
FyThread.prototype.getLastIp = function(frameId) {
  return this.stack[this.top - ((frameId + 1) << 2) + 3];
};

/**
 * @returns {number}
 */
FyThread.prototype.getFramesCount = function() {
  return (this.top - this.framePos) >> 2;
};

/**
 * @export
 * @param {number}
 *            lip
 * @param {number}
 *            ip
 */
FyThread.prototype.localToFrame = function(lip, ip) {
  // console.log("Local=>Frame: "+sp+" "+lip+" "+ip);
  var fp = this.framePos | 0;
  this.stack[fp + 2] = ip;
  this.stack[fp + 3] = lip;
};

/**
 * @export
 * @param {FyMethod}
 *            method
 * @param {number} sp
 * @returns {number} the frame pos now
 */
FyThread.prototype.pushFrame = function(method, sp) {
  // if(method.name=="<clinit>"){
  // console.log("#Thread "+this.threadId+" push method
  // "+method.uniqueName);
  // }
  var stack = this.stack;
  if (sp + method.maxLocals + method.maxStack >= this.framePos - 4) {
    throw new FyException(null, "stack overflow for thread " + this.threadId);
  }
  this.framePos -= 4;
  stack[this.framePos + 0] = method.methodId;
  stack[this.framePos + 1] = sp;
  stack[this.framePos + 2] = 0;
  stack[this.framePos + 3] = 0;
  return this.framePos;
};

/**
 * similar with pushFrame, but consider locks
 *
 * @export
 * @param {FyMethod}
 *            method
 * @param {number} sp
 * @param {number} ops
 * @returns {number} ops left
 */
FyThread.prototype.pushMethod = function(method, sp, ops) {
  if (ops !== ops) {
    throw new FyException(null, "Illegal ops");
  }
  var ret = this.pushFrame(method, sp);
  if (method.accessFlags & FyConstAcc.SYNCHRONIZED) {
    this
      .monitorEnter((method.accessFlags & FyConstAcc.STATIC) ? this.context
        .getClassObjectHandle(method.owner) : this.stack[this.stack[ret + 1]]);
  }
  return this.yield ? 0 : ops;
};

/**
 * @export
 * @param  {FyMethod} method
 * @param  {number} sp
 */
FyThread.prototype.pendNative = function(method, sp) {
  this.pendingNative = method;
  this.pendingNativeSP = sp;
}

/**
 * @param {FyMethod}
 *            method
 * @param {number} sp
 * @param {number}
 *            ops
 * @return {number} ops left
 */
FyThread.prototype.invokeStatic = function(method, sp, ops) {
  if (!(method.accessFlags & FyConstAcc.STATIC)) {
    throw new FyException(FyConst.FY_EXCEPTION_INCOMPAT_CHANGE,
      method.uniqueName + " is not static");
  }

  // !CLINIT
  var clinitClass = this.clinit(method.owner);
  if (clinitClass) {
    // invoke clinit
    if (clinitClass.clinitThreadId == 0) {
      // no thread is running it, so let this run
      clinitClass.clinitThreadId = this.threadId;
      this.rollbackCurrentIp();
      this.pushFrame(clinitClass.clinit, sp);
      return 0;
    } else {
      // wait for other thread clinit
      this.rollbackCurrentIp();
      return 0;
    }
  }

  sp -= method.paramStackUsage;
  if (method.accessFlags & FyConstAcc.NATIVE) {
    if (method.invoke) {
      this.context.heap.beginProtect();
      ops = method.invoke(this.context, this, sp, ops);
      this.context.heap.endProtect();
      if (this.yield) {
        return 0;
      } else {
        return ops;
      }
    } else {
      this.pendNative(method, sp);
      return 0;
    }
  } else {
    if (!method.invoke) {
      FyAOTUtil.aot(this, method);
    }
    ops = this.pushMethod(method, sp, ops);
    if (ops <= 0) {
      return 0;
    }
    ops = method.invoke(this.context, this, sp, ops);
    return ops;
  }
};

/**
 * Invoke a method
 *
 * @param {FyMethod}
 *            method
 * @param {number} sp
 * @param {number} ops
 * @return ops left
 */
FyThread.prototype.invokeVirtual = function(method, sp, ops) {
  if ((method.accessFlags & FyConstAcc.STATIC)) {
    throw new FyException(FyConst.FY_EXCEPTION_INCOMPAT_CHANGE,
      method.uniqueName + " is static");
  }

  sp -= method.paramStackUsage + 1;
  if (this.stack[sp] === 0) {
    // this = null!!!
    throw new FyException(FyConst.FY_EXCEPTION_NPT, "while invoking " + method.uniqueName);
  }
  if (!this.context.heap.getObjectClass(this.stack[sp])) {
    throw new FyException(null, "#Bug! Object #" + this.stack[sp] + " is gabage collected");
  }
  if (!(method.accessFlags & FyConstAcc.FINAL)) {
    // Virtual lookup
    method = this.context.lookupMethodVirtualByMethod(this.context.heap
      .getObjectClass(this.stack[sp]), method);
  }
  if (method.accessFlags & FyConstAcc.NATIVE) {
    if (method.invoke) {
      this.context.heap.beginProtect();
      ops = method.invoke(this.context, this, sp, ops);
      this.context.heap.endProtect();
      if (this.yield) {
        return 0;
      } else {
        return ops;
      }
    } else {
      this.pendNative(method, sp);
      return 0;
    }
  } else {
    if (!method.invoke) {
      FyAOTUtil.aot(this, method);
    }
    ops = this.pushMethod(method, sp, ops);
    if (ops <= 0) {
      return 0;
    }
    ops = method.invoke(this.context, this, sp, ops);
    return ops;
  }
};

/**
 * @export
 * @param  {number} pushes
 * @return {number}
 */
FyThread.prototype.popFrame = function(pushes) {
  var sp = this.stack[this.framePos + 1];
  this.framePos += 4;
  return sp + pushes;
};

/**
 * @return {number}
 */
FyThread.prototype.getCurrentFramePos = function() {
  return this.framePos;
};

/**
 * @param  {number} handle
 * @param  {number} ip
 * @return {number}
 */
FyThread.prototype.getExceptionHandlerIp = function(handle, ip) {
  var heap = this.context.heap;
  /**
   * @returns {FyMethod}
   */
  var method = this.getCurrentMethod();
  this.context.log(0, "GetExceptionHandler ip: " + handle + " " + ip + " " + method.uniqueName);
  for (var i = 0, max = method.exceptionTable.length; i < max; i += 4) {
    var start = method.exceptionTable[i];
    var end = method.exceptionTable[i + 1];
    var classId = method.exceptionTable[i + 2];
    var handler = method.exceptionTable[i + 3];

    if (ip >= start && ip < end) {
      if (classId > 0) {
        /**
         * @type {FyClass}
         */
        var handlerClass = this.context.classes.get(classId);
        if (this.context.classLoader.canCast(heap
          .getObjectClass(handle), handlerClass)) {
          this.context.log(0, "!!" + handler);
          return handler;
        }
      } else {
        this.context.log(0, "!!" + handler);
        return handler;
      }
    }
  }
  return -1;
};

/**
 * walk all frames in reverse order and invoke f(frameId,methodId,sb,ip,lip) on
 * it
 *
 * @param {function(number, number, number, number, number):boolean}
 *            f
 */
FyThread.prototype.walkFrames = function(f) {
  var stack = this.stack;
  var max = this.top;
  for (var pos = this.framePos; pos < max; pos += 4) {
    if (f(((max - pos) >> 2) - 1, stack[pos], stack[pos + 1],
      stack[pos + 2], stack[pos + 3])) {
      break;
    }
  }
};

/**
 * @param  {number} handle
 * @param  {boolean} excludeThis
 */
FyThread.prototype.fillStackTrace = function(handle, excludeThis) {
  var context = this.context;
  var heap = context.heap;
  context.lookupClass(FyConst.FY_BASE_THROWABLE);
  var stackTraceElementsField = context.getField(FyConst.FY_BASE_THROWABLE + ".stackTrace.[L" + FyConst.FY_BASE_STACKTHREADELEMENT + ";");
  if (!stackTraceElementsField) {
    throw new FyException(null,
      "Can't find throwable's stackTrace field");
  }

  var steClass = context.lookupClass(FyConst.FY_BASE_STACKTHREADELEMENT);
  var steArray = context.lookupClass("[L" + FyConst.FY_BASE_STACKTHREADELEMENT + ";");

  var declaringClassField = context
    .getField(FyConst.FY_BASE_STACKTHREADELEMENT + ".declaringClass.L" + FyConst.FY_BASE_STRING + ";");
  var methodNameField = context.getField(FyConst.FY_BASE_STACKTHREADELEMENT + ".methodName.L" + FyConst.FY_BASE_STRING + ";");
  var fileNameField = context.getField(FyConst.FY_BASE_STACKTHREADELEMENT + ".fileName.L" + FyConst.FY_BASE_STRING + ";");
  var lineNumberField = context.getField(FyConst.FY_BASE_STACKTHREADELEMENT + ".lineNumber.I");

  var topFrameId = this.getFramesCount() - 1;
  if (excludeThis) {
    var thisHandle = this.stack[this.getCurrentStackBase()];
    for (; topFrameId >= 0; topFrameId--) {
      if (!(this.stack[this.getStackBase(topFrameId)] === thisHandle && (this
        .getFrameMethod(topFrameId).name === FyConst.FY_METHOD_INIT || this
        .getFrameMethod(topFrameId).name === "fillInStackTrace"))) {
        break;
      }
    }
  }

  var steArrayHandle = heap.allocateArray(steArray, topFrameId + 1);
  // console.log("#FillStackTrace for #" + handle + "["
  // + stackTraceElementsField.name + "]=" + steArrayHandle);
  heap.putFieldInt(handle, stackTraceElementsField.posAbs, steArrayHandle);

  this.walkFrames(function(frameId, methodId, sb, ip, lip) {
    var lineNumber = -1;
    if (frameId > topFrameId) {
      return false;
    }
    /**
     * @returns {FyMethod}
     */
    var method = context.methods.get(methodId);
    var steHandle = heap.allocate(steClass);
    heap.putArrayInt(steArrayHandle, topFrameId - frameId, steHandle);
    heap.putFieldString(steHandle, declaringClassField.posAbs,
      method.owner.name.replace(/\//g, "."));
    heap.putFieldString(steHandle, methodNameField.posAbs, method.name);
    heap.putFieldString(steHandle, fileNameField.posAbs,
      method.owner.sourceFile);

    lineNumber = method.getLineNumber(lip);
    heap.putFieldInt(steHandle, lineNumberField.posAbs, lineNumber);
    return false;
  });
};

/**
 * check whether access for a class need to be clinit ed
 *
 * @export
 * @param {FyClass}
 *            clazz to check
 * @returns {FyClass} class to be clinited or null for no need to clinit
 */
FyThread.prototype.clinit = function(clazz) {
  // console.log("<clinit>" + (clazz ? clazz.name : "null"));
  /**
   * @type {FyClass}
   */
  var ret;
  if (!clazz) {
    ret = null;
  } else if (clazz.clinitThreadId === -1 || clazz.clinitThreadId === this.threadId) {
    ret = null;
  } else if (!clazz.clinit) {
    // console.log("<call clinit>"
    // + (clazz.superClass ? clazz.superClass.name : ""));
    ret = this.clinit(clazz.superClass);
    if (!ret) {
      clazz.clinitThreadId = -1;
    }
    // console.log("</clinit>" + (ret?ret.name:"null"));
    return ret;
  } else {
    // console.log("</clinit>" + clazz.name);
    return clazz;
  }
  // console.log("</clinit> null");
  return null;
};

/**
 * Initialize a thread with main method
 *
 * @param {number}
 *            threadHandle thread handle
 * @param {FyMethod}
 *            method method
 */
FyThread.prototype.initWithMethod = function(threadHandle, method) {
  if (method.fullName !== FyConst.FY_METHODF_MAIN || !(method.accessFlags & FyConstAcc.STATIC)) {
    throw new FyException(null,
      "The boot method must be static void main(String[] )");
  }
  this.context.lookupClass("[L" + FyConst.FY_BASE_STRING + ";");
  this.handle = threadHandle;
  this.context.heap.setObjectMultiUsageData(threadHandle, this.threadId | 0);
  this.pushFrame(method, this.bottom);
  this.stack[this.bottom] = 0;
};

/**
 * Initialize a thread with a Thread.run.()V method
 *
 * @param {number}
 *            threadHandle
 */
FyThread.prototype.initWithRun = function(threadHandle) {
  /**
   * @returns {FyClass}
   */
  var handlerClass = this.context.heap.getObjectClass(threadHandle);
  if (!this.context.classLoader.canCast(handlerClass, this.context
    .lookupClass(FyConst.FY_BASE_THREAD))) {
    throw new FyException(null, "The create(int) is used to start a " + FyConst.FY_BASE_THREAD + "!");
  }
  var runner = this.context.lookupMethodVirtual(handlerClass,
    FyConst.FY_METHODF_RUN);
  this.context.heap.setObjectMultiUsageData(threadHandle, this.threadId | 0);
  this.handle = threadHandle;
  this.pushFrame(runner, this.bottom);
  this.stack[this.bottom] = threadHandle;
};

FyThread.prototype.destroy = function() {
  var heap = this.context.heap;
  heap.setObjectMultiUsageData(this.handle, 0 | 0);
  this.handle = 0;
  this.waitForLockId = 0;
  this.waitForNotifyId = 0;
  this.nextWakeTime = 0;
  this.pendingLockCount = 0;
  this.destroyPending = false;
  for (var handle = 1; handle < this.config.maxObjects; handle++) {
    if (heap.objectExists(this.handle) && heap.getObjectMonitorOwnerId(this.handle) === this.threadId) {
      heap.setObjectMonitorOwnerId(this.handle, 0);
      heap.setObjectMonitorOwnerTimes(this.handle, 0);
    }
  }
};

/**
 * @export
 * @param {FyMessage}
 *            message
 * @param {number} ops
 */
FyThread.prototype.runEx = function(message, ops) {
  /**
   * @type {FyMethod}
   */
  var method;
  var handlerIp;
  var lip;
  while (ops > 0) {
    if (this.framePos === this.top) {
      message.type = FyMessage.message_thread_dead;
      return;
    }
    method = this.getCurrentMethod();
    if (method.accessFlags & FyConstAcc.NATIVE) {
      throw new FyException(null, "Native method pushed");
    }
    if (!method.invoke) {
      FyAOTUtil.aot(this, method);
    }
    if (this.currentThrowable) {
      this.context.log(0,
        "!!!Exception occored #" + this.currentThrowable + ": " + this.context.heap
        .getObjectClass(this.currentThrowable).name + " at thread #" + this.threadId);
      while (true) {
        method = this.getCurrentMethod();
        lip = this.getCurrentLastIp();
        handlerIp = this.getExceptionHandlerIp(this.currentThrowable,
          lip);
        if (handlerIp >= 0) {
          this.localToFrame(handlerIp | 0, handlerIp | 0);
          this.stack[this.getCurrentStackBase() + method.getSpOfs(handlerIp) - 1] = this.currentThrowable;
          this.currentThrowable = 0;
          break;
        } else {
          if (method.accessFlags & FyConstAcc.SYNCHRONIZED) {
            if (method.accessFlags & FyConstAcc.STATIC) {
              this.monitorExit(this.context
                .getClassObjectHandle(method.owner));
            } else {
              this.monitorExit(this.stack[this
                .getCurrentStackBase()]);
            }
          }
          if (method.accessFlags & FyConstAcc.CLINIT) {
            method.owner.clinitThreadId = -1;
          }
          this.popFrame(0);
          if (this.framePos >= this.top) {
            // 全部弹出了……显示stacktrace
            var data = this.context
              .dumpStackTrace(this.currentThrowable);
            this.context.log(2, "Uncaught exception occored");
            for (var idx = 0, maxIdx = data.length; idx < maxIdx; idx++) {
              this.context.log(2, data[idx]);
            }
            // message.type = FyMessage.message_thread_dead;
            this.context.panic("Uncaught exception occored: \n\t" + data.join("\n\t"), null);
            return;
          }
        }
      }
    }
    ops = method.invoke(this.context, this, this.getCurrentStackBase(), ops);
    if (this.pendingNative) {
      message.type = FyMessage.message_invoke_native;
      message.nativeMethod = this.pendingNative.uniqueName;
      message.sp = this.pendingNativeSP;
      message.thread = this;
      this.pendingNative = null;
      this.pendingNativeSP = 0;
      ops = 0;
    }
    if (this.yield) {
      ops = 0;
    }
  }
};

/**
 * Run this thread
 *
 * @param {FyMessage}
 *            message
 * @param {number}
 *            ops instructions to run
 */
FyThread.prototype.run = function(message, ops) {
  while (true) {
    try {
      this.runEx(message, ops);
      break;
    } catch (e) {
      if (e instanceof FyException) {
        this.context.threadManager.pushThrowable(this, e);
      } else {
        this.context.panic("Exception occored while executing thread #" + this.threadId, e);
      }
    }
  }
  this.yield = false;
};

/**
 * @export
 * @param  {number} sp
 * @param  {number} value
 */
FyThread.prototype.nativeReturnInt = function(sp, value) {
  this.stack[sp] = value;
};

/**
 * @export
 * @param  {number} sp
 * @param  {number} value
 */
FyThread.prototype.nativeReturnFloat = function(sp, value) {
  this.floatStack[sp] = value;
};

/**
 * @export
 * @param  {number} sp
 * @param  {number} value
 */
FyThread.prototype.nativeReturnDouble = function(sp, value) {
  FyPortable.doubleToIeee64(value, this.stack, sp);
};

/**
 * @export
 * @param  {number} sp
 * @param  {Array.<number>|Int32Array} container
 * @param  {number} ofs
 */
FyThread.prototype.nativeReturnLong = function(sp, container, ofs) {
  this.stack[sp++] = container[ofs++];
  this.stack[sp] = container[ofs];
};

/**
 * @export
 * @param {number}
 *            handle
 */
FyThread.prototype.monitorEnter = function(handle) {
  this.context.threadManager.monitorEnter(this, handle);
};

/**
 * @export
 * @param {number}
 *            handle
 */
FyThread.prototype.monitorExit = function(handle) {
  this.context.threadManager.monitorExit(this, handle);
};
/**
 *
 * @param {Array.<number>}
 *            from
 */
FyThread.prototype.scanRef = function(from) {
  var context = this.context;
  var thread = this;
  var stack = this.stack;
  var isTop = true;
  var heap = context.heap;
  this
    .walkFrames(function(frameId, methodId, sb, ip, lip) {
      /**
       * @returns {FyMethod}
       */
      var method = context.methods.get(methodId);
      /**
       * @return {string}
       */
      var frame = method.frames.get(lip);

      var imax;
      if (isTop) {
        isTop = false;
        imax = method.getSpOfs(lip);
      } else {
        imax = thread.getStackBase(frameId + 1) - sb;
      }
      // console.log("#scanRef threadId=" + thread.threadId
      // + " frameId=" + frameId + " length=" + frame.length
      // + " usedLength=" + imax);
      // locals
      // var imax = frame.length;
      if (frame == null) {
        context.log(2, "WARN: " + "Can't find frame for ip=" + lip + " in method " + method.uniqueName + " will try to resolve all vars as handle");
        for (var i = 0; i < imax; i++) {
          var value = stack[i + sb];
          if (value > 0 && value < this.config.maxObjects && heap.getObjectClass(value)) {
            // Maybe a valid handle
            console.log("#VALID " + value);
            from.push(value);
          } else {
            console.log("#INVALID " + value);
          }
        }
      } else {
        for (var i = 0; i < imax; i++) {
          var value = stack[i + sb];
          if (frame.charCodeAt(i) === 49 /* '1' */ && value !== 0) {
            if (context.config.debugMode && ((value < 0 || value > context.config.maxObjects) || (!heap
              .getObjectClass(value)))) {
              throw new FyException(null,
                "Illegal handle #" + value + " @" + i + " threadId=" + thread.threadId + " frameId=" + frameId + " length=" + frame.length + " usedLength=" + imax);
            }
            // console.log("#Scanref add #" + value + " from
            // thread
            // #"
            // + thread.threadId);
            from.push(value);
          }
        }
      }
      return false;
    });
};