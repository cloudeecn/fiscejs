package com.cirnoworks.fisce.js;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStreamWriter;
import java.io.Writer;
import java.util.ArrayList;
import java.util.zip.GZIPOutputStream;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

import org.apache.commons.codec.binary.Base64OutputStream;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.cirnoworks.fisce.classloader.utils.SimpleJSONUtil;

public class ClassConverterUtil {

	private final static Logger log = LoggerFactory
			.getLogger(ClassConverterUtil.class);

	public static void convertJars(Iterable<? extends InputStream> in,
			String prefix, String postfix, Writer out, String vfsPrefix,
			String vfsPostfix, Writer vfsOut) throws IOException {
		ClassConverter converter = new ClassConverter();
		converter.multiBegin();
		StringBuilder vfsBuilder = new StringBuilder(16384);
		SimpleJSONUtil.add(vfsBuilder, 0, "{", false);
		byte[] buf = new byte[65536];
		boolean vfsUsed = false;

		for (InputStream is : in) {
			final ZipInputStream jar = new ZipInputStream(is);
			try {
				ZipEntry entry;
				while ((entry = jar.getNextEntry()) != null) {
					if (entry.getName().endsWith(".class")) {
						converter.multiPush(jar);
					} else if (!entry.isDirectory() && vfsOut != null) {
						vfsUsed = true;
						ByteArrayOutputStream baos = new ByteArrayOutputStream(
								(int) entry.getSize());
						Base64OutputStream bos = new Base64OutputStream(baos,
								true, -1, null);
						try {
							int read = 0;
							while ((read = jar.read(buf)) >= 0) {
								bos.write(buf, 0, read);
							}
							bos.flush();
							SimpleJSONUtil.add(vfsBuilder, 1, SimpleJSONUtil
									.escapeString(entry.getName()),
									SimpleJSONUtil.escapeString(new String(baos
											.toByteArray(), "utf-8")), true);
						} finally {
							bos.close();
						}
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
		if (vfsUsed) {
			vfsBuilder.setLength(vfsBuilder.length() - 2);
		}
		SimpleJSONUtil.add(vfsBuilder, 0, "}", false);

		String o = converter.multiFinish();
		if (prefix != null) {
			out.write(prefix);
		}
		out.write(o);
		if (postfix != null) {
			out.write(postfix);
		}
		out.flush();

		if (vfsOut != null) {
			if (vfsPrefix != null) {
				vfsOut.write(vfsPrefix);
			}
			vfsOut.write(vfsBuilder.toString());
			if (vfsPostfix != null) {
				vfsOut.write(vfsPostfix);
			}
			vfsOut.flush();
		}
	}

	public static void convertJar(String prefix, InputStream is,
			String postfix, Writer os, Writer vfsOut) throws IOException {

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
		return cc.multiFinish();
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
				new File("../fiscevm/fiscevm-runtime/target/classes"),
				// ");})(fisceContext);",
				new OutputStreamWriter(new FileOutputStream(
						"src/main/webapp/js/test/rt.json"), "ISO8859-1"));

		System.out.println("done");
	}

	public static void convert(Iterable<String> jarPaths, String jsonPath,
			String vfsPath) throws IOException {
		File runtimeJsFile = new File(jsonPath);

		File vfsJsFile = new File(vfsPath);

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
			FileOutputStream osv = null;
			try {
				for (File in : runtimeJarFiles) {
					iss.add(new FileInputStream(in));
				}
				osr = new FileOutputStream(runtimeJsFile);
				GZIPOutputStream gosr = new GZIPOutputStream(osr);
				OutputStreamWriter writerr = new OutputStreamWriter(gosr,
						"utf-8");

				osv = new FileOutputStream(vfsJsFile);
				GZIPOutputStream gosv = new GZIPOutputStream(osv);
				OutputStreamWriter writerv = new OutputStreamWriter(gosv,
						"utf-8");

				ClassConverterUtil.convertJars(iss, null, null, writerr, null,
						null, writerv);
				writerr.close();
				writerv.close();
				gosr.close();
				gosv.close();
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
				try {
					if (osv != null) {
						osv.close();
					}
				} catch (IOException e) {
					log.warn("Can't close output file: " + vfsJsFile, e);
				}
			}
		}
	}
}
