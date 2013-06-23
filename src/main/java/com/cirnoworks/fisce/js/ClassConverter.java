package com.cirnoworks.fisce.js;

import java.io.IOException;
import java.io.InputStream;

import com.cirnoworks.fisce.util.SimpleJSONUtil;
import com.cirnoworks.fisce.vm.VMContext;
import com.cirnoworks.fisce.vm.data.ClassBase;
import com.cirnoworks.fisce.vm.data.ClassField;
import com.cirnoworks.fisce.vm.data.ClassMethod;
import com.cirnoworks.fisce.vm.data.constants.Constant;
import com.cirnoworks.fisce.vm.data.constants.ConstantClass;
import com.cirnoworks.fisce.vm.default_impl.DefaultClassLoader;

public class ClassConverter {
	private StringBuilder sb = new StringBuilder(16384);
	private boolean finished;

	private void convert(InputStream is) throws IOException {
		DefaultClassLoader dcl = new DefaultClassLoader();
		VMContext dummyContext = new VMContext();
		ClassBase clazz = new ClassBase(dummyContext, dcl);
		dcl.loadClassFromStream(clazz, is, dummyContext);

		sb.append("{");
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

		SimpleJSONUtil.add(sb, 1, "superClassName", SimpleJSONUtil
				.escapeString(clazz.getSuperClassInfo().getName(), true));

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

				SimpleJSONUtil.add(sb, 3, "uniqueName", field.getUniqueName());
				SimpleJSONUtil.add(sb, 3, "accessFlags",
						"0x" + Integer.toString(field.getAccessFlags(), 16));
				SimpleJSONUtil.add(sb, 3, "posRel", field.getPosition());
				SimpleJSONUtil.add(sb, 3, "size", field.getLength());

				SimpleJSONUtil.add(sb, 2, "}", i < max - 1);
			}
			SimpleJSONUtil.add(sb, 1, "}", true);
		}

		{// Methods
			SimpleJSONUtil.add(sb, 1, "methods", "[", false);
			ClassMethod[] methods = clazz.getMethods();
			for (int i = 0, max = methods.length; i < max; i++) {
				ClassMethod method = methods[i];
				SimpleJSONUtil.add(
						sb,
						2,
						SimpleJSONUtil.escapeString(method.getName() + "."
								+ method.getDescriptor(), true), "{", false);

				SimpleJSONUtil.add(sb, 3, "fullName", "." + method.getName()
						+ "." + method.getDescriptor());
				SimpleJSONUtil.add(sb, 3, "uniqueName", method.getUniqueName());
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
				SimpleJSONUtil.add(sb, 3, "parameterClassNames", "[", false);
				String[] pcns = method.getParameterTypeClassNames();
				for (int j = 0, maxj = pcns.length; j < maxj; j++) {
					String pcn = pcns[j];
					SimpleJSONUtil.add(sb, 4,
							SimpleJSONUtil.escapeString(pcn, true),
							j < maxj - 1);
				}
				SimpleJSONUtil.add(sb, 3, "]");
				SimpleJSONUtil.add(
						sb,
						3,
						"returnClassName",
						method.getReturnTypeClassName() == null ? "undefined"
								: SimpleJSONUtil.escapeString(
										method.getReturnTypeClassName(), true));

				SimpleJSONUtil.add(sb, 2, "}", i < max - 1);
			}
			SimpleJSONUtil.add(sb, 1, "]", true);
		}
		sb.append("}");
	}

	public static void main(String[] args) throws Exception {
		ClassConverter cc = new ClassConverter();
		cc.convert(System.class.getResourceAsStream("System.class"));
		System.out.println(cc.sb.toString());
	}
}
