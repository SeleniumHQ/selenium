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
package org.openqa.grid.web.servlet.api.v1;

import org.openqa.grid.internal.Registry;
import org.openqa.grid.web.servlet.RegistryBasedServlet;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class ApiV1 extends RegistryBasedServlet {

  public ApiV1() {
    this(null);
  }

  public ApiV1(Registry registry) {
    super(registry);
  }

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

  protected String buildHtmlResponse() {
    StringBuilder html = new StringBuilder();
    html.append("<html><body>");
    html.append("GET endpoints: <br/>");
    html.append("<ul>");

    for (APIEndpointRegistry.EndPoint e : APIEndpointRegistry.getEndpoints()) {
      html.append("<li><a href='" + e.getPermalink() + "'>" + e.getPermalink() + "</a> <ul> ");

      html.append("<li>Description: " + e.getDescription() + "</li>");
      html.append("<li>Class: " + e.getClassName() + "</li>");
      html.append("<li>Usage: " + e.getUsage() + "</li>");

      html.append("</ul></li>");
    }

    html.append("</ul>");
    html.append("</body></html>");
    return html.toString();

  }
}
