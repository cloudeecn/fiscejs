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
	for (var i = 0; i < 10000; i++) {
		key = ((Math.random() - 0.5) * 100000) | 0;
		value = ((Math.random() - 0.5) * 100000000) | 0;
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
			got = 0;
			persistStages(got);
			got = hm.get(i);
			persistStages(got);
			contains = 1;
			persistStages(contains);
			contains = hm.contains(key);
			persistStages(contains);
		}
		console.log(hm.size());
		count = 0;
		rounds++;
		console.log("rounds: " + rounds);
		hm = new HashMapI(-1, 1, 0.6);
		switch (rounds) {
		case 3:
			hm.put(25, {
				k : 1234,
				v : 111
			});
			break;
		case 6:
			hm.put(25, "123");
			break;
		case 9:
			hm.put(25, undefined);
			break;
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
