package com.cirnoworks.fisce.js.maven;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.zip.GZIPOutputStream;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

import org.apache.maven.plugin.AbstractMojo;
import org.apache.maven.plugin.MojoExecutionException;
import org.apache.maven.plugin.MojoFailureException;

import com.google.javascript.jscomp.CompilationLevel;
import com.google.javascript.jscomp.Compiler;
import com.google.javascript.jscomp.CompilerOptions;
import com.google.javascript.jscomp.SourceFile;

/**
 * @goal compile-zip
 */
public class JSCompilerPlugin extends AbstractMojo {

	/**
	 * @parameter default-value="${project.build.directory}/js.zip"
	 */
	private File zipFile;

	/**
	 * @parameter default-value="${project.build.directory}/compiled.gzjs"
	 */
	private File compiledFile;

	private File[] extras;

	@Override
	public void execute() throws MojoExecutionException, MojoFailureException {
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
			// regenerate
			Compiler compiler = new Compiler();
			CompilerOptions options = new CompilerOptions();
			CompilationLevel.SIMPLE_OPTIMIZATIONS
					.setOptionsForCompilationLevel(options);

			SourceFile extern = SourceFile.fromCode("externs.js",
					"function alert(x) {}");
			compiler.compile(Arrays.asList(extern), inputs, options);
			String output = compiler.toSource();
			FileOutputStream fos = new FileOutputStream(compiledFile);
			try {
				GZIPOutputStream gos = new GZIPOutputStream(fos);
				OutputStreamWriter writer = new OutputStreamWriter(gos, "utf-8");
				writer.write(output);
				if (extras != null) {
					char[] cbuf = new char[65536];
					int cread = 0;
					for (File extra : extras) {
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
				gos.close();
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
