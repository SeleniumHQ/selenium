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

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import org.openqa.grid.common.RegistrationRequest;
import org.openqa.grid.internal.BaseRemoteProxy;
import org.openqa.grid.internal.Registry;
import org.openqa.grid.internal.RemoteProxy;
import org.openqa.grid.internal.utils.configuration.GridNodeConfiguration;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.JsonToBeanConverter;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.logging.Logger;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * entry point for the registration API the grid provides. The {@link RegistrationRequest} sent to
 * http://hub:port/grid/register will be used to create a RemoteProxy and add it to the grid.
 */
public class RegistrationServlet extends RegistryBasedServlet {
  private static final long serialVersionUID = -8670670577712086527L;
  private static final Logger log = Logger.getLogger(RegistrationServlet.class.getName());

  public RegistrationServlet() {
    this(null);
  }

  public RegistrationServlet(Registry registry) {
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
    BufferedReader rd = new BufferedReader(new InputStreamReader(request.getInputStream()));
    StringBuilder requestJsonString = new StringBuilder();
    String line;
    while ((line = rd.readLine()) != null) {
      requestJsonString.append(line);
    }
    rd.close();
    log.fine("getting the following registration request  : " + requestJsonString.toString());

    // getting the settings from registration
    RegistrationRequest registrationRequest =
      RegistrationRequest.fromJson(requestJsonString.toString());

    considerV2Json(registrationRequest.getConfiguration(), requestJsonString.toString());

    final RemoteProxy proxy = BaseRemoteProxy.getNewInstance(registrationRequest, getRegistry());

    reply(response, "ok");

    new Thread(new Runnable() {  // Thread safety reviewed
      public void run() {
        getRegistry().add(proxy);
        log.fine("proxy added " + proxy.getRemoteHost());
      }
    }).start();
  }

  /**
   * @deprecated because V3 does not have separate "capabilities": { } object and "id": "value"
   * in the serialized json representation of the RegistrationRequest. That said V2 nodes do need
   * to be able to register with a V3 hub.
   */
  @Deprecated
  private void considerV2Json(GridNodeConfiguration configuration, String requestJson) {
    JsonObject json = new JsonParser().parse(requestJson).getAsJsonObject();

    // Backwards compatible with Selenium 2.x remotes which might send a
    // registration request with the json field "id". 3.x remotes will include the "id" with the
    // "configuration" object. The presence of { "id": "value" } will only override
    // { "configuration": { "id": "value" } } when "configuration.id" is null or empty.
    if (json.has("id")
        && (configuration.id == null || configuration.id.isEmpty())) {
      configuration.id = json.get("id").getAsString();
    }

    // Backwards compatible with Selenium 2.x remotes which send a registration request with the
    // json object "capabilities". 3.x remotes will include the "capabilities" object with the
    // "configuration" object. The presence of { "capabilities": [ {...}, {...} ] } will override
    // { "configuration": { "capabilities": [ {...}, {...} ] } } when "configuration.capabilities" is
    // null or empty.
    if (json.has("capabilities")
        && (configuration.capabilities == null || configuration.capabilities.isEmpty())) {
      JsonArray capabilities = json.get("capabilities").getAsJsonArray();
      for (int i = 0; i < capabilities.size(); i++) {
        DesiredCapabilities cap = new JsonToBeanConverter()
          .convert(DesiredCapabilities.class, capabilities.get(i));
        configuration.capabilities.add(cap);
      }
    }
  }

  protected void reply(HttpServletResponse response, String content) throws IOException {
    response.setContentType("text/html");
    response.setCharacterEncoding("UTF-8");
    response.setStatus(200);
    response.getWriter().print(content);
  }
}
