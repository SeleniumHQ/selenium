/*
 * Created on Feb 25, 2006
 *
 */
package com.thoughtworks.selenium;

import java.io.File;
import java.util.HashMap;
import java.util.Iterator;

import junit.extensions.TestSetup;
import junit.framework.Test;
import junit.framework.TestCase;
import junit.framework.TestSuite;

import com.googlecode.webdriver.environment.GlobalTestEnvironment;
import com.googlecode.webdriver.environment.InProcessTestEnvironment;
import com.googlecode.webdriver.environment.TestEnvironment;
import com.thoughtworks.selenium.corebased.GoogleTestSearch;
import com.thoughtworks.selenium.corebased.TestAlerts;
import com.thoughtworks.selenium.corebased.TestCheckUncheck;
import com.thoughtworks.selenium.corebased.TestClick;
import com.thoughtworks.selenium.corebased.TestClickJavascriptHref;
import com.thoughtworks.selenium.corebased.TestCommandError;
import com.thoughtworks.selenium.corebased.TestComments;
import com.thoughtworks.selenium.corebased.TestConfirmations;
import com.thoughtworks.selenium.corebased.TestCssLocators;
import com.thoughtworks.selenium.corebased.TestEditable;
import com.thoughtworks.selenium.corebased.TestErrorChecking;
import com.thoughtworks.selenium.corebased.TestFailingAssert;
import com.thoughtworks.selenium.corebased.TestFailingVerifications;
import com.thoughtworks.selenium.corebased.TestFocusOnBlur;
import com.thoughtworks.selenium.corebased.TestFramesClick;
import com.thoughtworks.selenium.corebased.TestFramesNested;
import com.thoughtworks.selenium.corebased.TestFramesOpen;
import com.thoughtworks.selenium.corebased.TestGoBack;
import com.thoughtworks.selenium.corebased.TestImplicitLocators;
import com.thoughtworks.selenium.corebased.TestJavascriptParameters;
import com.thoughtworks.selenium.corebased.TestLocators;
import com.thoughtworks.selenium.corebased.TestModalDialog;
import com.thoughtworks.selenium.corebased.TestMultiSelect;
import com.thoughtworks.selenium.corebased.TestOpen;
import com.thoughtworks.selenium.corebased.TestPatternMatching;
import com.thoughtworks.selenium.corebased.TestPause;
import com.thoughtworks.selenium.corebased.TestPrompt;
import com.thoughtworks.selenium.corebased.TestRefresh;
import com.thoughtworks.selenium.corebased.TestSelect;
import com.thoughtworks.selenium.corebased.TestSelectWindow;
import com.thoughtworks.selenium.corebased.TestStore;
import com.thoughtworks.selenium.corebased.TestSubmit;
import com.thoughtworks.selenium.corebased.TestType;
import com.thoughtworks.selenium.corebased.TestVerifications;
import com.thoughtworks.selenium.corebased.TestVisibility;
import com.thoughtworks.selenium.corebased.TestWait;
import com.thoughtworks.selenium.corebased.TestWaitFor;
import com.thoughtworks.selenium.corebased.TestWaitForNot;
import com.thoughtworks.selenium.corebased.TestWaitInPopupWindow;
import com.thoughtworks.selenium.corebased.TestXPathLocators;

/**
 * The wrapper test suite for these tests, which spawns an in-process Selenium
 * Server for simple integration testing.
 * 
 * <p>
 * Normally, users should start the Selenium Server out-of-process, and just
 * leave it up and running, available for the tests to use. But, if you like,
 * you can do what we do here and start a Selenium Server before launching the
 * tests.
 * </p>
 * 
 * <p>
 * Note that we don't recommend starting and stopping the entire server during
 * each test's setUp and tearDown for these Integration tests; it shouldn't be
 * necessary, and doing so may conceal bugs in the server.
 * </p>
 * 
 * 
 * @author Dan Fabulich
 * 
 */
public class ClientDriverSuite extends TestCase {

    /**
     * Construct a test suite containing the other integration tests, wrapping
     * them up in a TestSetup object that will launch the Selenium Server
     * in-proc.
     * 
     * @return a test suite containing tests to run
     */
    public static Test suite() {
        TestSuite supersuite = new TestSuite(ClientDriverSuite.class.getName());
        TestSuite suite = generateSuite();
        // Left here to be able to run non proxy injection mode tests in a PI mode server 
        //InitSystemPropertiesTestSetup setup = new ClientDriverPISuite.InitSystemPropertiesTestSetupForPImode(suite);
        
        // Decorate generated test suite with a decorator to initialize system properties
        // such as debugging and logging properties
        InitSystemPropertiesTestSetup setup = new InitSystemPropertiesTestSetup(suite);
        supersuite.addTest(setup);
        
        return supersuite;
    }

    public static TestSuite generateSuite() {
        try {
            // TODO This class extends TestCase to workaround MSUREFIRE-113
            // http://jira.codehaus.org/browse/MSUREFIRE-113
            // Once that bug is fixed, this class should be a TestSuite, not a
            // TestCase
            TestSuite supersuite = new TestSuite(ClientDriverSuite.class.getName());
            TestSuite suite = new TestSuite(ClientDriverSuite.class.getName());
            
        	suite.addTestSuite(TestClick.class);
            suite.addTestSuite(ApacheMyFacesSuggestTest.class);
            suite.addTest(I18nTest.suite());
            suite.addTestSuite(RealDealIntegrationTest.class);
            suite.addTestSuite(TestErrorChecking.class);
            suite.addTestSuite(TestJavascriptParameters.class);
            suite.addTestSuite(TestClick.class);
            suite.addTestSuite(GoogleTestSearch.class);
            suite.addTestSuite(GoogleTest.class);
            suite.addTestSuite(WindowNamesTest.class);
            suite.addTestSuite(TestCheckUncheck.class);
            suite.addTestSuite(TestXPathLocators.class);
            suite.addTestSuite(TestClickJavascriptHref.class);
            suite.addTestSuite(TestCommandError.class);
            suite.addTestSuite(TestComments.class);
            suite.addTestSuite(TestFailingAssert.class);
            suite.addTestSuite(TestFailingVerifications.class);
            suite.addTestSuite(TestFocusOnBlur.class);
            suite.addTestSuite(TestGoBack.class);
            suite.addTestSuite(TestImplicitLocators.class);
            suite.addTestSuite(TestLocators.class);
            suite.addTestSuite(TestOpen.class);
            suite.addTestSuite(TestPatternMatching.class);
            suite.addTestSuite(TestPause.class);
            suite.addTestSuite(TestSelectWindow.class);
            suite.addTestSuite(TestStore.class);
            suite.addTestSuite(TestSubmit.class);
            suite.addTestSuite(TestType.class);
            suite.addTestSuite(TestVerifications.class);
            suite.addTestSuite(TestWait.class);
            suite.addTestSuite(TestSelect.class);
            suite.addTestSuite(TestEditable.class);
            suite.addTestSuite(TestPrompt.class);
            suite.addTestSuite(TestConfirmations.class);
            suite.addTestSuite(TestAlerts.class);
            suite.addTestSuite(TestRefresh.class);
            suite.addTestSuite(TestVisibility.class);
            suite.addTestSuite(TestMultiSelect.class);
            suite.addTestSuite(TestWaitInPopupWindow.class);
            suite.addTestSuite(TestWaitFor.class);
            suite.addTestSuite(TestWaitForNot.class);
            suite.addTestSuite(TestCssLocators.class);
            suite.addTestSuite(TestFramesClick.class);
            suite.addTestSuite(TestFramesOpen.class);
            suite.addTestSuite(TestFramesNested.class);
            suite.addTestSuite(TestModalDialog.class);
            
            ClientDriverTestSetup setup = new ClientDriverTestSetup(suite);
            supersuite.addTest(setup);
            return supersuite;
        } catch (RuntimeException e) {
            e.printStackTrace();
            throw e;
        }
    }
    


    /**
     * A TestSetup decorator that runs a super setUp and tearDown at the
     * beginning and end of the entire run: in this case, we use it to startup
     * and shutdown the in-process Selenium Server.
     * 
     * 
     * @author danielf
     * 
     */
    static class ClientDriverTestSetup extends TestSetup {
        public ClientDriverTestSetup(Test test) {
            super(test);
        }

        public void setUp() throws Exception {
        	TestEnvironment environment = GlobalTestEnvironment.get();
        	if (environment == null) {
        		environment = new InProcessTestEnvironment();
        		GlobalTestEnvironment.set(environment);
            	environment.getAppServer().addAdditionalWebApplication("/",new File("src/web").getAbsolutePath());
            	environment.getAppServer().start();
        	}
        }

        public void tearDown() throws Exception {
        	GlobalTestEnvironment.get().getAppServer().stop();
        }

    }
    
    /** 
     * A TestSetup decorator that runs a super setUp and tearDown at the
	 * beginning and end of the entire run.
	 *
	 * It is used to set system properties at the beginning of each run.
	 *
	 * @author nelsons
	 */
	static class InitSystemPropertiesTestSetup extends TestSetup {
		private HashMap/*<String, String>*/savedValuesOfSystemProperties = new HashMap/*<String, String>*/();

		public InitSystemPropertiesTestSetup(Test test) {
			super(test);
		}

		public void setUp() throws Exception {
			overrideProperty("selenium.debugMode", "true");
			overrideProperty("selenium.log", "log.txt");

			// make jetty logging especially verbose
			overrideProperty("DEBUG", "true");
			overrideProperty("DEBUG_VERBOSE", "1");
		}

		protected void overrideProperty(String propertyName,
				String propertyValue) {
			savedValuesOfSystemProperties.put(propertyName, System
					.getProperty(propertyName));
			System.setProperty(propertyName, propertyValue);
		}

		public void tearDown() throws Exception {
			restoreOldSystemPropertySettings();
		}

		private void restoreOldSystemPropertySettings() {
			for (Iterator i = savedValuesOfSystemProperties.keySet().iterator(); i
					.hasNext();) {
				String propertyName = (String) i.next();
				String oldValue = (String) savedValuesOfSystemProperties
						.get(propertyName);
				if (oldValue == null) {
					System.clearProperty(propertyName);
				} else {
					System.setProperty(propertyName, oldValue);
				}
			}
		}
	}
}
