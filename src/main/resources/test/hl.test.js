(function() {
	var id = 1000;
	function hltest(clazz) {
		var obj = {};
		obj["HL." + id + "." + clazz] = function() {
			var context = fisceTests.context();
			context.bootup(clazz);
			var message = new FyMessage();
			while (true) {
				context.threadManager.run(message);
				switch (message.type) {
				case FyMessage.message_vm_dead:
					ok("vm dead");
					return;
				case FyMessage.message_sleep:
					console.log("sleep " + message.sleepTime + "ms");
					var target = Date.now() + Number(message.sleepTime);
					if (target !== target) {
						// Nan
						throw new FyException(undefined, "Illegal sleep time: "
								+ sleepTime);
					}
					while (Date.now() <= target) {
						;
					}
					break;
				default:
					throw new FyException(undefined, "Unknown message type: "
							+ message.type);
				}
			}
		};
		fisceTests.extend(obj);
		id++;
	}

	hltest("EXCLUDE/fisce/test/ArchitectureTest");
	hltest("EXCLUDE/fisce/test/HierarchyTest");
	hltest("EXCLUDE/fisce/test/UnicodeTest");
	hltest("EXCLUDE/fisce/test/HelloWorld");
	hltest("EXCLUDE/fisce/test/Tester");
	hltest("EXCLUDE/fisce/test/ArrayTest");
	hltest("EXCLUDE/fisce/test/DebugPrintStreamTest");
	hltest("EXCLUDE/fisce/test/AutoBoxingTest");
	hltest("EXCLUDE/fisce/test/RunnerTester");
	hltest("EXCLUDE/fisce/test/EnumTester");
	hltest("EXCLUDE/fisce/test/ExceptionTester");
	hltest("EXCLUDE/fisce/test/ForEachTest");
	hltest("EXCLUDE/fisce/test/HashMapTest");
	hltest("EXCLUDE/fisce/test/StaticTest");
	hltest("EXCLUDE/fisce/test/ComplexClassLayout");
	hltest("EXCLUDE/fisce/test/SwitchTest");
	hltest("EXCLUDE/fisce/test/SwitchTest2");
	hltest("EXCLUDE/fisce/test/BasicRegexTest");
	hltest("com/cirnoworks/fisce/privat/Profile");
})();