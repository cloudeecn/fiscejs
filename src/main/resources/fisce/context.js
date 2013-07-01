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

var FiScEContext;

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

	FiScEContext = function() {
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

		this.classLoader = new FiScEClassLoader(this);

		/** Special types* */
		/**
		 * TOP_CLASS
		 * 
		 * @returns {FiScEClass}
		 */
		this.TOP_CLASS = undefined;
		this.TOP_THROWABLE = undefined;
		this.TOP_ENUM = undefined;
		this.TOP_ANNOTATION = undefined;
		this.TOP_SOFT_REF = undefined;
		this.TOP_WEAK_REF = undefined;
		this.TOP_PHANTOM_REF = undefined;
	};

	FiScEContext.primitives = {
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

	FiScEContext.mapPrimitivesRev = {
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

	FiScEContext.stringPool = {};

	/**
	 * Pool a string to string pool
	 * 
	 * @param {String}
	 *            string
	 * @returns {String} result
	 */
	FiScEContext.prototype.pool = function(string) {
		var ret = FiScEContext.stringPool[string];
		if (ret === undefined) {
			ret = string;
			FiScEContext.stringPool[string] = string;
		}
		return ret;
	};

	FiScEContext.prototype.addClassDef = function(data) {
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
	 * @param {FiScEField}
	 *            field
	 */
	FiScEContext.prototype.registerField = function(field) {
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
	 * @returns {FiScEField} field
	 */
	FiScEContext.prototype.getField = function(uniqueName) {
		var fid = this.mapFieldNameToId[uniqueName];
		if (fid === undefined) {
			return undefined;
		}
		return this.fields[fid];
	};

	/**
	 * Lookup field throw class and super classes
	 * 
	 * @param {FiScEClass}
	 *            clazz
	 * @param {String}
	 *            fullName
	 * @returns {FiScEField}
	 */
	FiScEContext.prototype.lookupFieldVirtual = function(clazz, fullName) {
		/**
		 * @returns {FiScEClass}
		 */
		var c;

		var fid = this.mapFieldNameToId[this.pool(clazz.name + fullName)];
		if (fid) {
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

		c = clazz;
		while (c) {
			var interfaces = c.interfaces;
			for ( var i = 0, max = interfaces.length; i < max; i++) {
				var intf = interfaces[i];
				fid = this.mapFieldNameToId[intf.name + fullName];
				if (fid !== undefined) {
					this.mapFieldNameToId[this.pool(clazz.name + fullName)] = fid;
					return this.fields[fid];
				}
			}

			c = c.superClass;
		}
		return undefined;
	};

	/**
	 * Lookup a field from field constant
	 * 
	 * @param constant :
	 *            field constant
	 * @returns {FiScEField} field
	 */
	FiScEContext.prototype.lookupFieldVirtualFromConstant = function(constant) {
		var resolvedField = constant.resolvedField;
		if (!resolvedField) {
			/**
			 * @returns {FiScEClass}
			 */
			var clazz = this.lookupClass(constant.className);
			if (clazz === undefined) {
				throw new FiScEException(FiScEConst.FY_EXCEPTION_CLASSNOTFOUND,
						constant.className);
			}

			resolvedField = this
					.lookupFieldVirtual(clazz, constant.nameAndType);
			if (resolvedField) {
				constant.resolvedField = resolvedField;
			} else {
				throw new FiScEException(
						FiScEConst.FY_EXCEPTION_INCOMPAT_CHANGE,
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
	 * @param {FiScEMethod}
	 *            method
	 */
	FiScEContext.prototype.registerMethod = function(method) {
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
	 * @returns {FiScEMethod} method
	 */
	FiScEContext.prototype.getMethod = function(uniqueName) {
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
	 * @param {FiScEClass}
	 *            clazz
	 * @param {String}
	 *            fullName
	 * @returns {FiScEMethod} method
	 */
	FiScEContext.prototype.lookupMethodVirtual = function(clazz, fullName) {
		/**
		 * @returns {FiScEClass}
		 */
		var c;
		
		if (fullName === ".method1.()I") {
			var iasdf = 0;
			iasdf++;
		}

		var mid = this.mapMethodNameToId[this.pool(clazz.name + fullName)];
		if (mid) {
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

		c = clazz;
		while (c) {
			var interfaces = c.interfaces;
			for ( var i = 0, max = interfaces.length; i < max; i++) {
				var intf = interfaces[i];
				mid = this.mapMethodNameToId[intf.name + fullName];
				if (mid !== undefined) {
					this.mapMethodNameToId[this.pool(clazz.name + fullName)] = mid;
					return this.methods[mid];
				}
			}

			c = c.superClass;
		}
		return undefined;
	};

	/**
	 * Lookup method virtually
	 * 
	 * @param {FiScEClass}
	 *            clazz
	 * @param {FiScEMethod}
	 *            method
	 * @returns {FiScEMethod} method
	 */
	FiScEContext.prototype.lookupMethodVirtualByMethod = function(clazz, method) {
		var mid = method.methodId;
		/**
		 * @returns {FiScEMethodd}
		 */
		var ret = clazz.virtualTable[mid];
		if (ret === undefined) {
			ret = this.lookupMethodVirtual(clazz, method.fullName);
			if (ret === undefined
					|| (ret.accessFlags & FiScEConst.FY_ACC_ABSTRACT)) {
				throw new FiScEException(FiScEConst.FY_EXCEPTION_ABSTRACT,
						clazz.name + method.fullName);
			}
			if (ret.accessFlags & FiScEConst.FY_ACC_STATIC) {
				throw new FiScEException(
						FiScEConst.FY_EXCEPTION_INCOMPAT_CHANGE, "Method "
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
	 * @param {FiScEClass}
	 *            clazz
	 * @param {String}
	 *            fullName
	 * @returns {FiScEMethod} method
	 */
	FiScEContext.prototype.lookupMethodVirtualFromInterfaces = function(clazz,
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
				 * @returns {FiScEClass}
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
	 * @returns {FiScEMethod} method
	 */
	FiScEContext.prototype.lookupMethodVirtualFromConstant = function(constant) {
		var resolvedMethod = constant.resolvedMethod;
		if (!resolvedMethod) {
			/**
			 * @returns {FiScEClass}
			 */
			var clazz = this.lookupClass(constant.className);
			if (clazz === undefined) {
				throw new FiScEException(FiScEConst.FY_EXCEPTION_CLASSNOTFOUND,
						constant.className);
			}

			resolvedMethod = this.lookupMethodVirtual(clazz,
					constant.nameAndType);
			if (resolvedMethod) {
				constant.resolvedMethod = resolvedMethod;
			} else {
				throw new FiScEException(
						FiScEConst.FY_EXCEPTION_INCOMPAT_CHANGE,
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
	 * @param {FiScEClass}
	 *            clazz
	 */
	FiScEContext.prototype.registerClass = function(clazz) {
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
	 * @returns {FiScEClass} class to return
	 */
	FiScEContext.prototype.getClass = function(name) {
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
	 * @returns {FiScEClass} class to return
	 */
	FiScEContext.prototype.lookupClass = function(name) {
		var clazz = this.getClass(name);
		if (clazz === undefined) {
			if (!name) {
				throw new "Class name for load is null!";
			}
			clazz = this.classLoader.loadClass(name);
			this.registerClass(clazz);
			this.classLoader.phase2(clazz);
			this.lookupClass(FiScEConst.FY_BASE_CLASS);
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
	FiScEContext.prototype.lookupClassFromConstant = function(constant) {
		if (!constant.resolvedClass) {
			constant.resolvedClass = this.lookupClass(constant.name);
			if (!constant.resolvedClass) {
				throw new FiScEException(FiScEConst.FY_EXCEPTION_CLASSNOTFOUND,
						constant.name);
			}
			delete constant.name;
		}
		return constant.resolvedClass;
	};
})();