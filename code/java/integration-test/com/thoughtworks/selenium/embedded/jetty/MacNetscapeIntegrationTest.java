package com.thoughtworks.selenium.embedded.jetty;

import com.thoughtworks.selenium.launchers.MacNetscapeBrowserLauncher;
import com.thoughtworks.selenium.BrowserLauncher;

/**
 * @author Paul Hammant
 * @version $Revision: 1.8 $
 */
public class MacNetscapeIntegrationTest extends RealDealIntegrationTest {
    protected BrowserLauncher getBrowserLauncher() {
        return new MacNetscapeBrowserLauncher();
    }
}
