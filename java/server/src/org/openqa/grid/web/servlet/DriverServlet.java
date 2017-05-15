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

package org.openqa.grid.web.servlet;

import com.google.common.base.Throwables;
import com.google.common.io.ByteStreams;
import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;

import org.openqa.grid.internal.ExternalSessionKey;
import org.openqa.grid.internal.Registry;
import org.openqa.grid.web.servlet.handler.RequestHandler;
import org.openqa.grid.web.servlet.handler.SeleniumBasedRequest;
import org.openqa.grid.web.servlet.handler.WebDriverRequest;
import org.openqa.selenium.remote.ErrorCodes;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * entry point for all communication request sent by the clients to the remotes managed by the grid.
 *
 * Runs on the socketListener threads of the servlet container
 */
public class DriverServlet extends RegistryBasedServlet {

  private static final long serialVersionUID = -1693540182205547227L;

  @SuppressWarnings("UnusedDeclaration")
  public DriverServlet() {
    this(null);
  }

  public DriverServlet(Registry registry) {
    super(registry);
  }

  @Override
  protected void doGet(HttpServletRequest request, HttpServletResponse response)
      throws ServletException, IOException {
    process(request, response);
  }

  @Override
  protected void doPost(HttpServletRequest request, HttpServletResponse response)
      throws ServletException, IOException {
    process(request, response);
  }

  @Override
  protected void doDelete(HttpServletRequest request, HttpServletResponse response)
      throws ServletException, IOException {
    process(request, response);
  }

  protected void process(HttpServletRequest request, HttpServletResponse response)
      throws IOException {
    RequestHandler req = null;
    SeleniumBasedRequest r = null;
    try {
      r = SeleniumBasedRequest.createFromRequest(request, getRegistry());
      req = new RequestHandler(r, response, getRegistry());
      req.process();

    } catch (Throwable e) {
      if (r instanceof WebDriverRequest && !response.isCommitted()) {
        // Format the exception for both the JSON wire protocol and the W3C spec compliant version.

        response.reset();
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.setStatus(500);

        JsonObject resp = new JsonObject();

        // https://github.com/SeleniumHQ/selenium/wiki/JsonWireProtocol#error-handling
        final ExternalSessionKey serverSession = req.getServerSession();
        resp.addProperty("sessionId", serverSession != null ? serverSession.getKey() : null);
        resp.addProperty("status", ErrorCodes.UNHANDLED_ERROR);
        JsonObject value = new JsonObject();
        value.addProperty("message", e.getMessage());
        value.addProperty("class", e.getClass().getCanonicalName());

        JsonArray stacktrace = new JsonArray();
        for (StackTraceElement ste : e.getStackTrace()) {
          JsonObject st = new JsonObject();
          st.addProperty("fileName", ste.getFileName());
          st.addProperty("className", ste.getClassName());
          st.addProperty("methodName", ste.getMethodName());
          st.addProperty("lineNumber", ste.getLineNumber());
          stacktrace.add(st);
        }
        value.add("stackTrace", stacktrace);

        // https://w3c.github.io/webdriver/webdriver-spec.html#dfn-send-an-error
        value.addProperty("error", "unknown error");
        // Already done above, but kept here for when we retire the original protocol
        value.addProperty("message", e.getMessage());
        // Let's hope nothing ever looks at these strings case insensitively.
        value.addProperty("stacktrace", Throwables.getStackTraceAsString(e));

        resp.add("value", value);

        String json = new Gson().toJson(resp);

        byte[] bytes = json.getBytes("UTF-8");
        try (InputStream in = new ByteArrayInputStream(bytes)) {
          response.setHeader("Content-Length", Integer.toString(bytes.length));
          ByteStreams.copy(in, response.getOutputStream());
        } finally {
          response.flushBuffer();
        }
      } else {
        throw (new IOException(e));
      }
    }

  }

}
