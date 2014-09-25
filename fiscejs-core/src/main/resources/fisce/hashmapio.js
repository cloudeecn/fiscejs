var HashMapIObj;
(function() {
	"use strict";

	function EntryIO(key, value) {
		this.key = key | 0;
		this.value = value;
	}

	EntryIO.prototype.getKey = function() {
		return this.key;
	}

	EntryIO.prototype.getValue = function() {
		return this.value;
	}

	EntryIO.prototype.setKey = function(key) {
		this.key = key | 0;
	}

	EntryIO.prototype.setValue = function(value) {
		this.value = value;
	}

	var DUMMY_ENTRY = new EntryIO(0, {});

	/**
	 * @param {number}
	 *            capShift
	 * @param {number}
	 *            factor
	 */
	HashMapIObj = function(capShift, factor) {
		// forceOptimize(HashMapIObj);
		var cs = capShift | 0;
		var i;
		var cap = (1 << cs) | 0;
		this.capShift = cs | 0;
		this.capMask = (cap - 1) | 0;
		this.factor = factor;
		this.maxSize = parseInt(cap * factor) | 0;
		this.currentSize = 0;
		this.backend = new Array(cap);
	};

	HashMapIObj.prototype._pos = function(key) {
		return (key & this.capMask) | 0;
	}

	HashMapIObj.prototype.expand = function() {
		// forceOptimize(this.expand);
		var max;

		var capShift = this.capShift + 1;
		var cap = (1 << capShift);
		var capMask = cap - 1;
		var maxSize = parseInt(cap * this.factor) | 0;
		var i;
		var j, al, entry, pos;
		var arr;

		this.capShift = capShift | 0;
		this.capMask = capMask | 0;
		this.maxSize = maxSize | 0;

		var oldLength = this.backend.length;

		this.backend.length = cap;

		// for (i = this.backend.length; i < cap; i++) {
		// this.backend.push(this.EMPTY);
		// }

		for (i = 0; i < oldLength; i++) {
			arr = this.backend[i];
			if (arr !== undefined) {
				al = arr.length;
				if (al == 0) {
					// noop
				} else if (al == 1) {
					entry = arr[0];
					pos = this._pos(entry.getKey());
					if (pos !== i) {
						this.backend[i] = undefined;
						this.backend[pos] = arr;
					}
				} else {
					for (j = 0; j < al; j++) {
						entry = arr[j];
						pos = this._pos(entry.getKey());
						if (pos !== i) {
							// move
							if (this.backend[pos] === undefined) {
								this.backend[pos] = [ entry ];
							} else {
								this.backend[pos].push(entry);
							}
							arr.splice(j, 1);
							j--;
							al--;
						}
					}
				}
			}
		}
	};

	/**
	 * 
	 * @param {number}
	 *            key
	 * @param {number}
	 *            value
	 * @returns {number}
	 */
	HashMapIObj.prototype.put = function(key, value) {
		key = key | 0;
		// forceOptimize(this.put);
		var pos = this._pos(key);
		var arr;
		var al;
		var i, entry, ret;
		arr = this.backend[pos];
		if (arr === undefined) {
			this.backend[pos] = [ new EntryIO(key, value) ];
			this.currentSize++;
		} else {
			for (i = 0; i < arr.length; i++) {
				entry = arr[i];
				if (entry.getKey() === key) {
					ret = entry.getValue();
					entry.setValue(value);
					return ret;
				}
			}
			arr.push(new EntryIO(key, value));
			this.currentSize++;
		}
		if (this.currentSize > this.maxSize) {
			this.expand();
		}
		return undefined;
	};

	HashMapIObj.prototype.get = function(key) {
		key = key | 0;
		var pos = this._pos(key);
		var arr;
		var i, entry = DUMMY_ENTRY;
		arr = this.backend[pos];
		if (arr === undefined) {
			return undefined;
		} else {
			for (i = 0; i < arr.length; i++) {
				entry = arr[i];
				if (entry.getKey() === key) {
					return entry.value;
				}
			}
			return undefined;
		}
	};

	HashMapIObj.prototype.remove = function(key) {
		key = key | 0;
		var pos = this._pos(key);
		var arr;
		var i, entry, al;
		arr = this.backend[pos];
		if (arr === undefined) {
			return undefined;
		} else {
			for (i = 0; i < arr.length; i++) {
				entry = arr[i];
				if (entry.getKey() === key) {
					arr.splice(i, 1);
					this.currentSize--;
					return entry.value;
				}
			}
			return undefined;
		}
	};

	HashMapIObj.prototype.contains = function(key) {
		key = key | 0;
		var pos = this._pos(key);
		var arr;
		var i, entry = DUMMY_ENTRY;
		arr = this.backend[pos];
		if (arr === undefined) {
			return false;
		} else {
			for (i = 0; i < arr.length; i++) {
				entry = arr[i];
				if (entry.getKey() === key) {
					return true;
				}
			}
			return false;
		}
	};

	HashMapIObj.prototype.iterate = function(fun, data) {
		// forceOptimize(this.iterate);
		var count = 0;
		var entry;
		var i, j, al, arr;
		for (i = 0; i < this.backend.length; i++) {
			arr = this.backend[i];
			if (arr !== undefined) {
				al = arr.length;
				for (j = 0; j < al; j++) {
					entry = arr[j];
					count++;
					if (fun(entry.getKey(), entry.getValue(), data)) {
						arr.splice(j, 1);
						this.currentSize--;
						j--;
						al--;
					}
				}
			}
		}
		return count;
	};

	HashMapIObj.prototype.clear = function() {
		this.currentSize = 0;
		var i;
		for (i = 0; i < this.backend.length; i++) {
			this.backend[i] = undefined;
		}
	};

	HashMapIObj.prototype.size = function() {
		return this.currentSize | 0;
	}

})();
