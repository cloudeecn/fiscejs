package com.cirnoworks.fisce.js;

import javax.servlet.ServletContext;

public class FiScEJSFilter extends ClassLoaderResourceFilter {

	@Override
	protected String getUriPattern(ServletContext context) {
		if ("true".equals(context.getInitParameter("production"))) {
			return "^" + context.getContextPath() + "(/fisce/)(\\w[\\w-.]*)$";
		} else {
			return "^" + context.getContextPath()
					+ "(/fisce/|/test/)(\\w[\\w-.]*)$";
		}
	}

}
