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
				},
				"   Heap.field" : function() {
					var context = fisceTests.context();
					var heap = context.heap;
					var clazz = context
							.lookupClass("EXCLUDE/fisce/test/FieldHolder3");
					var booleanField = context.lookupFieldVirtual(clazz,
							".booleanField.Z");
					var byteField = context.lookupFieldVirtual(clazz,
							".byteField.B");

					var charField = context.lookupFieldVirtual(clazz,
							".charField.C");
					var shortField = context.lookupFieldVirtual(clazz,
							".shortField.S");

					var intField = context.lookupFieldVirtual(clazz,
							".intField.I");
					var floatField = context.lookupFieldVirtual(clazz,
							".floatField.F");

					var longField = context.lookupFieldVirtual(clazz,
							".longField.J");
					var doubleField = context.lookupFieldVirtual(clazz,
							".doubleField.D");

					ok(booleanField, "boolean field loaded");
					ok(byteField, "byte field loaded");

					ok(charField, "char field loaded");
					ok(shortField, "short field loaded");

					ok(intField, "int field loaded");
					ok(floatField, "float field loaded");

					ok(longField, "long field loaded");
					ok(doubleField, "double field loaded");

					var handle = heap.allocate(clazz);
					ok(handle > 0, "Test object got " + handle);

					heap.putFieldBoolean(handle, booleanField.posAbs, true);
					heap.putFieldByte(handle, byteField.posAbs, -3);

					heap.putFieldChar(handle, charField.posAbs, 0x5678);
					heap.putFieldShort(handle, shortField.posAbs, -5566);

					heap.putFieldInt(handle, intField.posAbs, 0x12345678);
					heap.putFieldFloat(handle, floatField, 8.75766E10);

					heap.putFieldLongFrom(handle, longField, [ 0x12345678,
							0x90abcdef ], 1);
					heap.putFieldDouble(handle, doubleField.posAbs,
							1.2345678901E98);

					equal(true, heap.getFieldBoolean(handle,
							booleanField.posAbs), "boolean field operation");
					equal(1, heap.getFieldRaw(handle, booleanField.posAbs),
							"boolean field raw operation");
					
					
					// heap.putFieldBoolean(handle, , value)

				}
			});
})();
