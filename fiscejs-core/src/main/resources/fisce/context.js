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

(function() {
	"use strict";

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
		this.classDef = {};
		this.dynamicClassDef = {};

		/* Classes begins from 1 */
		this.classes = [ undefined ];
		this.mapClassNameToId = {};
		this.mapClassIdToHandle = {};

		/* Methods begins from 0 */
		this.methods = [];
		this.mapMethodNameToId = {};
		this.mapMethodIdToHandle = {};

		/* Fields begins from 0 */
		this.fields = [];
		this.mapFieldNameToId = {};
		this.mapFieldIdToHandle = {};

		this.nativeHandlers = {};
		this.nativeAOT = {};

		this.classLoader = new FyClassLoader(this);
		this.heap = new FyHeap(this);
		this.threadManager = new FyThreadManager(this);
		this.vfs = new FyVFS(namespace);

		this.log = function(level, content) {
			console.log(levels[level] + ": " + content);
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
		Object.preventExtensions(this);
	};

	FyContext.primitives = {
		'Z' : 'boolean',
		'B' : 'byte',
		'S' : 'short',
		'C' : 'char',
		'I' : 'int',
		'F' : 'float',
		'J' : 'long',
		'D' : 'double',
		'V' : 'void'
	};

	FyContext.mapPrimitivesRev = {
		'boolean' : 'Z',
		'byte' : 'B',
		'short' : 'S',
		'char' : 'C',
		'int' : 'I',
		'float' : 'F',
		'long' : 'J',
		'double' : 'D',
		'void' : 'V'
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
			extraVars : extraVars,
			stackSize : extraStack
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
		if ("string" !== typeof string) {
			throw new FyException(undefined, "Type of " + string
					+ " is not string");
		}
		var ret = FyContext.stringPool[string];
		if (ret !== string) {
			ret = string;
			FyContext.stringPool[string] = string;
		}
		return ret;
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
		/**
		 * @returns {Array}
		 */
		var strings = data.strings;
		/**
		 * @returns {Array}
		 */
		var constants = data.constants;
		/**
		 * @returns {Array}
		 */
		var classes = data.classes;

		for (var i = 1; i < constants.length; i++) {
			var constant = constants[i];

			if (constant.name !== undefined) {
				constant.name = this.pool(lookup(strings, constant.name));
			}

			if (constant.string !== undefined) {
				constant.string = this.pool(lookup(strings, constant.string));
			}

			if (constant.className !== undefined) {
				constant.className = this.pool(lookup(strings,
						constant.className));
			}

			if (constant.nameAndType !== undefined) {
				constant.nameAndType = this.pool(lookup(strings,
						constant.nameAndType));
			}
		}

		for (var i = 0; i < classes.length; i++) {
			var def = classes[i];

			// name
			def.name = this.pool(lookup(strings, def.name));

			// sourceFile optional
			if (def.sourceFile !== undefined) {
				def.sourceFile = this.pool(lookup(strings, def.sourceFile));
			}

			// constant pool
			{
				for (var j = 0; j < def.constants.length; j++) {
					def.constants[j] = lookup(constants, def.constants[j]);
				}
			}

			// fields
			{
				for (var j = 0; j < def.fields.length; j++) {
					var field = def.fields[j];
					field.name = this.pool(lookup(strings, field.name));
					field.descriptor = this.pool(lookup(strings,
							field.descriptor));
				}
			}

			// methods
			{
				for (var j = 0; j < def.methods.length; j++) {
					var method = def.methods[j];

					method.name = this.pool(lookup(strings, method.name));
					method.descriptor = this.pool(lookup(strings,
							method.descriptor));

					method.paramType = this.pool(lookup(strings,
							method.paramType));
					method.returnType = this.pool(lookup(strings,
							method.returnType));

					for ( var key in method.frames) {
						method.frames[key] = this.pool(lookup(strings,
								method.frames[key]));
					}

					for (var k = 0; k < method.exceptions.length; k++) {
						method.exceptions[k] = this.pool(lookup(strings,
								method.exceptions[k]));
					}

					for (var k = 0; k < method.parameterClassNames.length; k++) {
						method.parameterClassNames[k] = this.pool(lookup(
								strings, method.parameterClassNames[k]));
					}
					method.returnClassName = this.pool(lookup(strings,
							method.returnClassName));
				}
			}

			this.classDef[def.name] = def;
		}
	};
	/**
	 * Register a field to context
	 * 
	 * @param {FyField}
	 *            field
	 */
	FyContext.prototype.registerField = function(field) {
		var fid = this.mapFieldNameToId[field.uniqueName];
		if (fid === undefined) {
			fid = this.fields.length;
			field.fieldId = fid;
			this.mapFieldNameToId[field.uniqueName] = fid;
		}
		this.fields[fid] = field;
	};
	/**
	 * get field by name
	 * 
	 * @param {string}
	 *            uniqueName
	 * @returns {FyField} field
	 */
	FyContext.prototype.getField = function(uniqueName) {
		var fid = this.mapFieldNameToId[uniqueName];
		if (fid === undefined) {
			return undefined;
		}
		return this.fields[fid];
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
		var c;

		var fid = this.mapFieldNameToId[this.pool(clazz.name + fullName)];
		if (fid !== undefined) {
			return this.fields[fid];
		}

		c = clazz.superClass;
		while (c) {
			var fid = this.mapFieldNameToId[c.name + fullName];
			if (fid !== undefined) {
				this.mapFieldNameToId[this.pool(clazz.name + fullName)] = fid;
				return this.fields[fid];
			}

			c = c.superClass;
		}

		return walkInterfaces(clazz,
		/**
		 * @param {FyClass}
		 *            intf
		 */
		function(intf) {
			var fid = this.mapFieldNameToId[intf.name + fullName];
			if (fid !== undefined) {
				this.mapFieldNameToId[this.pool(clazz.name + fullName)] = fid;
				return this.fields[fid];
			}
		}, this);
		return undefined;
	};

	/**
	 * Lookup a field from field constant
	 * 
	 * @param constant :
	 *            field constant
	 * @returns {FyField} field
	 */
	FyContext.prototype.lookupFieldVirtualFromConstant = function(constant) {
		var resolvedField = constant.resolvedField;
		if (resolvedField === undefined) {
			/**
			 * @returns {FyClass}
			 */
			var clazz = this.lookupClass(constant.className);
			if (clazz === undefined) {
				throw new FyException(FyConst.FY_EXCEPTION_CLASSNOTFOUND,
						constant.className);
			}

			resolvedField = this
					.lookupFieldVirtual(clazz, constant.nameAndType);
			if (resolvedField) {
				constant.resolvedField = resolvedField;
			} else {
				throw new FyException(FyConst.FY_EXCEPTION_INCOMPAT_CHANGE,
						constant.className + "." + constant.nameAndType
								+ " not found");
			}
			// delete constant.className;
			// delete constant.nameAndType;
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
		var mid = this.mapMethodNameToId[method.uniqueName];
		if (mid === undefined) {
			mid = this.methods.length;
			method.methodId = mid;
			this.methods.push(method);
			this.mapMethodNameToId[method.uniqueName] = mid;
		} else {
			this.methods[mid] = method;
		}
	};
	/**
	 * get method by name
	 * 
	 * @param {string}
	 *            uniqueName
	 * @returns {FyMethod} method
	 */
	FyContext.prototype.getMethod = function(uniqueName) {
		var mid = this.mapMethodNameToId[uniqueName];
		if (mid === undefined) {
			return undefined;
		}
		return this.methods[mid];
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
		var c;

		var mid = this.mapMethodNameToId[this.pool(clazz.name + fullName)];
		if (mid !== undefined) {
			return this.methods[mid];
		}

		c = clazz.superClass;
		while (c) {
			var mid = this.mapMethodNameToId[c.name + fullName];
			if (mid !== undefined) {
				this.mapMethodNameToId[this.pool(clazz.name + fullName)] = mid;
				return this.methods[mid];
			}

			c = c.superClass;
		}

		return walkInterfaces(clazz,
		/**
		 * @param {FyClass}
		 *            intf
		 */
		function(intf) {
			var mid = this.mapMethodNameToId[intf.name + fullName];
			if (mid !== undefined) {
				this.mapMethodNameToId[this.pool(clazz.name + fullName)] = mid;
				return this.methods[mid];
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
		return this.methods[ret];
	};

	/**
	 * Lookup method from all interfaces the class implemented
	 * 
	 * @param {FyClass}
	 *            clazz
	 * @param {String}
	 *            fullName
	 * @returns {FyMethod} method
	 */
	FyContext.prototype.lookupMethodVirtualFromInterfaces = function(clazz,
			fullName) {
		/**
		 * @returns {String}
		 */
		var uniqueName = clazz.name + fullName;
		var first = true;
		while (clazz) {
			var interfaces = clazz.interfaces;
			for (var i = 0, max = interfaces.length; i < max; i++) {
				/**
				 * @returns {FyClass}
				 */
				var intf = interfaces[i];
				var mid = this.mapMethodNameToId[intf.name + fullName];
				if (mid !== undefined) {
					if (!first) {
						this.mapMethodNameToId[this.pool(uniqueName)] = mid;
					}
					return this.methods[mid];
				}
			}
			clazz = clazz.superClass;
			first = false;
		}
		return undefined;
	};

	/**
	 * Lookup a method from method constant
	 * 
	 * @param constant :
	 *            method constant
	 * @returns {FyMethod} method
	 */
	FyContext.prototype.lookupMethodVirtualFromConstant = function(constant) {
		var resolvedMethod = constant.resolvedMethod;
		if (!resolvedMethod) {
			/**
			 * @returns {FyClass}
			 */
			var clazz = this.lookupClass(constant.className);
			if (clazz === undefined) {
				throw new FyException(FyConst.FY_EXCEPTION_CLASSNOTFOUND,
						constant.className);
			}

			resolvedMethod = this.lookupMethodVirtual(clazz,
					constant.nameAndType);
			if (resolvedMethod) {
				constant.resolvedMethod = resolvedMethod;
			} else {
				throw new FyException(FyConst.FY_EXCEPTION_INCOMPAT_CHANGE,
						constant.className + "." + constant.nameAndType
								+ " not found");
			}
			// delete constant.className;
			// delete constant.nameAndType;
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
		var cid = this.mapClassNameToId[clazz.name];
		if (cid === undefined) {
			cid = this.classes.length;
			this.mapClassNameToId[clazz.name] = cid;
		} else if (this.classes[cid]) {
			throw new FyException(undefined, "Duplicated class define: "
					+ clazz.name);
		}
		clazz.classId = cid;
		this.classes[cid] = clazz;
	};

	/**
	 * Get class from class name
	 * 
	 * @param {string}
	 *            name
	 * @returns {FyClass} class to return
	 */
	FyContext.prototype.getClass = function(name) {
		var cid = this.mapClassNameToId[name];
		if (cid === undefined || this.classes[cid] === undefined) {
			return undefined;
		}
		return this.classes[cid];
	};

	/**
	 * @param name
	 *            {String}
	 * @returns {FyClass}
	 */
	FyContext.prototype.lookupClassPhase1 = function(name) {
		var clazz = this.getClass(name);
		if (clazz === undefined) {
			if (!name) {
				throw new FyException(undefined, "Class name for load is null!");
			}
			clazz = this.classLoader.loadClass(name);
			this.registerClass(clazz);
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
	 * @param constant
	 *            the constant entry
	 * @returns {FyClass}
	 */
	FyContext.prototype.lookupClassFromConstantPhase1 = function(constant) {
		if (!constant.resolvedClass) {
			constant.resolvedClass = this.lookupClassPhase1(constant.name);
			if (!constant.resolvedClass) {
				throw new FyException(FyConst.FY_EXCEPTION_CLASSNOTFOUND,
						constant.name);
			}
			// delete constant.name;
		}
		return constant.resolvedClass;
	};

	/**
	 * Lookup class from constant
	 * 
	 * @param constant
	 *            the constant entry
	 * @returns {FyClass}
	 */
	FyContext.prototype.lookupClassFromConstant = function(constant) {
		if (!constant.resolvedClass) {
			constant.resolvedClass = this.lookupClass(constant.name);
			if (!constant.resolvedClass) {
				throw new FyException(FyConst.FY_EXCEPTION_CLASSNOTFOUND,
						constant.name);
			}
			// delete constant.name;
		}
		return constant.resolvedClass;
	};

	/**
	 * @param {FyClass}
	 *            clazz
	 * @returns {Number} handle of this class's class object handle
	 */
	FyContext.prototype.getClassObjectHandle = function(clazz) {
		var handle = this.mapClassIdToHandle[clazz.classId];
		if (handle === undefined) {
			var clcl = this.lookupClass(FyConst.FY_BASE_CLASS);
			this.heap.beginProtect();
			handle = this.heap.allocate(clcl);
			this.heap.setObjectMultiUsageData(handle, clazz.classId);
			this.mapClassIdToHandle[clazz.classId] = handle;
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
		return this.classes[this.heap.getObjectMultiUsageData(handle)];
	};

	/**
	 * @param {FyMethod}
	 *            method
	 * @returns {Number}
	 */
	FyContext.prototype.getMethodObjectHandle = function(method) {
		var handle = this.mapMethodIdToHandle[method.methodId];
		if (handle === undefined) {
			this.heap.beginProtect();
			if (method.accessFlags & FyConst.FY_ACC_CONSTRUCTOR) {
				handle = this.heap.allocate(this
						.lookupClass(FyConst.FY_REFLECT_CONSTRUCTOR));
			} else {
				handle = this.heap.allocate(this
						.lookupClass(FyConst.FY_REFLECT_METHOD));
			}
			this.heap.setObjectMultiUsageData(handle, method.methodId);
			this.mapMethodIdToHandle[method.methodId] = handle;
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
		return this.methods[this.heap.getObjectMultiUsageData(handle)];
	};

	/**
	 * @param {FyField}
	 *            field
	 * @returns {Number}
	 */
	FyContext.prototype.getFieldObjectHandle = function(field) {
		var handle = this.mapFieldIdToHandle[field.fieldId];
		if (handle === undefined) {
			this.heap.beginProtect();
			handle = this.heap.allocate(this
					.lookupClass(FyConst.FY_REFLECT_FIELD));
			this.heap.setObjectMultiUsageData(handle, field.fieldId);
			this.mapFieldIdToHandle[field.fieldId] = handle;
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
		try {
			data.push("###PANIC: " + message);
			data.push(e);
			data.push("#PANIC context:" + this);
			data.push("#PANIC Thread dump:");

			for (var i = 0; i < FyConfig.maxThreads; i++) {
				/**
				 * @returns {FyThread}
				 */
				var thread = this.threadManager.threads[i];
				if (thread !== undefined) {
					data.push("Thread #" + i);
					thread.walkFrames(function(frameId, methodId, sb, ip, lip) {
						/**
						 * @returns {FyMethod}
						 */
						var method = this.methods[methodId];
						var lineNumber = method.getLineNumber(lip);
						data.push("  frame #" + frameId + ": "
								+ method.owner.name.replace(/\//g, ".") + "."
								+ method.name + " line " + lineNumber);
					});
					if (thread.currentThrowable) {
						var throwable = thread.currentThrowable | 0;
						if (throwable > 0) {
							data.push.apply(data, this
									.dumpStackTrace(throwable));
						}
					}
				}
			}
		} catch (ee) {
			console.log(ee);
		}
		for ( var idx in data) {
			console.log(data[idx]);
		}
		// console.log(this);
		if (e) {
			throw e;
		} else {
			throw new Error("Virtual machine panic!");
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
						extraVars : name.extraVars,
						stackSize : name.stackSize
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
				extraVars : extraVars,
				stackSize : stackSize
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
	Object.preventExtensions(FyContext);
})();
