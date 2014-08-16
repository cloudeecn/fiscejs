(function() {
	var $1 = 0 | 0;
	var $2 = 0 | 0;
	var $ip = 0 | 0;
	FyMethod.prototype.invoke = //
	/**
	 * Usable macros<br>
	 * <h2> 1. Extract phase</h2>
	 * <ul>
	 * <li> "// ##xxx ~ // ##xxx-END" will put to json data with xxx as key</li>
	 * <li>"// ##xxx|yyy|... ~ // ##xxx|yyy|...-END" will put to json data with
	 * xxx, yyy, etc as keys</li>
	 * <li>All legal comments will be ignored</li>
	 * </ul>
	 * <h2>2. aot phase</h2>
	 * <ul>
	 * <li>$u1 $u2 $s2 etc. will generate code as numbers from next n bytes
	 * from code (u=unsigned s=signed)</li>
	 * <li>$checksp(movement) generate code check for stack over/underflow</li>
	 * <li>$checklocal(id) generates code check for local var id</li>
	 * </ul>
	 * 
	 * 
	 */
	/**
	 * this = FyMethod
	 * 
	 * @param {FyContext}
	 *            context vm context
	 * @param {FyThread}
	 *            thread current thread
	 * @param {Number}
	 *            ops instructions left to run
	 */
	function(context, thread, sb, ops) {
		"use strict";
		// ##MACRO-HEADER
		/**
		 * @returns {FyClass}
		 */
		var clazz = this.owner;

		/**
		 * @returns {FyMethod}
		 */
		var _m_ = this;
		/**
		 * @returns {FyHeap}
		 */
		var heap = context.heap;
		/**
		 * @returns {Int32Array}
		 */
		var _heap = heap._heap;

		/**
		 * @returns {__FyLongOps}
		 */
		var longOps = thread.longOps;
		var constants = clazz.constants;
		var global = clazz.global;
		/**
		 * @returns {Int32Array}
		 */
		var stack = thread.stack;
		/**
		 * @returns {Float32Array}
		 */
		var floatStack = thread.floatStack;
		var ip = thread.getCurrentIp();
		var lip = 0;
		ops = ops | 0;

		/**
		 * @returns {FyField}
		 */
		var tmpField = FyField.empty;

		/**
		 * @returns {FyClass}
		 */
		var tmpClass = FyField.empty;

		/**
		 * @returns {FyClass}
		 */
		var clinitClass = FyField.empty;

		/**
		 * @returns {FyMethod}
		 */
		var tmpMethod = FyField.empty;

		var tmpInt1 = 0;

		while (true) {
			__fy_inner: switch (ip) {
			// ###
			case 0:
				if (_m_.name == FyConst.FY_METHOD_CLINIT) {
					// ##MACRO-CLINIT
					// !CLINIT
					clinitClass = thread.clinit($clazz);
					if (clinitClass !== undefined) {
						// invoke clinit
						if (clinitClass.clinitThreadId == 0) {
							// no thread is running it, so let this run
							clinitClass.clinitThreadId = thread.threadId;
							// Local to frame
							thread.localToFrame($ip, $ip);
							thread.pushFrame(clinitClass.clinit, sb + $spo);
							return 0;
						} else {
							// wait for other thread clinit
							thread.localToFrame($ip, $ip);
							return 0;
						}
					}
					// ###
				}
				// ##MACRO-OPS
				ops -= $distance;
				if (ops < 0) {
					thread.localToFrame($ip, $ip);
					return 0;
				}
				// ###
				// ##OP-AALOAD|FALOAD|IALOAD -2 1
				thread.localToFrame($ip, $ip + 1);
				heap.getArrayRaw32ToHeap(stack[sb + $spo - 2], stack[sb + $spo
						- 1], sb + $spo - 2);
				// ###
			case 2:
				// ##OP-AASTORE -3 0
				thread.localToFrame($ip, $ip + 1);
				// 2[1]=0
				if (stack[sb + $spo - 1] !== 0
						&& (!context.classLoader
								.canCast(heap.getObjectClass(stack[sb + $spo
										- 1]), heap.getObjectClass(stack[sb
										+ $spo - 3]).contentClass))) {
					throw new FyException(
							FyConst.FY_EXCEPTION_STORE,
							"Can't store "
									+ heap.getObjectClass(stack[sb + $spo - 1]).name
									+ " to "
									+ heap.getObjectClass(stack[sb + $spo - 3]).name);
				}
				heap.putArrayRaw32FromHeap(stack[sb + $spo - 3], stack[sb
						+ $spo - 2], sb + $spo - 1);
				// ###
			case 3:
				// ##OP-FASTORE|IASTORE -3 0

				thread.localToFrame($ip, $ip + 1);
				heap.putArrayRaw32FromHeap(stack[sb + $spo - 3], stack[sb
						+ $spo - 2], sb + $spo - 1);
				// ###
			case 4:
				// ##OP-ACONST_NULL 0 1

				stack[sb + $spo] = 0;
				// ###
			case 5:
				// ##OP-ILOAD|FLOAD|ALOAD 0 1

				"#!";
				console.log([ sb + $spo, "<==", sb + $1, stack[sb + $spo],
						"<==", stack[sb + $1] ]);
				"!#";
				stack[sb + $spo] = stack[sb + $1];
				// ###
			case 17:
				// ##OP-ANEWARRAY -1 1

				thread.localToFrame($ip, $ip + 1);
				if (stack[sb + $spo - 1] < 0) {
					throw new FyException(FyConst.FY_EXCEPTION_AIOOB, ""
							+ stack[sb + $spo - 1]);
				}
				stack[sb + $spo - 1] = heap.allocateArray(context
						.lookupArrayClass(context.lookupClassFromConstant(
								global, constants[$1])), stack[sb + $spo - 1]);
				// ###
			case 20:
				// ##OP-IRETURN|FRETURN|ARETURN -1 0

				if (_m_.accessFlags & FyConst.FY_ACC_SYNCHRONIZED) {
					thread.localToFrame($ip, $ip + 1);
					if (_m_.accessFlags & FyConst.FY_ACC_STATIC) {
						thread.monitorExit(context.getClassObjectHandle(clazz));
					} else {
						thread.monitorExit(stack[sb]);
					}
				}
				stack[sb] = stack[sb + $spo - 1];
				"#!";
				console.log(stack[sb]);
				"!#";
				thread.popFrame(1);
				thread.forwardCurrentLIp();
				return ops;
				// ###
			case 22:
				// ##OP-ARRAYLENGTH -1 1

				thread.localToFrame($ip, $ip + 1);
				stack[sb + $spo - 1] = heap.arrayLength(stack[sb + $spo - 1]);
				// ###
			case 23:
				// ##OP-ISTORE|FSTORE|ASTORE -1 0

				"#!";
				console.log([ sb + $spo - 1, "==>", sb + $1,
						stack[sb + $spo - 1], "==>", stack[sb + $1] ]);
				"!#";
				stack[sb + $1] = stack[sb + $spo - 1];
				// ###
			case 35:
				// ##OP-ATHROW -1 0

				thread.currentThrowable = stack[sb + $spo - 1];
				thread.localToFrame($ip, $ip);
				return 0;
				// ###
			case 36:
				// ##OP-BALOAD -2 1

				thread.localToFrame($ip, $ip + 1);
				heap.getArrayRaw8ToHeap(stack[sb + $spo - 2], stack[sb + $spo
						- 1], sb + $spo - 2);
				// ###
			case 37:
				// ##OP-BASTORE -3 0

				thread.localToFrame($ip, $ip + 1);
				heap.putArrayRaw8FromHeap(stack[sb + $spo - 3], stack[sb + $spo
						- 2], sb + $spo - 1);
				// ###
			case 38:
				// ##OP-BIPUSH 0 1

				stack[sb + $spo] = $1;
				// ###
			case 41:
				// ##OP-CALOAD -2 1

				thread.localToFrame($ip, $ip + 1);
				heap.getArrayRaw16ToHeap(stack[sb + $spo - 2], stack[sb + $spo
						- 1], sb + $spo - 2);
				stack[sb + $spo - 2] &= 0xffff;
				// ###
			case 42:
				// ##OP-CASTORE -3 0

				thread.localToFrame($ip, $ip + 1);
				heap.putArrayRaw16FromHeap(stack[sb + $spo - 3], stack[sb
						+ $spo - 2], sb + $spo - 1);
				// ###
			case 43:
				// ##OP-CHECKCAST -1 0

				if (stack[sb + $spo - 1] !== 0) {
					if (!context.classLoader.canCast(heap
							.getObjectClass(stack[sb + $spo - 1]), context
							.lookupClassFromConstant(global, constants[$1]))) {
						thread.localToFrame($ip, $ip + 1);
						throw new FyException(FyConst.FY_EXCEPTION_CAST,
								"Can't case "
										+ heap.getObjectClass(stack[sb + $spo
												- 1]).name
										+ " to "
										+ context.lookupClassFromConstant(
												global, constants[$1]).name);
					}
				}
				// ###
			case 46:
				// ##OP-D2F -2 1
				stack[sb + $spo - 2] = FyPortable.floatToIeee32(FyPortable
						.ieee64ToDouble(stack, sb + $spo - 2));
				// ###
			case 47:
				// ##OP-D2I -2 1
				stack[sb + $spo - 2] = FyPortable.ieee64ToDouble(stack, sb
						+ $spo - 2) >> 0;
				// ###
			case 48:
				// ##OP-D2L -2 2
				longOps.longFromNumber(sb + $spo - 2, FyPortable
						.ieee64ToDouble(stack, sb + $spo - 2));
				// ###
			case 49:
				// ##OP-DADD -4 2

				FyPortable.doubleToIeee64(FyPortable.ieee64ToDouble(stack, sb
						+ $spo - 4)
						+ FyPortable.ieee64ToDouble(stack, sb + $spo - 2),
						stack, sb + $spo - 4);
				// ###
			case 50:
				// ##OP-LALOAD|DALOAD -2 2
				thread.localToFrame($ip, $ip + 1);
				heap.getArrayRaw64ToHeap(stack[sb + $spo - 2], stack[sb + $spo
						- 1], sb + $spo - 2);
				// ###
			case 51:
				// ##OP-LASTORE|DASTORE -4 0
				thread.localToFrame($ip, $ip + 1);
				heap.putArrayRaw64FromHeap(stack[sb + $spo - 4], stack[sb
						+ $spo - 3], sb + $spo - 2);
				// ###
			case 52:
				// ##OP-DCMPG -4 1
				stack[sb + $spo - 4] = FyPortable.dcmpg(FyPortable
						.ieee64ToDouble(stack, sb + $spo - 4), FyPortable
						.ieee64ToDouble(stack, sb + $spo - 2));
				// ###
			case 53:
				// ##OP-DCMPL -4 1
				stack[sb + $spo - 4] = FyPortable.dcmpl(FyPortable
						.ieee64ToDouble(stack, sb + $spo - 4), FyPortable
						.ieee64ToDouble(stack, sb + $spo - 2));
				// ###
			case 54:
				// ##OP-DCONST_0 0 2
				FyPortable.doubleToIeee64(0.0, stack, sb + $spo);
				// ###
			case 55:
				// ##OP-DCONST_1 0 2
				FyPortable.doubleToIeee64(1.0, stack, sb + $spo);
				// ###
			case 56:
				// ##OP-DDIV -4 2
				FyPortable.doubleToIeee64(FyPortable.ieee64ToDouble(stack, sb
						+ $spo - 4)
						/ FyPortable.ieee64ToDouble(stack, sb + $spo - 2),
						stack, sb + $spo - 4);
				// ###
			case 57:
				// ##OP-DMUL -4 2
				FyPortable.doubleToIeee64(FyPortable.ieee64ToDouble(stack, sb
						+ $spo - 4)
						* FyPortable.ieee64ToDouble(stack, sb + $spo - 2),
						stack, sb + $spo - 4);
				// ###
			case 58:
				// ##OP-DNEG -2 2

				FyPortable.doubleToIeee64(-FyPortable.ieee64ToDouble(stack, sb
						+ $spo - 2), stack, sb + $spo - 2);
				// ###
			case 59:
				// ##OP-DREM -4 2

				FyPortable.doubleToIeee64(FyPortable.ieee64ToDouble(stack, sb
						+ $spo - 4)
						% FyPortable.ieee64ToDouble(stack, sb + $spo - 2),
						stack, sb + $spo - 4);
				// ###
			case 60:
				// ##OP-DRETURN|LRETURN -2 0

				if (_m_.accessFlags & FyConst.FY_ACC_SYNCHRONIZED) {
					thread.localToFrame($ip, $ip + 1);
					if (_m_.accessFlags & FyConst.FY_ACC_STATIC) {
						thread.monitorExit(context.getClassObjectHandle(clazz));
					} else {
						thread.monitorExit(stack[sb]);
					}
				}
				stack[sb] = stack[sb + $spo - 2];
				stack[sb + 1] = stack[sb + $spo - 1];
				thread.popFrame(2);
				thread.forwardCurrentLIp();
				return ops;
				// ###
			case 61:
				// ##OP-DSUB -4 2

				FyPortable.doubleToIeee64(FyPortable.ieee64ToDouble(stack, sb
						+ $spo - 4)
						- FyPortable.ieee64ToDouble(stack, sb + $spo - 2),
						stack, sb + $spo - 4);
				// ###
			case 62:
				// ##OP-DUP -1 2

				stack[sb + $spo] = stack[sb + $spo - 1];
				// ###
			case 63:
				// ##OP-DUP_X1 -2 3

				stack[sb + $spo] = stack[sb + $spo - 1];
				stack[sb + $spo - 1] = stack[sb + $spo - 2];
				stack[sb + $spo - 2] = stack[sb + $spo];
				// ###
			case 64:
				// ##OP-DUP_X2 -3 4

				stack[sb + $spo] = stack[sb + $spo - 1];
				stack[sb + $spo - 1] = stack[sb + $spo - 2];
				stack[sb + $spo - 2] = stack[sb + $spo - 3];
				stack[sb + $spo - 3] = stack[sb + $spo];
				// ###
			case 65:
				// ##OP-DUP2 -2 4

				stack[sb + $spo + 1] = stack[sb + $spo - 1];
				stack[sb + $spo] = stack[sb + $spo - 2];
				// ###
			case 66:
				// 321 -> 21321
				// ##OP-DUP2_X1 -3 5

				stack[sb + $spo + 1] = stack[sb + $spo - 1];
				stack[sb + $spo] = stack[sb + $spo - 2];
				stack[sb + $spo - 1] = stack[sb + $spo - 3];
				stack[sb + $spo - 2] = stack[sb + $spo + 1];
				stack[sb + $spo - 3] = stack[sb + $spo];
				// ###
			case 67:
				// 4321 -> 214321
				// ##OP-DUP2_X2 -4 6

				stack[sb + $spo + 1] = stack[sb + $spo - 1];
				stack[sb + $spo] = stack[sb + $spo - 2];
				stack[sb + $spo - 1] = stack[sb + $spo - 3];
				stack[sb + $spo - 2] = stack[sb + $spo + 4];
				stack[sb + $spo - 3] = stack[sb + $spo + 1];
				stack[sb + $spo - 4] = stack[sb + $spo];
				// ###
			case 68:
				// ##OP-F2D -1 2

				FyPortable.doubleToIeee64(floatStack[sb + $spo - 1], stack, sb
						+ $spo - 1);
				// ###
			case 69:
				// ##OP-F2I -1 1

				stack[sb + $spo - 1] = floatStack[sb + $spo - 1];
				// ###
			case 70:
				// ##OP-F2L -1 2
				longOps
						.longFromNumber(sb + $spo - 1,
								floatStack[sb + $spo - 1]);
				// ###
			case 71:
				// ##OP-FADD -2 1

				floatStack[sb + $spo - 2] += floatStack[sb + $spo - 1];
				// ###
			case 72:
				// ##OP-FCMPG -2 1

				stack[sb + $spo - 2] = FyPortable.dcmpg(floatStack[sb + $spo
						- 2], floatStack[sb + $spo - 1]);
				// ###
			case 73:
				// ##OP-FCMPL -2 1

				stack[sb + $spo - 2] = FyPortable.dcmpl(floatStack[sb + $spo
						- 2], floatStack[sb + $spo - 1]);
				// ###
			case 74:
				// ##OP-FCONST_0 0 1

				floatStack[sb + $spo] = 0;
				// ###
			case 75:
				// ##OP-FCONST_1 0 1

				floatStack[sb + $spo] = 1;
				// ###
			case 76:
				// ##OP-FCONST_2 0 1

				floatStack[sb + $spo] = 2;
				// ###
			case 77:
				// ##OP-FDIV -2 1

				floatStack[sb + $spo - 2] /= floatStack[sb + $spo - 1];
				// ###
			case 78:
				// ##OP-FMUL -2 1

				floatStack[sb + $spo - 2] *= floatStack[sb + $spo - 1];
				// ###
			case 79:
				// ##OP-FNEG -1 1

				floatStack[sb + $spo - 1] = -floatStack[sb + $spo - 1];
				// ###
			case 80:
				// ##OP-FREM -2 1

				floatStack[sb + $spo - 2] %= floatStack[sb + $spo - 1];
				// ###
			case 81:
				// ##OP-FSUB -2 1

				floatStack[sb + $spo - 2] -= floatStack[sb + $spo - 1];
				// ###
			case 82:
				// ##OP-GETFIELD -1 X-GETFIELD
				// X-GETFIELD
				throw new FyException(undefined, "Should be optimized by aot");
				// ###
			case 83:
				// ##OP-GETSTATIC 0 X-GETSTATIC
				// X-GETSTATIC
				throw new FyException(undefined, "Should be optimized by aot");
				// ###
			case 84:
				// ##OP-GOTO 0 0

				ip = $1;
				break __fy_inner;
			// ###
			case 85:
				// ##OP-I2B -1 1

				stack[sb + $spo - 1] = stack[sb + $spo - 1] << 24 >> 24;
				// ###
			case 86:
				// ##OP-I2C -1 1

				stack[sb + $spo - 1] &= 0xffff;
				// ###
			case 87:
				// ##OP-I2D -1 2

				FyPortable.doubleToIeee64(stack[sb + $spo - 1], stack, sb
						+ $spo - 1);
				// ###
			case 88:
				// ##OP-I2F -1 1

				stack[sb + $spo - 1] = FyPortable.floatToIeee32(stack[sb + $spo
						- 1]);
				// ###
			case 89:
				// ##OP-I2L -1 2

				stack[sb + $spo] = stack[sb + $spo - 1];
				stack[sb + $spo - 1] = stack[sb + $spo] >= 0 ? 0 : -1;
				// ###
			case 90:
				// ##OP-I2S -1 1

				stack[sb + $spo - 1] = stack[sb + $spo - 1] << 16 >> 16;
				// ###
			case 100:
				// ##OP-IADD -2 1

				stack[sb + $spo - 2] += stack[sb + $spo - 1];
				// ###
			case 101:
				// ##OP-IAND -2 1

				stack[sb + $spo - 2] &= stack[sb + $spo - 1];
				// ###
			case 102:
				// ##OP-ICONST_M1 0 1

				stack[sb + $spo] = -1;
				// ###
			case 103:
				// ##OP-ICONST_0 0 1

				stack[sb + $spo] = 0;
				// ###
			case 104:
				// ##OP-ICONST_1 0 1

				stack[sb + $spo] = 1;
				// ###
			case 105:
				// ##OP-ICONST_2 0 1

				stack[sb + $spo] = 2;
				// ###
			case 106:
				// ##OP-ICONST_3 0 1

				stack[sb + $spo] = 3;
				// ###
			case 107:
				// ##OP-ICONST_4 0 1

				stack[sb + $spo] = 4;
				// ###
			case 108:
				// ##OP-ICONST_5 0 1

				stack[sb + $spo] = 5;
				// ###
			case 109:
				// ##OP-IDIV -2 1

				if (stack[sb + $spo - 1] === 0) {
					thread.localToFrame($ip, $ip + 1);
					throw new FyException(FyConst.FY_EXCEPTION_ARITHMETIC,
							"Devided by zero!");
				}
				stack[sb + $spo - 2] = (stack[sb + $spo - 2] / stack[sb + $spo
						- 1]);
				// ###
			case 110:
				// ##OP-IF_ICMPEQ -2 0

				if (stack[sb + $spo - 2] === stack[sb + $spo - 1]) {
					ip = $1;
					break __fy_inner;
				}
				// ###
			case 111:
				// ##OP-IF_ACMPEQ -2 0

				if (stack[sb + $spo - 2] === stack[sb + $spo - 1]) {
					ip = $1;
					break __fy_inner;
				}
				// ###
			case 112:
				// ##OP-IF_ICMPNE -2 0
				if (stack[sb + $spo - 2] !== stack[sb + $spo - 1]) {
					ip = $1;
					break __fy_inner;
				}
				// ###
			case 113:
				// ##OP-IF_ACMPNE -2 0
				if (stack[sb + $spo - 2] !== stack[sb + $spo - 1]) {
					ip = $1;
					break __fy_inner;
				}
				// ###
			case 114:
				// ##OP-IF_ICMPLT -2 0
				if (stack[sb + $spo - 2] < stack[sb + $spo - 1]) {
					ip = $1;
					break __fy_inner;
				}
				// ###
			case 115:
				// ##OP-IF_ICMPLE -2 0
				if (stack[sb + $spo - 2] <= stack[sb + $spo - 1]) {
					ip = $1;
					break __fy_inner;
				}
				// ###
			case 116:
				// ##OP-IF_ICMPGT -2 0

				if (stack[sb + $spo - 2] > stack[sb + $spo - 1]) {
					ip = $1;
					break __fy_inner;
				}
				// ###
			case 117:
				// ##OP-IF_ICMPGE -2 0

				if (stack[sb + $spo - 2] >= stack[sb + $spo - 1]) {
					ip = $1;
					break __fy_inner;
				}
				// ###
			case 118:
				// ##OP-IFEQ -1 0

				if (stack[sb + $spo - 1] === 0) {
					ip = $1;
					break __fy_inner;
				}
				// ###
			case 119:
				// ##OP-IFNULL -1 0

				if (stack[sb + $spo - 1] === 0) {
					ip = $1;
					break __fy_inner;
				}
				// ###
			case 120:
				// ##OP-IFNE -1 0

				if (stack[sb + $spo - 1] !== 0) {
					ip = $1;
					break __fy_inner;
				}
				// ###
			case 121:
				// ##OP-IFNONNULL -1 0

				if (stack[sb + $spo - 1] !== 0) {
					ip = $1;
					break __fy_inner;
				}
				// ###
			case 122:
				// ##OP-IFLT -1 0

				if (stack[sb + $spo - 1] < 0) {
					ip = $1;
					break __fy_inner;
				}
				// ###
			case 123:
				// ##OP-IFLE -1 0

				if (stack[sb + $spo - 1] <= 0) {
					ip = $1;
					break __fy_inner;
				}
				// ###
			case 124:
				// ##OP-IFGT -1 0

				if (stack[sb + $spo - 1] > 0) {
					ip = $1;
					break __fy_inner;
				}
				// ###
			case 125:
				// ##OP-IFGE -1 0

				if (stack[sb + $spo - 1] >= 0) {
					ip = $1;
					break __fy_inner;
				}
				// ###
			case 126:
				// ##OP-IINC 0 0

				stack[sb + $1] += $2;
				// ###
			case 127:
				// ##OP-IMUL -2 1

				stack[sb + $spo - 2] = Math.imul(stack[sb + $spo - 2], stack[sb
						+ $spo - 1]);
				// ###
			case 128:
				// ##OP-INEG -1 1

				stack[sb + $spo - 1] *= -1;
				// ###
			case 129:
				// ##OP-INSTANCEOF -1 1

				if (stack[sb + $spo - 1] !== 0) {
					thread.localToFrame($ip, $ip + 1);
					stack[sb + $spo - 1] = context.classLoader.canCast(heap
							.getObjectClass(stack[sb + $spo - 1]), context
							.lookupClassFromConstant(global, constants[$1]));
				}
				// ###
			case 130:
				// ##OP-INVOKESPECIAL X-INVOKESPECIAL 0
				// X-INVOKESPECIAL
				throw new FyException(undefined, "op should be AOTed");
				// ###
			case 131:
				// ##OP-INVOKESTATIC X-INVOKESTATIC 0
				// X-INVOKESTATIC
				throw new FyException(undefined, "op should be AOTed");
				// ###
			case 132:
				// ##OP-INVOKEINTERFACE|INVOKEVIRTUAL X-INVOKEVIRTUAL 0
				// X-INVOKEVIRTUAL
				throw new FyException(undefined, "op should be AOTed");
				// ###
			case 134:
				// ##OP-IOR -2 1

				stack[sb + $spo - 2] |= stack[sb + $spo - 1];
				// ###
			case 135:
				// ##OP-IREM -2 1

				if (stack[sb + $spo - 1] === 0) {
					thread.localToFrame($ip, $ip + 1);
					throw new FyException(FyConst.FY_EXCEPTION_ARITHMETIC,
							"Devided by zero");
				}
				stack[sb + $spo - 2] %= stack[sb + $spo - 1];
				// ###
			case 136:
				// ##OP-ISHL -2 1

				stack[sb + $spo - 2] <<= stack[sb + $spo - 1];
				// ###
			case 137:
				// ##OP-ISHR -2 1

				stack[sb + $spo - 2] >>= stack[sb + $spo - 1];
				// ###
			case 138:
				// ##OP-ISUB -2 1

				stack[sb + $spo - 2] -= stack[sb + $spo - 1];
				// ###
			case 139:
				// ##OP-IUSHR -2 1

				stack[sb + $spo - 2] >>>= stack[sb + $spo - 1];
				// ###
			case 140:
				// ##OP-IXOR -2 1

				stack[sb + $spo - 2] ^= stack[sb + $spo - 1];
				// ###
			case 143:
				// ##OP-L2D -2 2

				FyPortable.doubleToIeee64(longOps.longToNumber(sb + $spo - 2),
						stack, sb + $spo - 2);
				// ###
			case 144:
				// ##OP-L2F -2 1

				floatStack[sb + $spo - 2] = longOps.longToNumber(sb + $spo - 2);
				// ###
			case 145:
				// ##OP-L2I -2 1

				stack[sb + $spo - 2] = stack[sb + $spo - 1];
				// ###
			case 146:
				// ##OP-LADD -4 2

				longOps.add(sb + $spo - 4, sb + $spo - 2);
				// ###
			case 147:
				// ##OP-LAND -4 2

				stack[sb + $spo - 4] &= stack[sb + $spo - 2];
				stack[sb + $spo - 3] &= stack[sb + $spo - 1];
				// ###
			case 148:
				// ##OP-LCMP -4 1

				longOps.cmp(sb + $spo - 4, sb + $spo - 2);
				// since longOps.cmp returns -1/0/1 in long array,
				// simple
				// convert it to int
				stack[sb + $spo - 4] = stack[sb + $spo - 3];
				// ###
			case 149:
				// ##OP-LCONST_0 0 2

				stack[sb + $spo] = 0;
				stack[sb + $spo + 1] = 0;
				// ###
			case 150:
				// ##OP-LCONST_1 0 2

				stack[sb + $spo] = 0;
				stack[sb + $spo + 1] = 1;
				// ###
			case 151:
				// ##OP-LDC 0 X-LDC
				throw new FyException(undefined,
						"LDC should be compiled in aot");
				// ###
			case 152:
				// ##OP-LDIV -4 2

				if (stack[sb + $spo - 2] === 0 && stack[sb + $spo - 1] === 0) {
					thread.localToFrame($ip, $ip + 1);
					throw new FyException(FyConst.FY_EXCEPTION_ARITHMETIC,
							"Devided by zero!");
				}
				longOps.div(sb + $spo - 4, sb + $spo - 2);
				// ###
			case 153:
				// ##OP-DLOAD|LLOAD 0 2

				"#!";
				console.log((sb + $spo) + "<==" + (sb + $1) + " "
						+ [ stack[sb + $1], stack[sb + $1 + 1] ]);
				"!#";
				stack[sb + $spo] = stack[sb + $1];
				stack[sb + $spo + 1] = stack[sb + $1 + 1];
				// ###
			case 155:
				// ##OP-LMUL -4 2

				longOps.mul(sb + $spo - 4, sb + $spo - 2);
				// ###
			case 156:
				// ##OP-LNEG -2 2

				longOps.neg(sb + $spo - 2);
				// ###
			case 157:
				// ##OP-LOOKUPSWITCH -1 0

				var lookupSwitchTarget = _m_.lookupSwitchTargets[$1];

				tmpInt1 = ((lookupSwitchTarget.targets[stack[sb + $spo - 1]] + 1) | 0) - 1;
				if (tmpInt1 === -1) {
					ip = lookupSwitchTarget.dflt;
					break __fy_inner;
				} else {
					ip = tmpInt1;
					break __fy_inner;
				}
				// ###
			case 158:
				// ##OP-LOR -4 2

				stack[sb + $spo - 4] |= stack[sb + $spo - 2];
				stack[sb + $spo - 3] |= stack[sb + $spo - 1];
				// ###
			case 159:
				// ##OP-LREM -4 2

				longOps.rem(sb + $spo - 4, sb + $spo - 2);
				// ###
			case 160:
				// ##OP-LSHL -3 2

				longOps.shl(sb + $spo - 3, stack[sb + $spo - 1]);
				// ###
			case 161:
				// ##OP-LSHR -3 2

				longOps.shr(sb + $spo - 3, stack[sb + $spo - 1]);
				// ###
			case 162:
				// ##OP-LUSHR -3 2

				longOps.ushr(sb + $spo - 3, stack[sb + $spo - 1]);
				// ###
			case 163:
				// ##OP-DSTORE|LSTORE -2 0

				stack[sb + $1] = stack[sb + $spo - 2];
				stack[sb + $1 + 1] = stack[sb + $spo - 1];
				// ###
			case 164:
				// ##OP-LSUB -4 2

				longOps.sub(sb + $spo - 4, sb + $spo - 2);
				// ###
			case 165:
				// ##OP-LXOR -4 2

				stack[sb + $spo - 4] ^= stack[sb + $spo - 2];
				stack[sb + $spo - 3] ^= stack[sb + $spo - 1];
				// ###
			case 166:
				// ##OP-MONITORENTER -1 0

				thread.monitorEnter(stack[sb + $spo - 1]);
				if (thread.yield) {
					// Local to frame
					thread.localToFrame($ip, $ip + 1);
					return 0;
				}
				// ###
			case 167:
				// ##OP-MONITOREXIT -1 0

				thread.monitorExit(stack[sb + $spo - 1]);
				if (thread.yield) {
					// Local to frame
					thread.localToFrame($ip, $ip + 1);
					return 0;
				}
				// ###
			case 168:
				// ##OP-MULTIANEWARRAY X-MULTIANEWARRAY 1

				thread.localToFrame($ip, $ip + 1);
				stack[sb + $spo - $2] = heap.multiNewArray(context
						.lookupClassFromConstant(global, constants[$1]), $2,
						stack, sb + $spo - $2);
				// ###
			case 169:
				// ##OP-NEW 0 1

				thread.localToFrame($ip, $ip + 1);
				tmpClass = context.lookupClassFromConstant(global,
						constants[$1]);
				if (tmpClass.accessFlags
						& (FyConst.FY_ACC_INTERFACE | FyConst.FY_ACC_ABSTRACT)) {
					throw new FyException(FyConst.FY_EXCEPTION_ABSTRACT,
							tmpClass.name);
				}

				// !CLINIT
				clinitClass = thread.clinit(tmpClass);
				if (clinitClass !== undefined) {
					// invoke clinit
					if (clinitClass.clinitThreadId == 0) {
						// no thread is running it, so let this run
						clinitClass.clinitThreadId = thread.threadId;
						// Local to frame
						thread.localToFrame($ip, $ip);
						thread.pushFrame(clinitClass.clinit, sb + $spo);
						return 0;
					} else {
						// wait for other thread clinit
						thread.localToFrame($ip, $ip);
						return 0;
					}
				}

				stack[sb + $spo] = heap.allocate(tmpClass);
				// ###
			case 170:
				// ##OP-NEWARRAY -1 1
				thread.localToFrame($ip, $ip + 1);
				switch ($1) {
				case 4:
					stack[sb + $spo - 1] = heap.allocateArray(context
							.lookupClass("[Z"), stack[sb + $spo - 1]);
					break;
				case 5:
					stack[sb + $spo - 1] = heap.allocateArray(context
							.lookupClass("[C"), stack[sb + $spo - 1]);
					break;
				case 6:
					stack[sb + $spo - 1] = heap.allocateArray(context
							.lookupClass("[F"), stack[sb + $spo - 1]);
					break;
				case 7:
					stack[sb + $spo - 1] = heap.allocateArray(context
							.lookupClass("[D"), stack[sb + $spo - 1]);
					break;
				case 8:
					stack[sb + $spo - 1] = heap.allocateArray(context
							.lookupClass("[B"), stack[sb + $spo - 1]);
					break;
				case 9:
					stack[sb + $spo - 1] = heap.allocateArray(context
							.lookupClass("[S"), stack[sb + $spo - 1]);
					break;
				case 10:
					stack[sb + $spo - 1] = heap.allocateArray(context
							.lookupClass("[I"), stack[sb + $spo - 1]);
					break;
				case 11:
					stack[sb + $spo - 1] = heap.allocateArray(context
							.lookupClass("[J"), stack[sb + $spo - 1]);
					break;
				default:
					throw new FyException(FyConst.FY_EXCEPTION_VM,
							"Unknown array type in NEWARRAY: $1");
				}
				// ###
			case 171:
				// ##OP-NOP 0 0
				// ###
			case 172:
				// ##OP-POP -1 0
				// ###
			case 173:
				// ##OP-POP2 -2 0
				// ###
			case 174:
				// ##OP-PUTFIELD X-PUTFIELD 0
				// X-PUTFIELD
				throw new FyException(undefined, "Should be optimized by aot");
				// ###
			case 175:
				// ##OP-PUTSTATIC X-PUTSTATIC 0
				// X-PUTSTATIC
				throw new FyException(undefined, "Should be optimized by aot");
				// ###
			case 177:
				// ##OP-RETURN 0 0

				if (_m_.accessFlags & FyConst.FY_ACC_SYNCHRONIZED) {
					thread.localToFrame($ip, $ip + 1);
					if (_m_.accessFlags & FyConst.FY_ACC_STATIC) {
						thread.monitorExit(context.getClassObjectHandle(clazz));
					} else {
						thread.monitorExit(stack[sb]);
					}
				}
				if (_m_.accessFlags & FyConst.FY_ACC_CLINIT) {
					clazz.clinitThreadId = -1;
				}
				thread.popFrame(0);
				thread.forwardCurrentLIp();
				return ops;
				// ###
			case 178:
				// ##OP-SALOAD -2 1

				thread.localToFrame($ip, $ip + 1);
				heap.getArrayRaw16ToHeap(stack[sb + $spo - 2], stack[sb + $spo
						- 1], sb + $spo - 2);
				// ###
			case 179:
				// ##OP-SASTORE -3 0

				thread.localToFrame($ip, $ip + 1);
				heap.putArrayRaw16FromHeap(stack[sb + $spo - 3], stack[sb
						+ $spo - 2], sb + $spo - 1);
				// ###
			case 180:
				// ##OP-SIPUSH 0 1

				stack[sb + $spo] = $1;
				// ###
			case 181:
				// ##OP-SWAP -2 2

				tmpInt1 = stack[sb + $spo - 1];
				stack[sb + $spo - 1] = stack[sb + $spo - 2];
				stack[sb + $spo - 2] = tmpInt1;
				// ###
			case 182:
				// ##OP-TABLESWITCH -1 0

				/**
				 * @returns {FyTableSwitchTarget}
				 */
				var tableSwitchTarget = _m_.tableSwitchTargets[$1];
				if (stack[sb + $spo - 1] < tableSwitchTarget.min
						|| stack[sb + $spo - 1] > tableSwitchTarget.max) {
					ip = tableSwitchTarget.dflt;
					break __fy_inner;
				} else {
					ip = tableSwitchTarget.targets[stack[sb + $spo - 1]
							- tableSwitchTarget.min];
					break __fy_inner;
				}
				// ###
				break;
			// ##MACRO-TAIL
			default:
				thread.localToFrame(lip, ip);
				throw new FyException(undefined, "IP out of sync at "
						+ _m_.uniqueName + "." + ip);
			} // /__fy_inner

		} // /__fy_outer
		// Local to frame
		throw new FyException(undefined, "illegal code position");
		// ###
	};
})();
