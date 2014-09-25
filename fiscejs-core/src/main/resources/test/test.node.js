(function(global) {
	var begin = process.argv[2];
	var end = process.argv[3];
	var fails = 0;
	var log = console.log.bind(console);
	// console.log = function() {
	//
	// };
	/**
	 * @param {string}
	 *            message
	 */
	function format(message) {
		// return message;
		/**
		 * @returns {string}
		 */
		var msg = message.replace(/^(.*)$/g, "\t$1\n");
		return msg.substring(0, msg.length - 1);
	}
	var fs = require('fs');
	var vm = require('vm');
	var data = fs.readFileSync("rt.json");

	var include = function(path) {
		var code = fs.readFileSync(path);
		vm.runInThisContext(code, path);
	}.bind(global);

	/**
	 * 
	 * @param {Boolean}
	 *            status
	 * @param {string}
	 *            message
	 */
	global.ok = function(status, message) {
		if (status) {
			log(message ? ("OK: " + format(message)) : "OK");
		} else {
			fails++;
			log(message ? ("FAILED: " + format(message)) : "FAILED");
		}
	};

	global.equal = function(actual, expected, message) {
		if (actual == expected) {
			ok(true, message);
		} else {
			fails++;
			ok(false, "Expected: " + expected + " Actual: " + actual + " "
					+ message);
		}
	};

	global.notEqual = function(actual, expected, message) {
		if (actual != expected) {
			ok(true, message);
		} else {
			fails++;
			ok(false, "Expected not: " + expected + " Actual: " + actual + " "
					+ message);
		}
	};

	global.strictEqual = function(actual, expected, message) {
		if (actual === expected) {
			ok(true, message);
		} else {
			fails++;
			ok(false, "Expected strict: " + expected + " Actual: " + actual
					+ " " + message);
		}
	};

	global.strictNotEqual = function(actual, expected, message) {
		if (actual !== expected) {
			ok(true, message);
		} else {
			fails++;
			ok(false, "Expected strict not: " + expected + " Actual: " + actual
					+ " " + message);
		}
	};

	function test(message, fun) {
		log("\n\nTesting " + message);
		try {
			fun();
		} catch (e) {
			ok(false, "Exception occored: " + e.toString()
					+ (e.stack ? ("\n" + e.stack) : ""));
		}
	}

	include("test.js");

	include("../fisce/portable.js");
	include("portable.test.js");

	include("../fisce/long.asm.js");
	include("long.test.add.js");
	include("long.test.cmp.js");
	include("long.test.sub.js");
	include("long.test.mul.js");
	include("long.test.div.js");
	include("long.test.rem.js");
	include("long.test.js");

	include("../fisce/structs.js");

	include("../fisce/method.js");
	include("../fisce/field.js");
	include("../fisce/class.js");

	include("../fisce/context.js");
	include("context.test.js");

	include("../fisce/heap.js");
	include("../fisce/heap.default.js");
	include("heap.test.js");

	include("../fisce/classloader.js");
	include("classloader.test.js");

	include("../fisce/aot.js");
	include("../fisce/aot.data.js");
	include("aot.test.js");
	include("../fisce/nh.core.js");
	include("../fisce/nh.math.js");
	include("../fisce/nh.reflect.js");
	include("../fisce/thread.js");
	include("../fisce/threadmanager.js");
	include("hl.test.js");
	fisceTests.classDefData = data;
	fisceTests.iterate(
	/**
	 * @param {string}
	 *            message
	 * @param {Function}
	 *            fun
	 */
	function(message, fun) {
		if (!!begin && !message.startsWith(begin)) {
			return;
		}
		if (!!end && !message.endsWith(end)) {
			return;
		}
		test(message, fun);
	});

	if (fails > 0) {
		log(fails + " tests failed");
		process.exit(1);
	} else {
		log("All tests succeed");
		process.exit(0);
	}
})((function() {
	return this;
}.call()));
