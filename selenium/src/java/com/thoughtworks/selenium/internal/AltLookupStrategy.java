package com.thoughtworks.selenium.internal;

import com.thoughtworks.webdriver.WebDriver;
import com.thoughtworks.webdriver.WebElement;
import com.thoughtworks.webdriver.RenderingWebDriver;
import com.thoughtworks.webdriver.RenderedWebElement;

public class AltLookupStrategy implements LookupStrategy {
    public RenderedWebElement find(RenderingWebDriver driver, String use) {
        return driver.selectElement("//*[@alt='" + use + "']");
    }
}
