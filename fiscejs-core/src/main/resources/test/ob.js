if (window.console) {
	window.oldConsole = window.console;
} else {
	window = oldConsole = {
		log : function() {
		}
	};
}

window.console = {
	log : function(param) {
		$("#console").append(document.createTextNode(param));
		$("#console").append("\n");
		window.oldConsole.log.apply(window.oldConsole, arguments);
	}
};

var context = new FyContext("ob");

function Exec(context) {
	"use strict";
	this.context = context;
	this.message = new FyMessage();
	this.fun = function() {
		try {
			context.threadManager.run(this.message);
		} catch (e) {
			console.log("##VM end with exception");
			throw e;
		}
		switch (this.message.type) {
		case FyMessage.message_vm_dead:
			console.log("##VM end");
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
				setTimeout(this.f2, delay);
			} else {
				this.fun();
			}
			break;
		default:
			console.log("##VM end with exception");
			throw new FyException(undefined, "Unknown message type: "
					+ message.type);
		}
	};
	this.f2 = this.fun.bind(this);
};

function gameStart(params) {
	var targets = params.targets;

	var datas = {};
	var vfs = {};

	function checkTargets() {
		var done = true;
		for ( var target in targets) {
			console.log("##Checking " + target);
			if (targets[target]) {
				console.log("##Checking " + target + "... wait");
				done = false;
				break;
			} else {
				console.log("##Checking " + target + "... done");
			}
		}
		if (done) {
			var clazz = "ifge/Launcher";
			for ( var idx in datas) {
				var data = JSON.parse(datas[idx]);
				context.addClassDef(data);
			}
			for ( var idx in vfs) {
				var data = JSON.parse(vfs[idx]);
				context.vfs.add(data);
			}
			context.bootup(clazz);

			var exec = new Exec(context);
			setTimeout(exec.f2, 1);
		}
	}

	for ( var target in targets) {
		(function(t) {
			$.ajax({
				url : target,
				dataType : "text",
				success : function(data) {
					switch (targets[t]) {
					case 1:
						console.log("Add " + t + " to datas");
						datas[t] = data;
						break;
					case 2:
						console.log("Add " + t + " to vfs");
						vfs[t] = data;
						break;
					default:
						throw "Illegal target type: " + targets[t]
								+ " for target " + t;
					}
					targets[t] = 0;
					checkTargets();
				},
				fail : function() {
					targets[t] = -1;
					ok(false, t + " not found!");
				}
			});
		})(target);
	}
};