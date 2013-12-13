(function() {
	"use strict";

	/**
	 * @param {FyThread}
	 *            thread
	 * @param {FyMethod}
	 *            method
	 */
	function storeParamsToArray(thread, method) {
		var heap = thread.context.heap;
		return "if (heap.arrayLength(stack[sp + 1]) < stack[sp + 2] + stack[sp + 3]) {"
				+ "throw new FyException(FyConst.FY_EXCEPTION_AIOOB,'Target array is too small to fit param size');"
				+ "}"
				+ "if ("
				+ method.maxLocals
				+ " < stack[sp + 3]) {"
				+ "throw new FyException(FyConst.FY_EXCEPTION_AIOOB,'Current method doesn\\\'t have ' + stack[sp + 3]+ ' params.');"
				+ "}"
				+ "heap.memcpy32(sb + stack[sp], _heap[stack[sp + 1]] + stack[sp + 2]+ "
				+ heap.OBJ_META_SIZE + ", stack[sp + 3]);";
	}

	FyContext.registerStaticNA(
			"com/cirnoworks/fisce/privat/FiScEVM.storeParamsToArray.(I[III)V",
			storeParamsToArray);
})();