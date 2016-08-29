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
import org.openqa.grid.common.GridRole;
import org.openqa.grid.common.RegistrationRequest;
import org.openqa.grid.shared.GridNodeServer;

import java.net.MalformedURLException;

public class SelfRegisteringRemoteTest {

  @Test
  public void testHubRegistrationWhenPortExplicitlyZeroedOut() throws MalformedURLException {
    GridNodeServer server = new GridNodeServer() {
      @Override
      public void boot() throws Exception {}

      @Override
      public void stop() {}

      @Override
      public int getRealPort() {
        return 1234;
      }
    };
    RegistrationRequest config = new RegistrationRequest();
    config.setRole(GridRole.NODE);
    config.getConfiguration().port = 0;
    config.getConfiguration().hub = "http://locahost:4444";
    SelfRegisteringRemote remote = new SelfRegisteringRemote(config);
    remote.setRemoteServer(server);
    remote.updateConfigWithRealPort();
    String host = (String) remote.getConfiguration().getRemoteHost();
    assertEquals("Ensure that the remote host is updated properly",
                 "http://localhost:" + server.getRealPort(), host);

  }

}
