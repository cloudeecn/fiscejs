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

// instructions table
/**
 * @dict {number}
 */
var $ACMD = {
  "NOP": 0x00,
  "ACONST_NULL": 0x01,
  "ICONST_M1": 0x02,
  "ICONST_0": 0x03,
  "ICONST_1": 0x04,
  "ICONST_2": 0x05,
  "ICONST_3": 0x06,
  "ICONST_4": 0x07,

  "ICONST_5": 0x08,
  "LCONST_0": 0x09,
  "LCONST_1": 0x0A,
  "FCONST_0": 0x0B,
  "FCONST_1": 0x0C,
  "FCONST_2": 0x0D,
  "DCONST_0": 0x0E,
  "DCONST_1": 0x0F,

  "BIPUSH": 0x10,
  "SIPUSH": 0x11,
  "LDC": 0x12,
  "LDC_W": 0x13,
  "LDC2_W": 0x14,
  "ILOAD": 0x15,
  "LLOAD": 0x16,
  "FLOAD": 0x17,

  "DLOAD": 0x18,
  "ALOAD": 0x19,
  "ILOAD_0": 0x1A,
  "ILOAD_1": 0x1B,
  "ILOAD_2": 0x1C,
  "ILOAD_3": 0x1D,
  "LLOAD_0": 0x1E,
  "LLOAD_1": 0x1F,

  "LLOAD_2": 0x20,
  "LLOAD_3": 0x21,
  "FLOAD_0": 0x22,
  "FLOAD_1": 0x23,
  "FLOAD_2": 0x24,
  "FLOAD_3": 0x25,
  "DLOAD_0": 0x26,
  "DLOAD_1": 0x27,

  "DLOAD_2": 0x28,
  "DLOAD_3": 0x29,
  "ALOAD_0": 0x2A,
  "ALOAD_1": 0x2B,
  "ALOAD_2": 0x2C,
  "ALOAD_3": 0x2D,
  "IALOAD": 0x2E,
  "LALOAD": 0x2F,

  "FALOAD": 0x30,
  "DALOAD": 0x31,
  "AALOAD": 0x32,
  "BALOAD": 0x33,
  "CALOAD": 0x34,
  "SALOAD": 0x35,
  "ISTORE": 0x36,
  "LSTORE": 0x37,

  "FSTORE": 0x38,
  "DSTORE": 0x39,
  "ASTORE": 0x3A,
  "ISTORE_0": 0x3B,
  "ISTORE_1": 0x3C,
  "ISTORE_2": 0x3D,
  "ISTORE_3": 0x3E,
  "LSTORE_0": 0x3F,

  "LSTORE_1": 0x40,
  "LSTORE_2": 0x41,
  "LSTORE_3": 0x42,
  "FSTORE_0": 0x43,
  "FSTORE_1": 0x44,
  "FSTORE_2": 0x45,
  "FSTORE_3": 0x46,
  "DSTORE_0": 0x47,

  "DSTORE_1": 0x48,
  "DSTORE_2": 0x49,
  "DSTORE_3": 0x4A,
  "ASTORE_0": 0x4B,
  "ASTORE_1": 0x4C,
  "ASTORE_2": 0x4D,
  "ASTORE_3": 0x4E,
  "IASTORE": 0x4F,

  "LASTORE": 0x50,
  "FASTORE": 0x51,
  "DASTORE": 0x52,
  "AASTORE": 0x53,
  "BASTORE": 0x54,
  "CASTORE": 0x55,
  "SASTORE": 0x56,
  "POP": 0x57,

  "POP2": 0x58,
  "DUP": 0x59,
  "DUP_X1": 0x5A,
  "DUP_X2": 0x5B,
  "DUP2": 0x5C,
  "DUP2_X1": 0x5D,
  "DUP2_X2": 0x5E,
  "SWAP": 0x5F,

  "IADD": 0x60,
  "LADD": 0x61,
  "FADD": 0x62,
  "DADD": 0x63,
  "ISUB": 0x64,
  "LSUB": 0x65,
  "FSUB": 0x66,
  "DSUB": 0x67,

  "IMUL": 0x68,
  "LMUL": 0x69,
  "FMUL": 0x6A,
  "DMUL": 0x6B,
  "IDIV": 0x6C,
  "LDIV": 0x6D,
  "FDIV": 0x6E,
  "DDIV": 0x6F,

  "IREM": 0x70,
  "LREM": 0x71,
  "FREM": 0x72,
  "DREM": 0x73,
  "INEG": 0x74,
  "LNEG": 0x75,
  "FNEG": 0x76,
  "DNEG": 0x77,

  "ISHL": 0x78,
  "LSHL": 0x79,
  "ISHR": 0x7A,
  "LSHR": 0x7B,
  "IUSHR": 0x7C,
  "LUSHR": 0x7D,
  "IAND": 0x7E,
  "LAND": 0x7F,

  "IOR": 0x80,
  "LOR": 0x81,
  "IXOR": 0x82,
  "LXOR": 0x83,
  "IINC": 0x84,
  "I2L": 0x85,
  "I2F": 0x86,
  "I2D": 0x87,

  "L2I": 0x88,
  "L2F": 0x89,
  "L2D": 0x8A,
  "F2I": 0x8B,
  "F2L": 0x8C,
  "F2D": 0x8D,
  "D2I": 0x8E,
  "D2L": 0x8F,

  "D2F": 0x90,
  "I2B": 0x91,
  "I2C": 0x92,
  "I2S": 0x93,
  "LCMP": 0x94,
  "FCMPL": 0x95,
  "FCMPG": 0x96,
  "DCMPL": 0x97,

  "DCMPG": 0x98,
  "IFEQ": 0x99,
  "IFNE": 0x9A,
  "IFLT": 0x9B,
  "IFGE": 0x9C,
  "IFGT": 0x9D,
  "IFLE": 0x9E,
  "IF_ICMPEQ": 0x9F,

  "IF_ICMPNE": 0xA0,
  "IF_ICMPLT": 0xA1,
  "IF_ICMPGE": 0xA2,
  "IF_ICMPGT": 0xA3,
  "IF_ICMPLE": 0xA4,
  "IF_ACMPEQ": 0xA5,
  "IF_ACMPNE": 0xA6,
  "GOTO": 0xA7,

  "JSR": 0xA8,
  "RET": 0xA9,
  "TABLESWITCH": 0xAA,
  "LOOKUPSWITCH": 0xAB,
  "IRETURN": 0xAC,
  "LRETURN": 0xAD,
  "FRETURN": 0xAE,
  "DRETURN": 0xAF,

  "ARETURN": 0xB0,
  "RETURN": 0xB1,
  "GETSTATIC": 0xB2,
  "PUTSTATIC": 0xB3,
  "GETFIELD": 0xB4,
  "PUTFIELD": 0xB5,
  "INVOKEVIRTUAL": 0xB6,
  "INVOKESPECIAL": 0xB7,

  "INVOKESTATIC": 0xB8,
  "INVOKEINTERFACE": 0xB9,
  "UNUSED_BA": 0xBA,
  "NEW": 0xBB,
  "NEWARRAY": 0xBC,
  "ANEWARRAY": 0xBD,
  "ARRAYLENGTH": 0xBE,
  "ATHROW": 0xBF,

  "CHECKCAST": 0xC0,
  "INSTANCEOF": 0xC1,
  "MONITORENTER": 0xC2,
  "MONITOREXIT": 0xC3,
  "WIDE": 0xC4,
  "MULTIANEWARRAY": 0xC5,
  "IFNULL": 0xC6,
  "IFNONNULL": 0xC7,

  "GOTO_W": 0xC8,
  "JSR_W": 0xC9,
  "BREAKPOINT": 0xCA
};
/**
 * @type {Array.<string>}
 */
var $$ACMD = [];
(function() {
  for (var name in $ACMD) {
    var code = $ACMD[name];
    $$ACMD[code] = name;
  }
})();

/**
 * @class
 * @constructor
 * @export
 * @param {{ops :
 *            Object, macros: Object}} template
 */
function __FyAOTUtil(template) {
  /**
   * @type {number}
   */
  this.mid = 0;
  /**
   * @type {{ops : Object, macros: Object}}
   */
  this.template = template;
};

/**
 *
 * @param {string}
 *            code
 * @param {number}
 *            ip
 * @param {number}
 *            oprand1
 * @param {number}
 *            oprand2
 * @param {number}
 *            spofs
 * @param {Object}
 *            other
 * @returns
 */
__FyAOTUtil.prototype.replaceAll = function(code, ip, oprand1, oprand2, spofs,
  other) {
  if (code == null) {
    throw new FyException(null, "NPT");
  }
  code = code
    .replace(/\$ip/g, String(ip))
    .replace(/\$1/g, String(oprand1))
    .replace(/\$2/g, String(oprand2))
    .replace(/\$spo\s*\-\s*1/g, String(spofs - 1))
    .replace(/\$spo\s*\-\s*2/g, String(spofs - 2))
    .replace(/\$spo\s*\-\s*3/g, String(spofs - 3))
    .replace(/\$spo\s*\+\s*1/g, String(spofs + 1))
    .replace(/\$spo\s*\+\s*2/g, String(spofs + 2))
    .replace(/\$spo\s*\+\s*1/g, String(spofs + 3))
    .replace(/\$spo/g, String(spofs));
  if (other) {
    for (var key in other) {
      var value = other[key];
      code = code.replace(new RegExp("\\$" + key, "g"), String(value));
    }
  }
  if (!FyConfig.verboseMode) {
    code = code.replace(/\"\#\!\".*?\"\!\#\"\;/g, "");
  }
  return code;
};

/**
 * @export
 * @param {FyThread}
 *            thread
 * @param {FyMethod}
 *            method
 */
__FyAOTUtil.prototype.aot = function(thread, method) {
  /**
   * @type {FyContext}
   */
  var context = thread.context;
  /**
   * @dict
   * @type {Object.<string,string>}
   */
  var macros = this.template["macros"];
  /**
   * @dict
   * @type {Object.<string,Object.<string,string>>}
   */
  var ops = this.template["ops"];
  /**
   *
   * @type {number}
   */
  var codeLen = method.code.length;
  /**
   *
   * @type {number}
   */
  var len = codeLen / 3;
  /**
   *
   * @type {Array.<string>}
   */
  var code = [];
  /**
   * @type {string}
   */
  var result;
  /**
   *
   * @type {FyClass}
   */
  var clazz = method.owner;
  /**
   *
   * @type {FyClassDef}
   */
  var global = clazz.global;
  /**
   *
   * @type {boolean}
   */
  var nextNeedCase = false;
  /**
   * @type {string}
   */
  var opsCheckCode = macros["OPS"].toString();
  /**
   * @type {string}
   */
  var opsCheckNCode = macros["OPSN"].toString();

  this.mid++;
  /**
   *
   * @type {Array.<number>}
   */
  var stackOfs = method.stackOfs = Array(len);

  code.push(this.replaceAll(macros["HEADER"], -1, -1, -1, -1, {
    "mid": this.mid
  }));
  code.push("\n");
  var exceptionHandlers = {};
  for (var i = 0, max = method.exceptionTable.length; i < max; i += 4) {
    var handler = method.exceptionTable[i + 3];
    exceptionHandlers[handler] = true;
  }

  for (var ip = 0; ip < len; ip++) {
    /**
     * @type {number}
     */
    var base = ip * 3;
    /**
     * @type {number}
     */
    var base1 = base + 1;
    /**
     * @type {number}
     */
    var base2 = base + 2
      /**
       * @type {number}
       */
    var op = method.code[base];
    /**
     * @type {number}
     */
    var oprand1 = method.code[base1];
    /**
     * @type {number}
     */
    var oprand2 = method.code[base2];
    /**
     * @type {number}
     */
    var opsCheck = (op >> 16) & 0x7fff;
    /**
     * @type {boolean}
     */
    var opsCheckN = op < 0;
    /**
     * @type {number}
     */
    var stackSize = (oprand2 >> 16) & 0xffff;
    /**
     * @type {boolean}
     */
    var needCase = false;
    /**
     * @type {number}
     */
    var caseInsertPoint = code.length;
    oprand2 &= 0xffff;
    /**
     * @type {boolean}
     */
    var isJumpIn = (op & 0x8000) !== 0;
    op = op & 0x3FF;
    if (op == $ACMD["IINC"] && oprand2 > 32767) {
      oprand2 = oprand2 | 0xffff0000;
    }
    /**
     * @type {string}
     */
    var opName = $$ACMD[op];
    stackOfs[ip] = stackSize;
    if (!opName) {
      throw new FyException(null, "Error in preprocessing " + method.uniqueName + ": Unknown opcode: " + op);
    }
    var opResult = ops[opName];
    if (!opResult) {
      throw new FyException(null, "Error in preprocessing " + method.uniqueName + ": Opcode " + opName + " is not implemented");
    }

    // TODO not all statments needs case
    if (ip == 0) {
      needCase = true;
    }
    if (nextNeedCase) {
      nextNeedCase = false;
      needCase = true;
    }
    if (isJumpIn || (opsCheck && !opsCheckN)) {
      needCase = true;
    }
    if (op == 0xC2 // MONITORENTER
      || op == 0xC3 // MONITOREXIT
    ) {
      nextNeedCase = true;
    }

    if (op == 0xBB // NEW
    ) {
      // new may call <clinit>
      needCase = true;
    }
    if (exceptionHandlers[ip]) {
      needCase = true;
    }

    if (FyConfig.debugMode) {
      code.push("// ");
      code.push(opName);
      code.push(" ");
      code.push(oprand1);
      code.push(" ");
      code.push(oprand2);
      code.push(" ");
      code.push(stackSize);
      if (ip === 0) {
        code.push("\n");
        if (FyConfig.verboseMode) {
          code.push("console.log('Enter '+_m_.uniqueName);");
        }
      }
    }
    code.push("\n");
    if (FyConfig.verboseMode && method.uniqueName != "java/lang/Character.<clinit>.()V") {
      code.push("console.log(" +
        "thread.threadId+', " +
        "\"'+ _m_.uniqueName+'\", " +
        ip +
        ((method.accessFlags & FyConstAcc.STATIC) ?
          " , S, '+" : " , '+stack[sb]+', '+"
        ) +
        "sb + ', " +
        stackSize + ", " +
        opName + ", " +
        oprand1 + ", " +
        oprand2 + ", " +
        "[' " + "+ Array.prototype.join.call(stack.subarray(sb,sb+_m_.maxLocals+_m_.maxStack),', ')+']');\n");
    }

    if (FyConfig.debugMode) {
      code.push("if(ops===null || ops!==ops){");
      code.push(" throw new FyException(null,'Illegal ops');");
      code.push("}");
    }

    if (ip === 0 && method.name === FyConst.FY_METHOD_CLINIT) {
      code.push(this.replaceAll(macros["CLINIT"], ip, oprand1, oprand2,
        stackSize, {
          "clazz": "clazz.getSuperClass()"
        }));
    }
    if (opsCheck) {
      code.push(this.replaceAll(opsCheckN ? opsCheckNCode : opsCheckCode, ip, oprand1, oprand2,
        stackSize, {
          "distance": opsCheck
        }));
    }
    switch (op) {
      case 0xB2 /* $.GETSTATIC */ :
        var tmpField = context.lookupFieldVirtualFromConstant(global,
          clazz.constants[oprand1]);
        if (!(tmpField.accessFlags & FyConstAcc.STATIC)) {
          throw new FyException(FyConst.FY_EXCEPTION_INCOMPAT_CHANGE,
            "Field " + tmpField.uniqueName + " is not static");
        }
        if (thread.clinit(tmpField.owner)) {
          needCase = true;
          code.push("lip=" + ip + ";");
          code.push("tmpClass=context.getClassById(" + tmpField.owner.classId + ");");
          code.push(this.replaceAll(macros["CLINIT"], ip, oprand1,
            oprand2, stackSize, {
              "clazz": "tmpClass"
            }));
        }
        switch (tmpField.size) {
          case 2:
            code.push("stack[sb+" + stackSize + "]=_heap[" + (tmpField.owner.staticPos + tmpField.posAbs) + "];");
            code.push("stack[sb+" + (stackSize + 1) + "]=_heap[" + (tmpField.owner.staticPos + tmpField.posAbs + 1) + "];");
            break;
          default:
            code.push("stack[sb+" + stackSize + "]=_heap[" + (tmpField.owner.staticPos + tmpField.posAbs) + "];");
            break;
        }
        break;
      case 0xB3 /* $.PUTSTATIC */ :
        var tmpField = context.lookupFieldVirtualFromConstant(global,
          clazz.constants[oprand1]);
        if (!(tmpField.accessFlags & FyConstAcc.STATIC)) {
          throw new FyException(FyConst.FY_EXCEPTION_INCOMPAT_CHANGE,
            "Field " + tmpField.uniqueName + " is not static");
        }
        /*
         * if ((tmpField.accessFlags & FyConstAcc.FINAL) && (this.owner !=
         * tmpField.owner)) { throw new
         * FyException(FyConst.FY_EXCEPTION_ACCESS, "Field " +
         * tmpField.uniqueName + " is final"); }
         */
        if (thread.clinit(tmpField.owner)) {
          needCase = true;
          code.push("lip=" + ip + ";tmpClass=context.getClassById(" + tmpField.owner.classId + ");");
          code.push(this.replaceAll(macros["CLINIT"], ip, oprand1,
            oprand2, stackSize, {
              "clazz": "tmpClass"
            }));
        }
        switch (tmpField.size) {
          case 2:
            code.push("_heap[" + (tmpField.owner.staticPos + tmpField.posAbs + 1) + "]=stack[sb+" + (stackSize - 1) + "];");
            code.push("_heap[" + (tmpField.owner.staticPos + tmpField.posAbs) + "]=stack[sb+" + (stackSize - 2) + "];");
            break;
          default:
            code.push("_heap[" + (tmpField.owner.staticPos + tmpField.posAbs) + "]=stack[sb+" + (stackSize - 1) + "];");
            break;
        }
        break;
      case 0xB4 /* $.GETFIELD */ :
        var tmpField = context.lookupFieldVirtualFromConstant(global,
          clazz.constants[oprand1]);
        if (tmpField.accessFlags & FyConstAcc.STATIC) {
          throw new FyException(FyConst.FY_EXCEPTION_INCOMPAT_CHANGE,
            "Field " + tmpField.uniqueName + " is static");
        }
        code
          .push("if (stack[sb+" + (stackSize - 1) + "] === 0) {thread.localToFrame(" + ip + "|0," + (ip + 1) + "|0);throw new FyException(FyConst.FY_EXCEPTION_NPT, '');}");
        switch (tmpField.size) {
          case 2:
            code.push("stack[sb+" + (stackSize) + "] = _heap[_heap[stack[sb+" + (stackSize - 1) + "]] +" + (FyHeap.OBJ_META_SIZE + tmpField.posAbs + 1) + "];");
            code
              .push("stack[sb+" + (stackSize - 1) + "] = _heap[_heap[stack[sb+" + (stackSize - 1) + "]] +" + (FyHeap.OBJ_META_SIZE + tmpField.posAbs) + "];");
            break;
          default:
            code
              .push("stack[sb+" + (stackSize - 1) + "] = _heap[_heap[stack[sb+" + (stackSize - 1) + "]] +" + (FyHeap.OBJ_META_SIZE + tmpField.posAbs) + "];");
            break;
        }
        break;
      case 0xB5 /* $.PUTFIELD */ :
        var tmpField = context.lookupFieldVirtualFromConstant(global,
          clazz.constants[oprand1]);
        if (tmpField.accessFlags & FyConstAcc.STATIC) {
          throw new FyException(FyConst.FY_EXCEPTION_INCOMPAT_CHANGE,
            "Field " + tmpField.uniqueName + " is static");
        }
        switch (tmpField.size) {
          case 2:
            code
              .push("if (stack[sb+" + (stackSize - 3) + "] === 0) {thread.localToFrame(" + ip + "|0," + (ip + 1) + "|0);throw new FyException(FyConst.FY_EXCEPTION_NPT, '');}");
            code.push("_heap[_heap[stack[sb+" + (stackSize - 3) + "]] + " + (FyHeap.OBJ_META_SIZE + tmpField.posAbs) + "] = stack[sb+" + (stackSize - 2) + "];");
            code.push("_heap[_heap[stack[sb+" + (stackSize - 3) + "]] + " + (FyHeap.OBJ_META_SIZE + tmpField.posAbs + 1) + "] = stack[sb+" + (stackSize - 1) + "];");
            break;
          default:
            code
              .push("if (stack[sb+" + (stackSize - 2) + "] === 0) {thread.localToFrame(" + ip + "|0," + (ip + 1) + "|0);throw new FyException(FyConst.FY_EXCEPTION_NPT, '');}");
            code.push("_heap[_heap[stack[sb+" + (stackSize - 2) + "]] + " + (FyHeap.OBJ_META_SIZE + tmpField.posAbs) + "] = stack[sb+" + (stackSize - 1) + "];");
            break;
        }
        break;
      case 0xB6 /* $.INVOKEVIRTUAL */ :
      case 0xB9 /* $.INVOKEINTERFACE */ :
        needCase = true;
        nextNeedCase = true;
        var tmpMethod = context.lookupMethodVirtualFromConstant(global,
          clazz.constants[oprand1]);
        if ((tmpMethod.accessFlags & FyConstAcc.STATIC)) {
          throw new FyException(FyConst.FY_EXCEPTION_INCOMPAT_CHANGE,
            tmpMethod.uniqueName + " is static");
        }

        // code.push("FyUtils.breakpoint();");

        code.push("tmpMethod=context.getMethodById(" + tmpMethod.methodId + ");\n");
        code
          .push("if(stack[sb+" + (stackSize - tmpMethod.paramStackUsage - 1) + "]===0){\n");
        code.push("thread.localToFrame(" + ip + "|0," + (ip + 1) + "|0);\n");
        code.push("throw new FyException(FyConst.FY_EXCEPTION_NPT,\"\");}\n");
        if (tmpMethod.accessFlags & FyConstAcc.FINAL) {
          // generate static code
          if (tmpMethod.accessFlags & FyConstAcc.NATIVE) {
            var fun = context.nativeAOT[tmpMethod.uniqueName];
            if (fun) {
              code.push(fun(thread, method, ip, (stackSize - tmpMethod.paramStackUsage - 1)));
            } else if (tmpMethod.invoke) {
              code.push("heap.beginProtect();\n");
              code.push("thread.localToFrame(" + ip + "|0," + (ip + 1) + "|0);\n");
              code.push("ops=tmpMethod.doInvoke(context,thread,sb+" + (stackSize - tmpMethod.paramStackUsage - 1) + ",ops);\n");
              code.push("heap.endProtect();\n");
              code.push("if(ops<=0){return 0;}\n");
            } else {
              code.push("thread.localToFrame(" + ip + "|0," + (ip + 1) + "|0);\n");
              code.push("thread.pendNative(tmpMethod, sb+" + (stackSize - tmpMethod.paramStackUsage - 1) + ");\n");
              code.push("return 0;\n");
            }
          } else {
            code.push("thread.localToFrame(" + ip + "|0," + (ip + 1) + "|0);\n");
            code.push("if(!tmpMethod.invokeReady()){\n");
            code.push(" FyAOTUtil.aot(thread,tmpMethod);\n");
            code.push("}\n");
            code.push("ops = thread.pushMethod(tmpMethod,sb+" + (stackSize - tmpMethod.paramStackUsage - 1) + ",ops);\n");
            code.push("if(ops<=0){return 0;}\n");
            code.push("ops = tmpMethod.doInvoke(context,thread,sb+" + (stackSize - tmpMethod.paramStackUsage - 1) + ",ops);\n");
            code.push("if(ops<=0){return 0;}\n");
          }

        } else {
          // generate dynamic code
          code.push("thread.localToFrame(" + ip + "|0," + (ip + 1) + "|0);\n");
          code
            .push("tmpMethod = context.lookupMethodVirtualByMethod(heap.getObjectClass(stack[sb+" + (stackSize - tmpMethod.paramStackUsage - 1) + "]), tmpMethod);\n");
          code
            .push("if(tmpMethod.hasAccessFlag(FyConstAcc.NATIVE)){\n");
          code.push("if(tmpMethod.invokeReady()){\n");
          code
            .push("heap.beginProtect();ops=tmpMethod.doInvoke(context,thread,sb+" + (stackSize - tmpMethod.paramStackUsage - 1) + ",ops);heap.endProtect();if(ops<=0) {return 0;}\n");
          code.push("}else{\n");
          code
            .push("thread.pendNative(tmpMethod, sb+" + (stackSize - tmpMethod.paramStackUsage - 1) + ");return 0;\n");
          code.push("}\n");
          code.push("}else{\n");
          code
            .push("if(!tmpMethod.invokeReady()){FyAOTUtil.aot(thread,tmpMethod);}\n");
          code.push("ops = thread.pushMethod(tmpMethod,sb+" + (stackSize - tmpMethod.paramStackUsage - 1) + ",ops);\n");
          code.push("if(ops<=0) {return 0;}\n");
          code.push("ops = tmpMethod.doInvoke(context,thread,sb+" + (stackSize - tmpMethod.paramStackUsage - 1) + ",ops);");
          code.push("if(ops<=0) {return 0;}\n");
          code.push("}\n");
        }
        break;
      case 0xB7 /* $.INVOKESPECIAL */ :
        needCase = true;
        nextNeedCase = true;
        var tmpMethod = context.lookupMethodVirtualFromConstant(global,
          clazz.constants[oprand1]);
        if ((tmpMethod.accessFlags & FyConstAcc.STATIC)) {
          throw new FyException(FyConst.FY_EXCEPTION_INCOMPAT_CHANGE,
            tmpMethod.uniqueName + " is static");
        }
        var tmpClass = tmpMethod.owner;
        if ((clazz.accessFlags & FyConstAcc.SUPER) && context.classLoader.isSuperClassOf(tmpClass, clazz) && tmpMethod.name === FyConst.FY_METHOD_INIT) {
          tmpMethod = context.lookupMethodVirtualByMethod(
            clazz.superClass, tmpMethod);
        }
        if (!tmpMethod) {
          throw new FyException(
            FyConst.FY_EXCEPTION_ABSTRACT,
            "Special: " + context.lookupMethodVirtualFromConstant(
              global, clazz.constants[oprand1]).uniqueName);
        }
        if (tmpMethod.name !== FyConst.FY_METHOD_INIT && tmpMethod.owner !== tmpClass) {
          throw new FyException(FyConst.FY_EXCEPTION_NO_METHOD,
            tmpMethod.uniqueName);
        }
        if (tmpMethod.accessFlags & FyConstAcc.STATIC) {
          throw new FyException(FyConst.FY_EXCEPTION_INCOMPAT_CHANGE,
            tmpMethod.uniqueName);
        }
        if (tmpMethod.accessFlags & FyConstAcc.ABSTRACT) {
          throw new FyException(FyConst.FY_EXCEPTION_ABSTRACT,
            tmpMethod.uniqueName);
        }
        code.push("tmpMethod=context.getMethodById(" + tmpMethod.methodId + ");");
        code
          .push("if(stack[sb+" + (stackSize - tmpMethod.paramStackUsage - 1) + "]===0){throw new FyException(FyConst.FY_EXCEPTION_NPT,'');}");
        if (tmpMethod.accessFlags & FyConstAcc.NATIVE) {
          var fun = context.nativeAOT[tmpMethod.uniqueName];
          if (fun) {
            code.push(fun(thread, method, ip, (stackSize - tmpMethod.paramStackUsage - 1)));
          } else if (tmpMethod.invoke) {
            code.push("heap.beginProtect();thread.localToFrame(" + ip + "|0," + (ip + 1) + "|0);ops=tmpMethod.doInvoke(context,thread,sb+" + (stackSize - tmpMethod.paramStackUsage - 1) + ",ops);heap.endProtect();if(ops<=0){return 0;}");
          } else {
            code
              .push("thread.localToFrame(" + ip + "|0," + (ip + 1) + "|0);thread.pendNative(tmpMethod, sb+" + (stackSize - tmpMethod.paramStackUsage - 1) + ");return 0;");
          }
        } else {
          code.push("thread.localToFrame(" + ip + "|0," + (ip + 1) + "|0);\n");
          code.push("if(!tmpMethod.invokeReady()){\n");
          code.push("FyAOTUtil.aot(thread,tmpMethod);\n");
          code.push("} ops = thread.pushMethod(tmpMethod,sb+" + (stackSize - tmpMethod.paramStackUsage - 1) + ",ops);\n");
          code.push("if(ops<=0) {return 0;}\n");
          code.push("ops = tmpMethod.doInvoke(context,thread,sb+" + (stackSize - tmpMethod.paramStackUsage - 1) + ",ops);\n");
          code.push("if(ops<=0) {return 0;}\n");
        }
        break;
      case 0xB8 /* $.INVOKESTATIC */ :
        needCase = true;
        nextNeedCase = true;
        var tmpMethod = context.lookupMethodVirtualFromConstant(global,
          clazz.constants[oprand1]);
        if (!(tmpMethod.accessFlags & FyConstAcc.STATIC)) {
          throw new FyException(FyConst.FY_EXCEPTION_INCOMPAT_CHANGE,
            tmpMethod.uniqueName + " is not static");
        }
        var tmpClass = tmpMethod.owner;
        code.push("tmpMethod=context.getMethodById(" + tmpMethod.methodId + ");");
        if (context.getMethod(tmpClass.name + "." + FyConst.FY_METHOD_CLINIT + ".()V")) {
          code.push(this.replaceAll(macros["CLINIT"], ip, oprand1,
            oprand2, stackSize, {
              "clazz": "tmpMethod.getOwner()"
            }));
        }
        if (tmpMethod.accessFlags & FyConstAcc.NATIVE) {
          var fun = context.nativeAOT[tmpMethod.uniqueName];
          if (fun) {
            code.push(fun(thread, method, ip, (stackSize - tmpMethod.paramStackUsage)));
          } else if (tmpMethod.invoke) {
            code.push("heap.beginProtect();thread.localToFrame(" + ip + "|0," + (ip + 1) + "|0);ops=tmpMethod.doInvoke(context,thread,sb+" + (stackSize - tmpMethod.paramStackUsage) + ",ops);heap.endProtect();if(ops<=0) {return 0;}");
          } else {
            code
              .push("thread.localToFrame(" + ip + "|0," + (ip + 1) + "|0);thread.pendNative(tmpMethod, sb+" + (stackSize - tmpMethod.paramStackUsage) + ");return 0;");
          }
        } else {
          code
            .push("thread.localToFrame(" + ip + "|0," + (ip + 1) + "|0);if(!tmpMethod.invokeReady()){FyAOTUtil.aot(thread,tmpMethod);} ops = thread.pushMethod(tmpMethod,sb+" + (stackSize - tmpMethod.paramStackUsage) + ",ops);if(ops<=0) {return 0;}ops = tmpMethod.doInvoke(context,thread,sb+" + (stackSize - tmpMethod.paramStackUsage) + ",ops);if(ops<=0) {return 0;}");
        }
        break;
      case 0x12 /* $.LDC */ :
      case 0x13:
      case 0x14:
        switch (oprand2) {
          case 0:
            // int/float
            code.push("stack[sb + " + stackSize + "]=" + global.constants[clazz.constants[oprand1]] + ";");
            if (FyConfig.verboseMode) {
              code.push("console.log(stack[sb + " + stackSize + "]);");
            }
            break;
          case 1:
            code.push("stack[sb + " + stackSize + "]=" + global.constants[clazz.constants[oprand1]] + ";");
            code.push("stack[sb + " + (stackSize + 1) + "]=" + global.constants[clazz.constants[oprand1] + 1] + ";");
            if (FyConfig.verboseMode) {
              code.push("console.log([stack[sb + " + stackSize + "],stack[sb + " + (stackSize + 1) + "]]);");
            }
            break;
          case 2:
            code.push("thread.localToFrame(" + ip + "|0, " + (ip + 1) + "|0);");
            code.push("stack[sb + " + stackSize + "] = heap.literalWithConstant(global," + clazz.constants[oprand1] + ");");
            if (FyConfig.verboseMode) {
              code.push("console.log([ constants[" + oprand1 + "], stack[sb + " + stackSize + "] ]);");
            }
            break;
          case 3:
            code.push("thread.localToFrame(" + ip + "|0, " + (ip + 1) + "|0);");
            code
              .push("stack[sb + " + stackSize + "] = context.getClassObjectHandle(context.lookupClassFromConstant(global," + clazz.constants[oprand1] + "));");
            if (FyConfig.verboseMode) {
              code.push("console.log([ constants[" + oprand1 + "], stack[sb + " + stackSize + "] ]);");
            }
            break;
          default:
            throw new FyException(null, "Illegal ldc mode=" + oprand2);
        }
        break;
      default:
        code.push(this.replaceAll(opResult.code, ip, oprand1, oprand2,
          stackSize, null));
        break;
    }
    code.push("\n\n");
    if (needCase) {
      code.splice(caseInsertPoint, 0, "case " + ip + ":");
    }
  }
  code.push(macros["TAIL"].toString());
  result = code.join("").toString();
  if (FyConfig.debugMode) {
    if (result.indexOf("$") >= 0) {
      console.log(result);
      throw new FyException(
        null,
        "method.sample.js should not have content begins with '$' except $ip $1 $2 $spo");
    }
  }
  method.code = null;
  try {
    var body = "'use strict';// " + method.uniqueName + "\n" + result;
    // var foo = new Function("context", "thread", "ops", "//
    // "
    // + method.uniqueName + "\n" + result);
    // method.invoke = foo;
    method.invoke = new Function("return (function __aot_f_" + this.mid + method.owner.name.replace(/\//g, "_") + "_" + method.name.replace(/[<>]/g, "_") + "(context,thread,sb,ops){" + body + "});")();
    // method.invoke = __aot(this.mid | 0, body);
  } catch (e) {
    console.log("Exception occored in generating function for " + method.uniqueName + ": \n" + result);
    throw e;
  }
  // console.log(method.invoke);
};