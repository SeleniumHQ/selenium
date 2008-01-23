package org.openqa.selenium;

import com.thoughtworks.selenium.DefaultSelenium;
import com.thoughtworks.selenium.Selenium;
import org.openqa.selenium.server.SeleniumServer;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.BeforeTest;
import org.testng.annotations.AfterTest;

public class AbstractTest {
    private SeleniumServer ss;
    protected Selenium s;

    @BeforeTest
    public void beforeTest() throws Exception {
        boolean multiWindow = Boolean.parseBoolean(System.getProperty("multiWindow", "false"));
        boolean proxyInjection = Boolean.parseBoolean(System.getProperty("proxyInjection", "true"));

        SeleniumServer.setProxyInjectionMode(proxyInjection);
        ss = new SeleniumServer(4444, false, multiWindow);
        ss.start();
    }

    @BeforeMethod
    public void beforeMethod() throws Exception {
        String browser = System.getProperty("browser", "FIREFOX2");
        String browserLauncher = System.getProperty("browsers." + browser);
        if (browserLauncher == null && browser.equals("FIREFOX2")) {
            // simple default which helps when running tests outside of maven
            browserLauncher = "*firefox";
        }

        s = new DefaultSelenium("localhost", 4444, browserLauncher, "http://localhost:4444");
        s.start();
    }

    @AfterTest
    public void afterTest() {
        ss.stop();
    }

    @AfterMethod
    public void afterMethod() {
        s.stop();
    }
}
