var FyTests;
(function() {
	FyTests = function() {
		this.tests = {};
		this.classDefData = undefined;
	};

	FyTests.prototype.extend = function(obj) {
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

	FyTests.prototype.iterate = function(fun) {
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
	 * @returns {FyContext} context
	 */
	FyTests.prototype.context = function() {
		var context = new FyContext();
		context.addClassDef(JSON.parse(this.classDefData));
		return context;
	};
})();

var fisceTests = new FyTests();
