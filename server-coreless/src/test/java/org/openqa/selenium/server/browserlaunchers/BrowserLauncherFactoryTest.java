package org.openqa.selenium.server.browserlaunchers;

import junit.framework.TestCase;
import org.openqa.selenium.server.RemoteControlConfiguration;

/**
 * {@link org.openqa.selenium.server.browserlaunchers.BrowserLauncherFactory} unit test class
 */
public class BrowserLauncherFactoryTest extends TestCase {

    public void testAllSupportedBrowsersDefineAppropriateConstructor() {
        for (String browser : BrowserLauncherFactory.getSupportedLaunchers().keySet()) {
            try {
                new BrowserLauncherFactory().getBrowserLauncher("*" + browser, "a session id", new RemoteControlConfiguration());
            } catch (RuntimeException e) {
                if (e.getCause() instanceof NoSuchMethodException) {
                    fail(browser + " browser does not define appropriate constructor: " + e.getMessage());
                }
                if (-1 != e.getMessage().indexOf("couldn't be found in the path")) {
                    System.out.println("Ignoring problem with getting launcher for '" + browser
                            + "', as browser might not be installed on this machine");
                } else if (-1 != e.getMessage().indexOf("SystemRoot apparently not set")) {
                    System.out.println("Ignoring problem with getting launcher for '" + browser
                            + "', as browser might not be installed on this machine");
                } else {
                    throw e;
                }
            }
        }
    }

}

