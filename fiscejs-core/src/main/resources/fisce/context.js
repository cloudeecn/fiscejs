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

var FyContext;
var FyGlobal;
var FyClassDef;
(function() {
	"use strict";

	FyGlobal = function(context, strings, constants) {
		var i, im;
		im = strings.length;
		this.strings = new Array(im);
		for (i = 0; i < im; i++) {
			this.strings[i] = context.pool(strings[i]);
		}
		im = constants.length;
		this.constants = new Int32Array(im);
		for (i = 0; i < im; i++) {
			this.constants[i] = constants[i] | 0;
		}
	};

	FyClassDef = function(context, data) {
		this.classes = data.classes;
		this.global = new FyGlobal(context, data.strings, data.constants);
	};

	/**
	 * lookup constant from constant pool
	 * 
	 * @param array
	 *            constant pool
	 * @param obj
	 *            object
	 * @param {String}
	 *            field field
	 * 
	 * @returns constant object
	 */
	function lookup(array, idx) {
		if (typeof idx !== "number" || array.length === undefined || idx < 0
				|| idx >= array.length) {
			throw new FyException(undefined, "IllegalArgumentException: "
					+ array.length + "[" + idx + "]");
		}
		return array[idx];
	}

	/**
	 * Walk through all interfaces from one class, and invoke a custom function
	 * on it
	 * 
	 * @param {FyClass}
	 *            clazz
	 * @param {Function}
	 *            fun
	 * @param {Object}
	 *            walked
	 */
	function walkInterfaces(clazz, fun, $this, walked) {
		if (clazz.name === "EXCLUDE/fisce/test/TestTag2") {
			var test_breakpoint = 0;
			test_breakpoint++;
		}
		var ret;
		var toWalk = [];
		if (!walked) {
			walked = {};
		}

		for (var i = 0, max = clazz.interfaces.length; i < max; i++) {
			/**
			 * @returns {FyClass}
			 */
			var intf = clazz.interfaces[i];
			if (!walked[intf.classId]) {
				toWalk.push(intf);
				walked[intf.classId] = true;
				ret = fun.call($this, intf);
				if (ret !== undefined) {
					return ret;
				}
			}
		}

		for (var i = 0, max = toWalk.length; i < max; i++) {
			ret = walkInterfaces(toWalk[i], fun, $this, walked);
			if (ret !== undefined) {
				return ret;
			}
		}

		if (((clazz.accessFlags & FyConst.FY_ACC_INTERFACE) === 0)
				&& (clazz.superClass)) {
			ret = walkInterfaces(clazz.superClass, fun, $this, walked);
			if (ret !== undefined) {
				return ret;
			}
		}
		return undefined;
	}

	FyContext = function(namespace) {
		var levels = [ "D", "I", "W", "E" ];
		this.settings = {};
		this.classDefs = [];
		this.dynamicClassDef = {};

		/* Classes begins from 1 */
		this.classes = new HashMapIObj(8, 0.6);
		this.mapClassNameToId = {};
		this.mapClassIdToHandle = new HashMapI(0, 4, 0.6);

		/* Methods begins from 0 */
		this.methods = new HashMapIObj(10, 0.6);
		this.mapMethodNameToId = {};
		this.mapMethodIdToHandle = new HashMapI(0, 4, 0.6);

		/* Fields begins from 0 */
		this.fields = new HashMapIObj(10, 0.6);
		this.mapFieldNameToId = {};
		this.mapFieldIdToHandle = new HashMapI(0, 4, 0.6);

		this.nativeHandlers = {};
		this.nativeAOT = {};

		this.classLoader = new FyClassLoader(this);
		this.heap = new FyHeap(this);
		this.threadManager = new FyThreadManager(this);
		if (namespace === undefined) {
			namespace = "default";
		}
		this.vfs = new FyVFS(namespace);

		this.log = function(level, content) {
			if (FyConfig.debugMode || level > 0) {
				console.log(levels[level] + ": " + content);
			}
		};

		/** Special types* */
		/**
		 * TOP_OBJECT
		 * 
		 * @returns {FyClass}
		 */
		this.TOP_OBJECT = undefined;
		/**
		 * @returns {FyClass}
		 */
		this.TOP_THROWABLE = undefined;
		/**
		 * @returns {FyClass}
		 */
		this.TOP_ENUM = undefined;
		/**
		 * @returns {FyClass}
		 */
		this.TOP_ANNOTATION = undefined;
		/**
		 * @returns {FyClass}
		 */
		this.TOP_SOFT_REF = undefined;
		/**
		 * @returns {FyClass}
		 */
		this.TOP_WEAK_REF = undefined;
		/**
		 * @returns {FyClass}
		 */
		this.TOP_PHANTOM_REF = undefined;
		/**
		 * @returns {FyClass}
		 */
		this.TOP_CLASS = undefined;
		/**
		 * @returns {FyClass}
		 */
		this.TOP_METHOD = undefined;
		/**
		 * @returns {FyClass}
		 */
		this.TOP_FIELD = undefined;
		/**
		 * @returns {FyClass}
		 */
		this.TOP_CONSTRUCTOR = undefined;
	};

	FyContext.primitives = {
		Z : '<boolean',
		B : '<byte',
		S : '<short',
		C : '<char',
		I : '<int',
		F : '<float',
		J : '<long',
		D : '<double',
		V : '<void'
	};

	FyContext.mapPrimitivesRev = {
		'<boolean' : 'Z',
		'<byte' : 'B',
		'<short' : 'S',
		'<char' : 'C',
		'<int' : 'I',
		'<float' : 'F',
		'<long' : 'J',
		'<double' : 'D',
		'<void' : 'V'
	};

	FyContext.stringPool = {};

	FyContext.staticNativeHandlers = {};

	FyContext.staticNativeAOT = {};

	FyContext.registerStaticNA = function(name, func) {
		this.staticNativeAOT[name] = func;
	};

	FyContext.registerStaticNH = function(name, func, extraVars, extraStack) {
		this.staticNativeHandlers[name] = {
			func : func,
			extraVars : extraVars | 0,
			stackSize : extraStack | 0
		};
	};

	/**
	 * Pool a string to string pool
	 * 
	 * @param {String}
	 *            string
	 * @returns {String} result
	 */
	FyContext.prototype.pool = function(string) {
		if ((string in FyContext.stringPool)
				&& "string" === typeof FyContext.stringPool[string]) {
			return FyContext.stringPool[string];
		} else {
			FyContext.stringPool[string] = string;
			return string;
		}
	};

	FyContext.prototype.getSetting = function(key, defaultValue) {
		var result = settings[key];
		if (result === undefined) {
			return defaultValue;
		} else {
			return result;
		}
	};

	FyContext.prototype.addDynamicClassDef = function(name, strData) {
		this.dynamicClassDef[name] = strData;
		this.addClassDef(JSON.parse(strData));
	};

	FyContext.prototype.addClassDef = function(data) {
		this.classDefs.push(new FyClassDef(this, data));
	};
	/**
	 * Register a field to context
	 * 
	 * @param {FyField}
	 *            field
	 */
	FyContext.prototype.registerField = function(field) {
		var fid = 0;
		if (field.uniqueName in this.mapFieldNameToId) {
			fid = this.mapFieldNameToId[field.uniqueName] | 0;
		} else {
			fid = this.fields.size() | 0;
			field.setFieldId(fid);
			this.mapFieldNameToId[field.uniqueName] = fid;
		}
		this.fields.put(fid, field);
	};
	/**
	 * get field by name
	 * 
	 * @param {string}
	 *            uniqueName
	 * @returns {FyField} field
	 */
	FyContext.prototype.getField = function(uniqueName) {
		if (uniqueName in this.mapFieldNameToId) {
			return this.fields.get(this.mapFieldNameToId[uniqueName]);
		} else {
			return undefined;
		}
	};

	/**
	 * Lookup field throw class and super classes
	 * 
	 * @param {FyClass}
	 *            clazz
	 * @param {String}
	 *            fullName
	 * @returns {FyField}
	 */
	FyContext.prototype.lookupFieldVirtual = function(clazz, fullName) {
		/**
		 * @returns {FyClass}
		 */
		var c = clazz;
		var name;
		var fid = 0 | 0;

		whilc(c !== undefined)
		{
			name = this.pool(c.name + fullName);
			if (name in this.mapFieldNameToId) {
				fid = this.mapFieldNameToId[name] | 0;
				if (c !== clazz) {
					this.mapFieldNameToId[this.pool(clazz.name + fullName)] = fid;
				}
				return this.fields.get(fid);
			}
			c = c.superClass;
		}

		return walkInterfaces(clazz,
		/**
		 * @param {FyClass}
		 *            intf
		 */
		function(intf) {
			var name = this.pool(intf.name + fullName);
			var fid = 0 | 0;
			if (name in this.mapFieldNameToId) {
				fid = this.mapFieldNameToId[name] | 0;
				this.mapFieldNameToId[this.pool(clazz.name + fullName)] = fid;
				return this.fields.get(fid);
			} else {
				return undefined;
			}
		}, this);
	};

	/**
	 * Lookup a field from field constant
	 * 
	 * @param {FyGlobal}
	 *            global
	 * @param {Number}
	 *            constant : field constant
	 * @returns {FyField} field
	 */
	FyContext.prototype.lookupFieldVirtualFromConstant = function(global,
			constant) {
		var constants = global.constants;
		var resolvedField;
		if (!constants[constant + 2]) {
			var strings = global.strings;
			/**
			 * @returns {FyClass}
			 */
			var clazz = this.lookupClass(strings[constants[constant]]);
			if (clazz === undefined) {
				throw new FyException(FyConst.FY_EXCEPTION_CLASSNOTFOUND,
						strings[constants[constant]]);
			}

			resolvedField = this.lookupFieldVirtual(clazz,
					strings[constants[constant + 1]]);
			if (resolvedField) {
				constants[constant] = resolvedField.fieldId;
				constants[constant + 2] = 1;
			} else {
				throw new FyException(FyConst.FY_EXCEPTION_INCOMPAT_CHANGE,
						strings[constants[constant]] + "."
								+ strings[constants[constant + 1]]
								+ " not found");
			}
			// delete constant.className;
			// delete constant.nameAndType;
		} else {
			resolvedField = this.fields[constants[constant]];
		}
		return resolvedField;
	};

	/**
	 * Register a method to context
	 * 
	 * @param {FyMethod}
	 *            method
	 */
	FyContext.prototype.registerMethod = function(method) {
		var mid;
		if (method.uniqueName in this.mapMethodNameToId) {
			// mid = this.mapMethodNameToId[] | 0;
			mid = this.mapMethodNameToId[method.uniqueName] | 0;
		} else {
			mid = this.methods.size();
			this.mapMethodNameToId[method.uniqueName] = mid;
		}
		method.setMethodId(mid);
		this.methods.put(mid, method);
	};
	/**
	 * get method by name
	 * 
	 * @param {string}
	 *            uniqueName
	 * @returns {FyMethod} method
	 */
	FyContext.prototype.getMethod = function(uniqueName) {
		if (uniqueName in this.mapMethodNameToId) {
			return this.methods.get(this.mapMethodNameToId[uniqueName] | 0);
		} else {
			return undefined;
		}
	};

	/**
	 * 
	 * Lookup method from specific class and it's super classes
	 * 
	 * @param {FyClass}
	 *            clazz
	 * @param {String}
	 *            fullName
	 * @returns {FyMethod} method
	 */
	FyContext.prototype.lookupMethodVirtual = function(clazz, fullName) {
		/**
		 * @returns {FyClass}
		 */
		var c = clazz;

		var name;
		var mid;

		while (c !== undefined) {
			name = c.name + fullName;
			if (name in this.mapMethodNameToId) {
				mid = this.mapMethodNameToId[name] | 0;
				if (c !== clazz) {
					this.mapMethodNameToId[this.pool(clazz.name + fullName)] = mid;
				}
				return this.methods.get(mid);
			}

			c = c.superClass;
		}

		return walkInterfaces(clazz,
		/**
		 * @param {FyClass}
		 *            intf
		 */
		function(intf) {
			var name = this.pool(intf.name + fullName);
			var mid;
			if (name in this.mapMethodNameToId) {
				mid = this.mapMethodNameToId[name] | 0;
				this.mapMethodNameToId[this.pool(clazz.name + fullName)] = mid;
				return this.methods.get(mid);
			} else {
				return undefined;
			}
		}, this);
	};

	/**
	 * Lookup method virtually
	 * 
	 * @param {FyClass}
	 *            clazz
	 * @param {FyMethod}
	 *            method
	 * @returns {FyMethod} method
	 */
	FyContext.prototype.lookupMethodVirtualByMethod = function(clazz, method) {
		var mid = method.methodId;
		/**
		 * @returns {Number}
		 */
		var ret = clazz.virtualTable.get(mid);
		if (ret === -1) {
			var m = this.lookupMethodVirtual(clazz, method.fullName);
			if (m === undefined || (m.accessFlags & FyConst.FY_ACC_ABSTRACT)) {
				throw new FyException(FyConst.FY_EXCEPTION_ABSTRACT, clazz.name
						+ method.fullName);
			}
			if (m.accessFlags & FyConst.FY_ACC_STATIC) {
				throw new FyException(FyConst.FY_EXCEPTION_INCOMPAT_CHANGE,
						"Method " + clazz.name + method.fullName
								+ " changed to static");
			}
			clazz.virtualTable.put(mid, ret = m.methodId);
		}
		return this.methods.get(ret);
	};

	/**
	 * Lookup a method from method constant
	 * 
	 * @param {FyGlobal}
	 *            global
	 * @param {Number}
	 *            constant : method constant
	 * @returns {FyMethod} method
	 */
	FyContext.prototype.lookupMethodVirtualFromConstant = function(global,
			constant) {
		var constants = global.constants;
		var resolvedMethod;
		if (constant < 0 || constant + 2 >= constants.length) {
			throw new Error("IOOB");
		}
		if (constants[constant + 2] === 0) {
			var strings = global.strings;
			/**
			 * @returns {FyClass}
			 */
			var clazz = this.lookupClass(strings[constants[constant]]);
			if (clazz === undefined) {
				throw new FyException(FyConst.FY_EXCEPTION_CLASSNOTFOUND,
						strings[constants[constant]]);
			}

			resolvedMethod = this.lookupMethodVirtual(clazz,
					strings[constants[constant + 1]]);
			if (resolvedMethod !== undefined) {
				constants[constant] = resolvedMethod.methodId;
				constants[constant + 2] = 1;
			} else {
				throw new FyException(FyConst.FY_EXCEPTION_INCOMPAT_CHANGE,
						strings[constants[constant]] + "."
								+ strings[constants[constant + 1]]
								+ " not found");
			}
			// delete constant.className;
			// delete constant.nameAndType;
		} else {
			resolvedMethod = this.methods.get(constants[constant]);
		}
		return resolvedMethod;
	};

	/**
	 * Register a class to context
	 * 
	 * @param {FyClass}
	 *            clazz
	 */
	FyContext.prototype.registerClass = function(clazz) {
		var cid;
		if (clazz.name in this.mapClassNameToId) {
			cid = this.mapClassNameToId[clazz.name] | 0;
			if (this.classes.contains(cid)) {
				throw new FyException(undefined, "Duplicated class define: "
						+ clazz.name);
			}
		} else {
			cid = (this.classes.size() + 1) | 0;
			this.mapClassNameToId[clazz.name] = cid | 0;
		}
		clazz.setClassId(cid);
		this.classes.put(cid, clazz);
	};

	/**
	 * Get class from class name
	 * 
	 * @param {string}
	 *            name
	 * @returns {FyClass} class to return
	 */
	FyContext.prototype.getClass = function(name) {
		if (name in this.mapClassNameToId) {
			return this.classes.get(this.mapClassNameToId[name]);
		} else {
			return undefined;
		}
	};

	/**
	 * @param name
	 *            {String}
	 * @returns {FyClass}
	 */
	FyContext.prototype.lookupClassPhase1 = function(name) {
		if (typeof name !== "string") {
			throw new FyException(undefined, "Class name for load is null!");
		}
		var clazz = this.getClass(name);
		if (clazz === undefined) {
			clazz = this.classLoader.loadClass(name);
			if (clazz !== undefined) {
				this.registerClass(clazz);
			}
		}
		return clazz;
	};

	/**
	 * Get or load class with class name
	 * 
	 * @param {string}
	 *            name
	 * @returns {FyClass} class to return
	 */
	FyContext.prototype.lookupClass = function(name) {

		var clazz = this.classLoader.lookupAndPend(name);
		this.classLoader.fixPending();
		return clazz;
	};

	/**
	 * Get a class as clazz[]
	 * 
	 * @param {FyObject}
	 *            clazz
	 * @returns {FyClass}
	 */
	FyContext.prototype.lookupArrayClass = function(clazz) {
		if (clazz.type === FyConst.TYPE_OBJECT) {
			return this.lookupClass("[L" + clazz.name + ";");
		} else if (clazz.type === FyConst.TYPE_ARRAY) {
			return this.lookupClass("[" + clazz.name);
		} else {
			return this.lookupClass("["
					+ FyContext.mapPrimitivesRev[clazz.name]);
		}
	};

	/**
	 * Lookup class from constant phase1
	 * 
	 * @param {FyGlobal}
	 *            global
	 * @param {Number}
	 *            constant the constant pos
	 * @returns {FyClass}
	 */
	FyContext.prototype.lookupClassFromConstantPhase1 = function(global,
			constant) {
		var constants = global.constants;
		var clazz = undefined;
		var c2 = constant + 2;
		if (constant < 0 || c2 >= constants.length) {
			throw new Error("IOOB");
		}
		if (constants[c2] === 0) {
			var strings = global.strings;
			// console.log(constant + ", " + constants[constant] + ", "
			// + strings[constants[constant]]);
			clazz = this.lookupClassPhase1(strings[constants[constant]]);
			if (clazz === undefined) {
				throw new FyException(FyConst.FY_EXCEPTION_CLASSNOTFOUND,
						constant.name);
			}
			constants[constant] = clazz.classId;
			constants[c2] = 1;
		} else {
			clazz = this.classes.get(constants[constant] | 0);
		}
		return clazz;
	};

	/**
	 * Lookup class from constant
	 * 
	 * @param constant
	 *            the constant entry
	 * @returns {FyClass}
	 */
	FyContext.prototype.lookupClassFromConstant = function(global, constant) {
		var constants = global.constants;
		var clazz = undefined;
		var c2 = constant + 2;
		if (constant < 0 || c2 >= constants.length) {
			throw new Error("IOOB");
		}
		if (constants[c2] === 0) {
			var strings = global.strings;
			clazz = this.lookupClass(strings[constants[constant]]);
			if (clazz === undefined) {
				throw new FyException(FyConst.FY_EXCEPTION_CLASSNOTFOUND,
						constant);
			}
			constants[constant] = clazz.classId;
			constants[c2] = 1;
		} else {
			clazz = this.classes.get(constants[constant] | 0);
		}
		return clazz;
	};

	/**
	 * @param {FyClass}
	 *            clazz
	 * @returns {Number} handle of this class's class object handle
	 */
	FyContext.prototype.getClassObjectHandle = function(clazz) {
		var handle = this.mapClassIdToHandle.get(clazz.classId);
		if (handle === 0) {
			var clcl = this.lookupClass(FyConst.FY_BASE_CLASS);
			this.heap.beginProtect();
			handle = this.heap.allocate(clcl);
			this.heap.setObjectMultiUsageData(handle, clazz.classId | 0);
			this.mapClassIdToHandle.put(clazz.classId, handle);
		}
		return handle;
	};

	/**
	 * 
	 * @param handle
	 * @returns {FyClass}
	 */
	FyContext.prototype.getClassFromClassObject = function(handle) {
		if (this.heap.getObjectClass(handle) !== this.TOP_CLASS) {
			throw new FyException(FyConst.FY_EXCEPTION_INCOMPAT_CHANGE,
					"Object #" + handle + "("
							+ this.heap.getObjectClass(handle).name
							+ ") is not a class object");
		}
		return this.classes.get(this.heap.getObjectMultiUsageData(handle) | 0);
	};

	/**
	 * @param {FyMethod}
	 *            method
	 * @returns {Number}
	 */
	FyContext.prototype.getMethodObjectHandle = function(method) {
		var handle = this.mapMethodIdToHandle.get(method.methodId);
		if (handle === 0) {
			this.heap.beginProtect();
			if (method.accessFlags & FyConst.FY_ACC_CONSTRUCTOR) {
				handle = this.heap.allocate(this
						.lookupClass(FyConst.FY_REFLECT_CONSTRUCTOR));
			} else {
				handle = this.heap.allocate(this
						.lookupClass(FyConst.FY_REFLECT_METHOD));
			}
			this.heap.setObjectMultiUsageData(handle, method.methodId | 0);
			this.mapMethodIdToHandle.put(method.methodId, handle);
		}
		return handle;
	};

	/**
	 * 
	 * @param handle
	 * @returns {FyMethod}
	 */
	FyContext.prototype.getMethodFromMethodObject = function(handle) {
		if (this.heap.getObjectClass(handle) !== this.TOP_METHOD
				&& this.heap.getObjectClass(handle) !== this.TOP_CONSTRUCTOR) {
			if (this.heap.getObjectClass(handle) === undefined) {
				throw new FyException(undefined, "Illegal object #" + handle);
			} else {
				throw new FyException(FyConst.FY_EXCEPTION_INCOMPAT_CHANGE,
						"Object #" + handle + "("
								+ this.heap.getObjectClass(handle).name
								+ ") is not a method or constructor object");
			}
		}
		return this.methods.get(this.heap.getObjectMultiUsageData(handle));
	};

	/**
	 * @param {FyField}
	 *            field
	 * @returns {Number}
	 */
	FyContext.prototype.getFieldObjectHandle = function(field) {
		var handle = this.mapFieldIdToHandle.get(field.fieldId);
		if (handle === undefined) {
			this.heap.beginProtect();
			handle = this.heap.allocate(this
					.lookupClass(FyConst.FY_REFLECT_FIELD));
			this.heap.setObjectMultiUsageData(handle, field.fieldId | 0);
			this.mapFieldIdToHandle.put(field.fieldId, handle);
		}
		return handle;
	};
	/**
	 * 
	 * @param handle
	 * @returns {FyField}
	 */
	FyContext.prototype.getFieldFromFieldObject = function(handle) {
		if (this.heap.getObjectClass(handle) !== this.TOP_FIELD) {
			throw new FyException(FyConst.FY_EXCEPTION_INCOMPAT_CHANGE,
					"Object #" + handle + "("
							+ this.heap.getObjectClass(handle).name
							+ ") is not a field object");
		}
		return this.fields[this.heap.getObjectMultiUsageData(handle)];
	};

	FyContext.prototype.dumpStackTrace = function(throwable) {
		var heap = this.heap;

		var detailMessageField = this.getField(FyConst.FY_BASE_THROWABLE
				+ ".detailMessage.L" + FyConst.FY_BASE_STRING + ";");
		var causeField = this.getField(FyConst.FY_BASE_THROWABLE + ".cause.L"
				+ FyConst.FY_BASE_THROWABLE + ";");
		var stesField = this.getField(FyConst.FY_BASE_THROWABLE
				+ ".stackTrace.[L" + FyConst.FY_BASE_STACKTHREADELEMENT + ";");

		this.lookupClass(FyConst.FY_BASE_STACKTHREADELEMENT);
		var steDeclaringClass = this
				.getField(FyConst.FY_BASE_STACKTHREADELEMENT
						+ ".declaringClass.L" + FyConst.FY_BASE_STRING + ";");
		var steMethodName = this.getField(FyConst.FY_BASE_STACKTHREADELEMENT
				+ ".methodName.L" + FyConst.FY_BASE_STRING + ";");
		var steFileName = this.getField(FyConst.FY_BASE_STACKTHREADELEMENT
				+ ".fileName.L" + FyConst.FY_BASE_STRING + ";");
		var steLineNumber = this.getField(FyConst.FY_BASE_STACKTHREADELEMENT
				+ ".lineNumber.I");
		var data = [];
		var first = true;
		var dumped = {};
		while (throwable > 0) {
			if (dumped[throwable]) {
				break;
			}
			dumped[throwable] = true;
			console.log("#dump throwable=" + throwable);
			var throwableClass = heap.getObjectClass(throwable);
			if (throwableClass === undefined) {
				data.push("###Illegal throwable handle #" + throwable);
				throwable = 0;
				break;
			}
			var messageHandle = heap.getFieldInt(throwable,
					detailMessageField.posAbs);
			var message;
			if (messageHandle > 0) {
				message = heap.getString(messageHandle);
			} else {
				message = "";
			}
			if (first) {
				data.push(" Exception occored " + throwableClass.name + ": "
						+ message);
				first = false;
			} else {
				data.push(" Caused by " + throwableClass.name + ": " + message);
			}
			var stesHandle = heap.getFieldInt(throwable, stesField.posAbs);
			if (stesHandle > 0) {
				var stesLength = heap.arrayLength(stesHandle);
				for (var i = 0; i < stesLength; i++) {
					var ste = heap.getArrayInt(stesHandle, i);
					if (ste > 0) {
						var clazzHandle = heap.getFieldInt(ste,
								steDeclaringClass.posAbs);
						var methodHandle = heap.getFieldInt(ste,
								steMethodName.posAbs);
						var fileNameHandle = heap.getFieldInt(ste,
								steFileName.posAbs);
						var lineNumber = heap.getFieldInt(ste,
								steLineNumber.posAbs);
						var className = "<unknown>";
						var methodName = "<unknown>";
						var fileName = "<unknown>";
						if (clazzHandle > 0) {
							className = heap.getString(clazzHandle);
						}
						if (methodHandle > 0) {
							methodName = heap.getString(methodHandle);
						}
						if (fileNameHandle > 0) {
							fileName = heap.getString(fileNameHandle);
						}
						data.push("    at " + className + "." + methodName
								+ "(" + fileName + ":" + lineNumber + ")");
					}
				}
			}
			throwable = heap.getFieldInt(throwable, causeField.posAbs);
		}
		return data;
	};

	/**
	 * Panic the whole virtual machine and try to dump virtual machine data as
	 * much as possible
	 * 
	 * @param message
	 */
	FyContext.prototype.panic = function(message, e) {
		var data = [];
		var context = this;
		try {
			data.push("###PANIC: " + message);
			data.push("" + e);
			data.push("#PANIC context:");
			data.push(this);
			data.push("#PANIC Thread dump:");

			for (var i = 0; i < FyConfig.maxThreads; i++) {
				/**
				 * @returns {FyThread}
				 */
				var thread = this.threadManager.threads[i];
				if (thread !== undefined) {
					data.push("Thread #" + i);
					try {
						thread.walkFrames(function(frameId, methodId, sb, ip,
								lip) {
							/**
							 * @returns {FyMethod}
							 */
							var method = context.methods.get(methodId);
							var lineNumber = method.getLineNumber(lip);
							data
									.push("  frame #"
											+ frameId
											+ ": "
											+ method.owner.name.replace(/\//g,
													".") + "." + method.name
											+ " line " + lineNumber);
						});
					} catch (ex) {
						console.log("Exception occored while dumping frames:");
						console.log(ex.toString());
					}
					try {
						if (thread.currentThrowable) {
							var throwable = thread.currentThrowable | 0;
							if (throwable > 0) {
								data.push.apply(data, this
										.dumpStackTrace(throwable));
							}
						}
					} catch (ex) {
						console
								.log("Exception occored while dumping exception:");
						console.log(ex.toString());
					}
				}
			}
		} catch (ee) {
			console.log("Exception occored while processing panic data:");
			console.log(ee.toString());
		}
		for ( var idx in data) {
			console.log(data[idx]);
		}
		// console.log(this);
		if (e) {
			throw e;
		} else {
			return data;
		}
	};

	FyContext.prototype.registerNativeAOT = function(name, func) {
		this.nativeAOT[name] = func;
	};

	FyContext.prototype.registerNativeHandler = function(name, func, extraVars,
			stackSize) {
		if (typeof name === "object") {
			if (name.length) {
				for (var i = 0, max = name.length; i < max; i++) {
					this.nativeHandlers[name.name] = {
						func : name.func,
						extraVars : name.extraVars | 0,
						stackSize : name.stackSize | 0
					};
				}
			} else {
				for ( var key in name) {
					this.nativeHandlers[key] = {
						func : name[key],
						extraVars : 0,
						stackSize : 0
					};
				}
			}
		} else {
			if (!extraVars) {
				extraVars = 0;
			}
			if (!stackSize) {
				stackSize = 0;
			}
			this.nativeHandlers[name] = {
				func : func,
				extraVars : extraVars | 0,
				stackSize : stackSize | 0
			};
		}
	};

	FyContext.prototype.bootup = function(bootStrapClassName) {
		this.lookupClass(FyConst.FY_BASE_OBJECT);
		this.lookupClass(FyConst.FY_BASE_THROWABLE);
		this.lookupClass("[Z");
		this.lookupClass("[B");
		this.lookupClass("[S");
		this.lookupClass("[C");
		this.lookupClass("[F");
		this.lookupClass("[I");
		this.lookupClass("[J");
		this.lookupClass("[D");

		var clazz = this.lookupClass(bootStrapClassName);
		this.threadManager.bootFromMain(clazz);
	};
})();
