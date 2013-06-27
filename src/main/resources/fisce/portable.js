var FiScEPortable = {};

// We use ArrayBuffer for converting floats from/to ieee754 integers by default
(function() {
	var arrayView = new DataView(new ArrayBuffer(8), 0, 8);
	
	/**
	 * convert float to ieee754 int
	 * @param {Number} floatValue
	 * @returns {Number} ieee754 int
	 */
	FiScEPortable.floatToInt = function(floatValue) {
		arrayView.setFloat32(0, floatValue);
		return arrayView.getInt32(0);
	};
	
	/**
	 * convert ieee754 int to float
	 * @param {Number} intValue
	 * @returns {Number} floatValue
	 */
	FiScEPortable.intToFloat = function(intValue) {
		arrayView.setInt32(0, floatValue);
		return arrayView.getFloat32(0);
	};
	
	/**
	 * convert double to ieee754 int pair
	 * @param {Number} doubleValue
	 * @param {Array} container int pair container, if null/undefined,will create a new one
	 * @returns {Array} int pair
	 */
	FiScEPortable.doubleToLong = function(doubleValue,container){
		if(!container){
			container=new Array(2);
		}
		arrayView.setFloat64(0,doubleValue);
		container[0]=arrayView.getInt32(0);
		container[1]=arrayView.getInt32(4);
		return container;
	};
	
	/**
	 * convert int pair to double
	 * @param {Array} container int pair container
	 * @returns {Number} doubleValue
	 */
	FiScEPortable.longToDouble = function(container){
		arrayView.setInt32(0,container[0]);
		arrayView.setInt32(4,container[1]);
		return arrayView.getFloat64(0);
	};
	
})();

