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

import org.openqa.selenium.json.Json;

import java.io.FileWriter;
import java.io.IOException;
import java.io.Writer;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.stream.Collectors;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Simple API to create pages on server.
 * Request format (JSON):
 * {"content" : "... code of the page..."}
 * Response body contains the address of the created page.
 */
public class CreatePageServlet extends HttpServlet {

  @Override
  protected void doPost(HttpServletRequest request,
      HttpServletResponse response)
      throws IOException {
    String content = request.getReader().lines().collect(Collectors.joining());
    Map<String, String> json = new Json().toType(content, Json.MAP_TYPE);

    Path tempPageDir = Paths.get(getServletContext().getInitParameter("tempPageDir"));
    Path target = Files.createTempFile(tempPageDir, "page", ".html");
    try (Writer out = new FileWriter(target.toFile())) {
      out.write(json.get("content"));
    }

    response.setContentType("text/plain");
    response.getWriter().write(String.format(
        "http://%s:%s%s/%s",
        getServletContext().getInitParameter("hostname"),
        getServletContext().getInitParameter("port"),
        getServletContext().getInitParameter("path"),
        target.getFileName()));
    response.setStatus(HttpServletResponse.SC_OK);
  }
}
