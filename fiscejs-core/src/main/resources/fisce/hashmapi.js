var HashMapI;
(function() {
	"use strict";

	var EMPTY_ARRAY = [];

	function directHash(i) {
		return i & 0x3fffffff;
	}

	var hash = directHash;

	function EntryII(key, value) {
		this.key = key | 0;
		this.value = value | 0;
	}

	/**
	 * @param {Number}
	 *            capShift
	 * @param {Number}
	 *            factor
	 */
	HashMapI = function(nullNumber, capShift, factor) {
		// forceOptimize(HashMapI);
		var cap = (1 << capShift) | 0;
		this.nullNumber = nullNumber | 0;
		this.capShift = capShift | 0;
		this.capMask = (cap) - 1;
		this.factor = factor;
		this.maxSize = parseInt(cap * factor) | 0;
		this.currentSize = 0;
		this.backend = [];
		Object.preventExtensions(this);
		this.clearTo(cap);
	};

	HashMapI.prototype.hash = directHash;

	HashMapI.prototype.expand = function() {
		// forceOptimize(this.expand);
		var max;

		var capShift = this.capShift + 1;
		var cap = (1 << capShift);
		var capMask = cap - 1;
		var maxSize = parseInt(cap * this.factor) | 0;
		var i, i2, key, value;
		var values = [];

		this.capShift = capShift;
		this.capMask = capMask;
		this.maxSize = maxSize;

		this.iterate(function(key, value, data) {
			data.push(key | 0);
			data.push(value | 0);
		}, values);
		this.clearTo(cap);
		var max = values.length - 1;
		for (i = 0; i < max; i += 2) {
			i2 = i + 1;
			key = values[i];
			value = values[i2];
			this.put(key, value);
		}
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
		// forceOptimize(this.put);
		var pos = this.hash(key | 0) & this.capMask;
		var arr;
		var al;
		var i, i2, ret;
		arr = this.backend[pos];
		if (arr === undefined) {
			arr = [];
			this.backend[pos] = arr;
		} else {
			arr = this.backend[pos]
		}
		al = arr.length - 1;
		for (i = 0; i < al; i += 2) {
			i2 = i + 1;
			if (arr[i] === key) {
				ret = arr[i2];
				arr[i2] = value | 0;
				return ret;
			}
		}
		arr.push(key | 0);
		arr.push(value | 0);
		this.currentSize++;
		if (this.currentSize > this.maxSize) {
			this.expand();
		}
		return this.nullNumber;
	};

	HashMapI.prototype.get = function(key) {
		var pos = this.hash(key | 0) & this.capMask;
		var arr = this.backend[pos];
		var i, i2, al;
		if (arr === undefined) {
			return this.nullNumber;
		} else {
			al = arr.length - 1;
			for (i = 0; i < al; i += 2) {
				i2 = i + 1;
				if (arr[i] === key) {
					return arr[i2];
				}
			}
			return this.nullNumber;
		}
	};

	HashMapI.prototype.remove = function(key) {
		// forceOptimize(this.remove);
		var pos = this.hash(key | 0) & this.capMask;
		var arr = this.backend[pos];
		var i, i2, al, ret;
		if (arr === undefined) {
			return this.nullNumber;
		} else {
			al = arr.length - 1;
			for (i = 0; i < al; i += 2) {
				i2 = i + 1;
				if (arr[i] === key) {
					ret = arr[i2];
					arr.splice(i, 2);
					this.currentSize--;
					return ret;
				}
			}
			return this.nullNumber;
		}
	};

	HashMapI.prototype.contains = function(key) {
		// forceOptimize(this.contains);
		var pos = this.hash(key) & this.capMask;
		var arr = this.backend[pos];
		if (arr === undefined) {
			return false;
		} else {
			var al = arr.length - 1;
			for (var i = 0; i < al; i += 2) {
				if (arr[i] === key) {
					return true;
				}
			}
			return false;
		}
	};

	HashMapI.prototype.iterate = function(fun, data) {
		// forceOptimize(this.iterate);
		var count = 0;
		var backend = this.backend;
		var max = backend.length;
		for (var i = 0; i < max; i++) {
			var arr = backend[i];
			if (arr !== undefined) {
				var al = arr.length - 1;
				for (var j = 0; j < al; j += 2) {
					var j2 = j + 1;
					var key = arr[j];
					var value = arr[j2];
					count++;
					if (fun(key, value, data)) {
						arr.splice(j, 2);
						this.currentSize--;
						j -= 2;
						al -= 2;
					}
				}
			}
		}
		return count;
	};

	HashMapI.prototype.clearTo = function(cap) {
		var i = 0;
		if (cap < this.backend.length) {
			this.backend.length = cap;
		}
		for (i = 0; i < this.backend.length; i++) {
			this.backend[i] = [];
		}
		for (i = this.backend.length; i < cap; i++) {
			this.backend.push([]);
		}
	};

	HashMapI.prototype.clear = function() {
		this.clearTo(this.backend.length);
	};

	HashMapI.prototype.size = function() {
		return this.currentSize;
	}

})();
