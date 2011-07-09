/*
Copyright 2007-2011 WebDriver committers

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

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.openqa.grid.internal.Registry;
import org.openqa.grid.web.servlet.handler.RequestHandler;
import org.openqa.grid.web.servlet.handler.WebDriverRequestHandler;
import org.openqa.selenium.remote.ErrorCodes;

import com.google.common.io.ByteStreams;

/**
 * entry point for all communication request sent by the clients to the remotes
 * managed by the grid.
 */
public class DriverServlet extends RegistryBasedServlet {

  private static final long serialVersionUID = -1693540182205547227L;

  public DriverServlet() {
    this(null);
  }

  public DriverServlet(Registry registry) {
    super(registry);
  }

  @Override
  protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
    process(request, response);
  }

  @Override
  protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
    process(request, response);
  }

  @Override
  protected void doDelete(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
    process(request, response);
  }

  protected void process(HttpServletRequest request, HttpServletResponse response) throws IOException {
    RequestHandler req = null;
    try {
      req = RequestHandler.createHandler(request, response, getRegistry());
      req.process();

    } catch (Throwable e) {
      if (req instanceof WebDriverRequestHandler) {
        // http://code.google.com/p/selenium/wiki/JsonWireProtocol#Error_Handling
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.setStatus(500);

        JSONObject resp = new JSONObject();
        try {
          resp.put("sessionId", JSONObject.NULL);
          if (req != null) {
            resp.put("sessionId", req.getServerSession());
          }
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

        InputStream in = new ByteArrayInputStream(json.getBytes("UTF-8"));
        try {
          ByteStreams.copy(in, response.getOutputStream());
        } finally {
          in.close();
          response.getOutputStream().close();
        }
      } else {
        throw (new IOException(e));
      }
    }

  }

}
