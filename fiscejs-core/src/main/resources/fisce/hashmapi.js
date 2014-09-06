var HashMapI;
(function() {
	"use strict";

	var EMPTY_ARRAY = [];

	function directHash(i) {
		return i & 0x7fffffff;
	}

	var hash = directHash;

	/**
	 * @param {Number}
	 *            capShift
	 * @param {Number}
	 *            factor
	 */
	HashMapI = function(nullNumber, capShift, factor) {
//		forceOptimize(HashMapI);
		this.nullNumber = nullNumber | 0;
		this.capShift = capShift | 0;
		this.cap = 1 << this.capShift;
		this.capMask = this.cap - 1;
		this.factor = Number(factor || 0.75);
		this.maxSize = (this.cap * factor) | 0;
		this.pendingRemove = [];
		this.clear();
		Object.preventExtensions(this);
	};

	HashMapI.prototype.hash = directHash;

	HashMapI.prototype.expand = function() {
		// if (this.expanding) {
		// throw new FyException(undefined,
		// "HashMapI.expand should not be reentried");
		// }
		// this.expanding = true;
		forceOptimize(this.expand);
		var capShift = this.capShift + 1;
		var cap = 1 << capShift;
		var capMask = cap - 1;
		var maxSize = (cap * this.factor) | 0;

		this.capShift = capShift;
		this.cap = cap;
		this.capMask = capMask;
		this.maxSize = maxSize;

		var backend = this.backend;
		this.clear();
		var max = backend.length;
		for (var i = 0; i < max; i++) {
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
		forceOptimize(this.put);
		var stage1 = "stage1";
		var pos = this.hash(key) & this.capMask;
		var stage2 = "stage2";
		var arr;
		var stage3 = "stage3";
		if (this.backend[pos] === undefined) {
			stage3 = "stage3b1";
			arr = this.backend[pos] = [];
		} else {
			stage3 = "stage3b2";
			arr = this.backend[pos]
		}
		var stage4 = "stage4";
		var al = arr.length;
		var stage5 = "stage5";
		for (var i = 0; i < al; i += 2) {
			if (arr[i] === key) {
				var ret = arr[i + 1];
				arr[i + 1] = value | 0;
				return ret;
			}
		}
		var stage6 = "stage6";
		arr.push(key | 0);
		var stage7 = "stage7";
		arr.push(value | 0);
		var stage8 = "stage8";
		this.size++;
		var stage9 = "stage9";
		if (this.size > this.maxSize) {
			this.expand();
		}
		var stage10 = "stage10";
		persistStages([ stage1, stage2, stage3, stage4, stage5, stage6, stage7,
				stage8, stage9 ]);
		return this.nullNumber;
	};

	HashMapI.prototype._get = function(key) {
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

	HashMapI.prototype.get = function(key) {
		// if (key !== key | 0) {
		// throw new FyException(undefined,
		// "Assertion exception, HashMapI.get");
		// }
		forceOptimize(this._get);
		forceOptimize(this.get);
		return this._get(key | 0);
	};

	HashMapI.prototype.remove = function(key) {
		// if (key !== key | 0) {
		// throw new FyException(undefined,
		// "Assertion exception, HashMapI.remove");
		// }
		forceOptimize(this.remove);
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
		forceOptimize(this.contains);
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
		forceOptimize(this.iterate);
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
		forceOptimize(this.clear);
		this.backend = new Array();
		this.size = 0;
		for (var i = 0; i < this.cap; i++) {
			this.backend.push([]);
		}
	};

})();
