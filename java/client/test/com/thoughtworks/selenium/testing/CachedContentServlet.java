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

package com.thoughtworks.selenium.testing;

import java.io.IOException;
import java.util.Calendar;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * This servlet prints out the current time, but instructs the browser to cache the result.
 */
public class CachedContentServlet extends HttpServlet {

  @Override
  protected void doGet(HttpServletRequest req, HttpServletResponse resp)
      throws IOException {
    setAlwaysCacheHeaders(resp);

    resp.setHeader("Content-Type", "text/html");
    resp.getWriter().write("<html><body>" + System.currentTimeMillis() + "</body></html>");
  }

  /**
   * Sets all the don't-cache headers on the HttpResponse
   */
  private void setAlwaysCacheHeaders(HttpServletResponse resp) {
    resp.setHeader("Cache-Control", "max-age=29723626");
    Calendar calendar = Calendar.getInstance();
    calendar.add(Calendar.YEAR, 1);
    resp.setDateHeader("Expires", calendar.getTimeInMillis());
    resp.setDateHeader("Last-Modified", 0);
    resp.setHeader("Pragma", "");
    resp.setHeader("ETag", "foo");
  }

}
