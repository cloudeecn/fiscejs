(function() {
	"use strict";
	fisceTests.extendPrerequisite({
		"     Performance" : function(assert) {
			"use strict";
			var i, j, ROUNDS = 10, TIMES = 1048576;
			var array = new Array(TIMES);
			var farray = new Array(TIMES);
			var intArray = new Int32Array(TIMES);
			var floatArray = new Float32Array(TIMES);
			var arrayBuffer = new ArrayBuffer(TIMES << 2);
			var bufferBackedIntArray = new Int32Array(arrayBuffer);
			var bufferBackedFloatArray = new Float32Array(arrayBuffer);
			var bufferBackedFloat64Array = new Float64Array(arrayBuffer);
			var dataView = new DataView(arrayBuffer);
			var begin, end;
			var time;

			time = benchmark(function() {
				var i, j;
				for (j = 0; j < ROUNDS; j++) {
					for (i = 0; i < TIMES; i++) {
						array[i] = i + 1;
					}
				}
			});
			assert.ok(true, ROUNDS + " rounds " + (TIMES / 256)
					+ "kB ints writes to array: " + time);

			time = benchmark(function() {
				var i, j;
				for (j = 0; j < ROUNDS; j++) {
					for (i = 0; i < TIMES; i++) {
						farray[i] = i + 0.1;
					}
				}
			});
			assert.ok(true, ROUNDS + " rounds " + (TIMES / 256)
					+ "kB floats writes to array: " + time);

			time = benchmark(function() {
				var i, j;
				for (j = 0; j < ROUNDS; j++) {
					for (i = 0; i < TIMES; i++) {
						intArray[i] = i;
					}
				}
			});
			assert.ok(true, ROUNDS + " rounds " + (TIMES / 256)
					+ "kB writes Uint32Array: " + time);

			time = benchmark(function() {
				var i, j;
				for (j = 0; j < ROUNDS; j++) {
					for (i = 0; i < TIMES; i++) {
						floatArray[i] = i;
					}
				}
			});
			assert.ok(true, ROUNDS + " rounds " + (TIMES / 256)
					+ "kB writes Float32Array: " + time);

			time = benchmark(function() {
				var i, j;
				for (j = 0; j < ROUNDS; j++) {
					for (i = 0; i < TIMES; i++) {
						bufferBackedIntArray[i] = i;
					}
				}
			});
			assert.ok(true, ROUNDS + " rounds " + (TIMES / 256)
					+ "kB writes Uint32Array(ArrayBuffer backed): " + time);

			time = benchmark(function() {
				var i, j;
				for (j = 0; j < ROUNDS; j++) {
					for (i = 0; i < TIMES; i++) {
						bufferBackedFloatArray[i] = i;
					}
				}
			});
			assert.ok(true, ROUNDS + " rounds " + (TIMES / 256)
					+ "kB writes Float32Array(ArrayBuffer backed): " + time);

			time = benchmark(function() {
				var i, j;
				var max = TIMES / 2;
				for (j = 0; j < ROUNDS; j++) {
					for (i = 0; i < max; i++) {
						bufferBackedFloat64Array[i] = i;
					}
				}
			});
			assert.ok(true, ROUNDS + " rounds " + (TIMES / 256)
					+ "kB writes Float64Array(ArrayBuffer backed): " + time);

			time = benchmark(function() {
				var i, j;
				for (j = 0; j < ROUNDS / 10; j++) {
					for (i = 0; i < TIMES; i++) {
						dataView.setUint32(i << 2, i);
					}
				}
			});
			assert.ok(true, ROUNDS / 10 + " rounds " + (TIMES / 256)
					+ "kB writes DataView/uint32: " + time);

			time = benchmark(function() {
				var i, j;
				for (j = 0; j < ROUNDS / 10; j++) {
					for (i = 0; i < TIMES; i++) {
						dataView.setFloat32(i << 2, i);
					}
				}
			});
			assert.ok(true, ROUNDS / 10 + " rounds " + (TIMES / 256)
					+ "kB writes DataView/float32: " + time);
		}
	});
})();