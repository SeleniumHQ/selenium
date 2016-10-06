// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

package org.openqa.grid.web.servlet;

import com.google.common.io.ByteStreams;
import com.google.gson.GsonBuilder;

import org.openqa.grid.common.GridRole;
import org.openqa.grid.web.servlet.beta.ConsoleServlet;
import org.openqa.selenium.internal.BuildInfo;
import org.openqa.selenium.io.IOUtils;

import java.io.IOException;
import java.io.InputStream;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Displays a somewhat useful help signpost page. Expects {@link #HELPER_TYPE_PARAMETER} to be
 * set as a servlet context init parameter with a value of "hub", "node", or "standalone"
 */
public class DisplayHelpServlet extends HttpServlet {
  private static final long serialVersionUID = 8484071790930378855L;
  public static final String HELPER_TYPE_PARAMETER = "webdriver.server.displayhelpservlet.type";

  private static final String HELPER_SERVLET_TEMPLATE = "displayhelpservlet.html";
  private static final String HELPER_SERVLET_ASSET_PATH_PREFIX = "/assets/";
  private static final String HELPER_SERVLET_RESOURCE_PATH = "org/openqa/grid/images/";
  private static final String HELPER_SERVLET_TEMPLATE_CONFIG_JSON_VAR = "${servletConfigJson}";

  private final class DisplayHelpServletConfig {
    String version;
    String type;
    String consoleLink;
  }

  private final DisplayHelpServletConfig servletConfig = new DisplayHelpServletConfig();

  @Override
  protected void doGet(HttpServletRequest request, HttpServletResponse response)
      throws ServletException, IOException {
    process(request, response);
  }

  @Override
  protected void doPost(HttpServletRequest request, HttpServletResponse response)
      throws ServletException, IOException {
    process(request, response);
  }

  protected void process(HttpServletRequest request, HttpServletResponse response)
      throws IOException {

    initServletConfig();

    String resource = request.getPathInfo();
    InputStream in;
    if (resource.contains(HELPER_SERVLET_ASSET_PATH_PREFIX) &&
        !resource.replace(HELPER_SERVLET_ASSET_PATH_PREFIX, "").contains("/") &&
        !resource.replace(HELPER_SERVLET_ASSET_PATH_PREFIX, "").equals("")) {
      // request is for an asset of the help page
      resource = resource.replace(HELPER_SERVLET_ASSET_PATH_PREFIX, "");
      in = getResourceInputStream(resource);
      if (in == null) {
        response.sendError(HttpServletResponse.SC_NOT_FOUND);
      } else {
        response.setStatus(200);
        ByteStreams.copy(in, response.getOutputStream());
      }
    } else {
      // request is for an unknown entity. show the help page
      in = getResourceInputStream(HELPER_SERVLET_TEMPLATE);
      if (in == null) {
        response.sendError(HttpServletResponse.SC_NOT_FOUND);
      } else {
        final String json = new GsonBuilder().serializeNulls().create().toJson(servletConfig);
        final String jsonUtf8 = new String(json.getBytes(), "UTF-8");
        final String htmlTemplate = IOUtils.readFully(in);
        final String updatedTemplate =
          htmlTemplate.replace(HELPER_SERVLET_TEMPLATE_CONFIG_JSON_VAR, jsonUtf8);

        response.setContentType("text/html");
        response.setCharacterEncoding("UTF-8");
        response.setStatus(200);
        response.getOutputStream().print(updatedTemplate);
      }
    }

    response.flushBuffer();
  }

  private void initServletConfig() {
    if (servletConfig.version == null) {
      servletConfig.version = new BuildInfo().getReleaseLabel();
    }
    if (servletConfig.type == null) {
      servletConfig.type = getHelperType();
    }
    if (servletConfig.consoleLink == null) {
      // a hub may not have a console attached, in which case it will not set this parameter
      // so we default to "".
      servletConfig.consoleLink = getInitParameter(ConsoleServlet.CONSOLE_PATH_PARAMETER, "");
    }
  }

  private String getHelperType() {
    GridRole role = GridRole.get(getInitParameter(HELPER_TYPE_PARAMETER, "standalone"));
    String type = "Standalone";
    switch (role) {
      case HUB: {
        type = "Grid Hub";
        break;
      }
      case NODE: {
        type = "Grid Node";
        break;
      }
      default: {
        break;
      }
    }
    return type;
  }

  @Override
  public String getInitParameter(String param) {
    return getServletContext().getInitParameter(param);
  }

  private String getInitParameter(String param, String defaultValue) {
    final String value = getInitParameter(param);
    if (value == null || value.trim().isEmpty()) {
      return defaultValue;
    }
    return value;
  }

  private InputStream getResourceInputStream(String resource)
    throws IOException {
    InputStream in = Thread.currentThread().getContextClassLoader()
      .getResourceAsStream(HELPER_SERVLET_RESOURCE_PATH + resource);
    if (in == null) {
      return null;
    }
    return in;
  }
}
