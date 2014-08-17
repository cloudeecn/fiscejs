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

var FyMethod;
(function() {
	/**
	 * @returns {FyClass}
	 */
	var dummyClass = undefined;

	FyMethod = function() {
		this.name = "";
		this.descriptor = "";
		this.accessFlags = "";

		this.paramStackUsage = 0;
		this.returnLength = 0;

		this.parameterCount = 0;
		this.parameterClassNames = [];
		this.returnClassName = "";

		this.exceptions = [];
		this.exceptionTable = [];
		this.lineNumberTable = [];

		this.maxStack = 0;
		this.maxLocals = 0;
		this.code = [];

		/** Filled in by class loader phase 1* */
		this.fullName = "";
		this.uniqueName = "";
		this.owner = dummyClass;

		/** Filled in by class loader* */
		this.methodId = 0;

		this.stackOfs = [];
		this.frames = [];
		this.tableSwitchTargets = [];
		this.lookupSwitchTargets = [];

		// this.clinited = false;

		this.invoke = undefined;

		Object.preventExtensions(this);
	};

	FyMethod.prototype.getLineNumber = function(ip) {
		if (this.accessFlags & FyConst.FY_ACC_NATIVE) {
			return -1;
		} else if (this.lineNumberTable) {
			for (var j = this.lineNumberTable.length - 2; j >= 0; j--) {
				var start = this.lineNumberTable[j];
				var ln = this.lineNumberTable[j + 1];
				if (ip > start) {
					return ln;
				}
			}
		}
		return -2;
	};

	FyMethod.prototype.getSpOfs = function(ip) {
		return this.stackOfs[ip];
	}

	FyMethod.prototype.toString = function() {
		return "{Method}" + this.uniqueName;
	};

	FyMethod.empty = new FyMethod();
})();