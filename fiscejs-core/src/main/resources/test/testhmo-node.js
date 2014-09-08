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
		value = ((Math.random() - 0.5) * 1000000000) | 0;
	}
	hm.put(key, value);
	if (count == 500) {
		hm.clear();
	}
	if (count == 1000) {
		for (var i = 0; i < 100000; i++) {
			got = 0;
			got = hm.get(i);
			contains = true;
			persistStages(contains);
			contains = hm.contains(key);
			persistStages(contains);
			persistStages(got);
		}
		count = 0;
		rounds++;
		console.log(rounds);
		hm = new HashMapI(-1, 1, 0.6);
	} else {
		count++;

	}
	if (rounds < 40) {
		setTimeout(fun, 1);
	}
}
fun();
