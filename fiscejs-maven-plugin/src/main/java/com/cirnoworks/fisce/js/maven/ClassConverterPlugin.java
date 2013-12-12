package com.cirnoworks.fisce.js.maven;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;

import org.apache.maven.plugin.AbstractMojo;
import org.apache.maven.plugin.MojoExecutionException;
import org.apache.maven.plugin.MojoFailureException;

import com.cirnoworks.fisce.js.ClassConverterUtil;

/**
 * @goal convert
 */
public class ClassConverterPlugin extends AbstractMojo {

	/**
	 * @parameter
	 */
	private String[] jars;

	/**
	 * @parameter default-value="${project.build.directory}/json"
	 */
	private String outputDir;

	/**
	 * @parameter default-value="rt.gzjson"
	 */
	private String outputFilename;

	/**
	 * @parameter default-value="rt-vfs.gzjson"
	 */
	private String outputVFSFilename;

	/**
	 * @parameter default-value=false
	 */
	private boolean jsonp;

	@Override
	public void execute() throws MojoExecutionException, MojoFailureException {
		ArrayList<FileInputStream> in = new ArrayList<FileInputStream>(
				jars.length);
		try {
			for (String jar : jars) {
				FileInputStream fis = new FileInputStream(jar);
				in.add(fis);
			}
			if (!outputDir.endsWith("/")) {
				outputDir += "/";
			}
			File outputDirFile = new File(outputDir);
			if (!outputDirFile.exists()) {
				outputDirFile.mkdirs();
			}
			ClassConverterUtil.convert(Arrays.asList(jars), outputDir
					+ outputFilename, outputDir + outputVFSFilename, jsonp);
		} catch (IOException e) {
			throw new MojoExecutionException("Exception occored", e);
		} finally {
			for (FileInputStream fis : in) {
				try {
					fis.close();
				} catch (IOException e) {
				}
			}
		}
	}

}
