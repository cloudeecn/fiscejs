(function() {
	var classes = [ "EXCLUDE.fisce.test.SwitchTest",
			"EXCLUDE.fisce.test.SwitchTest2" ];
	fisceTests
			.extend({
				"$analyze" : function() {
					var context = fisceTests.context();
					context.lookupClass(FyConst.FY_BASE_OBJECT);
					context.lookupClass(FyConst.FY_BASE_THROWABLE);
					context.lookupClass("[Z");
					context.lookupClass("[B");
					context.lookupClass("[S");
					context.lookupClass("[C");
					context.lookupClass("[F");
					context.lookupClass("[I");
					context.lookupClass("[J");
					context.lookupClass("[D");
					var thread = new FyThread(context, 1);
					for (var i = 0, max = classes.length; i < max; i++) {
						/**
						 * @returns {FyClass}
						 */
						var clazz = context.lookupClass(classes[i].replace(
								/\./g, "/"));
						for (var mid = 0; mid < clazz.methods.length; mid++) {
							FyAOTUtil.aot(thread, clazz.methods[mid]);
						}
						console.log(clazz);
					}
					ok(true, "Please check console for classes");
				}
			});
})();