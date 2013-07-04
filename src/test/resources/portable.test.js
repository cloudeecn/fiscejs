(function() {
	"use strict";
	fisceTests.extend({
		"    Performance" : function() {
			var i, j, ROUNDS = 1024, TIMES = 4096;
			var intArray = new Uint32Array(TIMES);
			var floatArray = new Float32Array(TIMES);
			var arrayBuffer = new ArrayBuffer(TIMES << 2);
			var bufferBackedIntArray = new Uint32Array(arrayBuffer);
			var bufferBackedFloatArray = new Float32Array(arrayBuffer);
			var dataView = new DataView(arrayBuffer);
			var begin, end;

			console.log("Testing " + ROUNDS + " rounds of Uint32Array");
			begin = performance.now();
			for (j = 0; j < ROUNDS; j++) {
				for (i = 0; i < TIMES; i++) {
					intArray[i] = i;
				}
			}
			end = performance.now();
			console.log("done. time=" + (end - begin));
			ok(true, ROUNDS + " rounds " + (TIMES / 256)
					+ "kB writes Uint32Array: " + (end - begin));

			console.log("Testing " + ROUNDS + " rounds of Float32Array");
			begin = performance.now();
			for (j = 0; j < ROUNDS; j++) {
				for (i = 0; i < TIMES; i++) {
					floatArray[i] = i;
				}
			}
			end = performance.now();
			console.log("done. time=" + (end - begin));
			ok(true, ROUNDS + " rounds " + (TIMES / 256)
					+ "kB writes Float32Array: " + (end - begin));

			console.log("Testing " + ROUNDS + " rounds of Uint32Array/BB");
			begin = performance.now();
			for (j = 0; j < ROUNDS; j++) {
				for (i = 0; i < TIMES; i++) {
					bufferBackedIntArray[i] = i;
				}
			}
			end = performance.now();
			console.log("done. time=" + (end - begin));
			ok(true, ROUNDS + " rounds " + (TIMES / 256)
					+ "kB writes Uint32Array(ArrayBuffer backed): "
					+ (end - begin));

			console.log("Testing " + ROUNDS + " rounds of Float32Array/BB");
			begin = performance.now();
			for (j = 0; j < ROUNDS; j++) {
				for (i = 0; i < TIMES; i++) {
					bufferBackedFloatArray[i] = i;
				}
			}
			end = performance.now();
			console.log("done. time=" + (end - begin));
			ok(true, ROUNDS + " rounds " + (TIMES / 256)
					+ "kB writes Float32Array(ArrayBuffer backed): "
					+ (end - begin));

			console.log("Testing " + (ROUNDS / 10)
					+ " rounds of DataView/Uint32");
			begin = performance.now();
			for (j = 0; j < ROUNDS / 10; j++) {
				for (i = 0; i < TIMES; i++) {
					dataView.setUint32(i << 2, i);
				}
			}
			end = performance.now();
			console.log("done. time=" + (end - begin));
			ok(true, ROUNDS / 10 + " rounds " + (TIMES / 256)
					+ "kB writes DataView/uint32: " + (end - begin));

			console.log("Testing " + (ROUNDS / 10)
					+ " rounds of DataView/Float32");
			begin = performance.now();
			for (j = 0; j < ROUNDS / 10; j++) {
				for (i = 0; i < TIMES; i++) {
					dataView.setFloat32(i << 2, i);
				}
			}
			end = performance.now();
			console.log("done. time=" + (end - begin));
			ok(true, ROUNDS / 10 + " rounds " + (TIMES / 256)
					+ "kB writes DataView/float32: " + (end - begin));
		}
	});
})();