package com.cirnoworks.fisce.js;

import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStreamWriter;
import java.io.Writer;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

import com.cirnoworks.fisce.util.SimpleJSONUtil;
import com.cirnoworks.fisce.vm.VMContext;
import com.cirnoworks.fisce.vm.data.ClassBase;
import com.cirnoworks.fisce.vm.data.ClassField;
import com.cirnoworks.fisce.vm.data.ClassMethod;
import com.cirnoworks.fisce.vm.data.attributes.ExceptionHandler;
import com.cirnoworks.fisce.vm.data.attributes.LineNumber;
import com.cirnoworks.fisce.vm.data.constants.Constant;
import com.cirnoworks.fisce.vm.data.constants.ConstantClass;
import com.cirnoworks.fisce.vm.default_impl.DefaultClassLoader;

public class ClassConverter {
	private StringBuilder sb = new StringBuilder(16384);

	private void convert(InputStream is) throws IOException {
		DefaultClassLoader dcl = new DefaultClassLoader();
		VMContext dummyContext = new VMContext();
		ClassBase clazz = new ClassBase(dummyContext, dcl);
		dcl.loadClassFromStream(clazz, is, dummyContext);

		sb.append("{\n");
		SimpleJSONUtil.add(sb, 1, "name",
				SimpleJSONUtil.escapeString(clazz.getName(), true));

		// Version
		SimpleJSONUtil
				.add(sb, 1, "minorVersion", (int) clazz.getMinorVersion());
		SimpleJSONUtil
				.add(sb, 1, "majorVersion", (int) clazz.getMajorVersion());

		{ // Constant Pool
			SimpleJSONUtil.add(sb, 1, "constants : [", false);
			Constant[] constants = clazz.getConstantPool();
			for (int i = 0, max = constants.length; i < max; i++) {
				Constant constant = constants[i];
				if (constant == null) {
					SimpleJSONUtil.add(sb, 2, "undefined", i < max - 1);
				} else {
					constant.appendJSON(sb, 2, i < max - 1);
				}
			}
			SimpleJSONUtil.add(sb, 1, "]", true);
		}

		SimpleJSONUtil.add(sb, 1, "accessFlags",
				"0x" + Integer.toString(clazz.getAccessFlags(), 16));
		SimpleJSONUtil.add(sb, 1, "needFinalize",
				String.valueOf(clazz.isNeedFinalize()));

		if (clazz.getSuperClassInfo() != null) {
			SimpleJSONUtil.add(sb, 1, "superClassName", SimpleJSONUtil
					.escapeString(clazz.getSuperClassInfo().getName(), true));
		}
		{// interfaces
			SimpleJSONUtil.add(sb, 1, "interfaceNames", "[", false);
			ConstantClass[] interfaceInfos = clazz.getInterfaceInfos();
			for (int i = 0, max = interfaceInfos.length; i < max; i++) {
				SimpleJSONUtil.add(sb, 2, SimpleJSONUtil.escapeString(
						interfaceInfos[i].getName(), true), i < max - 1);
			}
			SimpleJSONUtil.add(sb, 1, "]", true);
		}

		{// Fields
			SimpleJSONUtil.add(sb, 1, "fields", "{", false);
			ClassField[] fields = clazz.getFields();
			for (int i = 0, max = fields.length; i < max; i++) {
				ClassField field = fields[i];
				SimpleJSONUtil.add(
						sb,
						2,
						SimpleJSONUtil.escapeString(field.getName() + "."
								+ field.getDescriptor(), true), "{", false);

				SimpleJSONUtil.add(sb, 3, "uniqueName",
						SimpleJSONUtil.escapeString(field.getUniqueName()));
				SimpleJSONUtil.add(sb, 3, "accessFlags",
						"0x" + Integer.toString(field.getAccessFlags(), 16));
				SimpleJSONUtil.add(sb, 3, "posRel", field.getPosition());
				SimpleJSONUtil.add(sb, 3, "size", field.getLength());

				SimpleJSONUtil.add(sb, 2, "}", i < max - 1);
			}
			SimpleJSONUtil.add(sb, 1, "}", true);
		}

		{// Methods
			SimpleJSONUtil.add(sb, 1, "methods", "{", false);
			ClassMethod[] methods = clazz.getMethods();
			for (int i = 0, max = methods.length; i < max; i++) {
				ClassMethod method = methods[i];
				SimpleJSONUtil.add(
						sb,
						2,
						SimpleJSONUtil.escapeString(method.getName() + "."
								+ method.getDescriptor(), true), "{", false);

				SimpleJSONUtil.add(
						sb,
						3,
						"fullName",
						SimpleJSONUtil.escapeString("." + method.getName()
								+ "." + method.getDescriptor()));
				SimpleJSONUtil.add(sb, 3, "uniqueName",
						SimpleJSONUtil.escapeString(method.getUniqueName()));
				SimpleJSONUtil.add(sb, 3, "accessFlags",
						"0x" + Integer.toString(method.getAccessFlags(), 16));

				SimpleJSONUtil.add(sb, 3, "paramStackUsage",
						method.getParamCount());
				SimpleJSONUtil.add(sb, 3, "paramType", SimpleJSONUtil
						.escapeString(new String(method.getParamType(),
								"ISO8859-1"), true));
				SimpleJSONUtil.add(sb, 3, "returnType", SimpleJSONUtil
						.escapeString(
								String.valueOf((char) method.getReturnType()),
								true));

				SimpleJSONUtil.add(sb, 3, "parameterCount",
						method.getParameterCount());
				{// Parameter class names
					SimpleJSONUtil
							.add(sb, 3, "parameterClassNames", "[", false);
					String[] pcns = method.getParameterTypeClassNames();
					for (int j = 0, maxj = pcns.length; j < maxj; j++) {
						String pcn = pcns[j];
						SimpleJSONUtil.add(sb, 4,
								SimpleJSONUtil.escapeString(pcn, true),
								j < maxj - 1);
					}
					SimpleJSONUtil.add(sb, 3, "]");
				}
				SimpleJSONUtil.add(
						sb,
						3,
						"returnClassName",
						method.getReturnTypeClassName() == null ? "undefined"
								: SimpleJSONUtil.escapeString(
										method.getReturnTypeClassName(), true));

				ExceptionHandler[] exceptionHandlerTable = method
						.getExceptionTable();
				if (exceptionHandlerTable != null) {
					SimpleJSONUtil.add(sb, 3, "exceptionTable", "[", false);
					for (int j = 0, maxj = exceptionHandlerTable.length; j < maxj; j++) {
						ExceptionHandler eh = exceptionHandlerTable[j];
						SimpleJSONUtil.add(sb, 4, "{", false);
						SimpleJSONUtil.add(sb, 5, "start", (int) eh.startPc);
						SimpleJSONUtil.add(sb, 5, "end", (int) eh.endPc);
						if (eh.catchClass != null) {
							SimpleJSONUtil.add(sb, 5, "exceptionClassName",
									SimpleJSONUtil.escapeString(eh.catchClass
											.getName()));
						} else {
							if (eh.catchType != 0) {
								throw new RuntimeException(
										"Illegal ExceptionHandler: " + eh);
							}
						}
						SimpleJSONUtil
								.add(sb, 5, "handler", (int) eh.handlerPc);
						SimpleJSONUtil.add(sb, 4, "}", j < maxj - 1);
					}
					SimpleJSONUtil.add(sb, 3, "]", true);
				}

				LineNumber[] lineNumbers = method.getLineNumberTable();
				if (lineNumbers != null) {
					SimpleJSONUtil.add(sb, 3, "lineNumberTable", "[", false);
					for (int j = 0, maxj = lineNumbers.length; j < maxj; j++) {
						LineNumber ln = lineNumbers[j];
						SimpleJSONUtil.add(sb, 4, "{", false);
						SimpleJSONUtil.add(sb, 5, "start", (int) ln.startPc);
						SimpleJSONUtil.add(sb, 5, "line", (int) ln.lineNumber);
						SimpleJSONUtil.add(sb, 4, "}", j < maxj - 1);
					}
					SimpleJSONUtil.add(sb, 3, "]", true);
				}

				byte[] code = method.getCode();
				if (code != null) {
					SimpleJSONUtil.add(sb, 3, "code", "[", false);
					SimpleJSONUtil.addIndent(sb, 4);
					for (int j = 0, maxj = code.length; j < maxj; j++) {
						sb.append(((int) code[j]) & 0xff);
						if (j < maxj - 1) {
							sb.append(", ");
							if (j % 32 == 31) {
								sb.append('\n');
								SimpleJSONUtil.addIndent(sb, 4);
							}
						}
					}
					sb.append('\n');
					SimpleJSONUtil.add(sb, 3, "]", true);
				}
				SimpleJSONUtil.add(sb, 2, "}", i < max - 1);
			}
			SimpleJSONUtil.add(sb, 1, "}", true);
		}
		SimpleJSONUtil.add(sb, 1, "converted", "true", false);
		sb.append("}\n");
	}

	public void convertJar(String prefix, InputStream is, String postfix,
			Writer os) throws IOException {
		SimpleJSONUtil.add(sb, 0, "[", false);
		ZipInputStream jar = new ZipInputStream(is);
		try {
			ZipEntry entry;
			while ((entry = jar.getNextEntry()) != null) {
				if (entry.getName().endsWith(".class")) {
					convert(jar);
					sb.append(",");
				}
				jar.closeEntry();
			}
		} finally {
			try {
				jar.close();
			} catch (IOException e) {
				e.printStackTrace();
			}
		}
		sb.setLength(sb.length() - 1);
		SimpleJSONUtil.add(sb, 0, "]", false);
		if (prefix != null) {
			os.write(prefix);
		}
		os.write(sb.toString());
		if (postfix != null) {
			os.write(postfix);
		}
		os.flush();
	}

	public static void main(String[] args) throws Exception {
		ClassConverter cc = new ClassConverter();
		cc.convertJar("(function(context){context.addClassDef(",
				new FileInputStream("rt.jar"), ");})(fisceContext);",
				new OutputStreamWriter(new FileOutputStream("rt.js"),
						"ISO8859-1"));
		System.out.println("done");
	}
}
