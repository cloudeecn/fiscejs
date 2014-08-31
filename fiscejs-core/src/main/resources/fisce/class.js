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

var FyClass;
(function() {
	"use strict";

	/**
	 * 
	 * @param {FyClassLoader}
	 *            classloader
	 * @param {String}
	 *            name
	 */
	FyClass = function(classloader, name) {
		this.classloader = classloader;
		this.name = name;
		this.sourceFile = undefined;

		this.constants = new Array();

		this.accessFlags = 0 | 0;

		// this.superClassData = undefined;
		// this.interfaceDatas = undefined;

		this.fields = new Array();
		this.methods = new Array();
		this.sizeRel = 0 | 0;
		this.staticSize = 0 | 0;
		this.staticPos = 0 | 0;

		this.phase = 0 | 0;

		/* Filled by class loader */
		this.classId = 0 | 0;
		this.sizeAbs = 0 | 0;
		this.ofsInHeap = 0 | 0;

		this.interfaces = new Array();

		this.superClass = undefined;
		this.type = FyConst.TYPE_OBJECT;
		/*
		 * this.arr = { arrayType : 0, contentClass : undefined };
		 * 
		 * this.prm = { pType : "" };
		 */

		this.clinitThreadId = 0;
		/**
		 * @return FyMethod
		 */
		this.clinit = undefined;

		/* BEGIN GC Only */
		this.fieldStatic = new Array();
		this.fieldAbs = new Array();
		/* END GC Only */

		this.virtualTable = new HashMapI(-1, 3, 0.75);

		/** Array only* */
		this.contentClass = undefined;
		this.arrayType = 0 | 0;

		/** primitive only */
		this.pType = undefined;

		this.global = undefined;

		Object.preventExtensions(this);
	};

	FyClass.prototype.asArrayClass = function() {
		this.type = FyConst.TYPE_ARRAY;
		this.arrayType = FyClassLoader.getArrayContentType(this.name);

		this.superClass = this.classloader
				.lookupAndPend(FyConst.FY_BASE_OBJECT);
		this.contentClass = this.classloader.lookupAndPend(FyClassLoader
				.getArrayContentName(this.name));
		return this;
	};

	FyClass.prototype.asPrimClass = function() {
		this.type = FyConst.TYPE_PRIMITIVE;
		this.pType = FyContext.mapPrimitivesRev[this.name];
		this.superClass = this.classloader
				.lookupAndPend(FyConst.FY_BASE_OBJECT);
		return this;
	};

	FyClass.prototype.toString = function() {
		return this.name;
	};

})();
