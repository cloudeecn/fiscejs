var HashMapI;
(function() {
	"use strict";

	function directHash(i) {
		return i;
	}

	var hash = directHash;

	/**
	 * @param {Number}
	 *            capShift
	 * @param {Number}
	 *            factor
	 */
	HashMapI = function(nullNumber, capShift, factor) {
		this.nullNumber = nullNumber | 0;
		this.capShift = capShift | 0;
		this.cap = 1 << this.capShift;
		this.capMask = this.cap - 1;
		this.factor = Number(factor || 0.75);

		this.backend = new Array(this.cap);
		this.size = 0;
		// this.expanding = false;
		this.pendingRemove = [];
		Object.preventExtensions(this);
	};

	HashMapI.prototype.hash = directHash;

	HashMapI.prototype.expand = function() {
		// if (this.expanding) {
		// throw new FyException(undefined,
		// "HashMapI.expand should not be reentried");
		// }
		// this.expanding = true;
		this.capShift++;
		this.cap <<= 1;
		this.capMask = this.cap - 1;
		console.log("###EXPAND to: " + this.cap);
		var oldSize = this.size;
		var backend = this.backend;
		this.clear();
		for (var i = backend.length; i--;) {
			var arr = backend[i];
			if (arr !== undefined) {
				var al = arr.length;
				for (var j = 0; j < al; j += 2) {
					var key = arr[j];
					var value = arr[j + 1];
					this.put(key, value);
				}
			}
		}
		// if (this.size !== oldSize) {
		// throw new FyException(undefined, "Assertion, HashMapI.expand");
		// }
		// this.expanding = false;
	};

	/**
	 * 
	 * @param {Number}
	 *            key
	 * @param {Number}
	 *            value
	 * @returns {Number}
	 */
	HashMapI.prototype.put = function(key, value) {
		// if (key !== key | 0 || value !== value | 0) {
		// throw new FyException(undefined,
		// "Assertion exception, HashMapI.put");
		// }
		var pos = this.hash(key | 0) & this.capMask;
		var arr = this.backend[pos];
		if (arr === undefined) {
			arr = this.backend[pos] = [];
		}
		var al = arr.length;
		for (var i = 0; i < al; i += 2) {
			if (arr[i] === key) {
				var ret = arr[i + 1];
				arr[i + 1] = value | 0;
				return ret;
			}
		}
		arr.push(key | 0);
		arr.push(value | 0);
		this.size++;
		if (this.size > (this.cap * this.factor) | 0) {
			this.expand();
		}
		return this.nullNumber;
	};

	HashMapI.prototype.get = function(key) {
		// if (key !== key | 0) {
		// throw new FyException(undefined,
		// "Assertion exception, HashMapI.get");
		// }
		var pos = this.hash(key | 0) & this.capMask;
		var arr = this.backend[pos];
		if (arr === undefined) {
			return this.nullNumber;
		} else {
			var al = arr.length;
			for (var i = 0; i < al; i += 2) {
				if (arr[i] === key) {
					return arr[i + 1];
				}
			}
			return this.nullNumber;
		}
	};

	HashMapI.prototype.remove = function(key) {
		// if (key !== key | 0) {
		// throw new FyException(undefined,
		// "Assertion exception, HashMapI.remove");
		// }
		var pos = this.hash(key | 0) & this.capMask;
		var arr = this.backend[pos];
		if (arr === undefined) {
			return this.nullNumber;
		} else {
			var al = arr.length;
			for (var i = 0; i < al; i += 2) {
				if (arr[i] === key) {
					var ret = arr[i + 1];
					arr.splice(i, 2);
					this.size--;
					return ret;
				}
			}
			return this.nullNumber;
		}
	};

	HashMapI.prototype.contains = function(key) {
		// if (key !== key | 0) {
		// throw new FyException(undefined,
		// "Assertion exception, HashMapI.contains");
		// }
		var pos = this.hash(key | 0) & this.capMask;
		var arr = this.backend[pos];
		if (arr === undefined) {
			return false;
		} else {
			var al = arr.length;
			for (var i = 0; i < al; i += 2) {
				if (arr[i] === key) {
					return true;
				}
			}
			return false;
		}
	};

	HashMapI.prototype.iterate = function(fun, data) {
		var count = 0;
		var size = this.size;
		var backend = this.backend;
		// var k = [];
		for (var i = backend.length; i--;) {
			var arr = backend[i];
			if (arr !== undefined) {
				var al = arr.length;
				for (var j = 0; j < al; j += 2) {
					var key = arr[j];
					var value = arr[j + 1];
					count++;
					if (fun(key, value, data)) {
						arr.splice(j, 2);
						this.size--;
						j -= 2;
						al -= 2;
					}
				}
			}
		}
		// if (count !== this.size) {
		// throw new FyException(undefined,
		// "Assertion exception, HashMapI.iterate, count=" + count
		// + " size=" + this.size);
		// }
		// for (var i = 0; i < k.length; i++) {
		// this.remove(k[i]);
		// }
		// if (this.size !== size - k.length) {
		// throw new FyException(undefined,
		// "Assertion exception, HashMapI.iterate, count=" + count
		// + " size=" + this.size + " keys removed=" + k);
		// }
		return count;
	};

	HashMapI.prototype.clear = function() {
		this.backend = new Array(this.cap);
		this.size = 0;
	};

})();
