package com.cirnoworks.fisce.js;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStreamWriter;
import java.io.Writer;
import java.util.ArrayList;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.diogoduailibe.lzstring4j.LZString;

public class ClassConverterUtil {

	private final static Logger log = LoggerFactory
			.getLogger(ClassConverterUtil.class);

	public static void convertJars(Iterable<? extends InputStream> in,
			Writer out) throws IOException {
		ClassConverter converter = new ClassConverter();
		converter.multiBegin();
		StringBuilder vfsBuilder = new StringBuilder(16384);
		StringBuilder valueBuilder = new StringBuilder(16384);
		byte[] buf = new byte[65536];

		for (InputStream is : in) {
			final ZipInputStream jar = new ZipInputStream(is);
			try {
				ZipEntry entry;
				while ((entry = jar.getNextEntry()) != null) {
					if (entry.getName().endsWith(".class")) {
						converter.multiPush(jar);
					} else if (!entry.isDirectory()) {
						int size = (int) entry.getSize();
						vfsBuilder.append(entry.getName());
						vfsBuilder.append('\0');

						valueBuilder.setLength(0);
						valueBuilder.append((char) size);
						valueBuilder.append((char) (size >> 16));
						int read;
						int pos = 0;
						char value = 0;
						while ((read = jar.read()) >= 0) {
							if (pos == 0) {
								value = (char) (read & 0xff);
								pos = 1;
							} else if (pos == 1) {
								value |= (char) (read << 8);
								valueBuilder.append(value);
								pos = 0;
							}
						}
						if (pos == 1) {
							valueBuilder.append(value);
						}
						LZString.compressToUTF16(valueBuilder, vfsBuilder);
						vfsBuilder.append('\n');
					}
					jar.closeEntry();
				}
			} finally {
				try {
					jar.close();
				} catch (IOException e) {
					e.printStackTrace();
				}
				try {
					is.close();
				} catch (IOException e) {
				}
			}
		}

		StringBuilder o = converter.multiFinish();
		o.append(vfsBuilder);
		o.append("\n\n");
		out.write(o.toString());
		out.flush();
	}

	private static void walkDirectory(File directory, ClassConverter cc)
			throws IOException {
		for (File file : directory.listFiles()) {
			if (file.isDirectory()) {
				walkDirectory(file, cc);
			} else if (file.isFile()) {
				if (file.getName().endsWith(".class")) {
					// A class file
					FileInputStream fis = null;
					try {
						fis = new FileInputStream(file);
						cc.multiPush(fis);
					} finally {
						try {
							if (fis != null) {
								fis.close();
							}
						} catch (IOException e) {
							System.err.println("Warning: Can't close file "
									+ file);
						}
					}
				}
			} else {
				System.err.println("Warning: Unknown file type " + file);
			}
		}
	}

	public static String convertDirectory(File directory) throws IOException {
		if (directory == null || !directory.isDirectory()) {
			throw new IOException(directory + " is not a directory!");
		}
		ClassConverter cc = new ClassConverter();
		cc.multiBegin();
		walkDirectory(directory, cc);
		return cc.multiFinish().toString();
	}

	public static void convertDirectory(File directory, Writer wr)
			throws IOException {
		convertDirectory(null, directory, null, wr);
	}

	public static void convertDirectory(String prefix, File directory,
			String postfix, Writer wr) throws IOException {
		if (prefix != null) {
			wr.write(prefix);
		}
		wr.write(convertDirectory(directory));
		if (postfix != null) {
			wr.write(postfix);
		}
		wr.flush();
	}

	public static void main(String[] args) throws Exception {
		ClassConverterUtil.convertDirectory(// "(function(context){context.addClassDef(",
				new File("../../fiscevm/fiscevm-runtime/target/classes"),
				// ");})(fisceContext);",
				new OutputStreamWriter(new FileOutputStream("rt.txt"),
						"ISO8859-1"));

		System.out.println("done");
	}

	public static void convert(Iterable<String> jarPaths, String jsonPath)
			throws IOException {
		jsonPath += ".txt";
		File runtimeJsFile = new File(jsonPath);

		ArrayList<File> runtimeJarFiles = new ArrayList<File>();

		boolean modified = false;

		for (String jarPath : jarPaths) {
			String runtimeJarPath = jarPath;
			File runtimeJarFile = new File(runtimeJarPath);
			if (!runtimeJsFile.exists()
					|| runtimeJsFile.lastModified() < runtimeJarFile
							.lastModified()) {
				modified = true;
			}
			runtimeJarFiles.add(runtimeJarFile);
		}

		if (modified) {
			// regen
			log.info("vm runtime modified, regenerating json to "
					+ runtimeJsFile);
			ArrayList<FileInputStream> iss = new ArrayList<FileInputStream>();
			FileOutputStream osr = null;
			try {
				for (File in : runtimeJarFiles) {
					iss.add(new FileInputStream(in));
				}
				osr = new FileOutputStream(runtimeJsFile);
				OutputStreamWriter writerr;
				writerr = new OutputStreamWriter(osr, "utf-8");

				ClassConverterUtil.convertJars(iss, writerr);
				writerr.close();
			} finally {
				for (FileInputStream is : iss) {
					try {
						if (is != null) {
							is.close();
						}
					} catch (IOException e) {
						log.warn("Can't close input file", e);
					}
				}
				try {
					if (osr != null) {
						osr.close();
					}
				} catch (IOException e) {
					log.warn("Can't close output file: " + runtimeJsFile, e);
				}
			}
		}
	}
}
