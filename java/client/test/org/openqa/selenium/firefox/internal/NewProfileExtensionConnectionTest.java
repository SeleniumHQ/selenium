package org.openqa.selenium.firefox.internal;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.fail;

import org.junit.After;
import org.junit.Test;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.firefox.FirefoxBinary;
import org.openqa.selenium.firefox.FirefoxProfile;
import org.openqa.selenium.internal.SocketLock;
import org.openqa.selenium.testing.NeedsLocalEnvironment;

public class NewProfileExtensionConnectionTest {

  private NewProfileExtensionConnection connection;

  @Test
  @NeedsLocalEnvironment
  public void canBeConstructed() throws Exception {
    connection = new NewProfileExtensionConnection
        (makeLock(), new FirefoxBinary(), new FirefoxProfile(), "my-host");
  }

  @Test
  @NeedsLocalEnvironment
  public void shouldDefaultToPortSpecifiedInProfileWhenDeterminingNextFreePort() throws Exception {
    int expectedPort = 2400;

    FirefoxProfile profile = new FirefoxProfile();
    profile.setPreference(FirefoxProfile.PORT_PREFERENCE, expectedPort);

    connection = new NewProfileExtensionConnection
        (makeLock(), new FirefoxBinary(), profile, "my-host");

    try {

      connection.start();

      fail("there was an unexpected server listening on " + expectedPort + "; expected connection to fail");
    } catch (WebDriverException e) {
      int PORT_PREFERENCE_NOT_PROPAGATED = -1;
      assertEquals(expectedPort,
                   profile.getIntegerPreference(FirefoxProfile.PORT_PREFERENCE, PORT_PREFERENCE_NOT_PROPAGATED));
    }

  }

  @After
  public void destroyConnection() {
    if (connection != null) {
      connection.quit();
    }
  }

  private SocketLock makeLock() {
    return new SocketLock(4200);
  }
}
