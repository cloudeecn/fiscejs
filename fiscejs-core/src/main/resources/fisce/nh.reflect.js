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

(function() {
	"use strict";
	/**
	 * <code>
	 #     #  #######  #######  #     #    ###    #####
	 ##   ##  #           #     #     #   #   #   #    #
	 # # # #  #           #     #     #  #     #  #     #
	 #  #  #  #####       #     #######  #     #  #     #
	 #     #  #           #     #     #  #     #  #     #
	 #     #  #           #     #     #   #   #   #    #
	 #     #  #######     #     #     #    ###    #####
	 */
	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {Number}
	 *            ops
	 */
	function methodIsBridge(context, thread, sp, ops) {
		var stack = thread.stack;

		var method = context.getMethodFromMethodObject(stack[sp]);
		if (method === undefined) {
			throw new FyException(FyConst.FY_EXCEPTION_INCOMPAT_CHANGE,
					"Method not found!");
		}
		thread.nativeReturnInt(sp,
				(FyConst.FY_ACC_BRIDGE & method.accessFlags) ? 1 : 0);
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
	function methodIsVarArgs(context, thread, sp, ops) {
		var stack = thread.stack;

		var method = context.getMethodFromMethodObject(stack[sp]);
		if (method === undefined) {
			throw new FyException(FyConst.FY_EXCEPTION_INCOMPAT_CHANGE,
					"Method not found!");
		}
		thread.nativeReturnInt(sp,
				(FyConst.FY_ACC_VARARGS & method.accessFlags) ? 1 : 0);
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
	function methodIsSynthetic(context, thread, sp, ops) {
		var stack = thread.stack;

		var method = context.getMethodFromMethodObject(stack[sp]);
		if (method === undefined) {
			throw new FyException(FyConst.FY_EXCEPTION_INCOMPAT_CHANGE,
					"Method not found!");
		}
		thread.nativeReturnInt(sp,
				(FyConst.FY_ACC_SYNTHETIC & method.accessFlags) ? 1 : 0);
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
	function methodGetDeclaringClass(context, thread, sp, ops) {
		var stack = thread.stack;

		var method = context.getMethodFromMethodObject(stack[sp]);
		if (method === undefined) {
			throw new FyException(FyConst.FY_EXCEPTION_INCOMPAT_CHANGE,
					"Method not found!");
		}
		thread.nativeReturnInt(sp, context.getClassObjectHandle(method.owner));
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
	function methodExceptionTypes(context, thread, sp, ops) {
		var stack = thread.stack;

		var method = context.getMethodFromMethodObject(stack[sp]);
		if (method === undefined) {
			throw new FyException(FyConst.FY_EXCEPTION_INCOMPAT_CHANGE,
					"Method not found!");
		}
		var max = method.exceptionTable.length;
		var handle = context.heap.allocateArray(
				context.lookupClass(FyClassLoader
						.getArrayName(FyConst.FY_BASE_CLASS)), max);
		stack[sp] = handle;
		for (var i = 0; i < max; i++) {
			var name = method.exceptions[i];
			context.heap.putArrayInt(handle, i, context
					.getClassObjectHandle(context.lookupClass(name)));
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
	function methodGetModifiers(context, thread, sp, ops) {
		var stack = thread.stack;

		var method = context.getMethodFromMethodObject(stack[sp]);
		if (method === undefined) {
			throw new FyException(FyConst.FY_EXCEPTION_INCOMPAT_CHANGE,
					"Method not found!");
		}
		thread.nativeReturnInt(sp, method.accessFlags);
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
	function methodGetName(context, thread, sp, ops) {
		var stack = thread.stack;

		var method = context.getMethodFromMethodObject(stack[sp]);
		if (method === undefined) {
			throw new FyException(FyConst.FY_EXCEPTION_INCOMPAT_CHANGE,
					"Method not found!");
		}
		thread.nativeReturnInt(sp, context.heap.literal(method.name));
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
	function methodGetParameterTypes(context, thread, sp, ops) {
		var stack = thread.stack;

		var method = context.getMethodFromMethodObject(stack[sp]);
		if (method === undefined) {
			throw new FyException(FyConst.FY_EXCEPTION_INCOMPAT_CHANGE,
					"Method not found!");
		}
		var max = method.parameterClassNames.length;
		var handle = context.heap.allocateArray(
				context.lookupClass(FyClassLoader
						.getArrayName(FyConst.FY_BASE_CLASS)), max);
		stack[sp] = handle;
		for (var i = 0; i < max; i++) {
			var name = method.parameterClassNames[i];
			context.heap.putArrayInt(handle, i, context
					.getClassObjectHandle(context.lookupClass(name)));
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
	function methodGetReturnType(context, thread, sp, ops) {
		var stack = thread.stack;

		var method = context.getMethodFromMethodObject(stack[sp]);
		if (method === undefined) {
			throw new FyException(FyConst.FY_EXCEPTION_INCOMPAT_CHANGE,
					"Method not found!");
		}
		thread.nativeReturnInt(sp, context.getClassObjectHandle(context
				.lookupClass(method.returnClassName)));
		return ops - 1;
	}

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {Number}
	 *            sp
	 * @param {Number}
	 *            ops
	 */
	function methodInvoke(context, thread, sp, ops) {
		/**
		 * @returns {FyHeap}
		 */
		var heap = context.heap;
		var stack = thread.stack;
		var paramsHandle = stack[sp + 2];
		var sb = sp;
		var method = context.getMethodFromMethodObject(stack[sp]);
		if (method === undefined) {
			throw new FyException(FyConst.FY_EXCEPTION_INCOMPAT_CHANGE,
					"Method not found!");
		}
		context.log(0, "###Invoke by reflection: " + method.uniqueName);
		var count = paramsHandle ? heap.arrayLength(paramsHandle) : 0;
		if (count !== method.parameterCount) {
			throw new FyException(FyConst.FY_EXCEPTION_INCOMPAT_CHANGE,
					"Method's params count changed");
		}
		// FIXME: stack overflow check
		// TODO optimize / cache class lookup
		if (method.accessFlags & FyConst.FY_ACC_STATIC) {
			var clinitClass = thread.clinit(method.owner);
			if (clinitClass !== undefined) {
				// invoke clinit
				if (clinitClass.clinitThreadId == 0) {
					// no thread is running it, so let this run
					clinitClass.clinitThreadId = thread.threadId;
					thread.rollbackCurrentIp();
					thread.pushFrame(clinitClass.clinit, sp + 3);
					return 0;
				} else {
					// wait for other thread clinit
					thread.rollbackCurrentIp();
					return 0;
				}
			}
		} else {
			stack[sp++] = stack[sb + 1];
		}
		for (var i = 0; i < count; i++) {
			var paramType = context.lookupClass(method.parameterClassNames[i]);
			var paramHandle = heap.getArrayInt(paramsHandle, i);
			if (paramType.type === FyConst.TYPE_PRIMITIVE) {
				// unwrap
				switch (paramType.pType) {
				case 90/* FyConst.Z */:
					heap.unwrapBooleanTo(paramHandle, sp++);
					break;
				case 66/* FyConst.B */:
					heap.unwrapByteTo(paramHandle, sp++);
					break;
				case 83/* FyConst.S */:
					heap.unwrapShortTo(paramHandle, sp++);
					break;
				case 67/* FyConst.C */:
					heap.unwrapCharTo(paramHandle, sp++);
					break;
				case 73/* FyConst.I */:
					heap.unwrapIntTo(paramHandle, sp++);
					break;
				case 70/* FyConst.F */:
					heap.unwrapFloatTo(paramHandle, sp++);
					break;
				case 74/* FyConst.J */:
					heap.unwrapLongTo(paramHandle, sp);
					sp += 2;
					break;
				case 68/* FyConst.D */:
					heap.unwrapDoubleTo(paramHandle, sp);
					sp += 2;
					break;
				default:
					throw new FyException(FyConst.FY_EXCEPTION_ARGU,
							"Illegal parameter type " + paramType.pType);
				}
			} else {
				stack[sp++] = paramHandle;
			}
		}
		if (method.accessFlags & FyConst.FY_ACC_STATIC) {
			return thread.invokeStatic(method, sp, ops - 1);
		} else {
			return thread.invokeVirtual(method, sp, ops - 1);
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
	function methodGetUniqueName(context, thread, sp, ops) {
		var stack = thread.stack;

		var method = context.getMethodFromMethodObject(stack[sp]);
		thread.nativeReturnInt(sp, context.heap.literal(method.uniqueName));
		return ops - 1;
	}

	(function() {
		FyContext.registerStaticNH(FyConst.FY_REFLECT_METHOD + ".isBridge.()Z",
				methodIsBridge);

		FyContext.registerStaticNH(
				FyConst.FY_REFLECT_METHOD + ".isVarArgs.()Z", methodIsVarArgs);

		FyContext.registerStaticNH(FyConst.FY_REFLECT_METHOD
				+ ".isSynthetic.()Z", methodIsSynthetic);

		FyContext.registerStaticNH(FyConst.FY_REFLECT_METHOD
				+ ".getDeclaringClass.()L" + FyConst.FY_BASE_CLASS + ";",
				methodGetDeclaringClass);

		FyContext.registerStaticNH(FyConst.FY_REFLECT_METHOD
				+ ".getExceptionTypes.()[L" + FyConst.FY_BASE_CLASS + ";",
				methodExceptionTypes);
		FyContext.registerStaticNH(FyConst.FY_REFLECT_METHOD
				+ ".getModifiers.()I", methodGetModifiers);
		FyContext.registerStaticNH(FyConst.FY_REFLECT_METHOD + ".getName.()L"
				+ FyConst.FY_BASE_STRING + ";", methodGetName);
		FyContext.registerStaticNH(FyConst.FY_REFLECT_METHOD
				+ ".getParameterTypes.()[L" + FyConst.FY_BASE_CLASS + ";",
				methodGetParameterTypes);
		FyContext.registerStaticNH(FyConst.FY_REFLECT_METHOD
				+ ".getReturnType.()L" + FyConst.FY_BASE_CLASS + ";",
				methodGetReturnType);
		FyContext.registerStaticNH(FyConst.FY_REFLECT_METHOD + ".invokeZ.(L"
				+ FyConst.FY_BASE_OBJECT + ";[L" + FyConst.FY_BASE_OBJECT
				+ ";)Z", methodInvoke);
		FyContext.registerStaticNH(FyConst.FY_REFLECT_METHOD + ".invokeB.(L"
				+ FyConst.FY_BASE_OBJECT + ";[L" + FyConst.FY_BASE_OBJECT
				+ ";)B", methodInvoke);
		FyContext.registerStaticNH(FyConst.FY_REFLECT_METHOD + ".invokeS.(L"
				+ FyConst.FY_BASE_OBJECT + ";[L" + FyConst.FY_BASE_OBJECT
				+ ";)S", methodInvoke);
		FyContext.registerStaticNH(FyConst.FY_REFLECT_METHOD + ".invokeC.(L"
				+ FyConst.FY_BASE_OBJECT + ";[L" + FyConst.FY_BASE_OBJECT
				+ ";)C", methodInvoke);
		FyContext.registerStaticNH(FyConst.FY_REFLECT_METHOD + ".invokeI.(L"
				+ FyConst.FY_BASE_OBJECT + ";[L" + FyConst.FY_BASE_OBJECT
				+ ";)I", methodInvoke);
		FyContext.registerStaticNH(FyConst.FY_REFLECT_METHOD + ".invokeF.(L"
				+ FyConst.FY_BASE_OBJECT + ";[L" + FyConst.FY_BASE_OBJECT
				+ ";)F", methodInvoke);
		FyContext.registerStaticNH(FyConst.FY_REFLECT_METHOD + ".invokeD.(L"
				+ FyConst.FY_BASE_OBJECT + ";[L" + FyConst.FY_BASE_OBJECT
				+ ";)D", methodInvoke);
		FyContext.registerStaticNH(FyConst.FY_REFLECT_METHOD + ".invokeJ.(L"
				+ FyConst.FY_BASE_OBJECT + ";[L" + FyConst.FY_BASE_OBJECT
				+ ";)J", methodInvoke);
		FyContext.registerStaticNH(FyConst.FY_REFLECT_METHOD + ".invokeL.(L"
				+ FyConst.FY_BASE_OBJECT + ";[L" + FyConst.FY_BASE_OBJECT
				+ ";)L" + FyConst.FY_BASE_OBJECT + ";", methodInvoke);
		FyContext.registerStaticNH(FyConst.FY_REFLECT_METHOD + ".invokeV.(L"
				+ FyConst.FY_BASE_OBJECT + ";[L" + FyConst.FY_BASE_OBJECT
				+ ";)V", methodInvoke);
		FyContext.registerStaticNH(FyConst.FY_REFLECT_METHOD
				+ ".getUniqueName.()L" + FyConst.FY_BASE_STRING + ";",
				methodGetUniqueName);
	})();

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {Number}
	 *            ops
	 */
	function constructorNewInstance(context, thread, sp, ops) {
		/**
		 * @returns {FyHeap}
		 */
		var heap = context.heap;
		var stack = thread.stack;
		var sb = sp;
		var paramsHandle = stack[sp + 1];
		var handle;
		var method = context.getMethodFromMethodObject(stack[sp]);
		if (method === undefined) {
			throw new FyException(FyConst.FY_EXCEPTION_INCOMPAT_CHANGE,
					"Method not found!");
		}
		if (method.accessFlags & FyConst.FY_ACC_STATIC) {
			throw new FyException(FyConst.FY_EXCEPTION_INCOMPAT_CHANGE,
					"Method is not a constructor");
		}

		var count = paramsHandle ? heap.arrayLength(paramsHandle) : 0;
		if (count !== method.parameterCount) {
			throw new FyException(FyConst.FY_EXCEPTION_INCOMPAT_CHANGE,
					"Method's params count changed");
		}

		handle = heap.allocate(method.owner);

		stack[sp++] = handle;
		stack[sp++] = handle;
		// FIXME: stack overflow check
		// TODO optimize / cache class lookup
		for (var i = 0; i < count; i++) {
			var paramType = context.lookupClass(method.parameterClassNames[i]);
			var paramHandle = heap.getArrayInt(paramsHandle, i);
			if (paramType.type === FyConst.TYPE_PRIMITIVE) {
				// unwrap
				switch (paramType.pType) {
				case 90 /* FyConst.Z */:
					heap.unwrapBooleanTo(paramHandle, sp++);
					break;
				case 66/* FyConst.B */:
					heap.unwrapByteTo(paramHandle, sp++);
					break;
				case 83/* FyConst.S */:
					heap.unwrapShortTo(paramHandle, sp++);
					break;
				case 67/* FyConst.C */:
					heap.unwrapCharTo(paramHandle, sp++);
					break;
				case 73/* FyConst.I */:
					heap.unwrapIntTo(paramHandle, sp++);
					break;
				case 70/* FyConst.F */:
					heap.unwrapFloatTo(paramHandle, sp++);
					break;
				case 74/* FyConst.J */:
					heap.unwrapLongTo(paramHandle, sp);
					sp += 2;
					break;
				case 68/* FyConst.D */:
					heap.unwrapDoubleTo(paramHandle, sp);
					sp += 2;
					break;
				default:
					throw new FyException(FyConst.FY_EXCEPTION_ARGU,
							"Illegal parameter type " + paramType.pType);
				}
			} else {
				stack[sp++] = paramHandle;
			}
		}
		return thread.invokeVirtual(method, sp, ops - 1);
	}

	(function() {
		FyContext.registerStaticNH(FyConst.FY_REFLECT_CONSTRUCTOR
				+ ".isBridge.()Z", methodIsBridge);

		FyContext.registerStaticNH(FyConst.FY_REFLECT_CONSTRUCTOR
				+ ".isVarArgs.()Z", methodIsVarArgs);

		FyContext.registerStaticNH(FyConst.FY_REFLECT_CONSTRUCTOR
				+ ".isSynthetic.()Z", methodIsSynthetic);

		FyContext.registerStaticNH(FyConst.FY_REFLECT_CONSTRUCTOR
				+ ".getDeclaringClass.()L" + FyConst.FY_BASE_CLASS + ";",
				methodGetDeclaringClass);

		FyContext.registerStaticNH(FyConst.FY_REFLECT_CONSTRUCTOR
				+ ".getExceptionTypes.()[L" + FyConst.FY_BASE_CLASS + ";",
				methodExceptionTypes);
		FyContext.registerStaticNH(FyConst.FY_REFLECT_CONSTRUCTOR
				+ ".getModifiers.()I", methodGetModifiers);
		FyContext.registerStaticNH(FyConst.FY_REFLECT_CONSTRUCTOR
				+ ".getName.()L" + FyConst.FY_BASE_STRING + ";", methodGetName);
		FyContext.registerStaticNH(FyConst.FY_REFLECT_CONSTRUCTOR
				+ ".getParameterTypes.()[L" + FyConst.FY_BASE_CLASS + ";",
				methodGetParameterTypes);
		FyContext.registerStaticNH(FyConst.FY_REFLECT_CONSTRUCTOR
				+ ".newInstance0.([L" + FyConst.FY_BASE_OBJECT + ";)L"
				+ FyConst.FY_BASE_OBJECT + ";", constructorNewInstance);
		FyContext.registerStaticNH(FyConst.FY_REFLECT_CONSTRUCTOR
				+ ".getUniqueName.()L" + FyConst.FY_BASE_STRING + ";",
				methodGetUniqueName);
	})();

	/**
	 * <code>
	 #######   #####   #######  #        #####
	 #           #     #        #        #    #
	 #           #     #        #        #     #
	 #####       #     #####    #        #     #
	 #           #     #        #        #     #
	 #           #     #        #        #    #
	 #         #####   #######  ######   #####
	 */

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {Number}
	 *            ops
	 */
	function fieldIsSynthetic(context, thread, sp, ops) {
		var stack = thread.stack;

		var field = context.getFieldFromFieldObject(stack[sp]);
		if (field === undefined) {
			throw new FyException(FyConst.FY_EXCEPTION_INCOMPAT_CHANGE,
					"Field not found!");
		}
		thread.nativeReturnInt(sp,
				(field.accessFlags & FyConst.FY_ACC_SYNTHETIC) ? 1 : 0);
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
	function fieldIsEnumConstant(context, thread, sp, ops) {
		var stack = thread.stack;

		var field = context.getFieldFromFieldObject(stack[sp]);
		if (field === undefined) {
			throw new FyException(FyConst.FY_EXCEPTION_INCOMPAT_CHANGE,
					"Field not found!");
		}
		thread.nativeReturnInt(sp,
				(field.accessFlags & FyConst.FY_ACC_ENUM) ? 1 : 0);
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
	function fieldGetObject(context, thread, sp, ops) {
		var heap = context.heap;
		var stack = thread.stack;

		var field = context.getFieldFromFieldObject(stack[sp]);
		if (field === undefined) {
			throw new FyException(FyConst.FY_EXCEPTION_INCOMPAT_CHANGE,
					"Field not found!");
		}
		if (field.type.type === FyConst.TYPE_PRIMITIVE) {
			throw new FyException(FyConst.FY_EXCEPTION_ARGU, "Field "
					+ field.uniqueName + " is not an object or array");
		}
		if (field.accessFlags & FyConst.FY_ACC_STATIC) {
			if ((field.accessFlags & FyConst.FY_ACC_FINAL)
					&& field.constantValueData) {
				// static final Field value in constant must be string
				thread.nativeReturnInt(sp, heap.literalWithConstant(
						field.owner.global, field.constantValueData));
			} else {
				thread.nativeReturnInt(sp, heap.getStaticRaw(field.owner,
						field.posAbs));
			}
		} else {
			var type = heap.getObjectClass(stack[sp + 1]);
			if (!context.classLoader.canCast(type, field.owner)) {
				throw new FyException(FyConst.FY_EXCEPTION_ARGU,
						"Can't cast from " + type.name + " to "
								+ field.owner.name);
			}
			thread.nativeReturnInt(sp, heap.getFieldRaw(stack[sp + 1],
					field.posAbs));
		}
		return ops - 1;
	}

	/**
	 * @param {String}
	 *            name
	 * @param {Number}
	 *            type
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {Number}
	 *            ops
	 */
	function getter(name, type, context, thread, sp, ops) {
		var heap = context.heap;
		var stack = thread.stack;

		var field = context.getFieldFromFieldObject(stack[sp]);
		if (field === undefined) {
			throw new FyException(FyConst.FY_EXCEPTION_INCOMPAT_CHANGE,
					"Field not found!");
		}
		if (field.type.type !== FyConst.TYPE_PRIMITIVE
				|| field.type.pType !== type) {
			throw new FyException(FyConst.FY_EXCEPTION_ARGU, "Field "
					+ field.uniqueName + " is not " + name + " typed");
		}
		if (field.accessFlags & FyConst.FY_ACC_STATIC) {
			heap.getStaticRaw32To(field.owner, field.posAbs, sp);
		} else {
			var type = heap.getObjectClass(stack[sp + 1]);
			if (!context.classLoader.canCast(type, field.owner)) {
				throw new FyException(FyConst.FY_EXCEPTION_ARGU,
						"Can't cast from " + type.name + " to "
								+ field.owner.name);
			}

			heap.getFieldRaw32To(stack[sp + 1], field.posAbs, sp);
		}
		return ops - 1;
	}
	/**
	 * 
	 * @param {String}
	 *            name
	 * @param {Number}
	 *            type
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {Number}
	 *            ops
	 */
	function getterW(name, type, context, thread, sp, ops) {
		var heap = context.heap;
		var stack = thread.stack;

		var field = context.getFieldFromFieldObject(stack[sp]);
		if (field === undefined) {
			throw new FyException(FyConst.FY_EXCEPTION_INCOMPAT_CHANGE,
					"Field not found!");
		}
		if (field.type.type !== FyConst.TYPE_PRIMITIVE
				|| field.type.pType !== type) {
			throw new FyException(FyConst.FY_EXCEPTION_ARGU, "Field "
					+ field.uniqueName + " is not " + name + " typed");
		}
		if (field.accessFlags & FyConst.FY_ACC_STATIC) {
			heap.getStaticRaw64To(field.owner, field.posAbs, sp);

		} else {
			var type = heap.getObjectClass(stack[sp + 1]);
			if (!context.classLoader.canCast(type, field.owner)) {
				throw new FyException(FyConst.FY_EXCEPTION_ARGU,
						"Can't cast from " + type.name + " to "
								+ field.owner.name);
			}
			heap.getFieldRaw64To(stack[sp + 1], field.posAbs, sp);

		}
		return ops - 1;
	}

	var fieldGetBoolean = getter.bind(undefined, "boolean", FyConst.Z);
	var fieldGetByte = getter.bind(undefined, "byte", FyConst.B);
	var fieldGetShort = getter.bind(undefined, "short", FyConst.S);
	var fieldGetChar = getter.bind(undefined, "char", FyConst.C);
	var fieldGetInt = getter.bind(undefined, "int", FyConst.I);
	var fieldGetFloat = getter.bind(undefined, "float", FyConst.F);
	var fieldGetLong = getterW.bind(undefined, "long", FyConst.J);
	var fieldGetDouble = getterW.bind(undefined, "double", FyConst.D);

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {Number}
	 *            ops
	 */
	function fieldGetModifiers(context, thread, sp, ops) {
		var stack = thread.stack;

		var field = context.getFieldFromFieldObject(stack[sp]);
		if (field === undefined) {
			throw new FyException(FyConst.FY_EXCEPTION_INCOMPAT_CHANGE,
					"Field not found!");
		}
		thread.nativeReturnInt(sp, field.accessFlags);
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
	function fieldGetName(context, thread, sp, ops) {
		var heap = context.heap;
		var stack = thread.stack;

		var field = context.getFieldFromFieldObject(stack[sp]);
		if (field === undefined) {
			throw new FyException(FyConst.FY_EXCEPTION_INCOMPAT_CHANGE,
					"Field not found!");
		}
		thread.nativeReturnInt(sp, heap.literal(field.name));
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
	function fieldGetType(context, thread, sp, ops) {
		var stack = thread.stack;

		var field = context.getFieldFromFieldObject(stack[sp]);
		if (field === undefined) {
			throw new FyException(FyConst.FY_EXCEPTION_INCOMPAT_CHANGE,
					"Field not found!");
		}
		thread.nativeReturnInt(sp, context.getClassObjectHandle(field.type));
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
	function fieldGetDeclaringClass(context, thread, sp, ops) {
		var stack = thread.stack;

		var field = context.getFieldFromFieldObject(stack[sp]);
		if (field === undefined) {
			throw new FyException(FyConst.FY_EXCEPTION_INCOMPAT_CHANGE,
					"Field not found!");
		}
		thread.nativeReturnInt(sp, context.getClassObjectHandle(field.owner));
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
	function fieldSetObject(context, thread, sp, ops) {
		var heap = context.heap;
		var stack = thread.stack;

		var field = context.getFieldFromFieldObject(stack[sp]);
		if (field === undefined) {
			throw new FyException(FyConst.FY_EXCEPTION_INCOMPAT_CHANGE,
					"Field not found!");
		}
		if (field.type.type === FyConst.TYPE_PRIMITIVE) {
			throw new FyException(FyConst.FY_EXCEPTION_INCOMPAT_CHANGE,
					"Field " + field.uniqueName + " is primitive");
		}
		if (field.accessFlags & FyConst.FY_ACC_STATIC) {
			heap.putStaticInt(field.type, field.posAbs, stack[sp + 2]);
		} else {
			heap.putFieldInt(stack[sp + 1], field.posAbs, stack[sp + 2]);
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
	function fieldSetPrim(context, thread, sp, ops) {
		var heap = context.heap;
		var stack = thread.stack;

		var field = context.getFieldFromFieldObject(stack[sp]);
		if (field === undefined) {
			throw new FyException(FyConst.FY_EXCEPTION_INCOMPAT_CHANGE,
					"Field not found!");
		}
		if (field.type.type !== FyConst.TYPE_PRIMITIVE) {
			throw new FyException(FyConst.FY_EXCEPTION_INCOMPAT_CHANGE,
					"Field " + field.uniqueName + " is primitive");
		}
		if (field.accessFlags & FyConst.FY_ACC_STATIC) {
			heap.putStaticRaw32From(field.owner, field.posAbs, sp + 2);
		} else {
			heap.putFieldRaw32From(stack[sp + 1], field.posAbs, sp + 2);
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
	function fieldSetWidePrim(context, thread, sp, ops) {
		var heap = context.heap;
		var stack = thread.stack;

		var field = context.getFieldFromFieldObject(stack[sp]);
		if (field === undefined) {
			throw new FyException(FyConst.FY_EXCEPTION_INCOMPAT_CHANGE,
					"Field not found!");
		}
		if (field.type.type !== FyConst.TYPE_PRIMITIVE) {
			throw new FyException(FyConst.FY_EXCEPTION_INCOMPAT_CHANGE,
					"Field " + field.uniqueName + " is primitive");
		}

		if (field.accessFlags & FyConst.FY_ACC_STATIC) {
			heap.putStaticRaw64From(field.owner, field.posAbs, sp + 2);
		} else {
			heap.putFieldRaw64From(stack[sp + 1], field.posAbs, sp + 2);
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
	function fieldGetUniqueName(context, thread, sp, ops) {
		var heap = context.heap;
		var stack = thread.stack;

		var field = context.getFieldFromFieldObject(stack[sp]);
		thread.nativeReturnInt(sp, heap.literal(field.uniqueName));
		return ops - 1;
	}

	(function() {
		FyContext.registerStaticNH(FyConst.FY_REFLECT_FIELD + ".getName.()L"
				+ FyConst.FY_BASE_STRING + ";", fieldGetName);
		FyContext.registerStaticNH(FyConst.FY_REFLECT_FIELD
				+ ".getUniqueName.()L" + FyConst.FY_BASE_STRING + ";",
				fieldGetUniqueName);
		FyContext.registerStaticNH(FyConst.FY_REFLECT_FIELD
				+ ".isSynthetic.()Z", fieldIsSynthetic);
		FyContext.registerStaticNH(FyConst.FY_REFLECT_FIELD
				+ ".isEnumConstant.()Z", fieldIsEnumConstant);
		FyContext.registerStaticNH(FyConst.FY_REFLECT_FIELD
				+ ".getModifiers.()I", fieldGetModifiers);
		FyContext.registerStaticNH(FyConst.FY_REFLECT_FIELD
				+ ".getDeclaringClass.()L" + FyConst.FY_BASE_CLASS + ";",
				fieldGetDeclaringClass);
		FyContext.registerStaticNH(FyConst.FY_REFLECT_FIELD + ".getType.()L"
				+ FyConst.FY_BASE_CLASS + ";", fieldGetType);
		FyContext.registerStaticNH(
				FyConst.FY_REFLECT_FIELD + ".getObject0.(L"
						+ FyConst.FY_BASE_OBJECT + ";)L"
						+ FyConst.FY_BASE_OBJECT + ";", fieldGetObject);
		FyContext.registerStaticNH(FyConst.FY_REFLECT_FIELD + ".getBoolean0.(L"
				+ FyConst.FY_BASE_OBJECT + ";)Z", fieldGetBoolean);
		FyContext.registerStaticNH(FyConst.FY_REFLECT_FIELD + ".getByte0.(L"
				+ FyConst.FY_BASE_OBJECT + ";)B", fieldGetByte);
		FyContext.registerStaticNH(FyConst.FY_REFLECT_FIELD + ".getShort0.(L"
				+ FyConst.FY_BASE_OBJECT + ";)S", fieldGetShort);
		FyContext.registerStaticNH(FyConst.FY_REFLECT_FIELD + ".getChar0.(L"
				+ FyConst.FY_BASE_OBJECT + ";)C", fieldGetChar);
		FyContext.registerStaticNH(FyConst.FY_REFLECT_FIELD + ".getInt0.(L"
				+ FyConst.FY_BASE_OBJECT + ";)I", fieldGetInt);
		FyContext.registerStaticNH(FyConst.FY_REFLECT_FIELD + ".getFloat0.(L"
				+ FyConst.FY_BASE_OBJECT + ";)F", fieldGetFloat);
		FyContext.registerStaticNH(FyConst.FY_REFLECT_FIELD + ".getLong0.(L"
				+ FyConst.FY_BASE_OBJECT + ";)J", fieldGetLong);
		FyContext.registerStaticNH(FyConst.FY_REFLECT_FIELD + ".getDouble0.(L"
				+ FyConst.FY_BASE_OBJECT + ";)D", fieldGetDouble);
		FyContext.registerStaticNH(FyConst.FY_REFLECT_FIELD + ".setObject.(L"
				+ FyConst.FY_BASE_OBJECT + ";L" + FyConst.FY_BASE_OBJECT
				+ ";)V", fieldSetObject);
		FyContext.registerStaticNH(FyConst.FY_REFLECT_FIELD + ".setBoolean.(L"
				+ FyConst.FY_BASE_OBJECT + ";Z)V", fieldSetPrim);
		FyContext.registerStaticNH(FyConst.FY_REFLECT_FIELD + ".setByte.(L"
				+ FyConst.FY_BASE_OBJECT + ";B)V", fieldSetPrim);
		FyContext.registerStaticNH(FyConst.FY_REFLECT_FIELD + ".setShort.(L"
				+ FyConst.FY_BASE_OBJECT + ";S)V", fieldSetPrim);
		FyContext.registerStaticNH(FyConst.FY_REFLECT_FIELD + ".setChar.(L"
				+ FyConst.FY_BASE_OBJECT + ";C)V", fieldSetPrim);
		FyContext.registerStaticNH(FyConst.FY_REFLECT_FIELD + ".setInt.(L"
				+ FyConst.FY_BASE_OBJECT + ";I)V", fieldSetPrim);
		FyContext.registerStaticNH(FyConst.FY_REFLECT_FIELD + ".setFloat.(L"
				+ FyConst.FY_BASE_OBJECT + ";F)V", fieldSetPrim);
		FyContext.registerStaticNH(FyConst.FY_REFLECT_FIELD + ".setLong.(L"
				+ FyConst.FY_BASE_OBJECT + ";J)V", fieldSetWidePrim);
		FyContext.registerStaticNH(FyConst.FY_REFLECT_FIELD + ".setDouble.(L"
				+ FyConst.FY_BASE_OBJECT + ";D)V", fieldSetWidePrim);
	})();

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {Number}
	 *            ops
	 */
	function classPrivateGetDeclaredMethods(context, thread, sp, ops) {
		var stack = thread.stack;

		var clazz = context.getClassFromClassObject(stack[sp]);
		var heap = context.heap;
		var count = clazz.methods.length;
		var handle = stack[sp] = heap.allocateArray(
				context.lookupClass(FyClassLoader
						.getArrayName(FyConst.FY_BASE_OBJECT)), count);
		for (var i = 0; i < count; i++) {
			heap.putArrayInt(handle, i, context
					.getMethodObjectHandle(clazz.methods[i]));
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
	function classPrivateGetDeclaredFields(context, thread, sp, ops) {
		var stack = thread.stack;

		var clazz = context.getClassFromClassObject(stack[sp]);
		var heap = context.heap;
		var count = clazz.fields.length;
		var handle = stack[sp] = heap.allocateArray(
				context.lookupClass(FyClassLoader
						.getArrayName(FyConst.FY_BASE_OBJECT)), count);
		for (var i = 0; i < count; i++) {
			heap.putArrayInt(handle, i, context
					.getFieldObjectHandle(clazz.fields[i]));
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
	function classGetComponentType(context, thread, sp, ops) {
		var stack = thread.stack;

		var clazz = context.getClassFromClassObject(stack[sp]);
		if (clazz.type === FyConst.TYPE_ARRAY) {
			thread.nativeReturnInt(sp, context
					.getClassObjectHandle(clazz.contentClass));
		} else {
			thread.nativeReturnInt(sp, 0);
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
	function classForName(context, thread, sp, ops) {
		var stack = thread.stack;

		var name = context.heap.getString(stack[sp]).replace(/\./g, "/");
		var clazz = context.lookupClass(name);
		thread.nativeReturnInt(sp, context.getClassObjectHandle(clazz));
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
	function classNewInstanceA(context, thread, sp, ops) {
		var stack = thread.stack;

		var clazz = context.getClassFromClassObject(stack[sp]);
		thread.nativeReturnInt(sp, context.heap.allocateArray(clazz,
				stack[sp + 1]));
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
	function classNewInstanceO(context, thread, sp, ops) {
		var stack = thread.stack;

		var clazz = context.getClassFromClassObject(stack[sp]);
		var handle = context.heap.allocate(clazz);
		thread.nativeReturnInt(sp, handle);
		thread.nativeReturnInt(sp + 1, handle);
		return thread.invokeVirtual(context.lookupMethodVirtual(clazz,
				FyConst.FY_METHODF_INIT), sp + 2, ops);
		// return thread.pushMethod(context.lookupMethodVirtual(clazz,
		// FyConst.FY_METHODF_INIT), ops);
	}

	/**
	 * @param {FyContext}
	 *            context
	 * @param {FyThread}
	 *            thread
	 * @param {Number}
	 *            ops
	 */
	function classIsInstance(context, thread, sp, ops) {
		var stack = thread.stack;

		var clazz = context.getClassFromClassObject(stack[sp]);
		var objClazz = context.heap.getObjectClass(stack[sp + 1]);
		thread.nativeReturnInt(sp,
				context.classLoader.canCast(objClazz, clazz) ? 1 : 0);
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
	function classIsAssignableFrom(context, thread, sp, ops) {
		var stack = thread.stack;

		var clazz = context.getClassFromClassObject(stack[sp]);
		var targetClazz = context.getClassFromClassObject(stack[sp + 1]);
		thread.nativeReturnInt(sp, context.classLoader.canCast(targetClazz,
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
	function classIsArray(context, thread, sp, ops) {
		var stack = thread.stack;

		var clazz = context.getClassFromClassObject(stack[sp]);
		thread.nativeReturnInt(sp, (clazz.type === FyConst.TYPE_ARRAY) ? 1 : 0);
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
	function classIsPrimitive(context, thread, sp, ops) {
		var stack = thread.stack;

		var clazz = context.getClassFromClassObject(stack[sp]);
		thread.nativeReturnInt(sp, (clazz.type === FyConst.TYPE_PRIMITIVE) ? 1
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
	function classIsInterface(context, thread, sp, ops) {
		var stack = thread.stack;

		var clazz = context.getClassFromClassObject(stack[sp]);
		thread.nativeReturnInt(sp,
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
	function classGetSuperclass(context, thread, sp, ops) {
		var stack = thread.stack;

		var clazz = context.getClassFromClassObject(stack[sp]).superClass;
		thread.nativeReturnInt(sp, clazz === undefined ? 0 : context
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
	function classGetInterfaces(context, thread, sp, ops) {
		var stack = thread.stack;

		var clazz = context.getClassFromClassObject(stack[sp]);
		var classArrayClazz = context.lookupClass("[L" + FyConst.FY_BASE_CLASS
				+ ";");
		stack[sp] = context.heap.allocateArray(classArrayClazz,
				clazz.interfaces.length);
		for (var i = 0, max = clazz.interfaces.length; i < max; i++) {
			var intf = context.getClassObjectHandle(clazz.interfaces[i]);
			context.heap.putArrayInt(stack[sp], i, intf);
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
	function classGetNativeName(context, thread, sp, ops) {
		var stack = thread.stack;

		var clazz = context.getClassFromClassObject(stack[sp]);
		var ret = context.heap.allocate(context
				.lookupClass(FyConst.FY_BASE_STRING));
		thread.nativeReturnInt(sp, ret);
		context.heap.fillString(ret, clazz.name);
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
	function classGetModifiers(context, thread, sp, ops) {
		var stack = thread.stack;

		var clazz = context.getClassFromClassObject(stack[sp]);
		thread.nativeReturnInt(sp, clazz.accessFlags);
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
	function classIsEnum(context, thread, sp, ops) {
		var stack = thread.stack;

		var clazz = context.getClassFromClassObject(stack[sp]);
		thread.nativeReturnInt(sp,
				(clazz.accessFlags & FyConst.FY_ACC_ENUM) ? 1 : 0);
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
	function arrayNewInstance(context, thread, sp, ops) {
		var stack = thread.stack;

		var clazz = context.getClassFromClassObject(stack[sp]);
		var heap = context.heap;
		var name = clazz.name;
		var len = heap.arrayLength(stack[sp + 1]);
		var sizes = new Array(len);
		for (var i = 0; i < len; i++) {
			name = FyClassLoader.getArrayName(name);
			sizes[i] = heap.getArrayInt(stack[sp + 1], i);
		}
		// context.lookupArrayClass(clazz) is wrong here...
		thread.nativeReturnInt(sp, heap.multiNewArray(
				context.lookupClass(name), len, sizes, 0));
		return ops - 5;
	}

	(function() {
		FyContext.registerStaticNH(FyConst.FY_BASE_CLASS + ".isEnum.()Z",
				classIsEnum);
		FyContext.registerStaticNH(FyConst.FY_BASE_CLASS + ".getModifiers.()I",
				classGetModifiers);
		FyContext.registerStaticNH(FyConst.FY_BASE_CLASS + ".getNativeName.()L"
				+ FyConst.FY_BASE_STRING + ";", classGetNativeName);
		FyContext.registerStaticNH(FyConst.FY_BASE_CLASS
				+ ".getPrivateDeclaredMethods0.()[L" + FyConst.FY_BASE_OBJECT
				+ ";", classPrivateGetDeclaredMethods);
		FyContext.registerStaticNH(FyConst.FY_BASE_CLASS
				+ ".getPrivateDeclaredFields0.()[L" + FyConst.FY_BASE_OBJECT
				+ ";", classPrivateGetDeclaredFields);
		FyContext.registerStaticNH(FyConst.FY_BASE_CLASS
				+ ".getComponentType.()L" + FyConst.FY_BASE_CLASS + ";",
				classGetComponentType);
		FyContext.registerStaticNH(
				FyConst.FY_BASE_CLASS + ".forName0.(L" + FyConst.FY_BASE_STRING
						+ ";Z)L" + FyConst.FY_BASE_CLASS + ";", classForName);
		FyContext.registerStaticNH(FyConst.FY_BASE_CLASS + ".newInstance0.()L"
				+ FyConst.FY_BASE_OBJECT + ";", classNewInstanceO);
		FyContext.registerStaticNH(FyConst.FY_BASE_CLASS + ".isInstance.(L"
				+ FyConst.FY_BASE_OBJECT + ";)Z", classIsInstance);
		FyContext.registerStaticNH(FyConst.FY_BASE_CLASS
				+ ".isAssignableFrom.(L" + FyConst.FY_BASE_CLASS + ";)Z",
				classIsAssignableFrom);
		FyContext.registerStaticNH(FyConst.FY_BASE_CLASS + ".isInterface.()Z",
				classIsInterface);
		FyContext.registerStaticNH(FyConst.FY_BASE_CLASS + ".isArray.()Z",
				classIsArray);
		FyContext.registerStaticNH(FyConst.FY_BASE_CLASS + ".isPrimitive.()Z",
				classIsPrimitive);
		FyContext.registerStaticNH(FyConst.FY_BASE_CLASS + ".getSuperclass.()L"
				+ FyConst.FY_BASE_CLASS + ";", classGetSuperclass);
		FyContext.registerStaticNH(FyConst.FY_BASE_CLASS
				+ ".getInterfaces.()[L" + FyConst.FY_BASE_CLASS + ";",
				classGetInterfaces);
		FyContext.registerStaticNH(FyConst.FY_REFLECT_ARRAY + ".newInstance.(L"
				+ FyConst.FY_BASE_CLASS + ";[I)L" + FyConst.FY_BASE_OBJECT
				+ ";", arrayNewInstance);
	})();
})();