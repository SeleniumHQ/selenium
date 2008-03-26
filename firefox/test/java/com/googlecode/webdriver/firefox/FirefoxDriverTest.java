package com.googlecode.webdriver.firefox;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.is;

import com.googlecode.webdriver.AbstractDriverTestCase;
import com.googlecode.webdriver.By;
import com.googlecode.webdriver.Ignore;
import com.googlecode.webdriver.NeedsFreshDriver;
import com.googlecode.webdriver.NoSuchElementException;
import com.googlecode.webdriver.WebDriver;
import com.googlecode.webdriver.WebElement;

public class FirefoxDriverTest extends AbstractDriverTestCase {
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
        assertThat(driver.getTitle(), equalTo("XHTML Test Page"));

        driver.switchTo().window("result");
        assertThat(driver.getTitle(), equalTo("We Arrive Here"));

        driver.get(iframePage);
        driver.findElement(By.id("iframe_page_heading"));
    }

    @NeedsFreshDriver
    @Ignore(value = "firefox", reason = "Need to figure out how to open a new browser instance mid-test")
    public void testShouldWaitUntilBrowserHasClosedProperly() throws Exception {
      driver.get(simpleTestPage);
      driver.close();

      setUp();

      driver.get(formPage);
      WebElement textarea = driver.findElement(By.id("withText"));
      String expectedText = "I like cheese\n\nIt's really nice";
      textarea.sendKeys(expectedText);

      String seenText = textarea.getValue();
      assertThat(seenText, equalTo(expectedText));
    }

    public void testShouldBeAbleToStartMoreThanOneInstanceOfTheFirefoxDriverSimultaneously() {
      WebDriver secondDriver = new FirefoxDriver();

      driver.get(xhtmlTestPage);
      secondDriver.get(formPage);

      assertThat(driver.getTitle(), is("XHTML Test Page"));
      assertThat(secondDriver.getTitle(), is("We Leave From Here"));

      // We only need to quit the second driver if the test passes
      secondDriver.quit();
    }
    
    @Ignore(value="firefox", reason="Until we package the extension this will fail on the command line")
    public void testShouldBeAbleToStartFromAUniqueProfile() {
      FirefoxProfile profile = new FirefoxProfile();
      
      try {
        WebDriver secondDriver = new FirefoxDriver(profile);
        secondDriver.quit();
      } catch (Exception e) {
        e.printStackTrace();
        fail("Expected driver to be created succesfully");
      }
    }

    @Ignore(value="firefox", reason="Until we package the extension this will fail on the command line")
    public void testANewProfileShouldAllowSettingAdditionalParameters() {
      FirefoxProfile profile = new FirefoxProfile();
      profile.addAdditionalPreference("browser.startup.homepage", "\"" + formPage + "\"");

      try {
        WebDriver secondDriver = new FirefoxDriver(profile);
        String title = secondDriver.getTitle();
        secondDriver.quit();

        assertThat(title, is("We Leave From Here"));
      } catch (Exception e) {
        e.printStackTrace();
        fail("Expected driver to be created succesfully");
      }
    }
}
