(function() {
	var id = 1000;
	function hltest(clazz) {
		var obj = {};
		obj["HL." + id + "." + clazz] = function() {
			console.log("##HL "+clazz+" begin");
			var context = fisceTests.context();
			context
					.registerNativeHandler(
							"EXCLUDE/fisce/test/TestService.fail0.(Ljava/lang/String;)V",
							function(context, thread, ops) {
								ok(false,context.heap
														.getString(thread.stack[thread.sp]));
//								throw new FyException(
//										"java/lang/Error",
//										"Test failed: "
//												+ context.heap
//														.getString(thread.stack[thread.sp]));
								return 0;
							});
			context.bootup(clazz);
			var message = new FyMessage();
			function fun() {
				try {
					context.threadManager.run(message);
				} catch (e) {
					console.log("##HL "+clazz+" end with exception");
					start();
					throw e;
				}
				switch (message.type) {
				case FyMessage.message_vm_dead:
					ok("vm dead");
					console.log("##HL "+clazz+" end");
					start();
					return;
				case FyMessage.message_sleep:
					var target = performance.now() + Number(message.sleepTime);
					if (target !== target) {
						// Nan
						throw new FyException(undefined, "Illegal sleep time: "
								+ sleepTime);
					}
					var delay = target - performance.now();
					if (delay < 0) {
						delay = 0;
					}
					if (delay > 0) {
						setTimeout(fun, delay);
					} else {
						fun();
					}
					break;
				default:
					console.log("##HL "+clazz+" end with exception");
					start();
					throw new FyException(undefined, "Unknown message type: "
							+ message.type);
				}
			}
			stop();
			setTimeout(fun, 1);

		};
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
//		hltest("EXCLUDE/fisce/test/BasicRegexTest");
		hltest("com/cirnoworks/fisce/privat/Profile");
		hltest("EXCLUDE/fisce/test/GCTest");
		hltest("EXCLUDE/fisce/test/RISTest");
		hltest("EXCLUDE/fisce/test/ParamStoreTest");
		hltest("EXCLUDE/fisce/test/ReflectionTest");
		hltest("EXCLUDE/fisce/test/ProxyTest");
		hltest("EXCLUDE/fisce/test/GZIPTest");
	}
})();
