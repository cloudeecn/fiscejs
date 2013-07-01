(function() {
	function assertCanCast(context, from, to, expected) {
		console.log("cast test " + from + " -> " + to);
		var result = context.classLoader.canCast(context.lookupClass(from),
				context.lookupClass(to));
		console.log("=cast test " + from + " -> " + to + " = " + result);
		strictEqual(result, expected, from
				+ (expected ? " can cast to " : " can't cast to ") + to);
	}
	fisceTests.extend({
		"    ClassLoader" : function() {
			var context = fisceTests.context();

			var names = [ FiScEConst.FY_BASE_STRING,
					"[[[L" + FiScEConst.FY_BASE_STRING + ";", "[[[I", "int",
					"double", FiScEConst.FY_BASE_DOUBLE,
					FiScEConst.FY_BASE_MATH ];

			var classes = [];

			for ( var i = 0, max = names.length; i < max; i++) {
				classes[i] = context.lookupClass(names[i]);
			}
			var clStr = context.lookupClass(FiScEConst.FY_BASE_STRING);
			var clObj = context.lookupClass(FiScEConst.FY_BASE_OBJECT);
			var clazz = context.lookupClass(FiScEConst.FY_BASE_INT);

			strictEqual(context.classLoader.canCast(clStr, clObj), true,
					"String can cast to Object");
			strictEqual(context.classLoader.canCast(clStr, clazz), false,
					"String can't cast to Integer");

			assertCanCast(context, "[[[Ljava/lang/Integer;",
					"[[[Ljava/lang/Object;", true);
			assertCanCast(context, "[[[Ljava/lang/Integer;",
					"[[Ljava/lang/Object;", true);
			assertCanCast(context, "[[[Ljava/lang/Integer;",
					"[[[[Ljava/lang/Object;", false);

			assertCanCast(context, "[[[Ljava/lang/Integer;",
					"[[[Ljava/lang/Number;", true);
			assertCanCast(context, "[[[Ljava/lang/Integer;",
					"[[Ljava/lang/Number;", false);
			assertCanCast(context, "[[[Ljava/lang/Integer;",
					"[[[[Ljava/lang/Number;", false);

			assertCanCast(context, "int", "java/lang/Object", true);
			assertCanCast(context, "int", "java/lang/Integer", false);

			assertCanCast(context, "java/util/LinkedHashMap", "java/util/Map",
					true);
			assertCanCast(context, "java/util/LinkedHashMap",
					"java/util/HashMap", true);
			assertCanCast(context, "java/util/LinkedHashMap",
					"java/lang/Cloneable", true);

			console.log(context);
		}
	});
})();
