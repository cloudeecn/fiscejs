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
		this.posRel = "";
		this.size = "";

		/** Filled in by class loader phase 1* */
		this.fullName = "";
		this.uniqueName = "";
		this.owner = dummyClass;

		/** Filled in by class loader* */
		this.fieldId = 0;

		this.constantValueData = undefined;

		this.type = dummyClass;

		this.posAbs = 0;
	};

	FyField.prototype.toString = function() {
		return "{Field}" + this.uniqueName;
	};
	
})();