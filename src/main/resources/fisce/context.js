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
			throw "IllegalArgumentException: " + array.length + "[" + idx + "]";
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
		this.classDef = {};

		/* Classes begins from 1 */
		this.classes = [ undefined ];
		this.mapClassNameToId = {};

		/* Methods begins from 0 */
		this.methods = [];
		this.mapMethodNameToId = {};

		/* Fields begins from 0 */
		this.fields = [];
		this.mapFieldNameToId = {};

		this.nativeHandlers = {};

		this.classLoader = new FyClassLoader(this);

		/** Special types* */
		/**
		 * TOP_CLASS
		 * 
		 * @returns {FyClass}
		 */
		this.TOP_CLASS = undefined;
		this.TOP_THROWABLE = undefined;
		this.TOP_ENUM = undefined;
		this.TOP_ANNOTATION = undefined;
		this.TOP_SOFT_REF = undefined;
		this.TOP_WEAK_REF = undefined;
		this.TOP_PHANTOM_REF = undefined;
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

	/**
	 * Pool a string to string pool
	 * 
	 * @param {String}
	 *            string
	 * @returns {String} result
	 */
	FyContext.prototype.pool = function(string) {
		var ret = FyContext.stringPool[string];
		if (ret === undefined) {
			ret = string;
			FyContext.stringPool[string] = string;
		}
		return ret;
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

			// ////////////// body
			if (def.superClassData !== undefined) {
				def.superClassData = lookup(def.constants, def.superClassData);
			}

			// interfaces
			{
				for ( var j = 0; j < def.interfaceDatas.length; j++) {
					def.interfaceDatas[j] = lookup(def.constants,
							def.interfaceDatas[j]);
				}
				delete def.interfaceIdx;
			}

			// fields
			{
				for ( var j = 0; j < def.fields.length; j++) {
					var field = def.fields[j];
					field.name = this.pool(lookup(strings, field.name));
					field.descriptor = this.pool(lookup(strings,
							field.descriptor));

					field.constantValueData = lookup(def.constants,
							field.constantValueData);
				}
			}

			// methods
			{
				for ( var j = 0; j < def.methods.length; j++) {
					var method = def.methods[j];

					method.name = this.pool(lookup(strings, method.name));
					method.descriptor = this.pool(lookup(strings,
							method.descriptor));

					if (method.exceptionTable) {
						var exceptionTable = method.exceptionTable;

						if (exceptionTable.catchClassData !== undefined) {
							exceptionTable.catchClassData = lookup(
									def.constants,
									exceptionTable.catchClassData);
						}
					}

					method.paramType = this.pool(lookup(strings,
							method.paramType));
					method.returnType = this.pool(lookup(strings,
							method.returnType));

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
		if (!resolvedField) {
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
				throw new FyException(
						FyConst.FY_EXCEPTION_INCOMPAT_CHANGE,
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
			this.mapMethodNameToId[method.uniqueName] = mid;
		}
		this.methods[mid] = method;
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
				throw new FyException(FyConst.FY_EXCEPTION_ABSTRACT,
						clazz.name + method.fullName);
			}
			if (ret.accessFlags & FyConst.FY_ACC_STATIC) {
				throw new FyException(
						FyConst.FY_EXCEPTION_INCOMPAT_CHANGE, "Method "
								+ clazz.name + method.fullName
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
				throw new FyException(
						FyConst.FY_EXCEPTION_INCOMPAT_CHANGE,
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
			if (!name) {
				throw new "Class name for load is null!";
			}
			clazz = this.classLoader.loadClass(name);
			this.registerClass(clazz);
			this.classLoader.phase2(clazz);
			this.lookupClass(FyConst.FY_BASE_CLASS);
		}
		return clazz;
	};

	/**
	 * Lookup class from constant
	 * 
	 * @param constant
	 *            the constant entry
	 * @returns
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
})();