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
	 * @returns {FyClass}
	 */
	var dummyClass = undefined;

	/**
	 * @returns {FyMethod}
	 */
	var dummyMethod = undefined;

	/**
	 * @returns {FyGlobal}
	 */
	var dummyGlobal = undefined;

	/**
	 * 
	 * @param {Number}
	 *            type
	 */
	FyClass = function(type) {
		this.name = "";
		this.sourceFile = undefined;

		this.majorVersion = 0;
		this.minorVersion = 0;
		this.constants = [];

		this.accessFlags = 0;

		// this.superClassData = undefined;
		// this.interfaceDatas = undefined;

		this.fields = [];
		this.methods = [];
		this.sizeRel = 0;
		this.staticSize = 0;
		this.staticPos = 0;

		this.phase = 0;

		/* Filled by class loader */
		this.classId = 0;
		this.sizeAbs = 0;
		this.ofsInHeap = 0;

		this.interfaces = [];

		this.superClass = dummyClass;
		this.type = type;
		/*
		 * this.arr = { arrayType : 0, contentClass : undefined };
		 * 
		 * this.prm = { pType : "" };
		 */

		this.clinitThreadId = 0;
		/**
		 * @return FyMethod
		 */
		this.clinit = dummyMethod;

		/* BEGIN GC Only */
		this.fieldStatic = [];
		this.fieldAbs = [];
		/* END GC Only */

		this.virtualTable = new HashMapI(-1, 3, 0.75);

		/** Array only* */
		this.contentClass = dummyClass;
		this.arrayType = 0;

		/** primitive only */
		this.pType = undefined;

		this.global = dummyGlobal;

		Object.preventExtensions(this);
	};

	FyClass.prototype.toString = function() {
		return this.name;
	};
	
	FyClass.empty = new FyClass(0);
})();
