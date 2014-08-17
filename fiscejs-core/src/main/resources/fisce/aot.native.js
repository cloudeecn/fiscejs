(function() {
	"use strict";

	/**
	 * @param {FyThread}
	 *            thread
	 * @param {FyMethod}
	 *            method
	 */
	function storeParamsToArray(thread, method, ip, spo) {
		var heap = thread.context.heap;
		return "if (heap.arrayLength(stack[sb+"
				+ (spo + 1)
				+ "]) < stack[sb+"
				+ (spo + 2)
				+ "] + stack[sb+"
				+ (spo + 3)
				+ "]) {"
				+ "throw new FyException(FyConst.FY_EXCEPTION_AIOOB,'Target array is too small to fit param size');"
				+ "}"
				+ "if ("
				+ method.maxLocals
				+ " < stack[sb+"
				+ (spo + 3)
				+ "]) {"
				+ "throw new FyException(FyConst.FY_EXCEPTION_AIOOB,'Current method doesn\\\'t have ' + stack[sb+"
				+ (spo + 3) + "]+ ' params.');" + "}"
				+ "heap.memcpy32(sb + stack[sb+" + (spo) + "], _heap[stack[sb+"
				+ (spo + 1) + "]] + stack[sb+" + (spo + 2) + "]+ "
				+ heap.OBJ_META_SIZE + ", stack[sb+" + (spo + 3) + "]);";
	}

	FyContext.registerStaticNA(
			"com/cirnoworks/fisce/privat/FiScEVM.storeParamsToArray.(I[III)V",
			storeParamsToArray);
})();