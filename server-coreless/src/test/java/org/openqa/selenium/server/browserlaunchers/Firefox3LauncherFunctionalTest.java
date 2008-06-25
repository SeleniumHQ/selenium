package org.openqa.selenium.server.browserlaunchers;

import org.openqa.selenium.server.RemoteControlConfiguration;
import org.apache.commons.logging.Log;
import org.mortbay.log.LogFactory;
import junit.framework.TestCase;

/**
 * {@link org.openqa.selenium.server.browserlaunchers.Firefox3Launcher} integration test class.
 */
public class Firefox3LauncherFunctionalTest extends TestCase {

    private static final Log LOGGER = LogFactory.getLog(SafariLauncherIntegrationTest.class);
    private static final int SECONDS = 1000;
    private static final int WAIT_TIME = 15 * SECONDS;

    public void testLauncherWithDefaultConfiguration() throws Exception {
        final Firefox3Launcher launcher;

        launcher = new Firefox3Launcher(new RemoteControlConfiguration(), "CUSTFFCHROME");
        launcher.launch("http://www.google.com");
        int seconds = 15;
        LOGGER.info("Killing browser in " + Integer.toString(seconds) + " seconds");
        AsyncExecute.sleepTight(WAIT_TIME);
        launcher.close();
        LOGGER.info("He's dead now, right?");
    }

}