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
