package org.openqa.selenium.server;


import junit.framework.TestCase;
import org.openqa.selenium.server.browserlaunchers.BrowserLauncherFactory;

public class BrowserSessionFactoryFunctionalTest extends TestCase {

    public void testBrowserIsAutomaticallyCloseWhenTimingOutOnBrowserLaunch() throws RemoteCommandException {
        final BrowserSessionFactory factory;
        final RemoteControlConfiguration configuration;
        final BrowserConfigurationOptions options = new BrowserConfigurationOptions();
        
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