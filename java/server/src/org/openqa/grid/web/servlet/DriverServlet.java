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

package org.openqa.grid.web.servlet;

import com.google.common.io.ByteStreams;

import org.openqa.grid.internal.ExternalSessionKey;
import org.openqa.selenium.remote.ErrorCodes;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.openqa.grid.internal.Registry;
import org.openqa.grid.web.servlet.handler.RequestHandler;
import org.openqa.grid.web.servlet.handler.SeleniumBasedRequest;
import org.openqa.grid.web.servlet.handler.WebDriverRequest;

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
        // http://code.google.com/p/selenium/wiki/JsonWireProtocol#Error_Handling
        response.reset();
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.setStatus(500);

        JSONObject resp = new JSONObject();
        try {
          final ExternalSessionKey serverSession = req.getServerSession();
          resp.put("sessionId", serverSession != null ? serverSession.getKey() : null);
          resp.put("status", ErrorCodes.UNHANDLED_ERROR);
          JSONObject value = new JSONObject();
          value.put("message", e.getMessage());
          value.put("class", e.getClass().getCanonicalName());

          JSONArray stacktrace = new JSONArray();
          for (StackTraceElement ste : e.getStackTrace()) {
            JSONObject st = new JSONObject();
            st.put("fileName", ste.getFileName());
            st.put("className", ste.getClassName());
            st.put("methodName", ste.getMethodName());
            st.put("lineNumber", ste.getLineNumber());
            stacktrace.put(st);
          }
          value.put("stackTrace", stacktrace);
          resp.put("value", value);

        } catch (JSONException e1) {
          e1.printStackTrace();
        }
        String json = resp.toString();

        byte[] bytes = json.getBytes("UTF-8");
        InputStream in = new ByteArrayInputStream(bytes);
        try {
            response.setHeader("Content-Length", Integer.toString(bytes.length));
            ByteStreams.copy(in, response.getOutputStream());
        } finally {
          in.close();
          response.flushBuffer();
        }
      } else {
        throw (new IOException(e));
      }
    }

  }

}
