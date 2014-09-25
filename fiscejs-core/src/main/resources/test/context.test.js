(function() {
	function sizeOf(obj) {
		return Object.keys(obj).length;
	}

	fisceTests
			.extend({
				"    ClassDef" : function(assert, context) {
					assert.ok(context);
				},
				"    Hierarchy.methods" : function(assert, context) {
					var classAbstractMap = context
							.lookupClass("java/util/AbstractMap");
					var classMap = context.lookupClass("java/util/Map");
					var classHashMap = context.lookupClass("java/util/HashMap");
					var classIdentityHashMap = context
							.lookupClass("java/util/IdentityHashMap");

					var methodMapGet = context.lookupMethodVirtual(classMap,
							".get.(Ljava/lang/Object;)Ljava/lang/Object;");
					assert.ok(methodMapGet);

					var methodAbstractMapGet = context.lookupMethodVirtual(
							classAbstractMap,
							".get.(Ljava/lang/Object;)Ljava/lang/Object;");
					assert.ok(methodAbstractMapGet);

					var methodHashMapGet = context.lookupMethodVirtual(
							classHashMap,
							".get.(Ljava/lang/Object;)Ljava/lang/Object;");
					assert.ok(methodHashMapGet);

					var methodIdentityHashMapGet = context.lookupMethodVirtual(
							classIdentityHashMap,
							".get.(Ljava/lang/Object;)Ljava/lang/Object;");
					assert.ok(methodIdentityHashMapGet);

					assert.notEqual(methodMapGet, methodHashMapGet);
					assert.notEqual(methodMapGet, methodAbstractMapGet);
					assert.notEqual(methodMapGet, methodIdentityHashMapGet);
					assert.notEqual(methodHashMapGet, methodAbstractMapGet);
					assert.notEqual(methodHashMapGet, methodIdentityHashMapGet);
					assert.notEqual(methodAbstractMapGet, methodIdentityHashMapGet);

					assert.equal(methodHashMapGet, context
							.lookupMethodVirtualByMethod(classHashMap,
									methodMapGet));
					assert.equal(1, classHashMap.virtualTable.size());
					assert.equal(methodHashMapGet, context
							.lookupMethodVirtualByMethod(classHashMap,
									methodMapGet));

					assert.equal(methodHashMapGet, context
							.lookupMethodVirtualByMethod(classHashMap,
									methodAbstractMapGet));
					assert.equal(2, classHashMap.virtualTable.size());
					assert.equal(methodHashMapGet, context
							.lookupMethodVirtualByMethod(classHashMap,
									methodAbstractMapGet));

					assert.equal(methodIdentityHashMapGet, context
							.lookupMethodVirtualByMethod(classIdentityHashMap,
									methodMapGet));
					assert.equal(1, classIdentityHashMap.virtualTable.size());
					assert.equal(methodIdentityHashMapGet, context
							.lookupMethodVirtualByMethod(classIdentityHashMap,
									methodMapGet));

					assert.equal(methodIdentityHashMapGet, context
							.lookupMethodVirtualByMethod(classIdentityHashMap,
									methodAbstractMapGet));
					assert.equal(2, classIdentityHashMap.virtualTable.size());
					assert.equal(methodIdentityHashMapGet, context
							.lookupMethodVirtualByMethod(classIdentityHashMap,
									methodAbstractMapGet));

				},
				"    Hierarchy.fields" : function(context) {
					//TODO
				}
			});
})();