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

package org.openqa.grid.web.servlet.api.v1;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class ApiV1 extends RestApiEndpoint {

  @Override
  protected void doGet(HttpServletRequest req, HttpServletResponse resp)
    throws ServletException, IOException {

    resp.setContentType("text/html");
    resp.setCharacterEncoding("UTF-8");
    resp.setStatus(200);

    try {
      resp.getWriter().write(buildHtmlResponse());
    } finally {
      resp.getWriter().close();
    }
  }

  @Override
  public Object getResponse(String query) {
    return null;
  }

  private String buildHtmlResponse() {
    StringBuilder html = new StringBuilder();
    html.append("<html><body>");
    html.append("GET endpoints: <br/>");
    html.append("<ul>");

    for (APIEndpointRegistry.EndPoint e : APIEndpointRegistry.getEndpoints()) {
      html.append(String.format("<li><a href='%s'>%s</a> <ul> ",e.getPermalink(),e.getPermalink()));
      html.append(String.format("<li>Description: %s</li>",e.getDescription()));
      html.append(String.format("<li>Class: %s</li>",e.getClassName()));
      html.append(String.format("<li>Usage: %s</li>",e.getUsage()));
      html.append("</ul></li>");
    }

    html.append("</ul>");
    html.append("</body></html>");
    return html.toString();
  }
}
