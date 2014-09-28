/**
 * Copyright 2013 Yuxuan Huang. All rights reserved.
 * 
 * This file is part of fiscejs.
 * 
 * fiscejs is free software: you can redistribute it and/or modify it under the
 * terms of the GNU General Public License as published by the Free Software
 * Foundation, either version 3 of the License, or any later version.
 * 
 * fiscejs is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
 * A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License along with
 * fiscejs. If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * @param {FyContext}
 *            context
 */
function fyRegisterNativeMath(context) {
	"use strict";

	var LOG10 = Math.log(10);

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {number}
	 *            ops
	 */
	function mathACos(context, thread, sp, ops) {

		var stack = thread.stack;
		var x = FyPortable.ieee64ToDouble(stack, sp);
		thread.nativeReturnDouble(sp, Math.acos(x));
		return ops - 1;
	}

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {number}
	 *            ops
	 */
	function mathASin(context, thread, sp, ops) {

		var stack = thread.stack;
		var x = FyPortable.ieee64ToDouble(stack, sp);
		thread.nativeReturnDouble(sp, Math.asin(x));
		return ops - 1;
	}

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {number}
	 *            ops
	 */
	function mathATan(context, thread, sp, ops) {

		var stack = thread.stack;
		var x = FyPortable.ieee64ToDouble(stack, sp);
		thread.nativeReturnDouble(sp, Math.atan(x));
		return ops - 1;
	}

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {number}
	 *            ops
	 */
	function mathATan2(context, thread, sp, ops) {

		var stack = thread.stack;
		var x = FyPortable.ieee64ToDouble(stack, sp);
		var y = FyPortable.ieee64ToDouble(stack, sp + 2);
		thread.nativeReturnDouble(sp, Math.atan2(x, y));
		return ops - 1;
	}

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {number}
	 *            ops
	 */
	function mathCbrt(context, thread, sp, ops) {

		var stack = thread.stack;
		var x = FyPortable.ieee64ToDouble(stack, sp);
		thread.nativeReturnDouble(sp, Math.pow(x, 1 / 3));
		return ops - 1;
	}

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {number}
	 *            ops
	 */
	function mathCeil(context, thread, sp, ops) {

		var stack = thread.stack;
		var x = FyPortable.ieee64ToDouble(stack, sp);
		thread.nativeReturnDouble(sp, Math.ceil(x));
		return ops - 1;
	}

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {number}
	 *            ops
	 */
	function mathCos(context, thread, sp, ops) {

		var stack = thread.stack;
		var x = FyPortable.ieee64ToDouble(stack, sp);
		thread.nativeReturnDouble(sp, Math.cos(x));
		return ops - 1;
	}

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {number}
	 *            ops
	 */
	function mathCosh(context, thread, sp, ops) {

		var stack = thread.stack;
		var x = FyPortable.ieee64ToDouble(stack, sp);
		var ex = Math.exp(x);
		thread.nativeReturnDouble(sp, (ex - 1 / ex) * .5);
		return ops - 1;
	}

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {number}
	 *            ops
	 */
	function mathExp(context, thread, sp, ops) {

		var stack = thread.stack;
		var x = FyPortable.ieee64ToDouble(stack, sp);
		thread.nativeReturnDouble(sp, Math.exp(x));
		return ops - 1;
	}

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {number}
	 *            ops
	 */
	function mathExpm1(context, thread, sp, ops) {

		var stack = thread.stack;
		var x = FyPortable.ieee64ToDouble(stack, sp);
		thread.nativeReturnDouble(sp, Math.exp(x) - 1);
		return ops - 1;
	}

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {number}
	 *            ops
	 */
	function mathFloor(context, thread, sp, ops) {

		var stack = thread.stack;
		var x = FyPortable.ieee64ToDouble(stack, sp);
		thread.nativeReturnDouble(sp, Math.floor(x));
		return ops - 1;
	}

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {number}
	 *            ops
	 */
	function mathHypot(context, thread, sp, ops) {

		var stack = thread.stack;
		var x = FyPortable.ieee64ToDouble(stack, sp);
		var y = FyPortable.ieee64ToDouble(stack, sp + 2);
		var t;
		x = Math.abs(x);
		y = Math.abs(y);
		t = Math.min(x, y);
		x = Math.max(x, y);
		t /= x;
		thread.nativeReturnDouble(sp, x * Math.sqrt(1 + t * t));
		return ops - 1;
	}

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {number}
	 *            ops
	 */
	function mathIEEERemainder(context, thread, sp, ops) {

		var stack = thread.stack;
		var x = FyPortable.ieee64ToDouble(stack, sp);
		var y = FyPortable.ieee64ToDouble(stack, sp + 2);
		if (y === 0) {
			thread.nativeReturnDouble(sp, 0.0 / y);
		} else {
			thread.nativeReturnDouble(sp, x - Math.floot(x / y) * y);
		}
		return ops - 1;
	}

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {number}
	 *            ops
	 */
	function mathLog(context, thread, sp, ops) {

		var stack = thread.stack;
		var x = FyPortable.ieee64ToDouble(stack, sp);
		thread.nativeReturnDouble(sp, Math.log(x));
		return ops - 1;
	}

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {number}
	 *            ops
	 */
	function mathLog10(context, thread, sp, ops) {

		var stack = thread.stack;
		var x = FyPortable.ieee64ToDouble(stack, sp);
		thread.nativeReturnDouble(sp, Math.log(x) / LOG10);
		return ops - 1;
	}

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {number}
	 *            ops
	 */
	function mathLog1p(context, thread, sp, ops) {

		var stack = thread.stack;
		var x = FyPortable.ieee64ToDouble(stack, sp);
		thread.nativeReturnDouble(sp, Math.log(x + 1));
		return ops - 1;
	}

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {number}
	 *            ops
	 */
	function mathPow(context, thread, sp, ops) {

		var stack = thread.stack;
		var x = FyPortable.ieee64ToDouble(stack, sp);
		var y = FyPortable.ieee64ToDouble(stack, sp + 2);
		thread.nativeReturnDouble(sp, Math.pow(x, y));
		return ops - 1;
	}

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {number}
	 *            ops
	 */
	function mathRint(context, thread, sp, ops) {

		var stack = thread.stack;
		var x = FyPortable.ieee64ToDouble(stack, sp);
		thread.nativeReturnDouble(sp, x - Math.floor(x));
		return ops - 1;
	}

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {number}
	 *            ops
	 */
	function mathSignum(context, thread, sp, ops) {

		var stack = thread.stack;
		var x = FyPortable.ieee64ToDouble(stack, sp);
		if (x != x) {
			thread.nativeReturnDouble(sp, 0.0 / 0.0);
		} else {
			thread.nativeReturnDouble(sp, x > 0 ? 1.0 : (x < 0 ? -1.0 : 0.0));
		}
		return ops - 1;
	}

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {number}
	 *            ops
	 */
	function mathSignumf(context, thread, sp, ops) {

		var stack = thread.stack;
		var x = FyPortable.ieee64ToDouble(stack, sp);
		if (x != x) {
			thread.nativeReturnFloat(sp, 0.0 / 0.0);
		} else {
			thread.nativeReturnFloat(sp, x > 0 ? 1.0 : (x < 0 ? -1.0 : 0.0));
		}
		return ops - 1;
	}

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {number}
	 *            ops
	 */
	function mathSin(context, thread, sp, ops) {

		var stack = thread.stack;
		var x = FyPortable.ieee64ToDouble(stack, sp);
		thread.nativeReturnDouble(sp, Math.sin(x));
		return ops - 1;
	}

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {number}
	 *            ops
	 */
	function mathSinh(context, thread, sp, ops) {

		var stack = thread.stack;
		var x = FyPortable.ieee64ToDouble(stack, sp);
		var ex = Math.exp(x);
		thread.nativeReturnDouble(sp, (ex - 1 / ex) / 2);
		return ops - 1;
	}

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {number}
	 *            ops
	 */
	function mathSqrt(context, thread, sp, ops) {

		var stack = thread.stack;
		var x = FyPortable.ieee64ToDouble(stack, sp);
		thread.nativeReturnDouble(sp, Math.sqrt(x));
		return ops - 1;
	}

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {number}
	 *            ops
	 */
	function mathTan(context, thread, sp, ops) {

		var stack = thread.stack;
		var x = FyPortable.ieee64ToDouble(stack, sp);
		thread.nativeReturnDouble(sp, Math.tan(x));
		return ops - 1;
	}

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {number}
	 *            ops
	 */
	function mathTanh(context, thread, sp, ops) {

		var stack = thread.stack;
		var x = FyPortable.ieee64ToDouble(stack, sp);
		var e2x = Math.exp(2 * x);
		thread.nativeReturnDouble(sp, (e2x - 1) / (e2x + 1));
		return ops - 1;
	}

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {number}
	 *            ops
	 */
	function mathUlp(context, thread, sp, ops) {
		// TODO
		thread.nativeReturnDouble(sp, 0);
		return ops - 1;
	}

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {number}
	 *            ops
	 */
	function mathUlpf(context, thread, sp, ops) {
		// TODO
		thread.nativeReturnFloat(sp, 0);
		return ops - 1;
	}

	(function() {
		context.registerNativeHandler(FyConst.FY_BASE_MATH + ".acos.(D)D",
				mathACos);
		context.registerNativeHandler(FyConst.FY_BASE_MATH + ".asin.(D)D",
				mathASin);
		context.registerNativeHandler(FyConst.FY_BASE_MATH + ".atan.(D)D",
				mathATan);
		context.registerNativeHandler(FyConst.FY_BASE_MATH + ".atan2.(DD)D",
				mathATan2);
		context.registerNativeHandler(FyConst.FY_BASE_MATH + ".cbrt.(D)D",
				mathCbrt);
		context.registerNativeHandler(FyConst.FY_BASE_MATH + ".ceil.(D)D",
				mathCeil);
		context.registerNativeHandler(FyConst.FY_BASE_MATH + ".cos.(D)D",
				mathCos);
		context.registerNativeHandler(FyConst.FY_BASE_MATH + ".cosh.(D)D",
				mathCosh);
		context.registerNativeHandler(FyConst.FY_BASE_MATH + ".exp.(D)D",
				mathExp);
		context.registerNativeHandler(FyConst.FY_BASE_MATH + ".expm1.(D)D",
				mathExpm1);
		context.registerNativeHandler(FyConst.FY_BASE_MATH + ".floor.(D)D",
				mathFloor);
		context.registerNativeHandler(FyConst.FY_BASE_MATH + ".hypot.(DD)D",
				mathHypot);
		context.registerNativeHandler(FyConst.FY_BASE_MATH
				+ ".IEEEremainder.(DD)D", mathIEEERemainder);
		context.registerNativeHandler(FyConst.FY_BASE_MATH + ".log.(D)D",
				mathLog);
		context.registerNativeHandler(FyConst.FY_BASE_MATH + ".log10.(D)D",
				mathLog10);
		context.registerNativeHandler(FyConst.FY_BASE_MATH + ".log1p.(D)D",
				mathLog1p);
		context.registerNativeHandler(FyConst.FY_BASE_MATH + ".pow.(DD)D",
				mathPow);
		context.registerNativeHandler(FyConst.FY_BASE_MATH + ".rint.(D)D",
				mathRint);
		context.registerNativeHandler(FyConst.FY_BASE_MATH + ".signum.(D)D",
				mathSignum);
		context.registerNativeHandler(FyConst.FY_BASE_MATH + ".signum.(F)F",
				mathSignumf);
		context.registerNativeHandler(FyConst.FY_BASE_MATH + ".sin.(D)D",
				mathSin);
		context.registerNativeHandler(FyConst.FY_BASE_MATH + ".sinh.(D)D",
				mathSinh);
		context.registerNativeHandler(FyConst.FY_BASE_MATH + ".sqrt.(D)D",
				mathSqrt);
		context.registerNativeHandler(FyConst.FY_BASE_MATH + ".tan.(D)D",
				mathTan);
		context.registerNativeHandler(FyConst.FY_BASE_MATH + ".tanh.(D)D",
				mathTanh);
		context.registerNativeHandler(FyConst.FY_BASE_MATH + ".ulp.(D)D",
				mathUlp);
		context.registerNativeHandler(FyConst.FY_BASE_MATH + ".ulp.(F)F",
				mathUlpf);
	})();
}