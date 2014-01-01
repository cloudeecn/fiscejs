(function() {
	/**
	 * I hate warnings...
	 */
	function drop(obj) {
	}
	function sizeOf(obj) {
		var i = 0;
		for ( var key in obj) {
			drop(key);
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
				"    Hierarchy.methods" : function() {
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
					equal(1, classHashMap.virtualTable.size);
					equal(methodHashMapGet, context
							.lookupMethodVirtualByMethod(classHashMap,
									methodMapGet));

					equal(methodHashMapGet, context
							.lookupMethodVirtualByMethod(classHashMap,
									methodAbstractMapGet));
					equal(2, classHashMap.virtualTable.size);
					equal(methodHashMapGet, context
							.lookupMethodVirtualByMethod(classHashMap,
									methodAbstractMapGet));

					equal(methodIdentityHashMapGet, context
							.lookupMethodVirtualByMethod(classIdentityHashMap,
									methodMapGet));
					equal(1, classIdentityHashMap.virtualTable.size);
					equal(methodIdentityHashMapGet, context
							.lookupMethodVirtualByMethod(classIdentityHashMap,
									methodMapGet));

					equal(methodIdentityHashMapGet, context
							.lookupMethodVirtualByMethod(classIdentityHashMap,
									methodAbstractMapGet));
					equal(2, classIdentityHashMap.virtualTable.size);
					equal(methodIdentityHashMapGet, context
							.lookupMethodVirtualByMethod(classIdentityHashMap,
									methodAbstractMapGet));

				},
				"    Hierarchy.fields" : function() {
					/**
					 * @returns {FyContext}
					 */
					var context = fisceTests.context();
					
				}
			});
})();