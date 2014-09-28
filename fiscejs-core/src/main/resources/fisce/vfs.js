var FyVFS;
(function() {

	/**
	 * @param {string}
	 *            filename
	 * @param {string}
	 *            string
	 * @param {number}
	 *            pos
	 * @param {number}
	 *            len
	 */
	function VFSEntry(filename, string, pos) {
		this.pos = pos | 0;
		this.content = FyUtils.unbase64(string, null, 0, 0);
		console.log("Decompress string " + string + " to byte["
				+ this.content.length + "]");
		this.len = this.content.length;
	}

	VFSEntry.prototype.read = function() {
		if (this.pos >= this.len) {
			// console.log("#VFS read done");
			return -1;
		}
		var ret = this.content[this.pos++];
		// console.log("#VFS read pos=" + this.pos + " len=" + this.len + "
		// got="
		// + ret);
		return ret;
	};

	VFSEntry.prototype.readTo = function(target, pos, len) {
		if ((this.len - this.pos) > len) {
			for (var i = len; i--;) {
				target[pos + i] = this.content[this.pos + i];
			}
			// console.log("#VFS readTo pos=" + this.pos + " len=" + this.len
			// + " toLen=" + len);
			this.pos += len;
			return len;
		} else if ((this.len - this.pos) <= 0) {
			// console.log("#VFS readTo done");
			return -1;
		} else {
			var realLen = this.len - this.pos;
			for (var i = realLen; i--;) {
				target[pos + i] = this.content[this.pos + i];
			}
			// console.log("#VFS readTo pos=" + this.pos + " len=" + this.len
			// + " toLen=" + realLen);
			this.pos = this.len;
			return realLen;
		}
	};

	FyVFS = function(namespace) {
		this.entries = [];
		this.namespace = namespace;
	};

	function createKey(namespace, name) {
		if (!name.startsWith("/")) {
			name = "/" + name;
		}
		return "vfs_" + namespace + "_" + name;
	}

	FyVFS.prototype.add = function(name, content) {
		// TODO
		return;
		/*
		for ( var name in json) {
			var key = createKey(this.namespace, name);
			localStorage.setItem(key, json[name]);
		}
		*/
	};

	FyVFS.prototype.bind = function(handle, name, pos) {
		if (this.entries[handle]) {
			return;
		}

		var key = createKey(this.namespace, name);

		/**
		 * @returns {string}
		 */
		var str = localStorage.getItem(key);

		if (!str) {
			throw new FyException(FyConst.FY_EXCEPTION_FNF, name);
		} else {
			pos = pos | 0;
			this.entries[handle] = new VFSEntry(name, str, pos);
		}
	};

	FyVFS.prototype.close = function(handle) {
		delete this.entries[handle];
	};

	FyVFS.prototype.read = function(handle) {
		/**
		 * @returns {VFSEntry}
		 */
		var entry = this.entries[handle];
		if (!entry) {
			throw new FyException(null,
					"Can't get VFSEntry for ResourceInputStream #" + handle);
		}
		return entry.read();
	};

	FyVFS.prototype.read = function(handle) {
		/**
		 * @returns {VFSEntry}
		 */
		var entry = this.entries[handle];
		if (!entry) {
			throw new FyException(null,
					"Can't get VFSEntry for ResourceInputStream #" + handle);
		}
		return entry.read();
	};

	FyVFS.prototype.readTo = function(handle, target, pos, len) {
		/**
		 * @returns {VFSEntry}
		 */
		var entry = this.entries[handle];
		if (!entry) {
			throw new FyException(null,
					"Can't get VFSEntry for ResourceInputStream #" + handle);
		}
		return entry.readTo(target, pos, len);
	};
})();