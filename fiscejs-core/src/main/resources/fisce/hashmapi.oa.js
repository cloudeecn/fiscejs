var HashMapI;
(function() {
	/**
	 * @param {Number}
	 *            capShift
	 * @param {Number}
	 *            factor
	 */
	HashMapI = function(nullNumber, capShift, factor) {
		nullNumber = nullNumber | 0;
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
		this.content = new Int32Array(this.cap << 1);
		this.nullNumber = nullNumber;
		this.size = 0;
		this.contentsNullKey = false;
		this.nullKeyValue = nullNumber;
		for (var i = 0; i < this.content.length; i++) {
			this.content[i] = nullNumber;
		}
		Object.preventExtensions(this);
	};

	HashMapI.prototype._findPosition = function(key) {
		var pos = (key & this.capMask) << 1;
		var content = this.content;
		var ret = 0;
		while (true) {
			var keyGot = content[pos];
			if (keyGot === this.nullNumber || keyGot === key) {
				ret = pos;
				break;
			}
			pos += 2;
			if (pos >= content.length) {
				pos = 0;
			}
		}
		return ret | 0;
	};

	HashMapI.prototype._expand = function() {
		this.capShift++;
		this.cap = 1 << this.capShift;
		this.capMask = this.cap - 1;
		var old = this.content;
		var content = this.content = new Int32Array(this.cap << 1);
		var imax;
		for (var i = 0; i < content.length; i++) {
			content[i] = this.nullNumber;
		}
		imax = old.length >> 1;
		for (var i = 0; i < imax; i++) {
			var key = old[i << 1];
			if (key !== this.nullNumber) {
				var pos = this._findPosition(key);
				content[pos] = key;
				content[pos + 1] = old[(i << 1) + 1];
			}
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
		key = key | 0;
		if (key === this.nullNumber) {
			if (!this.contentsNullKey) {
				this.contentsNullKey = true;
				this.size++;
				this.nullKeyValue = value;
				return this.nullNumber;
			} else {
				var old = this.nullKeyValue;
				this.nullKeyValue = value;
				return old;
			}
		} else {
			if (this.size >= (this.content.length >> 1) * this.factor) {
				this._expand();
			}
			var pos = this._findPosition(key);
			var old = this.content[pos + 1];
			if (this.content[pos] === this.nullNumber) {
				this.size++;
				this.content[pos] = key;
			}
			this.content[pos + 1] = value;
			return old;
		}
	};

	HashMapI.prototype.get = function(key) {
		key = key | 0;
		if (key === this.nullNumber) {
			return this.nullKeyValue | 0;
		} else {
			return this.content[this._findPosition(key) + 1];
		}
	};

	HashMapI.prototype.remove = function(key) {
		throw new FyException(undefined, "HashMapI.remove is not implemented");
		if (key === this.nullNumber) {
			if (this.contentsNullKey) {
				var old = this.nullKeyValue;
				this.nullKeyValue = this.nullNumber;
				this.size--;
				return old;
			} else {
				return this.nullNumber;
			}
		} else {
			var pos = this._findPosition(key);
			if (this.content[pos] !== this.nullNumber) {
				this.size--;
				var ret = this.content[pos + 1];
				this.content[pos] = this.nullNumber;
				this.content[pos + 1] = this.nullNumber;
				return ret;
			} else {
				return this.nullNumber;
			}
		}
	};

	HashMapI.prototype.contains = function(key) {
		var pos = this._findPosition(key | 0);
		return this.content[pos] !== this.nullNumber;
	};

	HashMapI.prototype.iterate = function(fun, data) {
		var imax = this.content.length;
		if (this.contentsNullKey) {
			fun(this.nullNumber, this.nullKeyValue, data);
		}
		for (var i = 0; i < imax; i += 2) {
			if (this.content[i] !== this.nullNumber) {
				fun(this.content[i], this.content[i + 1], data);
			}
		}
	};

	HashMapI.prototype.clear = function() {
		this.size = 0;
		var imax = this.content.length;
		for (var i = 0; i < imax; i++) {
			this.content[i] = this.nullNumber;
		}
	};

})();
