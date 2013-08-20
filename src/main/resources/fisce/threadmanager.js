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

var FyThreadManager;

(function() {
	"use strict";
	/**
	 * @param {FyContext}
	 *            context
	 * @returns {FyThreadManager}
	 */
	FyThreadManager = function(context) {
		this.context = context;
		this.pricmds = [ 0, 100, 250, 500, 1000, 2000, 4000, 8000, 16000,
				32000, 64000 ];
		this.threads = new Array(FyConfig.maxThreads);
		this.currentThread = undefined;
		this.runningThreads = [];
		this.runningThreadPos = 0;
		this.nonDaemonRunned = false;
		this.state = 0;
		this.nextWakeUpTimeTotal = 0;
		this.nextThreadId = 1;
		/**
		 * @returns {FyException}
		 */
		this.exitException = undefined;
		this.exitCode = 0;
		this.nextGCTime = 0;
		this.nextForceGCTime = 0;
		this.lastThreadId = 0;
	};

	/**
	 * @param {Number}
	 *            handle
	 * @returns {FyThread}
	 */
	FyThreadManager.prototype._getThreadByHandle = function(handle) {
		var threadId = this.context.heap.getObject(handle).multiUsageData;
		if (threadId === 0) {
			return undefined;
		}
		return this.threads[threadId];
	};

	/**
	 * @param {FyThread}
	 *            thread
	 * @param {Number}
	 *            monitorId
	 * @param {Number}
	 *            times
	 */
	FyThreadManager.prototype._monitorEnter = function(thread, monitorId, times) {
		var heap = this.context.heap;
		var monitor = heap.getObject(monitorId);
		var owner = monitor.monitorOwnerId;
		var threadId = thread.threadId;
//		console.log("Monitor enter at " + thread.getCurrentMethod().uniqueName);
		if (owner === threadId) {
			// owned by this thread, add times and go on
//			console.log("Monitor enter " + threadId + " add " + monitorId
//					+ ", " + times + " times");
			monitor.monitorOwnerTimes += times;
		} else if (owner <= 0) {
			// no owner, get ownership and go on
//			console.log("Monitor enter " + threadId + " granted " + monitorId
//					+ ", " + times + " times");
			monitor.monitorOwnerId = threadId;
			monitor.monitorOwnerTimes = times;
		} else {
			// owned by other thread, register wait and yield
//			console.log("Monitor enter " + threadId + " yield");
			thread.waitForLockId = monitorId;
			thread.pendingLockCount = 1;
			thread.yield = true;
		}
		return times;
	};

	/**
	 * @param {FyThread}
	 *            thread
	 * @param {Number}
	 *            monitorId
	 * @param {Number}
	 *            times
	 */
	FyThreadManager.prototype._monitorExit = function(thread, monitorId, times) {
		var threadId = thread.threadId;
		var monitor = this.context.heap.getObject(monitorId);
		var owner = monitor.monitorOwnerId;
//		console.log("Monitor exit at " + thread.getCurrentMethod().uniqueName);
//		console.log("Monitor exit " + threadId + " " + monitorId + " " + times);
		if (owner !== threadId) {
			throw new FyException(FyConst.FY_EXCEPTION_MONITOR, "Thread #"
					+ threadId + ": tries to exit monitor owned by #"
					+ monitor.monitorOwnerId);
		}
		monitor.monitorOwnerTimes -= times;
		if (monitor.monitorOwnerTimes === 0) {
			monitor.monitorOwnerId = 0;
			thread.yield = true;
		} else if (monitor.monitorOwnerTimes < 0) {
			throw new FyException(FyConst.FY_EXCEPTION_MONITOR, "Thread #"
					+ threadId + ": Too many monitors released!(" + times + "/"
					+ (monitor.monitorOwnerTimes + times) + ")");
		}
		return times;
	};

	/**
	 * @param {FyThread}
	 *            thread
	 * @param {Number}
	 *            monitorId
	 */
	FyThreadManager.prototype._releaseMonitor = function(thread, monitorId) {
		var threadId = thread.threadId;
		var monitor = this.context.heap.getObject(monitorId);
		var owner = monitor.monitorOwnerId;
		if (owner !== threadId) {
			throw new FyException(FyConst.FY_EXCEPTION_MONITOR, "Thread #"
					+ threadId + ": tries to release monitor owned by #"
					+ monitor.monitorOwnerId);
		}
		return this.monitorExit(thread, monitorId, monitor.monitorOwnerTimes);
	};

	FyThreadManager.prototype._fetchNextThreadId = function() {
		var h = this.nextThreadId;
		while (this.threads[h] !== undefined) {
			h++;
			if (h === FyConfig.maxThreads) {
				h = 1;
			}
			if (h === this.nextThreadId) {
				throw new FyException(undefined, "Threads used up!");
			}
		}
		this.nextThreadId = (h % (FyConfig.maxThreads - 1) + 1);
		return h;
	};

	/**
	 * @param {FyThread}
	 *            thread
	 * @param {FyException}
	 *            e
	 */
	FyThreadManager.prototype.pushThrowable = function(thread, e) {
		var context = this.context;
		var heap = context.heap;
		if (!thread || !e.clazz) {
			context.panic("Fatal error occored: " + e.message, e);
		}
		try {
			var exceptionClass = context.lookupClass(e.clazz);
			if (!context.classLoader.canCast(exceptionClass,
					context.TOP_THROWABLE)) {
				throw new FyException(undefined, "Exception " + e.clazz
						+ " is not a " + context.TOP_THROWABLE);
			}
			var detailMessageField = context.getField(FyConst.FY_BASE_THROWABLE
					+ ".detailMessage.L" + FyConst.FY_BASE_STRING + ";");
			thread.currentThrowable = heap.allocate(context
					.lookupClass(e.clazz));
			if (!!e.message) {
				heap.putFieldString(thread.currentThrowable,
						detailMessageField.posAbs, e.message);
			}
			thread.fillStackTrace(thread.currentThrowable, false);
		} catch (ee) {
			context.panic("Exception occored while processing exception: " + e,
					ee);
		}
	};

	/**
	 * @param {FyThread}
	 *            thread
	 * @param {Number}
	 *            monitorId
	 */
	FyThreadManager.prototype.monitorEnter = function(thread, monitorId) {
		this._monitorEnter(thread, monitorId, 1);
	};

	/**
	 * @param {FyThread}
	 *            thread
	 * @param {Number}
	 *            monitorId
	 */
	FyThreadManager.prototype.monitorExit = function(thread, monitorId) {
		this._monitorExit(thread, monitorId, 1);
	};
	/**
	 * 
	 * @param {FyThread}
	 *            thread
	 * @param {Number}
	 *            time
	 */
	FyThreadManager.prototype.sleep = function(thread, time) {
		thread.nextWakeTime = Date.now() + time;
		thread.yield = true;
	};

	/**
	 * 
	 * @param {Number}
	 *            targetHandle
	 */
	FyThreadManager.prototype.interrupt = function(targetHandle) {
		var target = this._getThreadByHandle(targetHandle);
		if (target === undefined) {
			return;
		}
		if (target.nextWakeTime > 0) {
			this.pushThrowable(target, new FyException(
					FyConst.FY_EXCEPTION_INTR, "interrupted"));
			target.nextWakeTime = 0;
			target.interrupted = true;
		}
	};

	/**
	 * @param {Number}
	 *            targetHandle
	 * @param {Boolean}
	 *            clear
	 * @returns {Boolean}
	 * @returns {Boolean}
	 */
	FyThreadManager.prototype.isInterrupted = function(targetHandle, clear) {
		var target = this._getThreadByHandle(targetHandle);
		if (target === undefined) {
			return false;
		}
		var ret = target.interrupted;
		if (clear) {
			target.interrupted = false;
		}
		return ret;
	};

	/**
	 * 
	 * @param {FyThread}
	 *            thread
	 * @param {Number}
	 *            monitorId
	 * @param {Number}
	 *            time
	 */
	FyThreadManager.prototype.wait = function(thread, monitorId, time) {
		var monitor = this.context.heap.getObject(monitorId);
		if (monitor.monitorOwnerId !== thread.threadId) {
			throw new FyException(FyConst.FY_EXCEPTION_IMSE, thread.threadId
					+ "/" + monitor.monitorOwnerId);
		}
		thread.waitForNotifyId = monitorId;
		thread.pendingLockCount = this._releaseMonitor(thread, monitorId);
		if (time <= 0) {
			thread.nextWakeTime = 0x7fffffffffff;
		} else {
			thread.nextWakeTime = Date.now() + time;
		}
		thread.yield = true;
	};

	/**
	 * 
	 * @param {FyThread}
	 *            thread
	 * @param {Number}
	 *            monitorId
	 * @param {Boolean}
	 *            all
	 */
	FyThreadManager.prototype.notify = function(thread, monitorId, all) {
		var monitor = this.context.heap.getObject(monitorId);
		var threadId = thread.threadId;
		/**
		 * @returns {FyThread}
		 */
		var target;
		if (monitor.monitorOwnerId !== thread.threadId) {
			throw new FyException(FyConst.FY_EXCEPTION_IMSE, thread.threadId
					+ "/" + monitor.monitorOwnerId);
		}
		for ( var i = this.runningThreads.length - 1; i >= 0; i--) {
			target = this.runningThreads[i];
			if (target !== undefined && target.waitForNotifyId === monitorId) {
				target.waitForNotifyId = 0;
				target.waitForLockId = monitorId;
				target.nextWakeTime = 0;
				if (!all) {
					break;
				}
			}
		}
	};

	/**
	 * @param {Number}
	 *            threadHandle
	 * @returns {Boolean}
	 */
	FyThreadManager.prototype.isAlive = function(threadHandle) {
		return this._getThreadByHandle(threadHandle) !== undefined;
	};

	/**
	 * 
	 * @param {FyThread}
	 *            thread
	 */
	FyThreadManager.prototype.destroyThread = function(thread) {
		thread.destroyPending = true;
	};

	/**
	 * 
	 * @param {FyClass}
	 *            clazz class which has main method
	 */
	FyThreadManager.prototype.bootFromMain = function(clazz) {
		var context = this.context;
		var heap = context.heap;
		var charArrayClass;
		var threadClass;
		var threadNameField;
		var threadNameHandle;
		var threadPriorityField;
		var mainMethod;
		var threadId;
		var thread;
		var threadHandle;
		if (this.state !== FyConst.FY_TM_STATE_NEW) {
			throw new FyException(undefined,
					"Status is not new while booting! (" + this.state + ")");
		}
		charArrayClass = context.lookupClass(FyClassLoader
				.getArrayName(FyConst.FY_PRIM_CHAR));
		threadNameHandle = heap.allocateArray(charArrayClass,
				clazz.name.length + 5);
		heap.putArrayChar(threadNameHandle, 0, "M".charCodeAt(0));
		heap.putArrayChar(threadNameHandle, 1, "a".charCodeAt(0));
		heap.putArrayChar(threadNameHandle, 2, "i".charCodeAt(0));
		heap.putArrayChar(threadNameHandle, 3, "n".charCodeAt(0));
		heap.putArrayChar(threadNameHandle, 4, ".".charCodeAt(0));
		for ( var i = 0; i < clazz.name.length; i++) {
			heap
					.putArrayChar(threadNameHandle, i + 5, clazz.name
							.charCodeAt(i));
		}
		threadClass = context.lookupClass(FyConst.FY_BASE_THREAD);
		threadNameField = context.lookupFieldVirtual(threadClass,
				FyConst.FY_FIELDF_NAME);
		threadPriorityField = context.lookupFieldVirtual(threadClass,
				FyConst.FY_FIELDF_PRIORITY);
		mainMethod = context
				.lookupMethodVirtual(clazz, FyConst.FY_METHODF_MAIN);
		if (mainMethod === undefined) {
			throw new FyException(FyConst.FY_EXCEPTION_NO_METHOD, "Class "
					+ clazz.name + " contains no main method");
		}
		threadId = this._fetchNextThreadId();
		thread = new FyThread(context, FyConfig.stackSize);
		threadHandle = heap.allocate(threadClass);
		heap
				.putFieldRaw(threadHandle, threadNameField.posAbs,
						threadNameHandle);
		heap.putFieldInt(threadHandle, threadPriorityField.posAbs, 5);
		thread.threadId = threadId;
		console.log("main thread id=" + threadId);
		this.threads[threadId] = thread;
		thread.priority = 5;
		thread.initWithMethod(threadHandle, mainMethod);
		this.runningThreads.push(thread);
		this.state = FyConst.FY_TM_STATE_RUN_PENDING;
		this.nextGCTime = Date.now() + FyConfig.gcIdv;
		this.nextForceGCTime = Date.now() + FyConfig.gcForceIdv;
	};

	/**
	 * 
	 * @param {Number}
	 *            threadHandle
	 */
	FyThreadManager.prototype.pushThread = function(threadHandle) {
		var context = this.context;
		var heap = context.heap;
		var thread;
		var threadId;
		var priority;
		var daemon;
		/**
		 * @returns {FyClass}
		 */
		var threadClass;
		/**
		 * @returns {FyField}
		 */
		var threadDaemonField;
		/**
		 * @returns {FyField}
		 */
		var threadPriorityField;
		if (this.state !== FyConst.FY_TM_STATE_RUNNING
				&& this.state !== FyConst.FY_TM_STATE_STOP_PENDING) {
			throw new FyException(undefined,
					"Status is not RUNNING or STOP_PENDING while adding thread!("
							+ this.state + ")");
		}
		threadClass = context.lookupClass(FyConst.FY_BASE_THREAD);
		threadDaemonField = context.lookupFieldVirtual(threadClass,
				FyConst.FY_FIELDF_DAEMON);
		threadPriorityField = context.lookupFieldVirtual(threadClass,
				FyConst.FY_FIELDF_PRIORITY);
		priority = heap.getFieldInt(threadHandle, threadPriorityField.posAbs);
		daemon = heap.getFieldBoolean(threadHandle, threadDaemonField.posAbs);
		threadId = this._fetchNextThreadId();
		thread = new FyThread(context, FyConfig.stackSize);
		thread.threadId = threadId;
		this.threads[threadId] = thread;
		thread.priority = priority;
		thread.daemon = daemon;
		thread.initWithRun(threadHandle);
		this.runningThreads.push(thread);
	};

	/**
	 * 
	 * @param {FyMessage}
	 *            message
	 */
	FyThreadManager.prototype.run = function(message) {
		var stateLocal;
		var running = this.runningThreads;
		/**
		 * @returns {FyThread}
		 */
		var thread;
		var nextWakeUpTime, now, sleepTime;
		var lockId;
		/**
		 * @returns {FyObject}
		 */
		var lock;
		if (this.state !== FyConst.FY_TM_STATE_RUN_PENDING
				&& this.state !== FyConst.FY_TM_STATE_RUNNING
				&& this.state !== FyConst.FY_TM_STATE_STOP_PENDING) {
			throw new FyException(undefined, "Illegal VM status " + this.state);
		}
		this.state = FyConst.FY_TM_STATE_RUNNING;
		while (true) {
			message.type = FyMessage.message_none;
			stateLocal = this.state | 0;
			switch (stateLocal) {
			case FyConst.FY_TM_STATE_RUNNING: {
				if (running.length > 0) {
					if (this.runningThreadPos < running.length) {
						thread = running[this.runningThreadPos];
						if (thread.destroyPending) {
							thread.destroy();
							running.splice(this.runningThreadPos, 1);
							this.threads[thread.threadId] = undefined;
							break;
						}
						this.runningThreadPos++;
						if (!thread.daemon) {
							this.nonDaemonRunned = true;
						}
						nextWakeUpTime = thread.nextWakeTime;
						if (nextWakeUpTime > Date.now()) {
							if (this.nextWakeUpTimeTotal > nextWakeUpTime) {
								this.nextWakeUpTimeTotal = nextWakeUpTime;
							}
							break;
						}
						thread.nextWakeTime = 0;
						this.nextWakeUpTimeTotal = 0;
						lockId = thread.waitForLockId;
						if (lockId > 0) {
							lock = this.context.heap.getObject(lockId);
							if (lock.monitorOwnerId <= 0) {
								lock.monitorOwnerId = thread.threadId;
								lock.monitorOwnerTimes = thread.pendingLockCount;
							} else {
								break;
							}
						}
						this.lastThreadId = thread.threadId;
						thread.run(message, this.pricmds[thread.priority]);
						this.context.heap.endProtect();
						switch (message.type) {
						case FyMessage.message_continue:
						case FyMessage.message_vm_dead:
						case FyMessage.message_sleep:
							// Illegal!
							this.context.panic("Illegal message type "
									+ message.type);
						case FyMessage.message_none:
							break;
						case FyMessage.message_exception:
						case FyMessage.message_invoke_native:
							// TODO
							// unimplemented (may be no need)
							this.context.panic("Illegal message type "
									+ message.type);
						case FyMessage.message_thread_dead:
							thread.destroyPending = true;
							break;
						default:
							this.context.panic("Illegal message type "
									+ message.type);
						}
					} else {
						if (!this.nonDaemonRunned) {
							this.state = FyConst.FY_TM_STATE_DEAD;
						} else {
							now = Date.now();
							sleepTime = this.nextWakeUpTimeTotal - now;
							if ((sleepTime > 10 && now > this.nextGCTime)
									|| now > this.nextForceGCTime) {
								this.nextGCTime = now + FyConfig.gcIdv;
								this.nextForceGCTime = this.nextGCTime
										+ FyConfig.gcForceIdv;
								this.context.log(0, "Call GC due to timeout");
								this.context.heap.gc();
								now = Date.now();
								sleepTime = this.nextWakeUpTimeTotal - now;
							}
							this.nextWakeUpTimeTotal = 0x7fffffffffff;
							this.runningThreadPos = 0;
							this.nonDaemonRunned = false;
							if (sleepTime > 0) {
								message.type = FyMessage.message_sleep;
								message.sleepTime = sleepTime;
								return;
							}
						}

					}
				} else {
					this.state = FyConst.FY_TM_STATE_DEAD;
				}
				break;
			}
			case FyConst.FY_TM_STATE_STOP_PENDING:
				this.runningThreadPos = 0;
				this.state = FyConst.FY_TM_STATE_STOP;
				break;
			case FyConst.FY_TM_STATE_DEAD_PENDING:
				this.state = FyConst.FY_TM_STATE_DEAD;
				break;
			case FyConst.FY_TM_STATE_DEAD:
				message.type = FyMessage.message_vm_dead;
				return;
			default:
				this.context.panic("Illegal vm state " + stateLocal);
			}
		}
	};
})();