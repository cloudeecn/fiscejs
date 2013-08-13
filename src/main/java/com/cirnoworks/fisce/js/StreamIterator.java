package com.cirnoworks.fisce.js;

import java.io.IOException;
import java.io.InputStream;

public interface StreamIterator {
	boolean hasNextEntry();

	InputStream nextEntry();

	void closeEntry() throws IOException;
}
