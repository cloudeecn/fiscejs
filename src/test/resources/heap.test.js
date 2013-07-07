(function() {
	fisceTests
			.extend({
				"   Heap.array" : function() {
					var length = 256;
					var context = fisceTests.context();
					var heap = context.heap;
					var i;

					/**
					 * 
					 * @param {String}type
					 * @param {String}func
					 */
					function test(type, func) {
						var handle;
						var arrayName = "[" + FyContext.mapPrimitivesRev[type];
						var typeName = type.charAt(0).toUpperCase()
								+ type.substring(1);
						var setter = heap["putArray" + typeName];
						var getter = heap["getArray" + typeName];

						handle = heap.allocateArray(context
								.lookupClass(arrayName), length);
						equal(length, heap.arrayLength(handle), type
								+ "[] length");
						for (i = 0; i < length; i++) {
							setter.call(heap, handle, i, eval(func));
						}
						for (i = 0; i < length; i++) {
							if (getter.call(heap, handle, i) !== eval(func)) {
								break;
							}
						}
						if (i === length) {
							ok(true, type + "[] values");
						} else {
							ok(false, type + "[" + i + "]="
									+ getter.call(heap, handle, i)
									+ " expects " + eval(func));
						}
					}

					test("boolean", "(i&1)?true:false");
					test("byte", "((i&1)?1:-1)*(i&0x7f)");

					test("short", "((i&1)?1:-1)*((i*0x101)&0x7fff)");
					test("char", "((i*0x101)&0xffff)");

					test("int", "((i&1)?1:-1)*((i*0x1010101)&0x7fffffff)");
					test("float",
							"FyPortable.intToFloat(FyPortable.floatToInt(((i&1)?1:-1)*i*1.234*1000000))");

					test("double", "((i&1)?1:-1)*i*1.234*1000000");

					{// long
						var handle;
						var data = new Array(512);
						var data1 = new Array(512);

						for (i = 0; i < length; i++) {
							data[i * 2] = i * 2;
							data[i * 2 + 1] = i * 2 + 100;
						}

						handle = heap.allocateArray(context.lookupClass("[J"),
								length);
						equal(length, heap.arrayLength(handle), "long[] length");
						for (i = 0; i < length; i++) {
							heap.putArrayLongFrom(handle, i, data, i * 2);
						}
						for (i = 0; i < length; i++) {
							heap.getArrayLongTo(handle, i, data1, i * 2);
						}
						for (i = 0; i < length; i++) {
							if (data1[i * 2] !== data[i * 2]
									|| data1[i * 2 + 1] !== data[i * 2 + 1]) {
								break;
							}
						}
						if (i === length) {
							ok(true, "long[] values");
						} else {
							ok(false, "long[" + i + "]=[" + data1[i * 2] + ","
									+ data1[i * 2 + 1] + "] expects ["
									+ data[i * 2] + "," + data[i * 2 + 1] + "]");
						}
					}
				}
			});
})();
