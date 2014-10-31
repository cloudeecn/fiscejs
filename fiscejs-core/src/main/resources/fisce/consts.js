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