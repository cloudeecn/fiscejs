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

// Utils and some plain structs without methods.
/**
 * Config class
 * @constructor
 * @export
 * @struct
 */
function FyConfig() {
  /**
   * @type {number}
   */
  this.maxObjects = 131072;
  /**
   * @type {number}
   */
  this.maxThreads = 16;
  /**
   * @type {number}
   */
  this.gcIdv = 60000;
  /**
   * @type {number}
   */
  this.gcForceIdv = 120000;
  /**
   * @type {number}
   */
  this.heapSize = 4000000;
  /**
   * @type {number}
   */
  this.edenSize = 1000000;
  /**
   * @type {number}
   */
  this.copySize = 400000;
  /**
   * @type {number}
   */
  this.stackSize = 16384;
  /**
   * @type {boolean}
   */
  this.debugMode = false;
  /**
   * @type {boolean}
   */
  this.verboseMode = false;
  /**
   * @type {boolean}
   */
  this.aggresiveGC = false;
};

FyConfig.verboseMode = false;

/**
 * @class
 * @constructor
 * @export
 */
function __FyUtils() {};

/**
 *
 * @param {Array.<number>}
 *            src
 * @param {Array.<number>}
 *            dest
 */
__FyUtils.prototype.cloneIntArray = function(src, dest) {
  if (dest.length !== 0) {
    throw new FyException(null,
      "Dest array must be empty, dest.length=" + dest.length);
  }
  for (var i = 0, max = src.length; i < max; i++) {
    dest.push(src[i] | 0);
  }
};
/**
 * copy all attributes from src into dest
 * @export
 * @param {?} src
 * @param {?} dest
 */
__FyUtils.prototype.shallowClone = function(src, dest) {
  var keys = Object.keys(src);
  for (var i = 0, max = keys.length; i < max; i++) {
    var key = keys[i];
    dest[key] = src[key];
  }
};

/**
 * copy all strings and numbers from src into dest
 *
 * @param {?} src
 * @param {?} dest
 * @param {Array.<string>}
 *            keys
 */
__FyUtils.prototype.simpleClone = function(src, dest, keys) {
  var i, imax;
  var key, value;
  if (keys) {
    imax = keys.length;
    for (i = 0; i < imax; i++) {
      key = keys[i];
      value = src[key];
      if (value == null) {

      } else if (typeof value === "string" || typeof value === "number") {
        dest[key] = value;
      } else {
        throw new FyException(null, "Value of key[" + key + "] is not string or number");
      }
    }
  } else {
    keys = Object.keys(src);
    imax = keys.length;
    for (i = 0; i < imax; i++) {
      key = keys[i];
      value = src[key];
      if (typeof value === "string" || typeof value === "number") {
        dest[key] = value;
      }
    }
  }
};

/**
 *
 * @param {number}
 *            code
 * @returns {number}
 */
__FyUtils.prototype.utf8Size = function(code) {
  code = code & 0xffff;
  if (code > 0x0800) {
    return 3;
  } else if (code > 0x80 || code === 0) {
    return 2;
  } else {
    return 1;
  }
};

/**
 *
 * @param {number}
 *            first
 * @returns {number}
 */
__FyUtils.prototype.utf8SizeU = function(first) {
  first = first << 24 >> 24;
  if (first > 127) {
    first -= 256;
  }
  if (first >= 0) {
    return 1;
  } else if (first >= -16) {
    return -1;
  } else if (first >= -32) {
    return 3;
  } else if (first >= -64) {
    return 2;
  } else {
    return -1;
  }
};

/**
 *
 * @param {Array.<number>|Int32Array}
 *            utf8Array
 * @param {number}
 *            ofs
 * @param {Array.<number>|Int32Array}
 *            unicodeArray
 * @param {number}
 *            ofs1
 * @returns {number}
 */
__FyUtils.prototype.utf8Decode = function(utf8Array, ofs, unicodeArray, ofs1) {
  switch (this.utf8SizeU(utf8Array[ofs])) {
    case 1:
      unicodeArray[ofs1] = utf8Array[ofs];
      return 1;
    case 2:
      unicodeArray[ofs1] = ((utf8Array[ofs] & 0x1f) << 6) + (utf8Array[ofs + 1] & 0x3f);
      return 2;
    case 3:
      unicodeArray[ofs1] = ((utf8Array[ofs] & 0xf) << 12) + ((utf8Array[ofs + 1] & 0x3f) << 6) + (utf8Array[ofs + 2] & 0x3f);
      return 3;
    default:
      unicodeArray[ofs1] = 63;
      return 1;
  }
};

/**
 *
 * @param {number}
 *            unicode
 * @param {Array.<number>|Int32Array}
 *            utf8Array
 * @param {number}
 *            ofs
 * @returns {number}
 */
__FyUtils.prototype.utf8Encode = function(unicode, utf8Array, ofs) {
  unicode &= 0xffff;
  switch (this.utf8Size(unicode)) {
    case 3:
      utf8Array[ofs] = (unicode >> 12) - 32;
      utf8Array[ofs + 1] = ((unicode >> 6) & 0x3f) - 128;
      utf8Array[ofs + 2] = (unicode & 0x3f) - 128;
      return 3;
    case 2:
      utf8Array[ofs] = (unicode >> 6) - 64;
      utf8Array[ofs + 1] = (unicode & 0x3f) - 128;
      return 2;
    case 1:
      utf8Array[ofs] = unicode;
      return 1;
    default:
      utf8Array[ofs] = 63;
      return 1;
  }
};

/**
 *
 * @returns {number}
 */
__FyUtils.prototype.breakpoint = function() {
  var i = 0;
  i++;
  i++;
  return i;
};

/**
 *
 * @param {string}
 *            str
 * @returns {Uint8Array}
 */
__FyUtils.prototype.unbase64 = (function() {
  var base64Code = new HashMapI(-1, 7, 0.6);

  (function initCode(str) {
    var len = str.length;
    for (var i = len; i--;) {
      base64Code.put(str.charCodeAt(i), i);
    }
  })("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=");
  return function(str) {
    var slen = str.length;
    if (slen & 3 !== 0) {
      throw new FyException(FyConst.FY_EXCEPTION_IO,
        "Illegal base64 code");
    }
    var tlen = (slen >> 2) * 3;
    if (str.endsWith("==")) {
      tlen -= 2;
    } else if (str.endsWith("=")) {
      tlen--;
    }

    var len = tlen;
    var container = new Uint8Array(len);

    var i = 0;
    var p = 0;
    while (i < slen) {
      var c1 = base64Code.get(str.charCodeAt(i));
      if (c1 < 0) {
        throw new FyException(FyConst.FY_EXCEPTION_IO,
          "Illegal base64 code");
      }
      var c2 = base64Code.get(str.charCodeAt(i + 1));
      if (c2 < 0) {
        throw new FyException(FyConst.FY_EXCEPTION_IO,
          "Illegal base64 code");
      }
      var c3 = base64Code.get(str.charCodeAt(i + 2));
      if (c3 < 0) {
        throw new FyException(FyConst.FY_EXCEPTION_IO,
          "Illegal base64 code");
      }
      var c4 = base64Code.get(str.charCodeAt(i + 3));
      if (c4 < 0) {
        throw new FyException(FyConst.FY_EXCEPTION_IO,
          "Illegal base64 code for file.");
      }

      container[p] = ((c1 << 2) | (c2 >> 4)) & 0xff;
      if (c3 !== 64) {
        container[p + 1] = (((c2 & 15) << 4) | (c3 >> 2)) & 0xff;
      }

      if (c4 !== 64) {
        container[p + 2] = (((c3 & 3) << 6) | c4) & 0xff;
      }

      p += 3;
      i += 4;
    }
    return container;
  }
})();

/**
 * @export
 * @type {__FyUtils}
 */
var FyUtils = new __FyUtils();

/**
 * @export
 * @enum {number}
 */
var FyConstAcc = {};

/**
 * @export
 * @const
 */
FyConstAcc.ABSTRACT = 1024 | 0;
/**
 * @export
 * @const
 */
FyConstAcc.FINAL = 16 | 0;
/**
 * @export
 * @const
 */
FyConstAcc.INTERFACE = 512 | 0;
/**
 * @export
 * @const
 */
FyConstAcc.NATIVE = 256 | 0;
/**
 * @export
 * @const
 */
FyConstAcc.PRIVATE = 2 | 0;
/**
 * @export
 * @const
 */
FyConstAcc.PROTECTED = 4 | 0;
/**
 * @export
 * @const
 */
FyConstAcc.PUBLIC = 1 | 0;
/**
 * @export
 * @const
 */
FyConstAcc.STATIC = 8 | 0;
/**
 * @export
 * @const
 */
FyConstAcc.STRICT = 2048 | 0;
/**
 * @export
 * @const
 */
FyConstAcc.SUPER = 32 | 0;
/**
 * @export
 * @const
 */
FyConstAcc.SYNCHRONIZED = 32 | 0;
/**
 * @export
 * @const
 */
FyConstAcc.TRANSIENT = 128 | 0;
/**
 * @export
 * @const
 */
FyConstAcc.VOLATILE = 64 | 0;
/**
 * @export
 * @const
 */
FyConstAcc.VARARGS = 128 | 0;
/**
 * @export
 * @const
 */
FyConstAcc.BRIDGE = 64 | 0;

/* Extended access flags */
/**
 * @export
 * @const
 */
FyConstAcc.SYNTHETIC = 0x00001000 | 0;
/**
 * @export
 * @const
 */
FyConstAcc.ANNOTATION = 0x00002000 | 0;
/**
 * @export
 * @const
 */
FyConstAcc.ENUM = 0x00004000 | 0;
/**
 * @export
 * @const
 */
FyConstAcc.SOFT_REF = 0x00008000 | 0;
/**
 * @export
 * @const
 */
FyConstAcc.WEAK_REF = 0x00010000 | 0;
/**
 * @export
 * @const
 */
FyConstAcc.PHANTOM_REF = 0x00020000 | 0;
/**
 * @export
 * @const
 */
FyConstAcc.REF = FyConstAcc.SOFT_REF | FyConstAcc.WEAK_REF | FyConstAcc.PHANTOM_REF;
/**
 * @export
 * @const
 */
FyConstAcc.NEED_FINALIZE = 0x00040000 | 0;
/**
 * @export
 * @const
 */
FyConstAcc.CONSTRUCTOR = 0x00100000 | 0;
/**
 * @export
 * @const
 */
FyConstAcc.CLINIT = 0x00200000 | 0;

/**
 * @export
 * @enum {number}
 */
var FyConst = {};
/**
 * @const
 * @export
 */
FyConst.TYPE_OBJECT = 0 | 0;
/**
 * @const
 * @export
 */
FyConst.TYPE_PRIMITIVE = 1 | 0;
/**
 * @const
 * @export
 */
FyConst.TYPE_ARRAY = 2 | 0;

/**
 * @const
 * @export
 */
FyConst.ARRAY_TYPE_BYTE = 0 | 0;
/**
 * @const
 * @export
 */
FyConst.ARRAY_TYPE_SHORT = 1 | 0;
/**
 * @const
 * @export
 */
FyConst.ARRAY_TYPE_INT = 2 | 0;
/**
 * @const
 * @export
 */
FyConst.ARRAY_TYPE_LONG = 3 | 0;
/* Access flags */
/**
 * @const
 * @export
 */
FyConst.FY_TM_STATE_NEW = 0 | 0;
/**
 * @const
 * @export
 */
FyConst.FY_TM_STATE_BOOT_PENDING = 1 | 0;
/**
 * @const
 * @export
 */
FyConst.FY_TM_STATE_STOP = 2 | 0;
/**
 * @const
 * @export
 */
FyConst.FY_TM_STATE_RUN_PENDING = 3 | 0;
/**
 * @const
 * @export
 */
FyConst.FY_TM_STATE_RUNNING = 4 | 0;
/**
 * @const
 * @export
 */
FyConst.FY_TM_STATE_STOP_PENDING = 5 | 0;
/**
 * @const
 * @export
 */
FyConst.FY_TM_STATE_DEAD_PENDING = 6 | 0;
/**
 * @const
 * @export
 */
FyConst.FY_TM_STATE_DEAD = 7 | 0;

/* Array types */
/**
 * @const
 * @export
 */
FyConst.FY_AT_BYTE = 0 | 0;
/**
 * @const
 * @export
 */
FyConst.FY_AT_SHORT = 1 | 0;
/**
 * @const
 * @export
 */
FyConst.FY_AT_INT = 2 | 0;
/**
 * @const
 * @export
 */
FyConst.FY_AT_LONG = 3 | 0;

/* Prm types */
/**
 * @const
 * @export
 */
FyConst.FY_TYPE_BYTE = 'B';
/**
 * @const
 * @export
 */
FyConst.FY_TYPE_CHAR = 'C';
/**
 * @const
 * @export
 */
FyConst.FY_TYPE_DOUBLE = 'D';
/**
 * @const
 * @export
 */
FyConst.FY_TYPE_FLOAT = 'F';
/**
 * @const
 * @export
 */
FyConst.FY_TYPE_LONG = 'J';
/**
 * @const
 * @export
 */
FyConst.FY_TYPE_SHORT = 'S';
/**
 * @const
 * @export
 */
FyConst.FY_TYPE_BOOLEAN = 'Z';
/**
 * @const
 * @export
 */
FyConst.FY_TYPE_ARRAY = '[';

/* Below are shared by thread and context */
/**
 * @const
 * @export
 */
FyConst.FY_TYPE_INT = 'I';
/**
 * @const
 * @export
 */
FyConst.FY_TYPE_HANDLE = 'L';
/* Below are used only by thread */
/**
 * @const
 * @export
 */
FyConst.FY_TYPE_WIDE = 'W';
/**
 * @const
 * @export
 */
FyConst.FY_TYPE_RETURN = 'R';
/**
 * @const
 * @export
 */
FyConst.FY_TYPE_WIDE2 = '_';
/**
 * @const
 * @export
 */
FyConst.FY_TYPE_UNKNOWN = 'X';
/**
 * @const
 * @export
 */
FyConst.FY_TYPE_VOID = 'V';

/**
 * @const
 * @export
 */
FyConst.FY_ATT_CODE = "Code";
/**
 * @const
 * @export
 */
FyConst.FY_ATT_LINENUM = "LineNumberTable";
/**
 * @const
 * @export
 */
FyConst.FY_ATT_SYNTH = "Synthetic";
/**
 * @const
 * @export
 */
FyConst.FY_ATT_SOURCE_FILE = "SourceFile";
/**
 * @const
 * @export
 */
FyConst.FY_ATT_CONSTANT_VALIE = "ConstantValue";

/* Core classes */
/**
 * @const
 * @export
 */
FyConst.FY_BASE_STRING = "java/lang/String";
/**
 * @const
 * @export
 */
FyConst.FY_BASE_VM = "com/cirnoworks/fisce/privat/FiScEVM";
/**
 * @const
 * @export
 */
FyConst.FY_BASE_ENUM = "java/lang/Enum";
/**
 * @const
 * @export
 */
FyConst.FY_BASE_ANNOTATION = "java/lang/annotation/Annotation";
/**
 * @const
 * @export
 */
FyConst.FY_BASE_STRING_BUILDER = "java/lang/StringBuilder";
/**
 * @const
 * @export
 */
FyConst.FY_BASE_OBJECT = "java/lang/Object";
/**
 * @const
 * @export
 */
FyConst.FY_BASE_CLASS = "java/lang/Class";
/**
 * @const
 * @export
 */
FyConst.FY_BASE_CLASSLOADER = "java/lang/ClassLoader";
/**
 * @const
 * @export
 */
FyConst.FY_BASE_THROWABLE = "java/lang/Throwable";
/**
 * @const
 * @export
 */
FyConst.FY_BASE_THREAD = "java/lang/Thread";
/**
 * @const
 * @export
 */
FyConst.FY_BASE_SYSTEM = "java/lang/System";
/**
 * @const
 * @export
 */
FyConst.FY_BASE_RUNTIME = "java/lang/Runtime";
/**
 * @const
 * @export
 */
FyConst.FY_BASE_BOOLEAN = "java/lang/Boolean";
/**
 * @const
 * @export
 */
FyConst.FY_BASE_BYTE = "java/lang/Byte";
/**
 * @const
 * @export
 */
FyConst.FY_BASE_CHAR = "java/lang/Character";
/**
 * @const
 * @export
 */
FyConst.FY_BASE_SHORT = "java/lang/Short";
/**
 * @const
 * @export
 */
FyConst.FY_BASE_INT = "java/lang/Integer";
/**
 * @const
 * @export
 */
FyConst.FY_BASE_LONG = "java/lang/Long";
/**
 * @const
 * @export
 */
FyConst.FY_BASE_FLOAT = "java/lang/Float";
/**
 * @const
 * @export
 */
FyConst.FY_BASE_DOUBLE = "java/lang/Double";
/**
 * @const
 * @export
 */
FyConst.FY_BASE_MATH = "java/lang/Math";
/**
 * @const
 * @export
 */
FyConst.FY_BASE_FINALIZER = "java/lang/Finalizer";

/**
 * @const
 * @export
 */
FyConst.FY_PRIM_BOOLEAN = "<boolean";
/**
 * @const
 * @export
 */
FyConst.FY_PRIM_BYTE = "<byte";
/**
 * @const
 * @export
 */
FyConst.FY_PRIM_SHORT = "<short";
/**
 * @const
 * @export
 */
FyConst.FY_PRIM_CHAR = "<char";
/**
 * @const
 * @export
 */
FyConst.FY_PRIM_INT = "<int";
/**
 * @const
 * @export
 */
FyConst.FY_PRIM_FLOAT = "<float";
/**
 * @const
 * @export
 */
FyConst.FY_PRIM_LONG = "<long";
/**
 * @const
 * @export
 */
FyConst.FY_PRIM_DOUBLE = "<double";
/**
 * @const
 * @export
 */
FyConst.FY_PRIM_VOID = "<void";

/**
 * @const
 * @export
 */
FyConst.FY_IO_INPUTSTREAM = "java/io/InputStream";
/**
 * @const
 * @export
 */
FyConst.FY_IO_PRINTSTREAM = "java/io/PrintStream";

/**
 * @const
 * @export
 */
FyConst.FY_REFLECT_ARRAY = "java/lang/reflect/Array";
/**
 * @const
 * @export
 */
FyConst.FY_REFLECT_CONSTRUCTOR = "java/lang/reflect/Constructor";
/**
 * @const
 * @export
 */
FyConst.FY_REFLECT_FIELD = "java/lang/reflect/Field";
/**
 * @const
 * @export
 */
FyConst.FY_REFLECT_METHOD = "java/lang/reflect/Method";
/**
 * @const
 * @export
 */
FyConst.FY_REFLECT_PROXY = "java/lang/reflect/Proxy";

/**
 * @const
 * @export
 */
FyConst.FY_REF_SOFT = "java/lang/ref/SoftReference";
/**
 * @const
 * @export
 */
FyConst.FY_REF_WEAK = "java/lang/ref/WeakReference";
/**
 * @const
 * @export
 */
FyConst.FY_REF_PHANTOM = "java/lang/ref/PhantomReference";
/**
 * @const
 * @export
 */
FyConst.FY_REF = "java/lang/ref/Reference";

/**
 * @const
 * @export
 */
FyConst.FY_BASE_STACKTHREADELEMENT = "java/lang/StackTraceElement";

/**
 * @const
 * @export
 */
FyConst.FY_BOX_BOOLEAN = FyConst.FY_BASE_BOOLEAN + ".valueOf.(Z).L" + FyConst.FY_BASE_BOOLEAN + ";";
/**
 * @const
 * @export
 */
FyConst.FY_BOX_BYTE = FyConst.FY_BASE_BYTE + ".valueOf.(B).L" + FyConst.FY_BASE_BYTE + ";";
/**
 * @const
 * @export
 */
FyConst.FY_BOX_SHORT = FyConst.FY_BASE_SHORT + ".valueOf.(S).L" + FyConst.FY_BASE_SHORT + ";";
/**
 * @const
 * @export
 */
FyConst.FY_BOX_CHARACTER = FyConst.FY_BASE_CHAR + ".valueOf.(C).L" + FyConst.FY_BASE_CHAR + ";";
/**
 * @const
 * @export
 */
FyConst.FY_BOX_INTEGER = FyConst.FY_BASE_INT + ".valueOf.(I).L" + FyConst.FY_BASE_INT + ";";
/**
 * @const
 * @export
 */
FyConst.FY_BOX_FLOAT = FyConst.FY_BASE_FLOAT + ".valueOf.(F).L" + FyConst.FY_BASE_FLOAT + ";";
/**
 * @const
 * @export
 */
FyConst.FY_BOX_LONG = FyConst.FY_BASE_LONG + ".valueOf.(J).L" + FyConst.FY_BASE_LONG + ";";
/**
 * @const
 * @export
 */
FyConst.FY_BOX_DOUBLE = FyConst.FY_BASE_DOUBLE + ".valueOf.(D).L" + FyConst.FY_BASE_DOUBLE + ";";

/**
 * @const
 * @export
 */
FyConst.FY_UNBOX_BOOLEAN = FyConst.FY_BASE_BOOLEAN + ".booleanValue.()Z";
/**
 * @const
 * @export
 */
FyConst.FY_UNBOX_BYTE = FyConst.FY_BASE_BYTE + ".byteValue.()B";
/**
 * @const
 * @export
 */
FyConst.FY_UNBOX_SHORT = FyConst.FY_BASE_SHORT + ".shortValue.()S";
/**
 * @const
 * @export
 */
FyConst.FY_UNBOX_CHARACTER = FyConst.FY_BASE_CHAR + ".charValue.()C";
/**
 * @const
 * @export
 */
FyConst.FY_UNBOX_INTEGER = FyConst.FY_BASE_INT + ".intValue.()I";
/**
 * @const
 * @export
 */
FyConst.FY_UNBOX_FLOAT = FyConst.FY_BASE_FLOAT + ".floatValue.()F";
/**
 * @const
 * @export
 */
FyConst.FY_UNBOX_LONG = FyConst.FY_BASE_LONG + ".longValue.()J";
/**
 * @const
 * @export
 */
FyConst.FY_UNBOX_DOUBLE = FyConst.FY_BASE_DOUBLE + ".doubleValue.()D";

/**
 * @const
 * @export
 */
FyConst.FY_VALUE_BOOLEAN = FyConst.FY_BASE_BOOLEAN + ".value.Z";
/**
 * @const
 * @export
 */
FyConst.FY_VALUE_BYTE = FyConst.FY_BASE_BYTE + ".value.B";
/**
 * @const
 * @export
 */
FyConst.FY_VALUE_SHORT = FyConst.FY_BASE_SHORT + ".value.S";
/**
 * @const
 * @export
 */
FyConst.FY_VALUE_CHARACTER = FyConst.FY_BASE_CHAR + ".value.C";
/**
 * @const
 * @export
 */
FyConst.FY_VALUE_INTEGER = FyConst.FY_BASE_INT + ".value.I";
/**
 * @const
 * @export
 */
FyConst.FY_VALUE_FLOAT = FyConst.FY_BASE_FLOAT + ".value.F";
/**
 * @const
 * @export
 */
FyConst.FY_VALUE_LONG = FyConst.FY_BASE_LONG + ".value.J";
/**
 * @const
 * @export
 */
FyConst.FY_VALUE_DOUBLE = FyConst.FY_BASE_DOUBLE + ".value.D";

/* Methods */
/**
 * @const
 * @export
 */
FyConst.FY_METHOD_INIT = "<init>";
/**
 * @const
 * @export
 */
FyConst.FY_METHOD_CLINIT = "<clinit>";
/**
 * @const
 * @export
 */
FyConst.FY_METHODF_INIT = ".<init>.()V";
/**
 * @const
 * @export
 */
FyConst.FY_METHODF_MAIN = ".main.([L" + FyConst.FY_BASE_STRING + ";)V";
/**
 * @const
 * @export
 */
FyConst.FY_METHODF_RUN = ".run.()V";
/**
 * @const
 * @export
 */
FyConst.FY_METHODF_FINALIZE = ".finalize.()V";
/**
 * @const
 * @export
 */
FyConst.FY_FIELDF_PRIORITY = ".priority.I";
/**
 * @const
 * @export
 */
FyConst.FY_FIELDF_NAME = ".name.[C";
/**
 * @const
 * @export
 */
FyConst.FY_FIELDF_DAEMON = ".daemon.Z";

/* Exceptions */
/**
 * @const
 * @export
 */
FyConst.FY_EXCEPTION_ITE = "java/lang/InvocationTargetException";
/**
 * @const
 * @export
 */
FyConst.FY_EXCEPTION_MONITOR = "java/lang/IllegalMonitorStateException";
/**
 * @const
 * @export
 */
FyConst.FY_EXCEPTION_NO_METHOD = "java/lang/NoSuchMethodError";
/**
 * @const
 * @export
 */
FyConst.FY_EXCEPTION_NPT = "java/lang/NullPointerException";
/**
 * @const
 * @export
 */
FyConst.FY_EXCEPTION_ARITHMETIC = "java/lang/ArithmeticException";
/**
 * @const
 * @export
 */
FyConst.FY_EXCEPTION_INCOMPAT_CHANGE = "java/lang/IncompatibleClassChangeError";
/**
 * @const
 * @export
 */
FyConst.FY_EXCEPTION_VM = "java/lang/VirtualMachineError";
/**
 * @const
 * @export
 */
FyConst.FY_EXCEPTION_CAST = "java/lang/ClassCastException";
/**
 * @const
 * @export
 */
FyConst.FY_EXCEPTION_IO = "java/io/IOException";
/**
 * @const
 * @export
 */
FyConst.FY_EXCEPTION_FNF = "java/io/FileNotFoundException";
/**
 * @const
 * @export
 */
FyConst.FY_EXCEPTION_RT = "java/lang/RuntimeException";
/**
 * @const
 * @export
 */
FyConst.FY_EXCEPTION_IOOB = "java/lang/IndexOutOfBoundsException";
/**
 * @const
 * @export
 */
FyConst.FY_EXCEPTION_AIOOB = "java/lang/ArrayIndexOutOfBoundsException";
/**
 * @const
 * @export
 */
FyConst.FY_EXCEPTION_STORE = "java/lang/ArrayStoreException";
/**
 * @const
 * @export
 */
FyConst.FY_EXCEPTION_CLASSNOTFOUND = "java/lang/ClassNotFoundException";
/**
 * @const
 * @export
 */
FyConst.FY_EXCEPTION_ABSTRACT = "java/lang/AbstractMethodError";
/**
 * @const
 * @export
 */
FyConst.FY_EXCEPTION_ACCESS = "java/lang/IllegalAccessError";
/**
 * @const
 * @export
 */
FyConst.FY_EXCEPTION_NASE = "java/lang/NegativeArraySizeException";
/**
 * @const
 * @export
 */
FyConst.FY_EXCEPTION_INTR = "java/lang/InterruptedException";
/**
 * @const
 * @export
 */
FyConst.FY_EXCEPTION_IMSE = "java/lang/IllegalMonitorStateException";
/**
 * @const
 * @export
 */
FyConst.FY_EXCEPTION_ARGU = "java/lang/IllegalArgumentException";

/* Unique names */
/**
 * @const
 * @export
 */
FyConst.stringArray = "[L" + FyConst.FY_BASE_STRING + ";";
/**
 * @const
 * @export
 */
FyConst.throwablePrintStacktrace = FyConst.FY_BASE_THROWABLE + ".printStackTrace.()V";
/**
 * @const
 * @export
 */
FyConst.throwableDetailMessage = FyConst.FY_BASE_THROWABLE + ".detailMessage.L" + FyConst.FY_BASE_STRING + ";";
/**
 * @const
 * @export
 */
FyConst.throwableStackTrace = FyConst.FY_BASE_THROWABLE + ".stackTrace.[L" + FyConst.FY_BASE_STACKTHREADELEMENT + ";";

/**
 * @const
 * @export
 */
FyConst.stringCount = FyConst.FY_BASE_STRING + ".count.I";
/**
 * @const
 * @export
 */
FyConst.stringValue = FyConst.FY_BASE_STRING + ".value.[C";
/**
 * @const
 * @export
 */
FyConst.stringOffset = FyConst.FY_BASE_STRING + ".offset.I";

/**
 * @const
 * @export
 */
FyConst.stackTraceElementArray = "[L" + FyConst.FY_BASE_STACKTHREADELEMENT + ";";
/**
 * @const
 * @export
 */
FyConst.stackTraceElementDeclaringClass = FyConst.FY_BASE_STACKTHREADELEMENT + ".declaringClass.L" + FyConst.FY_BASE_STRING + ";";
/**
 * @const
 * @export
 */
FyConst.stackTraceElementMethodName = FyConst.FY_BASE_STACKTHREADELEMENT + ".methodName.L" + FyConst.FY_BASE_STRING + ";";
/**
 * @const
 * @export
 */
FyConst.stackTraceElementFileName = FyConst.FY_BASE_STACKTHREADELEMENT + ".fileName.L" + FyConst.FY_BASE_STRING + ";";
/**
 * @const
 * @export
 */
FyConst.stackTraceElementLineNumber = FyConst.FY_BASE_STACKTHREADELEMENT + ".lineNumber.I";

/**
 * @const
 * @export
 */
FyConst.Z = "Z".charCodeAt(0);
/**
 * @const
 * @export
 */
FyConst.B = "B".charCodeAt(0);
/**
 * @const
 * @export
 */
FyConst.C = "C".charCodeAt(0);
/**
 * @const
 * @export
 */
FyConst.S = "S".charCodeAt(0);
/**
 * @const
 * @export
 */
FyConst.I = "I".charCodeAt(0);
/**
 * @const
 * @export
 */
FyConst.F = "F".charCodeAt(0);
/**
 * @const
 * @export
 */
FyConst.J = "J".charCodeAt(0);
/**
 * @const
 * @export
 */
FyConst.D = "D".charCodeAt(0);
/**
 * @const
 * @export
 */
FyConst.L = "L".charCodeAt(0);
/**
 * @const
 * @export
 */
FyConst.V = "V".charCodeAt(0);
/**
 * @const
 * @export
 */
FyConst.ARR = "[".charCodeAt(0);


/**
 * @class
 * @struct
 * @constructor
 */
function FyTableSwitchTarget(def) {
  this.targets = new Array();
  if ("dflt" in def) {
    this.dflt = def["dflt"] | 0;
  } else {
    this.dflt = 0;
  }
  if ("min" in def) {
    this.min = def["min"] | 0;
  } else {
    this.min = 0;
  }
  if ("max" in def) {
    this.max = def["max"] | 0;
  } else {
    this.max = 0;
  }

  var targets = this.targets;
  var defTargets = def["targets"];
  for (var j = 0; j < defTargets.length; j++) {
    var target = defTargets[j] | 0;
    targets.push(target);
  }
};

/**
 * @class
 * @struct
 * @constructor
 */
function FyLookupSwitchTarget(def) {
  if ("dflt" in def) {
    this.dflt = def["dflt"] | 0;
  } else {
    this.dflt = 0;
  }
  this.targets = new HashMapI(-1, 1, 0.8);

  var targets = this.targets;
  var defTargets = def["targets"];

  for (var j = 0, max = defTargets.length - 1; j < max; j += 2) {
    var j2 = j + 1;
    var key = defTargets[j] | 0;
    var value = defTargets[j2] | 0;
    targets.put(key, value);
  }
};

/**
 * FyException
 *
 * @param {string|null}
 *            clazz Class name for inner class
 * @param {string|null}
 *            message message
 * @class
 * @constructor
 * @export
 */
function FyException(clazz, message) {
  Error.call(this, (clazz ? (clazz + ": ") : "") + message);
  /**
   * @override
   */
  this.name = "FyException";
  /**
   * @type {string|null}
   */
  this.clazz = clazz;
  /**
   * @type {string|null}
   */
  this.message = message;
  /**
   * @override
   */
  this.stack = new Error((clazz ? (clazz + ": ") : "") + message).stack;
  if (!clazz) {
    clazz = null;
  }
};

FyException.prototype = new Error("FyException");

/**
 * @override
 * @return {string}
 */
FyException.prototype.toString = function() {
  return "" + (this.clazz ? this.clazz : "FatalError") + ": " + this.message + (this.stack ? ("\n" + this.stack) : "");
};

/**
 * @constructor
 * @export
 * @class
 * @param {?} data
 * @param {Error} cause
 */
function FyPanicException(data, cause) {
  Error.call(this, "panic");
  if (Object.prototype.toString.call([]) === "[object Array]") {
    /**
     * @type {string}
     */
    this.message = data.join("\n");
  } else {
    this.message = String(data);
  }
  /**
   * @type {Error}
   */
  this.cause = cause;
  /**
   * @type {string}
   */
  this.name = "FyPanicException";
  /**
   * @type {string}
   */
  this.stack = new Error("panic").stack;
};

FyPanicException.prototype = new Error("FyPanicException");

FyPanicException.prototype.toString = function() {
  return "Panic: " + this.message + (this.stack ? ("\n##Stack:\n" + this.stack) : "");
}

/**
 * Message method <-> thread <-> threadManager <-> outer
 *
 * @constructor
 * @struct
 * @export
 */
function FyMessage() {
  /**
   * @type {number}
   */
  this.type = 0;
  /**
   * @type {FyThread}
   */
  this.thread = null;
  /**
   * @type {number}
   */
  this.sleepTime = 0;
  /**
   * @type {string|null}
   */
  this.nativeMethod = null;
  /**
   * @type {number}
   */
  this.sp = 0;
};

/**
 * @export
 * @returns {number}
 */
FyMessage.prototype.getType = function() {
  return this.type;
}

/**
 * @export
 * @returns {FyThread}
 */
FyMessage.prototype.getThread = function() {
  return this.thread;
}

/**
 * @export
 * @returns {number}
 */
FyMessage.prototype.getSleepTime = function() {
  return this.sleepTime;
}

/**
 * @export
 * @returns {string|null}
 */
FyMessage.prototype.getNativeMethod = function() {
  return this.nativeMethod;
}

/**
 * @export
 * @returns {number}
 */
FyMessage.prototype.getsp = function() {
  return this.sp;
}

/**
 * @const
 * @type {number}
 */
FyMessage.message_continue = 0; // In thread
/**
 * @const
 * @type {number}
 */
FyMessage.message_none = 1; // Thread Only
/**
 * @const
 * @type {number}
 */
FyMessage.message_thread_dead = 2; // Thread Only
/**
 * @const
 * @export
 * @type {number}
 */
FyMessage.message_invoke_native = 3; // Thread And TM pass thread
/**
 * @const
 * @export
 * @type {number}
 */
FyMessage.message_exception = 4; // Thread And TM pass thread
/**
 * @const
 * @export
 * @type {number}
 */
FyMessage.message_sleep = 5; // TM Only
/**
 * @const
 * @export
 * @type {number}
 */
FyMessage.message_vm_dead = 6;