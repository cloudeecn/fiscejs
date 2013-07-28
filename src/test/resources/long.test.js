(function(window) {
	"use strict";
	var ops = [ "cmp", "add", "sub", "mul", "div", "rem" ];
	var data = [ 0x00000000 | 0, 0x00000001 | 0, 0x0000FFFF | 0,
			0x00010000 | 0, 0x00010001 | 0, 0x0001FFFF | 0, 0xFFFF0000 | 0,
			0xFFFF0001 | 0, 0xFFFFFFFF | 0, 0x80000000 | 0 ];
	var len = data.length;
	var vlen = len * len * len * len;
	var values = new Int32Array(vlen * 4);
	var leftH = 0 | 0;
	var leftL = 0 | 0;
	var rightH = 0 | 0;
	var rightL = 0 | 0;
	var pos = 0 | 0;
	for ( var leftHPos = 0; leftHPos < len; leftHPos++) {
		leftH = data[leftHPos];
		for ( var leftLPos = 0; leftLPos < len; leftLPos++) {
			leftL = data[leftLPos];
			for ( var rightHPos = 0; rightHPos < len; rightHPos++) {
				rightH = data[rightHPos];
				for ( var rightLPos = 0; rightLPos < len; rightLPos++) {
					rightL = data[rightLPos];
					pos = leftHPos * len * len * len + leftLPos * len * len
							+ rightHPos * len + rightLPos;
					values[pos << 2] = leftH;
					values[(pos << 2) + 1] = leftL;
					values[(pos << 2) + 2] = rightH;
					values[(pos << 2) + 3] = rightL;
				}
			}
		}
	}

	var stack = new Int32Array(65536);

	function testLong(op, mode) {
		var lop = FyCreateLongOps(window, mode, stack);
		var resultData = eval("FyLongTestData_" + op);

		var pos = 0 | 0;
		var failed = false;

		for (pos = 0; pos < vlen; pos++) {
			stack[17] = values[(pos << 2) + 0];
			stack[18] = values[(pos << 2) + 1];
			stack[19] = values[(pos << 2) + 2];
			stack[20] = values[(pos << 2) + 3];
			lop[op](17, 19);

			var targetResult = resultData[pos];
			if (stack[17] != targetResult[0] || stack[18] != targetResult[1]) {
				failed = true;
				ok(false, "mode " + mode + ":[" + values[(pos << 2) + 0] + ", "
						+ values[(pos << 2) + 1] + "] " + op + " ["
						+ values[(pos << 2) + 2] + ", "
						+ values[(pos << 2) + 3] + "] === [" + stack[17] + ", "
						+ stack[18] + "] but correct one is ["
						+ targetResult[0] + ", " + targetResult[1] + "]");
			}
		}
		if (!failed) {
			ok(true, "long " + op + " mode " + mode);
		}
	}
	fisceTests.extend({
		"   Long ops" : function() {
			for ( var opid in ops) {
				var op = ops[opid];
				for ( var mode = 0; mode < 3; mode++) {
					testLong(op, mode);
				}
			}

		},
		"   Long benchmark" : function() {
			var times = 1;
			var intValue = 0 | 0;
			var doubleValue = 0.0;
			var pos;

			var begin, end, time;

			begin = performance.now();
			for ( var i = 0; i < times * vlen; i++) {
				stack[1] = stack[2] + stack[3];
				stack[1] = stack[2] + stack[3];
				stack[1] = stack[2] + stack[3];
				stack[1] = stack[2] + stack[3];
				stack[1] = stack[2] + stack[3];
				stack[1] = stack[2] + stack[3];
				stack[1] = stack[2] + stack[3];
				stack[1] = stack[2] + stack[3];
				stack[1] = stack[2] + stack[3];
				stack[1] = stack[2] + stack[3];
			}
			end = performance.now();
			time = end - begin;
			ok(true, times * vlen * 10 + " int adds costs " + time + "ms"
					+ intValue);

			begin = performance.now();
			for ( var i = 0; i < times * vlen; i++) {
				FyPortable.doubleToIeee64(FyPortable.ieee64ToDouble(stack, 2)
						+ FyPortable.ieee64ToDouble(stack, 4), stack, 6);
				FyPortable.doubleToIeee64(FyPortable.ieee64ToDouble(stack, 2)
						+ FyPortable.ieee64ToDouble(stack, 4), stack, 6);
				FyPortable.doubleToIeee64(FyPortable.ieee64ToDouble(stack, 2)
						+ FyPortable.ieee64ToDouble(stack, 4), stack, 6);
				FyPortable.doubleToIeee64(FyPortable.ieee64ToDouble(stack, 2)
						+ FyPortable.ieee64ToDouble(stack, 4), stack, 6);
				FyPortable.doubleToIeee64(FyPortable.ieee64ToDouble(stack, 2)
						+ FyPortable.ieee64ToDouble(stack, 4), stack, 6);
				FyPortable.doubleToIeee64(FyPortable.ieee64ToDouble(stack, 2)
						+ FyPortable.ieee64ToDouble(stack, 4), stack, 6);
				FyPortable.doubleToIeee64(FyPortable.ieee64ToDouble(stack, 2)
						+ FyPortable.ieee64ToDouble(stack, 4), stack, 6);
				FyPortable.doubleToIeee64(FyPortable.ieee64ToDouble(stack, 2)
						+ FyPortable.ieee64ToDouble(stack, 4), stack, 6);
				FyPortable.doubleToIeee64(FyPortable.ieee64ToDouble(stack, 2)
						+ FyPortable.ieee64ToDouble(stack, 4), stack, 6);
				FyPortable.doubleToIeee64(FyPortable.ieee64ToDouble(stack, 2)
						+ FyPortable.ieee64ToDouble(stack, 4), stack, 6);
			}
			end = performance.now();
			time = end - begin;
			ok(true, times * vlen * 10 + " doubles adds costs " + time + "ms "
					+ doubleValue);

			begin = performance.now();
			for ( var i = 0; i < times * vlen; i++) {
				stack[2] = FyPortable.floatToIeee32(FyPortable
						.ieee32ToFloat(stack[0])
						+ FyPortable.ieee32ToFloat(stack[1]));
				stack[2] = FyPortable.floatToIeee32(FyPortable
						.ieee32ToFloat(stack[0])
						+ FyPortable.ieee32ToFloat(stack[1]));
				stack[2] = FyPortable.floatToIeee32(FyPortable
						.ieee32ToFloat(stack[0])
						+ FyPortable.ieee32ToFloat(stack[1]));
				stack[2] = FyPortable.floatToIeee32(FyPortable
						.ieee32ToFloat(stack[0])
						+ FyPortable.ieee32ToFloat(stack[1]));
				stack[2] = FyPortable.floatToIeee32(FyPortable
						.ieee32ToFloat(stack[0])
						+ FyPortable.ieee32ToFloat(stack[1]));
				stack[2] = FyPortable.floatToIeee32(FyPortable
						.ieee32ToFloat(stack[0])
						+ FyPortable.ieee32ToFloat(stack[1]));
				stack[2] = FyPortable.floatToIeee32(FyPortable
						.ieee32ToFloat(stack[0])
						+ FyPortable.ieee32ToFloat(stack[1]));
				stack[2] = FyPortable.floatToIeee32(FyPortable
						.ieee32ToFloat(stack[0])
						+ FyPortable.ieee32ToFloat(stack[1]));
				stack[2] = FyPortable.floatToIeee32(FyPortable
						.ieee32ToFloat(stack[0])
						+ FyPortable.ieee32ToFloat(stack[1]));
				stack[2] = FyPortable.floatToIeee32(FyPortable
						.ieee32ToFloat(stack[0])
						+ FyPortable.ieee32ToFloat(stack[1]));
			}
			end = performance.now();
			time = end - begin;
			ok(true, times * vlen * 10 + " floats adds costs " + time + "ms "
					+ doubleValue);

			for ( var mode = 0; mode < 3; mode++) {
				var lop = FyCreateLongOps(window, mode, stack);
				for ( var opid in ops) {
					var op = ops[opid];
					var lopop = lop[op];
					for (pos = 0; pos < 64; pos++) {
						stack[pos] = 0;
					}
					begin = performance.now();
					for (pos = 0; pos < vlen; pos++) {
						stack[17] = values[(pos << 2) + 0];
						stack[18] = values[(pos << 2) + 1];
						stack[19] = values[(pos << 2) + 2];
						stack[20] = values[(pos << 2) + 3];

						for ( var i = 0; i < times; i++) {
							lopop.call(lop, 17, 19);
							lopop.call(lop, 17, 19);
							lopop.call(lop, 17, 19);
							lopop.call(lop, 17, 19);
							lopop.call(lop, 17, 19);
							lopop.call(lop, 17, 19);
							lopop.call(lop, 17, 19);
							lopop.call(lop, 17, 19);
							lopop.call(lop, 17, 19);
							lopop.call(lop, 17, 19);
						}
					}
					end = performance.now();
					time = end - begin;
					ok(true, "mode " + mode + ": " + times * vlen * 10
							+ " longs " + op + " costs " + time + "ms "
							+ stack[17] + " " + stack[19]);
				}
			}
		}
	});
})(function() {
	return this;
}.call());