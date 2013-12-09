(function(window) {

	function ok(a, b) {
		console.log((a ? "ok" : "failed" + ": " + b));
	}
	if (!window.Math.imul) {
		// @see
		// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/imul
		window.Math.imul = function(a, b) {
			var ah = (a >>> 16) & 0xffff;
			var al = a & 0xffff;
			var bh = (b >>> 16) & 0xffff;
			var bl = b & 0xffff;
			// the shift by 0 fixes the sign on the high part
			// the final |0 converts the unsigned value into a signed value
			return ((al * bl) + (((ah * bl + al * bh) << 16) >>> 0) | 0);
		};
	}
	eval(require('fs').readFileSync('./long.test.div.js', 'utf8'));
	eval(require('fs').readFileSync('../../main/resources/fisce/long.asm.js',
			'utf8'));

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

	function testLong(op, mode) {
		var stack = new Int32Array(65536);
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

	// return;
	testLong("div", 0);
	testLong("div", 1);
	testLong("div", 2);
})(function() {
	return this;
}.call());