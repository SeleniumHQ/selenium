package org.openqa.selenium.server.browserlaunchers;

import junit.framework.TestCase;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.server.RemoteControlConfiguration;

/**
 * {@link org.openqa.selenium.server.browserlaunchers.AbstractBrowserLauncher} unit test class.
 */
public class AbstractBrowserLauncherUnitTest extends TestCase {

    public void testGetConfigurationReturnsConfigurationProvidedInConstructor() {
        final RemoteControlConfiguration theConfiguration;
        final Capabilities browserOptions;

        theConfiguration = new RemoteControlConfiguration();
        browserOptions = BrowserOptions.newBrowserOptions();
        AbstractBrowserLauncher launcher = new AbstractBrowserLauncher(null, theConfiguration, browserOptions) {
            protected void launch(String url) {
                throw new UnsupportedOperationException("Should never be called");
            }

            public void close() {
                throw new UnsupportedOperationException("Should never be called");
            }

            public Process getProcess() {
                throw new UnsupportedOperationException("Should never be called");
            }
        };
        assertEquals(theConfiguration, launcher.getConfiguration());
    }
}
