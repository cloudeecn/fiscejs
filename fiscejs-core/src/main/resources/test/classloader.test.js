(function() {
	function assertCanCast(assert, context, from, to, expected) {
		var result = context.classLoader.canCast(context.lookupClass(from),
				context.lookupClass(to));
		assert.strictEqual(result, expected, from
				+ (expected ? " can cast to " : " can't cast to ") + to);
	}
	fisceTests.extend({
		"    ClassLoader" : function(assert, context) {

			var names = [ FyConst.FY_BASE_STRING,
					"[[[L" + FyConst.FY_BASE_STRING + ";", "[[[I", "<int",
					"<double", FyConst.FY_BASE_DOUBLE, FyConst.FY_BASE_MATH ];

			var classes = [];

			for (var i = 0, max = names.length; i < max; i++) {
				classes[i] = context.lookupClass(names[i]);
			}
			var clStr = context.lookupClass(FyConst.FY_BASE_STRING);
			var clObj = context.lookupClass(FyConst.FY_BASE_OBJECT);
			var clazz = context.lookupClass(FyConst.FY_BASE_INT);

			assert.strictEqual(context.classLoader.canCast(clStr, clObj), true,
					"String can cast to Object");
			assert.strictEqual(context.classLoader.canCast(clStr, clazz),
					false, "String can't cast to Integer");

			assertCanCast(assert, context, "[[[Ljava/lang/Integer;",
					"[[[Ljava/lang/Object;", true);
			assertCanCast(assert, context, "[[[Ljava/lang/Integer;",
					"[[Ljava/lang/Object;", true);
			assertCanCast(assert, context, "[[[Ljava/lang/Integer;",
					"[[[[Ljava/lang/Object;", false);

			assertCanCast(assert, context, "[[[Ljava/lang/Integer;",
					"[[[Ljava/lang/Number;", true);
			assertCanCast(assert, context, "[[[Ljava/lang/Integer;",
					"[[Ljava/lang/Number;", false);
			assertCanCast(assert, context, "[[[Ljava/lang/Integer;",
					"[[[[Ljava/lang/Number;", false);

			assertCanCast(assert, context, "<int", "java/lang/Object", true);
			assertCanCast(assert, context, "<int", "java/lang/Integer", false);

			assertCanCast(assert, context, "java/util/LinkedHashMap",
					"java/util/Map", true);
			assertCanCast(assert, context, "java/util/LinkedHashMap",
					"java/util/HashMap", true);
			assertCanCast(assert, context, "java/util/LinkedHashMap",
					"java/lang/Cloneable", true);
		}
	});
})();
