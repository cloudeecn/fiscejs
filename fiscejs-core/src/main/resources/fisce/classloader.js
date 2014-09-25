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

	var slowObject = JSON.parse("{\"a\": 1}");

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
	 * @param {string}
	 *            name
	 * @returns {FyClass}
	 */
	FyClassLoader.prototype.lookupAndPend = function(name) {
		var clazz = this.context.lookupClassPhase1(name);
		this.pending.push(clazz);
		return clazz;
	};

	/**
	 * @param {number}
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
		while (this.pending.length > 0) {
			clazz = this.pending.pop();
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

	FyClassLoader.arrayContentTypeTable = {
		"[Z" : FyConst.FY_AT_BYTE,
		"[B" : FyConst.FY_AT_BYTE,

		"[D" : FyConst.FY_AT_LONG,
		"[J" : FyConst.FY_AT_LONG,

		"[C" : FyConst.FY_AT_SHORT,
		"[S" : FyConst.FY_AT_SHORT
	};

	/**
	 * Get array size shift from array class name
	 * 
	 * @param {string}
	 *            arrayName
	 */
	FyClassLoader.getArrayContentType = function(arrayName) {
		if (arrayName in FyClassLoader.arrayContentTypeTable) {
			return FyClassLoader.arrayContentTypeTable[arrayName];
		} else {
			return FyConst.FY_AT_INT;
		}
	};

	FyClassLoader.getArrayContentName = function(arrayName) {
		switch (arrayName.charAt(1)) {
		case "["/* FyConst.ARR */:
			return arrayName.substring(1, arrayName.length);
		case "L"/* FyConst.L */:
			return arrayName.substring(2, arrayName.length - 1);
		default:
			return FyContext.primitives[arrayName.charAt(1)];
		}
	};

	FyClassLoader.getArrayName = function(arrayContentName) {
		if (FyContext.mapPrimitivesRev.hasOwnProperty(arrayContentName)) {
			// primitive
			return "[" + FyContext.mapPrimitivesRev[arrayContentName];
		} else if (arrayContentName.charAt(0) === FyConst.FY_TYPE_ARRAY) {
			// array
			return "[" + arrayContentName;
		} else {
			return "[L" + arrayContentName + ";";
		}
	};

	FyClassLoader.prototype.getClassDef = function(name) {
		var classDef = undefined;
		var global = undefined;
		for (var i = 0, max = this.context.classDefs.length; i < max; i++) {
			/**
			 * @returns {FyClassDef}
			 */
			var cd = this.context.classDefs[i];
			if (name in cd.classes) {
				return {
					classDef : JSON.parse(LZString.decompressFromUTF16(cd.classes[name])),
					global : cd
				};
			}
		}
		throw new FyException(FyConst.FY_EXCEPTION_CLASSNOTFOUND, name);
	};

	FyClassLoader.prototype._locAddInterface = function(clazz, global, constant) {
		if (constant >= clazz.constants.length) {
			throw new FyException(undefined, "IIOB: " + constant + "/"
					+ clazz.constants.length);
		}
		var cvalue = clazz.constants[constant | 0] | 0;
		var intf = this.lookupConstantAndPend(global, cvalue);
		clazz.interfaces.push(intf);
	}

	FyClassLoader.prototype._locAddInterfaces = function(clazz, global,
			classDef) {
		var idx = 0;
		var im = classDef.interfaceDatas.length;
		for (idx = 0; idx < im; idx++) {
			var constant = classDef.interfaceDatas[idx] | 0;
			this._locAddInterface(clazz, global, constant);
		}
	};

	FyClassLoader.prototype._locAddMethod = function(clazz, methodDef, strings) {
		/**
		 * @returns {FyMethod}
		 */
		var method = new FyMethod(clazz, methodDef, strings);
		var name = method.uniqueName;
		if (method.accessFlags & FyConst.FY_ACC_CLINIT) {
			clazz.setClinitMethod(method);
		}
		if (method.accessFlags & FyConst.FY_ACC_NATIVE) {
			if (method.uniqueName in this.context.nativeHandlers) {
				var nativeHandler = this.context.nativeHandlers[method.uniqueName];
				method.invoke = nativeHandler.func;
				method.maxLocals += nativeHandler.extraVars | 0;
				method.maxStack += nativeHandler.stackSize | 0;
			} else if (method.uniqueName in FyContext.staticNativeHandlers) {
				var nativeHandler = FyContext.staticNativeHandlers[method.uniqueName];
				method.invoke = nativeHandler.func;
				method.maxLocals += nativeHandler.extraVars | 0;
				method.maxStack += nativeHandler.stackSize | 0;
			}
		}
		this.context.registerMethod(method);
		clazz.methods.push(method);
	}

	FyClassLoader.prototype._locAddMethods = function(clazz, global, classDef) {
		var methodDefs = classDef.methods;
		var len = methodDefs.length;
		for (var i = 0; i < len; i++) {
			var methodDef = methodDefs[i];
			this._locAddMethod(clazz, methodDef, global.strings);
		}
	};

	/**
	 * @param {FyClass}
	 *            clazz
	 * @param {Object}
	 *            fieldDef
	 * @param {Array}
	 *            strings
	 */
	FyClassLoader.prototype._locAddField = function(clazz, fieldDef, strings,
			constants) {
		var field = new FyField(clazz, fieldDef, strings);
		// init static fields for reflection
		if (field.constantValueData !== 0) {
			if ((field.accessFlags & FyConst.FY_ACC_STATIC)
					&& (field.accessFlags & FyConst.FY_ACC_FINAL)) {
				switch (field.descriptor.charAt(0)) {
				case "Z"/* FyConst.Z */:
				case "B"/* FyConst.B */:
				case "S"/* FyConst.S */:
				case "C"/* FyConst.C */:
				case "I"/* FyConst.I */:
				case "F"/* FyConst.F */:
					this.context.heap
							.putStaticInt(
									clazz,
									field.posRel | 0,
									constants[clazz.constants[fieldDef.constantValueData]] | 0);
					break;
				case "D"/* FyConst.D */:
				case "J"/* FyConst.J */:
					this.context.heap.putStaticLongFrom(clazz, field.posRel,
							constants,
							clazz.constants[fieldDef.constantValueData]);
					break;
				case "L"/* FyConst.L */:
					if (field.descriptor === "Ljava/lang/String;") {
						if (fieldDef.constantValueData > 0
								&& fieldDef.constantValueData < clazz.constants.length) {
							field
									.setConstantValueData(clazz.constants[fieldDef.constantValueData]);
						} else {
							throw new FyException(undefined,
									"Oops! Illegal constant data in field: "
											+ field.uniqueName + ": "
											+ fieldDef.constantValueData);
						}
					}
					break;
				}
			}
		}
		clazz.fields.push(field);
		this.context.registerField(field);
	}

	/**
	 * 
	 * @param {FyClass}
	 *            clazz
	 * @param {FyGlobal}
	 *            global
	 * @param {Object}
	 *            classDef
	 */
	FyClassLoader.prototype._locAddFields = function(clazz, global, classDef) {
		var fieldDefs = classDef.fields;
		var len = fieldDefs.length;
		for (var i = 0; i < len; i++) {
			var fieldDef = fieldDefs[i];
			this
					._locAddField(clazz, fieldDef, global.strings,
							global.constants);
		}
	};

	FyClassLoader.prototype._locAddExtendedFlags = function(clazz, global,
			classDef) {
		if (this.context.TOP_OBJECT === undefined
				&& clazz.name === FyConst.FY_BASE_OBJECT) {
			this.context.TOP_OBJECT = clazz;
		} else if (this.context.TOP_THROWABLE === undefined
				&& clazz.name === FyConst.FY_BASE_THROWABLE) {
			this.context.TOP_THROWABLE = clazz;
		} else if (this.context.TOP_ENUM === undefined
				&& clazz.name === FyConst.FY_BASE_ENUM) {
			this.context.TOP_ENUM = clazz;
		} else if (this.context.TOP_ANNOTATION === undefined
				&& clazz.name === FyConst.FY_BASE_ANNOTATION) {
			this.context.TOP_ANNOTATION = clazz;
		} else if (this.context.TOP_SOFT_REF === undefined
				&& clazz.name === FyConst.FY_REF_SOFT) {
			this.context.TOP_SOFT_REF = clazz;
		} else if (this.context.TOP_WEAK_REF === undefined
				&& clazz.name === FyConst.FY_REF_WEAK) {
			this.context.TOP_WEAK_REF = clazz;
		} else if (this.context.TOP_PHANTOM_REF === undefined
				&& clazz.name === FyConst.FY_REF_PHANTOM) {
			this.context.TOP_PHANTOM_REF = clazz;
		} else if (this.context.TOP_CLASS === undefined
				&& clazz.name === FyConst.FY_BASE_CLASS) {
			this.context.TOP_CLASS = clazz;
		} else if (this.context.TOP_METHOD === undefined
				&& clazz.name === FyConst.FY_REFLECT_METHOD) {
			this.context.TOP_METHOD = clazz;
		} else if (this.context.TOP_CONSTRUCTOR === undefined
				&& clazz.name === FyConst.FY_REFLECT_CONSTRUCTOR) {
			this.context.TOP_CONSTRUCTOR = clazz;
		} else if (this.context.TOP_FIELD === undefined
				&& clazz.name === FyConst.FY_REFLECT_FIELD) {
			this.context.TOP_FIELD = clazz;
		}
	};

	FyClassLoader.prototype._loadObjectClass = function(clazz, global, classDef) {
		this._locAddInterfaces(clazz, global, classDef);
		this._locAddMethods(clazz, global, classDef);
		this._locAddFields(clazz, global, classDef);
		this._locAddExtendedFlags(clazz, global, classDef);
	};

	/**
	 * load class
	 * 
	 * @param {string}
	 *            name
	 */
	FyClassLoader.prototype.loadClass = function(name) {
		// console.log("Load " + name);
		name = this.context.pool(name);
		var clazz;
		if (name.charAt(0) === "[" || name.charAt(0) === "<") {
			clazz = new FyClass(this, name, slowObject, slowObject);
		} else {
			var cd = this.getClassDef(name);
			clazz = new FyClass(this, name, cd.classDef, cd.global);
			this._loadObjectClass(clazz, cd.global, cd.classDef);
		}
		clazz.setPhase(1);
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

		if (clazz.type === FyConst.TYPE_OBJECT) {
			// Count method params already done.
			if (clazz.superClass !== undefined) {
				// Normal class
				var tmp = clazz.superClass;
				var parentSize = 0;
				while (tmp) {
					parentSize += tmp.sizeRel;
					if (tmp != this.context.TOP_OBJECT
							&& tmp.superClass === undefined) {
						throw new FyException(undefined,
								"broken class link on " + tmp.name);
					}
					tmp = tmp.superClass;
				}
				clazz.sizeAbs += parentSize;
				// console.log("sizeAbs="+clazz.sizeAbs);
				// console.log("parentSize="+parentSize);
				var fields = clazz.fields;
				var len = fields.length;
				for (var i = 0; i < len; i++) {
					/**
					 * @returns {FyField}
					 */
					var field = fields[i];
					if ((field.accessFlags & FyConst.FY_ACC_STATIC) === 0) {
						field.posAbs += parentSize;
					}
					// console.log("field "+field+" posAbs="+field.posAbs+"
					// posRel="+field.posRel);
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
							var j2 = j + 2;
							if (method.exceptionTable[j2]) {
								method.exceptionTable[j2] = this
										.lookupConstantAndPend(
												clazz.global,
												clazz.constants[method.exceptionTable[j + 2]]).classId | 0;
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
					switch (field.descriptor.charAt(0)) {
					case "["/* FyConst.ARR */:
						field.type = this.lookupAndPend(field.descriptor);
						break;
					case "L"/* FyConst.L */:
						field.type = this.lookupAndPend(field.descriptor
								.substring(1, field.descriptor.length - 1));
						break;
					default:
						if (field.descriptor.charAt(0) in FyContext.primitives) {
							var typeClassName = FyContext.primitives[field.descriptor
									.charAt(0)];
							field.type = this.lookupAndPend(typeClassName);
						} else {
							throw new FyException(undefined,
									"Illegal descriptor of field: "
											+ field.descriptor);
						}
					}
				}
			}
		}
		clazz.setPhase(2);
	};

	FyClassLoader.prototype.phase3 = function(clazz) {
		// fields data for gc and reflection
		var fields = clazz.fields;
		var field;
		var lastField;
		var error = false;
		var pos;
		var i = 0 | 0, len = 0 | 0;
		var j, maxj;
		{
			if (clazz.superClass && clazz.superClass.phase < 3) {
				this.fixPendingSingle(clazz.superClass);
			}
			// console.log("Load phase3 " + clazz.name);
			if (clazz.superClass && clazz.superClass.sizeAbs > 0) {
				len = clazz.superClass.sizeAbs;
				// console.log("len=" + len);
				for (i = 0; i < len; i++) {
					// console.log(i + " " + field);
					var field = clazz.superClass.fieldAbs[i];
					if (field === undefined) {
						error = false;
						if (i === 0) {
							error = true;
						} else {
							/**
							 * @returns {FyField}
							 */
							lastField = clazz.fieldAbs[i - 1];
							if (lastField === undefined) {
								error = true;
							} else if (lastField.descriptor !== 'J'
									&& lastField.descriptor !== 'D') {
								error = true;
							}
						}
						if (error) {
							throw new FyException(undefined, "Parent class of "
									+ clazz.name + " (" + clazz.superClass.name
									+ ") is not correctly loaded");
						}
					}
					clazz.fieldAbs.push(field);
				}
			}

			len = fields.length;
			// console.log(clazz.name + " $$$ " + len);
			for (i = 0; i < len; i++) {
				/**
				 * @returns {FyField}
				 */
				field = fields[i];
				pos = field.posAbs;
				if (field.accessFlags & FyConst.FY_ACC_STATIC) {
					if (pos >= clazz.fieldStatic.length) {
						maxj = pos - clazz.fieldStatic.length;
						for (j = 0; j < maxj; j++) {
							clazz.fieldStatic.push(undefined);
						}
						clazz.fieldStatic.push(field);
					} else {
						clazz.fieldStatic[pos] = field;
					}
//					console.log(clazz.name + " FieldStatic #" + field.posAbs
//							+ " = " + field.name);
				} else {
					if (pos >= clazz.fieldAbs.length) {
						maxj = pos - clazz.fieldAbs.length;
						for (j = 0; j < maxj; j++) {
							clazz.fieldAbs.push(undefined);
						}
						clazz.fieldAbs.push(field);
					} else {
						clazz.fieldAbs[pos] = field;
					}
					// clazz.fieldAbs.put(field.posAbs, field);
//					console.log(clazz.name + " FieldAbs #" + field.posAbs
//							+ " = " + field.name);
				}
			}
		}
		clazz.setPhase(3);
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
		if (to === undefined) {
			return false;
		} else {
			return this.canCast(from, to);
		}
	};
})();
