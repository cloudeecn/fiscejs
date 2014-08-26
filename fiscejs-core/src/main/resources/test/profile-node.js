var fs = require('fs');
var vm = require('vm');
var includeInThisContext = function(path) {
	var code = fs.readFileSync(path);
	vm.runInThisContext(code, path);
}.bind(this);
includeInThisContext("../fisce/gunzip.minjs");
includeInThisContext("../fisce/aot.js");
includeInThisContext("../fisce/portable.js");
includeInThisContext("../fisce/long.asm.js");
includeInThisContext("../fisce/hashmapio.js");
includeInThisContext("../fisce/hashmapi.js");
includeInThisContext("../fisce/gunzip.minjs");
includeInThisContext("../fisce/vfs.js");
includeInThisContext("../fisce/structs.js");
includeInThisContext("../fisce/method.js");
includeInThisContext("../fisce/field.js");
includeInThisContext("../fisce/class.js");
includeInThisContext("../fisce/context.js");
includeInThisContext("../fisce/heap.js");
includeInThisContext("../fisce/classloader.js");
includeInThisContext("../fisce/thread.js");
includeInThisContext("../fisce/threadmanager.js");
includeInThisContext("../fisce/aot.native.js");

includeInThisContext("../../../../target/aot.data.js");

includeInThisContext("../fisce/nh.core.js");
includeInThisContext("../fisce/nh.reflect.js");
includeInThisContext("../fisce/nh.math.js");
console.log(process);
var context = new FyContext();
context.addClassDef(JSON.parse(""
		+ fs.readFileSync("../../../../target/test/rt.json")));
context.registerNativeHandler(
		"EXCLUDE/fisce/test/TestService.fail0.(Ljava/lang/String;)V", function(
				context, thread, ops) {
			throw new FyException("java/lang/Error", "Test failed: "
					+ context.heap.getString(thread.stack[thread.sp]));
			return 0;
		});
var clazz = process.argv[process.argv.length - 1] !== process.mainModule.filename ? process.argv[process.argv.length - 1]
		: "com/cirnoworks/fisce/privat/Profile";
context.bootup(clazz);
function Exec(context) {
	this.context = context;
	this.message = new FyMessage();
	this.fun = function() {
		try {
			context.threadManager.run(this.message);
		} catch (e) {
			console.log("##HL " + clazz + " end with exception");
			throw e;
		}
		switch (this.message.type) {
		case FyMessage.message_vm_dead:
			console.log("##HL " + clazz + " end");
			return;
		case FyMessage.message_sleep:
			var target = performance.now() + Number(this.message.sleepTime);
			if (target !== target) {
				// Nan
				throw new FyException(undefined, "Illegal sleep time: "
						+ sleepTime);
			}
			var delay = target - performance.now();
			if (delay < 0) {
				delay = 0;
			}
			if (delay > 0) {
				console.log("sleep " + delay + "ms");
				setTimeout(this.f2, delay);
			} else {
				this.fun();
			}
			break;
		default:
			console.log("##HL " + clazz + " end with exception");
			throw new FyException(undefined, "Unknown message type: "
					+ message.type);
		}
	};
	this.f2 = this.fun.bind(this);
}
var exec = new Exec(context);
setTimeout(exec.f2, 1);