package com.thoughtworks.selenium;

import junit.extensions.TestSetup;
import junit.framework.Test;
import junit.framework.TestSuite;

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
        TestSuite supersuite = new TestSuite(ClientDriverPISuite.class.getName());
        TestSuite suite = new TestSuite(ClientDriverPISuite.class.getName());
        suite.addTest(ClientDriverSuite.suite());

        InitSystemPropertiesForPImodeTesting setup = new InitSystemPropertiesForPImodeTesting(suite);
        supersuite.addTest(setup);
        return supersuite;
    }


    /** A TestSetup decorator that runs a super setUp and tearDown at the
     * beginning and end of the entire run: in this case, we use it to
     * set and clear the PI mode property, and rename the suite.
     *
     *
     *  @author nelsons
     *
     */
    static class InitSystemPropertiesForPImodeTesting extends TestSetup {
        private static final String SELENIUM_PROXY_INJECTION_MODE = "selenium.proxyInjectionMode";
        private static final String SELENIUM_FORCED_BROWSER_MODE = "selenium.forcedBrowserMode";
        String oldProxyInjectionModeSetting;
        String oldForcedBrowserModeSetting;

        public InitSystemPropertiesForPImodeTesting(Test test) {
            super(test);
        }

        public void setUp() throws Exception {

            oldProxyInjectionModeSetting = System.getProperty(SELENIUM_PROXY_INJECTION_MODE);
            System.setProperty(SELENIUM_PROXY_INJECTION_MODE, "true");

            oldForcedBrowserModeSetting = System.getProperty(SELENIUM_FORCED_BROWSER_MODE);
            if (oldForcedBrowserModeSetting==null) {
                if (WindowsUtils.thisIsWindows()) {
                    System.setProperty(SELENIUM_FORCED_BROWSER_MODE, "*piiexplore");
                } else {
                    System.setProperty(SELENIUM_FORCED_BROWSER_MODE, "*pifirefox");
                }
            }
        }

        public void tearDown() throws Exception {
            revertProperty(SELENIUM_PROXY_INJECTION_MODE, oldProxyInjectionModeSetting);
            revertProperty(SELENIUM_FORCED_BROWSER_MODE, oldForcedBrowserModeSetting);
        }

        private void revertProperty(String key, String oldValue) {
            if (oldValue==null) {
                System.clearProperty(key);
            }
            else {
                System.setProperty(key, oldValue);
            }
        }
    }
}
