var FyVFS;
(function() {

	var code = new HashMapI(-1, 7, 0.75);

	(function initCode(str) {
		var len = str.length;
		for (var i = len; i--;) {
			code.put(str.charCodeAt(i), i);
		}
	})("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=");

	/**
	 * @param {String}
	 *            filename
	 * @param {String}
	 *            string
	 * @param {Number}
	 *            pos
	 * @param {Number}
	 *            len
	 */
	function VFSEntry(filename, string, pos, len) {
		this.pos = pos | 0;
		this.len = len | 0;
		this.content = new Uint8Array(len);

		var content = this.content;
		var slen = string.length;
		if (slen & 3 !== 0) {
			throw new FyException(FyConst.FY_EXCEPTION_IO,
					"Exception in VFS: Illegal base64 code for file "
							+ filename);
		}
		var i = 0;
		var p = 0;
		while (i < slen) {
			var c1 = code.get(string.charCodeAt(i));
			if (c1 < 0) {
				throw new FyException(FyConst.FY_EXCEPTION_IO,
						"Exception in VFS: Illegal base64 code for file "
								+ filename);
			}
			var c2 = code.get(string.charCodeAt(i + 1));
			if (c2 < 0) {
				throw new FyException(FyConst.FY_EXCEPTION_IO,
						"Exception in VFS: Illegal base64 code for file "
								+ filename);
			}
			var c3 = code.get(string.charCodeAt(i + 2));
			if (c3 < 0) {
				throw new FyException(FyConst.FY_EXCEPTION_IO,
						"Exception in VFS: Illegal base64 code for file "
								+ filename);
			}
			var c4 = code.get(string.charCodeAt(i + 3));
			if (c4 < 0) {
				throw new FyException(FyConst.FY_EXCEPTION_IO,
						"Exception in VFS: Illegal base64 code for file "
								+ filename);
			}

			content[p] = (c1 << 2) | (c2 >> 4);
			if (c3 !== 64) {
				content[p + 1] = ((c2 & 15) << 4) | (c3 >> 2);
			}

			if (c4 !== 64) {
				content[p + 2] = ((c3 & 3) << 6) | c4;
			}

			p += 3;
			i += 4;
		}
		// console.log("#VFS Entry created");
		// console.log(this);
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

	FyVFS.prototype.add = function(json) {
		for ( var name in json) {
			var key = createKey(this.namespace, name);
			localStorage.setItem(key, json[name]);
		}
	};

	FyVFS.prototype.bind = function(handle, name, pos) {
		if (this.entries[handle]) {
			return;
		}

		var key = createKey(this.namespace, name);

		/**
		 * @returns {String}
		 */
		var str = localStorage.getItem(key);

		if (!str) {
			throw new FyException(FyConst.FY_EXCEPTION_FNF, name);
		} else {
			pos = pos | 0;
			var len = str.length / 4 * 3;
			if (str.endsWith("==")) {
				len -= 2;
			} else if (str.endsWith("=")) {
				len--;
			}
			this.entries[handle] = new VFSEntry(name, str, pos, len);
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
		if (entry === undefined) {
			throw new FyException(undefined,
					"Can't get VFSEntry for ResourceInputStream #" + handle);
		}
		return entry.read();
	};

	FyVFS.prototype.read = function(handle) {
		/**
		 * @returns {VFSEntry}
		 */
		var entry = this.entries[handle];
		if (entry === undefined) {
			throw new FyException(undefined,
					"Can't get VFSEntry for ResourceInputStream #" + handle);
		}
		return entry.read();
	};

	FyVFS.prototype.readTo = function(handle, target, pos, len) {
		/**
		 * @returns {VFSEntry}
		 */
		var entry = this.entries[handle];
		if (entry === undefined) {
			throw new FyException(undefined,
					"Can't get VFSEntry for ResourceInputStream #" + handle);
		}
		return entry.readTo(target, pos, len);
	};
})();