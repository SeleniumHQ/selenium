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

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class SleepingServlet extends HttpServlet {

  private static final String RESPONSE_STRING_FORMAT =
      "<html><head><title>Done</title></head><body>Slept for %ss</body></html>";

  @Override
  protected void doGet(HttpServletRequest request, HttpServletResponse response)
      throws IOException {
    String duration = request.getParameter("time");
    long timeout = Long.valueOf(duration) * 1000;

    reallySleep(timeout);


    response.setContentType("text/html");
	//Dont Cache Anything  at the browser
    response.setHeader("Cache-Control","no-cache");
    response.setHeader("Pragma","no-cache");
    response.setDateHeader ("Expires", 0);

    response.getOutputStream().println(
        String.format(RESPONSE_STRING_FORMAT, duration));
  }

  private void reallySleep(long timeout) {
      long start = System.currentTimeMillis();
      try {
          Thread.sleep(timeout);
          while ( (System.currentTimeMillis() - start) < timeout) {
              Thread.sleep( 20);
          }
      } catch (InterruptedException ignore) {
      }
  }
}
