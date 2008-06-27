package org.openqa.selenium.safari;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.core.Is.is;
import static org.hamcrest.core.IsNull.notNullValue;

import org.openqa.selenium.AbstractDriverTestCase;
import org.openqa.selenium.By;

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
