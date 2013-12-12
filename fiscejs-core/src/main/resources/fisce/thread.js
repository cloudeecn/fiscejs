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

(function() {
	"use strict";

	/**
	 * Thread
	 * 
	 * @param {FyContext}
	 *            context
	 * @param {Int32Array}
	 *            stack
	 */
	FyThread = function(context, threadId) {
		this.context = context;
		this.threadId = threadId;
		this.stack = context.heap._heap;
		this.floatStack = context.heap._heapFloat;
		this.bottom = context.heap.allocateStack(threadId) + 16;
		this.top = (this.bottom + FyConfig.stackSize - 16) | 0;

		this.sp = this.bottom;
		this.framePos = this.top;
		this.yield = false;
		this.handle = 0;

		this.currentThrowable = 0;
		this.status = 0;
		this.priority = 0;

		this.waitForLockId = 0;
		this.waitForNotifyId = 0;
		this.pendingLockCount = 0;
		this.nextWakeTime = 0;
		this.interrupted = false;
		this.daemon = false;
		this.destroyPending = false;

		/**
		 * @returns {__FyLongOps}
		 */
		this.longOps = FyPortable.getLongOps(context.heap._heap,
				this.bottom - 16);
		Object.preventExtensions(this);
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
		return this.context.methods[this.stack[this.framePos]];
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
	 * 
	 * @returns {Number}
	 */
	FyThread.prototype.getCurrentLastIp = function() {
		return this.stack[this.framePos + 3];
	};

	FyThread.prototype.rollbackCurrentIp = function() {
		this.stack[this.framePos + 2] = this.stack[this.framePos + 3];
	};

	FyThread.prototype.forwardCurrentLIp = function() {
		this.stack[this.framePos + 3] = this.stack[this.framePos + 2];
	};

	/**
	 * @param {Number}
	 *            frameId
	 * @returns {Number}
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
		return this.context.methods[this.stack[this.top - ((frameId + 1) << 2)]];
	};

	/**
	 * @returns {Number}
	 */
	FyThread.prototype.getLastIp = function(frameId) {
		return this.stack[this.top - ((frameId + 1) << 2) + 3];
	};

	/**
	 * @returns {Number}
	 */
	FyThread.prototype.getFramesCount = function() {
		return (this.top - this.framePos) >> 2;
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
		// console.log("Local=>Frame: "+sp+" "+lip+" "+ip);
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
		// if(method.name=="<clinit>"){
		// console.log("#Thread "+this.threadId+" push method
		// "+method.uniqueName);
		// }
		var stack = this.stack;
		if (this.sp + method.maxLocals + method.maxStack >= this.framePos - 4) {
			throw new FyException(undefined, "stack overflow for thread "
					+ this.threadId);
		}
		this.framePos -= 4;
		stack[this.framePos + 0] = method.methodId;
		stack[this.framePos + 1] = this.sp;
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
	FyThread.prototype.pushMethod = function(method, ops) {
		var ret = this.pushFrame(method);
		if (method.accessFlags & FyConst.FY_ACC_SYNCHRONIZED) {
			this
					.monitorEnter((method.accessFlags & FyConst.FY_ACC_STATIC) ? this.context
							.getClassObjectHandle(method.owner)
							: this.stack[this.stack[ret + 1]]);
		}
		return this.yield ? 0 : ops;
	};

	/**
	 * @param {FyMethod}
	 *            method
	 * @param {Number}
	 *            ops
	 * @return {Number} ops left
	 */
	FyThread.prototype.invokeStatic = function(method, ops) {
		if (!(method.accessFlags & FyConst.FY_ACC_STATIC)) {
			throw new FyException(FyConst.FY_EXCEPTION_INCOMPAT_CHANGE,
					tmpMethod.uniqueName + " is not static");
		}

		// !CLINIT
		var clinitClass = this.clinit(method.owner);
		if (clinitClass !== undefined) {
			// invoke clinit
			if (clinitClass.clinitThreadId == 0) {
				// no thread is running it, so let this run
				clinitClass.clinitThreadId = this.threadId;
				this.rollbackCurrentIp();
				this.pushFrame(clinitClass.clinit);
				return ops;
			} else {
				// wait for other thread clinit
				this.rollbackCurrentIp();
				return 0;
			}
		}

		this.sp -= method.paramStackUsage;
		if (method.accessFlags & FyConst.FY_ACC_NATIVE) {
			if (method.invoke) {
				this.context.heap.beginProtect();
				ops = method.invoke(this.context, this, ops);
				this.context.heap.endProtect();
				if (this.yield) {
					ops = 0;
				}
				return ops;
			} else {
				throw new FyException(undefined,
						"Unresolved native handler for " + method.uniqueName);
			}
		} else {
			return this.pushMethod(method, ops);
		}
	};

	/**
	 * Invoke a method
	 * 
	 * @param {FyMethod}
	 *            method
	 * @param ops
	 */
	FyThread.prototype.invokeVirtual = function(method, ops) {
		if ((method.accessFlags & FyConst.FY_ACC_STATIC)) {
			throw new FyException(FyConst.FY_EXCEPTION_INCOMPAT_CHANGE,
					method.uniqueName + " is static");
		}

		this.sp -= method.paramStackUsage + 1;
		if (this.stack[this.sp] === 0) {
			// this = null!!!
			throw new FyException(FyConst.FY_EXCEPTION_NPT, "while invoking "
					+ method.uniqueName);
		}
		if (this.context.heap.getObjectClass(this.stack[this.sp]) === undefined) {
			throw new FyException(undefined, "#Bug! Object #"
					+ this.stack[this.sp] + " is gabage collected");
		}
		if (!(method.accessFlags & FyConst.FY_ACC_FINAL)) {
			// Virtual lookup
			method = this.context.lookupMethodVirtualByMethod(this.context.heap
					.getObjectClass(this.stack[this.sp]), method);
		}
		if (method.accessFlags & FyConst.FY_ACC_NATIVE) {
			if (method.invoke) {
				this.context.heap.beginProtect();
				ops = method.invoke(this.context, this, ops);
				this.context.heap.endProtect();
				if (this.yield) {
					ops = 0;
				}
				return ops;
			} else {
				throw new FyException(undefined,
						"Unresolved native handler for " + method.uniqueName);
			}
		} else {
			return this.pushMethod(method, ops);
		}
	};

	FyThread.prototype.popFrame = function(pushes) {
		// console.log("#Thread "+this.threadId+" pop method
		// "+this.getCurrentMethod().uniqueName);
		this.sp = this.stack[this.framePos + 1];
		this.framePos += 4;
		// if (pushes !== undefined) {
		this.sp += pushes;
		// }
	};

	FyThread.prototype.getCurrentFramePos = function() {
		return this.framePos;
	};

	FyThread.prototype.getExceptionHandlerIp = function(handle, ip) {
		var heap = this.context.heap;
		/**
		 * @returns {FyMethod}
		 */
		var method = this.getCurrentMethod();
		console.log("GetExceptionHandler ip: " + handle + " " + ip + " "
				+ method.uniqueName);
		for (var i = 0, max = method.exceptionTable.length; i < max; i++) {
			/**
			 * @returns {FyExceptionHandler}
			 */
			var handler = method.exceptionTable[i];
			console.log("# " + handler.start + "-" + handler.end + "("
					+ (handler.catchClass ? handler.catchClass.name : "*")
					+ ")=>" + handler.handler + " "
					+ heap.getObjectClass(handle).name);
			if (ip >= handler.start && ip < handler.end) {
				if (handler.catchClass) {
					/**
					 * @returns {FyClass}
					 */
					var handlerClass = handler.catchClass;
					if (this.context.classLoader.canCast(heap
							.getObjectClass(handle), handlerClass)) {
						console.log("!!" + handler.handler);
						return handler.handler;
					}
				} else {
					console.log("!!" + handler.handler);
					return handler.handler;
				}
			}
		}
		return -1;
	};

	/**
	 * walk all frames in reverse order and invoke f(frameId,methodId,sb,ip,lip)
	 * on it
	 * 
	 * @param {Function}
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
		heap
				.putFieldInt(handle, stackTraceElementsField.posAbs,
						steArrayHandle);

		this
				.walkFrames(function(frameId, methodId, sb, ip, lip) {
					var lineNumber = -1;
					if (frameId > topFrameId) {
						return false;
					}
					/**
					 * @returns {FyMethod}
					 */
					var method = context.methods[methodId];
					var steHandle = heap.allocate(steClass);
					heap.putArrayInt(steArrayHandle, topFrameId - frameId,
							steHandle);
					heap.putFieldString(steHandle, declaringClassField.posAbs,
							method.owner.name.replace(/\//g, "."));
					heap.putFieldString(steHandle, methodNameField.posAbs,
							method.name);
					heap.putFieldString(steHandle, fileNameField.posAbs,
							method.owner.sourceFile);

					lineNumber = method.getLineNumber(lip);
					heap.putFieldInt(steHandle, lineNumberField.posAbs,
							lineNumber);
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
		return undefined;
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
		this.context.heap.setObjectMultiUsageData(threadHandle, this.threadId);
		this.pushFrame(method);
		this.stack[this.bottom] = 0;
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
		 * @returns {FyClass}
		 */
		var handlerClass = this.context.heap.getObjectClass(threadHandle);
		if (!this.context.classLoader.canCast(handlerClass, this.context
				.lookupClass(FyConst.FY_BASE_THREAD))) {
			throw new FyException("The create(int) is used to start a "
					+ FyConst.FY_BASE_THREAD + "!");
		}
		var runner = this.context.lookupMethodVirtual(handlerClass,
				FyConst.FY_METHODF_RUN);
		this.context.heap.setObjectMultiUsageData(threadHandle, this.threadId);
		this.handle = threadHandle;
		this.pushFrame(runner);
		this.stack[this.bottom] = threadHandle;
	};

	FyThread.prototype.destroy = function() {
		var heap = this.context.heap;
		heap.setObjectMultiUsageData(this.handle, 0);
		this.handle = 0;
		this.waitForLockId = 0;
		this.waitForNotifyId = 0;
		this.nextWakeTime = 0;
		this.pendingLockCount = 0;
		this.destroyPending = false;
		for (var handle = 1; handle < FyConfig.maxObjects; handle++) {
			if (heap.objectExists(this.handle)
					&& heap.getObjectMonitorOwnerId(this.handle) === this.threadId) {
				heap.setObjectMonitorOwnerId(0);
				heap.setObjectMonitorOwnerTimes(0);
			}
		}
	};

	/**
	 * @param {FyMethod}
	 *            method
	 * @param ops
	 */
	FyThread.prototype.runEx = function(method, ops) {
		try {
			return method.invoke(this.context, this, ops);
		} catch (e) {
			if (e instanceof FyException) {
				this.context.threadManager.pushThrowable(this, e);
				return ops;
			} else {
				this.context.panic("Exception occored while executing thread #"
						+ this.threadId, e);
				return ops;
			}
		}
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
		var handlerIp;
		while (ops > 0) {
			if (this.framePos === this.top) {
				message.type = FyMessage.message_thread_dead;
				return;
			}
			method = this.getCurrentMethod();
			if (method.accessFlags & FyConst.FY_ACC_NATIVE) {
				throw new FyException(undefined, "Native method pushed");
			}
			if (!method.invoke) {
				FyAOTUtil.aot(this, method);
			}
			if (this.currentThrowable) {
				console.log("!!!Exception occored #"
						+ this.currentThrowable
						+ ": "
						+ this.context.heap
								.getObjectClass(this.currentThrowable).name
						+ " at thread #" + this.threadId);
				while (true) {
					method = this.getCurrentMethod();
					handlerIp = this.getExceptionHandlerIp(
							this.currentThrowable, this.getCurrentLastIp());
					if (handlerIp >= 0) {
						this.localToFrame(this.getCurrentStackBase()
								+ method.maxLocals, handlerIp, handlerIp);
						this.stack[this.sp] = this.currentThrowable;
						this.sp++;
						this.currentThrowable = 0;
						break;
					} else {
						if (method.accessFlags & FyConst.FY_ACC_SYNCHRONIZED) {
							if (method.accessFlags & FyConst.FY_ACC_STATIC) {
								this.monitorExit(context
										.getClassObjectHandle(method.owner));
							} else {
								this.monitorExit(this.stack[this
										.getCurrentStackBase()]);
							}
						}
						if (method.accessFlags & FyConst.FY_ACC_CLINIT) {
							method.owner.clinitThreadId = -1;
						}
						this.popFrame(0);
						if (this.framePos >= this.top) {
							// 全部弹出了……显示stacktrace
							var data=this.context.dumpStackTrace(this.currentThrowable);
							console.log("Uncaught exception occored");
							for(var idx in data){
								console.log(data[idx]);
							}
							message.type = FyMessage.message_thread_dead;
							return;
							//this.context.panic("Uncaught exception occored", undefined);
							/*
							throw new FyException(
									undefined,
									"Uncatched exception: "
											+ this.context.heap
													.getObjectClass(this.currentThrowable));

							method = this.context
									.getMethod(FyConst.FY_BASE_THROWABLE
											+ ".printStackTrace.()V");
							this.pushFrame(method);
							this.stack[this.getCurrentStackBase()] = this.currentThrowable;
							this.currentThrowable = 0;
							*/
						}
					}
				}
			}
			ops = this.runEx(method, ops);
			if (this.yield) {
				ops = 0;
			}
		}
		this.yield = false;
	};

	FyThread.prototype.nativeReturn = function(size) {
		this.sp += size | 0;
	};

	FyThread.prototype.nativeReturnInt = function(value) {
		this.stack[this.sp++] = value;
	};

	FyThread.prototype.nativeReturnFloat = function(value) {
		this.floatStack[this.sp++] = value;
	};

	FyThread.prototype.nativeReturnDouble = function(value) {
		FyPortable.doubleToIeee64(value, this.stack, this.sp);
		this.sp += 2;
	};

	FyThread.prototype.nativeReturnLong = function(container, ofs) {
		this.stack[this.sp++] = container[ofs];
		this.stack[this.sp++] = container[ofs + 1];
	};

	/**
	 * 
	 * @param {Number}
	 *            handle
	 */
	FyThread.prototype.monitorEnter = function(handle) {
		this.context.threadManager.monitorEnter(this, handle);
	};

	FyThread.prototype.monitorExit = function(handle) {
		this.context.threadManager.monitorExit(this, handle);
	};
	/**
	 * 
	 * @param {Array}
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
					var method = context.methods[methodId];
					/**
					 * @return {String}
					 */
					var frame = method.frames[lip];

					if (frame === undefined) {
						throw new FyException(undefined,
								"Can't find frame for ip=" + lip
										+ " in method " + method.uniqueName);
					}

					var imax;
					if (isTop) {
						isTop = false;
						imax = thread.sp - sb;
					} else {
						imax = thread.getStackBase(frameId + 1) - sb;
					}
					// console.log("#scanRef threadId=" + thread.threadId
					// + " frameId=" + frameId + " length=" + frame.length
					// + " usedLength=" + imax);
					// locals
					// var imax = frame.length;
					for (var i = 0; i < imax; i++) {
						var value = stack[i + sb];
						if (frame.charCodeAt(i) === 49/* '1' */&& value !== 0) {
							if (FyConfig.debugMode
									&& ((value < 0 || value > FyConfig.maxObjects) || (heap
											.getObjectClass(value) === undefined))) {
								for (var j = 0; j < imax; j++) {
									console.log("#" + stack[j + sb]);
								}
								throw new FyException(undefined,
										"Illegal handle #" + value + " @" + i
												+ " threadId="
												+ thread.threadId + " frameId="
												+ frameId + " length="
												+ frame.length + " usedLength="
												+ imax);
							}
							// console.log("#Scanref add #" + value + " from
							// thread
							// #"
							// + thread.threadId);
							from.push(value);
						}
					}
				});
	};

})();
