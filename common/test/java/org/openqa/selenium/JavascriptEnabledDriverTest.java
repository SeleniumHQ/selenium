/*
 * Copyright 2007 ThoughtWorks, Inc
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */

package org.openqa.selenium;

import static org.hamcrest.MatcherAssert.assertThat;
import org.hamcrest.Matchers;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.core.Is.is;
import static org.junit.matchers.JUnitMatchers.either;

import java.awt.*;

/**
 * Test case for browsers that support using Javascript
 */
public class JavascriptEnabledDriverTest extends AbstractDriverTestCase {
	@JavascriptEnabled
	@Ignore(value = "safari", reason = "safari: not implemented, ie: fails for some reason.")
    public void testDocumentShouldReflectLatestTitle() throws Exception {
        driver.get(javascriptPage);

        assertThat(driver.getTitle(), equalTo("Testing Javascript"));
        driver.findElement(By.linkText("Change the page title!")).click();
        assertThat(driver.getTitle(), equalTo("Changed"));

        String titleViaXPath = driver.findElement(By.xpath("/html/head/title")).getText();
        assertThat(titleViaXPath, equalTo("Changed"));
    }

	@JavascriptEnabled
	@Ignore("safari")
    public void testDocumentShouldReflectLatestDom() throws Exception {
        driver.get(javascriptPage);
        String currentText = driver.findElement(By.xpath("//div[@id='dynamo']")).getText();
        assertThat(currentText, equalTo("What's for dinner?"));

        WebElement webElement = driver.findElement(By.linkText("Update a div"));
        webElement.click();

        String newText = driver.findElement(By.xpath("//div[@id='dynamo']")).getText();
        assertThat(newText, equalTo("Fish and chips!"));
    }

//    public void testShouldAllowTheUserToOkayConfirmAlerts() {
//		driver.get(alertPage);
//		driver.findElement(By.id("confirm").click();
//		driver.switchTo().alert().accept();
//		assertEquals("Hello WebDriver", driver.getTitle());
//	}
//
//	public void testShouldAllowUserToDismissAlerts() {
//		driver.get(alertPage);
//		driver.findElement(By.id("confirm").click();
//
//		driver.switchTo().alert().dimiss();
//		assertEquals("Testing Alerts", driver.getTitle());
//	}
//
//	public void testShouldBeAbleToGetTheTextOfAnAlert() {
//		driver.get(alertPage);
//		driver.findElement(By.id("confirm").click();
//
//		String alertText = driver.switchTo().alert().getText();
//		assertEquals("Are you sure?", alertText);
//	}
//
//	public void testShouldThrowAnExceptionIfAnAlertIsBeingDisplayedAndTheUserAttemptsToCarryOnRegardless() {
//		driver.get(alertPage);
//		driver.findElement(By.id("confirm").click();
//
//		try {
//			driver.get(simpleTestPage);
//			fail("Expected the alert not to allow further progress");
//		} catch (UnhandledAlertException e) {
//			// This is good
//		}
//	}

	@JavascriptEnabled
	@Ignore("safari, htmlunit")
    public void testShouldAllowTheUserToTellIfAnElementIsDisplayedOrNot() {
        driver.get(javascriptPage);

        assertThat(((RenderedWebElement) driver.findElement(By.id("displayed"))).isDisplayed(), is(true));
        assertThat(((RenderedWebElement) driver.findElement(By.id("none"))).isDisplayed(), is(false));
        assertThat(((RenderedWebElement) driver.findElement(By.id("hidden"))).isDisplayed(), is(false));
    }

    @JavascriptEnabled
    @Ignore("safari")
    public void testVisibilityShouldTakeIntoAccountParentVisibility() {
        driver.get(javascriptPage);

        RenderedWebElement childDiv =  (RenderedWebElement) driver.findElement(By.id("hiddenchild"));
        RenderedWebElement hiddenLink = (RenderedWebElement) driver.findElement(By.id("hiddenlink"));

        assertFalse(childDiv.isDisplayed());
        assertFalse(hiddenLink.isDisplayed());
    }

    @JavascriptEnabled
	@Ignore(value = "ie, safari", reason="safari: not implemented, ie: Fails")
    public void testShouldWaitForLoadsToCompleteAfterJavascriptCausesANewPageToLoad() {
        driver.get(formPage);

        driver.findElement(By.id("changeme")).setSelected();

        assertThat(driver.getTitle(), equalTo("Page3"));
    }

	@JavascriptEnabled
	@Ignore("safari, htmlunit")
    public void testShouldBeAbleToDetermineTheLocationOfAnElement() {
        driver.get(xhtmlTestPage);

        RenderedWebElement element = (RenderedWebElement) driver.findElement(By.id("username"));
        Point location = element.getLocation();

        assertThat(location.getX() > 0, is(true));
        assertThat(location.getY() > 0, is(true));
    }

	@JavascriptEnabled
	@Ignore("safari, htmlunit")
    public void testShouldBeAbleToDetermineTheSizeOfAnElement() {
        driver.get(xhtmlTestPage);

        RenderedWebElement element = (RenderedWebElement) driver.findElement(By.id("username"));
        Dimension size = element.getSize();

        assertThat(size.getWidth() > 0, is(true));
        assertThat(size.getHeight() > 0, is(true));
    }

	@JavascriptEnabled
    public void testShouldFireOnChangeEventWhenSettingAnElementsValue() {
      driver.get(javascriptPage);
      driver.findElement(By.id("change")).sendKeys("foo");
      String result = driver.findElement(By.id("result")).getText();

      assertThat(result, equalTo("change"));
    }

  @JavascriptEnabled
  @Ignore("safari")
  public void testShouldBeAbleToSubmitFormsByCausingTheOnClickEventToFire() {
    driver.get(javascriptPage);
    WebElement element = driver.findElement(By.id("jsSubmitButton"));
    element.click();

    assertThat(driver.getTitle(), Matchers.is("We Arrive Here"));
  }

  @JavascriptEnabled
  @Ignore("safari")
  public void testShouldBeAbleToClickOnSubmitButtons() {
    driver.get(javascriptPage);
    WebElement element = driver.findElement(By.id("submittingButton"));
    element.click();

    assertThat(driver.getTitle(), Matchers.is("We Arrive Here"));
  }

  @JavascriptEnabled
  @Ignore("safari")
  public void testIssue80ClickShouldGenerateClickEvent() {
    driver.get(javascriptPage);
    WebElement element = driver.findElement(By.id("clickField"));
    assertEquals("Hello", element.getValue());

    element.click();

    assertEquals("Clicked", element.getValue());
  }

  @JavascriptEnabled
  @Ignore("safari, htmlunit")
  public void testShouldBeAbleToSwitchToFocusedElement() {
    driver.get(javascriptPage);

    driver.findElement(By.id("switchFocus")).click();

    WebElement element = driver.switchTo().activeElement();
    assertThat(element.getAttribute("id"), is("theworks"));
  }

  @JavascriptEnabled
  @Ignore("safari")
  public void testIfNoElementHasFocusTheActiveElementIsTheBody() {
    driver.get(simpleTestPage);

    WebElement element = driver.switchTo().activeElement();

    assertThat(element.getAttribute("name"), is("body"));
  }

  @JavascriptEnabled
  @Ignore("safari, htmlunit, ie")
  public void testChangeEventIsFiredAppropriatelyWhenFocusIsLost() {
    driver.get(javascriptPage);

    WebElement input = driver.findElement(By.id("changeable"));
    input.sendKeys("test");
    driver.findElement(By.id("clickField")).click(); // move focus
    assertThat(driver.findElement(By.id("result")).getText().trim(), either(is("focus change blur")).or(is("focus blur change")));

    input.sendKeys(Keys.BACK_SPACE, "t");
    driver.findElement(By.xpath("//body")).click();  // move focus

    assertThat(driver.findElement(By.id("result")).getText().trim(), either(is("focus change blur focus blur")).or(is("focus blur change focus blur")));
  }

  /**
  * If the click handler throws an exception, the firefox driver freezes. This is suboptimal.   
  */
  @JavascriptEnabled
  @Ignore("safari, htmlunit, ie")
  public void testShouldBeAbleToClickIfEvenSomethingHorribleHappens() {
    driver.get(javascriptPage);

    driver.findElement(By.id("error")).click();

    // If we get this far then the test has passed, but let's do something basic to prove the point
    String text = driver.findElement(By.id("error")).getText();

    assertNotNull(text);
  }
}
