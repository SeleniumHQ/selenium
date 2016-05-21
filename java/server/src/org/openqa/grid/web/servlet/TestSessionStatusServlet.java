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

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.google.gson.JsonSyntaxException;

import org.openqa.grid.common.exception.GridException;
import org.openqa.grid.internal.ExternalSessionKey;
import org.openqa.grid.internal.Registry;
import org.openqa.grid.internal.RemoteProxy;
import org.openqa.grid.internal.TestSession;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class TestSessionStatusServlet extends RegistryBasedServlet {

  private static final long serialVersionUID = 4325112892618707612L;

  public TestSessionStatusServlet() {
    super(null);
  }

  public TestSessionStatusServlet(Registry registry) {
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

  protected void process(HttpServletRequest request, HttpServletResponse response)
      throws IOException {
    response.setContentType("application/json");
    response.setCharacterEncoding("UTF-8");
    response.setStatus(200);
    JsonObject res;
    try {
      res = getResponse(request);
      response.getWriter().print(res);
      response.getWriter().close();
    } catch (JsonSyntaxException e) {
      throw new GridException(e.getMessage());
    }
  }

  private JsonObject getResponse(HttpServletRequest request) throws IOException {
    JsonObject requestJSON = null;
    if (request.getInputStream() != null) {
      BufferedReader rd = new BufferedReader(new InputStreamReader(request.getInputStream()));
      StringBuilder s = new StringBuilder();
      String line;
      while ((line = rd.readLine()) != null) {
        s.append(line);
      }
      rd.close();
      String json = s.toString();
      if (!"".equals(json)) {
        requestJSON = new JsonParser().parse(json).getAsJsonObject();
      }

    }

    JsonObject res = new JsonObject();
    res.addProperty("success", false);

    // the id can be specified via a param, or in the json request.
    String session;
    if (requestJSON == null) {
      session = request.getParameter("session");
    } else {
      if (!requestJSON.has("session")) {
        res.addProperty("msg",
            "you need to specify at least a session or internalKey when call the test slot status service.");
        return res;
      }
      session = requestJSON.get("session").getAsString();
    }

    TestSession testSession = getRegistry().getSession(ExternalSessionKey.fromString(session));

    if (testSession == null) {
      res.addProperty("msg", "Cannot find test slot running session " + session + " in the registry.");
      return res;
    }
    res.addProperty("msg", "slot found !");
    res.remove("success");
    res.addProperty("success", true);
    res.addProperty("session", testSession.getExternalKey().getKey());
    res.addProperty("internalKey", testSession.getInternalKey());
    res.addProperty("inactivityTime", testSession.getInactivityTime());
    RemoteProxy p = testSession.getSlot().getProxy();
    res.addProperty("proxyId", p.getId());
    return res;
  }

}
