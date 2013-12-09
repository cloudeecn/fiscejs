package com.cirnoworks.fisce.js;

public class LongDataGen extends LongTestData {
	public static void main(String[] args) {
		generate(new LongDataDescriptor() {

			@Override
			public long getResult(long left, long right) {
				return left + right;
			}

			@Override
			public String getOpName() {
				return "add";
			}
		});

		generate(new LongDataDescriptor() {

			@Override
			public long getResult(long left, long right) {
				return left - right;
			}

			@Override
			public String getOpName() {
				return "sub";
			}
		});

		generate(new LongDataDescriptor() {

			@Override
			public long getResult(long left, long right) {
				return left * right;
			}

			@Override
			public String getOpName() {
				return "mul";
			}
		});

		generate(new LongDataDescriptor() {

			@Override
			public long getResult(long left, long right) {
				if (right == 0) {
					return -1;
				} else {
					return left / right;
				}
			}

			@Override
			public String getOpName() {
				return "div";
			}
		});

		generate(new LongDataDescriptor() {

			@Override
			public long getResult(long left, long right) {
				if (right == 0) {
					return -1;
				} else {
					return left % right;
				}
			}

			@Override
			public String getOpName() {
				return "rem";
			}
		});

		generate(new LongDataDescriptor() {

			@Override
			public long getResult(long left, long right) {
				return Long.valueOf(left).compareTo(Long.valueOf(right));
			}

			@Override
			public String getOpName() {
				return "cmp";
			}
		});
	}
}
