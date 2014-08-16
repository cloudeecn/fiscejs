/*
 *  Licensed to the Apache Software Foundation (ASF) under one or more
 *  contributor license agreements.  See the NOTICE file distributed with
 *  this work for additional information regarding copyright ownership.
 *  The ASF licenses this file to You under the Apache License, Version 2.0
 *  (the "License"); you may not use this file except in compliance with
 *  the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
package com.cirnoworks.fisce.js;


/**
 * 
 * @author yuxuanhuang
 */
class PSuper {
	protected void prot() {

	}

	protected final void pf() {

	}
}

public class JSProfile extends PSuper implements Runnable {

	public static void main(String[] args) {
		System.out.println("Start!!");
		new JSProfile().run();
		// new Thread(new Profile()).start();
	}

	int j;
	static int s;
	String name;

	public JSProfile(String name) {
		this.name = name;
	}

	public JSProfile() {
		this("profiler");
	}

	public final void pub() {

	}

	public final void fnl() {

	}

	private void prv() {

	}

	private long noop() {
		//FiScEVM.breakpoint();
		long t = System.nanoTime();
		for (int i = 0; i < 50000; i++) {
		}
		return System.nanoTime() - t;
	}

	private long stack() {
		//FiScEVM.breakpoint();
		int k = 0;
		long t = System.nanoTime();
		for (int i = 0; i < 50000; i++) {
			k += i;
		}
		return System.nanoTime() - t;
	}
	
	private long stackFloat() {
		//FiScEVM.breakpoint();
		float k = 0;
		long t = System.nanoTime();
		for (float i = 0; i < 50000; i++) {
			k += i;
		}
		return System.nanoTime() - t;
	}
	
	private long stackDouble() {
		//FiScEVM.breakpoint();
		double k = 0;
		long t = System.nanoTime();
		for (double i = 0; i < 50000; i++) {
			k += i;
		}
		return System.nanoTime() - t;
	}
	
	private long stackLong() {
		//FiScEVM.breakpoint();
		long k = 0;
		long t = System.nanoTime();
		for (long i = 0; i < 50000; i++) {
			k += i;
		}
		return System.nanoTime() - t;
	}

	private long field() {
		//FiScEVM.breakpoint();
		int k = 0;
		long t = System.nanoTime();
		for (j = 0; j < 50000; j++) {
			k += j;
		}
		return System.nanoTime() - t;
	}

	private long staticField() {
		//FiScEVM.breakpoint();
		int k = 0;
		long t = System.nanoTime();
		for (s = 0; s < 50000; s++) {
			k += s;
		}
		return System.nanoTime() - t;
	}

	private long iRootI() {
		//FiScEVM.breakpoint();
		Intf in = new Impl();
		int k = 0;
		long t = System.nanoTime();
		for (int i = 0; i < 50000; i++) {
			k += i;
			in.rootI();
		}
		return System.nanoTime() - t;
	}

	private long iFooI() {
		//FiScEVM.breakpoint();
		Intf in = new Impl();
		int k = 0;
		long t = System.nanoTime();
		for (int i = 0; i < 50000; i++) {
			k += i;
			in.fooI();
		}
		return System.nanoTime() - t;
	}

	private long rootS() {
		//FiScEVM.breakpoint();
		Impl im = new Impl();
		int k = 0;
		long t = System.nanoTime();
		for (int i = 0; i < 50000; i++) {
			k += i;
			im.rootS();
		}
		return System.nanoTime() - t;
	}

	private long rootV() {
		//FiScEVM.breakpoint();
		Impl im = new Impl();
		int k = 0;
		long t = System.nanoTime();
		for (int i = 0; i < 50000; i++) {
			k += i;
			im.rootV();
		}
		return System.nanoTime() - t;
	}

	private long rootF() {
		//FiScEVM.breakpoint();
		Impl im = new Impl();
		int k = 0;
		long t = System.nanoTime();
		for (int i = 0; i < 50000; i++) {
			k += i;
			im.rootF();
		}
		return System.nanoTime() - t;
	}

	private long rootI() {
		//FiScEVM.breakpoint();
		Impl im = new Impl();
		int k = 0;
		long t = System.nanoTime();
		for (int i = 0; i < 50000; i++) {
			k += i;
			im.rootI();
		}
		return System.nanoTime() - t;
	}

	private long fooS() {
		//FiScEVM.breakpoint();
		Impl im = new Impl();
		int k = 0;
		long t = System.nanoTime();
		for (int i = 0; i < 50000; i++) {
			k += i;
			im.fooS();
		}
		return System.nanoTime() - t;
	}

	private long fooF() {
		//FiScEVM.breakpoint();
		Impl im = new Impl();
		int k = 0;
		long t = System.nanoTime();
		for (int i = 0; i < 50000; i++) {
			k += i;
			im.fooF();
		}
		return System.nanoTime() - t;
	}

	private long fooI() {
		//FiScEVM.breakpoint();
		Impl im = new Impl();
		int k = 0;
		long t = System.nanoTime();
		for (int i = 0; i < 50000; i++) {
			k += i;
			im.fooI();
		}
		return System.nanoTime() - t;
	}

	private long inh() {
		//FiScEVM.breakpoint();
		Impl im = new Impl();
		int k = 0;
		long t = System.nanoTime();
		for (int i = 0; i < 50000; i++) {
			k += i;
			im.inh();
		}
		return System.nanoTime() - t;
	}

	private long pubTest() {
		//FiScEVM.breakpoint();
		int k = 0;
		long t = System.nanoTime();
		for (int i = 0; i < 50000; i++) {
			k += i;
			pub();
		}
		return System.nanoTime() - t;
	}

	private long fnlTest() {
		//FiScEVM.breakpoint();
		int k = 0;
		long t = System.nanoTime();
		for (int i = 0; i < 50000; i++) {
			k += i;
			fnl();
		}
		return System.nanoTime() - t;
	}

	private long prvTest() {
		//FiScEVM.breakpoint();
		int k = 0;
		long t = System.nanoTime();
		for (int i = 0; i < 50000; i++) {
			k += i;
			prv();
		}
		return System.nanoTime() - t;
	}

	private long protTest() {
		//FiScEVM.breakpoint();
		int k = 0;
		long t = System.nanoTime();
		for (int i = 0; i < 50000; i++) {
			k += i;
			prot();
		}
		return System.nanoTime() - t;
	}

	private long pfTest() {
		//FiScEVM.breakpoint();
		int k = 0;
		long t = System.nanoTime();
		for (int i = 0; i < 50000; i++) {
			k += i;
			pf();
		}
		return System.nanoTime() - t;
	}

	private void sleep() {
		try {
			Thread.sleep(2);
		} catch (InterruptedException e) {
		}
	}

	public void run() {
		int i;
		int k = 0;

		long ttNoop = 0;
		long ttStack = 0;
		long ttStackFloat = 0;
		long ttStackDouble = 0;
		long ttStackLong = 0;
		long ttField = 0;
		long ttStatic = 0;
		long ttIRootI = 0;
		long ttIFooI = 0;
		long ttRootS = 0;
		long ttRootV = 0;
		long ttRootF = 0;
		long ttRootI = 0;
		long ttFooS = 0;
		long ttFooF = 0;
		long ttFooI = 0;
		long ttInh = 0;
		long ttPub = 0;
		long ttFnl = 0;
		long ttPrv = 0;
		long ttProt = 0;
		long ttPf = 0;

		final int max = 9;
		final int min = 4;
		
		sleep();

		for (int u = 0; u < max; u++) {
			Intf in = new Impl();
			Impl im = (Impl) in;

			if (u >= min) {
				ttNoop += noop();
			} else {
				noop();
			}

			sleep();

			if (u >= min) {
				ttStack += stack();
			} else {
				stack();
			}

			sleep();
			
			if (u >= min) {
				ttStackFloat += stackFloat();
			} else {
				stackFloat();
			}

			sleep();
			
			if (u >= min) {
				ttStackDouble += stackDouble();
			} else {
				stackDouble();
			}

			sleep();
			
			if (u >= min) {
				ttStackLong += stackLong();
			} else {
				stackLong();
			}

			sleep();

			if (u >= min) {
				ttField += field();
			} else {
				field();
			}

			sleep();

			if (u >= min) {
				ttStatic += staticField();
			} else {
				staticField();
			}

			sleep();

			if (u >= min) {
				ttIRootI += iRootI();
			} else {
				iRootI();
			}

			sleep();

			if (u >= min) {
				ttIFooI += iFooI();
			} else {
				iFooI();
			}

			sleep();

			if (u >= min) {
				ttRootS += rootS();
			} else {
				rootS();
			}

			sleep();

			if (u >= min) {
				ttRootV += rootV();
			} else {
				rootV();
			}

			sleep();

			if (u >= min) {
				ttRootF += rootF();
			} else {
				rootF();
			}

			sleep();

			if (u >= min) {
				ttRootI += rootI();
			} else {
				rootI();
			}

			sleep();

			if (u >= min) {
				ttFooS += fooS();
			} else {
				fooS();
			}

			sleep();

			if (u >= min) {
				ttFooF += fooF();
			} else {
				fooF();
			}

			sleep();

			if (u >= min) {
				ttFooI += fooI();
			} else {
				fooI();
			}

			sleep();

			if (u >= min) {
				ttInh += inh();
			} else {
				inh();
			}

			sleep();

			if (u >= min) {
				ttPub += pubTest();
			} else {
				pubTest();
			}

			sleep();

			if (u >= min) {
				ttFnl += fnlTest();
			} else {
				fnlTest();
			}

			sleep();

			if (u >= min) {
				ttPrv += prvTest();
			} else {
				prvTest();
			}

			sleep();

			if (u >= min) {
				ttProt += protTest();
			} else {
				protTest();
			}

			sleep();

			if (u >= min) {
				ttPf += pfTest();
			} else {
				pfTest();
			}

			/**
			 * <code>
			 */
			String result = "" + u;
			debugOut(result);
			sleep();
		}
		ttNoop /= max - min;
		ttStack /= max - min;
		ttStackFloat /= max - min;
		ttStackDouble /= max - min;
		ttStackLong /= max - min;
		ttField /= max - min;
		ttStatic /= max - min;
		ttIRootI /= max - min;
		ttIFooI /= max - min;
		ttRootS /= max - min;
		ttRootV /= max - min;
		ttRootF /= max - min;
		ttRootI /= max - min;
		ttFooS /= max - min;
		ttFooF /= max - min;
		ttFooI /= max - min;
		ttInh /= max - min;
		ttPub /= max - min;
		ttFnl /= max - min;
		ttPrv /= max - min;
		ttProt /= max - min;
		ttPf /= max - min;
		debugOut("" + k);
		debugOut("  ttNoop = " + ttNoop / 500000f);
		debugOut(" ttStack = " + ttStack / 500000f);
		debugOut(" ttStackFloat = " + ttStackFloat / 500000f);
		debugOut(" ttStackDouble = " + ttStackDouble / 500000f);
		debugOut(" ttStackLong = " + ttStackLong / 500000f);
		debugOut(" ttField = " + ttField / 500000f);
		debugOut("ttStatic = " + ttStatic / 500000f);

		debugOut("");

		debugOut("   ttPub = " + ttPub / 500000f);
		debugOut("   ttFnl = " + ttFnl / 500000f);
		debugOut("   ttPrv = " + ttPrv / 500000f);
		debugOut("  ttProt = " + ttProt / 500000f);
		debugOut("   ttPFn = " + ttPf / 500000f);

		debugOut("");

		debugOut("ttIRootI = " + ttIRootI / 500000f);
		debugOut(" ttIFooI = " + ttIFooI / 500000f);
		debugOut(" ttRootS = " + ttRootS / 500000f);
		debugOut(" ttRootV = " + ttRootV / 500000f);
		debugOut(" ttRootF = " + ttRootF / 500000f);
		debugOut(" ttRootI = " + ttRootI / 500000f);
		debugOut("  ttFooS = " + ttFooS / 500000f);
		debugOut("  ttFooF = " + ttFooF / 500000f);
		debugOut("  ttFooI = " + ttFooI / 500000f);
		debugOut("   ttInh = " + ttInh / 500000f);

	}

	private void debugOut(String v) {
		// FiScEVM.infoOut(v);
		System.out.println(v);
	}
}

interface Intf {
	void fooI();

	void rootI();
}

class Supr {
	static void rootS() {

	}

	public void rootV() {

	}

	public void inh() {

	}

	public final void rootF() {

	}

	public final void rootI() {

	}
}

class Impl extends Supr implements Intf {

	static void fooS() {

	}

	final void fooF() {

	}

	public void fooI() {

	}

	@Override
	public void inh() {

	}
}
