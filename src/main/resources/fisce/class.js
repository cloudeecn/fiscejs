var FyClass;
(function() {
	/**
	 * @returns {FyClass}
	 */
	var dummyClass = undefined;
	
	/**
	 * @returns {FyMethod}
	 */
	var dummyMethod = undefined;

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

		this.phase = 0;

		/* Filled by class loader */
		this.needFinalize = false;
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

		this.clinitThreadId = -1;
		/**
		 * @return FyMethod
		 */
		this.clinit = dummyMethod;

		/* BEGIN GC Only */
		this.fieldStatic = [];
		this.fieldAbs = [];
		/* END GC Only */

		this.virtualTable = {};

		/** Array only* */
		this.contentClass = dummyClass;
		this.arrayType = 0;

		/** primitive only */
		this.pType = undefined;
		Object.preventExtensions(this);
	};

	FyClass.prototype.toString = function() {
		return this.name;
	};

})();