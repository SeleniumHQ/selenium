/*
Copyright 2011 Selenium committers
Copyright 2011 Software Freedom Conservancy

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
 */

package org.openqa.grid.web.servlet;

import java.io.IOException;
import java.lang.reflect.Constructor;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.openqa.grid.web.servlet.FilesHandler.BaseFilesHandler;
import org.openqa.grid.web.servlet.FilesHandler.GetFileHandler;
import org.openqa.grid.web.servlet.FilesHandler.GetSlidersHandler;
import org.openqa.grid.web.servlet.FilesHandler.PostSliderHandler;

/**
 * Serves the static resources used by the console for instance. Uses URL
 * java.lang.ClassLoader.findResource(String name) to find the resources,
 * allowing to add icons etc in the jars of the plugins.
 */
public class FilesServlet extends HttpServlet {

	public static final String PARAM_FILE = "file";

	public static final String PARAM_SLIDERS = "sliders";

	private static final long serialVersionUID = 2962454313454024566L;

	private HashMap<String, Class<? extends BaseFilesHandler>> postActionMapper = new HashMap<String, Class<? extends BaseFilesHandler>>();
	private HashMap<String, Class<? extends BaseFilesHandler>> getActionMapper = new HashMap<String, Class<? extends BaseFilesHandler>>();

	@Override
	public void init() throws ServletException {
		super.init();
		
		postActionMapper.put(PARAM_SLIDERS, PostSliderHandler.class);
		getActionMapper.put(PARAM_SLIDERS, GetSlidersHandler.class);
		getActionMapper.put(PARAM_FILE, GetFileHandler.class);

	}

	@Override
	protected void doGet(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {
		process(request, response, getActionMapper);

	}

	@Override
	protected void doPost(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {
		process(request, response, postActionMapper);
	}
    @SuppressWarnings("unchecked")
	private void process(HttpServletRequest request,
			HttpServletResponse response,
			HashMap<String, Class<? extends BaseFilesHandler>> handlerMapper) {

    Map<String, String> params = request.getParameterMap();

		Iterator iter = params.entrySet().iterator();
		while (iter.hasNext()) {
			Map.Entry entry = (Map.Entry) iter.next();
			String action = (String) entry.getKey();
			String filePathName = ((String[]) entry.getValue())[0];
			// return first matched handler
			Class<? extends BaseFilesHandler> handlerClass = handlerMapper
					.get(action);
			Constructor<?> co;
			try {
				co = handlerClass.getConstructor();

				BaseFilesHandler handler = (BaseFilesHandler) co
						.newInstance();
				handler.handle(request, response, filePathName, this);
			} catch (Exception e) {
				e.printStackTrace();
				response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
			}
			break;
		}
	}
}
