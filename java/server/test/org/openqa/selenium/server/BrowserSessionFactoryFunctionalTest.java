package org.openqa.selenium.server;


import junit.framework.TestCase;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.server.browserlaunchers.BrowserLauncherFactory;
import org.openqa.selenium.server.browserlaunchers.BrowserOptions;

public class BrowserSessionFactoryFunctionalTest extends TestCase {

    public void testBrowserIsAutomaticallyCloseWhenTimingOutOnBrowserLaunch() throws RemoteCommandException {
        final BrowserSessionFactory factory;
        final RemoteControlConfiguration configuration;
        final Capabilities options = BrowserOptions.newBrowserOptions();
        
        factory = new BrowserSessionFactory(new BrowserLauncherFactory());
        configuration = new RemoteControlConfiguration();
        configuration.setTimeoutInSeconds(1);
        try {
          factory.createNewRemoteSession("*chrome", "http://amazon.com", "", options, false, configuration);
          fail("Did not catch a RemoteCommandException when timing out on browser launch.");
        } catch (RemoteCommandException e) {
            /* As expected */
        }
    }

}