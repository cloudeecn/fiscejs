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
 * @constructor
 * @private
 * @struct
 * @param {number} key
 * @param {number} value
 */
function EntryII(key, value) {
  this.key = key | 0;
  this.value = value | 0;
}

/**
 * @returns {number}
 */
EntryII.prototype.getKey = function() {
  return this.key;
}

/**
 * @returns {number}
 */
EntryII.prototype.getValue = function() {
  return this.value;
}

/**
 * @param {number} key
 */
EntryII.prototype.setKey = function(key) {
  this.key = key | 0;
}

/**
 * @param {number} value
 */
EntryII.prototype.setValue = function(value) {
  this.value = value | 0;
}

/**
 * @constructor
 * @struct
 * @export
 * @class
 * @param {number}
 *            nullNumber
 * @param {number}
 *            capShift
 * @param {number}
 *            factor
 */
function HashMapI(nullNumber, capShift, factor) {
  // forceOptimize(HashMapI);
  var cs = capShift | 0;
  var cap = (1 << cs) | 0;
  /**
   * @type {number}
   */
  this.nullNumber = nullNumber | 0;
  /**
   * @type {number}
   */
  this.capShift = cs | 0;
  /**
   * @type {number}
   */
  this.capMask = (cap - 1) | 0;
  /**
   * @type {number}
   */
  this.factor = factor;
  /**
   * @type {number}
   */
  this.maxSize = (cap * factor) | 0;
  /**
   * @type {number}
   */
  this.currentSize = 0;
  /**
   * @type {Array.<Array.<EntryII>>}
   */
  this.backend = null;
  this.clear();
};

/**
 * @private
 * @param  {number} key
 * @return {number}
 */
HashMapI.prototype._pos = function(key) {
  return (key & this.capMask) | 0;
}

/**
 * @private
 */
HashMapI.prototype.expand = function() {
  // forceOptimize(this.expand);
  var max;

  var capShift = this.capShift + 1;
  var cap = (1 << capShift);
  var capMask = cap - 1;
  var maxSize = (cap * this.factor) | 0;
  var i;
  var j, al, entry, pos;
  var arr;

  this.capShift = capShift | 0;
  this.capMask = capMask | 0;
  this.maxSize = maxSize | 0;

  var oldLength = this.backend.length;

  //this.backend.length = cap;

  for (i = oldLength; i < cap; i++) {
    this.backend.push(null);
  }

  for (i = 0; i < oldLength; i++) {
    arr = this.backend[i];
    if (arr !== null) {
      al = arr.length;
      if (al == 0) {
        // noop
      } else if (al == 1) {
        entry = arr[0];
        pos = this._pos(entry.getKey());
        if (pos !== i) {
          this.backend[i] = null;
          this.backend[pos] = arr;
        }
      } else {
        for (j = 0; j < al; j++) {
          entry = arr[j];
          pos = this._pos(entry.getKey());
          if (pos !== i) {
            // move
            if (this.backend[pos] === null) {
              this.backend[pos] = [entry];
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
 * @export
 * @param {number}
 *            key
 * @param {number}
 *            value
 * @returns {number}
 */
HashMapI.prototype.put = function(key, value) {
  // forceOptimize(this.put);
  key = key | 0;
  value = value | 0;
  var pos = this._pos(key);
  var arr;
  var al;
  var i, entry, ret;
  arr = this.backend[pos];
  if (arr === null) {
    this.backend[pos] = [new EntryII(key, value)];
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
    arr.push(new EntryII(key, value));
    this.currentSize++;
  }
  if (this.currentSize > this.maxSize) {
    this.expand();
  }
  return this.nullNumber;
};

/**
 * @export
 * @param  {number} key
 * @returns {number}
 */
HashMapI.prototype.get = function(key) {
  key = key | 0;
  var pos = this._pos(key);
  var arr;
  var i, entry, al;
  arr = this.backend[pos];
  if (arr === null) {
    return this.nullNumber;
  } else {
    for (i = 0; i < arr.length; i++) {
      entry = arr[i];
      if (entry.getKey() === key) {
        return entry.getValue();
      }
    }
    return this.nullNumber;
  }
};

/**
 * @export
 * @param  {number} key
 * @returns {number}
 */
HashMapI.prototype.remove = function(key) {
  key = key | 0;
  var pos = this._pos(key);
  var arr;
  var i, entry, al;
  arr = this.backend[pos];
  if (arr === null) {
    return this.nullNumber;
  } else {
    for (i = 0; i < arr.length; i++) {
      entry = arr[i];
      if (entry.getKey() === key) {
        arr.splice(i, 1);
        this.currentSize--;
        return entry.getValue();
      }
    }
    return this.nullNumber;
  }
};

/**
 * @export
 * @param  {number} key
 * @returns {boolean}
 */
HashMapI.prototype.contains = function(key) {
  key = key | 0;
  var pos = this._pos(key);
  var arr;
  var i, entry, al;
  arr = this.backend[pos];
  if (arr === null) {
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

/**
 * @export
 * @param  {function(number, number, D):boolean} fun
 * @param {D} data
 * @returns {number}
 * @template D
 */
HashMapI.prototype.iterate = function(fun, data) {
  // forceOptimize(this.iterate);
  var count = 0;
  var entry;
  var i, j, al, arr;
  for (i = 0; i < this.backend.length; i++) {
    arr = this.backend[i];
    if (arr !== null) {
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

/**
 * @export
 */
HashMapI.prototype.clear = function() {
  this.currentSize = 0;
  this.backend = [];
  for (var i = 0, max = this.capMask + 1; i < max; i++) {
    this.backend.push(null);
  }
  // this.currentSize = 0;
  // var i, max = this.backend.length;
  // for (i = 0; i < max; i++) {
  //   this.backend[i] = null;
  // }
};

/**
 * @export
 * @return {number}
 */
HashMapI.prototype.size = function() {
  return this.currentSize | 0;
}