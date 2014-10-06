var fs = require('fs');
var vm = require('vm');
var includeInThisContext = function(path) {
  var code = fs.readFileSync(path);
  vm.runInThisContext(code, path);
}.bind(this);
includeInThisContext("fiscejs-latest.js");
var cdef = "" + fs.readFileSync("rt-latest.txt");
var classes = [];
var fails = 0;

classes.push("EXCLUDE/fisce/test/ArchitectureTest");
classes.push("EXCLUDE/fisce/test/HierarchyTest");
classes.push("EXCLUDE/fisce/test/UnicodeTest");
classes.push("EXCLUDE/fisce/test/HelloWorld");
classes.push("EXCLUDE/fisce/test/RandomBoundTest");
classes.push("EXCLUDE/fisce/test/Tester");
classes.push("EXCLUDE/fisce/test/ArrayTest");
classes.push("EXCLUDE/fisce/test/DebugPrintStreamTest");
classes.push("EXCLUDE/fisce/test/AutoBoxingTest");
classes.push("EXCLUDE/fisce/test/RunnerTester");
classes.push("EXCLUDE/fisce/test/EnumTester");
classes.push("EXCLUDE/fisce/test/ExceptionTester");
classes.push("EXCLUDE/fisce/test/ForEachTest");
classes.push("EXCLUDE/fisce/test/HashMapTest");
classes.push("EXCLUDE/fisce/test/StaticTest");
classes.push("EXCLUDE/fisce/test/ComplexClassLayout");
classes.push("EXCLUDE/fisce/test/SwitchTest");
classes.push("EXCLUDE/fisce/test/SwitchTest2");
// classes.push("EXCLUDE/fisce/test/BasicRegexTest");
classes.push("com/cirnoworks/fisce/privat/Profile");
classes.push("EXCLUDE/fisce/test/GCTest");
classes.push("EXCLUDE/fisce/test/RISTest");
classes.push("EXCLUDE/fisce/test/ParamStoreTest");
classes.push("EXCLUDE/fisce/test/ReflectionTest");
classes.push("EXCLUDE/fisce/test/ProxyTest");
classes.push("EXCLUDE/fisce/test/GZIPTest");

function fun() {
  var testClass = classes.pop();
  if (testClass == null) {
    if (fails) {
      console.log("Failed with " + fails + " fails");
      process.exit(-1);
    } else {
      console.log("All tests succeed");
      process.exit(0);
    }
  }
  console.log("Testing " + testClass + "...");
  var context = new FyContext();
  context.addClassDef(cdef);
  context.registerNativeHandler(
    "EXCLUDE/fisce/test/TestService.fail0.(Ljava/lang/String;)V", function(
      context, thread, ops) {
      throw new FyException(null, "Test failed: " + context.heap.getString(thread.stack[thread.sp]));
      return 0;
    });
  context.bootup(classes[i]);
  context.run({
    panic: function(e) {
      console.log("Panic!: \n" + e);
      fails++;
      setTimeout(fun, 1);
    },
    handle: function(name, thread, sp) {
      if (name == "EXCLUDE/fisce/test/TestService.fail0.(Ljava/lang/String;)V") {
        console.log("Fail!: " + context.getHeap().getString(thread.getStack()[sp]));
        fails++;
        return true;
      }
      console.log("Fail!: Can't find handler for method: " + name);
      fails++;
      return false;
    },
    end: function() {
      console.log("VM ended successfully");
      setTimeout(fun, 1);
    }
  });
}
fun();