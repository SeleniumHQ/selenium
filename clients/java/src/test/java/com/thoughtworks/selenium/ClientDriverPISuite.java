package com.thoughtworks.selenium;

import java.util.HashMap;

import junit.extensions.*;
import junit.framework.*;

import org.openqa.selenium.server.browserlaunchers.*;

/**
 * This class executes the same tests that ClientDriverSuite does, but it does
 * so with proxy injection mode turned on and with the default browser string
 * set so as to use IE. (ClientDriverSuite normally uses Firefox.)
 * 
 * @author nelsons
 * 
 */

public class ClientDriverPISuite extends ClientDriverSuite {
    public static Test suite() {
        TestSuite supersuite = new TestSuite(ClientDriverPISuite.class.getName());
        TestSuite suite = ClientDriverSuite.generateSuite(true, determineForcedBrowserMode());
        suite.setName(ClientDriverPISuite.class.getName());

        InitSystemPropertiesForPImodeTesting setup = new InitSystemPropertiesForPImodeTesting(suite);
        supersuite.addTest(setup);
        return supersuite;
    }

    private static String determineForcedBrowserMode() {
        String forcedBrowserMode = System.getProperty("selenium.forcedBrowserMode");
        if (forcedBrowserMode == null) {
            if (WindowsUtils.thisIsWindows()) {
                forcedBrowserMode = "*piiexplore";
            } else {
                forcedBrowserMode = "*pifirefox";
            }
        }
        return forcedBrowserMode;
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
        private HashMap<String, String> savedValuesOfSystemProperties = new HashMap<String, String>();

        public InitSystemPropertiesForPImodeTesting(Test test) {
            super(test);
        }

        public void setUp() throws Exception {
            overrideProperty("selenium.proxyInjectionMode", "true");
            overrideProperty("selenium.forcedBrowserMode", determineForcedBrowserMode());
            overrideProperty("selenium.debugMode", "true");
            overrideProperty("selenium.log", "log.txt");
            
            // make jetty logging especially verbose
            overrideProperty("DEBUG", "true");
            overrideProperty("DEBUG_VERBOSE", "1");
        }

        private void overrideProperty(String propertyName, String propertyValue) {
            savedValuesOfSystemProperties.put(propertyName, System.getProperty(propertyName));
            System.setProperty(propertyName, propertyValue);
        }

        public void tearDown() throws Exception {
            restoreOldSystemPropertySettings();
        }

        private void restoreOldSystemPropertySettings() {
            for (String propertyName : savedValuesOfSystemProperties.keySet()) {                
                String oldValue = savedValuesOfSystemProperties.get(propertyName);
                if (oldValue==null) {
                    System.clearProperty(propertyName);
                }
                else {
                    System.setProperty(propertyName, oldValue);
                }
            }
        }
    }
}
