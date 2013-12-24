package com.cirnoworks.fisce.js.maven;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStreamWriter;

import org.apache.maven.plugin.AbstractMojo;
import org.apache.maven.plugin.MojoExecutionException;
import org.apache.maven.plugin.MojoFailureException;

import com.cirnoworks.fisce.js.AOTGenerator;

/**
 * @goal aot
 */
public class AOTPlugin extends AbstractMojo {

	/**
	 * @parameter 
	 *            default-value="${basedir}/src/main/resources/fisce/method.sample.js"
	 */
	private File file;

	/**
	 * @parameter default-value="${project.build.directory}/aot.data.js"
	 */
	private File compiledFile;

	@Override
	public void execute() throws MojoExecutionException, MojoFailureException {
		try {
			StringBuilder sb = new StringBuilder();
			FileInputStream fis = new FileInputStream(file);
			try {
				AOTGenerator.generateMacros(fis, sb);
			} finally {
				try {
					fis.close();
				} catch (IOException e) {
				}
			}
			File outputDir = compiledFile.getParentFile();
			if (!outputDir.exists()) {
				outputDir.mkdirs();
			}
			OutputStreamWriter osw = new OutputStreamWriter(
					new FileOutputStream(compiledFile), "utf-8");
			try {
				osw.write("/**\n");
				osw.write(" * AOT Template\n");
				osw.write(" */\n");
				osw.write("var FyAOTUtil = new __FyAOTUtil(");
				osw.write(sb.toString());
				osw.write(");\n");
			} finally {
				try {
					osw.close();
				} catch (IOException e) {
				}
			}
		} catch (Exception e) {
			throw new MojoExecutionException("Exception occored", e);
		}
	}

}
