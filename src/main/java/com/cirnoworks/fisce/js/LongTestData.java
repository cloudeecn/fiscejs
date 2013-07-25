package com.cirnoworks.fisce.js;

import java.io.PrintWriter;

public class LongTestData {
	public static final long[] data = { 0x00000000l, 0x00000001l, 0x0000FFFFl,
			0x00010000l, 0x00010001l, 0x0001FFFFl, 0xFFFF0000l, 0xFFFF0001l,
			0xFFFFFFFFl, 0x80000000l };
	public static final int len = data.length;

	public static void generate(LongDataDescriptor desc) {
		try {

			long[] result = new long[len * len * len * len];
			for (int i = 0, max = result.length; i < max; i++) {
				int pos = i;
				int rightLPos = pos % len;
				pos /= len;
				int rightHPos = pos % len;
				pos /= len;
				int leftLPos = pos % len;
				pos /= len;
				int leftHPos = pos % len;
				long left = (data[leftHPos] << 32) + data[leftLPos];
				long right = (data[rightHPos] << 32) + data[rightLPos];
				result[i] = desc.getResult(left, right);
			}

			PrintWriter pw = new PrintWriter("src/test/resources/long.test."
					+ desc.getOpName() + ".js");
			try {
				pw.println("var FyLongTestData_" + desc.getOpName() + "={");
				for (int i = 0, max = result.length; i < max; i++) {
					pw.print('\t');
					pw.print(i);
					pw.print(" : [");
					pw.print((int) (result[i] >>> 32));
					pw.print(", ");
					pw.print((int) result[i]);
					pw.print("]");
					if (i < max - 1) {
						pw.print(',');
					}
					pw.println();
				}
				pw.println("};\n");
			} finally {
				pw.close();
			}
			System.out.println(desc.getOpName() + " done.");
		} catch (Exception e) {
			e.printStackTrace();
			System.exit(-1);
		}
	}
}
