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

import java.io.IOException;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class CookieServlet extends HttpServlet {

  private static final String RESPONSE_STRING =
      "<html><head><title>Done</title></head><body>%s : %s</body></html>";

  @Override
  protected void doGet(HttpServletRequest request, HttpServletResponse response)
      throws IOException {
    response.setContentType("text/html");
    //Dont Cache Anything  at the browser
    response.setHeader("Cache-Control","no-cache");
    response.setHeader("Pragma","no-cache");
    response.setDateHeader ("Expires", 0);

    String action = request.getParameter("action");
    if ("add".equals(action)) {
      String name = request.getParameter("name");
      String value = request.getParameter("value");
      String domain = request.getParameter("domain");
      String path = request.getParameter("path");
      String expiry = request.getParameter("expiry");
      String secure = request.getParameter("secure");
      String httpOnly = request.getParameter("httpOnly");
      Cookie newCookie = new Cookie(name, value);
      if (domain != null) {
        newCookie.setDomain(domain);
      }
      if (path != null) {
        newCookie.setPath(path);
      }
      if (expiry != null) {
        newCookie.setMaxAge(Integer.parseInt(expiry));
      }
      if (secure != null) {
        newCookie.setSecure(Boolean.parseBoolean(secure));
      }
      if (httpOnly != null) {
        newCookie.setHttpOnly(Boolean.parseBoolean(httpOnly));
      }
      response.addCookie(newCookie);

      response.getOutputStream().println(
          String.format(RESPONSE_STRING, "Cookie added", name));

    } else if ("delete".equals(action)) {
      String name = request.getParameter("name");
      for (Cookie cookie : request.getCookies()) {
        if (! cookie.getName().equals(name)) {
          cookie.setValue("");
          cookie.setPath("/");
          cookie.setMaxAge(0);
          response.addCookie(cookie);
        }
      }
      response.getOutputStream().println(
          String.format(RESPONSE_STRING, "Cookie deleted", name));

    } else if ("deleteAll".equals(action)) {
      if (request.getCookies() != null) {
        for (Cookie cookie : request.getCookies()) {
          cookie.setValue("");
          cookie.setPath("/");
          cookie.setMaxAge(0);
          response.addCookie(cookie);
        }
      }
      response.getOutputStream().println(
          String.format(RESPONSE_STRING, "All cookies deleted", ""));

    } else {
      response.getOutputStream().println(
          String.format(RESPONSE_STRING, "Unrecognized action", action));
    }
  }
}
