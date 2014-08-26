var HashMapIObj;
(function() {
	"use strict";

	function directHash(i) {
		return i;
	}

	var hash = directHash;

	function Entry(key, value) {
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
	HashMapIObj = function(capShift, factor) {
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

	HashMapIObj.prototype.hash = directHash;

	HashMapIObj.prototype.expand = function() {
		// if (this.expanding) {
		// throw new FyException(undefined,
		// "HashMapIObj.expand should not be reentried");
		// }
		// this.expanding = true;
		this.capShift++;
		this.cap <<= 1;
		this.capMask = this.cap - 1;
		var oldSize = this.size;
		var backend = this.backend;
		this.clear();
		for (var i = backend.length; i--;) {
			var arr = backend[i];
			if (arr !== undefined) {
				var al = arr.length;
				for (var j = 0; j < al; j++) {
					var key = arr[j].key;
					var value = arr[j].value;
					this.put(key, value);
				}
			}
		}
		// if (this.size !== oldSize) {
		// throw new FyException(undefined, "Assertion, HashMapIObj.expand");
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
	HashMapIObj.prototype.put = function(key, value) {
		// if (key !== key | 0 || value !== value | 0) {
		// throw new FyException(undefined,
		// "Assertion exception, HashMapIObj.put");
		// }
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
		arr.push(new Entry(key | 0, value));
		this.size++;
		if (this.size > (this.cap * this.factor) | 0) {
			this.expand();
		}
		return undefined;
	};

	HashMapIObj.prototype.get = function(key) {
		// if (key !== key | 0) {
		// throw new FyException(undefined,
		// "Assertion exception, HashMapIObj.get");
		// }
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

	HashMapIObj.prototype.remove = function(key) {
		// if (key !== key | 0) {
		// throw new FyException(undefined,
		// "Assertion exception, HashMapIObj.remove");
		// }
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

	HashMapIObj.prototype.contains = function(key) {
		// if (key !== key | 0) {
		// throw new FyException(undefined,
		// "Assertion exception, HashMapIObj.contains");
		// }
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

	HashMapIObj.prototype.iterate = function(fun, data) {
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
		// "Assertion exception, HashMapIObj.iterate, count=" + count
		// + " size=" + this.size);
		// }
		// for (var i = 0; i < k.length; i++) {
		// this.remove(k[i]);
		// }
		// if (this.size !== size - k.length) {
		// throw new FyException(undefined,
		// "Assertion exception, HashMapIObj.iterate, count=" + count
		// + " size=" + this.size + " keys removed=" + k);
		// }
		return count;
	};

	HashMapIObj.prototype.clear = function() {
		this.backend = new Array(this.cap);
		this.size = 0;
	};

})();
