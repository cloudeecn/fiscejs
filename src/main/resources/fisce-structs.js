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
function __FiScEUtils() {

};

/**
 * copy all attributes from src into dest
 * 
 * @param src
 * @param dest
 */
__FiScEUtils.prototype.shallowClone = function(src, dest) {
	for ( var key in src) {
		dest[key] = src[key];
	}
};

var FiScEUtils = new __FiScEUtils();

function __FiScEConst() {
	this.TYPE_OBJECT = 0;
	this.TYPE_PRIMITIVE = 1;
	this.TYPE_ARRAY = 2;
	this.ARRAY_TYPE_BYTE = 0;
	this.ARRAY_TYPE_SHORT = 1;
	this.ARRAY_TYPE_INT = 2;
	this.ARRAY_TYPE_LONG = 3;
	/* Access flags */
	this.FY_ACC_ABSTRACT = 1024;
	this.FY_ACC_FINAL = 16;
	this.FY_ACC_INTERFACE = 512;
	this.FY_ACC_NATIVE = 256;
	this.FY_ACC_PRIVATE = 2;
	this.FY_ACC_PROTECTED = 4;
	this.FY_ACC_PUBLIC = 1;
	this.FY_ACC_STATIC = 8;
	this.FY_ACC_STRICT = 2048;
	this.FY_ACC_SUPER = 32;
	this.FY_ACC_SYNCHRONIZED = 32;
	this.FY_ACC_TRANSIENT = 128;
	this.FY_ACC_VOLATILE = 64;
	this.FY_ACC_VARARGS = 128;
	this.FY_ACC_BRIDGE = 64;
	/* Extended access flags */
	this.FY_ACC_SYNTHETIC = 0x00001000;
	this.FY_ACC_ANNOTATION = 0x00002000;
	this.FY_ACC_ENUM = 0x00004000;
	this.FY_ACC_SOFT_REF = 0x00008000;
	this.FY_ACC_WEAK_REF = 0x00010000;
	this.FY_ACC_PHANTOM_REF = 0x00020000;
	this.FY_ACC_CONSTRUCTOR = 0x00100000;
	this.FY_ACC_CLINIT = 0x00200000;
	this.FY_ACC_VERIFIED = 0x80000000;

	this.FY_TM_STATE_NEW = 0;
	this.FY_TM_STATE_BOOT_PENDING = 1;
	this.FY_TM_STATE_STOP = 2;
	this.FY_TM_STATE_RUN_PENDING = 3;
	this.FY_TM_STATE_RUNNING = 4;
	this.FY_TM_STATE_STOP_PENDING = 5;
	this.FY_TM_STATE_DEAD_PENDING = 6;
	this.FY_TM_STATE_DEAD = 7;

	/* Array types */
	this.FY_AT_BYTE = 0;
	this.FY_AT_SHORT = 1;
	this.FY_AT_INT = 2;
	this.FY_AT_LONG = 3;

	/* Prm types */
	this.FY_TYPE_BYTE = 'B';
	this.FY_TYPE_CHAR = 'C';
	this.FY_TYPE_DOUBLE = 'D';
	this.FY_TYPE_FLOAT = 'F';
	this.FY_TYPE_LONG = 'J';
	this.FY_TYPE_SHORT = 'S';
	this.FY_TYPE_BOOLEAN = 'Z';
	this.FY_TYPE_ARRAY = '[';
	/* Below are shared by thread and context */
	this.FY_TYPE_INT = 'I';
	this.FY_TYPE_HANDLE = 'L';
	/* Below are used only by thread */
	this.FY_TYPE_WIDE = 'W';
	this.FY_TYPE_RETURN = 'R';
	this.FY_TYPE_WIDE2 = '_';
	this.FY_TYPE_UNKNOWN = 'X';
	this.FY_TYPE_VOID = 'V';

	this.FY_ATT_CODE = "Code";
	this.FY_ATT_LINENUM = "LineNumberTable";
	this.FY_ATT_SYNTH = "Synthetic";
	this.FY_ATT_SOURCE_FILE = "SourceFile";
	this.FY_ATT_CONSTANT_VALIE = "ConstantValue";

	/* Core classes */
	this.FY_BASE_STRING = "java/lang/String";
	this.FY_BASE_VM = "com/cirnoworks/fisce/privat/FiScEVM";
	this.FY_BASE_ENUM = "java/lang/Enum";
	this.FY_BASE_ANNOTATION = "java/lang/annotation/Annotation";
	this.FY_BASE_STRING_BUILDER = "java/lang/StringBuilder";
	this.FY_BASE_OBJECT = "java/lang/Object";
	this.FY_BASE_CLASS = "java/lang/Class";
	this.FY_BASE_CLASSLOADER = "java/lang/ClassLoader";
	this.FY_BASE_THROWABLE = "java/lang/Throwable";
	this.FY_BASE_THREAD = "java/lang/Thread";
	this.FY_BASE_SYSTEM = "java/lang/System";
	this.FY_BASE_RUNTIME = "java/lang/Runtime";
	this.FY_BASE_BOOLEAN = "java/lang/Boolean";
	this.FY_BASE_BYTE = "java/lang/Byte";
	this.FY_BASE_CHAR = "java/lang/Character";
	this.FY_BASE_SHORT = "java/lang/Short";
	this.FY_BASE_INT = "java/lang/Integer";
	this.FY_BASE_LONG = "java/lang/Long";
	this.FY_BASE_FLOAT = "java/lang/Float";
	this.FY_BASE_DOUBLE = "java/lang/Double";
	this.FY_BASE_MATH = "java/lang/Math";
	this.FY_BASE_FINALIZER = "java/lang/Finalizer";
	this.FY_BASE_RUNTIME = "java/lang/Runtime";

	this.FY_IO_INPUTSTREAM = "java/io/InputStream";
	this.FY_IO_PRINTSTREAM = "java/io/PrintStream";

	this.FY_REFLECT_ARRAY = "java/lang/reflect/Array";
	this.FY_REFLECT_CONSTRUCTOR = "java/lang/reflect/Constructor";
	this.FY_REFLECT_FIELD = "java/lang/reflect/Field";
	this.FY_REFLECT_METHOD = "java/lang/reflect/Method";
	this.FY_REFLECT_PROXY = "java/lang/reflect/Proxy";

	this.FY_REF_SOFT = "java/lang/ref/SoftReference";
	this.FY_REF_WEAK = "java/lang/ref/WeakReference";
	this.FY_REF_PHANTOM = "java/lang/ref/PhantomReference";
	this.FY_REF = "java/lang/ref/Reference";

	this.FY_BASE_STACKTHREADELEMENT = "java/lang/StackTraceElement";

	this.FY_BOX_BOOLEAN = this.FY_BASE_BOOLEAN + ".valueOf.(Z).L"
			+ this.FY_BASE_BOOLEAN + ";", this.FY_BOX_BYTE = this.FY_BASE_BYTE
			+ ".valueOf.(B).L" + this.FY_BASE_BYTE + ";";
	this.FY_BOX_SHORT = this.FY_BASE_SHORT + ".valueOf.(S).L"
			+ this.FY_BASE_SHORT + ";";
	this.FY_BOX_CHARACTER = this.FY_BASE_CHARACTER + ".valueOf.(C).L"
			+ this.FY_BASE_CHARACTER + ";";
	this.FY_BOX_INTEGER = this.FY_BASE_INTEGER + ".valueOf.(I).L"
			+ this.FY_BASE_INTEGER + ";";
	this.FY_BOX_FLOAT = this.FY_BASE_FLOAT + ".valueOf.(F).L"
			+ this.FY_BASE_FLOAT + ";";
	this.FY_BOX_LONG = this.FY_BASE_LONG + ".valueOf.(J).L" + this.FY_BASE_LONG
			+ ";", this.FY_BOX_DOUBLE = this.FY_BASE_DOUBLE + ".valueOf.(D).L"
			+ this.FY_BASE_DOUBLE + ";";

	this.FY_UNBOX_BOOLEAN = this.FY_BASE_BOOLEAN + ".booleanValue.()Z";
	this.FY_UNBOX_BYTE = this.FY_BASE_BYTE + ".byteValue.()B";
	this.FY_UNBOX_SHORT = this.FY_BASE_SHORT + ".shortValue.()S";
	this.FY_UNBOX_CHARACTER = this.FY_BASE_CHAR + ".charValue.()C";
	this.FY_UNBOX_INTEGER = this.FY_BASE_INT + ".intValue.()I";
	this.FY_UNBOX_FLOAT = this.FY_BASE_FLOAT + ".floatValue.()F";
	this.FY_UNBOX_LONG = this.FY_BASE_LONG + ".longValue.()J";
	this.FY_UNBOX_DOUBLE = this.FY_BASE_DOUBLE + ".doubleValue.()D";

	this.FY_VALUE_BOOLEAN = this.FY_BASE_BOOLEAN + ".value.Z";
	this.FY_VALUE_BYTE = this.FY_BASE_BYTE + ".value.B";
	this.FY_VALUE_SHORT = this.FY_BASE_SHORT + ".value.S";
	this.FY_VALUE_CHARACTER = this.FY_BASE_CHAR + ".value.C";
	this.FY_VALUE_INTEGER = this.FY_BASE_INT + ".value.I";
	this.FY_VALUE_FLOAT = this.FY_BASE_FLOAT + ".value.F";
	this.FY_VALUE_LONG = this.FY_BASE_LONG + ".value.J";
	this.FY_VALUE_DOUBLE = this.FY_BASE_DOUBLE + ".value.D";

	/* Methods */
	this.FY_METHOD_INIT = "<init>";
	this.FY_METHOD_CLINIT = "<clinit>";
	this.FY_METHODF_MAIN = ".main.([L" + this.FY_BASE_STRING + ";)V";
	this.FY_METHODF_RUN = ".run.()V";
	this.FY_METHODF_FINALIZE = ".finalize.()V";
	this.FY_FIELDF_PRIORITY = ".priority.I";
	this.FY_FIELDF_NAME = ".name.[C";
	this.FY_FIELDF_DAEMON = ".daemon.Z";

	/* Exceptions */
	this.FY_EXCEPTION_ITE = "java/lang/InvocationTargetException";
	this.FY_EXCEPTION_MONITOR = "java/lang/IllegalMonitorStateException";
	this.FY_EXCEPTION_NO_METHOD = "java/lang/NoSuchMethodError";
	this.FY_EXCEPTION_NPT = "java/lang/NullPointerException";
	this.FY_EXCEPTION_ARITHMETIC = "java/lang/ArithmeticException";
	this.FY_EXCEPTION_INCOMPAT_CHANGE = "java/lang/IncompatibleClassChangeError";
	this.FY_EXCEPTION_VM = "java/lang/VirtualMachineError";
	this.FY_EXCEPTION_CAST = "java/lang/ClassCastException";
	this.FY_EXCEPTION_IO = "java/io/IOException";
	this.FY_EXCEPTION_FNF = "java/io/FileNotFoundException";
	this.FY_EXCEPTION_RT = "java/lang/RuntimeException";
	this.FY_EXCEPTION_IOOB = "java/lang/IndexOutOfBoundsException";
	this.FY_EXCEPTION_AIOOB = "java/lang/ArrayIndexOutOfBoundsException";
	this.FY_EXCEPTION_STORE = "java/lang/ArrayStoreException";
	this.FY_EXCEPTION_CLASSNOTFOUND = "java/lang/ClassNotFoundException";
	this.FY_EXCEPTION_ABSTRACT = "java/lang/AbstractMethodError";
	this.FY_EXCEPTION_ACCESS = "java/lang/IllegalAccessError";
	this.FY_EXCEPTION_NASE = "java/lang/NegativeArraySizeException";
	this.FY_EXCEPTION_INTR = "java/lang/InterruptedException";
	this.FY_EXCEPTION_IMSE = "java/lang/IllegalMonitorStateException";
	this.FY_EXCEPTION_ARGU = "java/lang/IllegalArgumentException";
}

var FiScEConst = new __FiScEConst();

function FiScELineNumber() {
	this.start = 0;
	this.line = 0;
}

function FiScEExceptionHandler() {
	this.start = 0;
	this.end = 0;
	this.exceptionClassName = "";
	this.handler = 0;

	/***************************************************************************
	 * Filled in by class loader /**
	 * 
	 * @type {FiScEClass}
	 */
	this.exceptionClass = undefined;
}

function FiScEMethod() {
	this.name = "";
	this.descriptor = "";
	this.accessFlags = "";

	this.paramStackUsage = 0;
	this.paramType = "";
	this.returnType = "";

	this.parameterCount = 0;
	this.parameterClassNames = [];
	this.returnClassName = "";

	this.exceptionTable = [];
	this.lineNumberTable = [];

	this.maxStack = 0;
	this.maxLocals = 0;
	this.code = [];

	/** Filled in by class loader phase 1* */
	this.fullName = "";
	this.uniqueName = "";
	this.owner = undefined;

	/** Filled in by class loader* */
	this.methodId = 0;

	this.nativeHandler = undefined;
	this.compiledCode = undefined;

	this.clinited = false;
}

function FiScEField() {
	this.name = "";
	this.descriptor = "";
	this.accessFlags = 0;
	this.posRel = "";
	this.size = "";

	/** Filled in by class loader phase 1* */
	this.fullName = "";
	this.uniqueName = "";
	this.owner = undefined;

	/** Filled in by class loader* */
	this.fieldId = 0;

	this.constantValue = "";

	this.type = undefined;

	this.posAbs = 0;
}

function FiScEClass(type) {
	this.name = "";
	this.sourceFile = undefined;

	this.majorVersion = 0;
	this.minorVersion = 0;
	this.constants = [];

	this.accessFlags = 0;
	this.needFinalize = false;
	this.superClassName = undefined;
	this.interfaceNames = [];

	this.fields = [];
	this.methods = [];
	this.sizeRel = 0;
	this.staticSize = 0;

	this.phase = 0;

	/* Filled by class loader */
	this.classId = 0;
	this.sizeAbs = 0;
	this.ofsInHeap = 0;

	this.interfaces = [];

	this.staticArea = undefined;

	this.superClass = undefined;
	this.type = type;
	/*
	 * this.arr = { arrayType : 0, contentClass : undefined };
	 * 
	 * this.prm = { pType : "" };
	 */

	this.clinitThreadId = 0;
	/**
	 * @return FiScEMethod
	 */
	this.clinit = undefined;

	/* BEGIN GC Only */
	this.staticFields = [];
	this.absFields = [];
	/* END GC Only */

	this.virtualTable = {};
}
/**
 * FiScEException
 * 
 * @param {String}
 *            clazz Class name for inner class
 * @param {String}
 *            msg message
 */
function FiScEException(clazz, msg) {
	this.clazz = clazz;
	this.msg = msg;
}

/**
 * FiScEInputStream
 * 
 * @param {FiScEContext}
 *            context
 * @param {Object}
 *            data
 * @param {function}
 *            readFunction
 * @param {function}
 *            readBlockFunction
 * @param {function}
 *            skipFunction
 * @param {function}
 *            closeFunction
 * @returns
 */
function FiScEInputStream(context, data, readFunction, readBlockFunction,
		skipFunction, closeFunction) {
	this.context = context;
	this.data = data;
	this.readFunction = readFunction;
	this.readBlockFunction = readBlockFunction;
	this.skipFunction = skipFunction;
	this.closeFunction = closeFunction;
};
