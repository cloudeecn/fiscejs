package com.cirnoworks.fisce.js;

import java.io.BufferedReader;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.util.LinkedHashMap;
import java.util.Map.Entry;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import com.cirnoworks.fisce.classloader.utils.SimpleJSONUtil;

public class AOTGenerator {

	private static enum Status {
		NONE, MACRO, OP
	}

	private static class Op {
		String code;
		String pops;
		String pushes;
	}

	private static final Pattern beginPattern = Pattern
			.compile("^//\\s*\\#\\#(.*?)\\-(.*?)$");
	private static final Pattern commentPattern = Pattern.compile("//");
	private static final Pattern endPattern = Pattern
			.compile("^//\\s*\\#\\#\\#$");
	private static final Pattern commentLine = Pattern.compile("//\\s+[^\\#]");
	private static final String commentBlockBegin = "/*";
	private static final String commentBlockEnd = "*/";

	public static void generateMacros(InputStream in, StringBuilder out)
			throws IOException {
		BufferedReader br = new BufferedReader(new InputStreamReader(in));
		LinkedHashMap<String, String> macros = new LinkedHashMap<String, String>();
		LinkedHashMap<String, Op> ops = new LinkedHashMap<String, Op>();
		String line;
		Status status = Status.NONE;
		StringBuilder code = new StringBuilder(4096);
		String[] keys = null;
		boolean inCommentBlock = false;
		while ((line = br.readLine()) != null) {
			line = line.trim();
			{
				Matcher commentLineMatcher = commentLine.matcher(line);
				if (commentLineMatcher.find()) {
					line = line.substring(0, commentLineMatcher.start());
				}
			}
			if (inCommentBlock) {
				int idx = line.indexOf(commentBlockEnd);
				if (idx >= 0) {
					inCommentBlock = false;
					if (line.length() > idx + commentBlockEnd.length()) {
						line = line.substring(idx + commentBlockEnd.length());
					} else {
						continue;
					}
				} else {
					continue;
				}
			} else {
				int idx = line.indexOf(commentBlockBegin);
				if (idx > 0) {
					inCommentBlock = true;
					line = line.substring(0, idx);
				} else if (idx == 0) {
					inCommentBlock = true;
					continue;
				}
			}
			if (status == Status.NONE) {
				Matcher matcher = beginPattern.matcher(line);
				if (matcher.matches()) {
					code.setLength(0);
					String type = matcher.group(1);
					keys = matcher.group(2).split("\\s+");
					if ("MACRO".equals(type)) {
						status = Status.MACRO;
					} else if ("OP".equals(type)) {
						status = Status.OP;
					} else {
						throw new RuntimeException("Unknown type: " + type);
					}
				}
			} else {
				if (endPattern.matcher(line).matches()) {
					switch (status) {
					case MACRO:
						macros.put(keys[0], code.toString());
						break;
					case OP:
						String[] opCodes = keys[0].split("\\|");
						Op op = new Op();
						op.code = code.toString();
						op.pops = keys[1];
						op.pushes = keys[2];
						for (String opCode : opCodes) {
							ops.put(opCode, op);
						}
						break;
					default:
						throw new IllegalStateException();
					}
					status = Status.NONE;
				} else {
					Matcher commentMatcher = commentPattern.matcher(line);
					if (commentMatcher.find()) {
						line = line.substring(0, commentMatcher.start());
					}
					code.append(line);
				}
			}
		}
		if (status != Status.NONE) {
			throw new IOException("Unexpected end of file.");
		}
		out.append("{\n");
		out.append("\t\"ops\" : {\n");
		for (Entry<String, Op> entry : ops.entrySet()) {
			SimpleJSONUtil.add(out, 2,
					SimpleJSONUtil.escapeString(entry.getKey()), "{", false);
			SimpleJSONUtil.add(out, 3, "\"code\"",
					SimpleJSONUtil.escapeString(entry.getValue().code), true);
			SimpleJSONUtil.add(out, 3, "\"pops\"",
					SimpleJSONUtil.escapeString(entry.getValue().pops), true);
			SimpleJSONUtil
					.add(out, 3, "\"pushes\"", SimpleJSONUtil
							.escapeString(entry.getValue().pushes), false);
			SimpleJSONUtil.add(out, 2, "}", true);
		}
		out.setLength(out.length() - 2);
		out.append('\n');
		out.append("\t},\n");

		out.append("\t\"macros\" : {\n");
		for (Entry<String, String> entry : macros.entrySet()) {
			SimpleJSONUtil.add(out, 2,
					SimpleJSONUtil.escapeString(entry.getKey()),
					SimpleJSONUtil.escapeString(entry.getValue()), true);
		}
		out.setLength(out.length() - 2);
		out.append('\n');
		out.append("\t}\n");
		out.append("}");
	}

	public static void main(String[] args) throws Exception {
		StringBuilder sb = new StringBuilder();
		InputStream is = new FileInputStream(
				"src/main/webapp/js/fisce/method.sample.js");
		try {
			generateMacros(is, sb);
		} finally {
			try {
				is.close();
			} catch (Exception e) {
				e.printStackTrace();
			}
		}
		System.out.println(sb);
		PrintWriter pw = new PrintWriter(
				"src/main/webapp/js/fisce/aot.data.js");
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
}
