var HashMapIStr;
(function() {
	"use strict";
	
	var EMPTY_ARRAY = [];

	function directHash(i) {
		return i;
	}

	var hash = directHash;

	function ISEntry(key, value) {
		this.key = key | 0;
		this.value = value;
		Object.preventExtensions(this);
	}

	/**
	 * @param {Number}
	 *            capShift
	 * @param {Number}
	 *            factor
	 */
	HashMapIStr = function(capShift, factor) {
		this.factor = Number(factor || 0.75);
		this.capShift = capShift | 0;
		this.cap = 1 << this.capShift;
		this.capMask = this.cap - 1;
		this.maxSize = (this.cap * this.factor) | 0;
		this.clear();
		// this.expanding = false;
		this.pendingRemove = [];
		Object.preventExtensions(this);
	};

	HashMapIStr.prototype.hash = directHash;

	HashMapIStr.prototype.expand = function() {
		// if (this.expanding) {
		// throw new FyException(undefined,
		// "HashMapIStr.expand should not be reentried");
		// }
		// this.expanding = true;
		var stage1 = "stage1";
		var capShift = this.capShift + 1;
		var cap = 1 << capShift;
		var capMask = cap - 1;
		var maxSize = (cap * this.factor) | 0;
		var stage1a = "stage1a";
		this.capShift = capShift;
		var stage1b = "stage1b";
		this.cap = cap;
		var stage1c = "stage1c";
		this.capMask = capMask;
		var stage1d = "stage1d";
		this.maxSize = maxSize;
		var stage2 = "stage2";
		// var oldSize = this.size;
		var backend = this.backend;
		this.clear();
		var stage3 = "stage3";
		var stage4, stage5, stage6, stage7, stage7a, stage8, stage9, stage10, stage11;
		for (var i = backend.length; i--;) {
			stage4 = "stage4";
			var arr = backend[i];
			stage5 = "stage5";
			if (arr !== undefined) {
				stage7a = "";
				stage6 = "stage6";
				var al = arr.length;
				stage7 = "stage7";
				for (var j = 0; j < al; j++) {
					stage11 = "";
					stage8 = "stage8";
					var key = arr[j].key | 0;
					stage9 = "stage9";
					var value = arr[j].value;
					stage10 = "stage10";
					this.put(key, value);
					stage11 = "stage11";
					stage8 = "";
					stage9 = "";
					stage10 = "";
				}
				stage7a = "stage7a";
				stage6 = "";
				stage7 = "";
			}
		}
		persistStages([ stage1, stage1b, stage1c, stage1d, stage2, stage3,
				stage4, stage5, stage6, stage7, stage8, stage9, stage10,
				stage11 ]);
		// if (this.size !== oldSize) {
		// throw new FyException(undefined, "Assertion, HashMapIStr.expand");
		// }
		// this.expanding = false;
	};

	/**
	 * 
	 * @param {Number}
	 *            key
	 * @param {Object}
	 *            value
	 * @returns {Number}
	 */
	HashMapIStr.prototype.put = function(key, value) {
		// if (key !== key | 0 || value !== value | 0) {
		// throw new FyException(undefined,
		// "Assertion exception, HashMapIStr.put");
		// }
		forceOptimize(this.put);
		if (typeof value !== "string") {
			throw new FyException(undefined, "TYPE");
		}
		forceOptimize(this.put);
		var pos = this.hash(key | 0) & this.capMask;
		var arr = this.backend[pos];
		if (arr === undefined) {
			arr = this.backend[pos] = [];
		}
		var al = arr.length;
		for (var i = 0; i < al; i++) {
			if (arr[i].key === key) {
				var ret = arr[i].value;
				arr[i].value = value;
				return ret;
			}
		}
		arr.push(new ISEntry(key | 0, value));
		this.size++;
		if (this.size > this.maxSize) {
			forceOptimize(this.expand);
			this.expand();
		}
		return undefined;
	};

	HashMapIStr.prototype.get = function(key) {
		// if (key !== key | 0) {
		// throw new FyException(undefined,
		// "Assertion exception, HashMapIStr.get");
		// }
		forceOptimize(this.get);
		var pos = this.hash(key | 0) & this.capMask;
		var arr = this.backend[pos];
		if (arr === undefined) {
			return undefined;
		} else {
			var al = arr.length;
			for (var i = 0; i < al; i++) {
				if (arr[i].key === key) {
					return arr[i].value;
				}
			}
			return undefined;
		}
	};

	HashMapIStr.prototype.remove = function(key) {
		// if (key !== key | 0) {
		// throw new FyException(undefined,
		// "Assertion exception, HashMapIStr.remove");
		// }
		forceOptimize(this.remove);
		var pos = this.hash(key | 0) & this.capMask;
		var arr = this.backend[pos];
		if (arr === undefined) {
			return undefined;
		} else {
			var al = arr.length;
			for (var i = 0; i < al; i++) {
				if (arr[i].key === key) {
					var ret = arr[i].value;
					arr.splice(i, 1);
					this.size--;
					return ret;
				}
			}
			return undefined;
		}
	};

	HashMapIStr.prototype.contains = function(key) {
		// if (key !== key | 0) {
		// throw new FyException(undefined,
		// "Assertion exception, HashMapIStr.contains");
		// }
		forceOptimize(this.contains);
		var pos = this.hash(key | 0) & this.capMask;
		var arr = this.backend[pos];
		if (arr === undefined) {
			return false;
		} else {
			var al = arr.length;
			for (var i = 0; i < al; i++) {
				if (arr[i].key === key) {
					return true;
				}
			}
			return false;
		}
	};

	HashMapIStr.prototype.iterate = function(fun, data) {
		var count = 0;
		// var size = this.size;
		var backend = this.backend;
		// var k = [];
		for (var i = backend.length; i--;) {
			var arr = backend[i];
			if (arr !== undefined) {
				var al = arr.length;
				for (var j = 0; j < al; j++) {
					var key = arr[j].key;
					var value = arr[j].value;
					count++;
					if (fun(key, value, data)) {
						arr.splice(j, 1);
						this.size--;
						j--;
						al--;
					}
				}
			}
		}
		// if (count !== this.size) {
		// throw new FyException(undefined,
		// "Assertion exception, HashMapIStr.iterate, count=" + count
		// + " size=" + this.size);
		// }
		// for (var i = 0; i < k.length; i++) {
		// this.remove(k[i]);
		// }
		// if (this.size !== size - k.length) {
		// throw new FyException(undefined,
		// "Assertion exception, HashMapIStr.iterate, count=" + count
		// + " size=" + this.size + " keys removed=" + k);
		// }
		return count;
	};

	HashMapIStr.prototype.clear = function() {
		forceOptimize(this.clear);
		this.backend = new Array();
		this.size = 0;
		var max = this.cap;
		for (var i = 0; i < max; i++) {
			this.backend.push([]);
		}
	};

})();
