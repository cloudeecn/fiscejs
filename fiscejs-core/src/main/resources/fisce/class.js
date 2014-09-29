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
 * @param {FyClassLoader}
 *            classloader
 * @param {string} name
 * @param {Object}
 *            classDef
 * @param {FyClassDef}
 *            global
 */
function FyClass(classloader, name, classDef, global) {
  /**
   * @type {FyContext}
   */
  var context = classloader.context;
  /**
   * @type {FyClassLoader}
   */
  this.classloader = classloader;

  /**
   * @type {string}
   */
  this.name = name;
  /**
   * @type {FyClassDef}
   */
  this.global = global;
  /**
   * @type {Array.<number>}
   */
  this.constants = [];

  /**
   * @type {number}
   */
  this.staticSize = 0 | 0;
  /**
   * @type {number}
   */
  this.sizeRel = 0 | 0;

  /**
   * @type {number}
   */
  this.type = 0;
  /**
   * @type {number}
   */
  this.accessFlags = 0;
  /**
   * @type {string}
   */
  this.pType = "";
  /**
   * @type {FyClass}
   */
  this.contentClass = null;
  /**
   * @type {string}
   */
  this.sourceFile = "";
  /**
   * @type {FyClass}
   */
  this.superClass = null;

  if (this.name.charAt(0) === "[") {
    this.type = FyConst.TYPE_ARRAY;

    this.accessFlags = (FyConst.FY_ACC_PUBLIC & FyConst.FY_ACC_FINAL) | 0;
    this.arrayType = FyClassLoader.getArrayContentType(this.name);
    this.pType = "";
    this.contentClass = classloader.lookupAndPend(FyClassLoader
      .getArrayContentName(this.name));

    this.sourceFile = "";
    this.superClass = classloader.lookupAndPend(FyConst.FY_BASE_OBJECT);
  } else if (this.name.charAt(0) === "<") {
    this.type = FyConst.TYPE_PRIMITIVE;

    this.accessFlags = (FyConst.FY_ACC_PUBLIC & FyConst.FY_ACC_FINAL) | 0;
    this.arrayType = 0 | 0;
    if (!(this.name in FyContext.mapPrimitivesRev)) {
      throw new FyException(null, "Illegal class name " + this.name);
    }
    this.pType = FyContext.mapPrimitivesRev[this.name];
    this.contentClass = null;

    this.sourceFile = "";
    this.superClass = classloader.lookupAndPend(FyConst.FY_BASE_OBJECT);
  } else {
    this.type = FyConst.TYPE_OBJECT;

    FyUtils.cloneIntArray(classDef["constants"], this.constants);

    this.accessFlags = classDef["accessFlags"] | 0;
    this.arrayType = 0 | 0;
    this.pType = "";
    this.contentClass = null;

    this.sourceFile = "";
    if ("sourceFile" in classDef && classDef["sourceFile"] !== 0) {
      this.sourceFile = global.strings[classDef["sourceFile"]];
    }
    this.superClass = null;
    if ("superClassData" in classDef) {
      var superClassData = classDef["superClassData"] | 0;
      if (superClassData !== 0) {
        var superClassConstant = this.constants[classDef["superClassData"]];
        this.superClass = classloader.lookupConstantAndPend(global,
          superClassConstant);
      }
    }

    this.staticSize += classDef["staticSize"] | 0;
    this.sizeRel += classDef["sizeRel"] | 0;

  }
  /**
   * @type {number}
   */
  this.sizeAbs = this.sizeRel;

  /**
   * @type {number}
   */
  this.staticPos = 0 | 0;
  if (this.staticSize > 0) {
    this.staticPos += context.heap.allocateStatic(this.staticSize, false);
  }

  /**
   * @type {Array.<FyField>}
   */
  this.fields = new Array();
  /**
   * @type {Array.<FyMethod>}
   */
  this.methods = new Array();
  /**
   * @type {Array.<FyClass>}
   */
  this.interfaces = new Array();

  /**
   * @type {number}
   */
  this.phase = 0 | 0;

  /** Filled by class loader 
   * @type {number}
   */
  this.classId = 0 | 0;

  /**
   * @type {number}
   */
  this.clinitThreadId = 0 | 0;
  /**
   * @type {FyMethod}
   */
  this.clinit = null;

  /* BEGIN GC Only */
  /**
   * @type {Array.<FyField>}
   */
  this.fieldStatic = new Array();
  /**
   * @type {Array.<FyField>}
   */
  this.fieldAbs = new Array();
  /* END GC Only */

  this.virtualTable = new HashMapI(-1, 3, 0.75);

};

/**
 * @export
 * @return {FyClassDef}
 */
FyClass.prototype.getGlobal = function() {
    return this.global;
}

/**
 * @export
 * @return {Array.<number>}
 */
FyClass.prototype.getConstants = function() {
  return this.constants;
}

/**
 * @param {FyMethod}
 *            clinitMethod
 */
FyClass.prototype.setClinitMethod = function(clinitMethod) {
  this.clinit = clinitMethod;
};

/**
 *
 * @param {number}
 *            phase
 */
FyClass.prototype.setPhase = function(phase) {
  this.phase = phase | 0;
};

/**
 *
 * @param {number}
 *            cid
 */
FyClass.prototype.setClassId = function(cid) {
  this.classId = cid | 0;
}

/**
 * @param {number}
 *            flag
 */
FyClass.prototype.addAccessFlag = function(flag) {
  this.accessFlags |= flag | 0;
}

/**
 * @returns {number}
 */
FyClass.prototype.getAccessFlag = function() {
  return this.accessFlags | 0;
}

FyClass.prototype.toString = function() {
  return "{class}" + this.name;
};