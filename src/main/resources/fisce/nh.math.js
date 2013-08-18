(function() {
	"use strict";

	var LOG10 = Math.log(10);

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {Number}
	 *            ops
	 */
	function mathACos(context, thread, ops) {
		var sb = thread.sp;
		var stack = thread.stack;
		var x = FyPortable.ieee64ToDouble(stack, sb);
		thread.nativeReturnDouble(Math.acos(x));
		return ops - 1;
	}

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {Number}
	 *            ops
	 */
	function mathASin(context, thread, ops) {
		var sb = thread.sp;
		var stack = thread.stack;
		var x = FyPortable.ieee64ToDouble(stack, sb);
		thread.nativeReturnDouble(Math.asin(x));
		return ops - 1;
	}

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {Number}
	 *            ops
	 */
	function mathATan(context, thread, ops) {
		var sb = thread.sp;
		var stack = thread.stack;
		var x = FyPortable.ieee64ToDouble(stack, sb);
		thread.nativeReturnDouble(Math.atan(x));
		return ops - 1;
	}

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {Number}
	 *            ops
	 */
	function mathATan2(context, thread, ops) {
		var sb = thread.sp;
		var stack = thread.stack;
		var x = FyPortable.ieee64ToDouble(stack, sb);
		var y = FyPortable.ieee64ToDouble(stack, sb + 2);
		thread.nativeReturnDouble(Math.atan(x, y));
		return ops - 1;
	}

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {Number}
	 *            ops
	 */
	function mathCbrt(context, thread, ops) {
		var sb = thread.sp;
		var stack = thread.stack;
		var x = FyPortable.ieee64ToDouble(stack, sb);
		thread.nativeReturnDouble(Math.pow(x, 1 / 3));
		return ops - 1;
	}

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {Number}
	 *            ops
	 */
	function mathCeil(context, thread, ops) {
		var sb = thread.sp;
		var stack = thread.stack;
		var x = FyPortable.ieee64ToDouble(stack, sb);
		thread.nativeReturnDouble(Math.ceil(x));
		return ops - 1;
	}

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {Number}
	 *            ops
	 */
	function mathCos(context, thread, ops) {
		var sb = thread.sp;
		var stack = thread.stack;
		var x = FyPortable.ieee64ToDouble(stack, sb);
		thread.nativeReturnDouble(Math.cos(x));
		return ops - 1;
	}

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {Number}
	 *            ops
	 */
	function mathCosh(context, thread, ops) {
		var sb = thread.sp;
		var stack = thread.stack;
		var x = FyPortable.ieee64ToDouble(stack, sb);
		var ex = Math.exp(x);
		thread.nativeReturnDouble((ex - 1 / ex) * .5);
		return ops - 1;
	}

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {Number}
	 *            ops
	 */
	function mathExp(context, thread, ops) {
		var sb = thread.sp;
		var stack = thread.stack;
		var x = FyPortable.ieee64ToDouble(stack, sb);
		thread.nativeReturnDouble(Math.exp(x));
		return ops - 1;
	}

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {Number}
	 *            ops
	 */
	function mathExpm1(context, thread, ops) {
		var sb = thread.sp;
		var stack = thread.stack;
		var x = FyPortable.ieee64ToDouble(stack, sb);
		thread.nativeReturnDouble(Math.exp(x) - 1);
		return ops - 1;
	}

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {Number}
	 *            ops
	 */
	function mathFloor(context, thread, ops) {
		var sb = thread.sp;
		var stack = thread.stack;
		var x = FyPortable.ieee64ToDouble(stack, sb);
		thread.nativeReturnDouble(Math.floor(x));
		return ops - 1;
	}

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {Number}
	 *            ops
	 */
	function mathHypot(context, thread, ops) {
		var sb = thread.sp;
		var stack = thread.stack;
		var x = FyPortable.ieee64ToDouble(stack, sb);
		var y = FyPortable.ieee64ToDouble(stack, sb + 2);
		var t;
		x = Math.abs(x);
		y = Math.abs(y);
		t = Math.min(x, y);
		x = Math.max(x, y);
		t /= x;
		thread.nativeReturnDouble(x * Math.sqrt(1 + t * t));
		return ops - 1;
	}

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {Number}
	 *            ops
	 */
	function mathIEEERemainder(context, thread, ops) {
		var sb = thread.sp;
		var stack = thread.stack;
		var x = FyPortable.ieee64ToDouble(stack, sb);
		var y = FyPortable.ieee64ToDouble(stack, sb + 2);
		if (y === 0) {
			thread.nativeReturnDouble(0.0 / y);
		} else {
			thread.nativeReturnDouble(x - Math.floot(x / y) * y);
		}
		return ops - 1;
	}

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {Number}
	 *            ops
	 */
	function mathLog(context, thread, ops) {
		var sb = thread.sp;
		var stack = thread.stack;
		var x = FyPortable.ieee64ToDouble(stack, sb);
		thread.nativeReturnDouble(Math.log(x));
		return ops - 1;
	}

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {Number}
	 *            ops
	 */
	function mathLog10(context, thread, ops) {
		var sb = thread.sp;
		var stack = thread.stack;
		var x = FyPortable.ieee64ToDouble(stack, sb);
		thread.nativeReturnDouble(Math.log(x) / LOG10);
		return ops - 1;
	}

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {Number}
	 *            ops
	 */
	function mathLog1p(context, thread, ops) {
		var sb = thread.sp;
		var stack = thread.stack;
		var x = FyPortable.ieee64ToDouble(stack, sb);
		thread.nativeReturnDouble(Math.log(x + 1));
		return ops - 1;
	}

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {Number}
	 *            ops
	 */
	function mathPow(context, thread, ops) {
		var sb = thread.sp;
		var stack = thread.stack;
		var x = FyPortable.ieee64ToDouble(stack, sb);
		var y = FyPortable.ieee64ToDouble(stack, sb + 2);
		thread.nativeReturnDouble(Math.pow(x, y));
		return ops - 1;
	}

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {Number}
	 *            ops
	 */
	function mathRint(context, thread, ops) {
		var sb = thread.sp;
		var stack = thread.stack;
		var x = FyPortable.ieee64ToDouble(stack, sb);
		thread.nativeReturnDouble(x - Math.floor(x));
		return ops - 1;
	}

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {Number}
	 *            ops
	 */
	function mathSignum(context, thread, ops) {
		var sb = thread.sp;
		var stack = thread.stack;
		var x = FyPortable.ieee64ToDouble(stack, sb);
		if (x != x) {
			thread.nativeReturnDouble(0.0 / 0.0);
		} else {
			thread.nativeReturnDouble(x > 0 ? 1.0 : (x < 0 ? -1.0 : 0.0));
		}
		return ops - 1;
	}

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {Number}
	 *            ops
	 */
	function mathSignumf(context, thread, ops) {
		var sb = thread.sp;
		var stack = thread.stack;
		var x = FyPortable.ieee64ToDouble(stack, sb);
		if (x != x) {
			thread.nativeReturnFloat(0.0 / 0.0);
		} else {
			thread.nativeReturnFloat(x > 0 ? 1.0 : (x < 0 ? -1.0 : 0.0));
		}
		return ops - 1;
	}

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {Number}
	 *            ops
	 */
	function mathSin(context, thread, ops) {
		var sb = thread.sp;
		var stack = thread.stack;
		var x = FyPortable.ieee64ToDouble(stack, sb);
		thread.nativeReturnDouble(Math.sin(x));
		return ops - 1;
	}

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {Number}
	 *            ops
	 */
	function mathSinh(context, thread, ops) {
		var sb = thread.sp;
		var stack = thread.stack;
		var x = FyPortable.ieee64ToDouble(stack, sb);
		var ex = Math.exp(x);
		thread.nativeReturnDouble((ex - 1 / ex) / 2);
		return ops - 1;
	}

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {Number}
	 *            ops
	 */
	function mathSqrt(context, thread, ops) {
		var sb = thread.sp;
		var stack = thread.stack;
		var x = FyPortable.ieee64ToDouble(stack, sb);
		thread.nativeReturnDouble(Math.sqrt(x));
		return ops - 1;
	}

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {Number}
	 *            ops
	 */
	function mathTan(context, thread, ops) {
		var sb = thread.sp;
		var stack = thread.stack;
		var x = FyPortable.ieee64ToDouble(stack, sb);
		thread.nativeReturnDouble(Math.tan(x));
		return ops - 1;
	}

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {Number}
	 *            ops
	 */
	function mathTanh(context, thread, ops) {
		var sb = thread.sp;
		var stack = thread.stack;
		var x = FyPortable.ieee64ToDouble(stack, sb);
		var e2x = Math.exp(2 * x);
		thread.nativeReturnDouble((e2x - 1) / (e2x + 1));
		return ops - 1;
	}

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {Number}
	 *            ops
	 */
	function mathUlp(context, thread, ops) {
		// TODO
		thread.nativeReturnDouble(0);
		return ops - 1;
	}

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {Number}
	 *            ops
	 */
	function mathUlpf(context, thread, ops) {
		// TODO
		thread.nativeReturnFloat(0);
		return ops - 1;
	}

	(function() {
		FyContext.registerStaticNH(FyConst.FY_BASE_MATH + ".acos.(D)D",
				mathACos);
		FyContext.registerStaticNH(FyConst.FY_BASE_MATH + ".asin.(D)D",
				mathASin);
		FyContext.registerStaticNH(FyConst.FY_BASE_MATH + ".atan.(D)D",
				mathATan);
		FyContext.registerStaticNH(FyConst.FY_BASE_MATH + ".atan2.(DD)D",
				mathATan2);
		FyContext.registerStaticNH(FyConst.FY_BASE_MATH + ".cbrt.(D)D",
				mathCbrt);
		FyContext.registerStaticNH(FyConst.FY_BASE_MATH + ".ceil.(D)D",
				mathCeil);
		FyContext.registerStaticNH(FyConst.FY_BASE_MATH + ".cos.(D)D", mathCos);
		FyContext.registerStaticNH(FyConst.FY_BASE_MATH + ".cosh.(D)D",
				mathCosh);
		FyContext.registerStaticNH(FyConst.FY_BASE_MATH + ".exp.(D)D", mathExp);
		FyContext.registerStaticNH(FyConst.FY_BASE_MATH + ".expm1.(D)D",
				mathExpm1);
		FyContext.registerStaticNH(FyConst.FY_BASE_MATH + ".floor.(D)D",
				mathFloor);
		FyContext.registerStaticNH(FyConst.FY_BASE_MATH + ".hypot.(DD)D",
				mathHypot);
		FyContext.registerStaticNH(FyConst.FY_BASE_MATH
				+ ".IEEEremainder.(DD)D", mathIEEERemainder);
		FyContext.registerStaticNH(FyConst.FY_BASE_MATH + ".log.(D)D", mathLog);
		FyContext.registerStaticNH(FyConst.FY_BASE_MATH + ".log10.(D)D",
				mathLog10);
		FyContext.registerStaticNH(FyConst.FY_BASE_MATH + ".log1p.(D)D",
				mathLog1p);
		FyContext
				.registerStaticNH(FyConst.FY_BASE_MATH + ".pow.(DD)D", mathPow);
		FyContext.registerStaticNH(FyConst.FY_BASE_MATH + ".rint.(D)D",
				mathRint);
		FyContext.registerStaticNH(FyConst.FY_BASE_MATH + ".signum.(D)D",
				mathSignum);
		FyContext.registerStaticNH(FyConst.FY_BASE_MATH + ".signum.(F)F",
				mathSignumf);
		FyContext.registerStaticNH(FyConst.FY_BASE_MATH + ".sin.(D)D", mathSin);
		FyContext.registerStaticNH(FyConst.FY_BASE_MATH + ".sinh.(D)D",
				mathSinh);
		FyContext.registerStaticNH(FyConst.FY_BASE_MATH + ".sqrt.(D)D",
				mathSqrt);
		FyContext.registerStaticNH(FyConst.FY_BASE_MATH + ".tan.(D)D", mathTan);
		FyContext.registerStaticNH(FyConst.FY_BASE_MATH + ".tanh.(D)D",
				mathTanh);
		FyContext.registerStaticNH(FyConst.FY_BASE_MATH + ".ulp.(D)D", mathUlp);
		FyContext
				.registerStaticNH(FyConst.FY_BASE_MATH + ".ulp.(F)F", mathUlpf);
	})();
})();