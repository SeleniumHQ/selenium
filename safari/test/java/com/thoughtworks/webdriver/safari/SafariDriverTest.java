package com.thoughtworks.webdriver.safari;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.core.Is.is;
import static org.hamcrest.core.IsNull.notNullValue;

import com.thoughtworks.webdriver.By;
import com.thoughtworks.webdriver.JavascriptEnabledDriverTest;
import com.thoughtworks.webdriver.WebDriver;

public class SafariDriverTest extends JavascriptEnabledDriverTest {
    protected WebDriver getDriver() {
        return new SafariDriver();
    }

    public void testGetUrl() {
        driver.get(xhtmlTestPage);
        assertThat(driver.getTitle(), equalTo("XHTML Test Page"));
    }

    public void testShouldFindByLinks() {
        driver.get(xhtmlTestPage);
        assertThat(driver, notNullValue());
        assertThat(driver.findElement(By.linkText("click me")), is(notNullValue()));

    }
}
