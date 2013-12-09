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

var FyField;
(function() {
	/**
	 * @returns {FyClass}
	 */
	var dummyClass=undefined;
	
	FyField = function() {
		this.name = "";
		this.descriptor = "";
		this.accessFlags = 0;
		this.posRel = 0;
		this.size = 0;

		/** Filled in by class loader phase 1* */
		this.fullName = "";
		this.uniqueName = "";
		this.owner = dummyClass;

		/** Filled in by class loader* */
		this.fieldId = 0;

		this.constantValueData = undefined;

		this.type = dummyClass;

		this.posAbs = 0;
		
		Object.preventExtensions(this);
	};

	FyField.prototype.toString = function() {
		return "{Field}" + this.uniqueName;
	};
	
})();