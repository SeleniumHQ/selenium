package com.googlecode.webdriver.safari;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.core.Is.is;
import static org.hamcrest.core.IsNull.notNullValue;

import com.googlecode.webdriver.AbstractDriverTestCase;
import com.googlecode.webdriver.By;

public class SafariDriverTest extends AbstractDriverTestCase {
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
