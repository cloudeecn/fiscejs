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

		for ( var i = 0, max = clazz.interfaces.length; i < max; i++) {
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

		for ( var i = 0, max = toWalk.length; i < max; i++) {
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

	FyContext = function() {
		var levels = [ "D", "I", "W", "E" ];
		this.settings = {};
		this.classDef = {};

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

		this.classLoader = new FyClassLoader(this);
		this.heap = new FyHeap(this);
		this.threadManager = new FyThreadManager(this);

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

		for ( var i = 1; i < constants.length; i++) {
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

		for ( var i = 0; i < classes.length; i++) {
			var def = classes[i];

			// name
			def.name = this.pool(lookup(strings, def.name));

			// sourceFile optional
			if (def.sourceFile !== undefined) {
				def.sourceFile = this.pool(lookup(strings, def.sourceFile));
			}

			// constant pool
			{
				for ( var j = 0; j < def.constants.length; j++) {
					def.constants[j] = lookup(constants, def.constants[j]);
				}
			}

			// fields
			{
				for ( var j = 0; j < def.fields.length; j++) {
					var field = def.fields[j];
					field.name = this.pool(lookup(strings, field.name));
					field.descriptor = this.pool(lookup(strings,
							field.descriptor));
				}
			}

			// methods
			{
				for ( var j = 0; j < def.methods.length; j++) {
					var method = def.methods[j];

					method.name = this.pool(lookup(strings, method.name));
					method.descriptor = this.pool(lookup(strings,
							method.descriptor));

					method.paramType = this.pool(lookup(strings,
							method.paramType));
					method.returnType = this.pool(lookup(strings,
							method.returnType));

					for ( var k = 0; k < method.exceptions.length; k++) {
						method.exceptions[k] = this.pool(lookup(strings,
								method.exceptions[k]));
					}

					for ( var k = 0; k < method.parameterClassNames.length; k++) {
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
			delete constant.className;
			delete constant.nameAndType;
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
		 * @returns {FyMethodd}
		 */
		var ret = clazz.virtualTable[mid];
		if (ret === undefined) {
			ret = this.lookupMethodVirtual(clazz, method.fullName);
			if (ret === undefined
					|| (ret.accessFlags & FyConst.FY_ACC_ABSTRACT)) {
				throw new FyException(FyConst.FY_EXCEPTION_ABSTRACT, clazz.name
						+ method.fullName);
			}
			if (ret.accessFlags & FyConst.FY_ACC_STATIC) {
				throw new FyException(FyConst.FY_EXCEPTION_INCOMPAT_CHANGE,
						"Method " + clazz.name + method.fullName
								+ " changed to static");
			}
			clazz.virtualTable[mid] = ret;
		}
		return ret;
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
			for ( var i = 0, max = interfaces.length; i < max; i++) {
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
			delete constant.className;
			delete constant.nameAndType;
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
	 * Get or load class with class name
	 * 
	 * @param {string}
	 *            name
	 * @returns {FyClass} class to return
	 */
	FyContext.prototype.lookupClass = function(name) {
		var clazz = this.getClass(name);
		if (clazz === undefined) {
			var classDef = undefined;
			if (!name) {
				throw new FyException(undefined, "Class name for load is null!");
			}
			clazz = this.classLoader.loadClass(name);
			this.registerClass(clazz);

			if (clazz.type == FyConst.TYPE_OBJECT) {
				classDef = this.classDef[name];
			}
			this.classLoader.phase2(clazz, classDef);
			this.lookupClass(FyConst.FY_BASE_CLASS);
		}
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
		} else {
			return this.lookupClass("["
					+ FyContext.mapPrimitivesRev[clazz.name]);
		}
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
			delete constant.name;
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
			this.heap.getObject(handle).multiUsageData = clazz.classId;
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
		var obj = this.heap.getObject(handle);
		if (obj.clazz !== this.TOP_CLASS) {
			throw new FyException(FyConst.FY_EXCEPTION_INCOMPAT_CHANGE,
					"Object #" + handle + "(" + obj.clazz.name
							+ ") is not a class object");
		}
		return this.classes[obj.multiUsageData];
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
			this.heap.getObject(handle).multiUsageData = method.methodId;
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
		var obj = this.heap.getObject(handle);
		if (obj.clazz !== this.TOP_METHOD && obj.clazz !== this.TOP_CONSTRUCTOR) {
			throw new FyException(FyConst.FY_EXCEPTION_INCOMPAT_CHANGE,
					"Object #" + handle + "(" + obj.clazz.name
							+ ") is not a method or constructor object");
		}
		return this.methods[obj.multiUsageData];
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
			this.heap.getObject(handle).multiUsageData = field.fieldId;
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
		var obj = this.heap.getObject(handle);
		if (obj.clazz !== this.TOP_FIELD) {
			throw new FyException(FyConst.FY_EXCEPTION_INCOMPAT_CHANGE,
					"Object #" + handle + "(" + obj.clazz.name
							+ ") is not a field object");
		}
		return this.fields[obj.multiUsageData];
	};

	/**
	 * Panic the whole virtual machine and try to dump virtual machine data as
	 * much as possible
	 * 
	 * @param message
	 */
	FyContext.prototype.panic = function(message, e) {
		console.log("ERROR! Virtual machine panic: " + message);
		//console.log(this);
		if (e) {
			throw e;
		} else {
			throw new Error("Virtual machine panic!");
		}
	};

	FyContext.prototype.registerNativeHandler = function(name, func, extraVars,
			stackSize) {
		if (typeof name === "object") {
			if (name.length) {
				for ( var i = 0, max = name.length; i < max; i++) {
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
		var clazz = this.lookupClass(bootStrapClassName);
		this.threadManager.bootFromMain(clazz);
	};
	Object.preventExtensions(FyContext);
})();