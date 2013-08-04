/**
 * AOT Template
 * Generated from src/main/resources/fisce/method.sample.js
 */
var FyAOTUtil = new __FyAOTUtil({
	"ops" : {
		"AALOAD" : {
			"code" : "lip = $ip;ops--;sp--;stack[sp - 1] = heap.getArrayInt(stack[sp - 1], stack[sp]);",
			"pops" : "-2",
			"pushes" : "1"
		},
		"FALOAD" : {
			"code" : "lip = $ip;ops--;sp--;stack[sp - 1] = heap.getArrayInt(stack[sp - 1], stack[sp]);",
			"pops" : "-2",
			"pushes" : "1"
		},
		"IALOAD" : {
			"code" : "lip = $ip;ops--;sp--;stack[sp - 1] = heap.getArrayInt(stack[sp - 1], stack[sp]);",
			"pops" : "-2",
			"pushes" : "1"
		},
		"AASTORE" : {
			"code" : "lip = $ip;ops--;sp -= 3;if (stack[sp] !== 0&& (!context.classLoader.canCast(heap.getClassFromHandle(stack[sp + 2]),heap.getClassFromHandle(stack[sp + 0]).contentClass))) {throw new FyException(FyConst.FY_EXCEPTION_STORE,\"Can't store \"+ heap.getClassFromHandle(stack[sp + 2]).name+ \" to \"+ heap.getClassFromHandle(stack[sp + 0]).name);}heap.putArrayInt(stack[sp + 0], stack[sp + 1],stack[sp + 2]);",
			"pops" : "-3",
			"pushes" : "0"
		},
		"FASTORE" : {
			"code" : "lip = $ip;ops--;sp -= 3;heap.putArrayInt(stack[sp + 0], stack[sp + 1],stack[sp + 2]);",
			"pops" : "-3",
			"pushes" : "0"
		},
		"IASTORE" : {
			"code" : "lip = $ip;ops--;sp -= 3;heap.putArrayInt(stack[sp + 0], stack[sp + 1],stack[sp + 2]);",
			"pops" : "-3",
			"pushes" : "0"
		},
		"ACONST_NULL" : {
			"code" : "ops--;stack[sp] = 0;sp++;",
			"pops" : "0",
			"pushes" : "1"
		},
		"ILOAD" : {
			"code" : "ops--;stack[sp] = stack[sb + $1];sp++;",
			"pops" : "0",
			"pushes" : "1"
		},
		"FLOAD" : {
			"code" : "ops--;stack[sp] = stack[sb + $1];sp++;",
			"pops" : "0",
			"pushes" : "1"
		},
		"ALOAD" : {
			"code" : "ops--;stack[sp] = stack[sb + $1];sp++;",
			"pops" : "0",
			"pushes" : "1"
		},
		"ANEWARRAY" : {
			"code" : "lip = $ip;ops--;if (stack[sp - 1] < 0) {throw new FyException(FyConst.FY_EXCEPTION_AIOOB, \"\"+ stack[sp - 1]);}stack[sp - 1] = heap.allocateArray(context.lookupArrayClass(context.lookupClassFromConstant(constants[$1])),stack[sp - 1]);",
			"pops" : "-1",
			"pushes" : "1"
		},
		"IRETURN" : {
			"code" : "lip = $ip;ops--;if (this.accessFlags & FyConst.FY_ACC_SYNCHRONIZED) {if (this.accessFlags & FyConst.FY_ACC_STATIC) {thread.monitorExit(context.getClassObjectHandle(clazz));} else {thread.monitorExit(stack[sb]);}}stack[sb] = stack[sp - 1];thread.popFrame(1);return ops;",
			"pops" : "-1",
			"pushes" : "0"
		},
		"FRETURN" : {
			"code" : "lip = $ip;ops--;if (this.accessFlags & FyConst.FY_ACC_SYNCHRONIZED) {if (this.accessFlags & FyConst.FY_ACC_STATIC) {thread.monitorExit(context.getClassObjectHandle(clazz));} else {thread.monitorExit(stack[sb]);}}stack[sb] = stack[sp - 1];thread.popFrame(1);return ops;",
			"pops" : "-1",
			"pushes" : "0"
		},
		"ARETURN" : {
			"code" : "lip = $ip;ops--;if (this.accessFlags & FyConst.FY_ACC_SYNCHRONIZED) {if (this.accessFlags & FyConst.FY_ACC_STATIC) {thread.monitorExit(context.getClassObjectHandle(clazz));} else {thread.monitorExit(stack[sb]);}}stack[sb] = stack[sp - 1];thread.popFrame(1);return ops;",
			"pops" : "-1",
			"pushes" : "0"
		},
		"ARRAYLENGTH" : {
			"code" : "lip = $ip;ops--;stack[sp - 1] = heap.arrayLength(stack[sp - 1]);",
			"pops" : "-1",
			"pushes" : "1"
		},
		"ISTORE" : {
			"code" : "ops--;sp--;stack[sb + $1] = stack[sp];",
			"pops" : "-1",
			"pushes" : "0"
		},
		"FSTORE" : {
			"code" : "ops--;sp--;stack[sb + $1] = stack[sp];",
			"pops" : "-1",
			"pushes" : "0"
		},
		"ASTORE" : {
			"code" : "ops--;sp--;stack[sb + $1] = stack[sp];",
			"pops" : "-1",
			"pushes" : "0"
		},
		"ATHROW" : {
			"code" : "ops--;sp--;thread.currentThrowable = stack[sp];lip = $ip;ip = -1;break __fy_outer;",
			"pops" : "-1",
			"pushes" : "0"
		},
		"BALOAD" : {
			"code" : "lip = $ip;ops--;sp--;stack[sp - 1] = heap.getArrayByte(stack[sp - 1], stack[sp]);",
			"pops" : "-2",
			"pushes" : "1"
		},
		"BASTORE" : {
			"code" : "lip = $ip;ops--;sp -= 3;heap.putArrayByte(stack[sp], stack[sp + 1],stack[sp + 2] & 0xff);",
			"pops" : "-3",
			"pushes" : "0"
		},
		"BIPUSH" : {
			"code" : "ops--;stack[sp] = $1;sp++;",
			"pops" : "0",
			"pushes" : "1"
		},
		"CALOAD" : {
			"code" : "lip = $ip;ops--;sp--;stack[sp - 1] = heap.getArrayChar(stack[sp - 1], stack[sp]);",
			"pops" : "-2",
			"pushes" : "1"
		},
		"CASTORE" : {
			"code" : "lip = $ip;ops--;sp -= 3;heap.putArrayChar(stack[sp], stack[sp + 1],stack[sp + 2] & 0xff);",
			"pops" : "-3",
			"pushes" : "0"
		},
		"CHECKCAST" : {
			"code" : "lip = $ip;ops--;sp--;if (stack[sp] !== 0) {if (!context.classLoader.canCast(heap.getObject(stack[sp]).clazz, context.lookupClassFromConstant(constants[$1]))) {throw new FyException(FyConst.FY_EXCEPTION_CAST,\"Can't case \"+ heap.getObject(stack[sp]).clazz.name+ \" to \"+ context.lookupClassFromConstant(constants[$1]).name);}}",
			"pops" : "-1",
			"pushes" : "0"
		},
		"D2F" : {
			"code" : "ops--;sp--;stack[sp - 1] = FyPortable.floatToIeee32(FyPortable.ieee64ToDouble(stack, sp - 1));",
			"pops" : "-2",
			"pushes" : "1"
		},
		"D2I" : {
			"code" : "ops--;sp--;stack[sp - 1] = FyPortable.ieee64ToDouble(stack, sp - 1) >> 0;",
			"pops" : "-2",
			"pushes" : "1"
		},
		"D2L" : {
			"code" : "ops--;FyPortable.doubleToLong(FyPortable.ieee64ToDouble(stack,sp - 2), stack, sp - 2);",
			"pops" : "-2",
			"pushes" : "2"
		},
		"DADD" : {
			"code" : "ops--;sp -= 2;FyPortable.doubleToIeee64(FyPortable.ieee64ToDouble(stack,sp - 2)+ FyPortable.ieee64ToDouble(stack, sp), stack,sp - 2);",
			"pops" : "-4",
			"pushes" : "2"
		},
		"LALOAD" : {
			"code" : "lip = $ip;ops--;heap.getArrayRawLongTo(stack[sp - 2], stack[sp - 1], stack,sp - 2);",
			"pops" : "-2",
			"pushes" : "2"
		},
		"DALOAD" : {
			"code" : "lip = $ip;ops--;heap.getArrayRawLongTo(stack[sp - 2], stack[sp - 1], stack,sp - 2);",
			"pops" : "-2",
			"pushes" : "2"
		},
		"LASTORE" : {
			"code" : "lip = $ip;ops--;sp -= 4;heap.putArrayRawLongFrom(stack[sp], stack[sp + 1], stack,sp + 2);",
			"pops" : "-4",
			"pushes" : "0"
		},
		"DASTORE" : {
			"code" : "lip = $ip;ops--;sp -= 4;heap.putArrayRawLongFrom(stack[sp], stack[sp + 1], stack,sp + 2);",
			"pops" : "-4",
			"pushes" : "0"
		},
		"DCMPG" : {
			"code" : "ops--;sp -= 3;stack[sp - 1] = FyPortable.dcmpg(FyPortable.ieee64ToDouble(stack, sp - 1), FyPortable.ieee64ToDouble(stack,sp + 1));",
			"pops" : "-4",
			"pushes" : "1"
		},
		"DCMPL" : {
			"code" : "ops--;sp -= 3;stack[sp - 1] = FyPortable.dcmpl(FyPortable.ieee64ToDouble(stack, sp - 1), FyPortable.ieee64ToDouble(stack,sp + 1));",
			"pops" : "-4",
			"pushes" : "1"
		},
		"DCONST_0" : {
			"code" : "ops--;FyPortable.doubleToIeee64(0.0, stack, sp);sp += 2;",
			"pops" : "0",
			"pushes" : "2"
		},
		"DCONST_1" : {
			"code" : "ops--;FyPortable.doubleToIeee64(1.0, stack, sp);sp += 2;",
			"pops" : "0",
			"pushes" : "2"
		},
		"DDIV" : {
			"code" : "ops--;sp -= 2;FyPortable.doubleToIeee64(FyPortable.ieee64ToDouble(stack,sp - 2)\/ FyPortable.ieee64ToDouble(stack, sp), stack,sp - 2);",
			"pops" : "-4",
			"pushes" : "2"
		},
		"DMUL" : {
			"code" : "ops--;sp -= 2;FyPortable.doubleToIeee64(FyPortable.ieee64ToDouble(stack,sp - 2)* FyPortable.ieee64ToDouble(stack, sp), stack,sp - 2);",
			"pops" : "-4",
			"pushes" : "2"
		},
		"DNEG" : {
			"code" : "ops--;FyPortable.doubleToIeee64(-FyPortable.ieee64ToDouble(stack,sp - 2), stack, sp - 2);",
			"pops" : "-2",
			"pushes" : "2"
		},
		"DREM" : {
			"code" : "ops--;sp -= 2;FyPortable.doubleToIeee64(FyPortable.ieee64ToDouble(stack,sp - 2)% FyPortable.ieee64ToDouble(stack, sp), stack,sp - 2);",
			"pops" : "-4",
			"pushes" : "2"
		},
		"DRETURN" : {
			"code" : "lip = $ip;ops--;if (this.accessFlags & FyConst.FY_ACC_SYNCHRONIZED) {if (this.accessFlags & FyConst.FY_ACC_STATIC) {thread.monitorExit(context.getClassObjectHandle(clazz));} else {thread.monitorExit(stack[sb]);}}stack[sb] = stack[sp - 2];stack[sb + 1] = stack[sp - 1];thread.popFrame(2);return ops;",
			"pops" : "-2",
			"pushes" : "0"
		},
		"LRETURN" : {
			"code" : "lip = $ip;ops--;if (this.accessFlags & FyConst.FY_ACC_SYNCHRONIZED) {if (this.accessFlags & FyConst.FY_ACC_STATIC) {thread.monitorExit(context.getClassObjectHandle(clazz));} else {thread.monitorExit(stack[sb]);}}stack[sb] = stack[sp - 2];stack[sb + 1] = stack[sp - 1];thread.popFrame(2);return ops;",
			"pops" : "-2",
			"pushes" : "0"
		},
		"DSUB" : {
			"code" : "ops--;sp -= 2;FyPortable.doubleToIeee64(FyPortable.ieee64ToDouble(stack,sp - 2)- FyPortable.ieee64ToDouble(stack, sp), stack,sp - 2);",
			"pops" : "-4",
			"pushes" : "2"
		},
		"DUP" : {
			"code" : "ops--;stack[sp] = stack[sp - 1];sp++;",
			"pops" : "-1",
			"pushes" : "2"
		},
		"DUP_X1" : {
			"code" : "ops--;stack[sp] = stack[sp - 1];stack[sp - 1] = stack[sp - 2];stack[sp - 2] = stack[sp];sp++;",
			"pops" : "-2",
			"pushes" : "3"
		},
		"DUP_X2" : {
			"code" : "ops--;stack[sp] = stack[sp - 1];stack[sp - 1] = stack[sp - 2];stack[sp - 2] = stack[sp - 3];stack[sp - 3] = stack[sp];sp++;",
			"pops" : "-3",
			"pushes" : "4"
		},
		"DUP2" : {
			"code" : "ops--;stack[sp + 1] = stack[sp - 1];stack[sp] = stack[sp - 2];sp += 2;",
			"pops" : "-2",
			"pushes" : "4"
		},
		"DUP2_X1" : {
			"code" : "ops--;stack[sp + 1] = stack[sp - 1];stack[sp] = stack[sp - 2];stack[sp - 1] = stack[sp - 3];stack[sp - 2] = stack[sp + 1];stack[sp - 3] = stack[sp];sp += 2;",
			"pops" : "-3",
			"pushes" : "5"
		},
		"DUP2_X2" : {
			"code" : "ops--;stack[sp + 1] = stack[sp - 1];stack[sp] = stack[sp - 2];stack[sp - 1] = stack[sp - 3];stack[sp - 2] = stack[sp + 4];stack[sp - 3] = stack[sp + 1];stack[sp - 4] = stack[sp];sp += 2;",
			"pops" : "-4",
			"pushes" : "6"
		},
		"F2D" : {
			"code" : "ops--;FyPortable.doubleToIeee64(floatStack[sp - 1], stack, sp - 1);sp++;",
			"pops" : "-1",
			"pushes" : "2"
		},
		"F2I" : {
			"code" : "ops--;stack[sp - 1] = floatStack[sp - 1] | 0;",
			"pops" : "-1",
			"pushes" : "1"
		},
		"F2L" : {
			"code" : "ops--;FyPortable.doubleToLong(floatStack[sp - 1], stack, sp - 1);sp++;",
			"pops" : "-1",
			"pushes" : "2"
		},
		"FADD" : {
			"code" : "ops--;sp--;floatStack[sp - 1] += floatStack[sp];",
			"pops" : "-2",
			"pushes" : "1"
		},
		"FCMPG" : {
			"code" : "ops--;sp--;stack[sp - 1] = FyPortable.dcmpg(floatStack[sp - 1],floatStack[sp]);",
			"pops" : "-2",
			"pushes" : "1"
		},
		"FCMPL" : {
			"code" : "ops--;sp--;stack[sp - 1] = FyPortable.dcmpl(floatStack[sp - 1],floatStack[sp]);",
			"pops" : "-2",
			"pushes" : "1"
		},
		"FCONST_0" : {
			"code" : "ops--;floatStack[sp] = 0;sp++;",
			"pops" : "0",
			"pushes" : "1"
		},
		"FCONST_1" : {
			"code" : "ops--;floatStack[sp] = 1;sp++;",
			"pops" : "0",
			"pushes" : "1"
		},
		"FCONST_2" : {
			"code" : "ops--;floatStack[sp] = 2;sp++;",
			"pops" : "0",
			"pushes" : "1"
		},
		"FDIV" : {
			"code" : "ops--;sp--;floatStack[sp - 1] \/= floatStack[sp];",
			"pops" : "-2",
			"pushes" : "1"
		},
		"FMUL" : {
			"code" : "ops--;sp--;floatStack[sp - 1] *= floatStack[sp];",
			"pops" : "-2",
			"pushes" : "1"
		},
		"FNEG" : {
			"code" : "ops--;floatStack[sp - 1] = -floatStack[sp - 1];",
			"pops" : "-1",
			"pushes" : "1"
		},
		"FREM" : {
			"code" : "ops--;sp--;floatStack[sp - 1] %= floatStack[sp];",
			"pops" : "-2",
			"pushes" : "1"
		},
		"FSUB" : {
			"code" : "ops--;sp--;floatStack[sp - 1] -= floatStack[sp];",
			"pops" : "-2",
			"pushes" : "1"
		},
		"GETFIELD" : {
			"code" : "lip = $ip;ops--;tmpField = context.lookupFieldVirtualFromConstant(constants[$1]);if (tmpField.accessFlags & FyConst.FY_ACC_STATIC) {throw new FyException(FyConst.FY_EXCEPTION_INCOMPAT_CHANGE, \"Field \"+ tmpField.uniqueName + \" is static\");}switch (tmpField.descriptor.charCodeAt(0)) {case FyConst.D:case FyConst.J:heap.getFieldRawLongTo(stack[sp - 1], tmpField.posAbs,stack, sp - 1);sp++;break;default:stack[sp - 1] = heap.getFieldRaw(stack[sp - 1],tmpField.posAbs);break;}",
			"pops" : "-1",
			"pushes" : "X-GETFIELD"
		},
		"GETSTATIC" : {
			"code" : "lip = $ip;ops--;tmpField = context.lookupFieldVirtualFromConstant(constants[$1]);if (!(tmpField.accessFlags & FyConst.FY_ACC_STATIC)) {throw new FyException(FyConst.FY_EXCEPTION_INCOMPAT_CHANGE, \"Field \"+ tmpField.uniqueName+ \" is not static\");}clinitClass = thread.clinit(tmpField.owner);if (clinitClass !== undefined) {if (clinitClass.clinitThreadId == 0) {clinitClass.clinitThreadId = thread.threadId;thread.localToFrame(sp, $ip, $ip);thread.pushFrame(clinitClass.clinit);return ops;} else {ops = 0;ip = $ip;break __fy_outer;}}switch (tmpField.descriptor.charCodeAt(0)) {case FyConst.D:case FyConst.J:heap.getStaticRawLongTo(tmpField.owner,tmpField.posAbs, stack, sp);sp += 2;break;default:stack[sp] = heap.getStaticRaw(tmpField.owner,tmpField.posAbs);sp++;break;}",
			"pops" : "0",
			"pushes" : "X-GETSTATIC"
		},
		"GOTO" : {
			"code" : "ops--;ip = $1;break __fy_inner;",
			"pops" : "0",
			"pushes" : "0"
		},
		"I2B" : {
			"code" : "ops--;stack[sp - 1] &= 0xff;",
			"pops" : "-1",
			"pushes" : "1"
		},
		"I2C" : {
			"code" : "ops--;stack[sp - 1] &= 0xffff;",
			"pops" : "-1",
			"pushes" : "1"
		},
		"I2D" : {
			"code" : "ops--;FyPortable.doubleToIeee64(stack[sp - 1], stack, sp - 1);sp++;",
			"pops" : "-1",
			"pushes" : "2"
		},
		"I2F" : {
			"code" : "ops--;stack[sp - 1] = FyPortable.floatToIeee32(stack[sp - 1]);",
			"pops" : "-1",
			"pushes" : "1"
		},
		"I2L" : {
			"code" : "ops--;stack[sp] = stack[sp - 1];stack[sp - 1] = stack[sp] >= 0 ? (0 | 0) : (-1 | 0);sp++;",
			"pops" : "-1",
			"pushes" : "2"
		},
		"I2S" : {
			"code" : "ops--;stack[sp - 1] = stack[sp - 1] << 16 >> 16;",
			"pops" : "-1",
			"pushes" : "1"
		},
		"IADD" : {
			"code" : "ops--;sp--;stack[sp - 1] += stack[sp];",
			"pops" : "-2",
			"pushes" : "1"
		},
		"IAND" : {
			"code" : "ops--;sp--;stack[sp - 1] &= stack[sp];",
			"pops" : "-2",
			"pushes" : "1"
		},
		"ICONST_M1" : {
			"code" : "ops--;stack[sp] = -1;sp++;",
			"pops" : "0",
			"pushes" : "1"
		},
		"ICONST_0" : {
			"code" : "ops--;stack[sp] = 0;sp++;",
			"pops" : "0",
			"pushes" : "1"
		},
		"ICONST_1" : {
			"code" : "ops--;stack[sp] = 1;sp++;",
			"pops" : "0",
			"pushes" : "1"
		},
		"ICONST_2" : {
			"code" : "ops--;stack[sp] = 2;sp++;",
			"pops" : "0",
			"pushes" : "1"
		},
		"ICONST_3" : {
			"code" : "ops--;stack[sp] = 3;sp++;",
			"pops" : "0",
			"pushes" : "1"
		},
		"ICONST_4" : {
			"code" : "ops--;stack[sp] = 4;sp++;",
			"pops" : "0",
			"pushes" : "1"
		},
		"ICONST_5" : {
			"code" : "ops--;stack[sp] = 5;sp++;",
			"pops" : "0",
			"pushes" : "1"
		},
		"IDIV" : {
			"code" : "ops--;sp--;if (stack[sp] === 0) {lip = $ip;throw new FyException(FyConst.FY_EXCEPTION_ARITHMETIC,\"Devided by zero!\");}stack[sp - 1] = (stack[sp - 1] \/ stack[sp]) | 0;",
			"pops" : "-2",
			"pushes" : "1"
		},
		"IF_ICMPEQ" : {
			"code" : "ops--;sp -= 2;if (stack[sp] === stack[sp + 1]) {ip = $1;break __fy_inner;}",
			"pops" : "-2",
			"pushes" : "0"
		},
		"IF_ACMPEQ" : {
			"code" : "ops--;sp -= 2;if (stack[sp] === stack[sp + 1]) {ip = $1;break __fy_inner;}",
			"pops" : "-2",
			"pushes" : "0"
		},
		"IF_ICMPNE" : {
			"code" : "ops--;sp -= 2;if (stack[sp] !== stack[sp + 1]) {ip = $1;break __fy_inner;}",
			"pops" : "-2",
			"pushes" : "0"
		},
		"IF_ACMPNE" : {
			"code" : "ops--;sp -= 2;if (stack[sp] !== stack[sp + 1]) {ip = $1;break __fy_inner;}",
			"pops" : "-2",
			"pushes" : "0"
		},
		"IF_ICMPLT" : {
			"code" : "ops--;sp -= 2;if (stack[sp] < stack[sp + 1]) {ip = $1;break __fy_inner;}",
			"pops" : "-2",
			"pushes" : "0"
		},
		"IF_ICMPLE" : {
			"code" : "ops--;sp -= 2;if (stack[sp] <= stack[sp + 1]) {ip = $1;break __fy_inner;}",
			"pops" : "-2",
			"pushes" : "0"
		},
		"IF_ICMPGT" : {
			"code" : "ops--;sp -= 2;if (stack[sp] > stack[sp + 1]) {ip = $1;break __fy_inner;}",
			"pops" : "-2",
			"pushes" : "0"
		},
		"IF_ICMPGE" : {
			"code" : "ops--;sp -= 2;if (stack[sp] >= stack[sp + 1]) {ip = $1;break __fy_inner;}",
			"pops" : "-2",
			"pushes" : "0"
		},
		"IFEQ" : {
			"code" : "ops--;sp--;if (stack[sp] === 0) {ip = $1;break __fy_inner;}",
			"pops" : "-1",
			"pushes" : "0"
		},
		"IFNULL" : {
			"code" : "ops--;sp--;if (stack[sp] === 0) {ip = $1;break __fy_inner;}",
			"pops" : "-1",
			"pushes" : "0"
		},
		"IFNE" : {
			"code" : "ops--;sp--;if (stack[sp] !== 0) {ip = $1;break __fy_inner;}",
			"pops" : "-1",
			"pushes" : "0"
		},
		"IFNONNULL" : {
			"code" : "ops--;sp--;if (stack[sp] !== 0) {ip = $1;break __fy_inner;}case 122:ops--;sp--;if (stack[sp] < 0) {ip = $1;break __fy_inner;}",
			"pops" : "-1",
			"pushes" : "0"
		},
		"IFLE" : {
			"code" : "ops--;sp--;if (stack[sp] <= 0) {ip = $1;break __fy_inner;}",
			"pops" : "-1",
			"pushes" : "0"
		},
		"IFGT" : {
			"code" : "ops--;sp--;if (stack[sp] > 0) {ip = $1;break __fy_inner;}",
			"pops" : "-1",
			"pushes" : "0"
		},
		"IFGE" : {
			"code" : "ops--;sp--;if (stack[sp] >= 0) {ip = $1;break __fy_inner;}",
			"pops" : "-1",
			"pushes" : "0"
		},
		"IINC" : {
			"code" : "ops--;stack[sb + $1] += $2;",
			"pops" : "0",
			"pushes" : "0"
		},
		"IMUL" : {
			"code" : "ops--;sp -= 1;stack[sp - 1] = Math.imul(stack[sp - 1], stack[sp]);",
			"pops" : "-2",
			"pushes" : "1"
		},
		"INEG" : {
			"code" : "ops--;stack[sp - 1] *= -1;",
			"pops" : "-1",
			"pushes" : "1"
		},
		"INSTANCEOF" : {
			"code" : "lip = $ip;ops--;if (stack[sp - 1] !== 0) {stack[sp - 1] = context.classLoader.canCast(heap.getObject(stack[sp - 1]).clazz, context.lookupClassFromConstant(constants[$1]));}",
			"pops" : "-1",
			"pushes" : "1"
		},
		"INVOKESPECIAL" : {
			"code" : "lip = $ip;ops--;tmpMethod = context.lookupMethodVirtualFromConstant(constants[$1]);sp -= tmpMethod.paramStackUsage + 1;tmpClass = tmpMethod.owner;if ((clazz.accessFlags & FyConst.FY_ACC_SUPER)&& context.classLoader.isSuperClassOf(tmpClass,clazz)&& tmpMethod.name === FyConst.FY_METHOD_INIT) {tmpMethod = context.lookupMethodVirtualByMethod(clazz.superClass, tmpMethod);}if (tmpMethod === undefined) {throw new FyException(FyConst.FY_EXCEPTION_ABSTRACT, \"\");}if (tmpMethod.name !== FyConst.FY_METHOD_INIT&& tmpMethod.owner !== tmpClass) {throw new FyException(FyConst.FY_EXCEPTION_NO_METHOD,tmpMethod.uniqueName);}if (tmpMethod.accessFlags & FyConst.FY_ACC_STATIC) {throw new FyException(FyConst.FY_EXCEPTION_INCOMPAT_CHANGE,tmpMethod.uniqueName);}if (tmpMethod.accessFlags & FyConst.FY_ACC_ABSTRACT) {throw new FyException(FyConst.FY_EXCEPTION_ABSTRACT,tmpMethod.uniqueName);}thread.localToFrame(sp, $ip, $ip + 1);thread.pushMethod(tmpMethod);return ops;",
			"pops" : "X-INVOKESPECIAL",
			"pushes" : "0"
		},
		"INVOKESTATIC" : {
			"code" : "lip = $ip;ops--;tmpMethod = context.lookupMethodVirtualFromConstant(constants[$1]);sp -= tmpMethod.paramStackUsage;if (!(tmpMethod.accessFlags & FyConst.FY_ACC_STATIC)) {throw new FyException(FyConst.FY_EXCEPTION_INCOMPAT_CHANGE,tmpMethod.uniqueName + \" is not static\");}console.log(\"clinit: \" + tmpMethod.owner);clinitClass = thread.clinit(tmpMethod.owner);console.log(\"result: \" + clinitClass);if (clinitClass !== undefined) {if (clinitClass.clinitThreadId == 0) {clinitClass.clinitThreadId = thread.threadId;thread.localToFrame(sp, $ip, $ip);thread.pushFrame(clinitClass.clinit);return ops;} else {ops = 0;ip = $ip;break __fy_outer;}}thread.localToFrame(sp, $ip, $ip + 1);thread.pushMethod(tmpMethod);return ops;",
			"pops" : "X-INVOKESTATIC",
			"pushes" : "0"
		},
		"INVOKEINTERFACE" : {
			"code" : "lip = $ip;ops--;tmpMethod = context.lookupMethodVirtualFromConstant(constants[$1]);sp -= tmpMethod.paramStackUsage + 1;if ((tmpMethod.accessFlags & FyConst.FY_ACC_STATIC)) {throw new FyException(FyConst.FY_EXCEPTION_INCOMPAT_CHANGE,tmpMethod.uniqueName + \" is static\");}if (stack[sp] === 0) {throw new FyException(FyConst.FY_EXCEPTION_NPT,\"FATAL ERROR HERE!!\");}if (!(tmpMethod.accessFlags & FyConst.FY_ACC_FINAL)) {tmpClass = heap.getObject(stack[sp]).clazz;tmpMethod = context.lookupMethodVirtualByMethod(clazz,tmpMethod);}thread.localToFrame(sp, $ip, $ip + 1);thread.pushMethod(tmpMethod);return ops;",
			"pops" : "X-INVOKEVIRTUAL",
			"pushes" : "0"
		},
		"INVOKEVIRTUAL" : {
			"code" : "lip = $ip;ops--;tmpMethod = context.lookupMethodVirtualFromConstant(constants[$1]);sp -= tmpMethod.paramStackUsage + 1;if ((tmpMethod.accessFlags & FyConst.FY_ACC_STATIC)) {throw new FyException(FyConst.FY_EXCEPTION_INCOMPAT_CHANGE,tmpMethod.uniqueName + \" is static\");}if (stack[sp] === 0) {throw new FyException(FyConst.FY_EXCEPTION_NPT,\"FATAL ERROR HERE!!\");}if (!(tmpMethod.accessFlags & FyConst.FY_ACC_FINAL)) {tmpClass = heap.getObject(stack[sp]).clazz;tmpMethod = context.lookupMethodVirtualByMethod(clazz,tmpMethod);}thread.localToFrame(sp, $ip, $ip + 1);thread.pushMethod(tmpMethod);return ops;",
			"pops" : "X-INVOKEVIRTUAL",
			"pushes" : "0"
		},
		"IOR" : {
			"code" : "ops--;sp--;stack[sp - 1] |= stack[sp];",
			"pops" : "-2",
			"pushes" : "1"
		},
		"IREM" : {
			"code" : "lip = $ip;ops--;sp--;if (stack[sp] === 0) {throw new FyException(FyConst.FY_EXCEPTION_ARITHMETIC,\"Devided by zero\");}stack[sp - 1] %= stack[sp];",
			"pops" : "-2",
			"pushes" : "1"
		},
		"ISHL" : {
			"code" : "ops--;sp--;stack[sp - 1] <<= stack[sp];",
			"pops" : "-2",
			"pushes" : "1"
		},
		"ISHR" : {
			"code" : "ops--;sp--;stack[sp - 1] >>= stack[sp];",
			"pops" : "-2",
			"pushes" : "1"
		},
		"ISUB" : {
			"code" : "ops--;sp--;stack[sp - 1] -= stack[sp];",
			"pops" : "-2",
			"pushes" : "1"
		},
		"IUSHR" : {
			"code" : "ops--;sp--;stack[sp - 1] >>>= stack[sp];",
			"pops" : "-2",
			"pushes" : "1"
		},
		"IXOR" : {
			"code" : "ops--;sp--;stack[sp - 1] >>>= stack[sp];",
			"pops" : "-2",
			"pushes" : "1"
		},
		"L2D" : {
			"code" : "ops--;FyPortable.doubleToIeee64(stack[sp - 2] * 4294967296.0+ stack[sp - 1], stack, sp - 2);",
			"pops" : "-2",
			"pushes" : "2"
		},
		"L2F" : {
			"code" : "ops--;sp--;stack[sp - 1] = FyPortable.floatToIeee32(stack[sp - 2]* 4294967296.0 + stack[sp - 1]);",
			"pops" : "-2",
			"pushes" : "1"
		},
		"L2I" : {
			"code" : "ops--;sp--;stack[sp - 1] = stack[sp];",
			"pops" : "-2",
			"pushes" : "1"
		},
		"LADD" : {
			"code" : "ops--;sp -= 2;longOps.add(sp + 16 - 2, sp + 16);",
			"pops" : "-4",
			"pushes" : "2"
		},
		"LAND" : {
			"code" : "ops--;sp -= 2;stack[sp - 2] &= stack[sp];stack[sp - 1] &= stack[sp + 1];",
			"pops" : "-4",
			"pushes" : "2"
		},
		"LCMP" : {
			"code" : "ops--;sp -= 3;longOps.cmp(sp + 15, sp + 17);",
			"pops" : "-4",
			"pushes" : "1"
		},
		"LCONST_0" : {
			"code" : "ops--;stack[sp] = 0;stack[sp + 1] = 0;sp += 2;",
			"pops" : "0",
			"pushes" : "2"
		},
		"LCONST_1" : {
			"code" : "ops--;stack[sp] = 0;stack[sp + 1] = 1;sp += 2;",
			"pops" : "0",
			"pushes" : "2"
		},
		"LDC" : {
			"code" : "ops--;switch ($2) {case 0:stack[sp] = constants[$1].value;sp++;break;case 1:stack[sp] = constants[$1].value[0];stack[sp + 1] = constants[$1].value[1];sp += 2;break;case 2:lip = $ip;stack[sp] = heap.literalWithConstant(constants[$1]);sp++;break;case 3:lip = $ip;stack[sp] = context.getClassObjectHandle(context.lookupClassFromConstant(constants[$1]));sp++;break;}",
			"pops" : "0",
			"pushes" : "X-LDC"
		},
		"LDIV" : {
			"code" : "ops--;sp -= 2;if (stack[sp] === 0 && stack[sp + 1] === 0) {lip = $ip;throw new FyException(FyConst.FY_EXCEPTION_ARITHMETIC,\"Devided by zero!\");}longOps.div(sp + 14, sp + 16);",
			"pops" : "-4",
			"pushes" : "2"
		},
		"DLOAD" : {
			"code" : "ops--;stack[sp] = stack[sb + $1];stack[sp + 1] = stack[sb + $1 + 1];sp += 2;",
			"pops" : "0",
			"pushes" : "2"
		},
		"LLOAD" : {
			"code" : "ops--;stack[sp] = stack[sb + $1];stack[sp + 1] = stack[sb + $1 + 1];sp += 2;",
			"pops" : "0",
			"pushes" : "2"
		},
		"LMUL" : {
			"code" : "ops--;sp -= 2;longOps.mul(sp + 14, sp + 16);",
			"pops" : "-4",
			"pushes" : "2"
		},
		"LNEG" : {
			"code" : "ops--;longOps.neg(sp + 14);",
			"pops" : "-2",
			"pushes" : "2"
		},
		"LOOKUPSWITCH" : {
			"code" : "ops--;sp--;var lookupSwitchTarget = this.lookupSwitchTargets[$1];tmpInt1 = ((lookupSwitchTarget.targets[stack[sp]] + 1) | 0) - 1;if (tmpInt1 === -1) {ip = lookupSwitchTarget.dflt;break __fy_inner;} else {ip = tmpInt1;break __fy_inner;}",
			"pops" : "-1",
			"pushes" : "0"
		},
		"LOR" : {
			"code" : "ops--;sp -= 2;stack[sp - 2] |= stack[sp];stack[sp - 1] |= stack[sp + 1];",
			"pops" : "-4",
			"pushes" : "2"
		},
		"LREM" : {
			"code" : "ops--;sp -= 2;longOps.rem(sp + 14, sp + 16);",
			"pops" : "-4",
			"pushes" : "2"
		},
		"LSHL" : {
			"code" : "ops--;sp--;longOps.shl(sp + 14, stack[sp]);",
			"pops" : "-3",
			"pushes" : "2"
		},
		"LSHR" : {
			"code" : "ops--;sp--;longOps.shr(sp + 14, stack[sp]);",
			"pops" : "-3",
			"pushes" : "2"
		},
		"LUSHR" : {
			"code" : "ops--;sp--;longOps.ushr(sp + 14, stack[sp]);",
			"pops" : "-3",
			"pushes" : "2"
		},
		"DSTORE" : {
			"code" : "ops--;sp -= 2;stack[sb + $1] = stack[sp];stack[sb + $1 + 1] = stack[sp + 1];",
			"pops" : "-2",
			"pushes" : "0"
		},
		"OP-LSTORE" : {
			"code" : "ops--;sp -= 2;stack[sb + $1] = stack[sp];stack[sb + $1 + 1] = stack[sp + 1];",
			"pops" : "-2",
			"pushes" : "0"
		},
		"LSUB" : {
			"code" : "ops--;sp -= 2;longOps.sub(sp + 14, sp + 16);",
			"pops" : "-4",
			"pushes" : "2"
		},
		"LXOR" : {
			"code" : "ops--;sp -= 2;stack[sp - 2] ^= stack[sp];stack[sp - 1] ^= stack[sp + 1];",
			"pops" : "-4",
			"pushes" : "2"
		},
		"MONITORENTER" : {
			"code" : "ops--;sp--;if (thread.monitorEnter(stack[sp])) {ip = $ip;ops = 0;break __fy_outer;}",
			"pops" : "-1",
			"pushes" : "0"
		},
		"MONITOREXIT" : {
			"code" : "ops--;sp--;thread.monitorExit(stack[sp]);",
			"pops" : "-1",
			"pushes" : "0"
		},
		"MULTIANEWARRAY" : {
			"code" : "ops--;sp -= $2;lip = $ip;stack[sp] = heap.multiNewArray(context.lookupClassFromConstant(constants[$1]), $2, sp);sp++;",
			"pops" : "X-MULTIANEWARRAY",
			"pushes" : "1"
		},
		"NEW" : {
			"code" : "ops--;lip = $ip;tmpClass = context.lookupClassFromConstant(constants[$1]);if (tmpClass.accessFlags& (FyConst.FY_ACC_INTERFACE | FyConst.FY_ACC_ABSTRACT)) {throw new FyException(FyConst.FY_EXCEPTION_ABSTRACT,tmpClass.name);}clinitClass = thread.clinit(tmpClass);if (clinitClass !== undefined) {if (clinitClass.clinitThreadId == 0) {clinitClass.clinitThreadId = thread.threadId;thread.localToFrame(sp, $ip, $ip);thread.pushFrame(clinitClass.clinit);return ops;} else {ops = 0;ip = $ip;break __fy_outer;}}stack[sp] = heap.allocate(tmpClass);sp++;",
			"pops" : "0",
			"pushes" : "1"
		},
		"NEWARRAY" : {
			"code" : "switch ($1) {case 4:stack[sp - 1] = heap.allocateArray(context.lookupClass(\"[Z\"), stack[sp - 1]);break;case 5:stack[sp - 1] = heap.allocateArray(context.lookupClass(\"[C\"), stack[sp - 1]);break;case 6:stack[sp - 1] = heap.allocateArray(context.lookupClass(\"[F\"), stack[sp - 1]);break;case 7:stack[sp - 1] = heap.allocateArray(context.lookupClass(\"[D\"), stack[sp - 1]);break;case 8:stack[sp - 1] = heap.allocateArray(context.lookupClass(\"[B\"), stack[sp - 1]);break;case 9:stack[sp - 1] = heap.allocateArray(context.lookupClass(\"[S\"), stack[sp - 1]);break;case 10:stack[sp - 1] = heap.allocateArray(context.lookupClass(\"[I\"), stack[sp - 1]);break;case 11:stack[sp - 1] = heap.allocateArray(context.lookupClass(\"[J\"), stack[sp - 1]);break;default:throw new FyException(FyConst.FY_EXCEPTION_VM,\"Unknown array type in NEWARRAY: $1\");}",
			"pops" : "-1",
			"pushes" : "1"
		},
		"NOP" : {
			"code" : "",
			"pops" : "0",
			"pushes" : "0"
		},
		"POP" : {
			"code" : "sp--;",
			"pops" : "-1",
			"pushes" : "0"
		},
		"POP2" : {
			"code" : "sp--;sp--;",
			"pops" : "-2",
			"pushes" : "0"
		},
		"PUTFIELD" : {
			"code" : "lip = $ip;ops--;tmpField = context.lookupFieldVirtualFromConstant(constants[$1]);if (tmpField.accessFlags & FyConst.FY_ACC_STATIC) {throw new FyException(FyConst.FY_EXCEPTION_INCOMPAT_CHANGE, \"Field \"+ tmpField.uniqueName + \" is static\");}if ((tmpField.accessFlags & FyConst.FY_ACC_FINAL)&& (method.owner != tmpField.owner)) {throw new FyException(FyConst.FY_EXCEPTION_ACCESS,\"Field \" + tmpField.uniqueName + \" is final\");}switch (tmpField.descriptor.charCodeAt(0)) {case FyConst.D:case FyConst.J:sp -= 3;heap.putFieldRawLongFrom(stack[sp], tmpField.posAbs,stack, sp + 1);break;default:sp -= 2;heap.putFieldRaw(stack[sp], tmpField.posAbs, stack[sp]);break;}",
			"pops" : "X-PUTFIELD",
			"pushes" : "0"
		},
		"PUTSTATIC" : {
			"code" : "lip = $ip;ops--;tmpField = context.lookupFieldVirtualFromConstant(constants[$1]);if (tmpField.accessFlags & FyConst.FY_ACC_STATIC == 0) {throw new FyException(FyConst.FY_EXCEPTION_INCOMPAT_CHANGE, \"Field \"+ tmpField.uniqueName+ \" is not static\");}if ((tmpField.accessFlags & FyConst.FY_ACC_FINAL)&& (method.owner != tmpField.owner)) {throw new FyException(FyConst.FY_EXCEPTION_ACCESS,\"Field \" + tmpField.uniqueName + \" is final\");}clinitClass = thread.clinit(tmpField.owner);if (clinitClass !== undefined) {if (clinitClass.clinitThreadId == 0) {clinitClass.clinitThreadId = thread.threadId;thread.localToFrame(sp, $ip, $ip);thread.pushFrame(clinitClass.clinit);return ops;} else {ops = 0;ip = $ip;break __fy_outer;}}switch (tmpField.descriptor.charCodeAt(0)) {case FyConst.D:case FyConst.J:sp -= 2;heap.putStaticRawLongFrom(tmpField.owner,tmpField.posAbs, stack, sp);break;default:sp--;heap.putStaticRaw(tmpField.owner, tmpField.posAbs,stack[sp]);break;}",
			"pops" : "X-PUTSTATIC",
			"pushes" : "0"
		},
		"RETURN" : {
			"code" : "lip = $ip;ops--;if (this.accessFlags & FyConst.FY_ACC_SYNCHRONIZED) {if (this.accessFlags & FyConst.FY_ACC_STATIC) {thread.monitorExit(context.getClassObjectHandle(clazz));} else {thread.monitorExit(stack[sb]);}}if (this.accessFlags & FyConst.FY_ACC_CLINIT) {clazz.clinitThreadId = -1;}thread.popFrame();return ops;",
			"pops" : "0",
			"pushes" : "0"
		},
		"SALOAD" : {
			"code" : "lip = $ip;ops--;sp--;stack[sp - 1] = heap.getArrayShort(stack[sp - 1], stack[sp]);",
			"pops" : "-2",
			"pushes" : "1"
		},
		"SASTORE" : {
			"code" : "lip = $ip;ops--;sp -= 3;heap.putArrayShort(stack[sp], stack[sp + 1], stack[sp + 2]);",
			"pops" : "-3",
			"pushes" : "0"
		},
		"SIPUSH" : {
			"code" : "ops--;stack[sp] = $1;sp++;",
			"pops" : "0",
			"pushes" : "1"
		},
		"SWAP" : {
			"code" : "ops--;tmpInt1 = stack[sp - 1];stack[sp - 1] = stack[sp - 2];stack[sp - 2] = tmpInt1;",
			"pops" : "-2",
			"pushes" : "2"
		},
		"TABLESWITCH" : {
			"code" : "ops--;sp--;var tableSwitchTarget = this.tableSwitchTargets[$1];if (stack[sp] < tableSwitchTarget.min|| stack[sp] > tableSwitchTarget.max) {ip = tableSwitchTarget.dflt;break __fy_inner;} else {ip = tableSwitchTarget.targets[stack[sp]- tableSwitchTarget.min];break __fy_inner;}",
			"pops" : "-1",
			"pushes" : "0"
		}
	},
	"macros" : {
		"HEADER" : "var clazz = this.owner;var heap = context.heap;var longOps = thread.longOps;var constants = clazz.constants;var stack = thread.stack;var floatStack = thread.floatStack;var ip = thread.getCurrentIp() | 0;var lip = 0 | 0;var sp = thread.sp | 0;var sb = thread.getCurrentStackBase() | 0;var tmpField;var tmpClass;var clinitClass;var tmpMethod;var tmpInt1 = 0 | 0;__fy_outer: while (true) {try {__fy_inner: switch (ip) {",
		"CLINIT" : "clinitClass = thread.clinit(this.owner.superClass);if (clinitClass !== undefined) {if (clinitClass.clinitThreadId == 0) {clinitClass.clinitThreadId = thread.threadId;thread.localToFrame(sp, $ip, $ip);thread.pushFrame(clinitClass.clinit);return ops;} else {ops = 0;ip = $ip;break __fy_outer;}}",
		"OPS" : "if (ops < 0) {lip = $ip;ip = $ip;break __fy_outer;}",
		"TAIL" : "default:throw new FyException(undefined, \"IP out of sync at \"+ this.uniqueName + \".\" + ip);}} catch (e) {if (e instanceof FyException) {(function() {if (!e.clazz) {context.panic(e.toString());throw e;}try {console.log(1);var exceptionClass = context.lookupClass(e.clazz);console.log(2);if (!context.classLoader.canCast(exceptionClass,context.TOP_THROWABLE)) {throw new FyException(undefined, \"Exception \"+ e.clazz + \" is not a \"+ context.TOP_THROWABLE);}console.log(3);var detailMessageField = context.getField(FyConst.FY_BASE_THROWABLE+ \".detailMessage.L\"+ FyConst.FY_BASE_STRING);console.log(4);thread.currentThrowable = heap.allocate(context.lookupClass(e.clazz));console.log(5);heap.putFieldString(thread.currentThrowable,detailMessageField, e.message);console.log(6);thread.fillStackTrace(thread.currentThrowable,false);console.log(7);} catch (ee) {context.panic(\"Exception occored while processing exception: \"+ e, ee);throw ee;}})();break __fy_outer;} else {context.panic(\"Exception occored while executing thread #\"+ thread.threadId);throw e;}}}thread.localToFrame(sp, lip, ip);return ops;"
	}
});
