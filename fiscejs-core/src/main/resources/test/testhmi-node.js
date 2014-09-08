var fs = require('fs');
var vm = require('vm');
var files = require('./files.js');
var includeInThisContext = function(path) {
	var code = fs.readFileSync(path);
	vm.runInThisContext(code, path);
}.bind(this);
console.log(files);
for (var i = 0; i < files.length; i++) {
	includeInThisContext(files[i]);
}
var hm = new HashMapI(-1, 1, 0.6);
var rounds = 0;
var count = 0;
var key;
var value;
var got = 0 | 0;
var contains = false;
function fun() {
	for (var i = 0; i < 1000; i++) {
		key = ((Math.random() - 0.5) * 100000) | 0;
		value = ((Math.random() - 0.5) * 100000000) | 0;
		hm.put(key, value);
	}
	if (count == 50) {
		forceOptimize(hm.iterate);
		for (var i = 0; i < 50000; i++) {
			hm.remove(i);
		}
		hm.iterate(function(key, value, data) {
			persistStages([ key, value, data.a, data.b ]);
			return true;
		}, {
			a : 1,
			b : 2
		});
		var size = hm.size();
		console.log(size | 0);
		hm.clear();
	}
	if (count == 100) {
		for (var i = 0; i < 100000; i++) {
			got = 0;
			persistStages(got);
			got = hm.get(i);
			persistStages(got);
			contains = true;
			persistStages(contains);
			contains = hm.contains(key);
			persistStages(contains);
		}
		count = 0;
		rounds++;
		console.log(hm.size() | 0);
		console.log("rounds: " + rounds);
		hm = new HashMapI(-1, 1, 0.6);
	} else {
		count++;

	}
	if (rounds < 400) {
		setTimeout(fun, 1);
	}
}
fun();
