package org.openqa.selenium.remotecontrol;

import com.thoughtworks.selenium.DefaultSelenium;
import org.junit.Test;

/**
 * Regression test suite for stability problems discovered in Selenium Remote Control
 *
 * You need to have a Remote-Control server running on 4444 in a separate process before running this test
 *
 */
public class StabilityTest {

    @Test
    public void retrievelastRemoteControlLogsDoesNotTriggerOutOfMemoryErrors() {
        final DefaultSelenium seleniumDriver;

        seleniumDriver = new DefaultSelenium("localhost", 4444, "*chrome", "http://localhost:4444");
        for (int i = 1; i < 100000; i++) {
            seleniumDriver.retrieveLastRemoteControlLogs();
        }
    }
    
}
