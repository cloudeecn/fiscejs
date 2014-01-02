package EXCLUDE.fisce.test;

import java.io.ByteArrayOutputStream;
import java.util.Arrays;

import com.jcraft.jzlib.GZIPOutputStream;

public class GZIPTest extends TestService {
	public static void main(String[] args) {
		try {
			byte[] original = "112233332244112233332244112233332244"
					.getBytes("utf-8");
			byte[] compare = { 31, -117, 8, 0, 0, 0, 0, 0, 0, -1, 51, 52, 52,
					50, 50, 6, 2, 35, 35, 19, 19, 67, 28, 108, 0, 72, 6, 42,
					57, 36, 0, 0, 0 };
			ByteArrayOutputStream baos = new ByteArrayOutputStream();
			GZIPOutputStream gos = new GZIPOutputStream(baos);
			gos.write(original);
			gos.close();
			byte[] gzipped = baos.toByteArray();
			System.out.println(Arrays.toString(gzipped));
			assertEqual(compare.length, gzipped.length);
			for (int i = 0, max = compare.length; i < max; i++) {
				if (gzipped[i] != compare[i]) {
					fail("Illegal gzipped data at " + i);
				}
			}
		} catch (Exception e) {
			fail("Exception occored", e);
		}
	}
}
