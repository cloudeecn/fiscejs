package com.cirnoworks.fisce.js;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.FileNameMap;
import java.net.URLConnection;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.activation.FileTypeMap;
import javax.activation.MimetypesFileTypeMap;
import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public abstract class ClassLoaderResourceFilter implements Filter {

	private static final Logger log = LoggerFactory
			.getLogger(ClassLoaderResourceFilter.class);
	private final FileTypeMap mimeTypes2 = MimetypesFileTypeMap
			.getDefaultFileTypeMap();
	private final FileNameMap mimeTypes = URLConnection.getFileNameMap();

	private Pattern uriPattern;

	protected abstract String getUriPattern(ServletContext context);

	@Override
	public void init(FilterConfig filterConfig) throws ServletException {

		ServletContext context = filterConfig.getServletContext();
		uriPattern = Pattern.compile(getUriPattern(context));
	}

	@Override
	public void doFilter(ServletRequest request, ServletResponse response,
			FilterChain chain) throws IOException, ServletException {
		HttpServletRequest req = (HttpServletRequest) request;
		HttpServletResponse resp = (HttpServletResponse) response;
		String uri = req.getRequestURI();
		Matcher matcher = uriPattern.matcher(uri);
		if (matcher.matches()) {
			String dir, fileName;
			dir = matcher.group(1);
			fileName = matcher.group(2);
			InputStream is = ClassLoaderResourceFilter.class
					.getResourceAsStream(dir + fileName);
			if (is == null) {
				chain.doFilter(request, response);
			} else {
				try {
					String mime = mimeTypes.getContentTypeFor(fileName);
					if (mime == null) {
						mime = mimeTypes2.getContentType(fileName);
					}
					resp.setContentType(mime);
					byte[] buf = new byte[65536];
					int read = 0;
					OutputStream os = resp.getOutputStream();
					try {
						while ((read = is.read(buf)) >= 0) {
							os.write(buf, 0, read);
						}
					} finally {
						os.close();
					}
				} finally {
					try {
						is.close();
					} catch (Exception e) {
						log.warn("Error closing resource /" + dir + "/"
								+ fileName, e);
					}
				}
			}
		} else {
			chain.doFilter(request, response);
		}
	}

	@Override
	public void destroy() {

	}

}
