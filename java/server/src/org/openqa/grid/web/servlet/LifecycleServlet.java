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

import static org.openqa.selenium.remote.http.HttpMethod.GET;

import com.google.common.collect.ImmutableMap;

import org.openqa.grid.internal.GridRegistry;
import org.openqa.grid.internal.RemoteProxy;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpRequest;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import java.util.function.Consumer;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * API to manage grid lifecycle
 */
public class LifecycleServlet extends RegistryBasedServlet {

  private final Json json = new Json();
  private Consumer<Integer> shutdown = System::exit;

  public LifecycleServlet() {
    this(null);
  }

  public LifecycleServlet(GridRegistry registry) {
    super(registry);
  }

  void setShutdown(Consumer<Integer> shutdown) {
    this.shutdown = shutdown;
  }

  @Override
  protected void doGet(HttpServletRequest request, HttpServletResponse response)
      throws IOException {
    process(request, response);
  }

  protected void process(HttpServletRequest request, HttpServletResponse response)
      throws IOException {
    response.setContentType("application/json");
    response.setCharacterEncoding("UTF-8");
    response.setStatus(200);
    String action = request.getParameter("action");
    if ("shutdown".equalsIgnoreCase(action)) {
      shutdownHub(response);
    } else if ("quiescenode".equalsIgnoreCase(action)) {
      quiesceNode(request, response);
    } else {
      response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
      Map<?, ?> result = ImmutableMap.of("success", false,
                                         "msg", "Unknown lifecycle action: " + action);
      write(response, result);
    }
    response.getWriter().close();
  }

  private void shutdownHub(HttpServletResponse response) {
    Runnable initiateShutDown = () -> {
      try {
        Thread.sleep(500);
      } catch (InterruptedException e) {
        response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        Map<?, ?> result = ImmutableMap.of("success", false, "msg", e.getMessage());
        write(response, result);
      }
      shutdown.accept(0);
    };
    Thread isd = new Thread(initiateShutDown);
    isd.setName("initiateShutDown");
    isd.start();
    Map<?, ?> result = ImmutableMap.of("success", true);
    write(response, result);
  }

  private void quiesceNode(HttpServletRequest req, HttpServletResponse rsp) {
    String proxyId = req.getParameter("proxyid");
    String suffix = "Please specify the proxy id via [?proxyid=<>]";
    if (proxyId == null || proxyId.trim().isEmpty()) {
      rsp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
      String msg = "Proxy id cannot be null or empty. " + suffix;
      Map<?,?> result = ImmutableMap.of("success", false, "msg", msg);
      write(rsp, result);
      return;
    }
    RemoteProxy proxy = getRegistry().getAllProxies().getProxyById(proxyId);
    if (proxy == null) {
      rsp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
      String msg = "Could not locate any proxy with id as [" + proxyId + "]. " + suffix;
      Map<?,?> result = ImmutableMap.of("success", false, "msg", msg);
      write(rsp, result);
      return;
    }
    proxy.quiesceNode();
    String shutdownNode = req.getParameter("autoshutdown");
    if (Boolean.parseBoolean(shutdownNode)) {
      autoShutdownNode(proxy, rsp);
    }
  }

  protected void autoShutdownNode(RemoteProxy proxy, HttpServletResponse rsp) {
    Runnable initiateShutDown = () -> {
      try {
        while (proxy.isBusy()) {
          TimeUnit.SECONDS.sleep(5);
        }
        String url = proxy.getRemoteHost().toExternalForm() + "/lifecycle-manager?action=shutdown";
        HttpRequest r = new HttpRequest(GET, url);
        HttpClient client = getRegistry().getHttpClient(proxy.getRemoteHost());
        client.execute(r);
      } catch (InterruptedException | IOException e) {
        rsp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        Map<?,?> result = ImmutableMap.of("success", false, "msg", e.getMessage());
        write(rsp, result);
      }
    };
    if (rsp.getStatus() != HttpServletResponse.SC_INTERNAL_SERVER_ERROR) {
      Thread isd = new Thread(initiateShutDown);
      isd.setName("initiateShutDown");
      isd.start();
    }
  }

  private void write(HttpServletResponse rsp, Map<?,?> data) {
    try {
      json.newOutput(rsp.getWriter()).write(data);
    } catch (IOException e) {
      //gobble exception.
    }
  }
}
