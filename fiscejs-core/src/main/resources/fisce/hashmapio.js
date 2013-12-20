var HashMapIObj;
(function() {
	"use strict";

	/**
	 * @param {Number}
	 *            idx
	 * @param {Object}
	 *            obj
	 */
	function Entry(idx, obj) {
		this.idx = idx;
		this.obj = obj;
	}
	
	/**
	 * @param {Number}
	 *            capShift
	 * @param {Number}
	 *            factor
	 */
	HashMapIObj = function(capShift, factor) {
		if (!capShift) {
			capShift = 4;
		}
		if (!factor) {
			factor = 0.75;
		}
		this.capShift = capShift | 0;
		this.cap = 1 << capShift;
		this.capMask = this.cap - 1;
		this.factor = factor;
		this.content = new Array(this.cap);
		this.size = 0;
	};

	HashMapIObj.prototype._findPosition = function(key) {
		var pos = key & this.capMask;
		var content = this.content;
		while (true) {
			/**
			 * @returns {Entry}
			 */
			var entry = content[pos];
			if (entry === undefined || entry.idx === key) {
				return pos;
			}
			pos++;
			if (pos >= content.length) {
				pos = 0;
			}
		}
	};

	HashMapIObj.prototype._expand = function() {
		this.capShift++;
		this.cap = 1 << this.capShift;
		this.capMask = this.cap - 1;
		var old = this.content;
		var content = this.content = new Array(this.cap);
		for (var i = old.length; i--;) {
			/**
			 * @returns {Entry}
			 */
			var entry = old[i];
			if (entry !== undefined) {
				var pos = this._findPosition(entry.idx);
				content[pos] = entry;
			}
		}
	};

	/**
	 * 
	 * @param {Number}
	 *            key
	 * @param {Object}
	 *            value
	 * @returns {Object} old value
	 */
	HashMapIObj.prototype.put = function(key, value) {
		if (this.size >= this.content.length * this.factor) {
			this._expand();
		}
		var pos = this._findPosition(key);
		/**
		 * @returns {Entry}
		 */
		var old = this.content[pos];
		if (old === undefined) {
			this.size++;
			this.content[pos] = new Entry(key, value);
			return undefined;
		} else {
			var ret = old.obj;
			old.obj = value;
			return ret;
		}
	};

	HashMapIObj.prototype.get = function(key) {
		var entry = this.content[this._findPosition(key)];
		return entry === undefined ? undefined : entry.obj;
	};

	HashMapIObj.prototype.remove = function(key) {
		var pos = this._findPosition(key);
		var entry;
		if (entry = this.content[pos]) {
			this.size--;
			this.content[pos] = undefined;
			return entry.obj;
		} else {
			return undefined;
		}
	};

	HashMapIObj.prototype.contains = function(key) {
		var pos = this._findPosition(key);
		return !!this.content[pos];
	};

	HashMapIObj.prototype.iterate = function(fun, data) {
		var entry;
		for (var i = this.content.length; i--;) {
			if (entry = this.content[i]) {
				fun(entry.idx, entry.obj);
			}
		}
	};

})();
