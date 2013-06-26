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
 * @param {FiScEContext}
 *            context
 */
function FiScEClassLoader(context) {
	this.context = context;
}

/**
 * Get array size shift from array class name
 * 
 * @param {String}
 *            arrayName
 */
FiScEClassLoader.getArrayContentType = function(arrayName) {
	switch (arrayName.charAt(1)) {
	case FiScEConst.FY_TYPE_BOOLEAN:
	case FiScEConst.FY_TYPE_BYTE:
		return FiScEConst.FY_AT_BYTE;
	case FiScEConst.FY_TYPE_DOUBLE:
	case FiScEConst.FY_TYPE_LONG:
		return FiScEConst.FY_AT_LONG;
	case FiScEConst.FY_TYPE_CHAR:
	case FiScEConst.FY_TYPE_SHORT:
		return FiScEConst.FY_AT_SHORT;
	case FiScEConst.FY_TYPE_INT:
	case FiScEConst.FY_TYPE_FLOAT:
	case FiScEConst.FY_TYPE_HANDLE:
	case FiScEConst.FY_TYPE_ARRAY:
		return FiScEConst.FY_AT_INT;
	default:
		throw new FiScEException(null, "Illegal array type: " + arrayName + "("
				+ arrayName.charCodeAt(1) + ")");
	}
};

/**
 * load class
 * 
 * @param {String}
 *            name
 */
FiScEClassLoader.prototype.loadClass = function(name) {
	/**
	 * tell eclipse JSDT clazz is a FiScEClass
	 * 
	 * @returns {FiScEClass}
	 */
	var clazz;
	name = FiScEContext.pool(name);
	if (name.charAt(0) == FiScEConst.FY_TYPE_ARRAY) {
		// Array
		clazz = new FiScEClass(FiScEConst.TYPE_ARRAY);
		clazz.className = name;
		clazz.superClass = this.context.lookupClass(FiScEConst.FY_BASE_OBJECT);
		clazz.arrayType = this.getArrayContentType(name);
		switch (name.charAt(1)) {
		case FiScEConst.FY_TYPE_ARRAY:
			clazz.contentClass = this.context.lookupClass(name.substring(1,
					name.length));
			break;
		case FiScEConst.FY_TYPE_HANDLE:
			clazz.contentClass = this.context.lookupClass(name.substring(2,
					name.length - 1));
			break;
		default:
			clazz.contentClass = this.context
					.lookupClass(FiScEContext.primitives[name.charAt(1)]);
			break;
		}
	} else if (FiScEContext.mapPrimitivesRev[name]) {
		// Primitive
		clazz = new FiScEClass(FiScEConst.TYPE_PRIMITIVE);
		clazz.className = name;
		clazz.superClass = this.context.lookupClass(FiScEConst.FY_BASE_OBJECT);
		clazz.pType = FiScEContext.mapPrimitivesRev[name];
	} else {
		// Normal class
		var classDef = this.context.classDef[name];
		if (!classDef) {
			throw new FiScEException(FiScEConst.FY_EXCEPTION_CLASSNOTFOUND,
					"Class not found: " + name);
		}
		clazz = new FiScEClass(FiScEConst.TYPE_OBJECT);

		FiScEUtils.shallowClone(classDef, clazz);

		{// Methods
			var methods = clazz.methods;
			var len = methods.length;
			for ( var i = 0; i < len; i++) {
				/**
				 * @returns {FiScEMethod}
				 */
				var method = methods[i];
				method.fullName = "." + method.name + "." + method.descriptor;
				method.uniqueName = clazz.name + method.fullName;
				method.owner = clazz;
			}
		}

		{// Fields
			var fields = clazz.fields;
			var len = fields.length;
			for ( var i = 0; i < len; i++) {
				/**
				 * @returns {FiScEField}
				 */
				var field = fields[i];
				field.fullName = "." + field.name + "." + field.descriptor;
				field.uniqueName = clazz.name + field.fullName;
				field.owner = clazz;
			}
		}

		if (clazz.staticSize > 0) {
			clazz.staticArea = new Uint32Array(clazz.staticSize);
		}

		if (clazz.superClassName) {
			clazz.superClass = this.context.lookupClass(clazz.superClassName);
		}

		if (!this.context.TOP_CLASS && clazz.name == FiScEConst.FY_BASE_CLASS) {
			this.context.TOP_CLASS = clazz;
		} else if (!this.context.TOP_THROWABLE
				&& clazz.name == FiScEConst.FY_BASE_THROWABLE) {
			this.context.TOP_THROWABLE = clazz;
		} else if (!this.context.TOP_ENUM
				&& clazz.name == FiScEConst.FY_BASE_ENUM) {
			this.context.TOP_ENUM = clazz;
		} else if (!this.context.TOP_ANNOTATION
				&& clazz.name == FiScEConst.FY_BASE_ANNOTATION) {
			this.context.TOP_ANNOTATION = clazz;
		} else if (!this.context.TOP_SOFT_REF
				&& clazz.name == FiScEConst.FY_REF_SOFT) {
			this.context.TOP_SOFT_REF = clazz;
		} else if (!this.context.TOP_WEAK_REF
				&& clazz.name == FiScEConst.FY_REF_WEAK) {
			this.context.TOP_WEAK_REF = clazz;
		} else if (!this.context.TOP_PHANTOM_REF
				&& clazz.name == FiScEConst.FY_REF_PHANTOM) {
			this.context.TOP_PHANTOM_REF = clazz;
		}

		clazz.phase = 1;
	}
	return clazz;
};

/**
 * Load class phase 2
 * 
 * @param {FiScEClass}
 *            clazz
 */
FiScEClassLoader.prototype.phase2 = function(clazz) {
	switch (clazz.type) {
	case FiScEConst.TYPE_ARRAY:
		break;
	case FiScEConst.TYPE_OBJECT: {
		// Count method params already done.

		var interfaceNames = clazz.interfaceNames;
		var len = interfaceNames.length;
		for ( var i = 0; i < len; i++) {
			/**
			 * @returns {String}
			 */
			var interfaceName = interfaceNames[i];
			clazz.interfaces[i] = this.context.lookupClass(interfaceName);
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
				 * @returns {FiScEField}
				 */
				var field = fields[i];
				if (field.accessFlags & FiScEConst.FY_ACC_STATIC) {

				} else {
					field.posAbs = clazz.superClass.sizeAbs + field.posRel;
				}
			}

			// TODO fill need finalize

		} else {
			// Object
			clazz.sizeAbs = clazz.sizeRel;
			var fields = clazz.fields;
			var len = fields.length;
			for ( var i = 0; i < len; i++) {
				/**
				 * @returns {FiScEField}
				 */
				var field = fields[i];
				field.posAbs = field.posRel;
			}
		}

		// TODO add extend accessFlags for special classes(annotation/enum/refs)

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
				 * @returns {FiScEField}
				 */
				var field = fields[i];
				if (field.accessFlags & FiScEConst.FY_ACC_STATIC) {
					clazz.staticFields[field.posAbs] = field;
				} else {
					clazz.absFields[field.posAbs] = field;
				}

				// type
				switch (field.descriptor.charAt(0)) {
				case '[':
					field.type = this.context.lookupClass(field.descriptor);
					break;
				case 'L':
					field.type = this.context.lookupClass(field.descriptor
							.substring(1, field.descriptor - 1));
					break;
				default:
					var typeClassName = FiScEContext.primitives[field.descriptor
							.charAt(0)];
					if (typeClassName) {
						field.type = this.context.lookupClass(typeClassName);
					} else {
						throw new FiScEException(null,
								"Illegal descriptor of field!");
					}
				}
			}
		}
		
		// init static fields for reflection
		{
			//TODO
		}
		break;
	}
	case FiScEConst.TYPE_PRIMITIVE:
		break;
	}
	clazz.phase = 2;
};
