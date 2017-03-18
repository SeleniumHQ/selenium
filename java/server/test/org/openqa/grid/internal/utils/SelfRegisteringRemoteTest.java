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

package org.openqa.grid.internal.utils;

import static org.junit.Assert.assertEquals;

import org.junit.Test;
import org.openqa.grid.common.RegistrationRequest;
import org.openqa.grid.internal.utils.configuration.GridNodeConfiguration;
import org.openqa.grid.internal.utils.configuration.StandaloneConfiguration;
import org.openqa.grid.shared.GridNodeServer;
import org.openqa.grid.web.servlet.DisplayHelpServlet;
import org.openqa.grid.web.servlet.ResourceServlet;

import java.net.MalformedURLException;
import java.util.ArrayList;
import java.util.Map;

import javax.servlet.Servlet;

public class SelfRegisteringRemoteTest {

  private final class DummyGridNodeServer implements GridNodeServer {
    public Map<String, Class<? extends Servlet>> extraServlets;

    @Override
    public void boot() throws Exception { }

    @Override
    public void stop() { }

    @Override
    public int getRealPort() {
      return 1234;
    }

    @Override
    public void setConfiguration(StandaloneConfiguration configuration) { }

    @Override
    public void setExtraServlets(Map<String, Class<? extends Servlet>> extraServlets) {
      this.extraServlets = extraServlets;
    }
  }


  @Test
  public void testHubRegistrationWhenPortExplicitlyZeroedOut() throws MalformedURLException {
    GridNodeServer server = new DummyGridNodeServer();
    RegistrationRequest request = new RegistrationRequest();
    request.getConfiguration().port = 0;
    request.getConfiguration().hub = "http://locahost:4444";
    SelfRegisteringRemote remote = new SelfRegisteringRemote(request);
    remote.setRemoteServer(server);
    remote.updateConfigWithRealPort();
    String remoteHost = remote.getConfiguration().getRemoteHost();
    assertEquals("Ensure that the remote host is updated properly",
                 "http://" + request.getConfiguration().host + ":" + server.getRealPort(), remoteHost);

  }

  @Test
  public void testSetExtraServlets() throws Exception {
    GridNodeServer server = new DummyGridNodeServer();

    GridNodeConfiguration configuration = new GridNodeConfiguration();
    configuration.servlets = new ArrayList<>();
    configuration.servlets.add("org.openqa.grid.web.servlet.DisplayHelpServlet");

    RegistrationRequest registrationRequest = RegistrationRequest.build(configuration);
    SelfRegisteringRemote remote = new SelfRegisteringRemote(registrationRequest);

    // there should be three servlets on the remote's map -- The resource servlet, the
    // help servlet, and the one we added above.
    assertEquals(3, remote.getNodeServlets().size());
    assertEquals(ResourceServlet.class, remote.getNodeServlets().get("/resources/*"));
    assertEquals(DisplayHelpServlet.class,
                 remote.getNodeServlets().get("/extra/DisplayHelpServlet/*"));

    // set the sever and make sure it gets the extra servlets
    remote.setRemoteServer(server);
    remote.startRemoteServer(); // does not actually start anything.

    // verify the expected extra servlets also made it to the server instance
    assertEquals(3, ((DummyGridNodeServer) server).extraServlets.size());
    assertEquals(ResourceServlet.class,
                 ((DummyGridNodeServer) server).extraServlets.get("/resources/*"));
    assertEquals(DisplayHelpServlet.class,
                 ((DummyGridNodeServer) server).extraServlets.get("/extra/DisplayHelpServlet/*"));
  }
}
