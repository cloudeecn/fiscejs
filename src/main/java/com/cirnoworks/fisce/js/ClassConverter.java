package com.cirnoworks.fisce.js;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStreamWriter;
import java.io.Writer;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

import org.objectweb.asm.ClassReader;
import org.objectweb.asm.tree.analysis.BasicValue;
import org.objectweb.asm.tree.analysis.Frame;

import com.cirnoworks.fisce.classloader.utils.SimpleJSONUtil;
import com.cirnoworks.fisce.classloader.utils.StringPool;
import com.cirnoworks.fisce.data.ClassData;
import com.cirnoworks.fisce.data.FieldData;
import com.cirnoworks.fisce.data.LookupSwitchTarget;
import com.cirnoworks.fisce.data.MethodData;
import com.cirnoworks.fisce.data.TableSwitchTarget;
import com.cirnoworks.fisce.data.constants.ConstantData;
import com.cirnoworks.fisce.data.constants.JSONExportableConstantData;
import com.cirnoworks.fisce.vm.data.attributes.ExceptionHandler;
import com.cirnoworks.fisce.vm.data.attributes.LineNumber;

public class ClassConverter {
	private StringBuilder sb;

	private final LinkedHashMap<JSONExportableConstantData, Integer> constantTable = new LinkedHashMap<JSONExportableConstantData, Integer>();
	{
		constantTable.put(null, 0);
	}

	public int poolConstant(JSONExportableConstantData constant) {
		Integer pos = constantTable.get(constant);
		if (pos == null) {
			pos = constantTable.size();
			constantTable.put(constant, pos);
		}
		return pos;
	}

	LinkedHashMap<String, Integer> stringTable = new LinkedHashMap<String, Integer>();
	private final StringPool stringPool = new StringPool() {
		{
			stringTable.put(null, 0);
		}

		@Override
		public int poolString(String str) {
			Integer pos = stringTable.get(str);
			if (pos == null) {
				pos = stringTable.size();
				stringTable.put(str, pos);
			}
			return pos;
		}

	};

	private void convert(InputStream is, StringBuilder sb) throws IOException {
		ClassReader cr = new ClassReader(is);
		ClassData clazz = new ClassData(cr);
		cr.accept(clazz, ClassReader.EXPAND_FRAMES);

		sb.append("{\n");
		SimpleJSONUtil.add(sb, 1, "\"name\"",
				stringPool.poolString(clazz.getName()), true);
		System.out.println(clazz.getName());

		if (clazz.sourceFile != null) {
			SimpleJSONUtil.add(sb, 1, "\"sourceFile\"",
					stringPool.poolString(clazz.getSourceFile()), true);
		}

		{ // Constant Pool
			SimpleJSONUtil.add(sb, 1, "\"constants\"", "[", false);
			ConstantData[] constants = clazz.getConstantPool();
			for (int i = 0, max = constants.length; i < max; i++) {
				ConstantData constant = constants[i];
				if (constant == null
						|| !(constant instanceof JSONExportableConstantData)) {
					SimpleJSONUtil.add(sb, 2, "0", i < max - 1);
				} else {
					SimpleJSONUtil
							.add(sb,
									2,
									String.valueOf(poolConstant((JSONExportableConstantData) constant)),
									i < max - 1);
				}
			}
			SimpleJSONUtil.add(sb, 1, "]", true);
		}

		SimpleJSONUtil.add(sb, 1, "\"accessFlags\"",
				(int) clazz.getAccessFlags());

		SimpleJSONUtil.add(sb, 1, "\"superClassData\"",
				(int) clazz.getSuperClassInfoIndex());

		{// interfaces
			SimpleJSONUtil.add(sb, 1, "\"interfaceDatas\"", "[", false);
			int[] interfaceInfos = clazz.getInterfaceInfoIndexs();
			for (int i = 0, max = interfaceInfos.length; i < max; i++) {
				SimpleJSONUtil.add(sb, 2, String.valueOf(interfaceInfos[i]),
						i < max - 1);
			}
			SimpleJSONUtil.add(sb, 1, "]", true);
		}

		{// Fields
			SimpleJSONUtil.add(sb, 1, "\"fields\"", "[", false);
			FieldData[] fields = clazz.getFields();
			for (int i = 0, max = fields.length; i < max; i++) {
				FieldData field = fields[i];
				SimpleJSONUtil.add(sb, 2, "{", false);

				SimpleJSONUtil.add(sb, 3, "\"name\"",
						stringPool.poolString(field.getName()));
				SimpleJSONUtil.add(sb, 3, "\"descriptor\"",
						stringPool.poolString(field.getDescriptor()));
				SimpleJSONUtil.add(sb, 3, "\"accessFlags\"",
						(int) field.getAccessFlags());
				SimpleJSONUtil.add(sb, 3, "\"posRel\"", field.getPosition());
				SimpleJSONUtil.add(sb, 3, "\"size\"", field.getLength());
				SimpleJSONUtil.add(sb, 3, "\"constantValueData\"",
						(int) field.getConstantValueIndex(), false);

				SimpleJSONUtil.add(sb, 2, "}", i < max - 1);
			}
			SimpleJSONUtil.add(sb, 1, "]", true);
		}

		{// Methods
			SimpleJSONUtil.add(sb, 1, "\"methods\"", "[", false);
			MethodData[] methods = clazz.getMethods();
			for (int i = 0, max = methods.length; i < max; i++) {
				MethodData method = methods[i];
				SimpleJSONUtil.add(sb, 2, "{", false);

				SimpleJSONUtil.add(sb, 3, "\"name\"",
						stringPool.poolString(method.getName()));
				SimpleJSONUtil.add(sb, 3, "\"descriptor\"",
						stringPool.poolString(method.getDescriptor()));
				SimpleJSONUtil.add(sb, 3, "\"accessFlags\"",
						(int) method.getAccessFlags());

				ExceptionHandler[] exceptionHandlerTable = method
						.getExceptionTable();
				if (exceptionHandlerTable != null) {
					SimpleJSONUtil.add(sb, 3, "\"exceptionTable\"", "[", false);
					for (int j = 0, maxj = exceptionHandlerTable.length; j < maxj; j++) {
						ExceptionHandler eh = exceptionHandlerTable[j];
						SimpleJSONUtil.add(sb, 4, "{", false);
						SimpleJSONUtil
								.add(sb, 5, "\"start\"", (int) eh.startPc);
						SimpleJSONUtil.add(sb, 5, "\"end\"", (int) eh.endPc);
						SimpleJSONUtil.add(sb, 5, "\"catchClassData\"",
								(int) eh.catchClassIdx);
						SimpleJSONUtil.add(sb, 5, "\"handler\"",
								(int) eh.handlerPc, false);
						SimpleJSONUtil.add(sb, 4, "}", j < maxj - 1);
					}
					SimpleJSONUtil.add(sb, 3, "]", true);
				}

				LineNumber[] lineNumbers = method.getLineNumberTable();
				if (lineNumbers != null) {
					SimpleJSONUtil
							.add(sb, 3, "\"lineNumberTable\"", "[", false);
					for (int j = 0, maxj = lineNumbers.length; j < maxj; j++) {
						LineNumber ln = lineNumbers[j];
						SimpleJSONUtil.add(sb, 4, "{", false);
						SimpleJSONUtil
								.add(sb, 5, "\"start\"", (int) ln.startPc);
						SimpleJSONUtil.add(sb, 5, "\"line\"",
								(int) ln.lineNumber, false);
						SimpleJSONUtil.add(sb, 4, "}", j < maxj - 1);
					}
					SimpleJSONUtil.add(sb, 3, "]", true);
				}

				int[] code = method.getCode();
				if (code != null) {

					SimpleJSONUtil.add(sb, 3, "\"maxStack\"",
							(int) method.getMaxStack(), true);
					SimpleJSONUtil.add(sb, 3, "\"maxLocals\"",
							(int) method.getMaxLocals(), true);

					SimpleJSONUtil.add(sb, 3, "\"code\"", "[", false);
					SimpleJSONUtil.addIndent(sb, 4);
					for (int j = 0, maxj = code.length; j < maxj; j++) {
						sb.append(code[j]);
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
					{
						SimpleJSONUtil.add(sb, 3, "\"opsCheck\"", "{", false);
						boolean[] check = method.getCheckOps();
						boolean checked = false;
						for (int j = 0, maxj = check.length; j < maxj; j++) {
							if (check[j]) {
								SimpleJSONUtil.add(sb, 4,
										"\"" + String.valueOf(j) + "\"", true,
										true);
								checked = true;
							}
						}
						if (checked) {
							sb.setLength(sb.length() - 2);
							sb.append('\n');
						}
						SimpleJSONUtil.add(sb, 3, "}", true);
					}
					{
						SimpleJSONUtil.add(sb, 3, "\"frames\"", "{", false);
						boolean[] hints = method.getHintFrame();
						boolean hinted = false;
						for (int j = 0, maxj = hints.length; j < maxj; j++) {
							if (hints[j]) {
								hinted = true;
								SimpleJSONUtil.addIndent(sb, 4);
								sb.append('"');
								sb.append(j);
								sb.append('"');
								sb.append(" : [");
								Frame<BasicValue> frame = method.getRawFrames()[j];
								for (int k = 0, maxk = frame.getLocals(); k < maxk; k++) {
									BasicValue v = frame.getLocal(k);
									sb.append(v.isReference() ? '1' : '0');
									sb.append(',');
								}
								for (int k = 0, maxk = frame.getStackSize(); k < maxk; k++) {
									BasicValue v = frame.getStack(k);
									sb.append(v.isReference() ? '1' : '0');
									sb.append(',');
								}
								if (frame.getLocals() + frame.getStackSize() > 0) {
									sb.setLength(sb.length() - 1);
								}
								sb.append("],\n");
							}
						}
						if (hinted) {
							sb.setLength(sb.length() - 2);
							sb.append('\n');
						}
						SimpleJSONUtil.add(sb, 3, "}", true);
					}
				}

				ArrayList<TableSwitchTarget> tableSwitchTargets = method
						.getTableSwitchTargets();
				if (tableSwitchTargets.size() > 0) {
					SimpleJSONUtil.add(sb, 3, "\"tableSwitchTargets\"", "[",
							false);
					for (int j = 0, maxj = tableSwitchTargets.size(); j < maxj; j++) {
						TableSwitchTarget target = tableSwitchTargets.get(j);
						SimpleJSONUtil.add(sb, 4, "{", false);
						SimpleJSONUtil.add(sb, 5, "\"dflt\"",
								target.getDefaultTarget(), true);
						SimpleJSONUtil.add(sb, 5, "\"min\"", target.getMin(),
								true);
						SimpleJSONUtil.add(sb, 5, "\"max\"", target.getMax(),
								true);
						SimpleJSONUtil.add(sb, 5, "\"targets\"",
								Arrays.toString(target.getTargets()), false);
						SimpleJSONUtil.add(sb, 4, "}", j < maxj - 1);
					}
					SimpleJSONUtil.add(sb, 3, "]", true);
				}

				ArrayList<LookupSwitchTarget> lookupSwitchTargets = method
						.getLookupSwitchTargets();
				if (lookupSwitchTargets.size() > 0) {
					SimpleJSONUtil.add(sb, 3, "\"lookupSwitchTargets\"", "[",
							false);
					for (int j = 0, maxj = lookupSwitchTargets.size(); j < maxj; j++) {
						LookupSwitchTarget target = lookupSwitchTargets.get(j);
						SimpleJSONUtil.add(sb, 4, "{", false);
						SimpleJSONUtil.add(sb, 5, "\"dflt\"",
								target.getDefaultTarget(), true);
						SimpleJSONUtil.add(sb, 5, "\"targets\"", "{", false);

						for (int k = 0, maxk = target.getKeys().length; k < maxk; k++) {
							SimpleJSONUtil.add(sb, 6,
									"\"" + String.valueOf(target.getKeys()[k])
											+ "\"", target.getTargets()[k],
									k < maxk - 1);
						}

						SimpleJSONUtil.add(sb, 5, "}", false);
						SimpleJSONUtil.add(sb, 4, "}", j < maxj - 1);
					}
					SimpleJSONUtil.add(sb, 3, "]", true);
				}

				SimpleJSONUtil.add(sb, 3, "\"paramStackUsage\"",
						method.getParamCount());
				SimpleJSONUtil.add(sb, 3, "\"paramType\"", stringPool
						.poolString(new String(method.getParamType(),
								"ISO8859-1")));
				SimpleJSONUtil.add(sb, 3, "\"returnType\"", stringPool
						.poolString(String.valueOf((char) method
								.getReturnType())));

				SimpleJSONUtil.add(sb, 3, "\"parameterCount\"",
						method.getParameterCount());

				// Parameter class names
				SimpleJSONUtil
						.add(sb, 3, "\"parameterClassNames\"", "[", false);
				{
					String[] pcns = method.getParameterTypeClassNames();
					for (int j = 0, maxj = pcns.length; j < maxj; j++) {
						String pcn = pcns[j];
						SimpleJSONUtil.add(sb, 4,
								String.valueOf(stringPool.poolString(pcn)),
								j < maxj - 1);
					}
				}
				SimpleJSONUtil.add(sb, 3, "]", true);
				SimpleJSONUtil.add(sb, 3, "\"returnClassName\"",
						stringPool.poolString(method.getReturnTypeClassName()),
						false);

				SimpleJSONUtil.add(sb, 2, "}", i < max - 1);
			}
			SimpleJSONUtil.add(sb, 1, "]", true);
		}
		SimpleJSONUtil.add(sb, 1, "\"sizeRel\"", (int) clazz.getSizeInHeap(),
				true);
		SimpleJSONUtil.add(sb, 1, "\"staticSize\"",
				(int) clazz.getSizeInStatic(), true);
		SimpleJSONUtil.add(sb, 1, "\"phase\"", 0, true);
		SimpleJSONUtil.add(sb, 1, "\"converted\"", "true", false);
		sb.append("}\n");
	}

	public String singleConvert(InputStream is) throws IOException {
		StringBuilder sb = new StringBuilder();
		convert(is, sb);
		return sb.toString();
	}

	public void multiBegin() {
		if (sb != null) {
			throw new IllegalStateException(
					"You should only run mulitBegin once!");
		}
		sb = new StringBuilder(16384);
		SimpleJSONUtil.add(sb, 0, "{", false);
		SimpleJSONUtil.add(sb, 0, "\"classes\"", "[", false);
	}

	public void multiPush(InputStream is) throws IOException {
		convert(is, sb);
		sb.append(",");
	}

	public String multiFinish() {
		if (sb.charAt(sb.length() - 1) == ',') {
			sb.setLength(sb.length() - 1);
		}
		SimpleJSONUtil.add(sb, 0, "]", true);

		SimpleJSONUtil.add(sb, 0, "\"constants\"", "[", false);
		{
			Iterator<JSONExportableConstantData> i = constantTable.keySet()
					.iterator();
			while (i.hasNext()) {
				JSONExportableConstantData constant = i.next();
				if (constant == null) {
					SimpleJSONUtil.add(sb, 1, "null", i.hasNext());
				} else {
					constant.appendJSON(stringPool, sb, 1, i.hasNext());
				}
			}
		}
		SimpleJSONUtil.add(sb, 0, "]", true);

		SimpleJSONUtil.add(sb, 0, "\"strings\"", "[", false);
		{
			Iterator<String> i = stringTable.keySet().iterator();
			while (i.hasNext()) {
				String str = i.next();
				if (str == null) {
					SimpleJSONUtil.add(sb, 1, "null", i.hasNext());
				} else {
					SimpleJSONUtil.add(sb, 1, SimpleJSONUtil.escapeString(str),
							i.hasNext());
				}
			}
		}
		SimpleJSONUtil.add(sb, 0, "]", false);

		SimpleJSONUtil.add(sb, 0, "}", false);
		String ret = sb.toString();
		sb = null;
		return ret;
	}

	public static void convertJar(InputStream is, Writer os) throws IOException {
		convertJar(null, is, null, os);
	}

	public static void convertJar(String prefix, InputStream is,
			String postfix, Writer os) throws IOException {
		ClassConverter converter = new ClassConverter();
		converter.multiBegin();
		final ZipInputStream jar = new ZipInputStream(is);
		try {
			ZipEntry entry;
			while ((entry = jar.getNextEntry()) != null) {
				if (entry.getName().endsWith(".class")) {
					converter.multiPush(jar);
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
		String out = converter.multiFinish();
		if (prefix != null) {
			os.write(prefix);
		}
		os.write(out);
		if (postfix != null) {
			os.write(postfix);
		}
		os.flush();
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
		ClassConverter
				.convertDirectory(// "(function(context){context.addClassDef(",
						new File(
								"../fiscevm/fiscevm-runtime/target/classes"),
						// ");})(fisceContext);",
						new OutputStreamWriter(new FileOutputStream(
								"src/test/resources/rt.json"), "ISO8859-1"));

		System.out.println("done");
	}
}
