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
 */

var FyThread;
var FyFrame;

(function() {
	"use strict";

	/**
	 * Thread
	 * 
	 * @param {FyContext}
	 *            context
	 */
	FyThread = function(context, stackSize) {

		this.STACK_SIZE = stackSize - 16;
		this.context = context;
		this.realStack = new Int32Array(stackSize);
		this.stack = new Int32Array(realStack.buffer, 64, this.STACK_SIZE);
		this.floatStack = new Int32Array(realStack.buffer, 64, this.STACK_SIZE);

		this.typeStack = new Int8Array(this.STACK_SIZE);
		this.sp = 0;
		this.framePos = this.STACK_SIZE;
		this.yield = false;
		this.handle = 0;

		this.currentThrowable = 0;
		this.status = 0;
		this.priority = 0;
		this.threadId = 0;

		this.waitForLockId = 0;
		this.waitForNotifyId = 0;
		this.pendingLockCount = 0;
		this.nextWakeTime = 0;
		this.interrupted = false;
		this.daemon = false;
		this.destroyPending = false;

		this.longOps = FyPortable.getLongOps(realStack);
	};

	/**
	 * <code>
	FyThread.frame_methodId = 0;
	FyThread.frame_sb = 1;
	FyThread.frame_ip = 2;
	FyThread.frame_lip = 3;
	 */

	/**
	 * @returns {FyMethod}
	 */
	FyThread.prototype.getCurrentMethod = function() {
		return this.context.methods[stack[this.framePos]];
	};

	/**
	 * @returns {Number}
	 */
	FyThread.prototype.getCurrentStackBase = function() {
		return this.stack[this.framePos + 1];
	};

	/**
	 * 
	 * @returns {Number}
	 */
	FyThread.prototype.getCurrentIp = function() {
		return this.stack[this.framePos + 2];
	};

	/**
	 * @param {Number}
	 *            frameId
	 * @returns {Number}
	 */
	FyThread.prototype.getStackBase = function(frameId) {
		return this.stack[this.STACK_SIZE - ((frameNum + 1) << 2) + 1];
	};

	/**
	 * 
	 * @param frameId
	 * @returns {FyMethod}
	 */
	FyThread.prototype.getFrameMethod = function(frameId) {
		return this.context.methods[this.stack[this.STACK_SIZE
				- ((frameNum + 1) << 2)]];
	};

	/**
	 * @returns {Number}
	 */
	FyThread.prototype.getLastIp = function(frameId) {
		return this.stack[this.STACK_SIZE - ((frameNum + 1) << 2) + 3];
	};

	/**
	 * @returns {Number}
	 */
	FyThread.prototype.getFramesCount = function() {
		return (this.STACK_SIZE - this.framePos) >> 2;
	};

	/**
	 * 
	 * @param {Number}
	 *            sp
	 * @param {Number}
	 *            lip
	 * @param {Number}
	 *            ip
	 */
	FyThread.prototype.localToFrame = function(sp, lip, ip) {
		var fp = this.framePos;
		this.sp = sp;
		this.stack[fp + 2] = ip;
		this.stack[fp + 3] = lip;
	};

	/**
	 * 
	 * @param {FyMethod}
	 *            method
	 * @returns {Number} the frame pos now
	 */
	FyThread.prototype.pushFrame = function(method) {
		var stack = this.stack;
		if (this.sp + method.maxLocals + method.maxStack >= framePos - 4) {
			throw new FyException(undefined, "stack overflow for thread "
					+ this.threadId);
		}
		this.framePos -= 4;
		stack[this.framePos + 0] = method.methodId;
		stack[this.framePos + 1] = sp;
		stack[this.framePos + 2] = 0;
		stack[this.framePos + 3] = 0;
		this.sp += method.maxLocals;
		return this.framePos;
	};

	/**
	 * similar with pushFrame, but consider locks
	 * 
	 * @param {FyMethod}
	 *            method
	 * @returns {Number}
	 */
	FyThread.prototype.pushMethod = function(method) {
		var ret = this.pushFrame(method);
		if (method.accessFlags & FyConst.FY_ACC_SYNCHRONIZED) {
			this
					.monitorEnter((method.accessFlags & FyConst.FY_ACC_STATIC) ? this.context
							.getClassObjectHandle(method.owner)
							: this.stack[ret + 1]);
		}
		return ret;
	};

	FyThread.prototype.popFrame = function(pushes) {
		this.sp = this.stack[this.framePos + 1];
		this.framePos += 4;
		if (pushes !== undefined) {
			this.sp += pushes;
		}
	};

	FyThread.prototype.getCurrentFramePos = function() {
		return this.framePos;
	};

	FyThread.prototype.getExceptionHandlerIp = function(framePos, handle, ip,
			exception) {

		/**
		 * @returns {FyMethod}
		 */
		var method = this.getCurrentMethod();
		for ( var i = 0, max = method.exceptionTable.length; i < max; i++) {
			/**
			 * @returns {FyExceptionHandler}
			 */
			var handler = method.exceptionTable[i];
			/**
			 * @returns {FyObject}
			 */
			var obj = this.context.heap.objects[handler];
			if (ip >= handler.start && ip < handler.end) {
				if (handler.catchClassData) {
					/**
					 * @returns {FyClass}
					 */
					var handlerClass = this.context
							.lookupClassFromConstant(handler.catchClassData);
					if (this.context.classLoader.canCast(obj.clazz,
							handlerClass)) {
						return handler.handler;
					}
				} else {
					return handler.handler;
				}
			}
		}
		return -1;
	};

	/**
	 * 
	 * @param {FyException}
	 *            exception exception to prepare
	 * @returns {Number} handle of the throwable
	 * @deprecated
	 */
	FyThread.prototype.__prepareThrowable__ = function(exception) {
		var context = this.context;
		var heap = context.heap;
		/**
		 * @returns {FyClass}
		 */
		var exceptionClass;
		var ret = 0;
		var fieldDetailMessage;
		if (exception.clazz === undefined) {
			context.panic(exception.message);
			throw exception;
		}
		try {

			exceptionClass = context.lookupClass(exception.clazz);
			if (context.classLoader.canCast(exceptionClass,
					context.TOP_THROWABLE)) {
				throw new FyException(undefined, "Exception " + exception.clazz
						+ " is not a java.lang.Throwable");
			}

			fieldDetailMessage = context.getField(FyConst.FY_BASE_THROWABLE
					+ ".detailMessage.L" + FyConst.FY_BASE_STRING);

			ret = heap.allocate(exceptionClass);
			heap.putFieldString(ret, fieldDetailMessage.posAbs,
					exception.message);

			this.fillStackTrace(ret);
			return ret;
		} catch (e) {
			context.panic("Exception occored while processing exception: " + e);
			throw e;
		}
	};

	/**
	 * walk all frames in reverse order and invoke f(frameId,methodId,sb,ip,lip)
	 * on it
	 * 
	 * @param {Function}
	 *            f
	 */
	FyThread.prototype.walkFrames = function(f) {
		for ( var pos = this.framePos; pos < this.STACK_SIZE; pos += 4) {
			if (f(((this.STACK_SIZE - pos) >> 2) - 1, stack[pos],
					stack[pos + 1], stack[pos + 2], stack[pos + 3])) {
				break;
			}
		}
	};

	FyThread.prototype.fillStackTrace = function(handle, excludeThis) {
		var context = this.context;
		var heap = context.heap;
		context.lookupClass(FyConst.FY_BASE_THROWABLE);
		var stackTraceElementsField = context
				.getField(FyConst.FY_BASE_THROWABLE + ".stackTrace.[L"
						+ FyConst.FY_BASE_STACKTHREADELEMENT + ";");
		if (stackTraceElementsField === undefined) {
			throw new FyException(undefined,
					"Can't find throwable's stackTrace field");
		}

		var steClass = context.lookupClass(FyConst.FY_BASE_STACKTHREADELEMENT);
		var steArray = context.lookupClass("[L"
				+ FyConst.FY_BASE_STACKTHREADELEMENT + ";");

		var declaringClassField = context
				.getField(FyConst.FY_BASE_STACKTHREADELEMENT
						+ ".declaringClass.L" + FyConst.FY_BASE_STRING + ";");
		var methodNameField = context
				.getField(FyConst.FY_BASE_STACKTHREADELEMENT + ".methodName.L"
						+ FyConst.FY_BASE_STRING + ";");
		var fileNameField = context.getField(FyConst.FY_BASE_STACKTHREADELEMENT
				+ ".fileName.L" + FyConst.FY_BASE_STRING + ";");
		var lineNumberField = context
				.getField(FyConst.FY_BASE_STACKTHREADELEMENT + ".lineNumber.I");

		var topFrameId = this.getFramesCount() - 1;
		if (excludeThis) {
			var thisHandle = stack[this.getCurrentStackBase()];
			for (; topFrameId >= 0; topFrame--) {
				if (!(stack[this.getStackBase(topFrameId)] === thisHandle && this
						.getFrameMethod(topFrameId).name === FyConst.FY_METHOD_INIT)) {
					break;
				}
			}
		}

		var steArrayHandle = heap.allocateArray(steArray, topFrameId + 1);
		heap
				.putFieldInt(handle, stackTraceElementsField.posAbs,
						steArrayHandle);

		this.walkFrames(function(frameId, methodId, sb, ip, lip) {
			var lineNumber = -1;
			if (frameId > topFrameId) {
				return false;
			}
			/**
			 * @returns {FyMethod}
			 */
			var method = context.methods[methodId];
			var steHandle = heap.allocate(steClass);
			heap.putArrayInt(steArrayHandle, topFrameId - frameId, steHandle);
			heap.putFieldString(steHandle, declaringClassField.pos,
					method.owner.name.replace(/\//g, "."));
			heap.putFieldString(steHandle, methodNameField.pos, method.name);
			heap.putFieldString(steHandle, fileNameField,
					method.owner.sourceFile);

			if (method.accessFlags & FyConst.FY_ACC_NATIVE) {
				lineNumber = -2;
			} else if (method.lineNumberTable) {
				for ( var j = 0; j < method.lineNumberTable; j++) {
					var ln = method.lineNumberTable[j];
					if (lip > ln.start) {
						lineNumber = ln.line;
						break;
					}
				}
			}
			heap.putFieldInt(steHandle, lineNumberField.posAbs, lineNumber);
		});
	};

	/**
	 * check whether access for a class need to be clinit ed
	 * 
	 * @param {FyClass}
	 *            clazz to check
	 * @returns {FyClass} class to be clinited or undefined for no need to
	 *          clinit
	 */
	FyThread.prototype.clinit = function(clazz) {
		var ret;
		if (clazz === undefined) {
			ret = undefined;
		} else if (clazz.clinitThreadId === -1
				|| clazz.clinitThreadId === this.threadId) {
			ret = undefined;
		} else if (clazz.clinit === undefined) {
			ret = this.clinit(clazz.superClass);
			if (ret === undefined) {
				clazz.clinitThreadId = -1;
			}
			return ret;
		} else {
			return clazz;
		}
		return NULL;
	};

	/**
	 * Initialize a thread with main method
	 * 
	 * @param {Number}
	 *            threadHandle thread handle
	 * @param {FyMethod}
	 *            method method
	 */
	FyThread.prototype.initWithMethod = function(threadHandle, method) {
		if (method.fullName !== FyConst.FY_METHODF_MAIN
				|| !(method.accessFlags & FyConst.FY_ACC_STATIC)) {
			throw new FyException(
					"The boot method must be static void main(String[] )");
		}
		this.context.lookupClass("[L" + FyConst.FY_BASE_STRING + ";");
		this.handle = threadHandle;
		this.context.heap.getObject(threadHandle).multiUsageData = this.threadId;
		this.pushFrame(method);
		this.stack[0] = 0;
		this.typeStack[0] = 0;
	};

	/**
	 * Initialize a thread with a Thread.run.()V method
	 * 
	 * @param {Number}
	 *            threadHandle
	 * @param {FyMethod}
	 *            method
	 */
	FyThread.prototype.initWithRun = function(threadHandle) {
		/**
		 * @returns {FyObject}
		 */
		var handlerObj = this.context.heap.getObject(threadHandle);
		/**
		 * @returns {FyClass}
		 */
		var handlerClass = handlerObj.clazz;
		if (!this.context.classLoader.canCast(handlerClass, this.context
				.lookupClass(FyConst.FY_BASE_THREAD))) {
			throw new FyException("The create(int) is used to start a "
					+ FyConst.FY_BASE_THREAD + "!");
		}
		var runner = this.context.lookupMethodVirtual(handlerClass,
				FyConst.FY_METHODF_RUN);
		handlerObj.multiUsageData = this.threadId;
		this.handle = threadHandle;
		this.pushFrame(runner);
		this.stack[0] = threadHandle;
		this.typeStack[0] = 1;
	};

	/**
	 * Run this thread
	 * 
	 * @param {FyMessage}
	 *            message
	 * @param {Number}
	 *            ops instructions to run
	 */
	FyThread.prototype.run = function(message, ops) {
		/**
		 * @returns {FyMethod}
		 */
		var method;
		while (ops > 0) {
			method = this.getCurrentMethod();
			ops = method.invoke(this.context, this, message, ops);
		}
	};

	/**
	 * 
	 * @param handle
	 * @returns {Boolean} if returns true, the method will exit and wait for
	 *          monitor unlocked
	 */
	FyThread.prototype.monitorEnter = function(handle) {
		// TODO
		console.log("monitor enter stub");
		return false;
	};

	FyThread.prototype.monitorExit = function(handle) {
		// TODO
		console.log("monitor exit stub");
	};

})();