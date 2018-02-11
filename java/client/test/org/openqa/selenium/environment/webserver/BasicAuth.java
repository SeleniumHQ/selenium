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
import java.util.Base64;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class BasicAuth extends HttpServlet {
  private static final String CREDENTIALS = "test:test";
  private final Base64.Decoder decoder = Base64.getDecoder();

  @Override
  protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException,
      IOException {
    if (isAuthorized(req.getHeader("Authorization"))) {
      resp.setHeader("Content-Type", "text/html");
      resp.getWriter().write("<h1>authorized</h1>");
    } else {
      resp.setHeader("WWW-Authenticate", "Basic realm=\"basic-auth-test\"");
      resp.sendError(HttpServletResponse.SC_UNAUTHORIZED);
    }
  }

  private boolean isAuthorized(String auth) {
    if (auth != null) {
      final int index = auth.indexOf(' ') + 1;

      if (index > 0) {
        final String credentials = new String(decoder.decode(auth.substring(index)));
        return CREDENTIALS.equals(credentials);
      }
    }

    return false;
  }
}
