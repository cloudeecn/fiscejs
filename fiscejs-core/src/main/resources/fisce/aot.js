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

var __FyAOTUtil;
(function() {
	"use strict";
	// instructions table
	var $ACMD = {
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
	var $$ACMD = [];
	(function() {
		for ( var name in $ACMD) {
			var code = $ACMD[name];
			$$ACMD[code] = name;
		}
	})();

	__FyAOTUtil = function(template) {
		this.mid = 0;
		this.template = template;
	};

	__FyAOTUtil.prototype.replaceAll = function(code, ip, oprand1, oprand2,
			other) {
		code = code.replace(/\$ip/g, ip).replace(/\$1/g, oprand1).replace(
				/\$2/g, oprand2);
		if (other) {
			for ( var key in other) {
				var value = other[key];
				code = code.replace(new RegExp("\\$" + key, "g"), value);
			}
		}
		if (!FyConfig.verboseMode) {
			code = code.replace(/\"\#\!\".*?\"\!\#\"\;/g, "");
		}
		return code;
	};

	/**
	 * @param {FyThread}
	 *            thread
	 * @param {FyMethod}
	 *            method
	 */
	__FyAOTUtil.prototype.aot = function(thread, method) {
		var context = thread.context;
		var macros = this.template.macros;
		var ops = this.template.ops;
		var len = method.code.length / 3;
		var code = [];
		var result;
		var clazz = method.owner;
		var global = clazz.global;
		/**
		 * @returns {String}
		 */
		var opsCheckCode = macros["OPS"].toString();

		this.mid++;

		code.push(this.replaceAll(macros["HEADER"], "$$$", "$$$", "$$$", {
			"mid" : this.mid
		}));
		code.push("\n");
		for (var ip = 0; ip < len; ip++) {
			var base = ip * 3;
			var op = method.code[base];
			var oprand1 = method.code[base + 1];
			var oprand2 = method.code[base + 2];
			var opsCheck = op >>> 16;
			op = op & 0x3FF;
			/**
			 * @returns {String}
			 */
			var opName = $$ACMD[op];
			/**
			 * @returns {Array}
			 */
			var frame = false;/* frame data will be extracted by gc */// frames[ip];
			if (!opName) {
				throw new FyException(undefined, "Error in preprocessing "
						+ method.uniqueName + ": Unknown opcode: " + op);
			}
			var opResult = ops[opName];
			if (!opResult) {
				throw new FyException(undefined, "Error in preprocessing "
						+ method.uniqueName + ": Opcode " + opName
						+ " is not implemented");
			}

			// TODO not all statments needs case
			code.push("case ");
			code.push(ip);
			code.push(": ");

			if (FyConfig.debugMode) {
				code.push("// ");
				code.push(opName);
				code.push(" ");
				code.push(oprand1);
				code.push(" ");
				code.push(oprand2);
				if (ip === 0) {
					code.push("\n");
					if (FyConfig.verboseMode) {
						code.push("console.log('Enter '+_m_.uniqueName);");
					}
					code
							.push("if (sb+_m_.maxLocals!==sp){throw new FyException(undefined,'Internal error');}");
				}
			}
			code.push("\n");
			if (FyConfig.verboseMode
					&& method.uniqueName != "java/lang/Character.<clinit>.()V") {
				code
						.push("console"
								+ ".log([thread.threadId,clazz, _m_.uniqueName,_m_,"
								+ ip
								+ ((method.accessFlags & FyConst.FY_ACC_STATIC) ? ", "
										: ", stack[sb]")
								+ ", thread.sp, \""
								+ opName
								+ "\", "
								+ oprand1
								+ ", "
								+ (oprand1 ? "clazz.constants[" + oprand1 + "]"
										: "undefined")
								+ ", "
								+ oprand2
								+ ", "
								+ (oprand2 ? "clazz.constants[" + oprand2 + "]"
										: "undefined")
								+ ", sb, sp, stack.subarray(sb,sb+_m_.maxLocals+_m_.maxStack)]);\n");
			}

			if (FyConfig.debugMode) {
				code
						.push("if(ops===undefined || ops!==ops){throw new FyException(undefined,'Illegal ops');}");
				code
						.push("if(sp<sb+"
								+ method.maxLocals
								+ "){throw new FyException(undefined,'Buffer underflow');}\n");
				code
						.push("if(sp>sb+"
								+ (method.maxLocals + method.maxStack)
								+ "){throw new FyException(undefined,'Buffer overflow');}\n");
			}

			if (ip === 0 && method.name === FyConst.FY_METHOD_CLINIT) {
				code.push(this.replaceAll(macros["CLINIT"], ip, oprand1,
						oprand2, {
							"clazz" : "clazz.superClass"
						}));
			}
			if (opsCheck) {
				code.push(this.replaceAll(opsCheckCode, ip, oprand1, oprand2, {
					"distance" : opsCheck
				}));
			}
			switch (op) {
			case 0xB2/* $.GETSTATIC */:
				var tmpField = context.lookupFieldVirtualFromConstant(global,
						clazz.constants[oprand1]);
				if (!(tmpField.accessFlags & FyConst.FY_ACC_STATIC)) {
					throw new FyException(FyConst.FY_EXCEPTION_INCOMPAT_CHANGE,
							"Field " + tmpField.uniqueName + " is not static");
				}
				if (thread.clinit(tmpField.owner)) {
					code.push("lip=" + ip + ";tmpClass=context.classes["
							+ tmpField.owner.classId + "];");
					code.push(this.replaceAll(macros["CLINIT"], ip, oprand1,
							oprand2, {
								"clazz" : "tmpClass"
							}));
				}
				switch (tmpField.size) {
				case 2:
					code.push("stack[sp++]=_heap["
							+ (tmpField.owner.staticPos + tmpField.posAbs)
							+ "];");
					code.push("stack[sp++]=_heap["
							+ (tmpField.owner.staticPos + tmpField.posAbs + 1)
							+ "];");
					break;
				default:
					code.push("stack[sp++]=_heap["
							+ (tmpField.owner.staticPos + tmpField.posAbs)
							+ "];");
					break;
				}
				break;
			case 0xB3/* $.PUTSTATIC */:
				var tmpField = context.lookupFieldVirtualFromConstant(global,
						clazz.constants[oprand1]);
				if (!(tmpField.accessFlags & FyConst.FY_ACC_STATIC)) {
					throw new FyException(FyConst.FY_EXCEPTION_INCOMPAT_CHANGE,
							"Field " + tmpField.uniqueName + " is not static");
				}
				/*
				 * if ((tmpField.accessFlags & FyConst.FY_ACC_FINAL) &&
				 * (this.owner != tmpField.owner)) { throw new
				 * FyException(FyConst.FY_EXCEPTION_ACCESS, "Field " +
				 * tmpField.uniqueName + " is final"); }
				 */
				if (thread.clinit(tmpField.owner)) {
					code.push("lip=" + ip + ";tmpClass=context.classes["
							+ tmpField.owner.classId + "];");
					code.push(this.replaceAll(macros["CLINIT"], ip, oprand1,
							oprand2, {
								"clazz" : "tmpClass"
							}));
				}
				switch (tmpField.size) {
				case 2:
					code.push("_heap["
							+ (tmpField.owner.staticPos + tmpField.posAbs + 1)
							+ "]=stack[--sp];");
					code.push("_heap["
							+ (tmpField.owner.staticPos + tmpField.posAbs)
							+ "]=stack[--sp];");
					break;
				default:
					code.push("_heap["
							+ (tmpField.owner.staticPos + tmpField.posAbs)
							+ "]=stack[--sp];");
					break;
				}
				break;
			case 0xB4/* $.GETFIELD */:
				var tmpField = context.lookupFieldVirtualFromConstant(global,
						clazz.constants[oprand1]);
				if (tmpField.accessFlags & FyConst.FY_ACC_STATIC) {
					throw new FyException(FyConst.FY_EXCEPTION_INCOMPAT_CHANGE,
							"Field " + tmpField.uniqueName + " is static");
				}
				code
						.push("if (stack[sp-1] === 0) {thread.localToFrame(sp,"
								+ ip
								+ ","
								+ (ip + 1)
								+ ");throw new FyException(FyConst.FY_EXCEPTION_NPT, '');}");
				switch (tmpField.size) {
				case 2:
					code
							.push("stack[sp] = _heap[_heap[stack[sp-1]] +"
									+ (context.heap.OBJ_META_SIZE
											+ tmpField.posAbs + 1) + "];");
					code.push("stack[sp-1] = _heap[_heap[stack[sp-1]] +"
							+ (context.heap.OBJ_META_SIZE + tmpField.posAbs)
							+ "];sp++;");
					break;
				default:
					code.push("stack[sp-1] = _heap[_heap[stack[sp-1]] +"
							+ (context.heap.OBJ_META_SIZE + tmpField.posAbs)
							+ "];");
					break;
				}
				break;
			case 0xB5/* $.PUTFIELD */:
				var tmpField = context.lookupFieldVirtualFromConstant(global,
						clazz.constants[oprand1]);
				if (tmpField.accessFlags & FyConst.FY_ACC_STATIC) {
					throw new FyException(FyConst.FY_EXCEPTION_INCOMPAT_CHANGE,
							"Field " + tmpField.uniqueName + " is static");
				}
				switch (tmpField.size) {
				case 2:
					code.push("sp-=3;");
					code
							.push("if (stack[sp] === 0) {thread.localToFrame(sp,"
									+ ip
									+ ","
									+ (ip + 1)
									+ ");throw new FyException(FyConst.FY_EXCEPTION_NPT, '');}");
					code.push("_heap[_heap[stack[sp]] + "
							+ (context.heap.OBJ_META_SIZE + tmpField.posAbs)
							+ "] = stack[sp+1];");
					code
							.push("_heap[_heap[stack[sp]] + "
									+ (context.heap.OBJ_META_SIZE
											+ tmpField.posAbs + 1)
									+ "] = stack[sp+2];");
					break;
				default:
					code.push("sp-=2;");
					code
							.push("if (stack[sp] === 0) {thread.localToFrame(sp,"
									+ ip
									+ ","
									+ (ip + 1)
									+ ");throw new FyException(FyConst.FY_EXCEPTION_NPT, '');}");
					code.push("_heap[_heap[stack[sp]] + "
							+ (context.heap.OBJ_META_SIZE + tmpField.posAbs)
							+ "] = stack[sp+1];");
					break;
				}
				break;
			case 0xB6/* $.INVOKEVIRTUAL */:
			case 0xB9/* $.INVOKEINTERFACE */:
				var tmpMethod = context.lookupMethodVirtualFromConstant(global,
						clazz.constants[oprand1]);
				if ((tmpMethod.accessFlags & FyConst.FY_ACC_STATIC)) {
					throw new FyException(FyConst.FY_EXCEPTION_INCOMPAT_CHANGE,
							tmpMethod.uniqueName + " is static");
				}

				// code.push("FyUtils.breakpoint();");

				code.push("tmpMethod=context.methods[" + tmpMethod.methodId
						+ "];");
				code
						.push("sp-="
								+ (tmpMethod.paramStackUsage + 1)
								+ ";if(stack[sp]===0){thread.localToFrame(sp,"
								+ ip
								+ ","
								+ (ip + 1)
								+ ");throw new FyException(FyConst.FY_EXCEPTION_NPT,\"\");}");
				if (tmpMethod.accessFlags & FyConst.FY_ACC_FINAL) {
					// generate static code
					if (tmpMethod.accessFlags & FyConst.FY_ACC_NATIVE) {
						var fun = context.nativeAOT[tmpMethod.uniqueName];
						if (!fun) {
							fun = FyContext.staticNativeAOT[tmpMethod.uniqueName];
						}
						if (fun) {
							code.push(fun(thread, method, ip));
						} else if (tmpMethod.invoke) {
							code
									.push("heap.beginProtect();thread.localToFrame(sp,"
											+ ip
											+ ","
											+ (ip + 1)
											+ ");ops=tmpMethod.invoke(context,thread,ops);heap.endProtect();if(ops<=0){return 0;}");
							code.push("sp+=" + (tmpMethod.returnLength | 0)
									+ ";");
						} else {
							code
									.push("thread.localToFrame(sp,"
											+ ip
											+ ","
											+ (ip + 1)
											+ ");thread.pendingNative=tmpMethod;return 0;");
						}
					} else {
						code.push("thread.localToFrame(sp," + ip + ","
								+ (ip + 1) + ");\n");
						code
								.push("if(tmpMethod.invoke===undefined){FyAOTUtil.aot(thread,tmpMethod);}\n");
						code.push("ops = thread.pushMethod(tmpMethod,ops);\n");
						code.push("if(ops<=0){return 0;}\n");
						code
								.push("ops = tmpMethod.invoke(context,thread,ops);\n");
						code.push("if(ops<=0){return 0;}\n");
						code.push("sp+=" + (tmpMethod.returnLength | 0) + ";");
					}

				} else {
					// generate dynamic code
					code.push("thread.localToFrame(sp," + ip + "," + (ip + 1)
							+ ");\n");
					code
							.push("tmpMethod = context.lookupMethodVirtualByMethod(heap.getObjectClass(stack[sp]), tmpMethod);\n");
					code
							.push("if(tmpMethod.accessFlags & FyConst.FY_ACC_NATIVE){\n");
					code.push("if(tmpMethod.invoke){\n");
					code
							.push("heap.beginProtect();ops=tmpMethod.invoke(context,thread,ops);heap.endProtect();if(ops<=0) {return 0;}\n");
					code.push("sp+=" + (tmpMethod.returnLength | 0) + ";\n");
					code.push("}else{\n");
					code.push("thread.pendingNative=tmpMethod;return 0;\n");
					code.push("}\n");
					code.push("}else{\n");
					code
							.push("if(tmpMethod.invoke===undefined){FyAOTUtil.aot(thread,tmpMethod);}\n");
					code.push("ops = thread.pushMethod(tmpMethod,ops);\n");
					code.push("if(ops<=0) {return 0;}\n");
					code.push("ops = tmpMethod.invoke(context,thread,ops);");
					code.push("if(ops<=0) {return 0;}\n");
					code.push("sp+=" + (tmpMethod.returnLength | 0) + ";\n");
					code.push("}\n");
				}
				break;
			case 0xB7/* $.INVOKESPECIAL */:
				var tmpMethod = context.lookupMethodVirtualFromConstant(global,
						clazz.constants[oprand1]);
				if ((tmpMethod.accessFlags & FyConst.FY_ACC_STATIC)) {
					throw new FyException(FyConst.FY_EXCEPTION_INCOMPAT_CHANGE,
							tmpMethod.uniqueName + " is static");
				}
				var tmpClass = tmpMethod.owner;
				if ((clazz.accessFlags & FyConst.FY_ACC_SUPER)
						&& context.classLoader.isSuperClassOf(tmpClass, clazz)
						&& tmpMethod.name === FyConst.FY_METHOD_INIT) {
					tmpMethod = context.lookupMethodVirtualByMethod(
							clazz.superClass, tmpMethod);
				}
				if (tmpMethod === undefined) {
					throw new FyException(
							FyConst.FY_EXCEPTION_ABSTRACT,
							"Special: "
									+ context.lookupMethodVirtualFromConstant(
											global, clazz.constants[oprand1]).uniqueName);
				}
				if (tmpMethod.name !== FyConst.FY_METHOD_INIT
						&& tmpMethod.owner !== tmpClass) {
					throw new FyException(FyConst.FY_EXCEPTION_NO_METHOD,
							tmpMethod.uniqueName);
				}
				if (tmpMethod.accessFlags & FyConst.FY_ACC_STATIC) {
					throw new FyException(FyConst.FY_EXCEPTION_INCOMPAT_CHANGE,
							tmpMethod.uniqueName);
				}
				if (tmpMethod.accessFlags & FyConst.FY_ACC_ABSTRACT) {
					throw new FyException(FyConst.FY_EXCEPTION_ABSTRACT,
							tmpMethod.uniqueName);
				}
				code.push("tmpMethod=context.methods[" + tmpMethod.methodId
						+ "];");
				code.push("sp-=" + (tmpMethod.paramStackUsage + 1) + ";");
				code
						.push("if(stack[sp]===0){throw new FyException(FyConst.FY_EXCEPTION_NPT,'');}");
				if (tmpMethod.accessFlags & FyConst.FY_ACC_NATIVE) {
					var fun = context.nativeAOT[tmpMethod.uniqueName];
					if (!fun) {
						fun = FyContext.staticNativeAOT[tmpMethod.uniqueName];
					}
					if (fun) {
						code.push(fun(thread, method, ip));
					} else if (tmpMethod.invoke) {
						code
								.push("heap.beginProtect();thread.localToFrame(sp,"
										+ ip
										+ ","
										+ (ip + 1)
										+ ");ops=tmpMethod.invoke(context,thread,ops);heap.endProtect();if(ops<=0){return 0;}");
						code.push("sp+=" + (tmpMethod.returnLength | 0) + ";");
						// switch(tmpMethod.returnClassName.charAt(0))
					} else {
						code.push("thread.localToFrame(sp," + ip + ","
								+ (ip + 1)
								+ ");thread.pendingNative=tmpMethod;return 0;");
					}
				} else {
					code
							.push("thread.localToFrame(sp,"
									+ ip
									+ ","
									+ (ip + 1)
									+ ");if(tmpMethod.invoke===undefined){FyAOTUtil.aot(thread,tmpMethod);} ops = thread.pushMethod(tmpMethod,ops);if(ops<=0) {return 0;}ops = tmpMethod.invoke(context,thread,ops);if(ops<=0) {return 0;}");
					code.push("sp+=" + (tmpMethod.returnLength | 0) + ";");
				}
				break;
			case 0xB8/* $.INVOKESTATIC */:
				var tmpMethod = context.lookupMethodVirtualFromConstant(global,
						clazz.constants[oprand1]);
				if (!(tmpMethod.accessFlags & FyConst.FY_ACC_STATIC)) {
					throw new FyException(FyConst.FY_EXCEPTION_INCOMPAT_CHANGE,
							tmpMethod.uniqueName + " is not static");
				}
				var tmpClass = tmpMethod.owner;
				code.push("tmpMethod=context.methods[" + tmpMethod.methodId
						+ "];");
				if (context.getMethod(tmpClass.name + "."
						+ FyConst.FY_METHOD_CLINIT + ".()V")) {
					code.push(this.replaceAll(macros["CLINIT"], ip, oprand1,
							oprand2, {
								"clazz" : "tmpMethod.owner"
							}));
				}
				code.push("sp-=" + (tmpMethod.paramStackUsage) + ";");
				if (tmpMethod.accessFlags & FyConst.FY_ACC_NATIVE) {
					var fun = context.nativeAOT[tmpMethod.uniqueName];
					if (!fun) {
						fun = FyContext.staticNativeAOT[tmpMethod.uniqueName];
					}
					if (fun) {
						code.push(fun(thread, method, ip));
					} else if (tmpMethod.invoke) {
						code
								.push("heap.beginProtect();thread.localToFrame(sp,"
										+ ip
										+ ","
										+ (ip + 1)
										+ ");ops=tmpMethod.invoke(context,thread,ops);heap.endProtect();if(ops<=0) {return 0;}");
						code.push("sp+=" + (tmpMethod.returnLength | 0) + ";");
					} else {
						code.push("thread.localToFrame(sp," + ip + ","
								+ (ip + 1)
								+ ");thread.pendingNative=tmpMethod;return 0;");
					}
				} else {
					code
							.push("thread.localToFrame(sp,"
									+ ip
									+ ","
									+ (ip + 1)
									+ ");if(tmpMethod.invoke===undefined){FyAOTUtil.aot(thread,tmpMethod);} ops = thread.pushMethod(tmpMethod,ops);if(ops<=0) {return 0;}ops = tmpMethod.invoke(context,thread,ops);if(ops<=0) {return 0;}");
					code.push("sp+=" + (tmpMethod.returnLength | 0) + ";");
				}
				break;
			default:
				code.push(this.replaceAll(opResult.code, ip, oprand1, oprand2));
				break;
			}
			code.push("\n\n");
		}
		code.push(macros["TAIL"].toString());
		result = code.join("").toString();
		if (FyConfig.debugMode) {
			if (result.indexOf("$") >= 0) {
				console.log(result);
				throw new FyException(undefined,
						"method.sample.js should not have content begins with '$' except $ip $1 $2");
			}
		}

		try {
			var body = "'use strict';// " + method.uniqueName + "\n" + result;
			// var foo = new Function("context", "thread", "ops", "//
			// "
			// + method.uniqueName + "\n" + result);
			// method.invoke = foo;
			method.invoke = new Function("return (function __aot_f_" + this.mid
					+ "(context,thread,ops){" + body + "});")();
			// method.invoke = __aot(this.mid | 0, body);
		} catch (e) {
			console.log("Exception occored in generating function for "
					+ method.uniqueName + ": \n" + result);
			throw e;
		}
		// console.log(method.invoke);
	};
})();