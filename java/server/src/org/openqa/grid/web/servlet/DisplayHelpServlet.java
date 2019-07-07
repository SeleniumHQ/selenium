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

import org.openqa.grid.common.GridRole;
import org.openqa.grid.web.servlet.console.ConsoleServlet;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.remote.http.HttpHandler;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

import static org.openqa.selenium.grid.server.JeeInterop.execute;

/**
 * Displays a somewhat useful help signpost page. Expects {@link #HELPER_TYPE_PARAMETER} to be
 * set as a servlet context init parameter with a value of "hub", "node", or "standalone"
 */
public class DisplayHelpServlet extends HttpServlet {

  private static final long serialVersionUID = 8484071790930378855L;
  public static final String HELPER_TYPE_PARAMETER = "webdriver.server.displayhelpservlet.type";

  private HttpHandler handler;

  @Override
  public void init() throws ServletException {
    super.init();

    handler = new DisplayHelpHandler(
        new Json(),
        getHelperType(),
        getInitParameter(ConsoleServlet.CONSOLE_PATH_PARAMETER, ""));
  }

  @Override
  protected void doGet(HttpServletRequest request, HttpServletResponse response)
      throws IOException {
    process(request, response);
  }

  @Override
  protected void doPost(HttpServletRequest request, HttpServletResponse response) {
    process(request, response);
  }

  protected void process(HttpServletRequest request, HttpServletResponse response) {
    execute(handler, request, response);
  }

  private GridRole getHelperType() {
    GridRole role = GridRole.get(getInitParameter(HELPER_TYPE_PARAMETER, "standalone"));
    if (role == null) {
      role = GridRole.NOT_GRID;
    }
    return role;
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
}
