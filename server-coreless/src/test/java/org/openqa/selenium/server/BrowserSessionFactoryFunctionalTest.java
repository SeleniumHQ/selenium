package org.openqa.selenium.server;

import junit.framework.TestCase;
import org.openqa.selenium.server.browserlaunchers.BrowserLauncherFactory;

public class BrowserSessionFactoryFunctionalTest extends TestCase {

    public void testBrowserIsAutomaticallyCloseWhenTimingOutOnBrowserLaunch() throws RemoteCommandException {
        final BrowserSessionFactory factory;
        final RemoteControlConfiguration configuration;

        factory = new BrowserSessionFactory(new BrowserLauncherFactory());
        configuration = new RemoteControlConfiguration();
        SeleniumServer.timeoutInSeconds = 1;
        try {
          factory.createNewRemoteSession("*chrome", "http://amazon.com", false, configuration);
          fail("Did not catch a RemoteCommandException when timing out on browser launch.");
        } catch (RemoteCommandException e) {
            /* As expected */
        }
    }

}