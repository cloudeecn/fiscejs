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
	"use strict";
	/**
	 * @param {FyClass}
	 *            owner
	 * @param {Object}
	 *            methodDef
	 * @param {Array}
	 *            strings
	 */
	FyMethod = function(owner, methodDef, strings) {
		this.owner = owner;
		this.name = strings[methodDef.name];

		this.descriptor = strings[methodDef.descriptor];
		this.fullName = "." + this.name + "." + this.descriptor;
		this.uniqueName = "" + owner.name + this.fullName;
		this.returnClassName = strings[methodDef.returnClassName];

		this.maxStack = methodDef.maxStack | 0;
		this.maxLocals = methodDef.maxLocals | 0;
		this.paramStackUsage = methodDef.paramStackUsage | 0;
		this.parameterCount = methodDef.parameterCount | 0;
		this.accessFlags = methodDef.accessFlags | 0;

		if (this.name === FyConst.FY_METHOD_CLINIT) {
			this.accessFlags |= FyConst.FY_ACC_CLINIT | 0;
		} else if (this.name === FyConst.FY_METHOD_INIT) {
			this.accessFlags |= FyConst.FY_ACC_CONSTRUCTOR | 0;
		}

		this.lineNumberTable = [];
		this.exceptionTable = [];
		FyUtils.cloneIntArray(methodDef.lineNumberTable, this.lineNumberTable);
		FyUtils.cloneIntArray(methodDef.exceptionTable, this.exceptionTable);

		if (this.returnClassName === "<void") {
			this.returnLength = 0 | 0;
		} else if (this.returnClassName === "<double") {
			this.returnLength = 2 | 0;
		} else if (this.returnClassName === "<long") {
			this.returnLength = 2 | 0;
		} else {
			this.returnLength = 1 | 0;
		}

		this.tableSwitchTargets = new Array();
		if ("tableSwitchTargets" in methodDef) {
			var targets = methodDef.tableSwitchTargets;
			for (var tstIdx = 0; tstIdx < targets.length; tstIdx++) {
				var tstDef = targets[tstIdx];
				var tst = new FyTableSwitchTarget(tstDef);
				this.tableSwitchTargets.push(tst);
			}
		}

		this.lookupSwitchTargets = new Array();
		if ("lookupSwitchTargets" in methodDef) {
			for (var lstIdx = 0; lstIdx < methodDef.lookupSwitchTargets.length; lstIdx++) {
				var lstDef = methodDef.lookupSwitchTargets[lstIdx];
				var lst = new FyLookupSwitchTarget(lstDef);
				this.lookupSwitchTargets.push(lst);
			}
		}

		this.parameterClassNames = [];
		for (var idx = 0, im = methodDef.parameterClassNames.length; idx < im; idx++) {
			this.parameterClassNames
					.push(strings[methodDef.parameterClassNames[idx]]);
		}

		this.exceptions = [];
		for (var idx = 0, im = methodDef.exceptions.length; idx < im; idx++) {
			this.exceptions.push(strings[methodDef.exceptions[idx]]);
		}

		this.code = [];
		if ("code" in methodDef) {
			FyUtils.cloneIntArray(methodDef.code, this.code);
		}

		this.frames = new HashMapIObj(2, 1.2);
		for (var idx = 0, im = methodDef.frames.length; idx < im; idx += 2) {
			this.frames.put(methodDef.frames[idx] | 0,
					strings[methodDef.frames[idx + 1]]);
		}

		/** Filled in by class loader during register* */
		this.methodId = 0 | 0;

		this.stackOfs = [];

		// this.clinited = false;

		this.invoke = undefined;
	};

	FyMethod.prototype.setMethodId = function(mid) {
		this.methodId = mid | 0;
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
	};

	FyMethod.prototype.toString = function() {
		return "{Method}" + this.uniqueName;
	};
})();