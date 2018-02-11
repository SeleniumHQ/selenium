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

package org.openqa.selenium.environment.webserver;

import com.google.common.io.ByteStreams;

import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.Charset;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class Utf8Servlet extends HttpServlet {
  @Override
  protected void doGet(HttpServletRequest request, HttpServletResponse response)
      throws ServletException, IOException {

    String fileName = this.getServletContext().getRealPath(request.getPathInfo());
    String fileContent = "";

    try (InputStream is = new FileInputStream(fileName)) {
      // Note: Must read the content as UTF8.
      fileContent = new String(ByteStreams.toByteArray(is), Charset.forName("UTF-8"));
    } catch (IOException e) {
      throw new ServletException("Failed to file: " + fileName + " based on request path: " +
          request.getPathInfo() + ", servlet path: " + request.getServletPath() +
          " and context path: " + request.getContextPath());
    }

    response.setContentType("text/html; charset=UTF-8");
    response.setStatus(HttpServletResponse.SC_OK);
    response.getWriter().println(fileContent);
    response.flushBuffer();
    response.getWriter().close();
  }
}
