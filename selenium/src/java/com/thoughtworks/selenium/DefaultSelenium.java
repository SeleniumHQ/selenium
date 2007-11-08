package com.thoughtworks.selenium;

import com.thoughtworks.webdriver.WebDriver;
import com.thoughtworks.webdriver.RenderingWebDriver;
import com.thoughtworks.webdriver.firefox.FirefoxDriver;
import com.thoughtworks.webdriver.ie.InternetExplorerDriver;

public class DefaultSelenium extends WebDriverBackedSelenium implements Selenium {
    private final String browserName;

    public DefaultSelenium(String ignored, int ignoredDefaultPort, String browserName, String startUrl) {
        super(getDriver(browserName), startUrl);
        this.browserName = browserName;
    }

    private static RenderingWebDriver getDriver(String browserName) {
        if (browserName.indexOf("firefox") != -1 || browserName.indexOf("chrome") != -1) {
            return new FirefoxDriver();
        } else if (browserName.indexOf("iexplore") != -1) {
            return new InternetExplorerDriver();
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
}
