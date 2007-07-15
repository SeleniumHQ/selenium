package com.thoughtworks.webdriver.firefox;

import com.thoughtworks.webdriver.JavascriptEnabledDriverTest;
import com.thoughtworks.webdriver.NoSuchElementException;
import com.thoughtworks.webdriver.WebDriver;

public class FirefoxDriverTest extends JavascriptEnabledDriverTest {
	protected WebDriver getDriver() {
		return new FirefoxDriver();
	}
	
	protected boolean isUsingSameDriverInstance() {
		return true;
	}

    public void testShouldContinueToWorkIfUnableToFindElementById() {
        driver.get(formPage);

        try {
            driver.selectElement("id=notThere");
            fail("Should not be able to select element by id here");
        } catch (NoSuchElementException e) {
            // This is expected
        }

        // Is this works, then we're golden
        driver.get(xhtmlTestPage);
    }
}
