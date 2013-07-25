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
 * <li>$u1 $u2 $s2 etc. will generate code as numbers from next n bytes from
 * code (u=unsigned s=signed)</li>
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
 * @param {FyMessage}
 *            message object
 * @param {Number}
 *            ops instructions left to run
 */
// ##MACRO-HEADER
function(thread, message, ops) {
	/**
	 * @returns {FyClass}
	 */
	var clazz = this.owner;
	/**
	 * @returns {FyHeap}
	 */
	var heap = context.heap;
	/**
	 * @returns {FyContext}
	 */
	var context = thread.context;
	var constants = clazz.constants;
	var stack = thread.stack;
	var framePos = thread.getCurrentFramePos() | 0;
	var ip = stack[framePos + FyThread.frame_ip] | 0;
	var lip = stack[framePos + FyThread.frame_lip] | 0;
	var sp = thread.sp | 0;
	var sb = stack[framePos + FyThread.frame_sb] | 0;

	/**
	 * @returns {FyField}
	 */
	var tmpField;

	/**
	 * @returns {FyClass}
	 */
	var tmpClass;

	/**
	 * @returns {FyMethod}
	 */
	var tmpMethod;

	var tmpInt1 = 0 | 0;

	// /*
	var $1 = 0 | 0;
	var $2 = 0 | 0;
	var $ip = 0 | 0;
	// */
	__fy_outer: while (true) {
		try {
			__fy_inner: switch (ip) {
			// ###
			case 0:
				// ##MACRO-OPS
				if (ops < 0) {
					lip = -1;
					ip = $ip;
					break __fy_outer;
				}
				// ###
				// ##OP-AALOAD -2 1
				lip = $ip;
				ops--;
				sp--;
				stack[sp - 1] = heap.getArrayInt(stack[sp], stack[sp - 1]);
				// ###
			case 1:
				// ##OP-FALOAD|IALOAD -2 1
				lip = $ip;
				ops--;
				sp--;
				stack[sp - 1] = heap.getArrayInt(stack[sp], stack[sp - 1]);
				// ###
			case 2:
				// ##OP-AASTORE -3 0
				lip = $ip;
				ops--;
				sp -= 3;
				// 2[1]=0
				if (stack[sp] !== 0
						|| !context.classLoader.canCast(heap
								.getClassFromHandle(stack[0]), heap
								.getClassFromHandle(stack[2]).contentClass)) {
					throw new FyException(FyConst.FY_EXCEPTION_STORE,
							"Can't store "
									+ heap.getClassFromHandle(stack[0]).name
									+ " to "
									+ heap.getClassFromHandle(stack[2]).name);
				}
				heap.putArrayInt(stack[2], stack[1], stack[0]);
				// ###
			case 3:
				// ##OP-FASTORE|IASTORE -3 0
				lip = $ip;
				ops--;
				sp -= 3;
				heap.putArrayInt(stack[2], stack[1], stack[0]);
				// ###
			case 4:
				// ##OP-ACONST_NULL 0 1
				ops--;
				stack[sp] = 0;
				sp++;
				// ###
			case 5:
				// ##OP-ILOAD|FLOAD|ALOAD 0 1
				ops--;
				stack[sp] = stack[sb + $1];
				sp++;
				// ###
			case 17:
				// ##OP-ANEWARRAY -1 1
				lip = $ip;
				ops--;
				if (stack[sp - 1] < 0) {
					throw new FyException(FyConst.FY_EXCEPTION_AIOOB, ""
							+ stack[sp - 1]);
				}
				stack[sp - 1] = heap.allocateArray(context
						.lookupArrayClass(context
								.lookupClassFromConstant(constants[$1])),
						stack[sp - 1]);
				// ###
			case 20:
				// ##OP-IRETURN|FRETURN|ARETURN -1 0
				lip = $ip;
				ops--;
				if (this.accessFlags & FyConst.FY_ACC_SYNCHRONIZED) {
					if (this.accessFlags & FyConst.FY_ACC_STATIC) {
						thread.monitorExit(context.getClassObjectHandle(clazz));
					} else {
						thread.monitorExit(stack[sb]);
					}
				}
				stack[sb] = stack[sp - 1];
				thread.popFrame(1);
				return ops;
				// ###
			case 22:
				// ##OP-ARRAYLENGTH -1 1
				lip = $ip;
				ops--;
				stack[sp - 1] = heap.arrayLength(stack[sp - 1]);
				// ###
			case 23:
				// ##OP-ISTORE|FSTORE|ASTORE -1 0
				ops--;
				sp--;
				stack[sb + $1] = stack[sp];
				// ###
			case 35:
				// ##OP-ATHROW -1 0
				ops--;
				sp--;
				thread.currentThrowable = stack[sp];

				lip = $ip;
				ip = -1;
				break __fy_inner;
			// ###
			case 36:
				// ##OP-BALOAD -2 1
				lip = $ip;
				ops--;
				sp--;
				stack[sp - 1] = heap.getArrayByte(stack[sp - 1], stack[sp]);
				// ###
			case 37:
				// ##OP-BASTORE -3 0
				lip = $ip;
				ops--;
				sp -= 3;
				heap.putArrayByte(stack[sp], stack[sp + 1],
						stack[sp + 2] & 0xff);
				// ###
			case 38:
				// ##OP-BIPUSH 0 1
				ops--;
				stack[sp] = $1;
				sp++;
				// ###
			case 41:
				// ##OP-CALOAD -2 1
				lip = $ip;
				ops--;
				sp--;
				stack[sp - 1] = heap.getArrayChar(stack[sp - 1], stack[sp]);
				// ###
			case 42:
				// ##OP-CASTORE -3 0
				lip = $ip;
				ops--;
				sp -= 3;
				heap.putArrayChar(stack[sp], stack[sp + 1],
						stack[sp + 2] & 0xff);
				// ###
			case 43:
				// ##OP-CHECKCAST -1 0
				lip = $ip;
				ops--;
				sp--;
				if (stack[sp] !== 0) {
					if (!context.classLoader.canCast(
							heap.getObject(stack[sp]).clazz, context
									.lookupClassFromConstant(constants[$1]))) {
						throw new FyException(
								FyConst.FY_EXCEPTION_CAST,
								"Can't case "
										+ heap.getObject(stack[sp]).clazz.name
										+ " to "
										+ context
												.lookupClassFromConstant(constants[$1]).name);
					}
				}
				// ###
			case 46:
				// ##OP-D2F -2 1
				ops--;
				sp--;
				stack[sp - 1] = FyPortable.floatToIeee32(FyPortable
						.ieee64ToDouble(stack, sp - 1));
				// ###
			case 47:
				// ##OP-D2I -2 1
				ops--;
				sp--;
				stack[sp - 1] = FyPortable.ieee64ToDouble(stack, sp - 1) >> 0;
				// ###
			case 48:
				// ##OP-D2L -2 2
				ops--;
				FyPortable.doubleToLong(FyPortable
						.ieee64ToDouble(stack, sp - 2), stack, sp - 2);
				// ###
			case 49:
				// ##OP-DADD -4 2
				ops--;
				sp -= 2;
				FyPortable.doubleToIeee64(FyPortable.ieee64ToDouble(stack,
						sp - 2)
						+ FyPortable.ieee64ToDouble(stack, sp), stack, sp - 2);
				// ###
			case 50:
				// ##OP-LALOAD|DALOAD -2 2
				lip = $ip;
				ops--;
				heap.getArrayRawLongTo(stack[sp - 2], stack[sp - 1], stack,
						sp - 2);
				// ###
			case 51:
				// ##OP-LASTORE|DASTORE -4 0
				lip = $ip;
				ops--;
				sp -= 4;
				heap.putArrayRawLongFrom(stack[sp], stack[sp + 1], stack,
						sp + 2);
				// ###
			case 52:
				// ##OP-DCMPG -4 1
				ops--;
				sp -= 3;
				stack[sp - 1] = FyPortable.dcmpg(FyPortable.ieee64ToDouble(
						stack, sp - 1), FyPortable
						.ieee64ToDouble(stack, sp + 1));
				// ###
			case 53:
				// ##OP-DCMPL -4 1
				ops--;
				sp -= 3;
				stack[sp - 1] = FyPortable.dcmpl(FyPortable.ieee64ToDouble(
						stack, sp - 1), FyPortable
						.ieee64ToDouble(stack, sp + 1));
				// ###
			case 54:
				// ##OP-DCONST_0 0 2
				ops--;
				FyPortable.doubleToIeee64(0.0, stack, sp);
				sp += 2;
				// ###
			case 55:
				// ##OP-DCONST_1 0 2
				ops--;
				FyPortable.doubleToIeee64(1.0, stack, sp);
				sp += 2;
				// ###
			case 56:
				// ##OP-DDIV -4 2
				ops--;
				sp -= 2;
				FyPortable.doubleToIeee64(FyPortable.ieee64ToDouble(stack,
						sp - 2)
						/ FyPortable.ieee64ToDouble(stack, sp), stack, sp - 2);
				// ###
			case 57:
				// ##OP-DMUL -4 2
				ops--;
				sp -= 2;
				FyPortable.doubleToIeee64(FyPortable.ieee64ToDouble(stack,
						sp - 2)
						* FyPortable.ieee64ToDouble(stack, sp), stack, sp - 2);
				// ###
			case 58:
				// ##OP-DNEG -2 2
				ops--;
				FyPortable.doubleToIeee64(-FyPortable.ieee64ToDouble(stack,
						sp - 2), stack, sp - 2);
				// ###
			case 59:
				// ##OP-DREM -4 2
				ops--;
				sp -= 2;
				FyPortable.doubleToIeee64(FyPortable.ieee64ToDouble(stack,
						sp - 2)
						% FyPortable.ieee64ToDouble(stack, sp), stack, sp - 2);
				// ###
			case 60:
				// ##OP-DRETURN|LRETURN -2 0
				lip = $ip;
				ops--;
				if (this.accessFlags & FyConst.FY_ACC_SYNCHRONIZED) {
					if (this.accessFlags & FyConst.FY_ACC_STATIC) {
						thread.monitorExit(context.getClassObjectHandle(clazz));
					} else {
						thread.monitorExit(stack[sb]);
					}
				}
				stack[sb] = stack[sp - 2];
				stack[sb + 1] = stack[sp - 1];
				thread.popFrame(2);
				return ops;
				// ###
			case 61:
				// ##OP-DSUB -4 2
				ops--;
				sp -= 2;
				FyPortable.doubleToIeee64(FyPortable.ieee64ToDouble(stack,
						sp - 2)
						- FyPortable.ieee64ToDouble(stack, sp), stack, sp - 2);
				// ###
			case 62:
				// ##OP-DUP -1 2
				ops--;
				stack[sp] = stack[sp - 1];
				sp++;
				// ###
			case 63:
				// ##OP-DUP_X1 -2 3
				ops--;
				stack[sp] = stack[sp - 1];
				stack[sp - 1] = stack[sp - 2];
				stack[sp - 2] = stack[sp];
				sp++;
				// ###
			case 64:
				// ##OP-DUP_X2 -3 4
				ops--;
				stack[sp] = stack[sp - 1];
				stack[sp - 1] = stack[sp - 2];
				stack[sp - 2] = stack[sp - 3];
				stack[sp - 3] = stack[sp];
				sp++;
				// ###
			case 65:
				// ##OP-DUP2 -2 4
				ops--;
				stack[sp + 1] = stack[sp - 1];
				stack[sp] = stack[sp - 2];
				sp += 2;
				// ###
			case 66:
				// 321 -> 21321
				// ##OP-DUP2_X1 -3 5
				ops--;
				stack[sp + 1] = stack[sp - 1];
				stack[sp] = stack[sp - 2];
				stack[sp - 1] = stack[sp - 3];
				stack[sp - 2] = stack[sp + 1];
				stack[sp - 3] = stack[sp];
				sp += 2;
				// ###
			case 67:
				// 4321 -> 214321
				// ##OP-DUP2_X2 -4 6
				ops--;
				stack[sp + 1] = stack[sp - 1];
				stack[sp] = stack[sp - 2];
				stack[sp - 1] = stack[sp - 3];
				stack[sp - 2] = stack[sp + 4];
				stack[sp - 3] = stack[sp + 1];
				stack[sp - 4] = stack[sp];
				sp += 2;
				// ###
			case 68:
				// ##OP-F2D -1 2
				ops--;
				FyPortable.doubleToIeee64(FyPortable
						.ieee32ToFloat(stack[sp - 1]), stack, sp - 1);
				sp++;
				// ###
			case 69:
				// ##OP-F2I -1 1
				ops--;
				stack[sp - 1] = FyPortable.ieee32ToFloat(stack[sp - 1]) | 0;
				// ###
			case 70:
				// ##OP-F2L -1 2
				ops--;
				FyPortable.doubleToLong(
						FyPortable.ieee32ToFloat(stack[sp - 1]), stack, sp - 1);
				sp++;
				// ###
			case 71:
				// ##OP-FADD -2 1
				ops--;
				sp--;
				stack[sp - 1] = FyPortable.floatToIeee32(FyPortable
						.ieee32ToFloat(stack[sp - 1])
						+ FyPortable.ieee32ToFloat(stack[sp]));
				// ###
			case 72:
				// ##OP-FCMPG -2 1
				ops--;
				sp--;
				stack[sp - 1] = FyPortable.dcmpg(FyPortable
						.ieee32ToFloat(stack[sp - 1]), FyPortable
						.ieee32ToFloat(stack[sp]));
				// ###
			case 73:
				// ##OP-FCMPL -2 1
				ops--;
				sp--;
				stack[sp - 1] = FyPortable.dcmpg(FyPortable
						.ieee32ToFloat(stack[sp - 1]), FyPortable
						.ieee32ToFloat(stack[sp]));
				// ###
			case 74:
				// ##OP-FCONST_0 0 1
				ops--;
				stack[sp] = FyPortable.floatToIeee32(0);
				sp++;
				// ###
			case 75:
				// ##OP-FCONST_1 0 1
				ops--;
				stack[sp] = FyPortable.floatToIeee32(1);
				sp++;
				// ###
			case 76:
				// ##OP-FCONST_2 0 1
				ops--;
				stack[sp] = FyPortable.floatToIeee32(2);
				sp++;
				// ###
			case 77:
				// ##OP-FDIV -2 1
				ops--;
				sp--;
				stack[sp - 1] = FyPortable.floatToIeee32(FyPortable
						.ieee32ToFloat(stack[sp - 1])
						/ FyPortable.ieee32ToFloat(stack[sp]));
				// ###
			case 78:
				// ##OP-FMUL -2 1
				ops--;
				sp--;
				stack[sp - 1] = FyPortable.floatToIeee32(FyPortable
						.ieee32ToFloat(stack[sp - 1])
						* FyPortable.ieee32ToFloat(stack[sp]));
				// ###
			case 79:
				// ##OP-FNEG -1 1
				ops--;
				stack[sp - 1] = FyPortable.floatToIeee32(-FyPortable
						.ieee32ToFloat(stack[sp - 1]));
				// ###
			case 80:
				// ##OP-FREM -2 1
				ops--;
				sp--;
				stack[sp - 1] = FyPortable.floatToIeee32(FyPortable
						.ieee32ToFloat(stack[sp - 1])
						% FyPortable.ieee32ToFloat(stack[sp]));
				// ###
			case 81:
				// ##OP-FSUB -2 1
				ops--;
				sp--;
				stack[sp - 1] = FyPortable.floatToIeee32(FyPortable
						.ieee32ToFloat(stack[sp - 1])
						- FyPortable.ieee32ToFloat(stack[sp]));
				// ###
			case 82:
				// ##OP-GETFIELD -1 X-GETFIELD
				lip = $ip;
				ops--;
				tmpField = context.lookupFieldVirtualFromConstant(constant[$1]);
				if (tmpField.accessFlags & FyConst.FY_ACC_STATIC) {
					throw new FyException(FyConst.FY_EXCEPTION_INCOMPAT_CHANGE,
							"Field " + tmpField.uniqueName + " is static");
				}
				switch (tmpField.descriptor.charCodeAt(0)) {
				case FyConst.D:
				case FyConst.J:
					heap.getFieldRawLongTo(stack[sp - 1], tmpField.posAbs,
							stack, sp - 1);
					sp++;
					break;
				default:
					stack[sp - 1] = heap.getFieldRaw(stack[sp - 1],
							tmpField.posAbs);
					break;
				}
				// ###
			case 83:
				// ##OP-GETSTATIC -1 X-GETSTATIC
				lip = $ip;
				ops--;
				tmpField = context.lookupFieldVirtualFromConstant(constant[$1]);

				if (!(tmpField.accessFlags & FyConst.FY_ACC_STATIC)) {
					throw new FyException(FyConst.FY_EXCEPTION_INCOMPAT_CHANGE,
							"Field " + tmpField.uniqueName + " is not static");
				}

				tmpClass = thread.clinit(tmpField.owner);
				if (tmpClass !== undefined) {
					// invoke clinit
					if (tmpClass.clinitThreadId == 0) {
						// no thread is running it, so let this run
						// Local to frame
						thread.sp = sp;
						stack[framePos + FyThread.frame_lip] = $ip;
						stack[framePos + FyThread.frame_ip] = $ip;
						thread.pushFrame(tmpClass.clinit);
						return ops;
					} else {
						// wait for other thread clinit
						ops = 0;
						ip = $ip;
						break __fy_outer;
					}
				}

				switch (tmpField.descriptor.charCodeAt(0)) {
				case FyConst.D:
				case FyConst.J:
					heap.getStaticRawLongTo(stack[sp - 1], tmpField.posAbs,
							stack, sp - 1);
					sp++;
					break;
				default:
					stack[sp - 1] = heap.getStaticRaw(stack[sp - 1],
							tmpField.posAbs);
					break;
				}
				// ###
			case 84:
				// ##OP-GOTO 0 0
				ops--;
				ip = $1;
				break __fy_inner;
			// ###
			case 85:
				// ##OP-I2B -1 1
				ops--;
				stack[sp - 1] &= 0xff;
				// ###
			case 86:
				// ##OP-I2C -1 1
				ops--;
				stack[sp - 1] &= 0xffff;
				// ###
			case 87:
				// ##OP-I2D -1 2
				ops--;
				FyPortable.doubleToIeee64(stack[sp - 1], stack, sp - 1);
				sp++;
				// ###
			case 88:
				// ##OP-I2F -1 1
				ops--;
				stack[sp - 1] = FyPortable.floatToIeee32(stack[sp - 1]);
				// ###
			case 89:
				// ##OP-I2L -1 2
				ops--;
				stack[sp] = stack[sp - 1];
				stack[sp - 1] = stack[sp] >= 0 ? (0 | 0) : (-1 | 0);
				sp++;
				// ###
			case 90:
				// ##OP-I2S -1 1
				ops--;
				stack[sp - 1] = stack[sp - 1] << 16 >> 16;
				// ###
			case 100:
				// ##OP-IADD -2 1
				ops--;
				sp--;
				stack[sp - 1] -= stack[sp];
				// ###
			case 101:
				// ##OP-IAND -2 1
				ops--;
				sp--;
				stack[sp - 1] &= stack[sp];
				// ###
			case 102:
				// ##OP-ICONST_M1 0 1
				ops--;
				stack[sp] = -1;
				sp++;
				// ###
			case 103:
				// ##OP-ICONST_0 0 1
				ops--;
				stack[sp] = 0;
				sp++;
				// ###
			case 104:
				// ##OP-ICONST_1 0 1
				ops--;
				stack[sp] = 1;
				sp++;
				// ###
			case 105:
				// ##OP-ICONST_2 0 1
				ops--;
				stack[sp] = 2;
				sp++;
				// ###
			case 106:
				// ##OP-ICONST_3 0 1
				ops--;
				stack[sp] = 3;
				sp++;
				// ###
			case 107:
				// ##OP-ICONST_4 0 1
				ops--;
				stack[sp] = 4;
				sp++;
				// ###
			case 108:
				// ##OP-ICONST_5 0 1
				ops--;
				stack[sp] = 5;
				sp++;
				// ###
			case 109:
				// ##OP-IDIV -2 1
				ops--;
				sp--;
				if (stack[sp] === 0) {
					lip = $ip;
					throw new FyException(FyConst.FY_EXCEPTION_ARITHMETIC,
							"Devided by zero!");
				}
				stack[sp - 1] = (stack[sp - 1] / stack[sp]) | 0;
				// ###
			case 110:
				// ##OP-IF_ICMPEQ -2 0
				ops--;
				sp -= 2;
				if (stack[sp] === stack[sp + 1]) {
					ip = $1;
					break __fy_inner;
				}
				// ###
			case 111:
				// ##OP-IF_ACMPEQ -2 0
				ops--;
				sp -= 2;
				if (stack[sp] === stack[sp + 1]) {
					ip = $1;
					break __fy_inner;
				}
				// ###
			case 112:
				// ##OP-IF_ICMPNE -2 0
				ops--;
				sp -= 2;
				if (stack[sp] !== stack[sp + 1]) {
					ip = $1;
					break __fy_inner;
				}
				// ###
			case 113:
				// ##OP-IF_ACMPNE -2 0
				ops--;
				sp -= 2;
				if (stack[sp] !== stack[sp + 1]) {
					ip = $1;
					break __fy_inner;
				}
				// ###
			case 114:
				// ##OP-IF_ICMPLT -2 0
				ops--;
				sp -= 2;
				if (stack[sp] < stack[sp + 1]) {
					ip = $1;
					break __fy_inner;
				}
				// ###
			case 115:
				// ##OP-IF_ICMPLE -2 0
				ops--;
				sp -= 2;
				if (stack[sp] <= stack[sp + 1]) {
					ip = $1;
					break __fy_inner;
				}
				// ###
			case 116:
				// ##OP-IF_ICMPGT -2 0
				ops--;
				sp -= 2;
				if (stack[sp] > stack[sp + 1]) {
					ip = $1;
					break __fy_inner;
				}
				// ###
			case 117:
				// ##OP-IF_ICMPGE -2 0
				ops--;
				sp -= 2;
				if (stack[sp] >= stack[sp + 1]) {
					ip = $1;
					break __fy_inner;
				}
				// ###
			case 118:
				// ##OP-IFEQ -1 0
				ops--;
				sp--;
				if (stack[sp] === 0) {
					ip = $1;
					break __fy_inner;
				}
				// ###
			case 119:
				// ##OP-IFNULL -1 0
				ops--;
				sp--;
				if (stack[sp] === 0) {
					ip = $1;
					break __fy_inner;
				}
				// ###
			case 120:
				// ##OP-IFNE -1 0
				ops--;
				sp--;
				if (stack[sp] !== 0) {
					ip = $1;
					break __fy_inner;
				}
				// ###
			case 121:
				// ##OP-IFNONNULL -1 0
				ops--;
				sp--;
				if (stack[sp] !== 0) {
					ip = $1;
					break __fy_inner;
				}
			case 122:
				// ##OP-IFLT -1 0
				ops--;
				sp--;
				if (stack[sp] < 0) {
					ip = $1;
					break __fy_inner;
				}
				// ###
			case 123:
				// ##OP-IFLE -1 0
				ops--;
				sp--;
				if (stack[sp] <= 0) {
					ip = $1;
					break __fy_inner;
				}
				// ###
			case 124:
				// ##OP-IFGT -1 0
				ops--;
				sp--;
				if (stack[sp] > 0) {
					ip = $1;
					break __fy_inner;
				}
				// ###
			case 125:
				// ##OP-IFGE -1 0
				ops--;
				sp--;
				if (stack[sp] >= 0) {
					ip = $1;
					break __fy_inner;
				}
				// ###
			case 126:
				// ##OP-IINC 0 0
				ops--;
				stack[sb + $1] += $2;
				// ###
			case 127:
				// ##OP-IMUL -2 1
				ops--;
				sp -= 1;
				stack[sp - 1] *= stack[sp];
				// ###
			case 128:
				// ##OP-INEG -1 1
				ops--;
				stack[sp - 1] *= -1;
				// ###
			case 129:
				// ##OP-INSTANCEOF -1 1
				lip = $ip;
				ops--;
				if (stack[sp - 1] !== 0) {
					stack[sp - 1] = context.classLoader.canCast(heap
							.getObject(stack[sp - 1]).clazz, context
							.lookupClassFromConstant(constants[$1]));
				}
				// ###
			case 130:
				// ##OP-INVOKESPECIAL X-INVOKESPECIAL 0
				lip = $ip;
				ops--;
				tmpMethod = context
						.lookupMethodVirtualFromConstant(constants[$1]);

				sp -= tmpMethod.paramStackUsage + 1;

				tmpClass = tmpMethod.owner;
				if ((clazz.accessFlags & FyConst.FY_ACC_SUPER)
						&& context.classLoader.isSuperClassOf(tmpClass, clazz)
						&& tmpMethod.name === FyConst.FY_METHOD_INIT) {
					tmpMethod = context.lookupMethodVirtualByMethod(
							clazz.superClass, tmpMethod);
				}
				if (tmpMethod === undefined) {
					throw new FyException(FyConst.FY_EXCEPTION_ABSTRACT, "");
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

				// Local to frame
				thread.sp = sp;
				stack[framePos + FyThread.frame_lip] = $ip;
				stack[framePos + FyThread.frame_ip] = $ip + 1;
				thread.pushMethod(tmpMethod);
				return ops;
				// ###
			case 131:
				// ##OP-INVOKESTATIC X-INVOKESTATIC 0
				lip = $ip;
				ops--;
				tmpMethod = context
						.lookupMethodVirtualFromConstant(constants[$1]);

				sp -= tmpMethod.paramStackUsage;

				if (!(tmpMethod.accessFlags & FyConst.FY_ACC_STATIC)) {
					throw new FyException(FyConst.FY_EXCEPTION_INCOMPAT_CHANGE,
							tmpMethod.uniqueName + " is not static");
				}
				tmpClass = thread.clinit(tmpMethod.owner);
				if (tmpClass !== undefined) {
					// invoke clinit
					if (tmpClass.clinitThreadId == 0) {
						// no thread is running it, so let this run
						// Local to frame
						thread.sp = sp;
						stack[framePos + FyThread.frame_lip] = $ip;
						stack[framePos + FyThread.frame_ip] = $ip;
						thread.pushFrame(tmpClass.clinit);
						return ops;
					} else {
						// wait for other thread clinit
						ops = 0;
						ip = $ip;
						break __fy_outer;
					}
				}

				// Local to frame
				thread.sp = sp;
				stack[framePos + FyThread.frame_lip] = $ip;
				stack[framePos + FyThread.frame_ip] = $ip + 1;
				thread.pushMethod(tmpMethod);
				return ops;
				// ###
			case 132:
				// ##OP-INVOKEINTERFACE|INVOKEVIRTUAL X-INVOKEVIRTUAL 0
				lip = $ip;
				ops--;
				tmpMethod = context
						.lookupMethodVirtualFromConstant(constants[$1]);

				sp -= tmpMethod.paramStackUsage + 1;

				if (!(tmpMethod.accessFlags & FyConst.FY_ACC_STATIC)) {
					throw new FyException(FyConst.FY_EXCEPTION_INCOMPAT_CHANGE,
							tmpMethod.uniqueName + " is static");
				}

				if (stack[sp] === 0) {
					// this = null!!!
					throw new FyException(FyConst.FY_EXCEPTION_NPT,
							"FATAL ERROR HERE!!");
				}
				if (!(tmpMethod.accessFlags & FyConst.FY_ACC_FINAL)) {
					// Virtual lookup
					tmpClass = heap.getObject(stack[sp]).clazz;
					tmpMethod = context.lookupMethodVirtualByMethod(clazz,
							tmpMethod);
				}

				// Local to frame
				thread.sp = sp;
				stack[framePos + FyThread.frame_lip] = $ip;
				stack[framePos + FyThread.frame_ip] = $ip + 1;
				thread.pushMethod(tmpMethod);
				return ops;
				// ###
			case 134:
				// ##OP-IOR -2 1
				ops--;
				sp--;
				stack[sp - 1] |= stack[sp];
				// ###
			case 135:
				// ##OP-IREM -2 1
				lip = $ip;
				ops--;
				sp--;
				if (stack[sp] === 0) {
					throw new FyException(FyConst.FY_EXCEPTION_ARITHMETIC,
							"Devided by zero");
				}
				stack[sp - 1] %= stack[sp];
				// ###
			case 136:
				// ##OP-ISHL -2 1
				ops--;
				sp--;
				stack[sp - 1] <<= stack[sp];
				// ###
			case 137:
				// ##OP-ISHR -2 1
				ops--;
				sp--;
				stack[sp - 1] >>= stack[sp];
				// ###
			case 138:
				// ##OP-ISUB -2 1
				ops--;
				sp--;
				stack[sp - 1] -= stack[sp];
				// ###
			case 139:
				// ##OP-IUSHR -2 1
				ops--;
				sp--;
				stack[sp - 1] >>>= stack[sp];
				// ###
			case 140:
				// ##OP-IXOR -2 1
				ops--;
				sp--;
				stack[sp - 1] >>>= stack[sp];
				// ###
			case 143:
				// ##OP-L2D -2 2
				ops--;
				FyPortable.doubleToIeee64(stack[sp - 2] * 4294967296.0
						+ stack[sp - 1], stack, sp - 2);
				// ###
			case 144:
				// ##OP-L2F -2 1
				ops--;
				sp--;
				stack[sp - 1] = FyPortable.floatToIeee32(stack[sp - 2]
						* 4294967296.0 + stack[sp - 1]);
				// ###
			case 145:
				// ##OP-L2I -2 1
				ops--;
				sp--;
				stack[sp - 1] = stack[sp];
				// ###
			case 146:
				// ##OP-LADD -4 2
				ops--;
				sp -= 2;
				FyPortable.ladd(stack, sp - 2, stack, sp, stack, sp - 2);
				// ###
			case 147:
				// ##OP-LAND -4 2
				ops--;
				sp -= 2;
				stack[sp - 2] &= stack[sp];
				stack[sp - 1] &= stack[sp + 1];
				// ###
			case 148:
				// ##OP-LCMP -4 1
				ops--;
				sp -= 3;
				if (stack[sp - 1] !== stack[sp + 1]) {
					// 高位相同，比较低位
					if (stack[sp] === stack[sp + 2]) {
						stack[sp - 1] = 0;
					} else {
						stack[sp - 1] = (stack[sp] > stack[sp + 2] ? 1 : -1)
								* (stack[sp - 1] >= 0 ? 1 : -1);
					}
				} else {
					// 直接比较高位
					stack[sp - 1] = stack[sp - 1] > stack[sp + 1] ? 1 : -1;
				}
				// ###
			case 149:
				// ##OP-LCONST_0 0 2
				ops--;
				stack[sp] = 0;
				stack[sp + 1] = 0;
				sp += 2;
				// ###
			case 150:
				// ##OP-LCONST_1 0 2
				ops--;
				stack[sp] = 0;
				stack[sp + 1] = 1;
				sp += 2;
				// ###
			case 151:
				// ##OP-LDC 0 X-LDC
				ops--;
				switch ($2) {
				case 0:
					// int/float
					stack[sp] = constants[$1].value;
					sp++;
					break;
				case 1:
					stack[sp] = constants[$1].value[0];
					stack[sp + 1] = constants[$1].value[1];
					sp += 2;
					break;
				case 2:
					lip = $ip;
					stack[sp] = heap.literalWithConstant(constants[$1]);
					sp++;
					break;
				case 3:
					lip = $ip;
					stack[sp] = context.getClassObjectHandle(context
							.lookupClassFromConstant(constants[$1]));
					sp++;
					break;
				}
				// ###
			case 152:
				// ##OP-LDIV -4 2
				// TODO
				// ###
			case 153:
				// ##OP-DLOAD|LLOAD 0 2
				ops--;
				stack[sp] = stack[sb + $1];
				stack[sp + 1] = stack[sb + $1 + 1];
				sp += 2;
				// ###
			case 155:
				// ##OP-LMUL -4 2
				// TODO
				// ###
			case 156:
				// ##OP-LNEG -2 2
				// TODO
				// ###
			case 157:
				// ##OP-LOOKUPSWITCH -1 0
				// TODO
				// ###
			case 158:
				// ##OP-LOR -4 2
				ops--;
				sp -= 2;
				stack[sp - 2] |= stack[sp];
				stack[sp - 1] |= stack[sp + 1];
				// ###
			case 159:
				// ##OP-LREM -4 2
				// TODO
				// ###
			case 160:
				// ##OP-LSHL -4 2
				// TODO
				// ###
			case 161:
				// ##OP-LSHR -4 2
				// TODO
				// ###
			case 162:
				// ##OP=LUSHR -4 2
				// TODO
				// ###
			case 163:
				// ##OP-DSTORE|OP-LSTORE -2 0
				ops--;
				sp -= 2;
				stack[sb + $1] = stack[sp];
				stack[sb + $1 + 1] = stack[sp + 1];
				// ###
			case 164:
				// ##OP-LSUB -4 2
				// TODO
				// ###
			case 165:
				// ##OP-LXOR -4 2
				ops--;
				sp -= 2;
				stack[sp - 2] ^= stack[sp];
				stack[sp - 1] ^= stack[sp + 1];
				// ###
			case 166:
				// ##OP-MONITORENTER -1 0
				// TODO
				// ###
			case 167:
				// ##OP-MONITOREXIT -1 0
				ops--;
				sp--;
				thread.monitorExit(stack[sp]);
				// ###
			case 168:
				// ##OP-MULTIANEWARRAY X-MULTIANEWARRAY
				// TODO
				// ###
			case 169:
				// ##OP-NEW 0 1
				// TODO
				// ###
			case 170:
				// ##OP-NEWARRAY 0 1
				// TODO
				// ###
			case 171:
				// ##OP-NOP
				ops--;
				// ###
			case 172:
				// ##OP-POP
				ops--;
				sp--;
				// ###
			case 173:
				// ##OP-POP2
				ops--;
				sp--;
				sp--;
				// ###
			case 174:
				// ##OP-PUTFIELD
				// TODO
				// ###
			case 175:
				// ##OP-PUTSTATIC
				// TODO
				// ###
			case 177:
				// ##OP-RETURN 0 0
				lip = $ip;
				ops--;
				if (this.accessFlags & FyConst.FY_ACC_SYNCHRONIZED) {
					if (this.accessFlags & FyConst.FY_ACC_STATIC) {
						thread.monitorExit(context.getClassObjectHandle(clazz));
					} else {
						thread.monitorExit(stack[sb]);
					}
				}
				if (this.accessFlags & FyConst.FY_ACC_CLINIT) {
					clazz.clinitThreadId = -1;
				}
				thread.popFrame();
				break __fy_outer;
			// ###
			case 178:
				// ##OP-SALOAD -2 1
				lip = $ip;
				ops--;
				sp--;
				stack[sp - 1] = heap.getArrayShort(stack[sp - 1], stack[sp]);
				// ###
			case 179:
				// ##OP-SASTORE -3 0
				lip = $ip;
				ops--;
				sp -= 3;
				heap.putArrayShort(stack[sp], stack[sp + 1], stack[sp + 2]);
				// ###
			case 180:
				// ##OP-SIPUSH 0 1
				ops--;
				stack[sp] = $1;
				sp++;
				// ###
			case 181:
				// ##OP-SWAP -2 2
				ops--;
				tmpInt1 = stack[sp - 1];
				stack[sp - 1] = stack[sp - 2];
				stack[sp - 2] = tmpInt1;
				// ###
			case 182:
				// ##OP-TABLESWITCH -1 0
				// TODO
				// ###
				break;
			// ##MACRO-TAIL
			default:
				throw new FyException(undefined, "IP out of sync at "
						+ this.uniqueName + "." + ip);
			}
		} catch (e) {

			if (e instanceof FyException) {

			}
		}
	}
}
// ###
;