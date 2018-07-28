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

import org.openqa.grid.common.RegistrationRequest;
import org.openqa.grid.internal.DefaultGridRegistry;
import org.openqa.grid.internal.GridRegistry;
import org.openqa.grid.internal.utils.configuration.GridHubConfiguration;
import org.openqa.grid.internal.utils.configuration.GridNodeConfiguration;
import org.openqa.grid.web.Hub;
import org.seleniumhq.jetty9.server.handler.ContextHandler;

import javax.servlet.ServletContext;
import javax.servlet.http.HttpServlet;

public class RegistrationAwareServletTest extends BaseServletTest {

  protected final GridRegistry registry = DefaultGridRegistry
      .newInstance(new Hub(new GridHubConfiguration()));

  /**
   * Gives the servlet some time to add the proxy -- which happens on a separate thread.
   */
  protected void waitForServletToAddProxy() throws Exception {
    int tries = 0;
    int size = 0;
    while (tries < 10) {
      size = ((RegistryBasedServlet) servlet).getRegistry().getAllProxies().size();
      if (size > 0) {
        break;
      }
      Thread.sleep(1000);
      tries += 1;
    }
  }

  protected void wireInNode() throws Exception {
    wireInNode(null);
  }

  protected void wireInNode(String proxy) throws Exception {
    final GridNodeConfiguration config = new GridNodeConfiguration();
    config.id = "http://dummynode:3456";
    final RegistrationRequest request = RegistrationRequest.build(config);
    request.getConfiguration().proxy = proxy;
    HttpServlet servlet = new RegistrationServlet() {
      @Override
      public ServletContext getServletContext() {
        final ContextHandler.Context servletContext = new ContextHandler().getServletContext();
        servletContext.setAttribute(GridRegistry.KEY, registry);
        return servletContext;
      }
    };
    servlet.init();
    sendCommand(servlet, "POST", "/", request.toJson());
    waitForServletToAddProxy();
  }

}
