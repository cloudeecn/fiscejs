(function() {
	/*
	 * # # ####### ####### # # ### ##### ## ## # # # # # # # # # # # # # # # # # # # # # # #
	 * ##### # ####### # # # # # # # # # # # # # # # # # # # # # # # # # #
	 * ####### # # # ### #####
	 */
	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {Number}
	 *            ops
	 */
	function methodIsBridge(context, thread, ops) {
		var stack = thread.stack;
		var sb = thread.getCurrentStackBase();
		var method = context.getMethodFromMethodObject(stack[sb]);
		if (method === undefined) {
			throw new FyException(FyConst.FY_EXCEPTION_INCOMPAT_CHANGE,
					"Method not found!");
		}
		thread.nativeReturnInt((FyConst.FY_ACC_BRIDGE & method.accessFlags) ? 1
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
	function methodIsVarArgs(context, thread, ops) {
		var stack = thread.stack;
		var sb = thread.getCurrentStackBase();
		var method = context.getMethodFromMethodObject(stack[sb]);
		if (method === undefined) {
			throw new FyException(FyConst.FY_EXCEPTION_INCOMPAT_CHANGE,
					"Method not found!");
		}
		thread
				.nativeReturnInt((FyConst.FY_ACC_VARARGS & method.accessFlags) ? 1
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
	function methodIsSynthetic(context, thread, ops) {
		var stack = thread.stack;
		var sb = thread.getCurrentStackBase();
		var method = context.getMethodFromMethodObject(stack[sb]);
		if (method === undefined) {
			throw new FyException(FyConst.FY_EXCEPTION_INCOMPAT_CHANGE,
					"Method not found!");
		}
		thread
				.nativeReturnInt((FyConst.FY_ACC_SYNTHETIC & method.accessFlags) ? 1
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
	function methodGetDeclaringClass(context, thread, ops) {
		var stack = thread.stack;
		var sb = thread.getCurrentStackBase();
		var method = context.getMethodFromMethodObject(stack[sb]);
		if (method === undefined) {
			throw new FyException(FyConst.FY_EXCEPTION_INCOMPAT_CHANGE,
					"Method not found!");
		}
		thread.nativeReturnInt(context.getClassObjectHandle(method.owner));
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
	function methodExceptionTypes(context, thread, ops) {
		var stack = thread.stack;
		var sb = thread.getCurrentStackBase();
		var method = context.getMethodFromMethodObject(stack[sb]);
		if (method === undefined) {
			throw new FyException(FyConst.FY_EXCEPTION_INCOMPAT_CHANGE,
					"Method not found!");
		}
		var max = method.exceptionTable.length;
		var handle = context.heap.allocateArray(
				context.lookupClass(FyClassLoader
						.getArrayName(FyConst.FY_BASE_CLASS)), max);
		stack[sb] = handle;
		for ( var i = 0; i < max; i++) {
			var name = method.exceptions[i];
			context.heap.putArrayInt(handle, i, context
					.getClassObjectHandle(context.lookupClass(name)));
		}
		thread.nativeReturn(1);
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
	function methodGetModifiers(context, thread, ops) {
		var stack = thread.stack;
		var sb = thread.getCurrentStackBase();
		var method = context.getMethodFromMethodObject(stack[sb]);
		if (method === undefined) {
			throw new FyException(FyConst.FY_EXCEPTION_INCOMPAT_CHANGE,
					"Method not found!");
		}
		thread.nativeReturnInt(method.accessFlags);
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
	function methodGetName(context, thread, ops) {
		var stack = thread.stack;
		var sb = thread.getCurrentStackBase();
		var method = context.getMethodFromMethodObject(stack[sb]);
		if (method === undefined) {
			throw new FyException(FyConst.FY_EXCEPTION_INCOMPAT_CHANGE,
					"Method not found!");
		}
		thread.nativeReturnInt(context.heap.literal(method.name));
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
	function methodGetParameterTypes(context, thread, ops) {
		var stack = thread.stack;
		var sb = thread.getCurrentStackBase();
		var method = context.getMethodFromMethodObject(stack[sb]);
		if (method === undefined) {
			throw new FyException(FyConst.FY_EXCEPTION_INCOMPAT_CHANGE,
					"Method not found!");
		}
		var max = method.parameterClassNames.length;
		var handle = context.heap.allocateArray(
				context.lookupClass(FyClassLoader
						.getArrayName(FyConst.FY_BASE_CLASS)), max);
		stack[sb] = handle;
		for ( var i = 0; i < max; i++) {
			var name = method.parameterClassNames[i];
			context.heap.putArrayInt(handle, i, context
					.getClassObjectHandle(context.lookupClass(name)));
		}
		thread.nativeReturn(1);
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
	function methodGetReturnType(context, thread, ops) {
		var stack = thread.stack;
		var sb = thread.getCurrentStackBase();
		var method = context.getMethodFromMethodObject(stack[sb]);
		if (method === undefined) {
			throw new FyException(FyConst.FY_EXCEPTION_INCOMPAT_CHANGE,
					"Method not found!");
		}
		thread.nativeReturnInt(context.getClassObjectHandle(context
				.lookupClass(method.returnClassName)));
	}

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {Number}
	 *            ops
	 */
	function methodInvoke(context, thread, ops) {
		/**
		 * @returns {FyHeap}
		 */
		var heap = context.heap;
		var stack = thread.stack;
		var sb = thread.getCurrentStackBase();
		var sp = sb;
		var paramsHandle = stack[sb + 2];
		var method = context.getMethodFromMethodObject(stack[sb]);
		if (method === undefined) {
			throw new FyException(FyConst.FY_EXCEPTION_INCOMPAT_CHANGE,
					"Method not found!");
		}
		var count = paramsHandle ? heap.arrayLength(paramsHandle) : 0;
		if (count !== method.parameterCount) {
			throw new FyException(FyConst.FY_EXCEPTION_INCOMPAT_CHANGE,
					"Method's params count changed");
		}
		// FIXME: stack overflow check
		// TODO optimize / cache class lookup
		if (!(method.accessFlags & FyConst.FY_ACC_STATIC)) {
			stack[sp++] = stack[sb + 1];
		}
		for ( var i = 0; i < count; i++) {
			var paramType = context.lookupClass(method.parameterClassNames[i]);
			var paramHandle = heap.getArrayInt(paramsHandle, i);
			if (paramType.type === FyConst.TYPE_PRIMITIVE) {
				// unwrap
				switch (paramType.pType) {
				case FyConst.Z:
					stack[sp++] = heap.unwrapBoolean(paramHandle);
					break;
				case FyConst.B:
					stack[sp++] = heap.unwrapByte(paramHandle);
				case FyConst.S:
					stack[sp++] = heap.unwrapShort(paramHandle);
				case FyConst.C:
					stack[sp++] = heap.unwrapChar(paramHandle);
				case FyConst.I:
					stack[sp++] = heap.unwrapInt(paramHandle);
				case FyConst.F:
					stack[sp++] = heap.unwrapFloatRaw(paramHandle);
				case FyConst.J:
					heap.unwrapLong(paramHandle, stack, sp);
					sp += 2;
				case FyConst.D:
					heap.unwrapDoubleRaw(paramHandle, stack, sp);
					sp += 2;
				default:
					throw new FyException(FyConst.FY_EXCEPTION_ARGU,
							"Illegal parameter type " + paramType.pType);
				}
			} else {
				stack[sp++] = paramHandle;
			}
		}
	}

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
		thread
				.nativeReturnInt(context.heap.allocateArray(clazz,
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
		thread.nativeReturnInt(handle);
		stack[thread.sp++] = handle;
		return thread.pushMethod(context.lookupMethodVirtual(clazz,
				FyConst.FY_METHOD_INIT + ".()V"), ops);
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
		thread.nativeReturnInt(context.classLoader.canCast(objClazz, clazz) ? 1
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
	function classIsAssignableFrom(context, thread, ops) {
		var stack = thread.stack;
		var sb = thread.getCurrentStackBase();
		var clazz = context.getClassFromClassObject(stack[sb]);
		var targetClazz = context.getClassFromClassObject(stack[sb + 1]);
		thread
				.nativeReturnInt(context.classLoader
						.canCast(targetClazz, clazz) ? 1 : 0);
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
		thread.nativeReturnInt((clazz.type === FyConst.TYPE_ARRAY) ? 1 : 0);
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
		thread.nativeReturnInt((clazz.type === FyConst.TYPE_PRIMITIVE) ? 1 : 0);
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
		thread
				.nativeReturnInt((clazz.accessFlags & FyConst.FY_ACC_INTERFACE) ? 1
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
	function classGetSuperclass(context, thread, ops) {
		var stack = thread.stack;
		var sb = thread.getCurrentStackBase();
		var clazz = context.getClassFromClassObject(stack[sb]).superClass;
		thread.nativeReturnInt(clazz === undefined ? 0 : context
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
		thread.nativeReturn(1);
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
		thread.nativeReturnInt(ret);
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