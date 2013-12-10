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
 * Class loader
 * 
 * @param {FyContext}
 *            context
 */

var FyClassLoader;

(function() {
	"use strict";

	/**
	 * 
	 * @param {FyContext}
	 *            context
	 * @returns {FyClassLoader}
	 */
	FyClassLoader = function(context) {
		this.context = context;
	};

	/**
	 * Get array size shift from array class name
	 * 
	 * @param {String}
	 *            arrayName
	 */
	FyClassLoader.getArrayContentType = function(arrayName) {
		switch (arrayName.charCodeAt(1)) {
		case 90/* FyConst.Z */:
		case 66/* FyConst.B */:
			return FyConst.FY_AT_BYTE;
		case 68/* FyConst.D */:
		case 74/* FyConst.J */:
			return FyConst.FY_AT_LONG;
		case 67/* FyConst.C */:
		case 83/* FyConst.S */:
			return FyConst.FY_AT_SHORT;
		case 73/* FyConst.I */:
		case 70/* FyConst.F */:
		case 76/* FyConst.L */:
		case 91/* FyConst.ARR */:
			return FyConst.FY_AT_INT;
		default:
			throw new FyException(null, "Illegal array type: " + arrayName
					+ "(" + arrayName.charCodeAt(1) + ")");
		}
	};

	FyClassLoader.getArrayContentName = function(arrayName) {
		switch (arrayName.charCodeAt(1)) {
		case 91/* FyConst.ARR */:
			return arrayName.substring(1, arrayName.length);
		case 76/* FyConst.L */:
			return arrayName.substring(2, arrayName.length - 1);
		default:
			return FyContext.primitives[arrayName.charAt(1)];
		}
	};

	FyClassLoader.getArrayName = function(arrayContentName) {
		var primitiveClassName = FyContext.mapPrimitivesRev[arrayContentName];
		if (!!primitiveClassName) {
			// primitive
			return "[" + primitiveClassName;
		} else if (arrayContentName.charAt(0) === FyConst.FY_TYPE_ARRAY) {
			// array
			return "[" + arrayContentName;
		} else {
			return "[L" + arrayContentName + ";";
		}
	};

	/**
	 * load class
	 * 
	 * @param {String}
	 *            name
	 */
	FyClassLoader.prototype.loadClass = function(name) {
		/**
		 * tell eclipse JSDT clazz is a FyClass
		 * 
		 * @returns {FyClass}
		 */
		var clazz;
		if (name.charAt(0) === FyConst.FY_TYPE_ARRAY) {
			// Array
			name = this.context.pool(name);
			clazz = new FyClass(FyConst.TYPE_ARRAY);
			clazz.name = name;
			clazz.superClass = this.context.lookupClass(FyConst.FY_BASE_OBJECT);
			clazz.arrayType = FyClassLoader.getArrayContentType(name);
			clazz.contentClass = this.context.lookupClass(FyClassLoader
					.getArrayContentName(name));
		} else if (FyContext.mapPrimitivesRev[name]) {
			// Primitive
			name = this.context.pool(name);
			clazz = new FyClass(FyConst.TYPE_PRIMITIVE);
			clazz.name = name;
			clazz.superClass = this.context.lookupClass(FyConst.FY_BASE_OBJECT);
			clazz.pType = FyContext.mapPrimitivesRev[name].charCodeAt(0);
		} else {
			// Normal class
			var classDef = this.context.classDef[name];
			if (!classDef) {
				throw new FyException(FyConst.FY_EXCEPTION_CLASSNOTFOUND,
						"Class not found: " + name);
			}
			name = this.context.pool(name);
			clazz = new FyClass(FyConst.TYPE_OBJECT);

			FyUtils.simpleClone(classDef, clazz, [ "name", "sourceFile",
					"accessFlags", "sizeRel", "staticSize", "phase" ]);
			{// Constants
				var constantDefs = classDef.constants;
				var constants = clazz.constants;
				var len = constantDefs.length;
				for (var i = 0; i < len; i++) {
					constants[i] = constantDefs[i];
				}
			}
			{// Methods
				var methodDefs = classDef.methods;
				var methods = clazz.methods;
				var len = methodDefs.length;
				for (var i = 0; i < len; i++) {

					var methodDef = methodDefs[i];
					/**
					 * @returns {FyMethod}
					 */
					var method = methods[i] = new FyMethod();

					FyUtils
							.simpleClone(methodDef, method, [ "name",
									"descriptor", "accessFlags", "maxStack",
									"maxLocals", "paramStackUsage",
									"paramType", "returnType",
									"parameterCount", "returnClassName" ]);
					method.fullName = this.context.pool("." + method.name + "."
							+ method.descriptor);
					method.uniqueName = this.context.pool(clazz.name
							+ method.fullName);
					method.owner = clazz;

					if (method.name === FyConst.FY_METHOD_CLINIT) {
						clazz.clinit = method;
						method.accessFlags |= FyConst.FY_ACC_CLINIT;
					} else if (method.name === FyConst.FY_METHOD_INIT) {
						method.accessFlags |= FyConst.FY_ACC_CONSTRUCTOR;
					}

					if (methodDef.lineNumberTable) {
						for (var lnIdx = 0; lnIdx < methodDef.lineNumberTable.length; lnIdx++) {
							var lineNumber = new FyLineNumber();
							var lineNumberDef = methodDef.lineNumberTable[lnIdx];
							FyUtils.simpleClone(lineNumberDef, lineNumber);
							method.lineNumberTable[lnIdx] = lineNumber;
						}
					}

					if (methodDef.lookupSwitchTargets) {
						for (var lstIdx = 0; lstIdx < methodDef.lookupSwitchTargets.length; lstIdx++) {
							var lst = new FyLookupSwitchTarget();
							var lstDef = methodDef.lookupSwitchTargets[lstIdx];
							lst.dflt = lstDef.dflt;
							lst.targets = lstDef.targets;
							method.lookupSwitchTargets[lstIdx] = lst;
						}
					}

					if (methodDef.tableSwitchTargets) {
						for (var tstIdx = 0; tstIdx < methodDef.tableSwitchTargets.length; tstIdx++) {
							var tst = new FyTableSwitchTarget();
							var tstDef = methodDef.tableSwitchTargets[tstIdx];
							tst.dflt = tstDef.dflt;
							tst.min = tstDef.min;
							tst.max = tstDef.max;
							tst.targets = tstDef.targets;
							method.tableSwitchTargets[tstIdx] = tst;
						}
					}

					if (methodDef.code) {
						method.code = methodDef.code;
					}

					if (methodDef.opsCheck) {
						method.opsCheck = methodDef.opsCheck;
					}

					if (methodDef.frames) {
						method.frames = methodDef.frames;
					}

					if (methodDef.parameterClassNames) {
						method.parameterClassNames = methodDef.parameterClassNames;
					}

					if (methodDef.exceptions) {
						method.exceptions = methodDef.exceptions;
					}

					if (method.accessFlags & FyConst.FY_ACC_NATIVE) {
						var nativeHandler = this.context.nativeHandlers[method.uniqueName]
								|| FyContext.staticNativeHandlers[method.uniqueName];
						if (nativeHandler !== undefined) {
							method.invoke = nativeHandler.func;
							method.maxLocals += nativeHandler.extraVars;
							method.maxStack += nativeHandler.stackSize;
						}
					}
					this.context.registerMethod(method);
				}
			}

			{// Fields
				var fieldDefs = classDef.fields;
				var fields = clazz.fields;
				var len = fieldDefs.length;
				for (var i = 0; i < len; i++) {
					/**
					 * @returns {FyField}
					 */
					var field = fields[i] = new FyField();
					var fieldDef = fieldDefs[i];
					FyUtils.simpleClone(fieldDef, field);
					field.fullName = this.context.pool("." + field.name + "."
							+ field.descriptor);
//					console
//							.log("#CL" + clazz.name + "." + field.name + "@"
//									+ i);
					field.uniqueName = this.context.pool(clazz.name
							+ field.fullName);
					field.owner = clazz;
					switch (field.descriptor.charCodeAt(0)) {
					case 68/* FyConst.D */:
					case 74/* FyConst.J */:
						field.size = 2;
						break;
					default:
						field.size = 1;
						break;
					}
					this.context.registerField(field);
				}
			}

			if (classDef.superClassData) {
				var superClassConstant = clazz.constants[classDef.superClassData];
				clazz.superClass = superClassConstant.resolvedClass;
				if (clazz.superClass === undefined) {
					clazz.superClass = this.context
							.getClass(superClassConstant.name);
					if (clazz.superClass === undefined) {
						clazz.superClass = this
								.loadClass(superClassConstant.name);
						if (!clazz.superClass) {
							throw new FyException(
									FyConst.FY_EXCEPTION_CLASSNOTFOUND,
									clazz.superClassData.name);
						}
						this.context.registerClass(clazz.superClass);
					}
					superClassConstant.resolvedClass = clazz.superClass;
					// delete superClassConstant.name;
				}
			}

			if (!this.context.TOP_OBJECT
					&& clazz.name === FyConst.FY_BASE_OBJECT) {
				this.context.TOP_OBJECT = clazz;
			} else if (!this.context.TOP_THROWABLE
					&& clazz.name === FyConst.FY_BASE_THROWABLE) {
				this.context.TOP_THROWABLE = clazz;
			} else if (!this.context.TOP_ENUM
					&& clazz.name === FyConst.FY_BASE_ENUM) {
				this.context.TOP_ENUM = clazz;
			} else if (!this.context.TOP_ANNOTATION
					&& clazz.name === FyConst.FY_BASE_ANNOTATION) {
				this.context.TOP_ANNOTATION = clazz;
			} else if (!this.context.TOP_SOFT_REF
					&& clazz.name === FyConst.FY_REF_SOFT) {
				this.context.TOP_SOFT_REF = clazz;
			} else if (!this.context.TOP_WEAK_REF
					&& clazz.name === FyConst.FY_REF_WEAK) {
				this.context.TOP_WEAK_REF = clazz;
			} else if (!this.context.TOP_PHANTOM_REF
					&& clazz.name === FyConst.FY_REF_PHANTOM) {
				this.context.TOP_PHANTOM_REF = clazz;
			} else if (!this.context.TOP_CLASS
					&& clazz.name === FyConst.FY_BASE_CLASS) {
				this.context.TOP_CLASS = clazz;
			} else if (!this.context.TOP_METHOD
					&& clazz.name === FyConst.FY_REFLECT_METHOD) {
				this.context.TOP_METHOD = clazz;
			} else if (!this.context.TOP_CONSTRUCTOR
					&& clazz.name === FyConst.FY_REFLECT_CONSTRUCTOR) {
				this.context.TOP_CONSTRUCTOR = clazz;
			} else if (!this.context.TOP_FIELD
					&& clazz.name === FyConst.FY_REFLECT_FIELD) {
				this.context.TOP_FIELD = clazz;
			}
		}
		clazz.phase = 1;
		return clazz;
	};

	/**
	 * Load class phase 2
	 * 
	 * @param {FyClass}
	 *            clazz
	 */
	FyClassLoader.prototype.phase2 = function(clazz, classDef) {
		if (!clazz || !clazz.name || clazz.phase !== 1) {
			throw new FyException(undefined,
					"Passed illegal class to class loader phase 2");
		}
		clazz.phase = 2;
		switch (clazz.type) {
		case 2/* FyConst.TYPE_ARRAY */:
			break;
		case 0/* FyConst.TYPE_OBJECT */: {
			if (clazz.superClass && clazz.superClass.phase === 1) {
				this.phase2(clazz.superClass,
						this.context.classDef[clazz.superClass.name]);
			}
			// Count method params already done.
			{
				var interfaceDatas = classDef.interfaceDatas;
				var len = interfaceDatas.length;

				for (var i = 0; i < len; i++) {
					var interfaceData = clazz.constants[interfaceDatas[i]];
					clazz.interfaces[i] = this.context
							.lookupClassFromConstant(interfaceData);
				}
			}

			if (clazz.superClass) {
				// Normal class
				var tmp = clazz;
				clazz.sizeAbs = 0;
				while (tmp) {
					clazz.sizeAbs += tmp.sizeRel;
					if (tmp != this.context.TOP_OBJECT
							&& tmp.superClass === undefined) {
						throw new FyException(undefined,
								"broken class link on " + tmp.name);
					}
					tmp = tmp.superClass;
				}
				var fields = clazz.fields;
				var len = fields.length;
				for (var i = 0; i < len; i++) {
					/**
					 * @returns {FyField}
					 */
					var field = fields[i];
					if (field.accessFlags & FyConst.FY_ACC_STATIC) {
						field.posAbs = field.posRel;
					} else {
						field.posAbs = clazz.superClass.sizeAbs + field.posRel;
					}
				}

				/**
				 * @returns {FyMethod}
				 */
				var finalizeMethod = this.context.lookupMethodVirtual(clazz,
						FyConst.FY_METHODF_FINALIZE);

				if (finalizeMethod && finalizeMethod.code.length > 3) {
//					console.log("Class " + clazz.name + " requires finalize");
					clazz.needFinalize = true;
				}

			} else {
				// Object
				clazz.sizeAbs = clazz.sizeRel;
				var fields = clazz.fields;
				var len = fields.length;
				for (var i = 0; i < len; i++) {
					/**
					 * @returns {FyField}
					 */
					var field = fields[i];
					field.posAbs = field.posRel;
				}
			}

			if (this.canCastWithNull(clazz, this.context.TOP_ANNOTATION)) {
//				console.log(clazz.name + " is annotation");
				clazz.accessFlags |= FyConst.FY_ACC_ANNOTATION;
			} else if (this.canCastWithNull(clazz, this.context.TOP_ENUM)) {
//				console.log(clazz.name + " is enum");
				clazz.accessFlags |= FyConst.FY_ACC_ENUM;
			} else if (this
					.canCastWithNull(clazz, this.context.TOP_PHANTOM_REF)) {
//				console.log(clazz.name + " is phantom ref");
				clazz.accessFlags |= FyConst.FY_ACC_PHANTOM_REF;
			} else if (this.canCastWithNull(clazz, this.context.TOP_WEAK_REF)) {
//				console.log(clazz.name + " is weak ref");
				clazz.accessFlags |= FyConst.FY_ACC_WEAK_REF;
			} else if (this.canCastWithNull(clazz, this.context.TOP_SOFT_REF)) {
//				console.log(clazz.name + " is soft ref");
				clazz.accessFlags |= FyConst.FY_ACC_SOFT_REF;
			}

			if (clazz.staticSize > 0) {
				clazz.staticPos = this.context.heap
						.allocateStatic(clazz.staticSize);
			}

			{// method data with types
				var methods = clazz.methods;
				var len = methods.length;
				for (var i = 0; i < len; i++) {
					/**
					 * @returns {FyMethod}
					 */
					var method = methods[i];
					var methodDef = classDef.methods[i];
					if (methodDef.exceptionTable) {
						for ( var etId in methodDef.exceptionTable) {
							var fehDef = methodDef.exceptionTable[etId];
							var feh = method.exceptionTable[etId] = new FyExceptionHandler();
							FyUtils.simpleClone(fehDef, feh, [ "start", "end",
									"handler" ]);
							if (fehDef.catchClassData) {
								feh.catchClass = this.context
										.lookupClassFromConstant(clazz.constants[fehDef.catchClassData]);
							}
						}
					}
				}
			}

			// fields data for gc
			{
				if (clazz.superClass && clazz.superClass.sizeAbs > 0) {
					var len = clazz.superClass.sizeAbs;
					for (var i = 0; i < len; i++) {
						clazz.fieldAbs[i] = clazz.superClass.fieldAbs[i];
						if (clazz.fieldAbs[i] === undefined
								&& (i === 0
										|| (clazz.fieldAbs[i - 1] === undefined) || (clazz.fieldAbs[i - 1].descriptor !== 'J' && clazz.fieldAbs[i - 1].descriptor !== 'D'))) {
							throw new FyException(undefined, "Parent class of "
									+ clazz.name + " (" + clazz.superClass.name
									+ ") is not correctly loaded");
						}
					}
				}
				var fields = clazz.fields;
				var len = fields.length;
//				console.log(clazz.name + " $$$ " + len);
				for (var i = 0; i < len; i++) {
					/**
					 * @returns {FyField}
					 */
					var field = fields[i];
					if (field.accessFlags & FyConst.FY_ACC_STATIC) {
						clazz.fieldStatic[field.posAbs] = field;
//						console.log(clazz.name + " FieldStatic #"
//								+ field.posAbs + " = " + field.name);
					} else {
						clazz.fieldAbs[field.posAbs] = field;
//						console.log(clazz.name + " FieldAbs #" + field.posAbs
//								+ " = " + field.name);
					}
				}
				for (var i = 0; i < len; i++) {
					/**
					 * @returns {FyField}
					 */
					var field = fields[i];
					var fieldDef = classDef.fields[i];
					// type
					switch (field.descriptor.charCodeAt(0)) {
					case 91/* FyConst.ARR */:
						field.type = this.context.lookupClass(field.descriptor);
						break;
					case 76/* FyConst.L */:
						field.type = this.context.lookupClass(field.descriptor
								.substring(1, field.descriptor.length - 1));
						break;
					default:
						var typeClassName = FyContext.primitives[field.descriptor
								.charAt(0)];
						if (typeClassName) {
							field.type = this.context
									.lookupClass(typeClassName);
						} else {
							throw new FyException(null,
									"Illegal descriptor of field!");
						}
					}

					// init static fields for reflection
					if (fieldDef.constantValueData) {
						if ((field.accessFlags & FyConst.FY_ACC_STATIC)
								&& (field.accessFlags & FyConst.FY_ACC_FINAL)) {
							switch (field.descriptor.charCodeAt(0)) {
							case 90/* FyConst.Z */:
							case 66/* FyConst.B */:
							case 83/* FyConst.S */:
							case 67/* FyConst.C */:
							case 73/* FyConst.I */:
							case 70/* FyConst.F */:
								this.context.heap
										.putStaticInt(
												clazz,
												field.posAbs,
												clazz.constants[fieldDef.constantValueData].value);
								break;
							case 68/* FyConst.D */:
							case 74/* FyConst.J */:
								this.context.heap
										.putStaticLongFrom(
												clazz,
												field.posAbs,
												clazz.constants[fieldDef.constantValueData].value,
												0);
								break;
							case 76/* FyConst.L */:
								field.constantValueData = clazz.constants[fieldDef.constantValueData];
								break;
							}
						}
					}
				}
			}
			break;
		}
		case 1/* FyConst.TYPE_PRIMITIVE */:
			break;
		}
		// clazz.phase = 2;
	};

	/**
	 * 
	 * @param {FyClass}
	 *            from
	 * @param {FyClass}
	 *            to
	 * @returns {Boolean} whether class [from] can cast to class [to]
	 */
	FyClassLoader.prototype.canCast = function(from, to) {
		if (from === to || to === this.context.TOP_OBJECT) {
			return true;
		}
		if (from.type === FyConst.TYPE_OBJECT) {
			if (to.accessFlags & FyConst.FY_ACC_INTERFACE) {
				for (var i = 0, max = from.interfaces.length; i < max; i++) {
					/**
					 * @returns {FyClass}
					 */
					var intf = from.interfaces[i];
					if (this.canCast(intf, to)) {
						return true;
					}
				}
			}
			if (from.superClass) {
				return this.canCast(from.superClass, to);
			}
		} else if (from.type === FyConst.TYPE_ARRAY) {
			if (to.type == FyConst.TYPE_ARRAY) {
				return this.canCast(from.contentClass, to.contentClass);
			} else if (to.type == FyConst.TYPE_OBJECT) {
				return to === this.context.TOP_OBJECT;
			} else {
				return false;
			}
		}
		return false;
	};

	/**
	 * returns whether <b>from</b> is super class of <b>to</b>
	 * 
	 * @param {FyClass}
	 *            from
	 * @param {FyClass}
	 *            to
	 * @returns {Boolean}
	 */
	FyClassLoader.prototype.isSuperClassOf = function(from, to) {
		if (from === to) {
			return false;
		}
		return this.canCast(to, from);
	};
	/**
	 * 
	 * @param {FyClass}
	 *            from
	 * @param {FyClass}
	 *            to
	 * @returns {Boolean} whether class [from] can cast to class [to] (if to is
	 *          undefined/null it will return false)
	 */
	FyClassLoader.prototype.canCastWithNull = function(from, to) {
		if (to === undefined || to === null) {
			return false;
		} else {
			return this.canCast(from, to);
		}
	};
})();