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
		this.paramType = "";
		this.returnType = "";

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

		this.opsCheck = {};
		this.frames = {};
		this.tableSwitchTargets = [];
		this.lookupSwitchTargets = [];

		// this.clinited = false;

		this.invoke = undefined;

		Object.preventExtensions(this);
	};

	FyMethod.prototype.toString = function() {
		return "{Method}" + this.uniqueName;
	};

})();