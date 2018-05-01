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

import static org.openqa.selenium.json.Json.MAP_TYPE;

import com.google.common.collect.ImmutableMap;

import org.openqa.grid.common.exception.GridException;
import org.openqa.grid.internal.ExternalSessionKey;
import org.openqa.grid.internal.GridRegistry;
import org.openqa.grid.internal.RemoteProxy;
import org.openqa.grid.internal.TestSession;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.json.JsonException;
import org.openqa.selenium.json.JsonInput;
import org.openqa.selenium.json.JsonOutput;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.io.Writer;
import java.util.HashMap;
import java.util.Map;
import java.util.TreeMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class TestSessionStatusServlet extends RegistryBasedServlet {

  private final Json json = new Json();

  public TestSessionStatusServlet() {
    super(null);
  }

  public TestSessionStatusServlet(GridRegistry registry) {
    super(registry);
  }

  @Override
  protected void doGet(HttpServletRequest request, HttpServletResponse response)
      throws IOException {
    Map<String, Object> json = ImmutableMap.of(
        "session", request.getParameter("session"));
    process(response, json);
  }

  @Override
  protected void doPost(HttpServletRequest request, HttpServletResponse response)
      throws IOException {
    Map<String, Object> requestJSON = new HashMap<>();
    if (request.getInputStream() != null) {
      try (Reader rd = new BufferedReader(new InputStreamReader(request.getInputStream()));
           JsonInput jin = json.newInput(rd)) {
        requestJSON = jin.read(MAP_TYPE);
      }
    }
    process(response, requestJSON);
  }

  protected void process(HttpServletResponse response, Map<String, Object> requestJson)
      throws IOException {
    response.setContentType("application/json");
    response.setCharacterEncoding("UTF-8");
    response.setStatus(200);
    try (Writer writer = response.getWriter();
         JsonOutput out = json.newOutput(writer)) {
      out.write(getResponse(requestJson));
    } catch (JsonException e) {
      throw new GridException(e.getMessage());
    }
  }

  private Map<String, Object> getResponse(Map<String, Object> requestJson) {
    Map<String, Object> res = new TreeMap<>();
    res.put("success", false);

    // the id can be specified via a param, or in the json request.
    String session;
    if (!requestJson.containsKey("session")) {
      res.put(
          "msg",
          "you need to specify at least a session or internalKey when call the test slot status service.");
      return res;
    }
      session = String.valueOf(requestJson.get("session"));

    TestSession testSession = getRegistry().getSession(ExternalSessionKey.fromString(session));

    if (testSession == null) {
      res.put("msg", "Cannot find test slot running session " + session + " in the registry.");
      return res;
    }
    res.put("msg", "slot found !");
    res.remove("success");
    res.put("success", true);
    res.put("session", testSession.getExternalKey().getKey());
    res.put("internalKey", testSession.getInternalKey());
    res.put("inactivityTime", testSession.getInactivityTime());
    RemoteProxy p = testSession.getSlot().getProxy();
    res.put("proxyId", p.getId());
    return res;
  }
}
