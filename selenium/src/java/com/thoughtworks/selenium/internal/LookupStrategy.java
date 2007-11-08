package com.thoughtworks.selenium.internal;

import com.thoughtworks.webdriver.WebDriver;
import com.thoughtworks.webdriver.WebElement;
import com.thoughtworks.webdriver.RenderedWebElement;
import com.thoughtworks.webdriver.RenderingWebDriver;

public interface LookupStrategy {
    RenderedWebElement find(RenderingWebDriver driver, String use);
}
