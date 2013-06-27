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

function FiScEContext() {
	this.classDef = {};

	/* Classes begins from 1 */
	this.classes = [ null ];
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
}

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
FiScEContext.pool = function(string) {
	var ret = this.stringPool[string];
	if (ret === undefined) {
		ret = string;
		this.stringPool[string] = string;
	}
	return ret;
};

FiScEContext.prototype.addClassDef = function(defs) {
	for ( var i = 0; i < defs.length; i++) {
		var classDef = defs[i];
		this.classDef[classDef.name] = classDef;
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
 * Lookup method
 * 
 * @param {FiScEClass}
 *            clazz
 * @param {String}
 *            fullName
 * @returns {FiScEMethod} method
 */
FiScEContext.prototype.lookupMethodVirtual = function(clazz, fullName) {
	/**
	 * @returns {String}
	 */
	var uniqueName = clazz.name + fullName;
	var first = true;
	while (clazz) {
		/**
		 * @returns {String}
		 */
		var uniqueNameTmp = clazz.name + fullName;
		var mid = this.mapMethodNameToId[uniqueNameTmp];
		if (mid !== undefined) {
			if (!first) {
				this.mapMethodNameToId[uniqueName] = mid;
			}
			return this.methods[mid];
		}
		clazz = clazz.superClass;
		first = false;
	}
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
		clazz = this.classLoader.loadClass(name);
		this.registerClass(clazz);
		this.classLoader.phase2(clazz);
		this.lookupClass(FiScEConst.FY_BASE_CLASS);
	}
	return clazz;
};
