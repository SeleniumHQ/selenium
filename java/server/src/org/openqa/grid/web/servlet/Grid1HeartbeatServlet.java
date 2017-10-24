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

import org.openqa.grid.internal.Registry;
import org.openqa.grid.internal.RemoteProxy;

import java.io.IOException;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Provided for compatibility with Selenium Grid 1.0 clients. Responds to heartbeat requests and
 * indicates whether or not a node is registered with the hub.
 */
@Deprecated
public class Grid1HeartbeatServlet extends RegistryBasedServlet {
  private static final long serialVersionUID = 7653463271803124556L;

  public Grid1HeartbeatServlet() {
    this(null);
  }

  public Grid1HeartbeatServlet(Registry registry) {
    super(registry);
  }

  @Override
  protected void doGet(HttpServletRequest request, HttpServletResponse response)
      throws ServletException, IOException {
    response.setContentType("text/html");
    response.setCharacterEncoding("UTF-8");
    response.setStatus(200);

    // Build up the proxy URL based upon the params the Grid 1.0 node will pass as query params.
    Map<String, String[]> queryParams = request.getParameterMap();
    String nodeUrl =
        String.format("http://%s:%s", queryParams.get("host")[0], queryParams.get("port")[0]);

    // Check each registered node and see if the pinging node is in the list.
    boolean alreadyRegistered = false;
    for (RemoteProxy proxy : getRegistry().getAllProxies()) {
      if (proxy.getRemoteHost().toString().equals(nodeUrl)) {
        alreadyRegistered = true;
      }
    }

    if (alreadyRegistered) {
      response.getWriter().print("Hub : OK");
    } else {
      response.getWriter().print("Hub : Not Registered");
    }
  }
}
