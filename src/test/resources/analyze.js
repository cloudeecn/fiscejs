(function() {
	var classes = [ "EXCLUDE.fisce.test.SwitchTest",
			"EXCLUDE.fisce.test.SwitchTest2" ];
	fisceTests
			.extend({
				"$analyze" : function() {
					var context = fisceTests.context();
					for ( var i = 0, max = classes.length; i < max; i++) {
						/**
						 * @returns {FyClass}
						 */
						var clazz = context.lookupClass(classes[i].replace(
								/\./g, "/"));
						for ( var mid = 0; mid < clazz.methods.length; mid++) {
							FyAOTUtil.aot(clazz.methods[mid]);
						}
						console.log(clazz);
					}
					ok(true, "Please check console for classes");
				}
			});
})();