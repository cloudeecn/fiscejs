package com.cirnoworks.fisce.js;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.zip.GZIPOutputStream;

import javax.servlet.ServletContext;
import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.javascript.jscomp.CompilationLevel;
import com.google.javascript.jscomp.Compiler;
import com.google.javascript.jscomp.CompilerOptions;
import com.google.javascript.jscomp.SourceFile;

public class FiScEJSListener implements ServletContextListener {

	private final static Logger log = LoggerFactory
			.getLogger(FiScEJSListener.class);

	private static List<String> paths(ServletContext context, String... paths) {
		List<String> result = Arrays.asList(paths);
		for (int i = paths.length; i-- > 0;) {
			result.set(i, context.getRealPath(result.get(i)));
		}
		return result;
	}

	@Override
	public void contextInitialized(ServletContextEvent sce) {
		log.info("Initializing fiscejs...");
		long begin = System.nanoTime();
		ServletContext context = sce.getServletContext();
		try {
			ClassConverter cc = new ClassConverter();
			cc.multiBegin();

			ClassConverterUtil
					.convert(
							paths(context, "/WEB-INF/runtime.jar",
									"/WEB-INF/jsgen.jar"), "/fisce/rt.gzjson",
							"/fisce/rt-vfs.gzjson");

			{
				String aotOutputPath = context
						.getRealPath("/fisce/aot.data.js");
				File aotOutputFile = new File(aotOutputPath);
				// regen
				log.info("method.sample.js modified, regenerating aot to "
						+ aotOutputFile);
				InputStream is = FiScEJSListener.class
						.getResourceAsStream("/fisce/method.sample.js");
				StringBuilder sb = new StringBuilder(65536);
				try {
					AOTGenerator.generateMacros(is, sb);
				} finally {
					try {
						is.close();
					} catch (Exception e) {
						e.printStackTrace();
					}
				}
				System.out.println(sb);
				PrintWriter pw = new PrintWriter(aotOutputFile);
				try {
					pw.println("/**");
					pw.println(" * AOT Template");
					pw.println(" */");
					pw.print("var FyAOTUtil = new __FyAOTUtil(");
					pw.print(sb);
					pw.println(");");
				} finally {
					try {
						pw.close();
					} catch (Exception e) {
						e.printStackTrace();
					}
				}
			}

			{
				File fiscePath = new File(context.getRealPath("/fisce/"));
				File compiledFile = new File(fiscePath, "fisce.gzjs");
				ArrayList<String> files = new ArrayList<String>();
				InputStream fis = FiScEJSListener.class
						.getResourceAsStream("/fisce/filelist.txt");
				try {
					BufferedReader br = new BufferedReader(
							new InputStreamReader(fis, "utf-8"));
					String line;
					while ((line = br.readLine()) != null) {
						line = line.trim();
						if (line.length() == 0 || line.startsWith("#")) {
							continue;
						}
						files.add(line);
					}
					br.close();
				} finally {
					try {
						fis.close();
					} catch (IOException e) {
						log.warn("Can't close filelist.txt", e);
					}
				}

				// regenerate
				Compiler compiler = new Compiler();
				CompilerOptions options = new CompilerOptions();
				CompilationLevel.SIMPLE_OPTIMIZATIONS
						.setOptionsForCompilationLevel(options);
				ArrayList<SourceFile> inputs = new ArrayList<SourceFile>();
				char[] buf = new char[65536];
				StringBuilder sb=new StringBuilder(65536);
				for (String fileName : files) {
					sb.setLength(0);
					InputStream is = FiScEJSListener.class
							.getResourceAsStream("/fisce/" + fileName);
					BufferedReader br = new BufferedReader(
							new InputStreamReader(is, "utf-8"));
					try {
						int read;
						while ((read = br.read(buf)) >= 0) {
							sb.append(buf, 0, read);
						}
						SourceFile input = SourceFile.fromCode(fileName, sb.toString());
						inputs.add(input);
					} finally {
						try {
							br.close();
						} catch (IOException e) {
							log.warn("Exception occored while closing "
									+ fileName, e);
						}
					}
					
				}
				SourceFile extern = SourceFile.fromCode("externs.js",
						"function alert(x) {}");
				compiler.compile(Arrays.asList(extern), inputs, options);
				String output = compiler.toSource();
				FileOutputStream fos = new FileOutputStream(compiledFile);
				try {
					GZIPOutputStream gos = new GZIPOutputStream(fos);
					OutputStreamWriter writer = new OutputStreamWriter(gos,
							"utf-8");
					writer.write(output);
					writer.close();
					gos.close();
				} finally {
					try {
						fos.close();
					} catch (IOException e) {
						log.warn("Can't close output file " + compiledFile, e);
					}
				}
			}
		} catch (IOException e) {
			throw new RuntimeException(e);
		}
		log.info("Initializing fiscejs...completed in "
				+ (System.nanoTime() - begin) / 1000000f + "ms");
	}

	@Override
	public void contextDestroyed(ServletContextEvent sce) {

	}

}
