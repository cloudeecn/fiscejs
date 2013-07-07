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
		switch (arrayName.charAt(1)) {
		case FyConst.FY_TYPE_BOOLEAN:
		case FyConst.FY_TYPE_BYTE:
			return FyConst.FY_AT_BYTE;
		case FyConst.FY_TYPE_DOUBLE:
		case FyConst.FY_TYPE_LONG:
			return FyConst.FY_AT_LONG;
		case FyConst.FY_TYPE_CHAR:
		case FyConst.FY_TYPE_SHORT:
			return FyConst.FY_AT_SHORT;
		case FyConst.FY_TYPE_INT:
		case FyConst.FY_TYPE_FLOAT:
		case FyConst.FY_TYPE_HANDLE:
		case FyConst.FY_TYPE_ARRAY:
			return FyConst.FY_AT_INT;
		default:
			throw new FyException(null, "Illegal array type: " + arrayName
					+ "(" + arrayName.charCodeAt(1) + ")");
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
			switch (name.charAt(1)) {
			case FyConst.FY_TYPE_ARRAY:
				clazz.contentClass = this.context.lookupClass(name.substring(1,
						name.length));
				break;
			case FyConst.FY_TYPE_HANDLE:
				clazz.contentClass = this.context.lookupClass(name.substring(2,
						name.length - 1));
				break;
			default:
				clazz.contentClass = this.context
						.lookupClass(FyContext.primitives[name.charAt(1)]);
				break;
			}
		} else if (FyContext.mapPrimitivesRev[name]) {
			// Primitive
			name = this.context.pool(name);
			clazz = new FyClass(FyConst.TYPE_PRIMITIVE);
			clazz.name = name;
			clazz.superClass = this.context.lookupClass(FyConst.FY_BASE_OBJECT);
			clazz.pType = FyContext.mapPrimitivesRev[name];
		} else {
			// Normal class
			var classDef = this.context.classDef[name];
			if (!classDef) {
				throw new FyException(FyConst.FY_EXCEPTION_CLASSNOTFOUND,
						"Class not found: " + name);
			}
			name = this.context.pool(name);
			clazz = new FyClass(FyConst.TYPE_OBJECT);

			FyUtils.shallowClone(classDef, clazz);

			{// Methods
				var methods = clazz.methods;
				var len = methods.length;
				for ( var i = 0; i < len; i++) {
					/**
					 * @returns {FyMethod}
					 */
					var method = methods[i];

					method.fullName = this.context.pool("." + method.name + "."
							+ method.descriptor);
					method.uniqueName = this.context.pool(clazz.name
							+ method.fullName);
					method.owner = clazz;
					if (method.name === "<clinit>") {
						clazz.clinit = method;
					}
					this.context.registerMethod(method);
				}
			}

			{// Fields
				var fields = clazz.fields;
				var len = fields.length;
				for ( var i = 0; i < len; i++) {
					/**
					 * @returns {FyField}
					 */
					var field = fields[i];
					field.fullName = this.context.pool("." + field.name + "."
							+ field.descriptor);
					field.uniqueName = this.context.pool(clazz.name
							+ field.fullName);
					field.owner = clazz;
					this.context.registerField(field);
				}
			}

			if (clazz.superClassData) {
				var superClassName = clazz.superClassData.name;
				clazz.superClass = this.context
						.lookupClassFromConstant(clazz.superClassData);
				if (!clazz.superClass) {
					console.log("Class not found: " + superClassName);
					throw new FyException(FyConst.FY_EXCEPTION_CLASSNOTFOUND,
							clazz.superClassData.name);
				}
				delete clazz.superClassData;
			}

			if (!this.context.TOP_CLASS && clazz.name === FyConst.FY_BASE_OBJECT) {
				this.context.TOP_CLASS = clazz;
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
				this.context.TOP_PHA3NTOM_REF = clazz;
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
			throw "Passed illegal class to class loader phase 2";
		}
		switch (clazz.type) {
		case FyConst.TYPE_ARRAY:
			break;
		case FyConst.TYPE_OBJECT: {
			// Count method params already done.
			{
				var interfaceDatas = clazz.interfaceDatas;
				var len = interfaceDatas.length;

				for ( var i = 0; i < len; i++) {
					/**
					 * @returns {String}
					 */
					var interfaceData = interfaceDatas[i];
					clazz.interfaces[i] = this.context
							.lookupClassFromConstant(interfaceData);
				}
				delete clazz.interfaceDatas;
			}

			if (clazz.superClass) {
				// Normal class
				var tmp = clazz;
				clazz.sizeAbs = 0;
				while (tmp) {
					clazz.sizeAbs += tmp.sizeRel;
					tmp = tmp.superClass;
				}
				var fields = clazz.fields;
				var len = fields.length;
				for ( var i = 0; i < len; i++) {
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

				if (finalizeMethod && finalizeMethod.code.length > 1) {
					clazz.needFinalize = true;
				}

			} else {
				// Object
				clazz.sizeAbs = clazz.sizeRel;
				var fields = clazz.fields;
				var len = fields.length;
				for ( var i = 0; i < len; i++) {
					/**
					 * @returns {FyField}
					 */
					var field = fields[i];
					field.posAbs = field.posRel;
				}
			}

			if (this.canCastWithNull(clazz, this.context.TOP_ANNOTATION)) {
				clazz.accessFlags |= FyConst.FY_ACC_ANNOTATION;
			} else if (this.canCastWithNull(clazz, this.context.TOP_ENUM)) {
				clazz.accessFlags |= FyConst.FY_ACC_ENUM;
			} else if (this
					.canCastWithNull(clazz, this.context.TOP_PHANTOM_REF)) {
				clazz.accessFlags |= FyConst.FY_ACC_PHANTOM_REF;
			} else if (this.canCastWithNull(clazz, this.context.TOP_WEAK_REF)) {
				clazz.accessFlags |= FyConst.FY_ACC_WEAK_REF;
			} else if (this.canCastWithNull(clazz, this.context.TOP_SOFT_REF)) {
				clazz.accessFlags |= FyConst.FY_ACC_SOFT_REF;
			}

			if (clazz.staticSize > 0) {
				this.context.heap.allocateStatic(clazz);
			}

			// fields data for gc
			{
				if (clazz.superClass && clazz.superClass.sizeAbs > 0) {
					var len = clazz.superClass.sizeAbs;
					for ( var i = 0; i < len; i++) {
						clazz.fieldAbs[i] = clazz.superClass.fieldAbs[i];
					}
				}
				var fields = clazz.fields;
				var len = fields.length;
				for ( var i = 0; i < len; i++) {
					/**
					 * @returns {FyField}
					 */
					var field = fields[i];
					if (field.accessFlags & FyConst.FY_ACC_STATIC) {
						clazz.fieldStatic[field.posAbs] = field;
					} else {
						clazz.fieldAbs[field.posAbs] = field;
					}

					// type
					switch (field.descriptor.charAt(0)) {
					case '[':
						field.type = this.context.lookupClass(field.descriptor);
						break;
					case 'L':
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
					if (field.constantValueData) {
						if ((field.accessFlags & FyConst.FY_ACC_STATIC)
								&& (field.accessFlags & FyConst.FY_ACC_FINAL)) {
							switch (field.descriptor.charAt(0)) {
							case FyConst.FY_TYPE_BOOLEAN:
							case FyConst.FY_TYPE_BYTE:
							case FyConst.FY_TYPE_SHORT:
							case FyConst.FY_TYPE_CHAR:
							case FyConst.FY_TYPE_INT:
							case FyConst.FY_TYPE_FLOAT:
								this.context.heap.putStaticRaw(clazz,
										field.posAbs,
										field.constantValueData.value);
								break;
							case FyConst.FY_TYPE_DOUBLE:
							case FyConst.FY_TYPE_LONG:
								this.context.heap.putStaticRawLongFrom(clazz,
										field.posAbs,
										field.constantValueData.value, 0);
								break;
							case FyConst.FY_TYPE_HANDLE:
								// Handle type will be lazy loaded in
								// Field.get()
								break;
							}
						}
					}
				}
			}
			break;
		}
		case FyConst.TYPE_PRIMITIVE:
			break;
		}
		clazz.phase = 2;
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
		// console.log("+cast test " + from.name + " -> " + to.name);
		if (from === to || to === this.context.TOP_CLASS) {
			return true;
		}
		if (from.type === FyConst.TYPE_OBJECT) {
			if (to.accessFlags & FyConst.FY_ACC_INTERFACE) {
				for ( var i = 0, max = from.interfaces.length; i < max; i++) {
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
				return to === this.context.TOP_CLASS;
			} else {
				return false;
			}
		}
		return false;
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