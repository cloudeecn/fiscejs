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
 * @param {Object.<string, string>} classes
 * @param {Array.<string>} strings
 * @param {Int32Array} constants
 */
function FyClassDef() {
  /**
   * @dict
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
   * @type {Object.<string,string>}
   */
  this.files = {};
};

/**
 * @param  {string} str
 * @return
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
  this.strings = [];
  while (pos < len) {
    idx = decompressed.indexOf('\0', pos);
    if (idx < 0) {
      idx = len;
    }
    // console.log(pos + " - " + idx);
    this.strings.push(LZString
      .decodeUTF16(decompressed
        .substring(pos, idx)));
    pos = idx + 1;
  }
  console.log("String decode " + (performance.now() - t0) + "ms");
};

FyClassDef.prototype.addConstants = function(str) {
  if (this.constants) {
    throw new FyException(null, "Illegal status: constants already parsed");
  }
  var t0 = performance.now();
  var constantsStr = LZString
    .decompressFromUTF16(str);
  this.constants = new Int32Array(
    constantsStr.length);
  for (var i = 0, max = constantsStr.length; i < max; i++) {
    this.constants[i >> 1] |= constantsStr
      .charCodeAt(i) << ((i & 1) << 4);

  }
  console.log("Constants decode " + (performance.now() - t0) + "ms");
}

FyClassDef.prototype.addClassDef = function(name, def) {
  this.classes[name] = def;
}

FyClassDef.prototype.addFile = function(name, content) {
  this.files[name] = content;
}
/**
 * Walk through all interfaces from one class, and invoke a custom function on
 * it
 *
 * @param {FyClass}
 *            clazz
 * @param {function(this: T, FyClass): R}
 *            fun
 * @param {T} $this
 * @param {Object.<number, boolean>}
 *            walked
 * @returns {R}
 * @template T, R
 */
function walkInterfaces(clazz, fun, $this, walked) {
  var ret;
  var toWalk = [];
  if (!walked) {
    walked = {};
  }

  for (var i = 0, max = clazz.interfaces.length; i < max; i++) {
    /**
     * @type {FyClass}
     */
    var intf = clazz.interfaces[i];
    if (!walked[intf.classId]) {
      toWalk.push(intf);
      walked[intf.classId] = true;
      ret = fun.call($this, intf);
      if (ret !== null) {
        return ret;
      }
    }
  }

  for (var i = 0, max = toWalk.length; i < max; i++) {
    ret = walkInterfaces(toWalk[i], fun, $this, walked);
    if (ret !== null) {
      return ret;
    }
  }

  if (((clazz.accessFlags & FyConst.FY_ACC_INTERFACE) === 0) && (clazz.superClass)) {
    ret = walkInterfaces(clazz.superClass, fun, $this, walked);
    if (ret !== null) {
      return ret;
    }
  }
  return null;
}

/**
 * @constructor
 * @class
 * @export
 * @struct
 * @param {FyConfig}
 *            config
 */
function FyContext(config) {
  var levels = ["D", "I", "W", "E"];
  if (!config) {
    this.config = new FyConfig();
  } else {
    this.config = config;
  }

  /**
   * @type {Array.<FyClassDef>}
   */
  this.classDefs = [];
  /**
   * @dict
   * @type {Object.<string,string>}
   */
  this.dynamicClassDef = {};

  /* Classes begins from 1 */
  /**
   * @type {HashMapIObj.<FyClass>}
   */
  this.classes = new HashMapIObj(8, 0.6, null);
  /**
   * @dict
   * @type {Object.<string,number>}
   */
  this.mapClassNameToId = {};
  this.mapClassIdToHandle = new HashMapI(0, 4, 0.6);

  /* Methods begins from 0 */
  /**
   * @type {HashMapIObj.<FyMethod>}
   */
  this.methods = new HashMapIObj(10, 0.6, null);
  /**
   * @dict
   * @type {Object.<string,number>}
   */
  this.mapMethodNameToId = {};
  this.mapMethodIdToHandle = new HashMapI(0, 4, 0.6);

  /* Fields begins from 0 */
  /**
   * @type {HashMapIObj.<FyField>}
   */
  this.fields = new HashMapIObj(10, 0.6, null);
  /**
   * @dict
   * @type {Object.<string,number>}
   */
  this.mapFieldNameToId = {};
  this.mapFieldIdToHandle = new HashMapI(0, 4, 0.6);

  /**
   * @dict
   * @type {Object.<string, function(this:FyMethod, FyContext, FyThread, number, number)>}
   */
  this.nativeHandlers = {};
  /**
   * @dict
   * @type {Object.<string,function(FyThread, FyMethod, number, number):string>}
   */
  this.nativeAOT = {};

  this.classLoader = new FyClassLoader(this);
  this.heap = new FyHeap(this);
  this.threadManager = new FyThreadManager(this);
  this.vfs = new FyVFS(this);

  this.log = function(level, content) {
    if (this.config.debugMode || level > 0) {
      console.log(levels[level] + ": " + content);
    }
  };

  /** Special types* */
  /**
   * TOP_OBJECT
   *
   * @type {FyClass}
   */
  this.TOP_OBJECT = null;
  /**
   * @type {FyClass}
   */
  this.TOP_THROWABLE = null;
  /**
   * @type {FyClass}
   */
  this.TOP_ENUM = null;
  /**
   * @type {FyClass}
   */
  this.TOP_ANNOTATION = null;
  /**
   * @type {FyClass}
   */
  this.TOP_SOFT_REF = null;
  /**
   * @type {FyClass}
   */
  this.TOP_WEAK_REF = null;
  /**
   * @type {FyClass}
   */
  this.TOP_PHANTOM_REF = null;
  /**
   * @type {FyClass}
   */
  this.TOP_CLASS = null;
  /**
   * @type {FyClass}
   */
  this.TOP_METHOD = null;
  /**
   * @type {FyClass}
   */
  this.TOP_FIELD = null;
  /**
   * @type {FyClass}
   */
  this.TOP_CONSTRUCTOR = null;
};

/**
 * @export
 * @return {FyHeap}
 */
FyContext.prototype.getHeap = function() {
  return this.heap;
};

/**
 * @dict
 * @enum {string}
 */
FyContext.primitives = {
  'Z': '<boolean',
  'B': '<byte',
  'S': '<short',
  'C': '<char',
  'I': '<int',
  'F': '<float',
  'J': '<long',
  'D': '<double',
  'V': '<void'
};

/**
 * @dict
 * @enum {string}
 */
FyContext.mapPrimitivesRev = {
  '<boolean': 'Z',
  '<byte': 'B',
  '<short': 'S',
  '<char': 'C',
  '<int': 'I',
  '<float': 'F',
  '<long': 'J',
  '<double': 'D',
  '<void': 'V'
};

/**
 * @dict
 * @type {Object.<string,string>}
 */
FyContext.stringPool = {};

/**
 * Pool a string to string pool
 *
 * @param {string}
 *            string
 * @returns {string} result
 */
FyContext.prototype.pool = function(string) {
  if ((string in FyContext.stringPool) && "string" === typeof FyContext.stringPool[string]) {
    return FyContext.stringPool[string];
  } else {
    FyContext.stringPool[string] = string;
    return string;
  }
};

/**
 * @param {string} data
 */
FyContext.prototype.addClassDef = function(data) {
  var def = new FyClassDef();
  /**
   * @type {number}
   */
  var len = data.length;
  /**
   * @type {number}
   */
  var pos = 0;
  /**
   * @type {number}
   */
  var idx = 0;
  /**
   * @type {number}
   */
  var mode = 0;
  /**
   * @type {number}
   */
  var splitter = 0;
  /**
   * @type {string}
   */
  var line;
  /**
   * @type {string}
   */
  var key;
  /**
   * @type {string}
   */
  var value;
  while (pos < len) {
    idx = data.indexOf("\n", pos);
    if (idx < 0) {
      idx = pos.len;
    }

    line = data.substring(pos, idx);
    pos = idx + 1;
    if (line.length === 0) {
      //blank line, change process mode
      mode++;
      continue;
    }
    switch (mode) {
      case 0: //classes
        splitter = line.indexOf("\0");
        if (splitter < 0 || splitter >= line.length - 1) {
          key = line;
          value = "";
        } else {
          key = line.substring(0, splitter);
          value = line.substring(splitter + 1);
        }
        def.addClassDef(key, value);
        break;
      case 1: //constants
        value = line;
        def.addConstants(value);
        break;
      case 2: //strings
        value = line;
        def.addStrings(value);
        break;
      case 3: //files
        splitter = line.indexOf("\0");
        if (splitter < 0 || splitter >= line.length - 1) {
          key = line;
          value = "";
        } else {
          key = line.substring(0, splitter);
          value = line.substring(splitter + 1);
        }
        def.addFile(key, value);
        break;
    }
  }
  this.classDefs.push(def);
};
/**
 * Register a field to context
 *
 * @param {FyField}
 *            field
 */
FyContext.prototype.registerField = function(field) {
  var fid = 0;
  if (field.uniqueName in this.mapFieldNameToId) {
    fid = this.mapFieldNameToId[field.uniqueName] | 0;
  } else {
    fid = this.fields.size() | 0;
    field.setFieldId(fid);
    this.mapFieldNameToId[field.uniqueName] = fid;
  }
  this.fields.put(fid, field);
};
/**
 * get field by name
 *
 * @param {string}
 *            uniqueName
 * @returns {FyField} field
 */
FyContext.prototype.getField = function(uniqueName) {
  if (uniqueName in this.mapFieldNameToId) {
    return this.fields.get(this.mapFieldNameToId[uniqueName]);
  } else {
    return null;
  }
};

/**
 * Lookup field throw class and super classes
 *
 * @param {FyClass}
 *            clazz
 * @param {string}
 *            fullName
 * @returns {FyField}
 */
FyContext.prototype.lookupFieldVirtual = function(clazz, fullName) {
  /**
   * @type {FyClass|Undefined}
   */
  var c = clazz;
  var name;
  var fid = 0 | 0;

  while (c) {
    name = this.pool(c.name + fullName);
    if (name in this.mapFieldNameToId) {
      fid = this.mapFieldNameToId[name] | 0;
      if (c !== clazz) {
        this.mapFieldNameToId[this.pool(clazz.name + fullName)] = fid;
      }
      return this.fields.get(fid);
    }
    c = c.superClass;
  }

  return walkInterfaces(clazz,
    /**
     * @param {FyClass}
     *            intf
     */
    function(intf) {
      var name = this.pool(intf.name + fullName);
      var fid = 0 | 0;
      if (name in this.mapFieldNameToId) {
        fid = this.mapFieldNameToId[name] | 0;
        this.mapFieldNameToId[this.pool(clazz.name + fullName)] = fid;
        return this.fields.get(fid);
      } else {
        return null;
      }
    }, this, {});
};

/**
 * Lookup a field from field constant
 *
 * @param {FyClassDef}
 *            global
 * @param {number}
 *            constant : field constant
 * @returns {FyField} field
 */
FyContext.prototype.lookupFieldVirtualFromConstant = function(global, constant) {
  var constants = global.constants;
  var resolvedField;
  var c1 = constant + 1;
  var c2 = constant + 2;
  if (constants[c2] === 0) {
    var strings = global.strings;
    /**
     * @returns {FyClass}
     */
    var clazz = this.lookupClass(strings[constants[constant]]);
    // console.log("###"+clazz.name+"."+constant);
    if (!clazz) {
      throw new FyException(FyConst.FY_EXCEPTION_CLASSNOTFOUND,
        strings[constants[constant]]);
    }

    resolvedField = this.lookupFieldVirtual(clazz, strings[constants[c1]]);
    if (resolvedField) {
      constants[constant] = resolvedField.fieldId;
      constants[c2] = 1;
    } else {
      throw new FyException(FyConst.FY_EXCEPTION_INCOMPAT_CHANGE,
        strings[constants[constant]] + "." + strings[constants[c1]] + " not found");
    }
    // delete constant.className;
    // delete constant.nameAndType;
  } else {
    resolvedField = this.fields.get(constants[constant]);
  }
  return resolvedField;
};

/**
 * Register a method to context
 *
 * @param {FyMethod}
 *            method
 */
FyContext.prototype.registerMethod = function(method) {
  var mid;
  if (method.uniqueName in this.mapMethodNameToId) {
    // mid = this.mapMethodNameToId[] | 0;
    mid = this.mapMethodNameToId[method.uniqueName] | 0;
  } else {
    mid = this.methods.size();
    this.mapMethodNameToId[method.uniqueName] = mid;
  }
  method.setMethodId(mid);
  this.methods.put(mid, method);
};
/**
 * get method by name
 *
 * @param {string}
 *            uniqueName
 * @returns {FyMethod} method
 */
FyContext.prototype.getMethod = function(uniqueName) {
  if (uniqueName in this.mapMethodNameToId) {
    return this.methods.get(this.mapMethodNameToId[uniqueName] | 0);
  } else {
    return null;
  }
};

/**
 *
 * Lookup method from specific class and it's super classes
 *
 * @param {FyClass}
 *            clazz
 * @param {string}
 *            fullName
 * @returns {FyMethod} method
 */
FyContext.prototype.lookupMethodVirtual = function(clazz, fullName) {
  /**
   * @type {FyClass}
   */
  var c = clazz;

  var name;
  var mid;

  while (c) {
    name = c.name + fullName;
    if (name in this.mapMethodNameToId) {
      mid = this.mapMethodNameToId[name] | 0;
      if (c !== clazz) {
        this.mapMethodNameToId[this.pool(clazz.name + fullName)] = mid;
      }
      return this.methods.get(mid);
    }

    c = c.superClass;
  }

  return walkInterfaces(clazz,
    /**
     * @param {FyClass}
     *            intf
     */
    function(intf) {
      var name = this.pool(intf.name + fullName);
      var mid;
      if (name in this.mapMethodNameToId) {
        mid = this.mapMethodNameToId[name] | 0;
        this.mapMethodNameToId[this.pool(clazz.name + fullName)] = mid;
        return this.methods.get(mid);
      } else {
        return null;
      }
    }, this, {});
};

/**
 * Lookup method virtually
 *
 * @param {FyClass}
 *            clazz
 * @param {FyMethod}
 *            method
 * @returns {FyMethod} method
 */
FyContext.prototype.lookupMethodVirtualByMethod = function(clazz, method) {
  var mid = method.methodId;
  /**
   * @type {number}
   */
  var ret = clazz.virtualTable.get(mid);
  if (ret === -1) {
    var m = this.lookupMethodVirtual(clazz, method.fullName);
    if (!m || (m.accessFlags & FyConst.FY_ACC_ABSTRACT)) {
      throw new FyException(FyConst.FY_EXCEPTION_ABSTRACT, clazz.name + method.fullName);
    }
    if (m.accessFlags & FyConst.FY_ACC_STATIC) {
      throw new FyException(FyConst.FY_EXCEPTION_INCOMPAT_CHANGE,
        "Method " + clazz.name + method.fullName + " changed to static");
    }
    clazz.virtualTable.put(mid, ret = m.methodId);
  }
  return this.methods.get(ret);
};

/**
 * Lookup a method from method constant
 *
 * @param {FyClassDef}
 *            global
 * @param {number}
 *            constant : method constant
 * @returns {FyMethod} method
 */
FyContext.prototype.lookupMethodVirtualFromConstant = function(global, constant) {
  var constants = global.constants;
  var resolvedMethod;
  if (constant < 0 || constant + 2 >= constants.length) {
    throw new Error("IOOB");
  }
  if (constants[constant + 2] === 0) {
    var strings = global.strings;
    /**
     * @returns {FyClass}
     */
    var clazz = this.lookupClass(strings[constants[constant]]);
    if (!clazz) {
      throw new FyException(FyConst.FY_EXCEPTION_CLASSNOTFOUND,
        strings[constants[constant]]);
    }

    resolvedMethod = this.lookupMethodVirtual(clazz,
      strings[constants[constant + 1]]);
    if (resolvedMethod) {
      constants[constant] = resolvedMethod.methodId;
      constants[constant + 2] = 1;
    } else {
      throw new FyException(FyConst.FY_EXCEPTION_INCOMPAT_CHANGE,
        strings[constants[constant]] + "." + strings[constants[constant + 1]] + " not found");
    }
    // delete constant.className;
    // delete constant.nameAndType;
  } else {
    resolvedMethod = this.methods.get(constants[constant]);
  }
  return resolvedMethod;
};

/**
 * Register a class to context
 *
 * @param {FyClass}
 *            clazz
 */
FyContext.prototype.registerClass = function(clazz) {
  var cid;
  if (clazz.name in this.mapClassNameToId) {
    cid = this.mapClassNameToId[clazz.name] | 0;
    if (this.classes.contains(cid)) {
      throw new FyException(null, "Duplicated class define: " + clazz.name);
    }
  } else {
    cid = (this.classes.size() + 1) | 0;
    this.mapClassNameToId[clazz.name] = cid | 0;
  }
  clazz.setClassId(cid);
  this.classes.put(cid, clazz);
};

/**
 * Get class from class name
 *
 * @param {string}
 *            name
 * @returns {FyClass} class to return
 */
FyContext.prototype.getClass = function(name) {
  if (name in this.mapClassNameToId) {
    return this.classes.get(this.mapClassNameToId[name]);
  } else {
    return null;
  }
};

/**
 * @param name
 *            {string}
 * @returns {FyClass}
 */
FyContext.prototype.lookupClassPhase1 = function(name) {
  if (typeof name !== "string") {
    throw new FyException(null, "Class name for load is null!");
  }
  var clazz = this.getClass(name);
  if (!clazz) {
    clazz = this.classLoader.loadClass(name);
    if (clazz) {
      this.registerClass(clazz);
    }
  }
  return clazz;
};

/**
 * Get or load class with class name
 *
 * @param {string}
 *            name
 * @returns {FyClass} class to return
 */
FyContext.prototype.lookupClass = function(name) {

  var clazz = this.classLoader.lookupAndPend(name);
  this.classLoader.fixPending();
  return clazz;
};

/**
 * Get a class as clazz[]
 *
 * @param {FyClass}
 *            clazz
 * @returns {FyClass}
 */
FyContext.prototype.lookupArrayClass = function(clazz) {
  if (clazz.type === FyConst.TYPE_OBJECT) {
    return this.lookupClass("[L" + clazz.name + ";");
  } else if (clazz.type === FyConst.TYPE_ARRAY) {
    return this.lookupClass("[" + clazz.name);
  } else {
    return this.lookupClass("[" + FyContext.mapPrimitivesRev[clazz.name]);
  }
};

/**
 * Lookup class from constant phase1
 *
 * @param {FyClassDef}
 *            global
 * @param {number}
 *            constant the constant pos
 * @returns {FyClass}
 */
FyContext.prototype.lookupClassFromConstantPhase1 = function(global, constant) {
  var constants = global.constants;
  var clazz = null;
  var c2 = constant + 2;
  if (constant < 0 || c2 >= constants.length) {
    throw new Error("IOOB");
  }
  if (constants[c2] === 0) {
    var strings = global.strings;
    // console.log(constant + ", " + constants[constant] + ", "
    // + strings[constants[constant]]);
    clazz = this.lookupClassPhase1(strings[constants[constant]]);
    if (!clazz) {
      throw new FyException(FyConst.FY_EXCEPTION_CLASSNOTFOUND,
        strings[constants[constant]]);
    }
    constants[constant] = clazz.classId;
    constants[c2] = 1;
  } else {
    clazz = this.classes.get(constants[constant] | 0);
  }
  return clazz;
};

/**
 * Lookup class from constant
 *
 * @param constant
 *            the constant entry
 * @returns {FyClass}
 */
FyContext.prototype.lookupClassFromConstant = function(global, constant) {
  var constants = global.constants;
  var clazz = null;
  var c2 = constant + 2;
  if (constant < 0 || c2 >= constants.length) {
    throw new Error("IOOB");
  }
  if (constants[c2] === 0) {
    var strings = global.strings;
    clazz = this.lookupClass(strings[constants[constant]]);
    if (!clazz) {
      throw new FyException(FyConst.FY_EXCEPTION_CLASSNOTFOUND, constant);
    }
    constants[constant] = clazz.classId;
    constants[c2] = 1;
  } else {
    clazz = this.classes.get(constants[constant] | 0);
  }
  return clazz;
};

/**
 * @param {FyClass} clazz
 * @returns {number} handle of this class's class object handle
 */
FyContext.prototype.getClassObjectHandle = function(clazz) {
  var handle = this.mapClassIdToHandle.get(clazz.classId);
  if (handle === 0) {
    var clcl = this.lookupClass(FyConst.FY_BASE_CLASS);
    this.heap.beginProtect();
    handle = this.heap.allocate(clcl);
    this.heap.setObjectMultiUsageData(handle, clazz.classId | 0);
    this.mapClassIdToHandle.put(clazz.classId, handle);
  }
  return handle;
};

/**
 *
 * @param handle
 * @returns {FyClass}
 */
FyContext.prototype.getClassFromClassObject = function(handle) {
  if (this.heap.getObjectClass(handle) !== this.TOP_CLASS) {
    throw new FyException(FyConst.FY_EXCEPTION_INCOMPAT_CHANGE, "Object #" + handle + "(" + this.heap.getObjectClass(handle).name + ") is not a class object");
  }
  return this.classes.get(this.heap.getObjectMultiUsageData(handle) | 0);
};

/**
 * @param {FyMethod}
 *            method
 * @returns {number}
 */
FyContext.prototype.getMethodObjectHandle = function(method) {
  var handle = this.mapMethodIdToHandle.get(method.methodId);
  if (handle === 0) {
    this.heap.beginProtect();
    if (method.accessFlags & FyConst.FY_ACC_CONSTRUCTOR) {
      handle = this.heap.allocate(this
        .lookupClass(FyConst.FY_REFLECT_CONSTRUCTOR));
    } else {
      handle = this.heap.allocate(this
        .lookupClass(FyConst.FY_REFLECT_METHOD));
    }
    this.heap.setObjectMultiUsageData(handle, method.methodId | 0);
    this.mapMethodIdToHandle.put(method.methodId, handle);
  }
  return handle;
};

/**
 *
 * @param handle
 * @returns {FyMethod}
 */
FyContext.prototype.getMethodFromMethodObject = function(handle) {
  if (this.heap.getObjectClass(handle) !== this.TOP_METHOD && this.heap.getObjectClass(handle) !== this.TOP_CONSTRUCTOR) {
    if (!this.heap.getObjectClass(handle)) {
      throw new FyException(null, "Illegal object #" + handle);
    } else {
      throw new FyException(FyConst.FY_EXCEPTION_INCOMPAT_CHANGE,
        "Object #" + handle + "(" + this.heap.getObjectClass(handle).name + ") is not a method or constructor object");
    }
  }
  return this.methods.get(this.heap.getObjectMultiUsageData(handle));
};

/**
 * @param {FyField}
 *            field
 * @returns {number}
 */
FyContext.prototype.getFieldObjectHandle = function(field) {
  var handle = this.mapFieldIdToHandle.get(field.fieldId);
  if (handle === 0) {
    this.heap.beginProtect();
    handle = this.heap.allocate(this.lookupClass(FyConst.FY_REFLECT_FIELD));
    this.heap.setObjectMultiUsageData(handle, field.fieldId | 0);
    this.mapFieldIdToHandle.put(field.fieldId, handle);
  }
  return handle;
};
/**
 *
 * @param handle
 * @returns {FyField}
 */
FyContext.prototype.getFieldFromFieldObject = function(handle) {
  if (this.heap.getObjectClass(handle) !== this.TOP_FIELD) {
    throw new FyException(FyConst.FY_EXCEPTION_INCOMPAT_CHANGE, "Object #" + handle + "(" + this.heap.getObjectClass(handle).name + ") is not a field object");
  }
  return this.fields.get(this.heap.getObjectMultiUsageData(handle));
};

FyContext.prototype.dumpStackTrace = function(throwable) {
  var heap = this.heap;

  var detailMessageField = this.getField(FyConst.FY_BASE_THROWABLE + ".detailMessage.L" + FyConst.FY_BASE_STRING + ";");
  var causeField = this.getField(FyConst.FY_BASE_THROWABLE + ".cause.L" + FyConst.FY_BASE_THROWABLE + ";");
  var stesField = this.getField(FyConst.FY_BASE_THROWABLE + ".stackTrace.[L" + FyConst.FY_BASE_STACKTHREADELEMENT + ";");

  this.lookupClass(FyConst.FY_BASE_STACKTHREADELEMENT);
  var steDeclaringClass = this.getField(FyConst.FY_BASE_STACKTHREADELEMENT + ".declaringClass.L" + FyConst.FY_BASE_STRING + ";");
  var steMethodName = this.getField(FyConst.FY_BASE_STACKTHREADELEMENT + ".methodName.L" + FyConst.FY_BASE_STRING + ";");
  var steFileName = this.getField(FyConst.FY_BASE_STACKTHREADELEMENT + ".fileName.L" + FyConst.FY_BASE_STRING + ";");
  var steLineNumber = this.getField(FyConst.FY_BASE_STACKTHREADELEMENT + ".lineNumber.I");
  var data = [];
  var first = true;
  var dumped = {};
  while (throwable > 0) {
    if (dumped[throwable]) {
      break;
    }
    dumped[throwable] = true;
    console.log("#dump throwable=" + throwable);
    var throwableClass = heap.getObjectClass(throwable);
    if (!throwableClass) {
      data.push("###Illegal throwable handle #" + throwable);
      throwable = 0;
      break;
    }
    var messageHandle = heap.getFieldInt(throwable,
      detailMessageField.posAbs);
    var message;
    if (messageHandle > 0) {
      message = heap.getString(messageHandle);
    } else {
      message = "";
    }
    if (first) {
      data.push(" Exception occored " + throwableClass.name + ": " + message);
      first = false;
    } else {
      data.push(" Caused by " + throwableClass.name + ": " + message);
    }
    var stesHandle = heap.getFieldInt(throwable, stesField.posAbs);
    if (stesHandle > 0) {
      var stesLength = heap.arrayLength(stesHandle);
      for (var i = 0; i < stesLength; i++) {
        var ste = heap.getArrayInt(stesHandle, i);
        if (ste > 0) {
          var clazzHandle = heap.getFieldInt(ste,
            steDeclaringClass.posAbs);
          var methodHandle = heap.getFieldInt(ste,
            steMethodName.posAbs);
          var fileNameHandle = heap.getFieldInt(ste,
            steFileName.posAbs);
          var lineNumber = heap
            .getFieldInt(ste, steLineNumber.posAbs);
          var className = "<unknown>";
          var methodName = "<unknown>";
          var fileName = "<unknown>";
          if (clazzHandle > 0) {
            className = heap.getString(clazzHandle);
          }
          if (methodHandle > 0) {
            methodName = heap.getString(methodHandle);
          }
          if (fileNameHandle > 0) {
            fileName = heap.getString(fileNameHandle);
          }
          data.push("    at " + className + "." + methodName + "(" + fileName + ":" + lineNumber + ")");
        }
      }
    }
    throwable = heap.getFieldInt(throwable, causeField.posAbs);
  }
  return data;
};

/**
 * Panic the whole virtual machine and try to dump virtual machine data as much
 * as possible
 *
 * @param message
 */
FyContext.prototype.panic = function(message, e) {
  var data = [];
  var context = this;
  try {
    data.push("###PANIC: " + message);
    if (e) {
      if (e.stack) {
        data.push("" + e.stack);
      } else {
        data.push("" + e);
      }
    }
    data.push("#PANIC context:");
    data.push(this);
    data.push("#PANIC Thread dump:");

    for (var i = 0; i < this.config.maxThreads; i++) {
      /**
       * @type {FyThread}
       */
      var thread = this.threadManager.threads[i];
      if (thread) {
        data.push("Thread #" + i);
        try {
          thread.walkFrames(function(frameId, methodId, sb, ip, lip) {
            /**
             * @type {FyMethod}
             */
            var method = context.methods.get(methodId);
            var lineNumber = method.getLineNumber(lip);
            data.push("  frame #" + frameId + ": " + method.owner.name.replace(/\//g, ".") + "." + method.name + " line " + lineNumber);
            return false;
          });
        } catch (ex) {
          console.log("Exception occored while dumping frames:");
          console.log(ex.toString());
        }
        try {
          if (thread.currentThrowable) {
            var throwable = thread.currentThrowable | 0;
            if (throwable > 0) {
              data.push.apply(data, this
                .dumpStackTrace(throwable));
            }
          }
        } catch (ex) {
          console.log("Exception occored while dumping exception:");
          console.log(ex.toString());
        }
      }
    }
  } catch (ee) {
    data.push("Exception occored while processing panic data:");
    data.push(ee.toString());
    if (ee.stack) {
      data.push(ee.stack);
    }
  }
  for (var idx in data) {
    console.log(data[idx]);
  }
  if (e) {
    throw new FyPanicException(data, e);
  } else {
    throw new FyPanicException(data, null);
  }
};

FyContext.prototype.registerNativeAOT = function(name, func) {
  this.nativeAOT[name] = func;
};

/**
 *
 * @param  {string} name
 * @param  {function(this:FyMethod, FyContext, FyThread, number, number)} func
 */
FyContext.prototype.registerNativeHandler = function(name, func) {
  this.nativeHandlers[name] = func;
};

/**
 * @export
 * @param {string}
 *            bootStrapClassName
 */
FyContext.prototype.bootup = function(bootStrapClassName) {
  fyRegisterNativeCore(this);
  fyRegisterNativeMath(this);
  fyRegisterNativeReflects(this);
  fyRegisterNativeAOT(this);
  this.lookupClass(FyConst.FY_BASE_OBJECT);
  this.lookupClass(FyConst.FY_BASE_THROWABLE);
  this.lookupClass("[Z");
  this.lookupClass("[B");
  this.lookupClass("[S");
  this.lookupClass("[C");
  this.lookupClass("[F");
  this.lookupClass("[I");
  this.lookupClass("[J");
  this.lookupClass("[D");

  var clazz = this.lookupClass(bootStrapClassName);
  this.threadManager.bootFromMain(clazz);
};

/**
 * @export
 * @param {Array.<string>} urls
 * @param {FyDict} callbacks
 */
FyContext.prototype.loadClassDefines = function(urls, callbacks) {
  if (typeof urls == "string") {
    urls = [urls];
  }
  var urlMap = {};
  var defPosBegin = this.classDefs.length;
  for (var i = 0; i < urls.length; i++) {
    this.classDefs.push(null);
    urlMap[urls[i]] = i + defPosBegin;
  }

  if (window.document) {
    // browser
    var iframe;
    var i;
    var failed = false;
    var count = urls.length;
    for (i = 0; i < urls.length; i++) {
      (
        /**
         * @param {FyContext}
         *            context
         * @param {string}
         *            url
         */
        function(context, url) {
          var lowerUrl = url.toLowerCase();
          var hash = "#" + Math.floor(Math.random() * (2147483647)).toString(16) + "-" + Math.floor(Math.random() * (2147483647)).toString(16);

          /**
           * @type {FyClassDef}
           */
          var def = new FyClassDef();
          /**
           * @param {MessageEvent}
           *            event
           */
          function onmessage(event) {
            /**
             * @type {FyMessageData}
             */
            var data = event.data;
            // console.log(event.origin + ": " + data.op + " " + data.name + " // " + url + " " + data.hash);
            if (event.origin.toLowerCase() === lowerUrl && !failed && data.hash === hash) {
              var name, value;
              if (data.op === "class") {
                value = data.value;
                name = data.name;
                def.addClassDef(name, value);
              } else if (data.op === "constants") {
                value = data.value;
                def.addConstants(value);
              } else if (data.op === "strings") {
                value = data.value;
                def.addStrings(value);
              } else if (data.op === "file") {
                value = data.value;
                name = data.name;
                def.addFile(name, value);
              } else if (data.op === "begin") {
                if ("begin" in callbacks) {
                  callbacks["begin"](url, count);
                }
              } else if (data.op === "done") {
                count--;
                iframe.parentNode.removeChild(iframe);
                context.classDefs[urlMap[url]] = def;
                if ("done" in callbacks) {
                  callbacks["done"](url, count);
                }
                if (count === 0) {
                  if ("success" in callbacks) {
                    callbacks["success"]();
                  }
                }
              } else if (data.op === "error") {
                failed = true;
                if ("error" in callbacks) {
                  callbacks["error"]("Can't read data from " + url);
                }
              }
              return false;
            } else {
              return true;
            }
          }
          window.addEventListener("message", onmessage);
          iframe = document.createElement("iframe");
          iframe.setAttribute("src", url + hash);
          iframe.setAttribute("class", "fisce-data-iframe");
          iframe.style.width = "0px";
          iframe.style.height = "0px";
          iframe.style.position = "static";
          iframe.style.left = "0";
          iframe.style.top = "0";
          iframe.style.overflow = "hidden";
          iframe.style.border="none";
          iframe.addEventListener("error", function() {
            failed = true;
            if ("error" in callbacks) {
              callbacks["error"]("Can't read data from " + url);
            }
          });
          document.getElementsByTagName("body")[0].appendChild(iframe);
        })(this, urls[i]);
    }
  } else {
    // node
  }
};

/**
 * @export
 * @param messageHandler
 */
FyContext.prototype.run = function(messageHandler) {
  var message = new FyMessage();
  var fun;
  var mainLoop = function(message) {
    var delay = 0.1;
    var target = 0.1;
    while (true) {
      this.threadManager.run(message);
      switch (message.type) {
        case 6: // FyMessage.message_vm_dead:
          if ("end" in messageHandler) {
            messageHandler["end"]();
          }
          return;
        case 5: // FyMessage.message_sleep:
          target = performance.now() + Number(message.sleepTime);
          if (target !== target) {
            // Nan
            this.panic("Illegal sleep time: " + message.sleepTime);
          }
          delay = target - performance.now();
          if (delay < 0) {
            delay = 0;
          }
          if (delay > 0) {
            setTimeout(fun, delay);
            return;
          }
          break;
        case 3 /* FyMessage.message_invoke_native */ :
          if ("handle" in messageHandler && messageHandler["handle"](message.nativeMethod, message.thread, message.sp)) {} else {
            this
              .panic("Undefined native() in messageHandler, we need process: " + message.nativeMethod);
          }
          break;
        default:
          this.panic("Unknown message type: " + message.type);
      }
    }
  }.bind(this);
  fun = function(message) {
    try {
      mainLoop(message);
    } catch (e) {
      if (e instanceof FyPanicException) {
        if ("panic" in messageHandler) {
          messageHandler["panic"](e);
        } else {
          throw e;
        }
      } else {
        try {
          this.panic("Unhandled exception: " + e, e);
        } catch (ex) {
          if ("panic" in messageHandler) {
            messageHandler["panic"](ex);
          } else {
            throw ex;
          }
        }
      }
    }
  }.bind(this, message);
  setTimeout(fun, 0);
}