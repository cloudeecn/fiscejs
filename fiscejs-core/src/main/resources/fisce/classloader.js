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
 * @struct
 * @param {FyContext}
 *            context
 */
function FyClassLoader(context) {
  /**
   * @type {FyContext}
   */
  this.context = context;
  /**
   * @type {Array.<FyClass>}
   */
  this.pending = [];
  /**
   * @dict
   */
  this.slowObject = JSON.parse("{\"a\": 1}");
}

/**
 * @param {string} name
 * @returns {FyClass}
 */
FyClassLoader.prototype.lookupAndPend = function(name) {
  var clazz = this.context.lookupClassPhase1(name);
  this.pending.push(clazz);
  return clazz;
};

/**
 * @param {number}
 *            constant
 * @returns {FyClass}
 */
FyClassLoader.prototype.lookupConstantAndPend = function(global, constant) {
  var clazz = this.context.lookupClassFromConstantPhase1(global, constant);
  this.pending.push(clazz);
  return clazz;
};

FyClassLoader.prototype.fixPending = function() {
  /**
   * @type {FyClass}
   */
  var clazz;
  while (this.pending.length > 0) {
    clazz = this.pending.pop();
    this.fixPendingSingle(clazz);
  }
};

/**
 * @param  {FyClass} clazz
 */
FyClassLoader.prototype.fixPendingSingle = function(clazz) {
  if (clazz.phase === 1) {
    this.phase2(clazz);
  }

  if (clazz.phase === 2) {
    this.phase3(clazz);
  }
};

/**
 * @dict {number}
 */
FyClassLoader.arrayContentTypeTable = {
  "[Z": FyConst.FY_AT_BYTE,
  "[B": FyConst.FY_AT_BYTE,

  "[D": FyConst.FY_AT_LONG,
  "[J": FyConst.FY_AT_LONG,

  "[C": FyConst.FY_AT_SHORT,
  "[S": FyConst.FY_AT_SHORT
};

/**
 * Get array size shift from array class name
 *
 * @param {string}
 *            arrayName
 * @returns {number}
 */
FyClassLoader.getArrayContentType = function(arrayName) {
  if (arrayName in FyClassLoader.arrayContentTypeTable) {
    return FyClassLoader.arrayContentTypeTable[arrayName];
  } else {
    return FyConst.FY_AT_INT;
  }
};

/**
 * @param  {string} arrayName
 * @return {string}
 */
FyClassLoader.getArrayContentName = function(arrayName) {
  switch (arrayName.charAt(1)) {
    case "[" /* FyConst.ARR */ :
      return arrayName.substring(1, arrayName.length);
    case "L" /* FyConst.L */ :
      return arrayName.substring(2, arrayName.length - 1);
    default:
      return FyContext.primitives[arrayName.charAt(1)];
  }
};

/**
 * @param  {string} arrayContentName
 * @return {string}
 */
FyClassLoader.getArrayName = function(arrayContentName) {
  if (FyContext.mapPrimitivesRev.hasOwnProperty(arrayContentName)) {
    // primitive
    return "[" + FyContext.mapPrimitivesRev[arrayContentName];
  } else if (arrayContentName.charAt(0) === FyConst.FY_TYPE_ARRAY) {
    // array
    return "[" + arrayContentName;
  } else {
    return "[L" + arrayContentName + ";";
  }
};

/**
 *
 * @param {string} name
 * @returns {{classDef : ?, global: !FyClassDef}}
 */
FyClassLoader.prototype.getClassDef = function(name) {
  for (var i = 0, max = this.context.classDefs.length; i < max; i++) {
    /**
     * @type {FyClassDef}
     */
    var cd = this.context.classDefs[i];
    if (name in cd.classes) {
      var classDef = JSON.parse(LZString
        .decompressFromUTF16(cd.classes[name]));
      if (typeof classDef !== "object") {
        throw new FyException(null, "Illegal classDef: " + classDef);
      } else {
        return {
          classDef: classDef,
          global: cd
        };
      }
    }
  }
  throw new FyException(FyConst.FY_EXCEPTION_CLASSNOTFOUND, name);
};

/**
 * @private
 * @param {FyClass}
 *            clazz
 * @param {FyClassDef}
 *            global
 * @param {number}
 *            constant
 */
FyClassLoader.prototype._locAddInterface = function(clazz, global, constant) {
  if (constant >= clazz.constants.length) {
    throw new FyException(null, "IIOB: " + constant + "/" + clazz.constants.length);
  }
  var cvalue = clazz.constants[constant | 0] | 0;
  var intf = this.lookupConstantAndPend(global, cvalue);
  clazz.interfaces.push(intf);
}

/**
 * @private
 * @param {FyClass}
 *            clazz
 * @param {FyClassDef}
 *            global
 * @param {Object}
 *            classDef
 */
FyClassLoader.prototype._locAddInterfaces = function(clazz, global, classDef) {
  var idx = 0;
  var im = classDef["interfaceDatas"]["length"];
  for (idx = 0; idx < im; idx++) {
    var constant = classDef["interfaceDatas"][idx] | 0;
    this._locAddInterface(clazz, global, constant);
  }
};

/**
 * @private
 * @param {FyClass}
 *            clazz
 * @param {Object}
 *            methodDef
 * @param {Array.<string>} strings
 */
FyClassLoader.prototype._locAddMethod = function(clazz, methodDef, strings) {
  /**
   * @type {FyMethod}
   */
  var method = new FyMethod(clazz, methodDef, strings);
  var name = method.uniqueName;
  if (method.accessFlags & FyConstAcc.CLINIT) {
    clazz.setClinitMethod(method);
  }
  if (method.accessFlags & FyConstAcc.NATIVE) {
    if (method.uniqueName in this.context.nativeHandlers) {
      method.invoke = this.context.nativeHandlers[method.uniqueName];
    }
  }
  this.context.registerMethod(method);
  clazz.methods.push(method);
}

/**
 * @private
 * @param {FyClass}
 *            clazz
 * @param {FyClassDef}
 *            global
 * @param {Object}
 *            classDef
 */
FyClassLoader.prototype._locAddMethods = function(clazz, global, classDef) {
  /**
   * @type {Array.<Object>}
   */
  var methodDefs = classDef["methods"];
  var len = methodDefs.length;
  for (var i = 0; i < len; i++) {
    /**
     * @type {Object}
     */
    var methodDef = methodDefs[i];
    this._locAddMethod(clazz, methodDef, global.strings);
  }
};

/**
 * @private
 * @param {FyClass}
 *            clazz
 * @param {Object}
 *            fieldDef
 * @param {Array.<string>} strings
 * @param {Array.<number>|Int32Array} constants
 */
FyClassLoader.prototype._locAddField = function(clazz, fieldDef, strings,
  constants) {
  var field = new FyField(clazz, fieldDef, strings);
  // init static fields for reflection
  if (field.constantValueData !== 0) {
    if ((field.accessFlags & FyConstAcc.STATIC) && (field.accessFlags & FyConstAcc.FINAL)) {
      switch (field.descriptor.charAt(0)) {
        case "Z" /* FyConst.Z */ :
        case "B" /* FyConst.B */ :
        case "S" /* FyConst.S */ :
        case "C" /* FyConst.C */ :
        case "I" /* FyConst.I */ :
        case "F" /* FyConst.F */ :
          this.context.heap
            .putStaticInt(
              clazz,
              field.posRel | 0,
              constants[clazz.constants[fieldDef["constantValueData"]]] | 0);
          break;
        case "D" /* FyConst.D */ :
        case "J" /* FyConst.J */ :
          this.context.heap.putStaticLongFrom(clazz, field.posRel,
            constants,
            clazz.constants[fieldDef["constantValueData"]]);
          break;
        case "L" /* FyConst.L */ :
          if (field.descriptor === "Ljava/lang/String;") {
            if (fieldDef["constantValueData"] > 0 && fieldDef["constantValueData"] < clazz.constants.length) {
              field
                .setConstantValueData(clazz.constants[fieldDef["constantValueData"]]);
            } else {
              throw new FyException(null,
                "Oops! Illegal constant data in field: " + field.uniqueName + ": " + fieldDef["constantValueData"]);
            }
          }
          break;
      }
    }
  }
  clazz.fields.push(field);
  this.context.registerField(field);
}

/**
 * @private
 * @param {FyClass}
 *            clazz
 * @param {FyClassDef}
 *            global
 * @param {Object}
 *            classDef
 */
FyClassLoader.prototype._locAddFields = function(clazz, global, classDef) {
  /**
   * @type {Array.<FyDict>}
   */
  var fieldDefs = classDef["fields"];
  var len = fieldDefs.length;
  for (var i = 0; i < len; i++) {
    /**
     * @type {FyDict}
     */
    var fieldDef = fieldDefs[i];
    this._locAddField(clazz, fieldDef, global.strings, global.constants);
  }
};

/**
 * @private
 * @param {FyClass}
 *            clazz
 * @param {FyClassDef}
 *            global
 * @param {Object}
 *            classDef
 */
FyClassLoader.prototype._locAddExtendedFlags = function(clazz, global, classDef) {
  if (!this.context.TOP_OBJECT && clazz.name === FyConst.FY_BASE_OBJECT) {
    this.context.TOP_OBJECT = clazz;
  } else if (!this.context.TOP_THROWABLE && clazz.name === FyConst.FY_BASE_THROWABLE) {
    this.context.TOP_THROWABLE = clazz;
  } else if (!this.context.TOP_ENUM && clazz.name === FyConst.FY_BASE_ENUM) {
    this.context.TOP_ENUM = clazz;
  } else if (!this.context.TOP_ANNOTATION && clazz.name === FyConst.FY_BASE_ANNOTATION) {
    this.context.TOP_ANNOTATION = clazz;
  } else if (!this.context.TOP_SOFT_REF && clazz.name === FyConst.FY_REF_SOFT) {
    this.context.TOP_SOFT_REF = clazz;
  } else if (!this.context.TOP_WEAK_REF && clazz.name === FyConst.FY_REF_WEAK) {
    this.context.TOP_WEAK_REF = clazz;
  } else if (!this.context.TOP_PHANTOM_REF && clazz.name === FyConst.FY_REF_PHANTOM) {
    this.context.TOP_PHANTOM_REF = clazz;
  } else if (!this.context.TOP_CLASS && clazz.name === FyConst.FY_BASE_CLASS) {
    this.context.TOP_CLASS = clazz;
  } else if (!this.context.TOP_METHOD && clazz.name === FyConst.FY_REFLECT_METHOD) {
    this.context.TOP_METHOD = clazz;
  } else if (!this.context.TOP_CONSTRUCTOR && clazz.name === FyConst.FY_REFLECT_CONSTRUCTOR) {
    this.context.TOP_CONSTRUCTOR = clazz;
  } else if (!this.context.TOP_FIELD && clazz.name === FyConst.FY_REFLECT_FIELD) {
    this.context.TOP_FIELD = clazz;
  }
};

/**
 * @private
 * @param {FyClass}
 *            clazz
 * @param {FyClassDef}
 *            global
 * @param {Object}
 *            classDef
 */
FyClassLoader.prototype._loadObjectClass = function(clazz, global, classDef) {
  this._locAddInterfaces(clazz, global, classDef);
  this._locAddMethods(clazz, global, classDef);
  this._locAddFields(clazz, global, classDef);
  this._locAddExtendedFlags(clazz, global, classDef);
};

/**
 * load class
 *
 * @param {string}
 *            name
 * @returns {FyClass}
 */
FyClassLoader.prototype.loadClass = function(name) {
  // console.log("Load " + name);
  name = this.context.pool(name);
  var clazz;
  if (name.charAt(0) === "[" || name.charAt(0) === "<") {
    var cd = this.getClassDef(FyConst.FY_BASE_OBJECT);
    clazz = new FyClass(this, name, cd.classDef, cd.global);
  } else {
    var cd = this.getClassDef(name);
    clazz = new FyClass(this, name, cd.classDef, cd.global);
    this._loadObjectClass(clazz, cd.global, cd.classDef);
  }
  clazz.setPhase(1);
  return clazz;
};

/**
 * Load class phase 2
 *
 * @param {FyClass}
 *            clazz
 */
FyClassLoader.prototype.phase2 = function(clazz) {
  var tmp, parentSize, fields, field, typeClassName, methods, method, finalizeMethod;
  var i, len, j, j2, maxj;
  if (!clazz || !clazz.name || clazz.phase !== 1) {
    throw new FyException(null,
      "Passed illegal class to class loader phase 2");
  }

  // console.log("Load phase2 " + clazz.name);

  if (clazz.type === FyConst.TYPE_OBJECT) {
    // Count method params already done.
    if (clazz.superClass) {
      // Normal class
      tmp = clazz.superClass;
      parentSize = 0;
      while (tmp) {
        parentSize += tmp.sizeRel;
        if (tmp != this.context.TOP_OBJECT && !tmp.superClass) {
          throw new FyException(null, "broken class link on " + tmp.name);
        }
        tmp = tmp.superClass;
      }
      clazz.sizeAbs += parentSize;
      // console.log("sizeAbs="+clazz.sizeAbs);
      // console.log("parentSize="+parentSize);
      fields = clazz.fields;
      len = fields.length;
      for (i = 0; i < len; i++) {
        /**
         * @returns {FyField}
         */
        field = fields[i];
        if ((field.accessFlags & FyConstAcc.STATIC) === 0) {
          field.posAbs += parentSize;
        }
        // console.log("field "+field+" posAbs="+field.posAbs+"
        // posRel="+field.posRel);
      }

      /**
       * @returns {FyMethod}
       */
      finalizeMethod = this.context.lookupMethodVirtual(clazz,
        FyConst.FY_METHODF_FINALIZE);

      if (finalizeMethod && finalizeMethod.code.length > 3) {
        // console.log("Class " + clazz.name + " requires
        // finalize");
        clazz.accessFlags |= FyConstAcc.NEED_FINALIZE;
      }
    }

    if (this.canCastWithNull(clazz, this.context.TOP_ANNOTATION)) {
      // console.log(clazz.name + " is annotation");
      clazz.accessFlags |= FyConstAcc.ANNOTATION;
    } else if (this.canCastWithNull(clazz, this.context.TOP_ENUM)) {
      // console.log(clazz.name + " is enum");
      clazz.accessFlags |= FyConstAcc.ENUM;
    } else if (this.canCastWithNull(clazz, this.context.TOP_PHANTOM_REF)) {
      // console.log(clazz.name + " is phantom ref");
      clazz.accessFlags |= FyConstAcc.PHANTOM_REF;
    } else if (this.canCastWithNull(clazz, this.context.TOP_WEAK_REF)) {
      // console.log(clazz.name + " is weak ref");
      clazz.accessFlags |= FyConstAcc.WEAK_REF;
    } else if (this.canCastWithNull(clazz, this.context.TOP_SOFT_REF)) {
      // console.log(clazz.name + " is soft ref");
      clazz.accessFlags |= FyConstAcc.SOFT_REF;
    }

    { // method data with types
      methods = clazz.methods;
      len = methods.length;
      for (i = 0; i < len; i++) {
        /**
         * @returns {FyMethod}
         */
        method = methods[i];
        if (method.exceptionTable.length > 0) {
          maxj = method.exceptionTable.length;
          for (j = 0; j < maxj; j += 4) {
            // start end catchidx handler
            j2 = j + 2;
            if (method.exceptionTable[j2]) {
              method.exceptionTable[j2] = this
                .lookupConstantAndPend(
                  clazz.global,
                  clazz.constants[method.exceptionTable[j + 2]]).classId | 0;
            }
          }
        }
      }
    }

    {
      fields = clazz.fields;
      len = fields.length;
      for (i = 0; i < len; i++) {
        /**
         * @returns {FyField}
         */
        field = fields[i];
        // type
        switch (field.descriptor.charAt(0)) {
          case "[" /* FyConst.ARR */ :
            field.type = this.lookupAndPend(field.descriptor);
            break;
          case "L" /* FyConst.L */ :
            field.type = this.lookupAndPend(field.descriptor.substring(
              1, field.descriptor.length - 1));
            break;
          default:
            if (field.descriptor.charAt(0) in FyContext.primitives) {
              typeClassName = FyContext.primitives[field.descriptor
                .charAt(0)];
              field.type = this.lookupAndPend(typeClassName);
            } else {
              throw new FyException(null,
                "Illegal descriptor of field: " + field.descriptor);
            }
        }
      }
    }
  }
  clazz.setPhase(2);
};

/**
 * Load class phase 3
 *
 * @param {FyClass}
 *            clazz
 */
FyClassLoader.prototype.phase3 = function(clazz) {
  // fields data for gc and reflection
  /**
   * @type {Array.<FyField>}
   */
  var fields = clazz.fields;
  /**
   * @type {FyField}
   */
  var field;
  /**
   * @type {FyField}
   */
  var lastField;
  /**
   * @type {boolean}
   */
  var error = false;
  /**
   * @type {number}
   */
  var pos;
  /**
   * @type {number}
   */
  var i = 0 | 0;
  /**
   * @type {number}
   */
  var len = 0 | 0;
  /**
   * @type {number}
   */
  var j;
  /**
   * @type {number}
   */
  var maxj;
  if (clazz.superClass && clazz.superClass.phase < 3) {
    this.fixPendingSingle(clazz.superClass);
  }
  // console.log("Load phase3 " + clazz.name);
  if (clazz.superClass && clazz.superClass.sizeAbs > 0) {
    len = clazz.superClass.sizeAbs;
    // console.log("len=" + len);
    for (i = 0; i < len; i++) {
      // console.log(i + " " + field);
      field = clazz.superClass.fieldAbs[i];
      if (!field) {
        error = false;
        if (i === 0) {
          error = true;
        } else {
          /**
           * @returns {FyField}
           */
          lastField = clazz.fieldAbs[i - 1];
          if (!lastField) {
            error = true;
          } else if (lastField.descriptor !== 'J' && lastField.descriptor !== 'D') {
            error = true;
          }
        }
        if (error) {
          throw new FyException(null, "Parent class of " + clazz.name + " (" + clazz.superClass.name + ") is not correctly loaded");
        }
      }
      clazz.fieldAbs.push(field);
    }
  }

  len = fields.length;
  // console.log(clazz.name + " $$$ " + len);
  for (i = 0; i < len; i++) {
    /**
     * @returns {FyField}
     */
    field = fields[i];
    pos = field.posAbs;
    if (field.accessFlags & FyConstAcc.STATIC) {
      if (pos >= clazz.fieldStatic.length) {
        maxj = pos - clazz.fieldStatic.length;
        for (j = 0; j < maxj; j++) {
          clazz.fieldStatic.push(null);
        }
        clazz.fieldStatic.push(field);
      } else {
        clazz.fieldStatic[pos] = field;
      }
      // console.log(clazz.name + " FieldStatic #" + field.posAbs
      // + " = " + field.name);
    } else {
      if (pos >= clazz.fieldAbs.length) {
        maxj = pos - clazz.fieldAbs.length;
        for (j = 0; j < maxj; j++) {
          clazz.fieldAbs.push(null);
        }
        clazz.fieldAbs.push(field);
      } else {
        clazz.fieldAbs[pos] = field;
      }
      // clazz.fieldAbs.put(field.posAbs, field);
      // console.log(clazz.name + " FieldAbs #" + field.posAbs
      // + " = " + field.name);
    }
  }

  clazz.setPhase(3);
};

/**
 *
 * @param {FyClass}
 *            from
 * @param {FyClass}
 *            to
 * @returns {boolean} whether class [from] can cast to class [to]
 */
FyClassLoader.prototype.canCast = function(from, to) {
  if (!from || !to) {
    throw new FyException(null, "NPT");
  }
  // console.log("Can cast: " + from.name + " => " + to.name);
  if (from === to || to === this.context.TOP_OBJECT) {
    // console.log("true");
    return true;
  }
  if (from.type === FyConst.TYPE_OBJECT) {
    if (to.accessFlags & FyConstAcc.INTERFACE) {
      for (var i = 0, max = from.interfaces.length; i < max; i++) {
        /**
         * @type {FyClass}
         */
        var intf = from.interfaces[i];
        if (this.canCast(intf, to)) {
          // console.log("true");
          return true;
        }
      }
    }
    if (from.superClass) {
      return this.canCast(from.superClass, to);
    }
  } else if (from.type === FyConst.TYPE_ARRAY) {
    if (to.type == FyConst.TYPE_ARRAY) {
      return this.canCast(from.contentClass, to.contentClass);
    } else if (to.type == FyConst.TYPE_OBJECT) {
      return to === this.context.TOP_OBJECT;
    } else {
      return false;
    }
  }
  // console.log("false");
  return false;
};

/**
 * returns whether <b>from</b> is super class of <b>to</b>
 *
 * @param {FyClass}
 *            from
 * @param {FyClass}
 *            to
 * @returns {boolean}
 */
FyClassLoader.prototype.isSuperClassOf = function(from, to) {
  if (from === to) {
    return false;
  }
  return this.canCast(to, from);
};
/**
 *
 * @param {FyClass}
 *            from
 * @param {FyClass}
 *            to
 * @returns {boolean} whether class [from] can cast to class [to] (if to is
 *          undefined it will return false)
 */
FyClassLoader.prototype.canCastWithNull = function(from, to) {
  if (!to) {
    return false;
  } else {
    return this.canCast(from, to);
  }
};