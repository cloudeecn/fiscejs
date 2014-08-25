var HashMapI;
(function() {
	/**
	 * @param {Number}
	 *            capShift
	 * @param {Number}
	 *            factor
	 */
	HashMapI = function(nullNumber, capShift, factor) {
		this.nullNumber = nullNumber | 0;
		this.backend = [];
		Object.preventExtensions(this);
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
		this.backend[key | 0] = value | 0;
	};

	HashMapI.prototype.get = function(key) {
		var value = this.backend[key];
		if (value === undefined) {
			value = this.nullNumber;
		}
		return value;
	};

	HashMapI.prototype.remove = function(key) {
		delete this.backend[key];
	};

	HashMapI.prototype.contains = function(key) {
		return this.get(key) !== this.nullNumber;
	};

	HashMapI.prototype.iterate = function(fun, data) {
		var keys = Object.keys(this.backend);
		var imax = keys.length;
		for (var i = 0; i < imax; i++) {
			var key = keys[i];
			if (fun(key | 0, this.backend[key] | 0, data)) {
				delete this.backend[key];
			}
		}
		return imax;
	};

	HashMapI.prototype.clear = function() {
		this.backend.length = 0;
	};

})();
