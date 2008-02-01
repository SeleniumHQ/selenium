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

package com.googlecode.webdriver;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.core.Is.is;
import org.hamcrest.Matchers;

import java.awt.Dimension;
import java.awt.Point;
import java.util.List;

/**
 * Test case for browsers that support using Javascript
 */
public class JavascriptEnabledDriverTest extends AbstractDriverTestCase {
	@JavascriptEnabled
	@Ignore("safari")
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

	@JavascriptEnabled
    public void testWillSimulateAKeyUpWhenEnteringTextIntoInputElements() {
        driver.get(javascriptPage);
        WebElement element = driver.findElement(By.id("keyUp"));
        element.sendKeys("I like cheese");

        WebElement result = driver.findElement(By.id("result"));
        assertThat(result.getText(), equalTo("I like cheese"));
    }

	@JavascriptEnabled
    public void testWillSimulateAKeyDownWhenEnteringTextIntoInputElements() {
        driver.get(javascriptPage);
        WebElement element = driver.findElement(By.id("keyDown"));
        element.sendKeys("I like cheese");

        WebElement result = driver.findElement(By.id("result"));
        // Because the key down gets the result before the input element is
        // filled, we're a letter short here
        assertThat(result.getText(), equalTo("I like chees"));
    }

	@JavascriptEnabled
    public void testWillSimulateAKeyPressWhenEnteringTextIntoInputElements() {
        driver.get(javascriptPage);
        WebElement element = driver.findElement(By.id("keyPress"));
        element.sendKeys("I like cheese");

        WebElement result = driver.findElement(By.id("result"));
        // Because the key down gets the result before the input element is
        // filled, we're a letter short here
        assertThat(result.getText(), equalTo("I like chees"));
    }

	@JavascriptEnabled
    public void testWillSimulateAKeyUpWhenEnteringTextIntoTextAreas() {
        driver.get(javascriptPage);
        WebElement element = driver.findElement(By.id("keyUpArea"));
        element.sendKeys("I like cheese");

        WebElement result = driver.findElement(By.id("result"));
        assertThat(result.getText(), equalTo("I like cheese"));
    }

	@JavascriptEnabled
    public void testWillSimulateAKeyDownWhenEnteringTextIntoTextAreas() {
        driver.get(javascriptPage);
        WebElement element = driver.findElement(By.id("keyDownArea"));
        element.sendKeys("I like cheese");

        WebElement result = driver.findElement(By.id("result"));
        // Because the key down gets the result before the input element is
        // filled, we're a letter short here
        assertThat(result.getText(), equalTo("I like chees"));
    }

	@JavascriptEnabled
    public void testWillSimulateAKeyPressWhenEnteringTextIntoTextAreas() {
        driver.get(javascriptPage);
        WebElement element = driver.findElement(By.id("keyPressArea"));
        element.sendKeys("I like cheese");

        WebElement result = driver.findElement(By.id("result"));
        // Because the key down gets the result before the input element is
        // filled, we're a letter short here
        assertThat(result.getText(), equalTo("I like chees"));
    }

	@JavascriptEnabled
	@Ignore("safari")
    public void testsShouldIssueMouseDownEvents() {
        driver.get(javascriptPage);
        driver.findElement(By.id("mousedown")).click();

        String result = driver.findElement(By.id("result")).getText();
        assertThat(result, equalTo("mouse down"));
    }

	@JavascriptEnabled
	@Ignore("safari")
    public void testShouldIssueClickEvents() {
        driver.get(javascriptPage);
        driver.findElement(By.id("mouseclick")).click();

        String result = driver.findElement(By.id("result")).getText();
        assertThat(result, equalTo("mouse click"));
    }

	@JavascriptEnabled
	@Ignore("safari")
    public void testShouldIssueMouseUpEvents() {
        driver.get(javascriptPage);
        driver.findElement(By.xpath("//div[@id='mouseup']")).click();

        String result = driver.findElement(By.id("result")).getText();
        assertThat(result, equalTo("mouse up"));
    }

	@JavascriptEnabled
	@Ignore("safari")
    public void testMouseEventsShouldBubbleUpToContainingElements() {
        driver.get(javascriptPage);
        driver.findElement(By.xpath("//p[@id='child']")).click();

        String result = driver.findElement(By.id("result")).getText();
        assertThat(result, equalTo("mouse down"));
    }

	@JavascriptEnabled
	@Ignore("safari")
    public void testShouldEmitOnChangeEventsWhenSelectingElements() {
        driver.get(javascriptPage);
        WebElement select = driver.findElement(By.id("selector"));
        List<WebElement> allOptions = select.getChildrenOfType("option");

        String initialTextValue = driver.findElement(By.id("result")).getText();

        WebElement foo = allOptions.get(0);
        WebElement bar = allOptions.get(1);

        foo.setSelected();
        assertThat(driver.findElement(By.id("result")).getText(), equalTo(initialTextValue));
        bar.setSelected();
        assertThat(driver.findElement(By.id("result")).getText(), equalTo("bar"));
    }

	@JavascriptEnabled
	@Ignore("safari")
    public void testShouldEmitOnChangeEventsWhenChnagingTheStateOfACheckbox() {
        driver.get(javascriptPage);
        WebElement checkbox = driver.findElement(By.id("checkbox"));

        checkbox.setSelected();
        assertThat(driver.findElement(By.id("result")).getText(), equalTo("checkbox thing"));
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
	@Ignore("safari")
    public void testShouldAllowTheUserToTellIfAnElementIsDisplayedOrNot() {
        driver.get(javascriptPage);

        assertThat(((RenderedWebElement) driver.findElement(By.id("displayed"))).isDisplayed(), is(true));
        assertThat(((RenderedWebElement) driver.findElement(By.id("none"))).isDisplayed(), is(false));
        assertThat(((RenderedWebElement) driver.findElement(By.id("hidden"))).isDisplayed(), is(false));
    }

	@JavascriptEnabled
	@Ignore("safari")
    public void testShouldWaitForLoadsToCompleteAfterJavascriptCausesANewPageToLoad() {
        driver.get(formPage);

        driver.findElement(By.id("changeme")).setSelected();

        assertThat(driver.getTitle(), equalTo("Page3"));
    }

	@JavascriptEnabled
	@Ignore("safari")
    public void testShouldBeAbleToDetermineTheLocationOfAnElement() {
        driver.get(xhtmlTestPage);

        RenderedWebElement element = (RenderedWebElement) driver.findElement(By.id("username"));
        Point location = element.getLocation();

        assertThat(location.getX() > 0, is(true));
        assertThat(location.getY() > 0, is(true));
    }

	@JavascriptEnabled
	@Ignore("safari")
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
    @Ignore(value = "firefox, safari", reason = "Not implemeted in safari. Firefox: runs okay alone, but fails in a suite. Need to understand why")
    public void testShouldFireFocusKeyBlurAndChangeEventsInTheRightOrder() {
        driver.get(javascriptPage);

        driver.findElement(By.id("theworks")).sendKeys("a");
        String result = driver.findElement(By.id("result")).getText();

        assertThat(result.trim(), equalTo("focus keydown keypress keyup blur change"));
    }

  @JavascriptEnabled
  @Ignore("ie, safari")
  public void testShouldBeAbleToClickOnNormalButtons() {
    driver.get(javascriptPage);
    WebElement element = driver.findElement(By.id("plainButton"));
    element.click();

    String result = driver.findElement(By.id("result")).getText().trim();
    assertThat(result, is("mousedown mouseup click"));
  }

  @JavascriptEnabled
  @Ignore("ie, safari")
  public void testShouldBeAbleToSubmitFormsByCausingTheOnClickEventToFire() {
    driver.get(javascriptPage);
    WebElement element = driver.findElement(By.id("jsSubmitButton"));
    element.click();

    assertThat(driver.getTitle(), Matchers.is("We Arrive Here"));
  }

  @JavascriptEnabled
  @Ignore("ie, safari")
  public void testShouldBeAbleToClickOnSubmitButtons() {
    driver.get(javascriptPage);
    WebElement element = driver.findElement(By.id("submittingButton"));
    element.click();

    assertThat(driver.getTitle(), Matchers.is("We Arrive Here"));
  }

//    @JavascriptEnabled
//    @Ignore
//  public void testShouldBeAbleToSwitchToFocusedElement() {
//      driver.get(javascriptPage);
//
//      driver.findElement(By.id("switchFocus")).click();
//
//      WebElement element = driver.switchTo().activeElement();
//      assertThat(element.getAttribute("id"), is("theworks"));
//  }
}
