(function() {

	fisceTests
			.extend({
				"HelloWorld" : function() {
					var context = fisceTests.context();
					var clazz = context
							.lookupClass("EXCLUDE/fisce/test/HelloWorld");
					var thread = new FyThread(context, 4096);
					thread.threadId = 1;
					var threadHandle = context.heap.allocate(context
							.lookupClass("java/lang/Thread"));
					thread
							.initWithMethod(
									threadHandle,
									context
											.getMethod("EXCLUDE/fisce/test/HelloWorld.main.([Ljava/lang/String;)V"));
					thread.run(new FyMessage(), 99999999);
				}
			});
})();