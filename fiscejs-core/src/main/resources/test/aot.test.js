(function() {

	fisceTests
			.extend({
				"HelloWorld" : function(assert, context) {
					assert.ok(true);
					return;
					var context = fisceTests.context();
					var clazz = context
							.lookupClass("EXCLUDE/fisce/test/HelloWorld");
					console.log(context);
					console.log(clazz);
					var thread = new FyThread(context, 1);
					thread.threadId = 1;
					thread.priority = 1;
					var threadHandle = context.heap.allocate(context
							.lookupClass("java/lang/Thread"));
					thread
							.initWithMethod(
									threadHandle,
									context
											.getMethod("EXCLUDE/fisce/test/HelloWorld.main.([Ljava/lang/String;)V"));
					thread.run(new FyMessage(), 99999999);
					ok(true);
				}
			});
})();