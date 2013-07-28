(function() {
	var classes = [ "EXCLUDE.fisce.test.SwitchTest",
			"EXCLUDE.fisce.test.SwitchTest2" ];
	fisceTests.extend({
		"$analyze" : function() {
			console.log(TypeError);
			var context = fisceTests.context();
			for ( var i = 0, max = classes.length; i < max; i++) {
				var clazz = context.lookupClass(classes[i].replace(/\./g, "/"));
				console.log(clazz);
			}
			ok(true, "Please check console for classes");
		}
	});
})();