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

import com.google.common.io.ByteStreams;

import java.io.IOException;
import java.io.InputStream;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Serves the static resources used by the console for instance. Uses URL
 * java.lang.ClassLoader.findResource(String name) to find the resources, allowing to add icons etc
 * in the jars of the plugins.
 */
public class ResourceServlet extends HttpServlet {

  private static final long serialVersionUID = 7253742807937667039L;

  @Override
  protected void doGet(HttpServletRequest request, HttpServletResponse response)
      throws ServletException, IOException {
    process(request, response);
  }

  protected void process(HttpServletRequest request, HttpServletResponse response)
      throws IOException {
    String resource = request.getPathInfo().replace(request.getServletPath(), "");
    if (resource.startsWith("/"))
      resource = resource.replaceFirst("/", "");
    InputStream in = Thread.currentThread().getContextClassLoader().getResourceAsStream(resource);
    if (in == null) {
      throw new Error("Cannot find resource " + resource);
    }

    try {
      ByteStreams.copy(in, response.getOutputStream());
    } finally {
      in.close();
      response.flushBuffer();
    }

  }

}
