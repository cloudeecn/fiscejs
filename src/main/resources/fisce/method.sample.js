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
function(context, thread, message, ops) {
	var heap = context.heap;
	var constants = clazz.constants;
	var stack = thread.stack;
	var framePos = thread.getCurrentFramePos();
	var pc = stack[framePos + FyThread.frame_pc];
	var sp = thread.sp;
	var sb = stack[framePos + FyThread.frame_sb];

	// /*
	var $1 = undefined;
	var $2 = undefined;
	function $checksp(movement) {

	}
	// */
	__fy_outer: while (true) {
		try {
			__fy_inner: switch (pc) {
			// ###
			case 0:
				// ##OP-AALOAD 1 -2A
				sp--;
				stack[sp - 1] = heap.getArrayInt(stack[sp], stack[sp - 1]);
				// ###
				// ##MACRO-OPS
				if (ops < 0) {
					break __fy_outer;
				}
				// ###
			case 1:
				// ##OP-FALOAD|IALOAD 1 -2I
				sp--;
				stack[sp - 1] = heap.getArrayInt(stack[sp], stack[sp - 1]);
				// ###
			case 2:
				// ##OP-AASTORE 1 -3
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
				// ##OP-FASTORE|IASTORE 1 -3
				sp -= 3;
				heap.putArrayInt(stack[2], stack[1], stack[0]);
				// ###
			case 4:
				// ##OP-ACONST_NULL 1 1A
				stack[sp] = 0;
				sp++;
				// ###
			case 5:
				// ##OP-ILOAD|FLOAD 2 1I
				stack[sp] = stack[sb + $u1[1]];
				sp++;
				// ###
			case 7:
				// ##OP-ALOAD 2 1A
				stack[sp] = stack[sb + $u1[1]];
				sp++;
				// ###
			case 9:
				// ##OP-ILOAD_0|FLOAD_0 1 1I
				stack[sp] = stack[sb + 0];
				sp++;
				// ###
			case 10:
				// ##OP-ALOAD_0 1 1A
				stack[sp] = stack[sb + 0];
				sp++;
				// ###
			case 11:
				// ##OP-ILOAD_1|FLOAD_1 1 1I
				stack[sp] = stack[sb + 1];
				sp++;
				// ###
			case 12:
				// ##OP-ALOAD_1 1 1A
				stack[sp] = stack[sb + 1];
				sp++;
				// ###
			case 13:
				// ##OP-ILOAD_2|FLOAD_2 1 1I
				stack[sp] = stack[sb + 2];
				sp++;
				// ###
			case 14:
				// ##OP-ALOAD_2 1 1A
				stack[sp] = stack[sb + 2];
				sp++;
				// ###
			case 15:
				// ##OP-ILOAD_3|FLOAD_3 1 1I
				stack[sp] = stack[sb + 3];
				sp++;
				// ###
			case 16:
				// ##OP-ALOAD_0 1 1A
				stack[sp] = stack[sb + 3];
				sp++;
				// ###
			case 17:
				// ##OP-ANEWARRAY 3 -1A
				"##ALLOCATE";
				if (stack[sp - 1] < 0) {
					throw new FyException(FyConst.FY_EXCEPTION_AIOOB, ""
							+ stack[sp - 1]);
				}
				stack[sp - 1] = heap.allocateArray(context
						.lookupArrayClass(context
								.lookupClassFromConstant(constants[$u2[1]])),
						stack[sp - 1]);
				// ###
			case 20:
				// ##OP-IRETURN|FRETURN 1 -1
				if (this.accessFlags & FyConst.FY_ACC_SYNCHRONIZED) {
					if (this.accessFlags & FyConst.FY_ACC_STATIC) {
						thread.monitorExit(context.getClassObjectHandle(clazz));
					} else {
						thread.monitorExit(stack[sb]);
					}
				}
				stack[framePos + FyThread.frame_sb] = stack[sp - 1];
				thread.popFrame();
				thread.sp++;
				// TODO message return?
				break __fy_outer;
			// ###
			case 21:
				// ##OP-ARETURN 1 -1
				if (this.accessFlags & FyConst.FY_ACC_SYNCHRONIZED) {
					if (this.accessFlags & FyConst.FY_ACC_STATIC) {
						thread.monitorExit(context.getClassObjectHandle(clazz));
					} else {
						thread.monitorExit(stack[sb]);
					}
				}
				stack[framePos + FyThread.frame_sb] = stack[sp - 1];
				thread.popFrame();
				thread.sp++;
				// ###
			case 22:
				// ##OP-ARRAYLENGTH 1 -1I
				stack[sp - 1] = heap.arrayLength(stack[sp - 1]);
				// ###
			case 23:
				// ##OP-ISTORE|FSTORE 2 -1 X-ISTORE
				sp--;
				stack[sb + $u1[1]] = stack[sp];
				// ###
			case 25:
				// ##OP-ASTORE 2 -1 X-ASTORE
				sp--;
				stack[sb + $u1[1]] = stack[sp];
				// ###
			case 27:
				// ##OP-ISTORE_0|FSTORE_0 1 -1 0I
				sp--;
				stack[sb + 0] = stack[sp];
				// ###
			case 28:
				// ##OP-ASTORE_0 1 -1 0A
				sp--;
				stack[sb + 0] = stack[sp];
				// ###
			case 29:
				// ##OP-ISTORE_1|FSTORE_1 1 -1 1I
				sp--;
				stack[sb + 1] = stack[sp];
				// ###
			case 30:
				// ##OP-ASTORE_1 1 -1 1A
				sp--;
				stack[sb + 1] = stack[sp];
				// ###
			case 31:
				// ##OP-ISTORE_2|FSTORE_2 1 -1 2I
				sp--;
				stack[sb + 2] = stack[sp];
				// ###
			case 32:
				// ##OP-ASTORE_2 1 -1 2A
				sp--;
				stack[sb + 2] = stack[sp];
				// ###
			case 33:
				// ##OP-ISTORE_3|FSTORE_3 1 -1 3I
				sp--;
				stack[sb + 3] = stack[sp];
				// ###
			case 34:
				// ##OP-ASTORE_3 1 -1 3A
				sp--;
				stack[sb + 3] = stack[sp];
				// ###
			case 35:
				// ##OP-ATHROW 1 -1
				// TODO
				// ###
			case 36:
				// ##OP-BALOAD 1 -2I
				sp--;
				stack[sp - 1] = heap.getArrayByte(stack[sp - 1], stack[sp]);
				// ###
			case 37:
				// ##OP-BASTORE 1 -3
				sp -= 3;
				heap.putArrayByte(stack[sp], stack[sp + 1],
						stack[sp + 2] & 0xff);
				// ###
			case 38:
				// ##OP-BIPUSH 3 1I
				stack[sp] = $s2[1];
				sp++;
				// ###
			case 41:
				// ##OP-CALOAD 1 -2I
				sp--;
				stack[sp - 1] = heap.getArrayChar(stack[sp - 1], stack[sp]);
				// ###
			case 42:
				// ##OP-CASTORE 1 -3
				sp -= 3;
				heap.putArrayChar(stack[sp], stack[sp + 1],
						stack[sp + 2] & 0xff);
				// ###
			case 43:
				// ##OP-CHECKCAST 3 -1
				sp--;
				if (stack[sp] !== 0) {
					if (!context.classLoader
							.canCast(heap.getObject(stack[sp]).clazz, context
									.lookupClassFromConstant(constants[$u2[1]]))) {
						throw new FyException(
								FyConst.FY_EXCEPTION_CAST,
								"Can't case "
										+ heap.getObject(stack[sp]).clazz.name
										+ " to "
										+ context
												.lookupClassFromConstant(constants[$u2[1]]).name);
					}
				}
				// ###
			case 46:
				// ##OP-D2F 1 -2I
				sp--;
				stack[sp - 1] = FyPortable.floatToIeee32(FyPortable
						.ieee64ToDouble(stack, sp - 1));
				// ###
			case 47:
				// ##OP-D2I 1 -2I
				sp--;
				stack[sp - 1] = FyPortable.ieee64ToDouble(stack, sp - 1) >> 0;
				// ###
			case 48:
				// ##OP-D2L 1 -2II
				FyPortable.doubleToLong(FyPortable
						.ieee64ToDouble(stack, sp - 2), stack, sp - 2);
				// ###
			case 49:
				// ##OP-DADD 1 -4II
				sp -= 2;
				FyPortable.doubleToIeee64(FyPortable.ieee64ToDouble(stack,
						sp - 2)
						+ FyPortable.ieee64ToDouble(stack, sp), stack, sp - 2);
				// ###
			case 50:
				// ##OP-LALOAD|DALOAD 1 -2II
				heap.getArrayRawLongTo(stack[sp - 2], stack[sp - 1], stack,
						sp - 2);
				// ###
			case 51:
				// ##OP-LASTORE|DASTORE 1 -4
				sp -= 4;
				heap.putArrayRawLongFrom(stack[sp], stack[sp + 1], stack,
						sp + 2);
				// ###
			case 52:
				// ##OP-DCMPG 1 -4I
				sp -= 3;
				stack[sp - 1] = FyPortable.dcmpg(FyPortable.ieee64ToDouble(
						stack, sp - 1), FyPortable
						.ieee64ToDouble(stack, sp + 1));
				// ###
			case 53:
				// ##OP-DCMPL 1 -4I
				sp -= 3;
				stack[sp - 1] = FyPortable.dcmpl(FyPortable.ieee64ToDouble(
						stack, sp - 1), FyPortable
						.ieee64ToDouble(stack, sp + 1));
				// ###
			case 54:
				// ##OP-DCONST_0 1 2I
				FyPortable.doubleToIeee64(0.0, stack, sp);
				sp += 2;
				// ###
			case 55:
				// ##OP-DCONST_1 1 2I
				FyPortable.doubleToIeee64(1.0, stack, sp);
				sp += 2;
				// ###
			case 56:
				// ##OP-DDIV 1 -4II
				sp -= 2;
				FyPortable.doubleToIeee64(FyPortable.ieee64ToDouble(stack,
						sp - 2)
						/ FyPortable.ieee64ToDouble(stack, sp), stack, sp - 2);
				// ###
			case 57:
				// ##OP-DMUL 1 -4II
				sp -= 2;
				FyPortable.doubleToIeee64(FyPortable.ieee64ToDouble(stack,
						sp - 2)
						* FyPortable.ieee64ToDouble(stack, sp), stack, sp - 2);
				// ###
			case 58:
				// ##OP-DNEG 1 -2II
				FyPortable.doubleToIeee64(-FyPortable.ieee64ToDouble(stack,
						sp - 2), stack, sp - 2);
				// ###
			case 59:
				// ##OP-DREM 1 -4II
				sp -= 2;
				FyPortable.doubleToIeee64(FyPortable.ieee64ToDouble(stack,
						sp - 2)
						% FyPortable.ieee64ToDouble(stack, sp), stack, sp - 2);
				// ###
			case 60:
				// ##OP-DRETURN|LRETURN 1 -2
				if (this.accessFlags & FyConst.FY_ACC_SYNCHRONIZED) {
					if (this.accessFlags & FyConst.FY_ACC_STATIC) {
						thread.monitorExit(context.getClassObjectHandle(clazz));
					} else {
						thread.monitorExit(stack[sb]);
					}
				}
				stack[framePos + FyThread.frame_sb] = stack[sp - 2];
				stack[framePos + FyThread.frame_sb + 1] = stack[sp - 1];
				thread.popFrame();
				thread.sp += 2;
				// TODO message return?
				break __fy_outer;
			// ###
			case 61:
				// ##OP-DSUB 1 -4II
				sp -= 2;
				FyPortable.doubleToIeee64(FyPortable.ieee64ToDouble(stack,
						sp - 2)
						- FyPortable.ieee64ToDouble(stack, sp), stack, sp - 2);
				// ###
			case 62:
				// ##OP-DUP 1 X-DUP
				stack[sp] = stack[sp - 1];
				sp++;
				// ###
			case 63:
				// ##OP-DUP_X1 1 X-DUP_X1
				stack[sp] = stack[sp - 1];
				stack[sp - 1] = stack[sp - 2];
				stack[sp - 2] = stack[sp];
				sp++;
				// ###
			case 64:
				// ##OP-DUP_X2 1 X-DUP_X2
				stack[sp] = stack[sp - 1];
				stack[sp - 1] = stack[sp - 2];
				stack[sp - 2] = stack[sp - 3];
				stack[sp - 3] = stack[sp];
				sp++;
				// ###
			case 65:
				// ##OP-DUP2 1 X-DUP2
				stack[sp + 1] = stack[sp - 1];
				stack[sp] = stack[sp - 2];
				sp += 2;
				// ###
			case 66:
				// 321 -> 21321
				// ##OP-DUP2_X1 1 X-DUP2_X1
				stack[sp + 1] = stack[sp - 1];
				stack[sp] = stack[sp - 2];
				stack[sp - 1] = stack[sp - 3];
				stack[sp - 2] = stack[sp + 1];
				stack[sp - 3] = stack[sp];
				sp += 2;
				// ###
			case 67:
				// 4321 -> 214321
				// ##OP-DUP2_X2 1 X-DUP2_X2
				stack[sp + 1] = stack[sp - 1];
				stack[sp] = stack[sp - 2];
				stack[sp - 1] = stack[sp - 3];
				stack[sp - 2] = stack[sp + 4];
				stack[sp - 3] = stack[sp + 1];
				stack[sp - 4] = stack[sp];
				sp += 2;
				// ###
			case 68:
				// ##OP-F2D 1 -1II
				FyPortable.doubleToIeee64(FyPortable
						.ieee32ToFloat(stack[sp - 1]), stack, sp - 1);
				sp++;
				// ###
			case 69:
				// ##OP-F2I 1 -1I
				stack[sp - 1] = FyPortable.ieee32ToFloat(stack[sp - 1]) | 0;
				// ###
			case 70:
				// ##OP-F2L 1 -1II
				FyPortable.doubleToLong(
						FyPortable.ieee32ToFloat(stack[sp - 1]), stack, sp - 1);
				sp++;
				// ###
			case 71:
				// ##OP-FADD 1 -2I
				sp--;
				stack[sp - 1] = FyPortable.floatToIeee32(FyPortable
						.ieee32ToFloat(stack[sp - 1])
						+ FyPortable.ieee32ToFloat(stack[sp]));
				// ###
			case 72:
				// ##OP-FCMPG 1 -2I
				sp--;
				stack[sp - 1] = FyPortable.dcmpg(FyPortable
						.ieee32ToFloat(stack[sp - 1]), FyPortable
						.ieee32ToFloat(stack[sp]));
				// ###
			case 73:
				// ##OP-FCMPL 1 -2I
				sp--;
				stack[sp - 1] = FyPortable.dcmpg(FyPortable
						.ieee32ToFloat(stack[sp - 1]), FyPortable
						.ieee32ToFloat(stack[sp]));
				// ###
			case 74:
				// ##OP-FCONST_0 1 1I
				stack[sp] = FyPortable.floatToIeee32(0);
				sp++;
				// ###
			case 75:
				// ##OP-FCONST_1 1 1I
				stack[sp] = FyPortable.floatToIeee32(1);
				sp++;
				// ###
			case 76:
				// ##OP-FCONST_2 1 1I
				stack[sp] = FyPortable.floatToIeee32(2);
				sp++;
				// ###
			case 77:
				// ##OP-FDIV 1 -2I
				sp--;
				stack[sp - 1] = FyPortable.floatToIeee32(FyPortable
						.ieee32ToFloat(stack[sp - 1])
						/ FyPortable.ieee32ToFloat(stack[sp]));
				// ###
			case 78:
				// ##OP-FMUL 1 -2I
				sp--;
				stack[sp - 1] = FyPortable.floatToIeee32(FyPortable
						.ieee32ToFloat(stack[sp - 1])
						* FyPortable.ieee32ToFloat(stack[sp]));
				// ###
			case 79:
				// ##OP-FNEG 1 -1I
				sp--;
				stack[sp - 1] = FyPortable.floatToIeee32(-FyPortable
						.ieee32ToFloat(stack[sp - 1]));
				// ###
			case 80:
				// ##OP-FREM 1 -2I
				sp--;
				stack[sp - 1] = FyPortable.floatToIeee32(FyPortable
						.ieee32ToFloat(stack[sp - 1])
						% FyPortable.ieee32ToFloat(stack[sp]));
				// ###
			case 81:
				// ##OP-FSUB 1 -2I
				sp--;
				stack[sp - 1] = FyPortable.floatToIeee32(FyPortable
						.ieee32ToFloat(stack[sp - 1])
						- FyPortable.ieee32ToFloat(stack[sp]));
				// ###
			case 82:
				// ##OP-GETFIELD 3 X-GETFIELD
				
				// ###
			default:
				throw new FyException(undefined, "PC out of sync at "
						+ this.uniqueName + "." + pc);
			}
		} catch (e) {
			if (e instanceof FyException) {

			}
		}
	}

};