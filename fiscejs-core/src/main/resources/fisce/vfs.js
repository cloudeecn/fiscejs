/**
 * @class
 * @private
 * @constructor
 * @param {string}
 *            filename
 * @param {string}
 *            string
 */
function VFSEntry(filename, string) {
  var content = LZString.decompressFromUTF16(string);
  this.filename = filename;
  this.len = content.charCodeAt(0) + (content.charCodeAt(1) << 16);
  this.content = content.substring(2);
  this.refs = 0;
  console.log("Decompress string[" + string.length + "] to utf-string[" + this.content.length + "/" + this.len + "]");
}

/**
 * @param  {number} pos
 * @return {number}
 */
VFSEntry.prototype.read = function(pos) {
  if (pos >= this.len) {
    // console.log("#VFS read done");
    return -1;
  }
  return (this.content.charCodeAt(pos >> 1) >> ((pos & 1) << 3)) & 0xff;
  /*
	var pairPos = pos > 1;
	var pairRem = pos & 1;
	var codePos = ((pairPos / 15) | 0) * 16;
	var codeRem = (pairPos % 15) + 1;
	var pairValue =
		((this.content.charCodeAt(codePos) - 32) << codeRem) +
		((this.content.charCodeAt(codePos + 1) - 32) >> (15 - codeRem));
	return (pairValue >> (pairRem << 3)) & 0xff;
	*/
}

/**
 * @class
 * @private
 * @constructor
 * @param {VFSEntry} entry
 * @param {number} pos
 */
function VFSStreamPair(entry, pos) {
  this.entry = entry;
  this.pos = pos | 0;
  this.len = entry.len;
}

/**
 * @return {number}
 */
VFSStreamPair.prototype.read = function() {
  var ret = this.entry.read(this.pos);
  if (ret >= 0) {
    this.pos++;
  }
  return ret;
};

/**
 * @param  {Array.<number>|Int32Array} target
 * @param  {number} pos
 * @param  {number} len
 * @return {number}
 */
VFSStreamPair.prototype.readTo = function(target, pos, len) {
  if ((this.len - this.pos) > len) {
    for (var i = len; i--;) {
      target[pos + i] = this.entry.read(this.pos + i);
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
      target[pos + i] = this.entry.read(this.pos + i);
    }
    // console.log("#VFS readTo pos=" + this.pos + " len=" + this.len
    // + " toLen=" + realLen);
    this.pos = this.len;
    return realLen;
  }
};

/**
 * @class
 * @constructor
 * @param {FyContext} context
 */
function FyVFS(context) {
  /**
   * @const
   * @type {FyContext}
   */
  this.context = context;
  /**
   * @type {Object.<string, VFSEntry>}
   */
  this.nameEntryMap = {};
  /**
   * @type {HashMapIObj.<VFSStreamPair>}
   */
  this.entries = new HashMapIObj(3, 0.8, null);
};

/**
 * @param {number} handle
 * @param {string} name
 * @param {number} pos
 */
FyVFS.prototype.bindHandle = function(handle, name, pos) {
  handle = handle | 0;
  if (handle === 0) {
    throw new FyException(FyConst.FY_EXCEPTION_NPT, "");
  }
  // already bound
  if (this.entries.contains(handle)) {
    return;
  }
  var entry;

  if (name.charAt(0) == "/") {
    name = name.substring(1);
  }

  if (name in this.nameEntryMap) {
    entry = this.nameEntryMap[name];
  } else {
    /**
     * @type {FyClassDef}
     */
    var def = null;

    for (var i = this.context.classDefs.length - 1; i >= 0; i--) {
      if (name in this.context.classDefs[i].files) {
        def = this.context.classDefs[i];
      }
    }
    if (!def) {
      throw new FyException(FyConst.FY_EXCEPTION_FNF, name);
    } else {
      entry = new VFSEntry(name, def.files[name]);
      this.nameEntryMap[name] = entry;
    }
  }
  entry.refs++;
  this.entries.put(handle, new VFSStreamPair(entry, pos));
};

FyVFS.prototype.close = function(handle) {
  var vsp = this.entries.remove(handle);
  if (!vsp) {
    throw new FyException(null, "Close unbound handle #" + handle);
  }
  var entry = vsp.entry;
  entry.refs--;
  if (entry.refs == 0) {
    //release entry
    delete this.nameEntryMap[entry.filename];
  }
};

FyVFS.prototype.read = function(handle) {
  /**
   * @type {VFSStreamPair}
   */
  var vsp = this.entries.get(handle);
  if (!vsp) {
    throw new FyException(null,
      "Can't get VFSStreamPair for ResourceInputStream #" + handle);
  }
  return vsp.read();
};


FyVFS.prototype.readTo = function(handle, target, pos, len) {
  /**
   * @type {VFSStreamPair}
   */
  var vsp = this.entries.get(handle);
  if (!vsp) {
    throw new FyException(null,
      "Can't get VFSStreamPair for ResourceInputStream #" + handle);
  }
  return vsp.readTo(target, pos, len);
};