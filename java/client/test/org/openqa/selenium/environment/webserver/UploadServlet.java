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

import org.eclipse.jetty.server.Request;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

import javax.servlet.MultipartConfigElement;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.Part;

/**
 * A simple file upload servlet that just sends back the file contents to the client.
 *
 * @author jmleyba@gmail.com (Jason Leyba)
 */
public class UploadServlet extends HttpServlet {

  private static final MultipartConfigElement MULTI_PART_CONFIG = new MultipartConfigElement(System.getProperty("java.io.tmpdir"));

  @Override
  protected void doPost(HttpServletRequest request,
      HttpServletResponse response)
      throws ServletException, IOException {
    response.setContentType("text/html");
    response.setStatus(HttpServletResponse.SC_OK);

    request.setAttribute(Request.MULTIPART_CONFIG_ELEMENT, MULTI_PART_CONFIG);

    StringBuilder content = new StringBuilder();
    for (Part part : request.getParts()) {
      if (part.getName().equalsIgnoreCase("upload")) {
        byte[] buffer = new byte[(int) part.getSize()];
        try (InputStream in = part.getInputStream()) {
          in.read(buffer, 0, (int) part.getSize());
          content.append(new String(buffer, StandardCharsets.UTF_8));
        }
      }
    }

    // Slow down the upload so we can verify WebDriver waits.
    try {
      Thread.sleep(2500);
    } catch (InterruptedException ignored) {
    }
    response.getWriter().write(content.toString());
    response.getWriter().write(
        "<script>window.top.window.onUploadDone();</script>");
    response.setStatus(HttpServletResponse.SC_OK);
  }
}
