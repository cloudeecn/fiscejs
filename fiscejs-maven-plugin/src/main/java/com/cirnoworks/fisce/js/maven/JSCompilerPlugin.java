package com.cirnoworks.fisce.js.maven;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.nio.charset.Charset;
import java.util.ArrayList;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

import org.apache.maven.plugin.AbstractMojo;
import org.apache.maven.plugin.MojoExecutionException;
import org.apache.maven.plugin.MojoFailureException;
import org.apache.maven.plugin.logging.Log;

import com.google.javascript.jscomp.CompilationLevel;
import com.google.javascript.jscomp.Compiler;
import com.google.javascript.jscomp.CompilerOptions;
import com.google.javascript.jscomp.CompilerOptions.LanguageMode;
import com.google.javascript.jscomp.JSError;
import com.google.javascript.jscomp.SourceFile;
import com.google.javascript.jscomp.WarningLevel;

/**
 * @goal compile-zip
 */
public class JSCompilerPlugin extends AbstractMojo {

	/**
	 * @parameter default-value="${project.build.directory}/js.zip"
	 */
	private File zipFile;

	/**
	 * @parameter default-value="${project.build.directory}/compiled"
	 */
	private File compiledFile;

	/**
	 * @parameter
	 */
	private File[] externs;

	/**
	 * @parameter
	 */
	private File[] extras;

	/**
	 * @parameter
	 */
	private boolean stopOnWarning;

	@Override
	public void execute() throws MojoExecutionException, MojoFailureException {
		Log log = this.getLog();
		try {
			File outputDir = compiledFile.getParentFile();
			if (!outputDir.exists()) {
				outputDir.mkdirs();
			}
			ArrayList<SourceFile> inputs = new ArrayList<SourceFile>();
			ZipInputStream zis = new ZipInputStream(
					new FileInputStream(zipFile));
			try {
				ZipEntry entry;
				while ((entry = zis.getNextEntry()) != null) {
					if (entry.getName().endsWith(".js")) {
						this.getLog().info("Adding " + entry.getName() + "...");
						inputs.add(SourceFile.fromInputStream(entry.getName(),
								zis));
						zis.closeEntry();
					}
				}
			} finally {
				try {
					zis.close();
				} catch (IOException e) {
				}
			}

			ArrayList<SourceFile> externSources = new ArrayList<SourceFile>();
			zis = new ZipInputStream(getClass().getResourceAsStream(
					"/externs.zip"));
			try {
				ZipEntry entry;
				while ((entry = zis.getNextEntry()) != null) {
					if (entry.getName().endsWith(".js")) {
						this.getLog().info("Adding extern " + entry.getName() + "...");
						externSources.add(SourceFile.fromInputStream(entry.getName(),
								zis));
						zis.closeEntry();
					}
				}
			} finally {
				try {
					zis.close();
				} catch (IOException e) {

				}
			}
			// regenerate
			Compiler compiler = new Compiler();
			CompilerOptions options = new CompilerOptions();
			CompilationLevel.ADVANCED_OPTIMIZATIONS
					.setOptionsForCompilationLevel(options);
			options.setLanguage(LanguageMode.ECMASCRIPT5);
			WarningLevel.VERBOSE.setOptionsForWarningLevel(options);;
//			options.setWarningLevel(DiagnosticGroups.CHECK_TYPES, CheckLevel.ERROR);
//			options.setCheckDeterminism(true);
			options.setGenerateExports(true);
			options.setPrettyPrint(true);
			options.setRenamePrefix("xw");
			
			if (externs != null) {
				for (File extern : externs) {
					externSources.add(SourceFile.fromFile(extern,
							Charset.forName("utf-8")));
				}
			}
			compiler.compile(externSources, inputs, options);
			for (JSError warning : compiler.getWarnings()) {
				log.warn(warning.toString());
			}
			for (JSError error : compiler.getErrors()) {
				log.error(error.toString());
			}
			if (compiler.getErrorCount() > 0) {
				throw new MojoExecutionException("JS Compile error");
			}
			if (stopOnWarning && compiler.getWarningCount() > 0) {
				throw new MojoExecutionException("JS Compiles with warning");
			}
			String output = compiler.toSource();
			FileOutputStream fos = new FileOutputStream(compiledFile);
			try {
				OutputStreamWriter writer;
				writer = new OutputStreamWriter(fos, "utf-8");
				writer.write(output);
				if (extras != null) {
					char[] cbuf = new char[65536];
					int cread = 0;
					for (File extra : extras) {
						this.getLog().info("Adding extra files");
						writer.write('\n');
						InputStreamReader isr = new InputStreamReader(
								new FileInputStream(extra), "utf-8");
						try {
							while ((cread = isr.read(cbuf)) >= 0) {
								writer.write(cbuf, 0, cread);
							}
						} finally {
							try {
								isr.close();
							} catch (Exception e) {
							}
						}
					}
				}
				writer.close();
			} finally {
				try {
					fos.close();
				} catch (IOException e) {
				}
			}
		} catch (Exception e) {
			throw new MojoExecutionException("Exception occored", e);
		}
	}
}
