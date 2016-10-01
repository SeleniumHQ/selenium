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

import org.openqa.selenium.internal.BuildInfo;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class DisplayHelpServlet extends HttpServlet {
  private static final long serialVersionUID = 8484071790930378855L;
  private static String coreVersion;

  public DisplayHelpServlet() {
    coreVersion = new BuildInfo().getReleaseLabel();
  }

  @Override
  protected void doGet(HttpServletRequest request, HttpServletResponse response)
      throws ServletException, IOException {
    process(response);
  }

  @Override
  protected void doPost(HttpServletRequest request, HttpServletResponse response)
      throws ServletException, IOException {
    process(response);
  }

  protected void process(HttpServletResponse response)
      throws IOException {
    response.setContentType("text/html");
    response.setCharacterEncoding("UTF-8");
    response.setStatus(200);

    StringBuilder builder = new StringBuilder();

    builder.append("<html>");
    builder.append("<head>");
    builder.append("<title>Selenium Grid ").append(coreVersion).append(" help</title>");
    builder.append("</head>");

    builder.append("<body>");
    builder.append("You are using grid ").append(coreVersion);
    builder.append("<br>Find help on the official selenium wiki : "
                   + "<a href='https://github.com/SeleniumHQ/selenium/wiki/Grid2'>more help here</a>");
    builder.append("<br>default monitoring page : <a href='/grid/console'>console</a>");
    builder.append("</body>");

    builder.append("</html>");

    InputStream in = new ByteArrayInputStream(builder.toString().getBytes("UTF-8"));
    try {
      ByteStreams.copy(in, response.getOutputStream());
    } finally {
      in.close();
      response.flushBuffer();
    }
  }
}
