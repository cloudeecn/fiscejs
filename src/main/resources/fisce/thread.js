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

	// instructions table
	var $ = {
		NOP : 0x00,
		ACONST_NULL : 0x01,
		ICONST_M1 : 0x02,
		ICONST_0 : 0x03,
		ICONST_1 : 0x04,
		ICONST_2 : 0x05,
		ICONST_3 : 0x06,
		ICONST_4 : 0x07,

		ICONST_5 : 0x08,
		LCONST_0 : 0x09,
		LCONST_1 : 0x0A,
		FCONST_0 : 0x0B,
		FCONST_1 : 0x0C,
		FCONST_2 : 0x0D,
		DCONST_0 : 0x0E,
		DCONST_1 : 0x0F,

		BIPUSH : 0x10,
		SIPUSH : 0x11,
		LDC : 0x12,
		LDC_W : 0x13,
		LDC2_W : 0x14,
		ILOAD : 0x15,
		LLOAD : 0x16,
		FLOAD : 0x17,

		DLOAD : 0x18,
		ALOAD : 0x19,
		ILOAD_0 : 0x1A,
		ILOAD_1 : 0x1B,
		ILOAD_2 : 0x1C,
		ILOAD_3 : 0x1D,
		LLOAD_0 : 0x1E,
		LLOAD_1 : 0x1F,

		LLOAD_2 : 0x20,
		LLOAD_3 : 0x21,
		FLOAD_0 : 0x22,
		FLOAD_1 : 0x23,
		FLOAD_2 : 0x24,
		FLOAD_3 : 0x25,
		DLOAD_0 : 0x26,
		DLOAD_1 : 0x27,

		DLOAD_2 : 0x28,
		DLOAD_3 : 0x29,
		ALOAD_0 : 0x2A,
		ALOAD_1 : 0x2B,
		ALOAD_2 : 0x2C,
		ALOAD_3 : 0x2D,
		IALOAD : 0x2E,
		LALOAD : 0x2F,

		FALOAD : 0x30,
		DALOAD : 0x31,
		AALOAD : 0x32,
		BALOAD : 0x33,
		CALOAD : 0x34,
		SALOAD : 0x35,
		ISTORE : 0x36,
		LSTORE : 0x37,

		FSTORE : 0x38,
		DSTORE : 0x39,
		ASTORE : 0x3A,
		ISTORE_0 : 0x3B,
		ISTORE_1 : 0x3C,
		ISTORE_2 : 0x3D,
		ISTORE_3 : 0x3E,
		LSTORE_0 : 0x3F,

		LSTORE_1 : 0x40,
		LSTORE_2 : 0x41,
		LSTORE_3 : 0x42,
		FSTORE_0 : 0x43,
		FSTORE_1 : 0x44,
		FSTORE_2 : 0x45,
		FSTORE_3 : 0x46,
		DSTORE_0 : 0x47,

		DSTORE_1 : 0x48,
		DSTORE_2 : 0x49,
		DSTORE_3 : 0x4A,
		ASTORE_0 : 0x4B,
		ASTORE_1 : 0x4C,
		ASTORE_2 : 0x4D,
		ASTORE_3 : 0x4E,
		IASTORE : 0x4F,

		LASTORE : 0x50,
		FASTORE : 0x51,
		DASTORE : 0x52,
		AASTORE : 0x53,
		BASTORE : 0x54,
		CASTORE : 0x55,
		SASTORE : 0x56,
		POP : 0x57,

		POP2 : 0x58,
		DUP : 0x59,
		DUP_X1 : 0x5A,
		DUP_X2 : 0x5B,
		DUP2 : 0x5C,
		DUP2_X1 : 0x5D,
		DUP2_X2 : 0x5E,
		SWAP : 0x5F,

		IADD : 0x60,
		LADD : 0x61,
		FADD : 0x62,
		DADD : 0x63,
		ISUB : 0x64,
		LSUB : 0x65,
		FSUB : 0x66,
		DSUB : 0x67,

		IMUL : 0x68,
		LMUL : 0x69,
		FMUL : 0x6A,
		DMUL : 0x6B,
		IDIV : 0x6C,
		LDIV : 0x6D,
		FDIV : 0x6E,
		DDIV : 0x6F,

		IREM : 0x70,
		LREM : 0x71,
		FREM : 0x72,
		DREM : 0x73,
		INEG : 0x74,
		LNEG : 0x75,
		FNEG : 0x76,
		DNEG : 0x77,

		ISHL : 0x78,
		LSHL : 0x79,
		ISHR : 0x7A,
		LSHR : 0x7B,
		IUSHR : 0x7C,
		LUSHR : 0x7D,
		IAND : 0x7E,
		LAND : 0x7F,

		IOR : 0x80,
		LOR : 0x81,
		IXOR : 0x82,
		LXOR : 0x83,
		IINC : 0x84,
		I2L : 0x85,
		I2F : 0x86,
		I2D : 0x87,

		L2I : 0x88,
		L2F : 0x89,
		L2D : 0x8A,
		F2I : 0x8B,
		F2L : 0x8C,
		F2D : 0x8D,
		D2I : 0x8E,
		D2L : 0x8F,

		D2F : 0x90,
		I2B : 0x91,
		I2C : 0x92,
		I2S : 0x93,
		LCMP : 0x94,
		FCMPL : 0x95,
		FCMPG : 0x96,
		DCMPL : 0x97,

		DCMPG : 0x98,
		IFEQ : 0x99,
		IFNE : 0x9A,
		IFLT : 0x9B,
		IFGE : 0x9C,
		IFGT : 0x9D,
		IFLE : 0x9E,
		IF_ICMPEQ : 0x9F,

		IF_ICMPNE : 0xA0,
		IF_ICMPLT : 0xA1,
		IF_ICMPGE : 0xA2,
		IF_ICMPGT : 0xA3,
		IF_ICMPLE : 0xA4,
		IF_ACMPEQ : 0xA5,
		IF_ACMPNE : 0xA6,
		GOTO : 0xA7,

		JSR : 0xA8,
		RET : 0xA9,
		TABLESWITCH : 0xAA,
		LOOKUPSWITCH : 0xAB,
		IRETURN : 0xAC,
		LRETURN : 0xAD,
		FRETURN : 0xAE,
		DRETURN : 0xAF,

		ARETURN : 0xB0,
		RETURN : 0xB1,
		GETSTATIC : 0xB2,
		PUTSTATIC : 0xB3,
		GETFIELD : 0xB4,
		PUTFIELD : 0xB5,
		INVOKEVIRTUAL : 0xB6,
		INVOKESPECIAL : 0xB7,

		INVOKESTATIC : 0xB8,
		INVOKEINTERFACE : 0xB9,
		UNUSED_BA : 0xBA,
		NEW : 0xBB,
		NEWARRAY : 0xBC,
		ANEWARRAY : 0xBD,
		ARRAYLENGTH : 0xBE,
		ATHROW : 0xBF,

		CHECKCAST : 0xC0,
		INSTANCEOF : 0xC1,
		MONITORENTER : 0xC2,
		MONITOREXIT : 0xC3,
		WIDE : 0xC4,
		MULTIANEWARRAY : 0xC5,
		IFNULL : 0xC6,
		IFNONNULL : 0xC7,

		GOTO_W : 0xC8,
		JSR_W : 0xC9,
		BREAKPOINT : 0xCA
	};
	var $$ = [];
	(function() {
		for ( var name in $) {
			var code = $[name];
			$$[code] = name;
		}
	})();

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
	 */
	FyThread.prototype.prepareThrowable = function(exception) {
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