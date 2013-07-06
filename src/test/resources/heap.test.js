(function() {
	fisceTests
			.extend({
				"   Heap" : function() {
					var length = 256;
					var context = fisceTests.context();
					var heap = context.heap;
					var handle;
					var i;

					handle = heap.allocateArray(context.lookupClass("[Z"),
							length);
					equal(length, heap.arrayLength(handle), "boolean[] length");
					for (i = 0; i < length; i++) {
						heap.putArrayBoolean(handle, i, i & 1);
					}
					for (i = 0; i < length; i++) {
						heap.putArrayBoolean(handle, i, i & 1);
						if (heap.getArrayBoolean(handle, i) !== ((i & 1) ? true
								: false)) {
							break;
						}
					}
					if (i === length) {
						ok(true, "boolean[] values");
					} else {
						ok(false, "boolean[" + i + "]="
								+ heap.getArrayBoolean(handle, i) + " expects "
								+ ((i & 1) ? true : false));
					}
				}
			});
})();
