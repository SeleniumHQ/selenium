package com.thoughtworks.selenium;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverBackedSelenium;

public class DefaultSelenium extends WebDriverBackedSelenium implements Selenium {
    private final String browserName;

    public DefaultSelenium(String ignored, int ignoredDefaultPort, String browserName, String startUrl) {
        super(getDriver(browserName), startUrl);
        this.browserName = browserName;
    }

    private static WebDriver getDriver(String browserName) {
        if (browserName.indexOf("firefox") != -1 || browserName.indexOf("chrome") != -1) {
            return instantiate("org.openqa.selenium.firefox.FirefoxDriver");
            } else if (browserName.indexOf("htmlunit") != -1) {
            return instantiate("org.openqa.selenium.htmlunit.HtmlUnitDriver");
        } else if (browserName.indexOf("iexplore") != -1) {
            return instantiate("org.openqa.selenium.ie.InternetExplorerDriver");
        } else if (browserName.indexOf("htmlunit") != -1) {
            return instantiate("org.openqa.selenium.htmlunit.HtmlUnitDriver");
        } else if (browserName.indexOf("safari") != -1) {
            return instantiate("org.openqa.selenium.safari.SafariDriver");
        } else {
            throw new RuntimeException("Unsupported browser version: " + browserName);
        }
    }

    public void open(String url) {
        try {
            super.open(url);
        } catch (NullPointerException e) {
            // If the user has closed the final window, the driver should be in an inconsistent state
            driver = getDriver(browserName);
            super.open(url);
        }
    }

    private static WebDriver instantiate(String className) {
        try {
            return (WebDriver) Class.forName(className).newInstance();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
