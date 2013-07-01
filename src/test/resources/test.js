var FiScETests;
(function() {
	FiScETests = function() {
		this.tests = {};
		this.classDefData = undefined;
	};

	FiScETests.prototype.extend = function(obj) {
		for ( var key in obj) {
			var value = obj[key];
			if (typeof value === "function") {
				if (this.tests[key]) {
					var num = 0;
					var fixedKey;
					do {
						num++;
						fixedKey = key + "_" + num;
					} while (this[fixedKey]);
					this.tests[fixedKey] = value;
				} else {
					this.tests[key] = value;
				}
			}
		}
	};

	FiScETests.prototype.iterate = function(fun) {
		var keys = [];
		for ( var key in this.tests) {
			keys.push(key);
		}
		keys.sort();
		for ( var i = 0; i < keys.length; i++) {
			var value = this.tests[keys[i]];
			if (typeof value === "function") {
				fun(keys[i], value);
			}
		}
	};

	/**
	 * initialize a context from classDefData
	 * 
	 * @returns {FiScEContext} context
	 */
	FiScETests.prototype.context = function() {
		var context = new FiScEContext();
		context.addClassDef(JSON.parse(this.classDefData));
		return context;
	};
})();

var fisceTests = new FiScETests();
