package com.cirnoworks.fisce.js;

import java.io.ByteArrayInputStream;
import java.io.IOException;

public class ProxyHelper {

	public static Class<?> defineClass(ClassLoader cl, String className,
			byte[] define) {
		try {
			ProxyHelper.defineClass(define, 0, define.length);
			return Class.forName(className.replace('/', '.'));
		} catch (IOException e) {
			throw new RuntimeException(e);
		} catch (ClassNotFoundException e) {
			throw new RuntimeException(e);
		}
	}

	public static void defineClass(byte[] define, int pos, int len)
			throws IOException {
		ByteArrayInputStream bais = new ByteArrayInputStream(define, pos, len);
		String result = null;
		try {
			result = (new ClassConverter()).singleConvert(bais);
		} finally {
			try {
				bais.close();
			} catch (IOException e) {
			}
			bais = null;
			define = null;
		}
		defineClassViaJSON(result);
	}

	public static native void defineClassViaJSON(String json);
}
