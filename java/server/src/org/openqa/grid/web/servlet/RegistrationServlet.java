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

import com.google.common.io.CharStreams;

import org.openqa.grid.common.RegistrationRequest;
import org.openqa.grid.common.exception.GridConfigurationException;
import org.openqa.grid.internal.BaseRemoteProxy;
import org.openqa.grid.internal.GridRegistry;
import org.openqa.grid.internal.RemoteProxy;
import org.openqa.selenium.json.Json;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.Map;
import java.util.logging.Logger;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * entry point for the registration API the grid provides. The {@link RegistrationRequest} sent to
 * http://hub:port/grid/register will be used to create a RemoteProxy and add it to the grid.
 */
public class RegistrationServlet extends RegistryBasedServlet {
  private static final long serialVersionUID = -8670670577712086527L;
  private static final Logger log = Logger.getLogger(RegistrationServlet.class.getName());
  private static final Json JSON = new Json();

  public RegistrationServlet() {
    this(null);
  }

  public RegistrationServlet(GridRegistry registry) {
    super(registry);
  }

  @Override
  protected void doGet(HttpServletRequest request, HttpServletResponse response)
      throws IOException {
    process(request, response);
  }

  @Override
  protected void doPost(HttpServletRequest request, HttpServletResponse response)
      throws IOException {
    process(request, response);
  }

  protected void process(HttpServletRequest request, HttpServletResponse response)
      throws IOException {
    String requestJsonString;

    try (BufferedReader rd = new BufferedReader(new InputStreamReader(request.getInputStream()))) {
      requestJsonString = CharStreams.toString(rd);
    }
    log.finest("getting the following registration request  : " + requestJsonString);

    // getting the settings from the registration
    Map<String, Object> json = JSON.toType(requestJsonString, MAP_TYPE);

    if (!(json.get("configuration") instanceof Map)) {
      // bad request. there must be a configuration for the proxy
      throw new GridConfigurationException("No configuration received for proxy.");
    }

    final RegistrationRequest registrationRequest = RegistrationRequest.fromJson(json);

    final RemoteProxy proxy = BaseRemoteProxy.getNewInstance(registrationRequest, getRegistry());

    reply(response, "ok");

    // Thread safety reviewed
    new Thread(() -> {
      getRegistry().add(proxy);
      log.finest("proxy added " + proxy.getRemoteHost());
    }).start();
  }

  protected void reply(HttpServletResponse response, String content) throws IOException {
    response.setContentType("text/html");
    response.setCharacterEncoding("UTF-8");
    response.setStatus(200);
    response.getWriter().print(content);
  }
}
