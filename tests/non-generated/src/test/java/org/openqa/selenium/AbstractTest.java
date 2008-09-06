package org.openqa.selenium;

import com.thoughtworks.selenium.DefaultSelenium;
import com.thoughtworks.selenium.Selenium;
import org.openqa.selenium.server.RemoteControlConfiguration;
import org.openqa.selenium.server.SeleniumServer;
import org.openqa.selenium.utils.TestReporter;
import org.testng.Assert;
import org.testng.SkipException;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.AfterTest;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.BeforeTest;

public abstract class AbstractTest {
    protected SeleniumServer ss;
    protected Selenium selenium;

    @BeforeTest(groups = {"single"})
    public void beforeTest() throws Exception {
        final RemoteControlConfiguration configuration;
        boolean multiWindow = isMultiWindow();
        boolean proxyInjection = isProxyInjection();

        SeleniumServer.setProxyInjectionMode(proxyInjection);
        configuration = new RemoteControlConfiguration();
        configuration.setPort(4444);
        configuration.setTrustAllSSLCertificates(true);
        configuration.setMultiWindow(multiWindow);
        ss = new SeleniumServer(false, configuration);
        ss.start();
    }

    public static boolean isProxyInjection() {
        return Boolean.parseBoolean(System.getProperty("proxyInjection", "true"));
    }

    public static boolean isMultiWindow() {
        return Boolean.parseBoolean(System.getProperty("multiWindow", "false"));
    }

    @BeforeMethod(groups = {"single"})
    public void beforeMethod() throws Exception {
        String browser = System.getProperty("browser", "FIREFOX2");
        String browserLauncher = System.getProperty("browsers." + browser);
        if (browserLauncher == null && browser.equals("FIREFOX2")) {
            // simple default which helps when running tests outside of maven
            browserLauncher = "*firefox";
        }

        selenium = new DefaultSelenium("localhost", 4444, browserLauncher, "http://localhost:4444");
        selenium.start();
    }

    @AfterTest(groups = {"single"})
    public void afterTest() {
        ss.stop();
    }

    @AfterMethod(groups = {"single"})
    public void afterMethod() {
        selenium.stop();
    }

    protected void pass(String name) {
        TestReporter.pass(name);
    }

    protected void skip(String name) {
        TestReporter.skip(name);
        throw new SkipException("Skipping " + name);
    }

    protected void fail(String name) {
        Assert.fail(name);
    }

    protected void fail(String name, Throwable t) {
        TestReporter.report(name, false);
        if (t instanceof RuntimeException) {
            throw (RuntimeException) t;
        } else {
            throw new RuntimeException(t);
        }
    }

    protected boolean isBrowser(String browser) {
        return System.getProperty("browser", "FIREFOX2").equals(browser);
    }
}
