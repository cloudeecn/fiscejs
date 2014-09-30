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
 * @struct
 * @export
 * @constructor
 * @param {FyClass}
 *            owner
 * @param {Object}
 *            fieldDef
 * @param {Array.<string>}
 *            strings
 */
function FyField(owner, fieldDef, strings) {
  /**
   * @type {FyClass}
   */
  this.owner = owner;

  /**
   * @type {number}
   */
  this.accessFlags = fieldDef["accessFlags"] | 0;
  /**
   * @type {number}
   */
  this.posRel = fieldDef["posRel"] | 0;
  /**
   * @type {number}
   */
  this.size = fieldDef["size"] | 0;
  /**
   * @type {number}
   */
  this.constantValueData = fieldDef["constantValueData"] | 0;

  /**
   * @type {string}
   */
  this.name = strings[fieldDef["name"] | 0];
  /**
   * @type {string}
   */
  this.descriptor = strings[fieldDef["descriptor"] | 0];
  /**
   * @type {string}
   */
  this.fullName = "." + this.name + "." + this.descriptor;
  /**
   * @type {string}
   */
  this.uniqueName = "" + owner.name + this.fullName;

  /**
   * @type {number}
   */
  this.posAbs = this.posRel;
  /**
   * @type {number}
   */
  this.fieldId = 0 | 0;
  /**
   * @type {FyClass}
   */
  this.type = null;
}

/**
 * @param {number} fid
 */
FyField.prototype.setFieldId = function(fid) {
  this.fieldId = fid | 0;
};

/**
 * @param {number} cvd
 */
FyField.prototype.setConstantValueData = function(cvd) {
  this.constantValueData = cvd | 0;
}

FyField.prototype.toString = function() {
  return "{Field}" + this.uniqueName;
};