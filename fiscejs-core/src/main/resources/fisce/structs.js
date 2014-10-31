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

// Utils and some plain structs without methods.
/**
 * Config class
 * @constructor
 * @export
 * @struct
 */
function FyConfig() {
  /**
   * @type {number}
   */
  this.maxObjects = 131072;
  /**
   * @type {number}
   */
  this.maxThreads = 16;
  /**
   * @type {number}
   */
  this.gcIdv = 60000;
  /**
   * @type {number}
   */
  this.gcForceIdv = 120000;
  /**
   * @type {number}
   */
  this.heapSize = 4000000;
  /**
   * @type {number}
   */
  this.edenSize = 1000000;
  /**
   * @type {number}
   */
  this.copySize = 400000;
  /**
   * @type {number}
   */
  this.stackSize = 16384;
  /**
   * @type {boolean}
   */
  this.debugMode = false;
  /**
   * @type {boolean}
   */
  this.verboseMode = false;
  /**
   * @type {boolean}
   */
  this.aggresiveGC = false;
};

FyConfig.verboseMode = false;

/**
 * @class
 * @struct
 * @constructor
 */
function FyTableSwitchTarget(def) {
  this.targets = new Array();
  if ("dflt" in def) {
    this.dflt = def["dflt"] | 0;
  } else {
    this.dflt = 0;
  }
  if ("min" in def) {
    this.min = def["min"] | 0;
  } else {
    this.min = 0;
  }
  if ("max" in def) {
    this.max = def["max"] | 0;
  } else {
    this.max = 0;
  }

  var targets = this.targets;
  var defTargets = def["targets"];
  for (var j = 0; j < defTargets.length; j++) {
    var target = defTargets[j] | 0;
    targets.push(target);
  }
};

/**
 * @class
 * @struct
 * @constructor
 */
function FyLookupSwitchTarget(def) {
  if ("dflt" in def) {
    this.dflt = def["dflt"] | 0;
  } else {
    this.dflt = 0;
  }
  this.targets = new HashMapI(-1, 1, 0.8);

  var targets = this.targets;
  var defTargets = def["targets"];

  for (var j = 0, max = defTargets.length - 1; j < max; j += 2) {
    var j2 = j + 1;
    var key = defTargets[j] | 0;
    var value = defTargets[j2] | 0;
    targets.put(key, value);
  }
};

/**
 * FyException
 *
 * @param {string|null}
 *            clazz Class name for inner class
 * @param {string|null}
 *            message message
 * @class
 * @constructor
 * @export
 */
function FyException(clazz, message) {
  Error.call(this, (clazz ? (clazz + ": ") : "") + message);
  /**
   * @override
   */
  this.name = "FyException";
  /**
   * @type {string|null}
   */
  this.clazz = clazz;
  /**
   * @type {string|null}
   */
  this.message = message;
  /**
   * @override
   */
  this.stack = new Error((clazz ? (clazz + ": ") : "") + message).stack;
  if (!clazz) {
    clazz = null;
  }
};

FyException.prototype = new Error("FyException");

/**
 * @override
 * @return {string}
 */
FyException.prototype.toString = function() {
  return "" + (this.clazz ? this.clazz : "FatalError") + ": " + this.message + (this.stack ? ("\n" + this.stack) : "");
};

/**
 * @constructor
 * @export
 * @class
 * @param {?} data
 * @param {Error} cause
 */
function FyPanicException(data, cause) {
  Error.call(this, "panic");
  if (Object.prototype.toString.call([]) === "[object Array]") {
    /**
     * @type {string}
     */
    this.message = data.join("\n");
  } else {
    this.message = String(data);
  }
  /**
   * @type {Error}
   */
  this.cause = cause;
  /**
   * @type {string}
   */
  this.name = "FyPanicException";
  /**
   * @type {string}
   */
  this.stack = new Error("panic").stack;
};

FyPanicException.prototype = new Error("FyPanicException");

FyPanicException.prototype.toString = function() {
  return "Panic: " + this.message + (this.stack ? ("\n##Stack:\n" + this.stack) : "");
}

/**
 * Message method <-> thread <-> threadManager <-> outer
 *
 * @constructor
 * @struct
 * @export
 */
function FyMessage() {
  /**
   * @type {number}
   */
  this.type = 0;
  /**
   * @type {FyThread}
   */
  this.thread = null;
  /**
   * @type {number}
   */
  this.sleepTime = 0;
  /**
   * @type {string|null}
   */
  this.nativeMethod = null;
  /**
   * @type {number}
   */
  this.sp = 0;
};

/**
 * @export
 * @returns {number}
 */
FyMessage.prototype.getType = function() {
  return this.type;
}

/**
 * @export
 * @returns {FyThread}
 */
FyMessage.prototype.getThread = function() {
  return this.thread;
}

/**
 * @export
 * @returns {number}
 */
FyMessage.prototype.getSleepTime = function() {
  return this.sleepTime;
}

/**
 * @export
 * @returns {string|null}
 */
FyMessage.prototype.getNativeMethod = function() {
  return this.nativeMethod;
}

/**
 * @export
 * @returns {number}
 */
FyMessage.prototype.getsp = function() {
  return this.sp;
}

/**
 * @const
 * @type {number}
 */
FyMessage.message_continue = 0; // In thread
/**
 * @const
 * @type {number}
 */
FyMessage.message_none = 1; // Thread Only
/**
 * @const
 * @type {number}
 */
FyMessage.message_thread_dead = 2; // Thread Only
/**
 * @const
 * @export
 * @type {number}
 */
FyMessage.message_invoke_native = 3; // Thread And TM pass thread
/**
 * @const
 * @export
 * @type {number}
 */
FyMessage.message_exception = 4; // Thread And TM pass thread
/**
 * @const
 * @export
 * @type {number}
 */
FyMessage.message_sleep = 5; // TM Only
/**
 * @const
 * @export
 * @type {number}
 */
FyMessage.message_vm_dead = 6;