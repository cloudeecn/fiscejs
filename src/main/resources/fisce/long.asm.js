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
function FyCreateLongOps(global, mode, stack, tmpOps) {
	if (!Function) {
		mode = 0;
	}
	mode = 0;
	switch (mode) {
	case 0:
		return new __FyLongOps(global, stack, tmpOps);
	case 1:
		return new Function('a', 'b', 'c', 'return ('
				+ __FyLongOpsAsmString.replace(/\#\#use asm\#\#/, 'use asm')
				+ "(a,b,c))")(global, {
			tmpOps : tmpOps
		}, stack.buffer);

	case 2:
		return new Function('a', 'b', 'c', 'return ('
				+ __FyLongOpsAsmString.replace(/\#\#use asm\#\#/, '')
				+ "(a,b,c))")(global, {
			tmpOps : tmpOps
		}, stack.buffer);

	}
}

function __FyLongOpAsm(global, env, buffer) {
	"##use asm##";
	// var a={};
	throw "Unsupported yet";
	var stack = new global.Int32Array(buffer);
	var imul = global.Math.imul;
	var floor = global.Math.floor;
	var ceil = global.Math.ceil;
	var log = global.Math.log;
	var pow = global.Math.pow;

	var TWO_PWR_63_DBL_ = 9223372036854776000.0;

	// tmp0 & tmp1在除法中当被除数是0x80000000 00000000的时候使用，不会递归
	var ln2 = 0.0;

	var tmp0 = 0;
	var _tmp0 = 0;
	var tmp1 = 2;
	var _tmp1 = 8;
	var tmp2 = 4;
	var _tmp2 = 16;
	var tmp3 = 6;
	var _tmp3 = 24;
	var tmp4 = 8;
	var _tmp4 = 32;
	var tmp5 = 10;
	var _tmp5 = 40;

	function _fmax(value1, value2) {
		value1 = +value1;
		value2 = +value2;

		return +((value1) > (value2) ? value1 : value2);
	}

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

	function _longToNumber(internalPos) {
		internalPos = internalPos | 0;
		var low = 0.0;

		low = +(stack[(internalPos + 4) >> 2] | 0);
		if (low < +0) {
			low = (+low) + (+4294967296.0);
		}
		return +((+(stack[internalPos >> 2] | 0)) * (4294967296.0) + (low));
	}

	function _longFromNumber(internalPos, value) {
		internalPos = internalPos | 0;
		value = +value;

		if ((value != value) | (value == 1.0 / 0.0)) {
			_set(internalPos, 0 | 0, 0 | 0);
			return;
		} else if (value <= (-TWO_PWR_63_DBL_)) {
			_set(internalPos, 0x80000000 | 0, 0 | 0);
			return;
		} else if ((value + 1.0) >= TWO_PWR_63_DBL_) {
			_set(internalPos, 0x7FFFFFFF | 0, 0xFFFFFFFF | 0);
			return;
		} else if (value < 0.0) {
			_longFromNumber(internalPos, -value);
			neg(internalPos >> 2);
			return;
		} else {
			_set(internalPos, (~~(value / 4294967296.0)),
					~~(value % 4294967296.0));
			return;
		}
	}

	function longToNumber(pos) {
		pos = pos | 0;
		return +_longToNumber((pos << 2) | 0);
	}

	function longFromNumber(pos, value) {
		pos = pos | 0;
		value = +value;
		_longFromNumber((pos << 2) | 0, value);
	}

	function compare(pos1, pos2) {
		pos1 = pos1 | 0;
		pos2 = pos2 | 0;

		var _pos1 = 0;
		var _pos2 = 0;
		_pos1 = (pos1 << 2) | 0;
		_pos2 = (pos2 << 2) | 0;

		if (_equals(_pos1, stack[_pos2 >> 2] | 0, stack[(_pos2 + 4) >> 2] | 0) | 0) {
			return 0 | 0;
		}

		if ((stack[_pos1 >> 2] | 0) > (stack[_pos2 >> 2] | 0)) {
			return 1 | 0;
		} else if ((stack[_pos1 >> 2] | 0) < (stack[_pos2 >> 2] | 0)) {
			return -1 | 0;
		}
		// 比较低位
		// 低位的最高位如果不同，最高位为1的大
		if (((stack[(_pos1 + 4) >> 2] ^ stack[(_pos2 + 4) >> 2]) | 0) < (0 | 0)) {
			if ((stack[(_pos1 + 4) >> 2] | 0) < (0 | 0)) {
				return 1 | 0;
			} else {
				return -1 | 0;
			}
		}

		// 比较剩下的31位（……）
		if ((stack[(_pos1 + 4) >> 2] & 0x7fffffff | 0) > (stack[(_pos2 + 4) >> 2] & 0x7fffffff | 0)) {
			return 1 | 0;
		}
		return -1 | 0;
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

	function shl(pos, ofs) {
		pos = pos | 0;
		ofs = ofs | 0;

		var _pos = 0;
		_pos = pos << 2;

		if ((ofs | 0) >= (64 | 0)) {
			_set(_pos, 0 | 0, 0 | 0);
		} else if ((ofs | 0) >= (32 | 0)) {
			stack[_pos >> 2] = (stack[_pos >> 2]) << (ofs - 32);
			stack[(_pos + 4) >> 2] = 0;
		} else {
			stack[_pos >> 2] = ((stack[_pos >> 2] << ofs) | (stack[(_pos + 4) >> 2] >>> (32 - ofs)));
			stack[(_pos + 4) >> 2] = (stack[(_pos + 4) >> 2] << ofs);
		}
	}

	function shr(pos, ofs) {
		pos = pos | 0;
		ofs = ofs | 0;

		var _pos = 0;
		_pos = pos << 2;

		if ((ofs | 0) >= (64 | 0)) {
			stack[(_pos + 4) >> 2] = stack[_pos >> 2] = stack[_pos >> 2] >> 31;
		} else if ((ofs | 0) >= (32 | 0)) {
			stack[(_pos + 4) >> 2] = (stack[(_pos) >> 2]) >> (ofs - 32);
			stack[(_pos) >> 2] = stack[_pos >> 2] >> 31;
		} else {
			stack[(_pos + 4) >> 2] = ((stack[(_pos + 4) >> 2]) >>> ofs)
					| (stack[_pos >> 2] << (32 - pos));
			stack[_pos >> 2] = stack[_pos >> 2] >> ofs;
		}
	}

	function ushr(pos, ofs) {
		pos = pos | 0;
		ofs = ofs | 0;

		var _pos = 0;
		_pos = pos << 2;

		if ((ofs | 0) >= (64 | 0)) {
			_set(_pos, 0 | 0, 0 | 0);
		} else if ((ofs | 0) >= (32 | 0)) {
			stack[(_pos + 4) >> 2] = (stack[(_pos) >> 2]) >>> (ofs - 32);
			stack[(_pos) >> 2] = 0;
		} else {
			stack[(_pos + 4) >> 2] = ((stack[(_pos + 4) >> 2]) >>> ofs)
					| (stack[_pos >> 2] << (32 - pos));
			stack[_pos >> 2] = stack[_pos >> 2] >>> ofs;
		}
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

	function cmp(pos1, pos2) {
		pos1 = pos1 | 0;
		pos2 = pos2 | 0;

		var _pos1 = 0;
		var ret = 0;
		_pos1 = (pos1 << 2) | 0;
		ret = compare(pos1, pos2) | 0;
		switch (ret | 0) {
		case -1:
			stack[_pos1 >> 2] = -1 | 0;
			stack[(_pos1 + 4) >> 2] = -1 | 0;
			break;
		case 0:
			stack[_pos1 >> 2] = 0 | 0;
			stack[(_pos1 + 4) >> 2] = 0 | 0;
			break;
		case 1:
			stack[_pos1 >> 2] = 0 | 0;
			stack[(_pos1 + 4) >> 2] = 1 | 0;
			break;
		default:
			stack[_pos1 >> 2] = -1 | 0;
			stack[(_pos1 + 4) >> 2] = 1 | 0;
			break;
		}
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

		if ((_equals(_pos1, 0 | 0, 0 | 0) | 0)
				| (_equals(_pos2, 0 | 0, 0 | 0) | 0)) {
			stack[_pos1 >> 2] = 0 | 0;
			stack[(_pos1 + 4) >> 2] = 0 | 0;
			return;
		}

		if (_equals(_pos1, 0x80000000 | 0, 0 | 0) | 0) {
			if (!(stack[(_pos2 + 4) >> 2] & 1 | 0)) {
				stack[_pos1 >> 2] = 0;
				stack[(_pos1 + 4) >> 2] = 0;
			}
			return;
		} else if (_equals(_pos2, 0x80000000 | 0, 0 | 0) | 0) {
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

		c00 = (c00 + (imul(a00, b00) | 0)) | 0;
		c16 = (c16 + (c00 >>> 16)) | 0;
		c00 = (c00 & 0xFFFF) | 0;
		c16 = (c16 + (imul(a16, b00) | 0)) | 0;
		c32 = (c32 + (c16 >>> 16)) | 0;
		c16 = (c16 & 0xFFFF) | 0;
		c16 = (c16 + (imul(a00, b16) | 0)) | 0;
		c32 = (c32 + (c16 >>> 16)) | 0;
		c16 = (c16 & 0xFFFF) | 0;
		c32 = (c32 + (imul(a32, b00) | 0)) | 0;
		c48 = (c48 + (c32 >>> 16)) | 0;
		c32 = (c32 & 0xFFFF) | 0;
		c32 = (c32 + (imul(a16, b16) | 0)) | 0;
		c48 = (c48 + (c32 >>> 16)) | 0;
		c32 = (c32 & 0xFFFF) | 0;
		c32 = (c32 + (imul(a00, b32) | 0)) | 0;
		c48 = (c48 + (c32 >>> 16)) | 0;
		c32 = (c32 & 0xFFFF) | 0;
		c48 = (c48 + (imul(a48, b00) | 0) + (imul(a32, b16) | 0)
				+ (imul(a16, b32) | 0) + (imul(a00, b48) | 0)) | 0;
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
		var approx = 0.0;
		var log2 = 0.0;
		var delta = 0.0;

		_pos1 = (pos1 << 2) | 0;
		_pos2 = (pos2 << 2) | 0;
		if (+ln2 == +0.0) {
			ln2 = +log(+2.0);
		}

		if (_equals(_pos2, 0 | 0, 0 | 0) | 0) {
			// Division by zero will be considered outside
			_set(_pos1, -1 | 0, -1 | 0);
			return;
		}

		if (_equals(_pos1, 0x80000000 | 0, 0 | 0) | 0) {
			if ((_equals(_pos2, 0 | 0, 1 | 0) | 0)
					| (_equals(_pos2, -1 | 0, -1 | 0) | 0)) {
				return;
			} else if (_equals(_pos2, 0x80000000 | 0, 0 | 0) | 0) {
				_set(_pos1, 0 | 0, 1 | 0);
				return;
			} else {
				stack[_pos1 >> 2] = 0xC0000000 | 0;
				div(pos1, pos2);
				shl1(pos1);
				if (_equals(_pos1, 0 | 0, 0 | 0) | 0) {
					if (((stack[_pos2 >> 2] >>> 31) | 0) == (1 | 0)) {
						_set(_pos1, 0 | 0, 1 | 0);
					} else {
						_set(_pos1, -1 | 0, -1 | 0);
					}
					return;
				} else {
					_set(_tmp0, 0x80000000 | 0, 0 | 0);
					_copy(_pos1, _tmp1);
					mul(pos1, pos2);
					sub(tmp0, pos1);
					div(tmp0, pos2);
					add(tmp1, tmp0);
					_copy(_tmp1, _pos1);
					return;
				}
			}
		} else if (_equals(_pos2, 0x80000000 | 0, 0 | 0) | 0) {
			_set(_pos1, 0 | 0, 0 | 0);
			return;
		}

		if ((stack[_pos1 >> 2] | 0) < (0 | 0)) {
			neged = (1 - neged) | 0;
			neg(pos1);
		}
		if ((stack[_pos2 >> 2] | 0) < (0 | 0)) {
			neged = (1 - neged) | 0;
			pos2Neged = 1 | 0;
			neg(pos2);
		}

		// tmp2 -> rem
		// pos1 res
		_copy(_pos1, _tmp2);
		_set(_pos1, 0 | 0, 0 | 0);

		while ((compare(tmp2, pos2) | 0) >= 0) {
			approx = +_fmax(1.0, +floor((+_longToNumber(_tmp2))
					/ (+_longToNumber(_pos2))));
			log2 = +ceil(+log(approx) / ln2);
			delta = (log2 <= 48.0) ? 1.0 : +pow(2.0, log2 - 48.0);
			// tmp3 -> approxRes
			// tmp4 -> approxRem
			_longFromNumber(_tmp3, approx);
			_copy(_tmp3, _tmp4);
			mul(tmp4, pos2);
			while ((stack[_tmp4 >> 2] | 0) < (0 | 0)
					| (compare(tmp4, tmp2) | 0) > 0) {
				approx = approx - delta;
				_longFromNumber(_tmp3, approx);
				_copy(_tmp3, _tmp4);
				mul(tmp4, pos2);
			}
			if (_equals(_tmp3, 0 | 0, 0 | 0) | 0) {
				_set(_tmp3, 0 | 0, 1 | 0);
			}
			add(pos1, tmp3);
			sub(tmp2, tmp4);
		}

		if (neged) {
			neg(pos1);
		}
		if (pos2Neged) {
			neg(pos2);
		}
	}

	function rem(pos1, pos2) {
		pos1 = pos1 | 0;
		pos2 = pos2 | 0;

		if (_equals(pos2 << 2, 0 | 0, 0 | 0) | 0) {
			_set(pos1 << 2, -1 | 0, -1 | 0);
			return;
		}

		_copy(pos1 << 2, _tmp5);
		div(tmp5, pos2);
		mul(tmp5, pos2);
		sub(pos1, tmp5);
	}

	return {
		compare : compare,
		cmp : cmp,
		not : not,
		neg : neg,
		add1 : add1,
		add : add,
		sub : sub,
		mul : mul,
		div : div,
		rem : rem,
		shl : shl,
		shr : shr,
		ushr : ushr,
		longFromNumber : longFromNumber,
		longToNumber : longToNumber
	};
}

// asm.js报错的行号+9基本上是真实的行号
__FyLongOpsAsmString = __FyLongOpAsm.toString();

/**
 * 
 * @param global
 * @param stack
 * @returns
 */
function __FyLongOps(global, stack, tmpOps) {
	this.global = global;
	this.stack = stack;

	this.TWO_PWR_63_DBL_ = 9223372036854776000.0;

	this.tmp0 = tmpOps;
	this.tmp1 = tmpOps + 2;

	this.tmp2 = tmpOps + 4;
	this.tmp3 = tmpOps + 6;

	this.tmp4 = tmpOps + 8;
	this.tmp5 = tmpOps + 10;
}

__FyLongOps.prototype.fmax = function(value1, value2) {
	return (value1 > value2) ? value1 : value2;
};

__FyLongOps.prototype.not = function(pos) {
	var stack = this.stack;
	stack[pos] = ~stack[pos];
	stack[pos + 1] = ~stack[pos + 1];
};

__FyLongOps.prototype.neg = function(pos) {
	var stack = this.stack;
	stack[pos] = ~stack[pos];
	stack[pos + 1] = ~stack[pos + 1];
	this.add1(pos);
};

__FyLongOps.prototype.add1 = function(pos) {
	var stack = this.stack;
	if ((stack[pos + 1] | 0) === -1) {
		stack[pos + 1] = 0;
		stack[pos]++;
	} else {
		stack[pos + 1]++;
	}
};

__FyLongOps.prototype.longToNumber = function(pos) {
	return this.stack[pos] * 4294967296 + (this.stack[pos + 1] >>> 0);
};

__FyLongOps.prototype.longFromNumber = function(pos, value) {
	var stack = this.stack;
	if ((value != value) | (value == 1.0 / 0.0)) {
		stack[pos] = stack[pos + 1] = 0;
		return;
	} else if (value <= (-this.TWO_PWR_63_DBL_)) {
		stack[pos] = 0x80000000;
		stack[pos + 1] = 0;
		return;
	} else if ((value + 1.0) >= this.TWO_PWR_63_DBL_) {
		stack[pos] = 0x7fffffff;
		stack[pos + 1] = 0xffffffff;
		return;
	} else if (value < 0.0) {
		this.longFromNumber(pos, -value);
		this.neg(pos);
		return;
	} else {
		stack[pos] = (value / 4294967296.0) >> 0;
		stack[pos + 1] = (value % 4294967296.0) >> 0;
		return;
	}
};

__FyLongOps.prototype.compare = function(pos1, pos2) {
	var stack = this.stack;
	if (stack[pos1] > stack[pos2]) {
		return 1;
	} else if (stack[pos1] < stack[pos2]) {
		return -1;
	}
	if (stack[pos1 + 1] == stack[pos2 + 1]) {
		return 0;
	}
	if ((stack[pos1 + 1] >>> 0) > (stack[pos2 + 1] >>> 0)) {
		return 1;
	} else {
		return -1;
	}
};

__FyLongOps.prototype.cmp = function(pos1, pos2) {
	var stack = this.stack;
	var ret = this.compare(pos1, pos2);
	switch (ret) {
	case -1:
		stack[pos1] = -1;
		stack[pos1 + 1] = -1;
		break;
	case 0:
		stack[pos1] = 0;
		stack[pos1 + 1] = 0;
		break;
	case 1:
		stack[pos1] = 0;
		stack[pos1 + 1] = 1;
		break;
	default:
		throw ("err! " + ret);
	}
};

/**
 * Add two longs
 * 
 * @param pos1
 * @param pos2
 * @param pos1
 */
__FyLongOps.prototype.add = function(pos1, pos2) {
	var stack = this.stack;
	var tmp = (stack[pos1 + 1] >>> 0) + (stack[pos2 + 1] >>> 0);
	stack[pos1 + 1] = tmp | 0;
	stack[pos1] = (((tmp / 4294967296) >> 0) + (stack[pos1]) + (stack[pos2])) | 0;
};

/**
 * Add two longs
 * 
 * @param pos1
 * @param pos2
 * @param pos1
 */
__FyLongOps.prototype.sub = function(pos1, pos2) {
	this.neg(pos1);
	this.add(pos1, pos2);
	this.neg(pos1);
};

__FyLongOps.prototype.mul = function mul(pos1, pos2) {
	var stack = this.stack;
	var neged = 0;
	var pos2Neged = 0;

	if ((((stack[pos1] | 0) == (0 | 0)) & ((stack[(pos1 + 1)] | 0) == (0 | 0)))
			| (((stack[pos2] | 0) == (0 | 0)) & ((stack[(pos2 + 1)] | 0) == (0 | 0)))) {
		stack[pos1] = 0 | 0;
		stack[(pos1 + 1)] = 0 | 0;
	}
	if (((stack[(pos1)] | 0) == (0x80000000 | 0))
			& ((stack[(pos1 + 1)] | 0) == (0 | 0))) {
		if ((stack[(pos2 + 1)] & 1 | 0) == (0 | 0)) {
			stack[pos1] = 0;
			stack[(pos1 + 1)] = 0;
		}
		return;
	} else if (((stack[(pos2)] | 0) == (0x80000000 | 0))
			& ((stack[(pos2 + 1)] | 0) == (0 | 0))) {
		if ((stack[(pos1 + 1)] & 1 | 0) == (0 | 0)) {
			stack[pos1] = 0 | 0;
		} else {
			stack[pos1] = 0x80000000;
		}
		stack[(pos1 + 1)] = 0;
		return;
	}
	if (stack[pos1] >>> 31 == 1 | 0) {
		neged = (1 - neged) | 0;
		this.neg(pos1);
	}
	if (stack[pos2] >>> 31 == 1 | 0) {
		neged = (1 - neged) | 0;
		pos2Neged = 1 | 0;
		this.neg(pos2);
	}

	var a48 = stack[pos1] >>> 16;
	var a32 = stack[pos1] & 0xFFFF;
	var a16 = stack[(pos1 + 1)] >>> 16;
	var a00 = stack[(pos1 + 1)] & 0xFFFF;
	var b48 = stack[(pos2)] >>> 16;
	var b32 = stack[(pos2)] & 0xFFFF;
	var b16 = stack[(pos2 + 1)] >>> 16;
	var b00 = stack[(pos2 + 1)] & 0xFFFF;
	var c48 = 0, c32 = 0, c16 = 0, c00 = 0;
	c00 += a00 * b00;
	c16 += c00 >>> 16;
	c00 &= 0xFFFF;
	c16 += a16 * b00;
	c32 += c16 >>> 16;
	c16 &= 0xFFFF;
	c16 += a00 * b16;
	c32 += c16 >>> 16;
	c16 &= 0xFFFF;
	c32 += a32 * b00;
	c48 += c32 >>> 16;
	c32 &= 0xFFFF;
	c32 += a16 * b16;
	c48 += c32 >>> 16;
	c32 &= 0xFFFF;
	c32 += a00 * b32;
	c48 += c32 >>> 16;
	c32 &= 0xFFFF;
	c48 += a48 * b00 + a32 * b16 + a16 * b32 + a00 * b48;
	c48 &= 0xFFFF;
	stack[pos1] = ((c48 << 16) | c32) | 0;
	stack[(pos1 + 1)] = (c16 << 16) | c00 | 0;
	if (neged) {
		this.neg(pos1);
	}
	if (pos2Neged) {
		this.neg(pos2);
	}
};

__FyLongOps.prototype.div = function(pos1, pos2) {
	var stack = this.stack;
	var neged = 0;
	var pos2Neged = 0;
	var approx = 0.0;
	var log2 = 0.0;
	var delta = 0.0;

	if (stack[pos2] == 0 && stack[pos2 + 1] == 0) {
		// Division by zero will be considered outside
		stack[pos1] = -1;
		stack[pos1 + 1] = -1;
		return;
	}

	if (stack[pos1] == (0x80000000 | 0) && stack[pos1 + 1] == 0) {
		if ((stack[pos2] == 0 && stack[pos2 + 1] == 1)
				|| (stack[pos2] == -1 && stack[pos2 + 1] == -1)) {
			return;
		} else if (stack[pos2] == (0x80000000 | 0) && stack[pos2 + 1] == 0) {
			stack[pos1] = 0;
			stack[pos1 + 1] = 1;
			return;
		} else {
			stack[pos1] = (0xC0000000 | 0);
			this.div(pos1, pos2);
			stack[pos1] = (stack[pos1] << 1) + (stack[pos1 + 1] >>> 31);
			stack[pos1 + 1] <<= 1;
			if (stack[pos1] == 0 && stack[pos1 + 1] == 0) {
				if (stack[pos2] < 0) {
					stack[pos1] = 0;
					stack[pos1 + 1] = 1;
					return;
				} else {
					stack[pos1] = -1;
					stack[pos1 + 1] = -1;
					return;
				}
			} else {
				stack[this.tmp0] = (0x80000000 | 0);
				stack[this.tmp0 + 1] = 0;
				stack[this.tmp1] = stack[pos1];
				stack[this.tmp1 + 1] = stack[pos1 + 1];
				this.mul(pos1, pos2);
				this.sub(this.tmp0, pos1);
				this.div(this.tmp0, pos2);
				this.add(this.tmp1, this.tmp0);
				stack[pos1] = stack[this.tmp1];
				stack[pos1 + 1] = stack[this.tmp1 + 1];
				return;
			}
		}
	} else if (stack[pos2] == (0x80000000 | 0) && stack[pos2 + 1] == 0) {
		stack[pos1] = 0;
		stack[pos1 + 1] = 0;
		return;
	}

	if (stack[pos1] < 0) {
		neged = 1 - neged;
		this.neg(pos1);
	}

	if (stack[pos2] < 0) {
		neged = 1 - neged;
		pos2Neged = true;
		this.neg(pos2);
	}
	// tmp2 -> rem
	// pos1 res
	stack[this.tmp2] = stack[pos1];
	stack[this.tmp2 + 1] = stack[pos1 + 1];

	stack[pos1] = 0;
	stack[pos1 + 1] = 0;

	while (this.compare(this.tmp2, pos2) >= 0) {
		approx = this.fmax(1.0, Math.floor(this.longToNumber(this.tmp2)
				/ this.longToNumber(pos2)));
		log2 = Math.ceil(Math.log(approx) / Math.LN2);
		delta = (log2 <= 48.0) ? 1.0 : Math.pow(2.0, log2 - 48.0);

		// tmp3 -> approxRes
		// tmp4 -> approxRem
		this.longFromNumber(this.tmp3, approx);
		stack[this.tmp4] = stack[this.tmp3];
		stack[this.tmp4 + 1] = stack[this.tmp3 + 1];

		this.mul(this.tmp4, pos2);

		while (stack[this.tmp4] < 0 || this.compare(this.tmp4, this.tmp2) > 0) {
			approx = approx - delta;
			this.longFromNumber(this.tmp3, approx);
			stack[this.tmp4] = stack[this.tmp3];
			stack[this.tmp4 + 1] = stack[this.tmp3 + 1];
			this.mul(this.tmp4, pos2);
		}
		if (stack[this.tmp3] == 0 && stack[this.tmp3 + 1] == 0) {
			stack[this.tmp3 + 1] = 1;
		}
		this.add(pos1, this.tmp3);
		this.sub(this.tmp2, this.tmp4);
	}

	if (neged) {
		this.neg(pos1);
	}
	if (pos2Neged) {
		this.neg(pos2);
	}
};

__FyLongOps.prototype.rem = function(pos1, pos2) {
	this.stack[this.tmp5] = this.stack[pos1];
	this.stack[this.tmp5 + 1] = this.stack[pos1 + 1];

	if (this.stack[pos2] == 0 && this.stack[pos2 + 1] == 0) {
		this.stack[pos1] = -1;
		this.stack[pos1 + 1] = -1;
	}

	this.div(this.tmp5, pos2);
	this.mul(this.tmp5, pos2);
	this.sub(pos1, this.tmp5);
};

__FyLongOps.prototype.shl = function(pos, ofs) {
	var stack = this.stack;
	if (ofs >= 64) {
		stack[pos] = stack[pos + 1] = 0;
	} else if (ofs > 32) {
		stack[pos] = stack[pos + 1] << (ofs - 32);
		stack[pos + 1] = 0;
	} else {
		stack[pos] = (stack[pos] << ofs) | (stack[pos + 1] >>> (32 - ofs));
		stack[pos + 1] <<= ofs;
	}
};

__FyLongOps.prototype.shr = function(pos, ofs) {
	var stack = this.stack;
	if (ofs >= 64) {
		stack[pos + 1] = stack[pos] = stack[pos] >> 31;
	} else if (ofs >= 32) {
		stack[pos + 1] = stack[pos] >> (ofs - 32);
		stack[pos] >>= 31;
	} else {
		stack[pos + 1] = ((stack[pos + 1]) >>> ofs)
				| (stack[pos] << (32 - pos));
		stack[pos] >>= ofs;
	}
};

__FyLongOps.prototype.ushr = function(pos, ofs) {
	var stack = this.stack;

	if (ofs >= 64) {
		stack[pos] = stack[pos + 1] = 0;
	} else if (ofs >= 32) {
		stack[pos + 1] = stack[pos] >>> (ofs - 32);
		stack[pos] = 0;
	} else {
		stack[pos + 1] = (stack[pos + 1] >>> ofs) | (stack[pos] << (32 - pos));
		stack[pos] >>>= ofs;
	}
};
