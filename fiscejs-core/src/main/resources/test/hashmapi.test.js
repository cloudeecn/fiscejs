(function() {

	fisceTests.extendPrerequisite({
		"HashMapI" : function(assert) {
			var map = new HashMapI(0, 2, 0.75);
			map.put(1, 1);
			map.put(5, 5);
			assert.equal(map.get(1), 1, "1");
			assert.equal(map.get(5), 5, "5");
			assert.equal(map.get(2), map.nullNumber, "null");
			map.put(9, 9);
			map.put(13, 13);
			assert.equal(map.get(1), 1, "1");
			assert.equal(map.get(5), 5, "5");
			assert.equal(map.get(9), 9, "9");
			assert.equal(map.get(13), 13, "13");
			assert.equal(map.get(2), map.nullNumber, "null");
			assert.ok(map.contains(1));
			assert.ok(!map.contains(17));

			var keys = new Array(10000);
			var values = new Array(10000);
			for (var i = 0; i < 10000; i++) {
				var key;
				do {
					key = (Math.random() * 1000000) | 0;
				} while (map.contains(key));
				var value = (Math.random() * 1000000) | 0;
				keys[i] = key;
				values[i] = value;
				map.put(key, value);
			}

			var failed = false;
			for (var i = 0; i < 10000; i++) {
				if (map.get(keys[i]) !== values[i]) {
					failed = true;
					assert.equal(map.get(keys[i]), values[i]);
				}
			}
			assert.ok(!failed, map.size());
		}
	});
})();