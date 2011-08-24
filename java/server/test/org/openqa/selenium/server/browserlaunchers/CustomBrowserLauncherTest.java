package org.openqa.selenium.server.browserlaunchers;

import static org.junit.Assert.assertFalse;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.server.RemoteControlConfiguration;

import org.junit.Test;

public class CustomBrowserLauncherTest {

  @Test
  public void constructor_setsBrowserOptions() {
    Capabilities browserOptions = BrowserOptions.newBrowserOptions();
    RemoteControlConfiguration configuration = new RemoteControlConfiguration();
    CustomBrowserLauncher launcher =
        new CustomBrowserLauncher("command", "sessionId", configuration, browserOptions);

    Capabilities caps = launcher.browserConfigurationOptions;
    assertFalse(BrowserOptions.isSingleWindow(caps));
  }
}
