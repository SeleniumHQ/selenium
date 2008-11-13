package org.openqa.selenium.firefox;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.is;

import org.openqa.selenium.AbstractDriverTestCase;
import org.openqa.selenium.By;
import org.openqa.selenium.Ignore;
import org.openqa.selenium.NeedsFreshDriver;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

import java.awt.*;

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

    @Ignore("firefox")
    public void testANewProfileShouldAllowSettingAdditionalParameters() {
      FirefoxProfile profile = new FirefoxProfile();
      profile.setPreference("browser.startup.homepage", formPage);

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

    public void testShouldBeAbleToGetTheLocationOfAnElement() {
        driver.get(javascriptPage);

        FirefoxWebElement element = (FirefoxWebElement) driver.findElement(By.id("on-form"));
        Point point = element.getLocationOnScreenOnceScrolledIntoView();

        assertTrue(point.getX() > 1);
        assertTrue(point.getY() > 1);
    }
}
