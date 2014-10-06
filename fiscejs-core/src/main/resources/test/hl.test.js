(function() {
	var id = 1000;
	function hltest(clazz) {
		var obj = {};
		obj["HL." + id + "." + clazz] = function(assert, context) {
			console.log("##HL " + clazz + " begin");
			context.bootup(clazz);
			context.run({
						panic : function(e) {
							assert.ok(false, "Panic!: \n" + e.message);
							QUnit.start();
						},
						handle : function(name, thread, sp) {
							if (name == "EXCLUDE/fisce/test/TestService.fail0.(Ljava/lang/String;)V") {
								assert.ok(false, context.heap
										.getString(thread.stack[sp]));
								return true;
							}
							return false;
						},
						end : function() {
							assert.ok(true, "VM ended successfully");
							QUnit.start();
						}
					});
			QUnit.stop();
		}
		fisceTests.extend(obj);
		id++;
	}

	if (window.hlName) {
		hltest(hlName);
	} else {
		hltest("EXCLUDE/fisce/test/ArchitectureTest");
		hltest("EXCLUDE/fisce/test/HierarchyTest");
		hltest("EXCLUDE/fisce/test/UnicodeTest");
		hltest("EXCLUDE/fisce/test/HelloWorld");
		hltest("EXCLUDE/fisce/test/RandomBoundTest");
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
		// hltest("EXCLUDE/fisce/test/BasicRegexTest");
		hltest("com/cirnoworks/fisce/privat/Profile");
		hltest("EXCLUDE/fisce/test/GCTest");
		hltest("EXCLUDE/fisce/test/RISTest");
		hltest("EXCLUDE/fisce/test/ParamStoreTest");
		hltest("EXCLUDE/fisce/test/ReflectionTest");
		hltest("EXCLUDE/fisce/test/ProxyTest");
		hltest("EXCLUDE/fisce/test/GZIPTest");
	}
})();
