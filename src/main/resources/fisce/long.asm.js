var __FyLongOpsAsmString;
/**
 * create long operation handler binding with stack
 * 
 * @param global
 *            Global var
 * @param {Number}
 *            mode implementation:
 *            <ul>
 *            <li>0 - implements with javascript native numbers </li>
 *            <li>1 - use asm.js</li>
 *            <li>2 - use asm.js code,but without "use asm"</li>
 *            </ul>
 * @param {Int32Array}
 *            stack
 * @returns {__FyLongOps}
 */
function FyCreateLongOps(global, mode, stack) {
	switch (mode) {
	case 0:
		return new __FyLongOps(global, stack);
	case 1:
		return new Function('a', 'b', 'c', 'return ('
				+ __FyLongOpsAsmString.replace(/\#\#use asm\#\#/, 'use asm')
				+ "(a,b,c))")(global, undefined, stack.buffer);
	case 2:
		return new Function('a', 'b', 'c', 'return ('
				+ __FyLongOpsAsmString.replace(/\#\#use asm\#\#/, '')
				+ "(a,b,c))")(global, undefined, stack.buffer);

	}
}
// asm.js报错的行号+9基本上是真实的行号
__FyLongOpsAsmString = (function(global, env, buffer) {
	"##use asm##";
	var stack = new global.Int32Array(buffer);
	var imul = global.Math.imul;

	var tmp0 = 0;
	var _tmp0 = 0;
	var tmp1 = 2;
	var _tmp1 = 8;

	function _equals(internalPos, high, low) {
		internalPos = internalPos | 0;
		high = high | 0;
		low = low | 0;
		return (((stack[internalPos >> 2] | 0) == (high | 0)) & ((stack[(internalPos + 4) >> 2] | 0) == (low | 0))) | 0;
	}

	function _copy(internalPosFrom, internalPosTo) {
		internalPosFrom = internalPosFrom | 0;
		internalPosTo = internalPosTo | 0;
		stack[internalPosTo >> 2] = stack[internalPosFrom >> 2];
		stack[(internalPosTo + 4) >> 2] = stack[(internalPosFrom + 4) >> 2];
	}

	function _set(internalPos, high, low) {
		internalPos = internalPos | 0;
		high = high | 0;
		low = low | 0;
		stack[internalPos >> 2] = high;
		stack[(internalPos + 4) >> 2] = low;
	}

	function compare(pos1, pos2) {
		pos1 = pos1 | 0;
		pos2 = pos2 | 0;

		var _pos1 = 0;
		var _pos2 = 0;
		var sign = 1;
		_pos1 = (pos1 << 2) | 0;
		_pos2 = (pos2 << 2) | 0;

		if (_equals(_pos1, stack[_pos2 >> 2] | 0, stack[(_pos2 + 4) >> 2] | 0)) {
			return 0 | 0;
		}

		if ((stack[_pos1 >> 2] | 0) > (stack[_pos2 >> 2] | 0)) {
			return 1 | 0;
		} else if ((stack[_pos1 >> 2] | 0) < (stack[_pos2 >> 2] | 0)) {
			return -1 | 0;
		}
		// 比较低位
		sign = (sign | 0) - ((stack[_pos1 >> 2] >>> 31 << 1) | 0);

		if((stack[(_pos1+4)>>2]|0) - (stack[(_)]) )
		
		return 0 | 0;
	}

	function shl1(pos) {
		pos = pos | 0;
		var _pos = 0;
		_pos = (pos << 2) | 0;
		stack[_pos >> 2] = ((stack[_pos >> 2] << 1) | (stack[(_pos + 4) >> 2] >>> 31)) | 0;
		stack[(_pos + 4) >> 2] = (stack[(_pos + 4) >> 2] << 1) | 0;
	}

	function ushr1(pos) {
		pos = pos | 0;
		var _pos = 0;
		_pos = (pos << 2) | 0;
		stack[(_pos + 4) >> 2] = ((stack[(_pos + 4) >> 2] >> 1) + (stack[pos >> 2] >>> 31 << 31)) | 0;
		stack[_pos >> 2] = (stack[_pos >> 2] >>> 1) | 0;
	}

	function shr1(pos) {
		pos = pos | 0;
		var _pos = 0;
		_pos = (pos << 2) | 0;
		stack[(_pos + 4) >> 2] = ((stack[(_pos + 4) >> 2] >> 1) + (stack[pos >> 2] >>> 31 << 31)) | 0;
		stack[_pos >> 2] = (stack[_pos >> 2] >> 1) | 0;
	}

	function not(pos) {
		pos = pos | 0;
		stack[pos << 2 >> 2] = ~stack[pos << 2 >> 2];
		stack[(pos + 1) << 2 >> 2] = ~stack[(pos + 1) << 2 >> 2];
	}

	function neg(pos) {
		pos = pos | 0;
		stack[pos << 2 >> 2] = ~stack[pos << 2 >> 2];
		stack[(pos + 1) << 2 >> 2] = ~stack[(pos + 1) << 2 >> 2];
		add1(pos);
	}

	function add1(pos) {
		pos = pos | 0;
		stack[(pos + 1) << 2 >> 2] = ((stack[(pos + 1) << 2 >> 2] | 0) + (1 | 0)) | 0;
		stack[(pos) << 2 >> 2] = ((stack[pos << 2 >> 2] | 0) + ((!(stack[(pos + 1) << 2 >> 2] | 0)) & 1)) | 0;
	}

	function add(pos1, pos2) {
		pos1 = pos1 | 0;
		pos2 = pos2 | 0;
		var tmp1 = 0;

		tmp1 = ((stack[(pos1 + 1) << 2 >> 2] & 0xffff) + (stack[(pos2 + 1) << 2 >> 2] & 0xffff)) | 0;
		stack[(pos1 + 1) << 2 >> 2] = (stack[(pos1 + 1) << 2 >> 2] & 0xffff0000)
				| (tmp1 & 0xffff) | 0;

		tmp1 = ((tmp1 >>> 16) + (stack[(pos1 + 1) << 2 >> 2] >>> 16) + (stack[(pos2 + 1) << 2 >> 2] >>> 16)) | 0;
		stack[(pos1 + 1) << 2 >> 2] = (stack[(pos1 + 1) << 2 >> 2] & 0xffff)
				| (tmp1 << 16) | 0;

		tmp1 = ((tmp1 >>> 16) + (stack[(pos1) << 2 >> 2] & 0xffff) + (stack[(pos2) << 2 >> 2] & 0xffff)) | 0;
		stack[(pos1) << 2 >> 2] = (stack[(pos1) << 2 >> 2] & 0xffff0000)
				| (tmp1 & 0xffff) | 0;

		tmp1 = ((tmp1 >>> 16) + (stack[(pos1) << 2 >> 2] >>> 16) + (stack[(pos2) << 2 >> 2] >>> 16)) | 0;
		stack[(pos1) << 2 >> 2] = (stack[(pos1) << 2 >> 2] & 0xffff)
				| (tmp1 << 16) | 0;
	}

	function sub(pos1, pos2) {
		pos1 = pos1 | 0;
		pos2 = pos2 | 0;
		neg(pos1);
		add(pos1, pos2);
		neg(pos1);
	}

	function mul(pos1, pos2) {
		pos1 = pos1 | 0;
		pos2 = pos2 | 0;

		var _pos1 = 0;
		var _pos2 = 0;
		var neged = 0;
		var pos2Neged = 0;
		var a48 = 0;
		var a32 = 0;
		var a16 = 0;
		var a00 = 0;
		var b48 = 0;
		var b32 = 0;
		var b16 = 0;
		var b00 = 0;
		var c48 = 0;
		var c32 = 0;
		var c16 = 0;
		var c00 = 0;

		_pos1 = (pos1 << 2) | 0;
		_pos2 = (pos2 << 2) | 0;

		if (_equals(_pos1, 0 | 0, 0 | 0) | _equals(_pos2, 0 | 0, 0 | 0)) {
			stack[_pos1 >> 2] = 0 | 0;
			stack[(_pos1 + 4) >> 2] = 0 | 0;
			return;
		}

		if (_equals(_pos1, 0x80000000 | 0, 0 | 0)) {
			if (!(stack[(_pos2 + 4) >> 2] & 1 | 0)) {
				stack[_pos1 >> 2] = 0;
				stack[(_pos1 + 4) >> 2] = 0;
			}
			return;
		} else if (_equals(_pos2, 0x80000000 | 0, 0 | 0)) {
			if (!(stack[(_pos1 + 4) >> 2] & 1 | 0)) {
				stack[_pos1 >> 2] = 0 | 0;
			} else {
				stack[_pos1 >> 2] = 0x80000000;
			}
			stack[(_pos1 + 4) >> 2] = 0;
			return;
		}
		if (stack[_pos1 >> 2] >>> 31 == 1 | 0) {
			neged = (1 - neged) | 0;
			neg(pos1);
		}
		if (stack[_pos2 >> 2] >>> 31 == 1 | 0) {
			neged = (1 - neged) | 0;
			pos2Neged = 1 | 0;
			neg(pos2);
		}
		a48 = (stack[_pos1 >> 2] >>> 16) | 0;
		a32 = (stack[_pos1 >> 2] & 0xFFFF) | 0;
		a16 = (stack[(_pos1 + 4) >> 2] >>> 16) | 0;
		a00 = (stack[(_pos1 + 4) >> 2] & 0xFFFF) | 0;
		b48 = (stack[(_pos2) >> 2] >>> 16) | 0;
		b32 = (stack[(_pos2) >> 2] & 0xFFFF) | 0;
		b16 = (stack[(_pos2 + 4) >> 2] >>> 16) | 0;
		b00 = (stack[(_pos2 + 4) >> 2] & 0xFFFF) | 0;

		c00 = (c00 + imul(a00, b00)) | 0;
		c16 = (c16 + (c00 >>> 16)) | 0;
		c00 = (c00 & 0xFFFF) | 0;
		c16 = (c16 + imul(a16, b00)) | 0;
		c32 = (c32 + (c16 >>> 16)) | 0;
		c16 = (c16 & 0xFFFF) | 0;
		c16 = (c16 + imul(a00, b16)) | 0;
		c32 = (c32 + (c16 >>> 16)) | 0;
		c16 = (c16 & 0xFFFF) | 0;
		c32 = (c32 + imul(a32, b00)) | 0;
		c48 = (c48 + (c32 >>> 16)) | 0;
		c32 = (c32 & 0xFFFF) | 0;
		c32 = (c32 + imul(a16, b16)) | 0;
		c48 = (c48 + (c32 >>> 16)) | 0;
		c32 = (c32 & 0xFFFF) | 0;
		c32 = (c32 + imul(a00, b32)) | 0;
		c48 = (c48 + (c32 >>> 16)) | 0;
		c32 = (c32 & 0xFFFF) | 0;
		c48 = (c48 + imul(a48, b00) + imul(a32, b16) + imul(a16, b32) + imul(
				a00, b48)) | 0;
		c48 = (c48 & 0xFFFF) | 0;
		_set(_pos1, ((c48 << 16) | c32) | 0, (c16 << 16) | c00 | 0);
		if (neged) {
			neg(pos1);
		}
		if (pos2Neged) {
			neg(pos2);
		}
	}

	function div(pos1, pos2) {
		pos1 = pos1 | 0;
		pos2 = pos2 | 0;

		var _pos1 = 0;
		var _pos2 = 0;
		var neged = 0;
		var pos2Neged = 0;

		_pos1 = (pos1 << 2) | 0;
		_pos2 = (pos2 << 2) | 0;

		if (_equals(_pos2, 0 | 0, 0 | 0)) {
			// Division by zero will be considered outside
			_set(_pos1, -1 | 0, -1 | 0);
			return;
		}

		if (_equals(_pos1, 0x80000000 | 0, 0 | 0)) {
			if (_equals(_pos2, 0 | 0, 1 | 0) | _equals(_pos2, -1 | 0, -1 | 0)) {
				return;
			} else if (_equals(_pos2, 0x80000000 | 0, 0 | 0)) {
				_set(_pos1, 0 | 0, 1 | 0);
				return;
			} else {
				stack[_pos1 >> 2] = 0x40000000 | 0;
				div(pos1, pos2);
				shl1(pos1);
				if (_equals(_pos1, 0 | 0, 0 | 0)) {
					if (((stack[_pos2 >> 2] >>> 31) | 0) == (1 | 0)) {
						_set(_pos1, 0 | 0, 1 | 0);
					} else {
						_set(_pos1, -1 | 0, -1 | 0);
					}
					return;
				} else {
					_set(_tmp0, 0x80000000 | 0, 0 | 0);
					_copy(_pos1, _tmp1);
					mul(tmp1, pos2);
					sub(tmp0, tmp1);
					// tmp0 = rem pos1 = approx pos2 = other
					div(tmp0, pos2);
					add(pos1, tmp0);
					return;
				}
			}
		} else if (_equals(pos2, 0x80000000 | 0, 0 | 0)) {
			_set(pos1, 0 | 0, 0 | 0);
			return;
		}

		if (stack[_pos1 >> 2] >>> 31 == 1 | 0) {
			neged = (1 - neged) | 0;
			neg(pos1);
		}
		if (stack[_pos2 >> 2] >>> 31 == 1 | 0) {
			neged = (1 - neged) | 0;
			pos2Neged = 1 | 0;
			neg(pos2);
		}

		if (neged) {
			neg(pos1);
		}
		if (pos2Neged) {
			neg(pos2);
		}
	}

	return {
		not : not,
		neg : neg,
		add1 : add1,
		add : add,
		sub : sub,
		mul : mul
	};
}).toString();

