var FyTests;
(function() {
	FyTests = function() {
		this.prerequisiteTests = {};
		this.tests = {};
		this.classDefData = {};
		this.vfsData = {};
	};

	FyTests.prototype.extendPrerequisite = function(obj) {
		for ( var key in obj) {
			var value = obj[key];
			if (typeof value === "function") {
				if (this.prerequisiteTests[key]) {
					var num = 0;
					var fixedKey;
					do {
						num++;
						fixedKey = key + "_" + num;
					} while (this[fixedKey]);
					this.prerequisiteTests[fixedKey] = value;
				} else {
					this.prerequisiteTests[key] = value;
				}
			}
		}
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

	FyTests.prototype.iterate = function(obj, fun) {
		var keys = Object.keys(obj);
		keys.sort();
		for (var i = 0; i < keys.length; i++) {
			var value = obj[keys[i]];
			if (typeof value === "function") {
				fun.call(this, keys[i], value);
			}
		}
	};
	FyTests.prototype.start = function() {
		this.iterate(this.prerequisiteTests, function(name, fun) {
			QUnit.asyncTest(name, function(assert) {
				fun(assert);
				QUnit.start();
			});
		});

		this.iterate(this.tests, function(name, fun) {
			QUnit.asyncTest(name, function(assert) {
				FyContext
				context = new FyContext();

				context.loadClassDefines(
						[ "http://2.0.0.fisce.cirnoworks.com" ], {
							success : function() {
								fun(assert, context);
								QUnit.start();
							},
							error : function(message) {
								assert.ok(false, message);
								QUnit.start();
							}
						})
			});
		});
	}
})();

var fisceTests = new FyTests();
