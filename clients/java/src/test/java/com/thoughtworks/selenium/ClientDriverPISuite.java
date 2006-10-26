package com.thoughtworks.selenium;

import junit.framework.Test;
import org.openqa.selenium.server.browserlaunchers.WindowsUtils;

/**
 * This class executes the same tests that ClientDriverSuite does, but it does so with proxy injection mode
 * turned on and with the default browser string set so as to use IE.  (ClientDriverSuite normally uses Firefox.)
 * 
 * @author nelsons
 *
 */

public class ClientDriverPISuite extends ClientDriverSuite {
    public static Test suite() {
        String oldProxyInjectionModeSetting = System.getProperty("selenium.proxyInjectionMode");
        try {
            System.setProperty("selenium.proxyInjectionMode", "true");

            String forcedBrowserMode = System.getProperty("selenium.forcedBrowserMode");
            if (forcedBrowserMode==null) {
                if (WindowsUtils.thisIsWindows()) {
                    System.setProperty("selenium.forcedBrowserMode", "*piiexplore");
                } else {
                    System.setProperty("selenium.forcedBrowserMode", "*pifirefox");
                }
            }
            return ClientDriverSuite.suite();
        }
        finally {
            if (oldProxyInjectionModeSetting!=null) {
                oldProxyInjectionModeSetting = "false";
            }
            System.setProperty("selenium.proxyInjectionMode", oldProxyInjectionModeSetting);
        }
    }
}
