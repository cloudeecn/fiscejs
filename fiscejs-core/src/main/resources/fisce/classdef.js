/**
 * Copyright 2013 Yuxuan Huang. All rights reserved.
 *
 * This file is part of fiscejs.
 *
 * fiscejs is free software: you can redistribute it and/or modify it under the
 * terms of the GNU General Public License as published by the Free Software
 * Foundation, either version 3 of the License, or any later version.
 *
 * fiscejs is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
 * A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along with
 * fiscejs. If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * @class
 * @constructor
 * @struct
 */
function FyClassDef() {
  /**
   * @dict
   * @private
   * @type {Object.<string, string>}
   */
  this.classes = {};
  /**
   * @type {Array.<string>}
   */
  this.strings = null;
  /**
   * @type {Int32Array}
   */
  this.constants = null;

  /**
   * @dict
   * @private
   * @type {Object.<string,string>}
   */
  this.files = {};
};

/**
 * @param  {string} str
 */
FyClassDef.prototype.addStrings = function(str) {
  if (this.strings) {
    throw new FyException(null, "Illegal status: strings already parsed");
  }
  var t0 = performance.now();
  var decompressed = LZString
    .decompressFromUTF16(str);
  var pos = 0;
  var idx;
  var len = decompressed.length;
  var strLen;
  this.strings = [];
  while (pos < len) {
    strLen = decompressed.charCodeAt(pos++);
    if (pos + strLen > len) {
      throw new FyException(null, "Failed decoding strings strId=" + this.strings.length + " pos=" + pos + " strLen=" + strLen + " len=" + len);
    }
    this.strings.push(decompressed.substring(pos, pos + strLen));
    pos += strLen;
  }
  console.log("String decode " + (performance.now() - t0) + "ms, entries=" + this.strings.length);
};

/**
 * @param  {string} str
 */
FyClassDef.prototype.addConstants = function(str) {
  if (this.constants) {
    throw new FyException(null, "Illegal status: constants already parsed");
  }
  var t0 = performance.now();
  var constantsStr = LZString
    .decompressFromUTF16(str);
  this.constants = new Int32Array(
    constantsStr.length >> 1);
  for (var i = 0, max = constantsStr.length; i < max; i++) {
    this.constants[i >> 1] |= constantsStr
      .charCodeAt(i) << ((i & 1) << 4);

  }
  console.log("Constants decode " + (performance.now() - t0) + "ms");
}

/**
 * @param  {string} name
 * @param  {string} def
 */
FyClassDef.prototype.addClassDef = function(name, def) {
  this.classes[name] = def;
}

/**
 * @param  {string} name
 * @param  {string} content
 */
FyClassDef.prototype.addFile = function(name, content) {
  this.files[name] = content;
}

/**
 * @param  {string} name
 * @return {string|null} class define
 */
FyClassDef.prototype.getClass = function(name) {
  if (name in this.classes) {
    return this.classes[name];
  } else {
    return null;
  }
}

/**
 * @param  {string} name
 * @return {string|null} content
 */
FyClassDef.prototype.getFile = function(name) {
  if (name in this.files) {
    return this.files[name];
  } else {
    return null;
  }
}

/**
 * @class
 * @constructor
 * @extends {FyClassDef}
 */
function FyRemoteClassDef(iframeWindow) {
  FyClassDef.apply(this, []);
  this.iframeWindow = iframeWindow;
}

FyRemoteClassDef.prototype = new FyClassDef();

/**
 * @param  {string} name
 * @return {string} class define
 */
FyRemoteClassDef.prototype.getClass = function(name) {
  return this.iframeWindow["getClassDef"](name);
}

/**
 * @param  {string} name
 * @return {string} content
 */
FyRemoteClassDef.prototype.getFile = function(name) {
  return this.iframeWindow["getFile"](name);
}