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
	 * @param {Object}
	 *            classDef
	 * @param {FyGlobal}
	 *            global
	 */
	FyClass = function(classloader, name, classDef, global) {
		var context = classloader.context;
		this.classloader = classloader;

		this.name = name;
		this.global = global;
		this.constants = [];

		this.staticSize = 0 | 0;
		this.sizeRel = 0 | 0;

		this.type = 0;
		this.accessFlags = 0;
		this.pType = undefined;
		this.contentClass = undefined;
		this.sourceFile = undefined;
		this.superClass = undefined;

		if (this.name.charAt(0) === "[") {
			this.type = FyConst.TYPE_ARRAY;

			this.accessFlags = (FyConst.FY_ACC_PUBLIC & FyConst.FY_ACC_FINAL) | 0;
			this.arrayType = FyClassLoader.getArrayContentType(this.name);
			this.pType = undefined;
			this.contentClass = classloader.lookupAndPend(FyClassLoader
					.getArrayContentName(this.name));

			this.sourceFile = undefined;
			this.superClass = classloader.lookupAndPend(FyConst.FY_BASE_OBJECT);
		} else if (this.name.charAt(0) === "<") {
			this.type = FyConst.TYPE_PRIMITIVE;

			this.accessFlags = (FyConst.FY_ACC_PUBLIC & FyConst.FY_ACC_FINAL) | 0;
			this.arrayType = 0 | 0;
			if (!(this.name in FyContext.mapPrimitivesRev)) {
				throw new FyException(undefined, "Illegal class name "
						+ this.name);
			}
			this.pType = FyContext.mapPrimitivesRev[this.name];
			this.contentClass = undefined;

			this.sourceFile = undefined;
			this.superClass = classloader.lookupAndPend(FyConst.FY_BASE_OBJECT);
		} else {
			this.type = FyConst.TYPE_OBJECT;

			FyUtils.cloneIntArray(classDef.constants, this.constants);

			this.accessFlags = classDef.accessFlags | 0;
			this.arrayType = 0 | 0;
			this.pType = undefined;
			this.contentClass = undefined;

			this.sourceFile = undefined;
			if ("sourceFile" in classDef && classDef.sourceFile !== 0) {
				this.sourceFile = global.strings[classDef.sourceFile];
			}
			this.superClass = undefined;
			if ("superClassData" in classDef) {
				var superClassData = classDef.superClassData | 0;
				if (superClassData !== 0) {
					var superClassConstant = this.constants[classDef.superClassData];
					this.superClass = classloader.lookupConstantAndPend(global,
							superClassConstant);
				}
			}

			this.staticSize += classDef.staticSize | 0;
			this.sizeRel += classDef.sizeRel | 0;

		}
		this.sizeAbs = this.sizeRel;

		if (this.staticSize > 0) {
			this.staticPos = context.heap
					.allocateStatic(this.staticSize, false);
		} else {
			this.staticPos = 0 | 0;
		}

		this.fields = new Array();
		this.methods = new Array();
		this.interfaces = new Array();

		this.phase = 0 | 0;

		/* Filled by class loader */
		this.classId = 0 | 0;

		this.clinitThreadId = 0 | 0;
		/**
		 * @returns {FyMethod}
		 */
		this.clinit = undefined;

		/* BEGIN GC Only */
		this.fieldStatic = new Array();
		this.fieldAbs = new Array();
		/* END GC Only */

		this.virtualTable = new HashMapI(-1, 3, 0.75);

	};

	/**
	 * 
	 * @param {FyMethod}
	 *            clinitMethod
	 */
	FyClass.prototype.setClinitMethod = function(clinitMethod) {
		this.clinit = clinitMethod;
	};

	FyClass.prototype.setPhase = function(phase) {
		this.phase = phase | 0;
	};

	FyClass.prototype.setClassId = function(cid) {
		this.classId = cid | 0;
	}

	FyClass.prototype.addAccessFlag = function(flag) {
		this.accessFlags |= flag | 0;
	}

	FyClass.prototype.getAccessFlag = function() {
		return this.accessFlags | 0;
	}

	FyClass.prototype.toString = function() {
		return "{class}"+this.name;
	};

})();
