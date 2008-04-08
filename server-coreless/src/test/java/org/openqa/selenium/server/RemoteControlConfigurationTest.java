package org.openqa.selenium.server;

import junit.framework.TestCase;

import java.io.File;

/**
 * #{@link org.openqa.selenium.server.RemoteControlConfiguration} unit test class.
 */
public class RemoteControlConfigurationTest extends TestCase {
    
    public void testPortIs4444ByDefault() {
        assertEquals(4444, new RemoteControlConfiguration().getPort());
    }

    public void testPortCanBeSet() {
        final RemoteControlConfiguration configuration;
        configuration = new RemoteControlConfiguration();

        configuration.setPort(1234);
        assertEquals(1234, configuration.getPort());
    }

    public void testMultiWindowIsFalseByDefault() {
        assertFalse(new RemoteControlConfiguration().isMultiWindow());
    }

    public void testMultiWindowCanBeSet() {
        final RemoteControlConfiguration configuration;
        configuration = new RemoteControlConfiguration();

        configuration.setMultiWindow(true);
        assertTrue(configuration.isMultiWindow());
    }

    public void testProxyInjectionModeArgIsFalseByDefault() {
        assertFalse(new RemoteControlConfiguration().getProxyInjectionModeArg());
    }

    public void testProxyInjectionModeArgCanBeSet() {
        final RemoteControlConfiguration configuration;
        configuration = new RemoteControlConfiguration();

        configuration.setProxyInjectionModeArg(true);
        assertTrue(configuration.getProxyInjectionModeArg());
    }


    public void testPortDriversShouldContactIsSamePortByDefault() {
        final RemoteControlConfiguration configuration;

        configuration = new RemoteControlConfiguration();
        configuration.setPort(1515);
        assertEquals(1515, configuration.getPortDriversShouldContact());
    }

    public void testPortDriversShouldContactCanBeSet() {
        final RemoteControlConfiguration configuration;
        configuration = new RemoteControlConfiguration();

        configuration.setPortDriversShouldContact(1234);
        assertEquals(1234, configuration.getPortDriversShouldContact());
    }

    public void testHTMLSuiteIsFalseByDefault() {
        assertFalse(new RemoteControlConfiguration().isHTMLSuite());
    }

    public void testHTMLSuiteCanBeSet() {
        final RemoteControlConfiguration configuration;
        configuration = new RemoteControlConfiguration();

        configuration.setHTMLSuite(true);
        assertTrue(configuration.isHTMLSuite());
    }

    public void testSelfTestIsFalseByDefault() {
        assertFalse(new RemoteControlConfiguration().isSelfTest());
    }

    public void testSelfTestCanBeSet() {
        final RemoteControlConfiguration configuration;
        configuration = new RemoteControlConfiguration();

        configuration.setSelfTest(true);
        assertTrue(configuration.isSelfTest());
    }

    public void testSelfTestDirIsNullByDefault() {
        assertNull(new RemoteControlConfiguration().getSelfTestDir());
    }

    public void testSelfTestDirCanBeSet() {
        final RemoteControlConfiguration configuration;
        final File aDirectory;

        configuration = new RemoteControlConfiguration();
        aDirectory = new File("\"A Directory Name\"");
        configuration.setSelfTestDir(aDirectory);
        assertEquals(aDirectory, configuration.getSelfTestDir());
    }

    public void testInteractiveIsFalseByDefault() {
        assertFalse(new RemoteControlConfiguration().isInteractive());
    }

    public void testInteractiveCanBeSet() {
        final RemoteControlConfiguration configuration;
        configuration = new RemoteControlConfiguration();

        configuration.setInteractive(true);
        assertTrue(configuration.isInteractive());
    }

    public void testUserExtensionsIsNullByDefault() {
        assertNull(new RemoteControlConfiguration().getUserExtensions());
    }

    public void testUserExtensionsCanBeSet() {
        final RemoteControlConfiguration configuration;
        final File aDirectory;

        configuration = new RemoteControlConfiguration();
        aDirectory = new File("\"A File Name\"");
        configuration.setUserExtensions(aDirectory);
        assertEquals(aDirectory, configuration.getUserExtensions());
    }

    public void testUserJSInjectionIsFalseByDefault() {
        assertFalse(new RemoteControlConfiguration().userJSInjection());
    }

    public void testUserJSInjectionCanBeSet() {
        final RemoteControlConfiguration configuration;
        configuration = new RemoteControlConfiguration();

        configuration.setUserJSInjection(true);
        assertTrue(configuration.userJSInjection());
    }

    public void testTrustAllSSLCertificatesIsFalseByDefault() {
        assertFalse(new RemoteControlConfiguration().trustAllSSLCertificates());
    }

    public void testTrustAllSSLCertificatesCanBeSet() {
        final RemoteControlConfiguration configuration;
        configuration = new RemoteControlConfiguration();

        configuration.setTrustAllSSLCertificates(true);
        assertTrue(configuration.trustAllSSLCertificates());
    }

    public void testDebugURLIsEmptyByDefault() {
        assertEquals("", new RemoteControlConfiguration().getDebugURL());
    }


    public void testDebugURLCanBeSet() {
        final RemoteControlConfiguration configuration;
        configuration = new RemoteControlConfiguration();

        configuration.setDebugURL("A URL");
        assertEquals("A URL", configuration.getDebugURL());
    }

    public void testDontInjectRegexIsNullByDefault() {
        assertNull(new RemoteControlConfiguration().getDontInjectRegex());
    }


    public void testDontInjectRegexCanBeSet() {
        final RemoteControlConfiguration configuration;
        configuration = new RemoteControlConfiguration();

        configuration.setDontInjectRegex("A Regex");
        assertEquals("A Regex", configuration.getDontInjectRegex());
    }

    public void testFirefoxProfileTemplateIsNullByDefault() {
        assertNull(new RemoteControlConfiguration().getFirefoxProfileTemplate());
    }

    public void testFirefoxProfileTemplateCanBeSet() {
        final RemoteControlConfiguration configuration;
        final File aDirectory;

        configuration = new RemoteControlConfiguration();
        aDirectory = new File("\"A Directory Path\"");
        configuration.setFirefoxProfileTemplate(aDirectory);
        assertEquals(aDirectory, configuration.getFirefoxProfileTemplate());
    }
}
