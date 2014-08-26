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
		this.pending = [];
	};

	/**
	 * @param {String}
	 *            name
	 * @returns {FyClass}
	 */
	FyClassLoader.prototype.lookupAndPend = function(name) {
		var clazz = this.context.lookupClassPhase1(name);
		this.pending.push(clazz);
		return clazz;
	};

	/**
	 * @param {Number}
	 *            constant
	 * @returns {FyClass}
	 */
	FyClassLoader.prototype.lookupConstantAndPend = function(global, constant) {
		var clazz = this.context
				.lookupClassFromConstantPhase1(global, constant);
		this.pending.push(clazz);
		return clazz;
	};

	FyClassLoader.prototype.fixPending = function() {
		/**
		 * @returns {FyClass}
		 */
		var clazz;
		while ((clazz = this.pending.pop()) !== undefined) {
			this.fixPendingSingle(clazz);
		}
	};

	FyClassLoader.prototype.fixPendingSingle = function(clazz) {
		if (clazz.phase === 1) {
			this.phase2(clazz);
		}

		if (clazz.phase === 2) {
			this.phase3(clazz);
		}
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
		// console.log("Load " + name);
		/**
		 * tell eclipse JSDT clazz is a FyClass
		 * 
		 * @returns {FyClass}
		 */
		var clazz;
		if (name.charAt(0) === FyConst.FY_TYPE_ARRAY) {
			// Array
			name = this.context.pool(name);
			clazz = new FyClass(FyConst.TYPE_ARRAY, undefined);
			clazz.name = name;
			clazz.arrayType = FyClassLoader.getArrayContentType(name);
			clazz.superClass = this.lookupAndPend(FyConst.FY_BASE_OBJECT);
			clazz.contentClass = this.lookupAndPend(FyClassLoader
					.getArrayContentName(name));
		} else if (FyContext.mapPrimitivesRev[name]) {
			// Primitive
			name = this.context.pool(name);
			clazz = new FyClass(FyConst.TYPE_PRIMITIVE, undefined);
			clazz.name = name;
			clazz.pType = FyContext.mapPrimitivesRev[name].charCodeAt(0);
			clazz.superClass = this.lookupAndPend(FyConst.FY_BASE_OBJECT);
		} else {
			// Normal class
			// iterate all class defs
			var classDef = undefined;
			var global = undefined;
			for (var i = 0, max = this.context.classDefs.length; i < max; i++) {
				/**
				 * @returns {FyClassDef}
				 */
				var cd = this.context.classDefs[i];
				if (cd.classes[name]) {
					var data = FyUtils.unbase64(cd.classes[name], undefined, 0,
							0);
					var gunzip = new Zlib.Gunzip(data);
					var utf8 = gunzip.decompress();
					data = undefined;
					var outArray = new Array(1);
					var ofs = 0;
					var str = "";
					while (ofs < utf8.length) {
						ofs += FyUtils.utf8Decode(utf8, ofs, outArray, 0);
						str += String.fromCharCode(outArray[0]);
					}
					utf8 = undefined;
					classDef = JSON.parse(str);

					cd.classes[name] = undefined;

					global = cd.global;
					break;
				}
			}
			if (!classDef) {
				throw new FyException(FyConst.FY_EXCEPTION_CLASSNOTFOUND,
						"Class not found: " + name);
			}
			name = this.context.pool(name);
			clazz = new FyClass(FyConst.TYPE_OBJECT);
			clazz.global = global;

			FyUtils.simpleClone(classDef, clazz, [ "accessFlags", "sizeRel",
					"staticSize", "phase" ]);
			clazz.name = name;
			clazz.sourceFile = global.strings[classDef.sourceFile];
			clazz.constants = classDef.constants;
			if (clazz.staticSize > 0) {
				clazz.staticPos = this.context.heap
						.allocateStatic(clazz.staticSize);
			}
			{// Interfaces
				for (var idx = 0, im = classDef.interfaceDatas.length; idx < im; idx++) {
					clazz.interfaces.push(this.lookupConstantAndPend(global,
							clazz.constants[classDef.interfaceDatas[idx]]));
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

					FyUtils.simpleClone(methodDef, method, [ "accessFlags",
							"maxStack", "maxLocals", "paramStackUsage",
							"parameterCount" ]);
					method.name = global.strings[methodDef.name];
					method.descriptor = global.strings[methodDef.descriptor];
					method.returnClassName = global.strings[methodDef.returnClassName];
					method.fullName = this.context.pool("." + method.name + "."
							+ method.descriptor);
					method.uniqueName = this.context.pool(clazz.name
							+ method.fullName);
					method.owner = clazz;
					method.lineNumberTable = methodDef.lineNumberTable;
					method.exceptionTable = methodDef.exceptionTable;
					switch (method.returnClassName) {
					case "void":
						method.returnLength = 0;
						break;
					case "long":
					case "double":
						method.returnLength = 2;
						break;
					default:
						method.returnLength = 1;
						break;
					}

					if (method.name === FyConst.FY_METHOD_CLINIT) {
						clazz.clinit = method;
						method.accessFlags |= FyConst.FY_ACC_CLINIT;
					} else if (method.name === FyConst.FY_METHOD_INIT) {
						method.accessFlags |= FyConst.FY_ACC_CONSTRUCTOR;
					}
					/*
					 * if (methodDef.lineNumberTable) { for (var lnIdx = 0;
					 * lnIdx < methodDef.lineNumberTable.length; lnIdx++) { var
					 * lineNumber = new FyLineNumber(); var lineNumberDef =
					 * methodDef.lineNumberTable[lnIdx];
					 * FyUtils.simpleClone(lineNumberDef, lineNumber);
					 * method.lineNumberTable[lnIdx] = lineNumber; } }
					 */

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

					for (var idx = 0, im = methodDef.frames.length; idx < im; idx += 2) {
						method.frames[methodDef.frames[idx]] = this.context
								.pool(global.strings[methodDef.frames[idx + 1]]);
					}

					for (var idx = 0, im = methodDef.parameterClassNames.length; idx < im; idx++) {
						method.parameterClassNames
								.push(global.strings[methodDef.parameterClassNames[idx]]);
					}

					for (var idx = 0, im = methodDef.exceptions.length; idx < im; idx++) {
						method.exceptions
								.push(global.strings[methodDef.exceptions[idx]]);
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
					FyUtils.simpleClone(fieldDef, field, [ "accessFlags",
							"posRel", "size", "constantValueData" ]);
					field.name = global.strings[fieldDef.name];
					field.descriptor = global.strings[fieldDef.descriptor];
					field.fullName = this.context.pool("." + field.name + "."
							+ field.descriptor);
					// console
					// .log("#CL" + clazz.name + "." + field.name + "@"
					// + i);
					field.uniqueName = this.context.pool(clazz.name
							+ field.fullName);
					field.owner = clazz;
					this.context.registerField(field);
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
												field.posRel,
												global.constants[clazz.constants[fieldDef.constantValueData]]);
								break;
							case 68/* FyConst.D */:
							case 74/* FyConst.J */:
								this.context.heap
										.putStaticLongFrom(
												clazz,
												field.posRel,
												global.constants,
												clazz.constants[fieldDef.constantValueData]);
								break;
							case 76/* FyConst.L */:
								field.constantValueData = clazz.constants[fieldDef.constantValueData];
								break;
							}
						}
					}
				}
			}

			if (classDef.superClassData) {
				var superClassConstant = clazz.constants[classDef.superClassData];
				clazz.superClass = this.lookupConstantAndPend(global,
						superClassConstant);
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
	FyClassLoader.prototype.phase2 = function(clazz) {
		if (!clazz || !clazz.name || clazz.phase !== 1) {
			throw new FyException(undefined,
					"Passed illegal class to class loader phase 2");
		}

		// console.log("Load phase2 " + clazz.name);

		switch (clazz.type) {
		case 2/* FyConst.TYPE_ARRAY */:
			break;
		case 1/* FyConst.TYPE_PRIMITIVE */:
			break;
		case 0/* FyConst.TYPE_OBJECT */: {
			// Count method params already done.
			if (clazz.superClass) {
				// Normal class
				var tmp = clazz.superClass;
				var parentSize = 0;
				clazz.sizeAbs = 0;
				while (tmp) {
					parentSize += tmp.sizeRel;
					if (tmp != this.context.TOP_OBJECT
							&& tmp.superClass === undefined) {
						throw new FyException(undefined,
								"broken class link on " + tmp.name);
					}
					tmp = tmp.superClass;
				}
				clazz.sizeAbs = clazz.sizeRel + parentSize;
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
						field.posAbs = parentSize + field.posRel;
					}
				}

				/**
				 * @returns {FyMethod}
				 */
				var finalizeMethod = this.context.lookupMethodVirtual(clazz,
						FyConst.FY_METHODF_FINALIZE);

				if (finalizeMethod && finalizeMethod.code.length > 3) {
					// console.log("Class " + clazz.name + " requires
					// finalize");
					clazz.accessFlags |= FyConst.FY_ACC_NEED_FINALIZE;
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
				// console.log(clazz.name + " is annotation");
				clazz.accessFlags |= FyConst.FY_ACC_ANNOTATION;
			} else if (this.canCastWithNull(clazz, this.context.TOP_ENUM)) {
				// console.log(clazz.name + " is enum");
				clazz.accessFlags |= FyConst.FY_ACC_ENUM;
			} else if (this
					.canCastWithNull(clazz, this.context.TOP_PHANTOM_REF)) {
				// console.log(clazz.name + " is phantom ref");
				clazz.accessFlags |= FyConst.FY_ACC_PHANTOM_REF;
			} else if (this.canCastWithNull(clazz, this.context.TOP_WEAK_REF)) {
				// console.log(clazz.name + " is weak ref");
				clazz.accessFlags |= FyConst.FY_ACC_WEAK_REF;
			} else if (this.canCastWithNull(clazz, this.context.TOP_SOFT_REF)) {
				// console.log(clazz.name + " is soft ref");
				clazz.accessFlags |= FyConst.FY_ACC_SOFT_REF;
			}

			{// method data with types
				var methods = clazz.methods;
				var len = methods.length;
				for (var i = 0; i < len; i++) {
					/**
					 * @returns {FyMethod}
					 */
					var method = methods[i];
					if (method.exceptionTable.length > 0) {
						for (var j = 0, maxj = method.exceptionTable.length; j < maxj; j += 4) {
							// start end catchidx handler
							if (method.exceptionTable[j + 2]) {
								method.exceptionTable[j + 2] = this
										.lookupConstantAndPend(
												clazz.global,
												clazz.constants[method.exceptionTable[j + 2]]).classId;
							}
						}
					}
				}
			}

			{
				var fields = clazz.fields;
				var len = fields.length;
				for (var i = 0; i < len; i++) {
					/**
					 * @returns {FyField}
					 */
					var field = fields[i];
					// type
					switch (field.descriptor.charCodeAt(0)) {
					case 91/* FyConst.ARR */:
						field.type = this.lookupAndPend(field.descriptor);
						break;
					case 76/* FyConst.L */:
						field.type = this.lookupAndPend(field.descriptor
								.substring(1, field.descriptor.length - 1));
						break;
					default:
						var typeClassName = FyContext.primitives[field.descriptor
								.charAt(0)];
						if (typeClassName) {
							field.type = this.lookupAndPend(typeClassName);
						} else {
							throw new FyException(null,
									"Illegal descriptor of field: "
											+ field.descriptor);
						}
					}
				}
			}
			break;
		}
		}
		clazz.phase = 2;
	};

	FyClassLoader.prototype.phase3 = function(clazz) {
		// fields data for gc and reflection
		{
			if (clazz.superClass && clazz.superClass.phase < 3) {
				this.fixPendingSingle(clazz.superClass);
			}
			// console.log("Load phase3 " + clazz.name);
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
			// console.log(clazz.name + " $$$ " + len);
			for (var i = 0; i < len; i++) {
				/**
				 * @returns {FyField}
				 */
				var field = fields[i];
				if (field.accessFlags & FyConst.FY_ACC_STATIC) {
					clazz.fieldStatic[field.posAbs] = field;
					// console.log(clazz.name + " FieldStatic #"
					// + field.posAbs + " = " + field.name);
				} else {
					clazz.fieldAbs[field.posAbs] = field;
					// console.log(clazz.name + " FieldAbs #" + field.posAbs
					// + " = " + field.name);
				}
			}
		}
		clazz.phase = 3;
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
		// console.log("Can cast: " + from.name + " => " + to.name);
		if (from === to || to === this.context.TOP_OBJECT) {
			// console.log("true");
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
						// console.log("true");
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
		// console.log("false");
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
