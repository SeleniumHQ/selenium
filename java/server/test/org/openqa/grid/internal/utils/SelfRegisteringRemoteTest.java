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
    config.getConfiguration().put(RegistrationRequest.HUB_HOST, "localhost");
    config.getConfiguration().put(RegistrationRequest.HUB_PORT, 4444);
    config.getConfiguration().put(RegistrationRequest.PORT, 0);
    config.getConfiguration().put(RegistrationRequest.REMOTE_HOST, "http://localhost:0/");
    SelfRegisteringRemote remote = new SelfRegisteringRemote(config);
    remote.setRemoteServer(server);
    remote.updateConfigWithRealPort();
    String host = (String) remote.getConfiguration().get(RegistrationRequest.REMOTE_HOST);
    assertEquals("Ensure that the remote host is updated properly",
                 "http://localhost:" + server.getRealPort(), host);

  }

}
