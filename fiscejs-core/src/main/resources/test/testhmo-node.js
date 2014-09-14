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
var hm = new HashMapIObj(1, 0.6);
var rounds = 0;
var count = 0;
var key;
var value;
var got = 0 | 0;
var contains = false;
function fun() {
	for (var i = 0; i < 10000; i++) {
		key = ((Math.random() - 0.5) * 100000) | 0;
		// if (Math.random() < 0.5) {
		value = {
			key : key,
			value : ((Math.random() - 0.5) * 100000000) | 0
		};
		// } else {
		// value = "v:" + (((Math.random() - 0.5) * 100000000) | 0);
		// }
		hm.put(key, value);
	}
	if (count == 50) {
		for (var i = 0; i < 50000; i++) {
			hm.remove(i);
		}
		console.log(hm.size());
		hm.iterate(function(key, value, data) {
			persistStages([ key, value, data.a, data.b ]);
			return Math.random() > 0.5;
		}, {
			a : 1,
			b : 2
		});
		console.log(hm.size());
		hm.clear();
	}
	if (count == 100) {
		for (var i = 0; i < 100000; i++) {
			got = undefined;
			persistStages(got);
			got = hm.get(i);
			persistStages(got);
			contains = 1;
			persistStages(contains);
			contains = hm.contains(key);
			persistStages(contains);
		}
		console.log(hm.size() | 0);
		count = 0;
		rounds++;
		console.log("rounds: " + rounds);
		hm = new HashMapIObj(1, 0.6);
		if (rounds == 5) {
			hm.put(25, []);
		}
	} else {
		count++;

	}
	if (rounds < 10) {
		setTimeout(fun, 1);
	} else {

	}
}
fun();
