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
						var handle2;
						var handle3;
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

						handle2 = heap.clone(handle);
						ok(handle2, type + " clone returns");
						notEqual(handle, handle2,
								"Cloned array has different handles");
						equal(heap.arrayLength(handle), heap
								.arrayLength(handle2),
								"cloned array has same length");
						for (i = 0; i < length; i++) {
							if (getter.call(heap, handle2, i) !== eval(func)) {
								break;
							}
						}
						if (i === length) {
							ok(true, "cloned " + type + "[] values");
						} else {
							ok(false, "cloned " + type + "[" + i + "]="
									+ getter.call(heap, handle2, i)
									+ " expects " + eval(func));
						}

						handle3 = heap.allocateArray(context
								.lookupClass(arrayName), heap
								.arrayLength(handle) + 10);
						heap.arrayCopy(handle, 1, handle3, 6, heap
								.arrayLength(handle) - 1);
						for (i = 1; i < length; i++) {
							if (getter.call(heap, handle3, i + 5) !== eval(func)) {
								break;
							}
						}
						if (i === length) {
							ok(true, "copied " + type + "[] values");
						} else {
							ok(false, "copyied " + type + "[" + (i + 5) + "]="
									+ getter.call(heap, handle3, i + 5)
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

						handle2 = heap.clone(handle);
						ok(handle2, "long clone returns");
						notEqual(handle, handle2,
								"Cloned array has different handles");
						equal(heap.arrayLength(handle), heap
								.arrayLength(handle2),
								"cloned array has same length");
						for (i = 0; i < length; i++) {
							heap.getArrayLongTo(handle2, i, data1, i * 2);
						}
						for (i = 0; i < length; i++) {
							if (data1[i * 2] !== data[i * 2]
									|| data1[i * 2 + 1] !== data[i * 2 + 1]) {
								break;
							}
						}
						if (i === length) {
							ok(true, "cloned long[] values");
						} else {
							ok(false, "cloned long[" + i + "]=[" + data1[i * 2]
									+ "," + data1[i * 2 + 1] + "] expects ["
									+ data[i * 2] + "," + data[i * 2 + 1] + "]");
						}

						handle3 = heap.allocateArray(context
								.lookupClass("[J"), heap
								.arrayLength(handle) + 10);
						heap.arrayCopy(handle, 1, handle3, 6, heap
								.arrayLength(handle) - 1);
						for (i = 1; i < length; i++) {
							heap.getArrayLongTo(handle3, i + 5, data1, i * 2);
						}
						for (i = 1; i < length; i++) {
							if (data1[i * 2] !== data[i * 2]
									|| data1[i * 2 + 1] !== data[i * 2 + 1]) {
								break;
							}
						}
						if (i === length) {
							ok(true, "copied long[] values");
						} else {
							ok(false, "copied long[" + (i + 5) + "]=["
									+ data1[i * 2] + "," + data1[i * 2 + 1]
									+ "] expects [" + data[i * 2] + ","
									+ data[i * 2 + 1] + "]");
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

					heap.putFieldLongFrom(handle, longField.posAbs, [ 0,
							0x12345678, 0x90abcdef ], 1);
					heap.putFieldDouble(handle, doubleField.posAbs,
							1.2345678901E98);

					equal(true, heap.getFieldBoolean(handle,
							booleanField.posAbs), "boolean field operation");
					equal(1, heap.getFieldRaw(handle, booleanField.posAbs),
							"boolean field raw operation");

					equal(-3, heap.getFieldByte(handle, byteField.posAbs),
							"byte field operation");
					equal(-3 & 0xff,
							heap.getFieldRaw(handle, byteField.posAbs),
							"byte field raw operation");

					equal(0x5678, heap.getFieldChar(handle, charField.posAbs),
							"char field operation");
					equal(0x5678, heap.getFieldRaw(handle, charField.posAbs),
							"char field raw operation");

					equal(-5566, heap.getFieldShort(handle, shortField.posAbs),
							"short field operation");
					equal(-5566 & 0xffff, heap.getFieldRaw(handle,
							shortField.posAbs), "short field raw operation");

					var longPair = [ 0, 0, 0 ];
					var longResult = heap.getFieldLongTo(handle,
							longField.posAbs, longPair, 1);
					ok(longResult, "long returns");
					equal(0x12345678 >> 0, longPair[1], "long high part");
					equal(0x90abcdef >> 0, longPair[2], "long low part");

					equal(1.2345678901E98, heap.getFieldDouble(handle,
							doubleField.posAbs), "double value");
					ok(
							heap.getFieldLongTo(handle, doubleField.posAbs, [],
									1)[1], "double raw value high");
					ok(
							heap.getFieldLongTo(handle, doubleField.posAbs, [],
									1)[2], "double raw value low");

					var handle2 = heap.clone(handle);
					ok(handle2, "object cloned");
					notEqual(handle, handle2,
							"Cloned object has different handles");
					equal(true, heap.getFieldBoolean(handle2,
							booleanField.posAbs), "boolean field operation");
					equal(1, heap.getFieldRaw(handle2, booleanField.posAbs),
							"boolean field raw operation");

					equal(-3, heap.getFieldByte(handle2, byteField.posAbs),
							"byte field operation");
					equal(-3 & 0xff,
							heap.getFieldRaw(handle2, byteField.posAbs),
							"byte field raw operation");

					equal(0x5678, heap.getFieldChar(handle2, charField.posAbs),
							"char field operation");
					equal(0x5678, heap.getFieldRaw(handle2, charField.posAbs),
							"char field raw operation");

					equal(-5566, heap.getFieldShort(handle2, shortField.posAbs),
							"short field operation");
					equal(-5566 & 0xffff, heap.getFieldRaw(handle2,
							shortField.posAbs), "short field raw operation");

					var longPair = [ 0, 0, 0 ];
					var longResult = heap.getFieldLongTo(handle2,
							longField.posAbs, longPair, 1);
					ok(longResult, "long returns");
					equal(0x12345678 >> 0, longPair[1], "long high part");
					equal(0x90abcdef >> 0, longPair[2], "long low part");

					equal(1.2345678901E98, heap.getFieldDouble(handle2,
							doubleField.posAbs), "double value");
					ok(
							heap.getFieldLongTo(handle2, doubleField.posAbs, [],
									1)[1], "double raw value high");
					ok(
							heap.getFieldLongTo(handle2, doubleField.posAbs, [],
									1)[2], "double raw value low");

				},
				"   Heap.static" : function() {
					var context = fisceTests.context();
					var heap = context.heap;
					var clazz = context
							.lookupClass("EXCLUDE/fisce/test/FieldHolder3");
					var booleanStatic = context.lookupFieldVirtual(clazz,
							".booleanStatic.Z");
					var byteStatic = context.lookupFieldVirtual(clazz,
							".byteStatic.B");

					var charStatic = context.lookupFieldVirtual(clazz,
							".charStatic.C");
					var shortStatic = context.lookupFieldVirtual(clazz,
							".shortStatic.S");

					var intStatic = context.lookupFieldVirtual(clazz,
							".intStatic.I");
					var floatStatic = context.lookupFieldVirtual(clazz,
							".floatStatic.F");

					var longStatic = context.lookupFieldVirtual(clazz,
							".longStatic.J");
					var doubleStatic = context.lookupFieldVirtual(clazz,
							".doubleStatic.D");

					ok(booleanStatic, "boolean static loaded");
					ok(byteStatic, "byte static loaded");

					ok(charStatic, "char static loaded");
					ok(shortStatic, "short static loaded");

					ok(intStatic, "int static loaded");
					ok(floatStatic, "float static loaded");

					ok(longStatic, "long static loaded");
					ok(doubleStatic, "double static loaded");

					heap.putStaticBoolean(booleanStatic.owner,
							booleanStatic.posAbs, true);
					heap.putStaticByte(byteStatic.owner, byteStatic.posAbs, -3);

					heap.putStaticChar(charStatic.owner, charStatic.posAbs,
							0x5678);
					heap.putStaticShort(shortStatic.owner, shortStatic.posAbs,
							-5566);

					heap.putStaticInt(intStatic.owner, intStatic.posAbs,
							0x12345678);
					heap.putStaticFloat(clazz, floatStatic, 8.75766E10);

					heap.putStaticLongFrom(longStatic.owner, longStatic.posAbs,
							[ 0, 0x12345678, 0x90abcdef ], 1);
					heap.putStaticDouble(doubleStatic.owner,
							doubleStatic.posAbs, 1.2345678901E98);

					equal(true, heap.getStaticBoolean(clazz,
							booleanStatic.posAbs), "boolean static operation");
					equal(1, heap.getStaticRaw(booleanStatic.owner,
							booleanStatic.posAbs),
							"boolean static raw operation");

					equal(-3, heap.getStaticByte(byteStatic.owner,
							byteStatic.posAbs), "byte static operation");
					equal(-3 & 0xff, heap.getStaticRaw(byteStatic.owner,
							byteStatic.posAbs), "byte static raw operation");

					equal(0x5678, heap.getStaticChar(charStatic.owner,
							charStatic.posAbs), "char static operation");
					equal(0x5678, heap.getStaticRaw(charStatic.owner,
							charStatic.posAbs), "char static raw operation");

					equal(-5566, heap.getStaticShort(shortStatic.owner,
							shortStatic.posAbs), "short static operation");
					equal(-5566 & 0xffff, heap.getStaticRaw(shortStatic.owner,
							shortStatic.posAbs), "short static raw operation");

					var longPair = [ 0, 0, 0 ];
					var longResult = heap.getStaticLongTo(longStatic.owner,
							longStatic.posAbs, longPair, 1);
					ok(longResult, "long returns");
					equal(0x12345678 >> 0, longPair[1], "long high part");
					equal(0x90abcdef >> 0, longPair[2], "long low part");

					equal(1.2345678901E98, heap.getStaticDouble(
							doubleStatic.owner, doubleStatic.posAbs),
							"double value");
					ok(heap.getStaticLongTo(doubleStatic.owner,
							doubleStatic.posAbs, [], 1)[1],
							"double raw value high");
					ok(heap.getStaticLongTo(doubleStatic.owner,
							doubleStatic.posAbs, [], 1)[2],
							"double raw value low");
				},
				"   Heap.string" : function() {
					var context = fisceTests.context();
					var heap = context.heap;

					var str = "asdfghjkl";
					var handle = heap.makeString(str);
					ok(handle, "String made handle=" + handle);
					equal(heap.getString(handle), str, "String got");

					handle = heap.literal(str);
					ok(handle, "Literal made handle=" + handle);
					equal(heap.getString(handle), str, "Literal content");
					equal(heap.literal(str), handle,
							"Same handle returned for two literal calls");
				}
			});
})();
