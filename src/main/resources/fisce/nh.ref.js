(function() {
	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {Number}
	 *            ops
	 */
	function classNewInstanceA(context, thread, ops) {
		var stack = thread.stack;
		var sb = thread.getCurrentStackBase();
		var clazz = context.getClassFromClassObject(stack[sb]);
		thread.nativeReturnInt(this, context.heap.allocateArray(clazz,
				stack[sb + 1]));
		return ops - 5;
	}

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {Number}
	 *            ops
	 */
	function classNewInstanceO(context, thread, ops) {
		var stack = thread.stack;
		var sb = thread.getCurrentStackBase();
		var clazz = context.getClassFromClassObject(stack[sb]);
		var handle = context.heap.allocate(clazz);
		thread.nativeReturnInt(this, handle);
		stack[thread.sp] = handle;
		thread.pushMethod(context.lookupMethodVirtual(clazz,
				FyConst.FY_METHOD_INIT + ".()V"));
		return 0;
	}

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {Number}
	 *            ops
	 */
	function classIsInstance(context, thread, ops) {
		var stack = thread.stack;
		var sb = thread.getCurrentStackBase();
		var clazz = context.getClassFromClassObject(stack[sb]);
		var objClazz = context.heap.getObject(stack[sb + 1]).clazz;
		thread.nativeReturnInt(this, context.classLoader.canCast(objClazz,
				clazz) ? 1 : 0);
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
	function classIsAssignableFrom(context, thread, ops) {
		var stack = thread.stack;
		var sb = thread.getCurrentStackBase();
		var clazz = context.getClassFromClassObject(stack[sb]);
		var targetClazz = context.getClassFromClassObject(stack[sb + 1]);
		thread.nativeReturnInt(this, context.classLoader.canCast(targetClazz,
				clazz) ? 1 : 0);
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
	function classIsArray(context, thread, ops) {
		var stack = thread.stack;
		var sb = thread.getCurrentStackBase();
		var clazz = context.getClassFromClassObject(stack[sb]);
		thread.nativeReturnInt(this, (clazz.type === FyConst.TYPE_ARRAY) ? 1
				: 0);
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
	function classIsPrimitive(context, thread, ops) {
		var stack = thread.stack;
		var sb = thread.getCurrentStackBase();
		var clazz = context.getClassFromClassObject(stack[sb]);
		thread.nativeReturnInt(this,
				(clazz.type === FyConst.TYPE_PRIMITIVE) ? 1 : 0);
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
	function classIsInterface(context, thread, ops) {
		var stack = thread.stack;
		var sb = thread.getCurrentStackBase();
		var clazz = context.getClassFromClassObject(stack[sb]);
		thread.nativeReturnInt(this,
				(clazz.accessFlags & FyConst.FY_ACC_INTERFACE) ? 1 : 0);
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
	function classGetSuperclass(context, thread, ops) {
		var stack = thread.stack;
		var sb = thread.getCurrentStackBase();
		var clazz = context.getClassFromClassObject(stack[sb]).superClass;
		thread.nativeReturnInt(this, clazz === undefined ? 0 : context
				.getClassObjectHandle(clazz));
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
	function classGetInterfaces(context, thread, ops) {
		var stack = thread.stack;
		var sb = thread.getCurrentStackBase();
		var clazz = context.getClassFromClassObject(stack[sb]);
		var classArrayClazz = context.lookupClass("[L" + FyConst.FY_BASE_CLASS
				+ ";");
		stack[sb] = context.heap.allocateArray(classArrayClazz,
				clazz.interfaces.length);
		for ( var i = 0, max = clazz.interfaces.length; i < max; i++) {
			var intf = context.getClassObjectHandle(clazz.interfaces[i]);
			context.heap.putArrayInt(stack[sb], i, intf);
		}
		thread.nativeReturn(this, 1);
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
	function classGetNativeName(context, thread, ops) {
		var stack = thread.stack;
		var sb = thread.getCurrentStackBase();
		var clazz = context.getClassFromClassObject(stack[sb]);
		var ret = context.heap.allocate(context
				.lookupClass(FyConst.FY_BASE_STRING));
		thread.nativeReturnInt(this, ret);
		context.heap.fillString(ret, clazz.name);
		return ops - 1;
	}

	// TODO
	FyContext.registerStaticNH(FyConst.FY_BASE_CLASS + ".getNativeName.()L"
			+ FyConst.FY_BASE_STRING + ";", classGetNativeName);

	FyContext.registerStaticNH(FyConst.FY_BASE_CLASS + ".isPrimitive.()Z",
			classIsPrimitive);

	FyContext.registerStaticNH(FyConst.FY_BASE_CLASS + ".isInterface.()Z",
			classIsInterface);

})();