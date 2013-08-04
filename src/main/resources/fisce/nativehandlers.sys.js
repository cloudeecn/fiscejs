var registerCoreHandlers;
(function() {
	"use strict";
	
	var coreHandlers={};

	coreHandlers[
			"com/cirnoworks/fisce/privat/SystemInputStream.read0.()I"]=function(context,thread,ops){
		thread.stack[thread.sp++]=0;
		return ops;
	};
	

	coreHandlers[ FyConst.FY_BASE_DOUBLE+".longBitsToDouble.(J)D"]=function(context,thread,ops){
		thread.sp+=2;
	};
	

	coreHandlers[ FyConst.FY_BASE_FLOAT+".intBitsToFloat.(I)F"]=function(context,thread,ops){
		thread.sp++;
	};

	

	/* vm */
	coreHandlers[
			FyConst.FY_BASE_VM+".newInstance0.(L"+FyConst.FY_BASE_CLASS+";I)[L"+FyConst.FY_BASE_OBJECT+";"]=function(context,thread,ops){
	};
			NULL, classNewInstanceA, exception);
	
	coreHandlers[
			FyConst.FY_BASE_VM".newInstance0.(L"FyConst.FY_BASE_CLASS";[L"FyConst.FY_BASE_CLASS";[L"FyConst.FY_BASE_OBJECT";)L"FyConst.FY_BASE_OBJECT";",
			NULL, vmNewInstance, exception);
	
	coreHandlers[
			FyConst.FY_BASE_VM".newArray0.(L"FyConst.FY_BASE_CLASS";I)[L"FyConst.FY_BASE_OBJECT";",
			NULL, vmNewArray, exception);
	
	/* String */
	coreHandlers[
			FyConst.FY_BASE_STRING".intern.()L"FyConst.FY_BASE_STRING";", NULL, StringIntern,
			exception);
	

	/* Runtime */
	coreHandlers[ FyConst.FY_BASE_RUNTIME".freeMemory.()J", NULL,
			RuntimeFreeMemory, exception);
	
	coreHandlers[ FyConst.FY_BASE_RUNTIME".totalMemory.()J", NULL,
			RuntimeTotalMemory, exception);
	
	coreHandlers[ FyConst.FY_BASE_RUNTIME".maxMemory.()J", NULL,
			RuntimeMaxMemory, exception);
	
	/* System */
	coreHandlers[
			FyConst.FY_BASE_SYSTEM".setIn0.(L"FyConst.FY_IO_INPUTSTREAM";)V", NULL, SystemSetIn,
			exception);
	
	coreHandlers[
			FyConst.FY_BASE_SYSTEM".setOut0.(L"FyConst.FY_IO_PRINTSTREAM";)V", NULL,
			SystemSetOut, exception);
	
	coreHandlers[
			FyConst.FY_BASE_SYSTEM".setErr0.(L"FyConst.FY_IO_PRINTSTREAM";)V", NULL,
			SystemSetErr, exception);
	
	coreHandlers[
			FyConst.FY_BASE_SYSTEM".setProperty0.(L"FyConst.FY_BASE_STRING";L"FyConst.FY_BASE_STRING";)L"FyConst.FY_BASE_STRING";",
			NULL, SystemSetProperty, exception);
	
	coreHandlers[
			FyConst.FY_BASE_SYSTEM".getProperty0.(L"FyConst.FY_BASE_STRING";)L"FyConst.FY_BASE_STRING";",
			NULL, SystemGetProperty, exception);
	
	coreHandlers[
			FyConst.FY_BASE_SYSTEM".arraycopy.(L"FyConst.FY_BASE_OBJECT";IL"FyConst.FY_BASE_OBJECT";II)V",
			NULL, SystemArrayCopy, exception);
	
	coreHandlers[ FyConst.FY_BASE_SYSTEM".currentTimeMillis.()J",
			NULL, SystemTimeMS, exception);
	
	coreHandlers[ FyConst.FY_BASE_SYSTEM".nanoTime.()J", NULL,
			SystemTimeNS, exception);
	
	coreHandlers[
			FyConst.FY_BASE_SYSTEM".identityHashCode.(L"FyConst.FY_BASE_OBJECT";)I", NULL,
			SystemIdentityHashCode, exception);
	
	coreHandlers[ FyConst.FY_BASE_SYSTEM".gc.()V", NULL, SystemGC,
			exception);
	
	coreHandlers[ FyConst.FY_BASE_SYSTEM".exit.(I)V", NULL,
			SystemExit, exception);
	

	registerClasses(context, exception);
	

	/* Object */
	coreHandlers[
			FyConst.FY_BASE_OBJECT".clone.()L"FyConst.FY_BASE_OBJECT";", NULL, ObjectClone,
			exception);
	coreHandlers[
			FyConst.FY_BASE_OBJECT".getClass.()L"FyConst.FY_BASE_CLASS";", NULL, ObjectGetClass,
			exception);
	
	coreHandlers[ FyConst.FY_BASE_OBJECT".wait.(J)V", NULL,
			ObjectWait, exception);
	
	coreHandlers[ FyConst.FY_BASE_OBJECT".notify.()V", NULL,
			ObjectNotify, exception);
	
	coreHandlers[ FyConst.FY_BASE_OBJECT".notifyAll.()V", NULL,
			ObjectNotifyAll, exception);
	

	/* Thread */
	coreHandlers[
			FyConst.FY_BASE_THREAD".currentThread.()L"FyConst.FY_BASE_THREAD";", NULL,
			ThreadCurrentThread, exception);
	
	coreHandlers[ FyConst.FY_BASE_THREAD".setPriority0.(I)V",
			NULL, ThreadSetPriority, exception);
	
	coreHandlers[ FyConst.FY_BASE_THREAD".isAlive.()Z", NULL,
			ThreadIsAlive, exception);
	
	coreHandlers[ FyConst.FY_BASE_THREAD".start0.()V", NULL,
			ThreadStart, exception);
	
	coreHandlers[ FyConst.FY_BASE_THREAD".interrupt0.()V", NULL,
			ThreadInterrupt, exception);
	
	coreHandlers[ FyConst.FY_BASE_THREAD".isInterrupted.(Z)Z",
			NULL, ThreadInterrupted, exception);
	

	/* FiScEVM */
	coreHandlers[
			"com/cirnoworks/fisce/privat/FiScEVM.save.()V", NULL, FiScEVMSave,
			exception);
	
	coreHandlers[
			"com/cirnoworks/fisce/privat/FiScEVM.storeParamsToArray.(I[III)V",
			NULL, FiScEVMStoreParams, exception);
	
	coreHandlers[
			"com/cirnoworks/fisce/privat/FiScEVM.logOut0.(IL"FyConst.FY_BASE_STRING";)V",
			NULL, VMLogOut, exception);
	
	coreHandlers[
			"com/cirnoworks/fisce/privat/FiScEVM.throwOut.(L"FyConst.FY_BASE_THROWABLE";L"FyConst.FY_BASE_STRING";)V",
			NULL, VMThrowOut, exception);
	
	coreHandlers[
			"com/cirnoworks/fisce/privat/FiScEVM.exit.(I)V", NULL, VMExit,
			exception);
	
	coreHandlers[
			"com/cirnoworks/fisce/privat/FiScEVM.decode.(L"FyConst.FY_BASE_STRING";[BII)[C",
			NULL, VMDecode, exception);
	
	coreHandlers[
			"com/cirnoworks/fisce/privat/FiScEVM.encode.(L"FyConst.FY_BASE_STRING";[CII)[B",
			NULL, VMEncode, exception);
	
	coreHandlers[
			"com/cirnoworks/fisce/privat/FiScEVM.getDoubleRaw.(D)J", NULL,
			VMGetDoubleRaw, exception);
	
	coreHandlers[
			"com/cirnoworks/fisce/privat/FiScEVM.getFloatRaw.(F)I", NULL,
			VMGetFloatRaw, exception);
	
	coreHandlers[
			"com/cirnoworks/fisce/privat/FiScEVM.stringToDouble.(L"FyConst.FY_BASE_STRING";)D",
			NULL, VMStringToDouble, exception);
	
	coreHandlers[
			"com/cirnoworks/fisce/privat/FiScEVM.doubleToString.(D)L"FyConst.FY_BASE_STRING";",
			NULL, VMDoubleToString, exception);
	
	coreHandlers[
			"com/cirnoworks/fisce/privat/FiScEVM.stringToFloat.(L"FyConst.FY_BASE_STRING";)F",
			NULL, VMStringToFloat, exception);
	
	coreHandlers[
			"com/cirnoworks/fisce/privat/FiScEVM.floatToString.(F)L"FyConst.FY_BASE_STRING";",
			NULL, VMFloatToString, exception);
	
	coreHandlers[
			"com/cirnoworks/fisce/privat/FiScEVM.breakpoint.()V", NULL,
			VMBreakpoint, exception);
	
	coreHandlers[
			"com/cirnoworks/fisce/privat/SystemOutputStream.write0.(IL"FyConst.FY_BASE_STRING";)V",
			NULL, SOSWrite, exception);
	
	coreHandlers[
			FyConst.FY_BASE_THROWABLE".fillInStackTrace0.()V", NULL,
			throwableFillInStackTrace, exception);
	
	coreHandlers[ FyConst.FY_BASE_THREAD".sleep.(J)V", NULL,
			ThreadSleep, exception);
	coreHandlers[ FyConst.FY_BASE_THREAD".yield.()V", NULL,
			ThreadYield, exception);
	

	coreHandlers[
			FyConst.FY_BASE_FINALIZER".getFinalizee.()[L"FyConst.FY_BASE_OBJECT";", NULL,
			finalizerGetFinalizee, exception);
	

	coreHandlers[
			FyConst.FY_BASE_FINALIZER".getReferencesToEnqueue.()[L"FyConst.FY_REF";", NULL,
			finalizerGetReferencesToEnqueue, exception);
	

	coreHandlers[
			FyConst.FY_REFLECT_ARRAY".newInstance.(L"FyConst.FY_BASE_CLASS";[I)L"FyConst.FY_BASE_OBJECT";",
			NULL, arrayNewInstance, exception);
	
	
	/**
	 * @param {FyContext}
	 *            context
	 */
	registerCoreHandlers = function(context) {
		context.registerNativeHandler(systemHandlers);
	};
})();