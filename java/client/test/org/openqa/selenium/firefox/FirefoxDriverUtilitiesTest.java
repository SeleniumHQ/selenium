package org.openqa.selenium.firefox;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import org.junit.Test;
import org.openqa.selenium.internal.Lock;
import org.openqa.selenium.internal.SocketLock;

/**
 * FirefoxDriverUtilitiesTest is responsible for tests of FirefoxDriver
 * utilities that do not require a browser.
 */
public class FirefoxDriverUtilitiesTest {

  @Test
  public void shouldObtainSocketLockForDefaultPortWhenNotSpecifiedInProfile(){
    Lock lock = FirefoxDriver.obtainLock(new FirefoxProfile());

    assertTrue("expected lock to be a SocketLock", lock instanceof SocketLock);

    assertEquals(SocketLock.DEFAULT_PORT, ((SocketLock) lock).getLockPort());
  }

  @Test
  public void shouldObtainSocketLockForPortSpecifiedInProfile(){
    FirefoxProfile mockProfile = mock(FirefoxProfile.class);
    int preferredPort = 2400;
    when(mockProfile.getIntegerPreference(FirefoxProfile.PORT_PREFERENCE, SocketLock.DEFAULT_PORT)).thenReturn(
        preferredPort);

    Lock lock = FirefoxDriver.obtainLock(mockProfile);

    assertTrue("expected lock to be a SocketLock", lock instanceof SocketLock);

    assertEquals(preferredPort, ((SocketLock) lock).getLockPort());
  }

}
