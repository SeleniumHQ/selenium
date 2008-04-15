package org.openqa.selenium.server.browserlaunchers;

import junit.framework.TestCase;
import junit.framework.Assert;
import org.openqa.selenium.server.RemoteControlConfiguration;

/**
 * {@link org.openqa.selenium.server.browserlaunchers.AbstractBrowserLauncher} unit test class.
 */
public class AbstractBrowserLauncherUnitTest extends TestCase {

    public void testGetConfigurationReturnsConfigurationProvidedInConstructor() {
        final RemoteControlConfiguration theConfiguration;

        theConfiguration = new RemoteControlConfiguration();
        AbstractBrowserLauncher launcher = new AbstractBrowserLauncher(null, theConfiguration) {
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
        Assert.assertEquals(theConfiguration, launcher.getConfiguration());
    }
}
