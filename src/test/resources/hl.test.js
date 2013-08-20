(function() {
	function addHighLevel(clazz) {
		var obj = {};
		obj["HL." + clazz] = function() {
			var context = fisceTests.context();
			context.bootup(clazz);
			var message = new FyMessage();
			while (true) {
				context.threadManager.run(message);
				switch (message.type) {
				case FyMessage.message_vm_dead:
					ok("vm dead");
					return;
				case FyMessage.message_sleep:
					console.log("sleep " + message.sleepTime + "ms");
					var target = Date.now() + Number(message.sleepTime);
					if (target !== target) {
						// Nan
						throw new FyException(undefined, "Illegal sleep time: "
								+ sleepTime);
					}
					while (Date.now() <= target) {
						;
					}
					break;
				default:
					throw new FyException(undefined, "Unknown message type: "
							+ message.type);
				}
			}
		};
		fisceTests.extend(obj);
	}

	addHighLevel("EXCLUDE/fisce/test/HelloWorld");
	addHighLevel("EXCLUDE/fisce/test/UnicodeTest");
	addHighLevel("EXCLUDE/fisce/test/Tester");
	addHighLevel("EXCLUDE/fisce/test/ArchitectureTest");
	addHighLevel("com/cirnoworks/fisce/privat/Profile");
})();