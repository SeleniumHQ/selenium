package com.thoughtworks.webdriver.firefox;

import com.thoughtworks.webdriver.By;
import com.thoughtworks.webdriver.JavascriptEnabledDriverTest;
import com.thoughtworks.webdriver.NoSuchElementException;
import com.thoughtworks.webdriver.WebDriver;
import com.thoughtworks.webdriver.WebElement;

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
            driver.findElement(By.id("notThere"));
            fail("Should not be able to select element by id here");
        } catch (NoSuchElementException e) {
            // This is expected
        }

        // Is this works, then we're golden
        driver.get(xhtmlTestPage);
    }

    public void testShouldSwitchFocusToANewWindowWhenItIsOpenedAndNotStopFutureOperations() {
        driver.get(xhtmlTestPage);

        driver.findElement(By.linkText("Open new window")).click();
        assertEquals("XHTML Test Page", driver.getTitle());

        driver.switchTo().window("result");
        assertEquals("We Arrive Here", driver.getTitle());

        driver.get(iframePage);
        driver.findElement(By.id("iframe_page_heading"));
    }

    public void testShouldWaitUntilBrowserHasClosedProperly() throws Exception {
      if (isUsingSameDriverInstance()) {
        // Force the driver to be reopened
        storedDriver = null;
      }
      driver.get(simpleTestPage);
      driver.close();

      setUp();

      driver.get(formPage);
      WebElement textarea = driver.findElement(By.id("withText"));
      String expectedText = "I like cheese\n\nIt's really nice";
      textarea.setValue(expectedText);

      String seenText = textarea.getValue();
      assertEquals(expectedText, seenText);
    }
}
