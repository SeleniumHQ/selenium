package org.openqa.selenium.server.browserlaunchers;

import static com.thoughtworks.selenium.SeleneseTestNgHelper.assertEquals;

import org.junit.Test;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.server.RemoteControlConfiguration;

/**
 * {@link org.openqa.selenium.server.browserlaunchers.AbstractBrowserLauncher} unit test class.
 */
public class AbstractBrowserLauncherUnitTest {

  @Test
  public void testGetConfigurationReturnsConfigurationProvidedInConstructor() {
    final RemoteControlConfiguration theConfiguration;
    final Capabilities browserOptions;

    theConfiguration = new RemoteControlConfiguration();
    browserOptions = BrowserOptions.newBrowserOptions();
    AbstractBrowserLauncher launcher =
        new AbstractBrowserLauncher(null, theConfiguration, browserOptions) {
          @Override
          protected void launch(String url) {
            throw new UnsupportedOperationException("Should never be called");
          }

          public void close() {
            throw new UnsupportedOperationException("Should never be called");
          }
        };
    assertEquals(theConfiguration, launcher.getConfiguration());
  }
}
