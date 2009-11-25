package org.openqa.selenium.server.browserlaunchers;

import junit.framework.TestCase;
import org.apache.commons.logging.Log;
import org.openqa.jetty.log.LogFactory;

/**
 * {@link org.openqa.selenium.server.browserlaunchers.Firefox2Launcher} integration test class.
 */
public class LauncherFunctionalTestCase extends TestCase {

    private static final Log LOGGER = LogFactory.getLog(SafariLauncherIntegrationTest.class);
    private static final int SECONDS = 1000;
    private static final int WAIT_TIME = 15 * SECONDS;

    protected void launchBrowser(AbstractBrowserLauncher launcher) {
        launcher.launch("http://www.google.com");
        int seconds = 15;
        LOGGER.info("Killing browser in " + Integer.toString(seconds) + " seconds");
        AsyncExecute.sleepTight(WAIT_TIME);
        launcher.close();
        LOGGER.info("He's dead now, right?");
    }

}