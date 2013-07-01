(function() {
	function sizeOf(obj) {
		var i = 0;
		for ( var key in obj) {
			i++;
		}
		return i;
	}

	fisceTests
			.extend({
				"    ClassDef" : function() {
					var context = fisceTests.context();

					ok(context);
				},
				"    Hierarchy" : function() {
					var context = fisceTests.context();
					var classAbstractMap = context
							.lookupClass("java/util/AbstractMap");
					var classMap = context.lookupClass("java/util/Map");
					var classHashMap = context.lookupClass("java/util/HashMap");
					var classIdentityHashMap = context
							.lookupClass("java/util/IdentityHashMap");

					var methodMapGet = context.lookupMethodVirtual(classMap,
							".get.(Ljava/lang/Object;)Ljava/lang/Object;");
					ok(methodMapGet);

					var methodAbstractMapGet = context.lookupMethodVirtual(
							classAbstractMap,
							".get.(Ljava/lang/Object;)Ljava/lang/Object;");
					ok(methodAbstractMapGet);

					var methodHashMapGet = context.lookupMethodVirtual(
							classHashMap,
							".get.(Ljava/lang/Object;)Ljava/lang/Object;");
					ok(methodHashMapGet);

					var methodIdentityHashMapGet = context.lookupMethodVirtual(
							classIdentityHashMap,
							".get.(Ljava/lang/Object;)Ljava/lang/Object;");
					ok(methodIdentityHashMapGet);

					notEqual(methodMapGet, methodHashMapGet);
					notEqual(methodMapGet, methodAbstractMapGet);
					notEqual(methodMapGet, methodIdentityHashMapGet);
					notEqual(methodHashMapGet, methodAbstractMapGet);
					notEqual(methodHashMapGet, methodIdentityHashMapGet);
					notEqual(methodAbstractMapGet, methodIdentityHashMapGet);

					equal(methodHashMapGet, context
							.lookupMethodVirtualByMethod(classHashMap,
									methodMapGet));
					equal(1, sizeOf(classHashMap.virtualTable));
					equal(methodHashMapGet, context
							.lookupMethodVirtualByMethod(classHashMap,
									methodMapGet));

					equal(methodHashMapGet, context
							.lookupMethodVirtualByMethod(classHashMap,
									methodAbstractMapGet));
					equal(2, sizeOf(classHashMap.virtualTable));
					equal(methodHashMapGet, context
							.lookupMethodVirtualByMethod(classHashMap,
									methodAbstractMapGet));

					equal(methodIdentityHashMapGet, context
							.lookupMethodVirtualByMethod(classIdentityHashMap,
									methodMapGet));
					equal(1, sizeOf(classIdentityHashMap.virtualTable));
					equal(methodIdentityHashMapGet, context
							.lookupMethodVirtualByMethod(classIdentityHashMap,
									methodMapGet));

					equal(methodIdentityHashMapGet, context
							.lookupMethodVirtualByMethod(classIdentityHashMap,
									methodAbstractMapGet));
					equal(2, sizeOf(classIdentityHashMap.virtualTable));
					equal(methodIdentityHashMapGet, context
							.lookupMethodVirtualByMethod(classIdentityHashMap,
									methodAbstractMapGet));

					var constant;

					constant = {
						className : "EXCLUDE/fisce/test/JspTag",
						nameAndType : ".method1.()I"
					};
					var methodJspTagMethod1 = context
							.lookupMethodVirtualFromConstant(constant);

					ok(constant.resolvedMethod);
					ok(!constant.className);
					ok(!constant.nameAndType);

					ok(methodJspTagMethod1);

					constant = {
						className : "EXCLUDE/fisce/test/IterationTag",
						nameAndType : ".method1.()I"
					};
					var methodIterationTagMethod1 = context
							.lookupMethodVirtualFromConstant(constant);
					ok(constant.resolvedMethod);
					ok(!constant.className);
					ok(!constant.nameAndType);
					ok(methodIterationTagMethod1);

					equal(methodJspTagMethod1, methodIterationTagMethod1);

					constant = {
						className : "EXCLUDE/fisce/test/AbstractTestTag",
						nameAndType : ".method1.()I"
					};
					var methodAbstractTestTagMethod1 = context
							.lookupMethodVirtualFromConstant(constant);
					ok(constant.resolvedMethod);
					ok(!constant.className);
					ok(!constant.nameAndType);
					ok(methodAbstractTestTagMethod1);

					equal(methodJspTagMethod1, methodAbstractTestTagMethod1);
				}
			});
})();