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
		var _heap = heap.heap;

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
		var tmpClass = FyClass.empty;

		/**
		 * @returns {FyClass}
		 */
		var clinitClass = FyClass.empty;

		/**
		 * @returns {FyMethod}
		 */
		var tmpMethod = FyMethod.empty;

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
							thread.localToFrame($ip|0, $ip|0);
							thread.pushFrame(clinitClass.clinit, sb + $spo);
							return 0;
						} else {
							// wait for other thread clinit
							thread.localToFrame($ip|0, $ip|0);
							return 0;
						}
					}
					// ###
				}
				// ##MACRO-OPS
				ops -= $distance;
				if (ops < 0) {
					thread.localToFrame($ip|0, $ip|0);
					return 0;
				}
				// ###
				// CAT.NOOP
			case 999:
				// ##OP-NOP 0 0
				// ###
				// ##OP-POP -1 0
				// ###
				// ##OP-POP2 -2 0
				// ###
				// CAT.LOCAL
			case 1000:
				// ##OP-ILOAD|FLOAD|ALOAD 0 1
				"#!";
				console.log([ sb + $spo, "<==", sb + $1, stack[sb + $spo],
						"<==", stack[sb + $1] ]);
				"!#";
				stack[sb + $spo] = stack[sb + $1];
				// ###
			case 1002:
				// ##OP-DLOAD|LLOAD 0 2
				"#!";
				console.log((sb + $spo) + "<==" + (sb + $1) + " "
						+ [ stack[sb + $1], stack[sb + $1 + 1] ]);
				"!#";
				stack[sb + $spo] = stack[sb + $1];
				stack[sb + $spo + 1] = stack[sb + $1 + 1];
				// ###
			case 1010:
				// ##OP-ISTORE|FSTORE|ASTORE -1 0
				"#!";
				console.log([ sb + $spo - 1, "==>", sb + $1,
						stack[sb + $spo - 1], "==>", stack[sb + $1] ]);
				"!#";
				stack[sb + $1] = stack[sb + $spo - 1];
				// ###
			case 1012:
				// ##OP-DSTORE|LSTORE -2 0
				"#!";
				console.log([ sb + $spo - 2, "==>", sb + $1,
						stack[sb + $spo - 2], "==>", stack[sb + $1] ]);
				console.log([ sb + $spo - 1, "==>", sb + $1 + 1,
						stack[sb + $spo - 1], "==>", stack[sb + $1 + 1] ]);
				"!#";
				stack[sb + $1] = stack[sb + $spo - 2];
				stack[sb + $1 + 1] = stack[sb + $spo - 1];
				// ###
				// CAT. STACK
				// CATS. DUP/SWAP
			case 1100:
				// ##OP-DUP -1 2
				stack[sb + $spo] = stack[sb + $spo - 1];
				// ###
			case 1101:
				// ##OP-DUP_X1 -2 3
				stack[sb + $spo] = stack[sb + $spo - 1];
				stack[sb + $spo - 1] = stack[sb + $spo - 2];
				stack[sb + $spo - 2] = stack[sb + $spo];
				// ###
			case 1102:
				// ##OP-DUP_X2 -3 4
				stack[sb + $spo] = stack[sb + $spo - 1];
				stack[sb + $spo - 1] = stack[sb + $spo - 2];
				stack[sb + $spo - 2] = stack[sb + $spo - 3];
				stack[sb + $spo - 3] = stack[sb + $spo];
				// ###
			case 1103:
				// ##OP-DUP2 -2 4
				stack[sb + $spo + 1] = stack[sb + $spo - 1];
				stack[sb + $spo] = stack[sb + $spo - 2];
				// ###
			case 1104:
				// 321 -> 21321
				// ##OP-DUP2_X1 -3 5
				stack[sb + $spo + 1] = stack[sb + $spo - 1];
				stack[sb + $spo] = stack[sb + $spo - 2];
				stack[sb + $spo - 1] = stack[sb + $spo - 3];
				stack[sb + $spo - 2] = stack[sb + $spo + 1];
				stack[sb + $spo - 3] = stack[sb + $spo];
				// ###
			case 1105:
				// 4321 -> 214321
				// ##OP-DUP2_X2 -4 6
				stack[sb + $spo + 1] = stack[sb + $spo - 1];
				stack[sb + $spo] = stack[sb + $spo - 2];
				stack[sb + $spo - 1] = stack[sb + $spo - 3];
				stack[sb + $spo - 2] = stack[sb + $spo + 4];
				stack[sb + $spo - 3] = stack[sb + $spo + 1];
				stack[sb + $spo - 4] = stack[sb + $spo];
				// ###
			case 1106:
				// ##OP-SWAP -2 2
			{
				var tmpi = stack[sb + $spo - 1];
				stack[sb + $spo - 1] = stack[sb + $spo - 2];
				stack[sb + $spo - 2] = tmpi;
			}
				// ###
				// CATS. literal numbers
			case 1110:
				// ##OP-ACONST_NULL 0 1
				stack[sb + $spo] = 0;
				// ###
			case 1120:
				// ##OP-ICONST_M1 0 1
				stack[sb + $spo] = -1;
				// ###
			case 1121:
				// ##OP-ICONST_0 0 1
				stack[sb + $spo] = 0;
				// ###
			case 1122:
				// ##OP-ICONST_1 0 1
				stack[sb + $spo] = 1;
				// ###
			case 1123:
				// ##OP-ICONST_2 0 1
				stack[sb + $spo] = 2;
				// ###
			case 1124:
				// ##OP-ICONST_3 0 1
				stack[sb + $spo] = 3;
				// ###
			case 1125:
				// ##OP-ICONST_4 0 1
				stack[sb + $spo] = 4;
				// ###
			case 1126:
				// ##OP-ICONST_5 0 1
				stack[sb + $spo] = 5;
				// ###
			case 1127:
				// ##OP-BIPUSH 0 1
				stack[sb + $spo] = $1;
				// ###
			case 1128:
				// ##OP-SIPUSH 0 1
				stack[sb + $spo] = $1;
				// ###
			case 1130:
				// ##OP-FCONST_0 0 1
				floatStack[sb + $spo] = 0;
				// ###
			case 1131:
				// ##OP-FCONST_1 0 1
				floatStack[sb + $spo] = 1;
				// ###
			case 1132:
				// ##OP-FCONST_2 0 1
				floatStack[sb + $spo] = 2;
				// ###
			case 1140:
				// ##OP-LCONST_0 0 2
				stack[sb + $spo] = 0;
				stack[sb + $spo + 1] = 0;
				// ###
			case 1141:
				// ##OP-LCONST_1 0 2
				stack[sb + $spo] = 0;
				stack[sb + $spo + 1] = 1;
				// ###
			case 1150:
				// ##OP-DCONST_0 0 2
				FyPortable.doubleToIeee64(0.0, stack, sb + $spo);
				// ###
			case 1151:
				// ##OP-DCONST_1 0 2
				FyPortable.doubleToIeee64(1.0, stack, sb + $spo);
				// ###
				// CATS. CONV
			case 1200:
				// ##OP-D2F -2 1
				stack[sb + $spo - 2] = FyPortable.floatToIeee32(FyPortable
						.ieee64ToDouble(stack, sb + $spo - 2));
				// ###
			case 1201:
				// ##OP-D2I -2 1
				stack[sb + $spo - 2] = FyPortable.ieee64ToDouble(stack, sb
						+ $spo - 2) >> 0;
				// ###
			case 1202:
				// ##OP-D2L -2 2
				longOps.longFromNumber(sb + $spo - 2, FyPortable
						.ieee64ToDouble(stack, sb + $spo - 2));
				// ###
			case 1203:
				// ##OP-F2D -1 2
				FyPortable.doubleToIeee64(floatStack[sb + $spo - 1], stack, sb
						+ $spo - 1);
				// ###
			case 1204:
				// ##OP-F2I -1 1
				stack[sb + $spo - 1] = floatStack[sb + $spo - 1];
				// ###
			case 1205:
				// ##OP-F2L -1 2
				longOps
						.longFromNumber(sb + $spo - 1,
								floatStack[sb + $spo - 1]);
				// ###
			case 1206:
				// ##OP-I2B -1 1
				stack[sb + $spo - 1] = stack[sb + $spo - 1] << 24 >> 24;
				// ###
			case 1207:
				// ##OP-I2C -1 1
				stack[sb + $spo - 1] &= 0xffff;
				// ###
			case 1208:
				// ##OP-I2D -1 2
				FyPortable.doubleToIeee64(stack[sb + $spo - 1], stack, sb
						+ $spo - 1);
				// ###
			case 1209:
				// ##OP-I2F -1 1
				stack[sb + $spo - 1] = FyPortable.floatToIeee32(stack[sb + $spo
						- 1]);
				// ###
			case 1210:
				// ##OP-I2L -1 2
				stack[sb + $spo] = stack[sb + $spo - 1];
				stack[sb + $spo - 1] = stack[sb + $spo] >= 0 ? 0 : -1;
				// ###
			case 1211:
				// ##OP-I2S -1 1
				stack[sb + $spo - 1] = stack[sb + $spo - 1] << 16 >> 16;
				// ###
			case 1212:
				// ##OP-L2D -2 2
				FyPortable.doubleToIeee64(longOps.longToNumber(sb + $spo - 2),
						stack, sb + $spo - 2);
				// ###
			case 1213:
				// ##OP-L2F -2 1
				floatStack[sb + $spo - 2] = longOps.longToNumber(sb + $spo - 2);
				// ###
			case 1214:
				// ##OP-L2I -2 1
				stack[sb + $spo - 2] = stack[sb + $spo - 1];
				// ###
				// CATS. IOP
			case 1300:
				// ##OP-IINC 0 0
				stack[sb + $1] += $2;
				// ###
			case 1301:
				// ##OP-INEG -1 1
				stack[sb + $spo - 1] *= -1;
				// ###
			case 1302:
				// ##OP-IADD -2 1
				stack[sb + $spo - 2] += stack[sb + $spo - 1];
				// ###
			case 1303:
				// ##OP-ISUB -2 1
				stack[sb + $spo - 2] -= stack[sb + $spo - 1];
				// ###
			case 1304:
				// ##OP-IMUL -2 1
				stack[sb + $spo - 2] = Math.imul(stack[sb + $spo - 2], stack[sb
						+ $spo - 1]);
				// ###
			case 1350:
				// ##OP-IAND -2 1
				stack[sb + $spo - 2] &= stack[sb + $spo - 1];
				// ###
			case 1351:
				// ##OP-IOR -2 1
				stack[sb + $spo - 2] |= stack[sb + $spo - 1];
				// ###
			case 1352:
				// ##OP-IXOR -2 1
				stack[sb + $spo - 2] ^= stack[sb + $spo - 1];
				// ###
			case 1360:
				// ##OP-ISHL -2 1
				stack[sb + $spo - 2] <<= stack[sb + $spo - 1];
				// ###
			case 1361:
				// ##OP-ISHR -2 1
				stack[sb + $spo - 2] >>= stack[sb + $spo - 1];
				// ###
			case 1362:
				// ##OP-IUSHR -2 1
				stack[sb + $spo - 2] >>>= stack[sb + $spo - 1];
				// ###
				// CATS. IOP-E
			case 1390:
				// ##OP-IDIV -2 1
				if (stack[sb + $spo - 1] === 0) {
					thread.localToFrame($ip|0, ($ip + 1)|0);
					throw new FyException(FyConst.FY_EXCEPTION_ARITHMETIC,
							"Devided by zero!");
				}
				stack[sb + $spo - 2] = (stack[sb + $spo - 2] / stack[sb + $spo
						- 1]);
				// ###
			case 1391:
				// ##OP-IREM -2 1
				if (stack[sb + $spo - 1] === 0) {
					thread.localToFrame($ip|0, ($ip + 1)|0);
					throw new FyException(FyConst.FY_EXCEPTION_ARITHMETIC,
							"Devided by zero");
				}
				stack[sb + $spo - 2] %= stack[sb + $spo - 1];
				// ###
				// CATS. FOP
			case 1401:
				// ##OP-FNEG -1 1
				floatStack[sb + $spo - 1] = -floatStack[sb + $spo - 1];
				// ###
			case 1402:
				// ##OP-FADD -2 1
				floatStack[sb + $spo - 2] += floatStack[sb + $spo - 1];
				// ###
			case 1403:
				// ##OP-FSUB -2 1
				floatStack[sb + $spo - 2] -= floatStack[sb + $spo - 1];
				// ###
			case 1404:
				// ##OP-FMUL -2 1
				floatStack[sb + $spo - 2] *= floatStack[sb + $spo - 1];
				// ###
			case 1405:
				// ##OP-FDIV -2 1
				floatStack[sb + $spo - 2] /= floatStack[sb + $spo - 1];
				// ###
			case 1406:
				// ##OP-FREM -2 1
				floatStack[sb + $spo - 2] %= floatStack[sb + $spo - 1];
				// ###
			case 1410:
				// ##OP-FCMPG -2 1
				stack[sb + $spo - 2] = FyPortable.dcmpg(floatStack[sb + $spo
						- 2], floatStack[sb + $spo - 1]);
				// ###
			case 1411:
				// ##OP-FCMPL -2 1
				stack[sb + $spo - 2] = FyPortable.dcmpl(floatStack[sb + $spo
						- 2], floatStack[sb + $spo - 1]);
				// ###
				// CATS. LOP
			case 1501:
				// ##OP-LNEG -2 2
				longOps.neg(sb + $spo - 2);
				// ###
			case 1502:
				// ##OP-LADD -4 2
				longOps.add(sb + $spo - 4, sb + $spo - 2);
				// ###
			case 1503:
				// ##OP-LSUB -4 2
				longOps.sub(sb + $spo - 4, sb + $spo - 2);
				// ###
			case 1504:
				// ##OP-LMUL -4 2
				longOps.mul(sb + $spo - 4, sb + $spo - 2);
				// ###
			case 1510:
				// ##OP-LCMP -4 1
				longOps.cmp(sb + $spo - 4, sb + $spo - 2);
				// since longOps.cmp returns -1/0/1 in long array,
				// simple
				// convert it to int
				stack[sb + $spo - 4] = stack[sb + $spo - 3];
				// ###
			case 1550:
				// ##OP-LAND -4 2
				stack[sb + $spo - 4] &= stack[sb + $spo - 2];
				stack[sb + $spo - 3] &= stack[sb + $spo - 1];
				// ###
			case 1551:
				// ##OP-LOR -4 2
				stack[sb + $spo - 4] |= stack[sb + $spo - 2];
				stack[sb + $spo - 3] |= stack[sb + $spo - 1];
				// ###
			case 1552:
				// ##OP-LXOR -4 2
				stack[sb + $spo - 4] ^= stack[sb + $spo - 2];
				stack[sb + $spo - 3] ^= stack[sb + $spo - 1];
				// ###
			case 1553:
				// ##OP-LSHL -3 2
				longOps.shl(sb + $spo - 3, stack[sb + $spo - 1]);
				// ###
			case 1554:
				// ##OP-LSHR -3 2
				longOps.shr(sb + $spo - 3, stack[sb + $spo - 1]);
				// ###
			case 1555:
				// ##OP-LUSHR -3 2
				longOps.ushr(sb + $spo - 3, stack[sb + $spo - 1]);
				// ###
				// CATS. LOP-E
			case 1590:
				// ##OP-LDIV -4 2
				if (stack[sb + $spo - 2] === 0 && stack[sb + $spo - 1] === 0) {
					thread.localToFrame($ip|0, ($ip + 1)|0);
					throw new FyException(FyConst.FY_EXCEPTION_ARITHMETIC,
							"Devided by zero!");
				}
				longOps.div(sb + $spo - 4, sb + $spo - 2);
				// ###
			case 1591:
				// ##OP-LREM -4 2
				if (stack[sb + $spo - 2] === 0 && stack[sb + $spo - 1] === 0) {
					thread.localToFrame($ip|0, ($ip + 1)|0);
					throw new FyException(FyConst.FY_EXCEPTION_ARITHMETIC,
							"Devided by zero!");
				}
				longOps.rem(sb + $spo - 4, sb + $spo - 2);
				// ###
				// CATS. DOP
			case 1601:
				// ##OP-DNEG -2 2
				FyPortable.doubleToIeee64(-FyPortable.ieee64ToDouble(stack, sb
						+ $spo - 2), stack, sb + $spo - 2);
				// ###
			case 1602:
				// ##OP-DADD -4 2
				FyPortable.doubleToIeee64(FyPortable.ieee64ToDouble(stack, sb
						+ $spo - 4)
						+ FyPortable.ieee64ToDouble(stack, sb + $spo - 2),
						stack, sb + $spo - 4);
				// ###
			case 1603:
				// ##OP-DSUB -4 2
				FyPortable.doubleToIeee64(FyPortable.ieee64ToDouble(stack, sb
						+ $spo - 4)
						- FyPortable.ieee64ToDouble(stack, sb + $spo - 2),
						stack, sb + $spo - 4);
				// ###
			case 1604:
				// ##OP-DMUL -4 2
				FyPortable.doubleToIeee64(FyPortable.ieee64ToDouble(stack, sb
						+ $spo - 4)
						* FyPortable.ieee64ToDouble(stack, sb + $spo - 2),
						stack, sb + $spo - 4);
				// ###
			case 1605:
				// ##OP-DDIV -4 2
				FyPortable.doubleToIeee64(FyPortable.ieee64ToDouble(stack, sb
						+ $spo - 4)
						/ FyPortable.ieee64ToDouble(stack, sb + $spo - 2),
						stack, sb + $spo - 4);
				// ###
			case 1606:
				// ##OP-DREM -4 2
				FyPortable.doubleToIeee64(FyPortable.ieee64ToDouble(stack, sb
						+ $spo - 4)
						% FyPortable.ieee64ToDouble(stack, sb + $spo - 2),
						stack, sb + $spo - 4);
				// ###
			case 1610:
				// ##OP-DCMPG -4 1
				stack[sb + $spo - 4] = FyPortable.dcmpg(FyPortable
						.ieee64ToDouble(stack, sb + $spo - 4), FyPortable
						.ieee64ToDouble(stack, sb + $spo - 2));
				// ###
			case 1611:
				// ##OP-DCMPL -4 1
				stack[sb + $spo - 4] = FyPortable.dcmpl(FyPortable
						.ieee64ToDouble(stack, sb + $spo - 4), FyPortable
						.ieee64ToDouble(stack, sb + $spo - 2));
				// ###
				// CAT. JUMPOUT
			case 9000:
				// ##OP-GOTO 0 0
				ip = $1;
				break __fy_inner;
			// ###
			case 9001:
				// ##OP-IF_ICMPEQ -2 0

				if (stack[sb + $spo - 2] === stack[sb + $spo - 1]) {
					ip = $1;
					break __fy_inner;
				}
				// ###
			case 9002:
				// ##OP-IF_ACMPEQ -2 0

				if (stack[sb + $spo - 2] === stack[sb + $spo - 1]) {
					ip = $1;
					break __fy_inner;
				}
				// ###
			case 9003:
				// ##OP-IF_ICMPNE -2 0
				if (stack[sb + $spo - 2] !== stack[sb + $spo - 1]) {
					ip = $1;
					break __fy_inner;
				}
				// ###
			case 9004:
				// ##OP-IF_ACMPNE -2 0
				if (stack[sb + $spo - 2] !== stack[sb + $spo - 1]) {
					ip = $1;
					break __fy_inner;
				}
				// ###
			case 9005:
				// ##OP-IF_ICMPLT -2 0
				if (stack[sb + $spo - 2] < stack[sb + $spo - 1]) {
					ip = $1;
					break __fy_inner;
				}
				// ###
			case 9006:
				// ##OP-IF_ICMPLE -2 0
				if (stack[sb + $spo - 2] <= stack[sb + $spo - 1]) {
					ip = $1;
					break __fy_inner;
				}
				// ###
			case 9007:
				// ##OP-IF_ICMPGT -2 0
				if (stack[sb + $spo - 2] > stack[sb + $spo - 1]) {
					ip = $1;
					break __fy_inner;
				}
				// ###
			case 9008:
				// ##OP-IF_ICMPGE -2 0
				if (stack[sb + $spo - 2] >= stack[sb + $spo - 1]) {
					ip = $1;
					break __fy_inner;
				}
				// ###
			case 9009:
				// ##OP-IFEQ -1 0
				if (stack[sb + $spo - 1] === 0) {
					ip = $1;
					break __fy_inner;
				}
				// ###
			case 9010:
				// ##OP-IFNULL -1 0
				if (stack[sb + $spo - 1] === 0) {
					ip = $1;
					break __fy_inner;
				}
				// ###
			case 9011:
				// ##OP-IFNE -1 0
				if (stack[sb + $spo - 1] !== 0) {
					ip = $1;
					break __fy_inner;
				}
				// ###
			case 9012:
				// ##OP-IFNONNULL -1 0
				if (stack[sb + $spo - 1] !== 0) {
					ip = $1;
					break __fy_inner;
				}
				// ###
			case 9013:
				// ##OP-IFLT -1 0
				if (stack[sb + $spo - 1] < 0) {
					ip = $1;
					break __fy_inner;
				}
				// ###
			case 9014:
				// ##OP-IFLE -1 0
				if (stack[sb + $spo - 1] <= 0) {
					ip = $1;
					break __fy_inner;
				}
				// ###
			case 9015:
				// ##OP-IFGT -1 0
				if (stack[sb + $spo - 1] > 0) {
					ip = $1;
					break __fy_inner;
				}
				// ###
			case 9016:
				// ##OP-IFGE -1 0
				if (stack[sb + $spo - 1] >= 0) {
					ip = $1;
					break __fy_inner;
				}
				// ###
			case 9100:
				// ##OP-LOOKUPSWITCH -1 0
			{
				var lookupSwitchTarget = _m_.lookupSwitchTargets[$1];
				tmpInt1 = lookupSwitchTarget.targets.get(stack[sb + $spo - 1]);
				if (tmpInt1 === -1) {
					ip = lookupSwitchTarget.dflt;
					break __fy_inner;
				} else {
					ip = tmpInt1;
					break __fy_inner;
				}
			}
				// ###
			case 9101:
				// ##OP-TABLESWITCH -1 0
			{
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
			}
				// ###
				// CAT. ARRAY
			case 2000:
				// ##OP-AALOAD|FALOAD|IALOAD -2 1
				thread.localToFrame($ip|0, ($ip + 1)|0);
				heap.getArrayRaw32ToHeap(stack[sb + $spo - 2], stack[sb + $spo
						- 1], sb + $spo - 2);
				// ###
			case 2002:
				// ##OP-LALOAD|DALOAD -2 2
				thread.localToFrame($ip|0, ($ip + 1)|0);
				heap.getArrayRaw64ToHeap(stack[sb + $spo - 2], stack[sb + $spo
						- 1], sb + $spo - 2);
				// ###
			case 2003:
				// ##OP-BALOAD -2 1
				thread.localToFrame($ip|0, ($ip + 1)|0);
				heap.getArrayRaw8ToHeap(stack[sb + $spo - 2], stack[sb + $spo
						- 1], sb + $spo - 2);
				// ###
			case 2004:
				// ##OP-CALOAD -2 1
				thread.localToFrame($ip|0, ($ip + 1)|0);
				heap.getArrayRaw16ToHeap(stack[sb + $spo - 2], stack[sb + $spo
						- 1], sb + $spo - 2);
				stack[sb + $spo - 2] &= 0xffff;
				// ###
			case 2005:
				// ##OP-SALOAD -2 1
				thread.localToFrame($ip|0, ($ip + 1)|0);
				heap.getArrayRaw16ToHeap(stack[sb + $spo - 2], stack[sb + $spo
						- 1], sb + $spo - 2);
				// ###
			case 2010:
				// ##OP-AASTORE -3 0
				thread.localToFrame($ip|0, ($ip + 1)|0);
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
			case 2011:
				// ##OP-FASTORE|IASTORE -3 0
				thread.localToFrame($ip|0, ($ip + 1)|0);
				heap.putArrayRaw32FromHeap(stack[sb + $spo - 3], stack[sb
						+ $spo - 2], sb + $spo - 1);
				// ###
			case 2012:
				// ##OP-LASTORE|DASTORE -4 0
				thread.localToFrame($ip|0, ($ip + 1)|0);
				heap.putArrayRaw64FromHeap(stack[sb + $spo - 4], stack[sb
						+ $spo - 3], sb + $spo - 2);
				// ###
			case 2013:
				// ##OP-BASTORE -3 0
				thread.localToFrame($ip|0, ($ip + 1)|0);
				heap.putArrayRaw8FromHeap(stack[sb + $spo - 3], stack[sb + $spo
						- 2], sb + $spo - 1);
				// ###
			case 2014:
				// ##OP-CASTORE -3 0
				thread.localToFrame($ip|0, ($ip + 1)|0);
				heap.putArrayRaw16FromHeap(stack[sb + $spo - 3], stack[sb
						+ $spo - 2], sb + $spo - 1);
				// ###
			case 2015:
				// ##OP-SASTORE -3 0
				thread.localToFrame($ip|0, ($ip + 1)|0);
				heap.putArrayRaw16FromHeap(stack[sb + $spo - 3], stack[sb
						+ $spo - 2], sb + $spo - 1);
				// ###
			case 2020:
				// ##OP-ARRAYLENGTH -1 1
				thread.localToFrame($ip|0, ($ip + 1)|0);
				stack[sb + $spo - 1] = heap.arrayLength(stack[sb + $spo - 1]);
				// ###
			case 2021:
				// ##OP-NEWARRAY -1 1
				thread.localToFrame($ip|0, ($ip + 1)|0);
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
			case 2022:
				// ##OP-ANEWARRAY -1 1
				thread.localToFrame($ip|0, ($ip + 1)|0);
				if (stack[sb + $spo - 1] < 0) {
					throw new FyException(FyConst.FY_EXCEPTION_AIOOB, ""
							+ stack[sb + $spo - 1]);
				}
				stack[sb + $spo - 1] = heap.allocateArray(context
						.lookupArrayClass(context.lookupClassFromConstant(
								global, constants[$1])), stack[sb + $spo - 1]);
				// ###
			case 2023:
				// ##OP-MULTIANEWARRAY X-MULTIANEWARRAY 1

				thread.localToFrame($ip|0, ($ip + 1)|0);
				stack[sb + $spo - $2] = heap.multiNewArray(context
						.lookupClassFromConstant(global, constants[$1]), $2,
						stack, sb + $spo - $2);
				// ###
				// CAT. RETURN
			case 3000:
				// ##OP-RETURN 0 0
				if (_m_.accessFlags & FyConst.FY_ACC_SYNCHRONIZED) {
					thread.localToFrame($ip|0, ($ip + 1)|0);
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
			case 3001:
				// ##OP-IRETURN|FRETURN|ARETURN -1 0
				if (_m_.accessFlags & FyConst.FY_ACC_SYNCHRONIZED) {
					thread.localToFrame($ip|0, ($ip + 1)|0);
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
			case 3002:
				// ##OP-DRETURN|LRETURN -2 0
				if (_m_.accessFlags & FyConst.FY_ACC_SYNCHRONIZED) {
					thread.localToFrame($ip|0, ($ip + 1)|0);
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
				// CAT. THROW
			case 4000:
				// ##OP-ATHROW -1 0
				thread.currentThrowable = stack[sb + $spo - 1];
				thread.localToFrame($ip|0, $ip|0);
				return 0;
				// ###

				// CAT. HEAP
			case 5001:
				// ##OP-GETFIELD -1 X-GETFIELD
				// X-GETFIELD
				throw new FyException(undefined, "Should be optimized by aot");
				// ###
			case 5002:
				// ##OP-GETSTATIC 0 X-GETSTATIC
				// X-GETSTATIC
				throw new FyException(undefined, "Should be optimized by aot");
				// ###
			case 5003:
				// ##OP-PUTFIELD X-PUTFIELD 0
				// X-PUTFIELD
				throw new FyException(undefined, "Should be optimized by aot");
				// ###
			case 5004:
				// ##OP-PUTSTATIC X-PUTSTATIC 0
				// X-PUTSTATIC
				throw new FyException(undefined, "Should be optimized by aot");
				// ###
				// CAT. INVOKE
			case 6000:
				// ##OP-INVOKESPECIAL X-INVOKESPECIAL 0
				// X-INVOKESPECIAL
				throw new FyException(undefined, "op should be AOTed");
				// ###
			case 6001:
				// ##OP-INVOKESTATIC X-INVOKESTATIC 0
				// X-INVOKESTATIC
				throw new FyException(undefined, "op should be AOTed");
				// ###
			case 6002:
				// ##OP-INVOKEINTERFACE|INVOKEVIRTUAL X-INVOKEVIRTUAL 0
				// X-INVOKEVIRTUAL
				throw new FyException(undefined, "op should be AOTed");
				// ###
			case 6100:
				// ##OP-NEW 0 1
				thread.localToFrame($ip|0, ($ip + 1)|0);
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
						thread.localToFrame($ip|0, $ip|0);
						thread.pushFrame(clinitClass.clinit, sb + $spo);
						return 0;
					} else {
						// wait for other thread clinit
						thread.localToFrame($ip|0, $ip|0);
						return 0;
					}
				}

				stack[sb + $spo] = heap.allocate(tmpClass);
				// ###
			case 7000:
				// ##OP-MONITORENTER -1 0
				thread.monitorEnter(stack[sb + $spo - 1]);
				if (thread.yield) {
					// Local to frame
					thread.localToFrame($ip|0, ($ip + 1)|0);
					return 0;
				}
				// ###
			case 7001:
				// ##OP-MONITOREXIT -1 0
				thread.monitorExit(stack[sb + $spo - 1]);
				if (thread.yield) {
					// Local to frame
					thread.localToFrame($ip|0, ($ip + 1)|0);
					return 0;
				}
				// ###
			case 8000:
				// ##OP-CHECKCAST -1 0
				if (stack[sb + $spo - 1] !== 0) {
					if (!context.classLoader.canCast(heap
							.getObjectClass(stack[sb + $spo - 1]), context
							.lookupClassFromConstant(global, constants[$1]))) {
						thread.localToFrame($ip|0, ($ip + 1)|0);
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
			case 8001:
				// ##OP-INSTANCEOF -1 1
				if (stack[sb + $spo - 1] !== 0) {
					thread.localToFrame($ip|0, ($ip + 1)|0);
					stack[sb + $spo - 1] = context.classLoader.canCast(heap
							.getObjectClass(stack[sb + $spo - 1]), context
							.lookupClassFromConstant(global, constants[$1]));
				}
				// ###
			case 8002:
				// ##OP-LDC 0 X-LDC
				throw new FyException(undefined,
						"LDC should be compiled in aot");
				// ###
				break;
			// ##MACRO-TAIL
			default:
				thread.localToFrame(lip|0, ip|0);
				throw new FyException(undefined, "IP out of sync at "
						+ _m_.uniqueName + "." + ip);
			} // /__fy_inner

		} // /__fy_outer
		// Local to frame
		throw new FyException(undefined, "illegal code position");
		// ###
	};
})();
