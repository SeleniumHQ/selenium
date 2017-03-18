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

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class ManifestServlet extends HttpServlet {
  @Override
  protected void doGet(HttpServletRequest request, HttpServletResponse response)
      throws ServletException, IOException {

    String servletPath = request.getServletPath();
    String manifestPath = this.getServletContext().getRealPath(servletPath);
    String manifestContent = "";

    try (InputStream is = new FileInputStream(manifestPath)) {
      manifestContent = new String(ByteStreams.toByteArray(is));
    } catch (IOException e) {
      throw new ServletException("Failed to read cache-manifest file: " + manifestPath);
    }

    response.setContentType("text/cache-manifest");
    response.setStatus(HttpServletResponse.SC_OK);
    response.getWriter().println(manifestContent);
    response.flushBuffer();
    response.getWriter().close();

  }
}
