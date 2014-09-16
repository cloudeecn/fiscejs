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
						var typeName = type.substring(1).charAt(0).toUpperCase()
								+ type.substring(2);
						var setter = heap["putArray" + typeName];
						var getter = heap["getArray" + typeName];
						
						handle = heap.allocateArray(context
								.lookupClass(arrayName), length);
						if (length = heap.arrayLength(handle)) {
							ok(true, type + "[] length=" + length);
						} else {
							ok(false, type + "[] length="
									+ heap.arrayLength(handle) + "/" + length);
						}
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

					test("<boolean", "(i&1)?true:false");
					test("<byte", "((i&1)?1:-1)*(i&0x7f)");

					test("<short", "((i&1)?1:-1)*((i*0x101)&0x7fff)");
					test("<char", "((i*0x101)&0xffff)");

					test("<int", "((i&1)?1:-1)*((i*0x1010101)&0x7fffffff)");
					test(
							"<float",
							"FyPortable.ieee32ToFloat(FyPortable.floatToIeee32(((i&1)?1:-1)*i*1.234*1000000))");

					test("<double", "((i&1)?1:-1)*i*1.234*1000000");

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

						handle3 = heap.allocateArray(context.lookupClass("[J"),
								heap.arrayLength(handle) + 10);
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
					heap.putFieldFloat(handle, floatField.posAbs, 8.75766E10);

					heap.putFieldLongFrom(handle, longField.posAbs, [ 0,
							0x12345678, 0x90abcdef ], 1);
					heap.putFieldDouble(handle, doubleField.posAbs,
							1.2345678901E98);

					var pos = heap.allocatePerm(2);

					equal(true, heap.getFieldBoolean(handle,
							booleanField.posAbs), "boolean field operation");
					heap.getFieldRaw32To(handle, booleanField.posAbs, pos);
					equal(1, heap.get32(pos), "boolean field raw operation");

					equal(-3, heap.getFieldByte(handle, byteField.posAbs),
							"byte field operation");
					heap.getFieldRaw32To(handle, byteField.posAbs, pos);
					equal(-3 & 0xff, heap.get32(pos),
							"byte field raw operation");

					equal(0x5678, heap.getFieldChar(handle, charField.posAbs),
							"char field operation");
					heap.getFieldRaw32To(handle, charField.posAbs, pos);
					equal(0x5678, heap.get32(pos), "char field raw operation");

					equal(-5566, heap.getFieldShort(handle, shortField.posAbs),
							"short field operation");
					heap.getFieldRaw32To(handle, shortField.posAbs, pos);
					equal(-5566 & 0xffff, heap.get32(pos),
							"short field raw operation");

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
					heap.getFieldRaw32To(handle2, booleanField.posAbs, pos);
					equal(1, heap.get32(pos), "boolean field raw operation");

					equal(-3, heap.getFieldByte(handle2, byteField.posAbs),
							"byte field operation");
					heap.getFieldRaw32To(handle2, byteField.posAbs, pos);
					equal(-3 & 0xff, heap.get32(pos),
							"byte field raw operation");

					equal(0x5678, heap.getFieldChar(handle2, charField.posAbs),
							"char field operation");
					heap.getFieldRaw32To(handle2, charField.posAbs, pos);
					equal(0x5678, heap.get32(pos), "char field raw operation");

					equal(-5566,
							heap.getFieldShort(handle2, shortField.posAbs),
							"short field operation");
					heap.getFieldRaw32To(handle2, shortField.posAbs, pos);
					equal(-5566 & 0xffff, heap.get32(pos),
							"short field raw operation");

					var longPair = [ 0, 0, 0 ];
					var longResult = heap.getFieldLongTo(handle2,
							longField.posAbs, longPair, 1);
					ok(longResult, "long returns");
					equal(0x12345678 >> 0, longPair[1], "long high part");
					equal(0x90abcdef >> 0, longPair[2], "long low part");

					equal(1.2345678901E98, heap.getFieldDouble(handle2,
							doubleField.posAbs), "double value");
					ok(
							heap.getFieldLongTo(handle2, doubleField.posAbs,
									[], 1)[1], "double raw value high");
					ok(
							heap.getFieldLongTo(handle2, doubleField.posAbs,
									[], 1)[2], "double raw value low");

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

					// allocat 2 dwords for tmp var
					var pos = heap.allocatePerm(2);

					heap.putStaticBoolean(booleanStatic.owner,
							booleanStatic.posAbs, true);
					heap.putStaticByte(byteStatic.owner, byteStatic.posAbs, -3);

					heap.putStaticChar(charStatic.owner, charStatic.posAbs,
							0x5678);
					heap.putStaticShort(shortStatic.owner, shortStatic.posAbs,
							-5566);

					heap.putStaticInt(intStatic.owner, intStatic.posAbs,
							0x12345678);
					heap.putStaticFloat(floatStatic.owner, floatStatic.posAbs,
							8.75766E10);

					heap.putStaticLongFrom(longStatic.owner, longStatic.posAbs,
							[ 0, 0x12345678, 0x90abcdef ], 1);
					heap.putStaticDouble(doubleStatic.owner,
							doubleStatic.posAbs, 1.2345678901E98);

					var fields = [ booleanStatic, byteStatic, shortStatic,
							charStatic, intStatic, floatStatic ];

					for ( var idx in fields) {
						var f = fields[idx];
						console.log(f);
						heap.getStaticRaw32To(f.owner, f.posAbs, pos);
						console.log(f.owner.name + "(" + f.owner.staticPos
								+ ")[" + f.posAbs + "]=" + heap.get32(pos)
								+ "(" + f.type.name + ")");
					}
					fields = [ longStatic, doubleStatic ];
					for ( var idx in fields) {
						var f = fields[idx];
						heap.getStaticRaw64To(f.owner, f.posAbs, pos);
						console.log(f.owner.name + "(" + f.owner.staticPos
								+ ")[" + f.posAbs + "]=" + "["
								+ heap.get32(pos) + ", " + heap.get32(pos + 1)
								+ "]" + "(" + f.type.name + ")");
					}
					equal(true, heap.getStaticBoolean(booleanStatic.owner,
							booleanStatic.posAbs), "boolean static operation");
					heap.getStaticRaw32To(booleanStatic.owner,
							booleanStatic.posAbs, pos);
					equal(1, heap.get32(pos), "boolean static raw operation");

					equal(-3, heap.getStaticByte(byteStatic.owner,
							byteStatic.posAbs), "byte static operation");
					heap.getStaticRaw32To(byteStatic.owner, byteStatic.posAbs, pos);
					equal(-3 & 0xff, heap.get32(pos),
							"byte static raw operation");

					equal(0x5678, heap.getStaticChar(charStatic.owner,
							charStatic.posAbs), "char static operation");
					heap.getStaticRaw32To(charStatic.owner, charStatic.posAbs, pos);
					equal(0x5678, heap.get32(pos), "char static raw operation");

					equal(-5566, heap.getStaticShort(shortStatic.owner,
							shortStatic.posAbs), "short static operation");
					heap.getStaticRaw32To(shortStatic.owner, shortStatic.posAbs,
							pos);
					equal(-5566 & 0xffff, heap.get32(pos),
							"short static raw operation");

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
					var handle = heap.allocate(context
							.lookupClass(FyConst.FY_BASE_STRING));
					heap.fillString(handle, str);
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
