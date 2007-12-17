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

package com.thoughtworks.webdriver;

import java.awt.Dimension;
import java.awt.Point;
import java.util.List;

/**
 * Test case for browsers that support using Javascript
 */
public abstract class JavascriptEnabledDriverTest extends BasicDriverTestCase {
    //private String alertPage;

    protected void setUp() throws Exception {
        super.setUp();

//        alertPage = baseUrl + "alerts.html";
    }

    public void testDocumentShouldReflectLatestTitle() throws Exception {
        driver.get(javascriptPage);

        assertEquals("Testing Javascript", driver.getTitle());
        driver.findElement(By.linkText("Change the page title!")).click();
        assertEquals("Changed", driver.getTitle());

        String titleViaXPath = driver.findElement(By.xpath("/html/head/title")).getText();
        assertEquals("Changed", titleViaXPath);
    }

    public void testDocumentShouldReflectLatestDom() throws Exception {
        driver.get(javascriptPage);
        String currentText = driver.findElement(By.xpath("//div[@id='dynamo']")).getText();
        assertEquals("What's for dinner?", currentText);

        WebElement webElement = driver.findElement(By.linkText("Update a div"));
        webElement.click();

        String newText = driver.findElement(By.xpath("//div[@id='dynamo']")).getText();
        assertEquals("Fish and chips!", newText);
    }

    public void testWillSimulateAKeyUpWhenEnteringTextIntoInputElements() {
        driver.get(javascriptPage);
        WebElement element = driver.findElement(By.id("keyUp"));
        element.setValue("I like cheese");

        WebElement result = driver.findElement(By.id("result"));
        assertEquals("I like cheese", result.getText());
    }

    public void testWillSimulateAKeyDownWhenEnteringTextIntoInputElements() {
        driver.get(javascriptPage);
        WebElement element = driver.findElement(By.id("keyDown"));
        element.setValue("I like cheese");

        WebElement result = driver.findElement(By.id("result"));
        // Because the key down gets the result before the input element is
        // filled, we're a letter short here
        assertEquals("I like chees", result.getText());
    }

    public void testWillSimulateAKeyPressWhenEnteringTextIntoInputElements() {
        driver.get(javascriptPage);
        WebElement element = driver.findElement(By.id("keyPress"));
        element.setValue("I like cheese");

        WebElement result = driver.findElement(By.id("result"));
        // Because the key down gets the result before the input element is
        // filled, we're a letter short here
        assertEquals("I like chees", result.getText());
    }

    public void testWillSimulateAKeyUpWhenEnteringTextIntoTextAreas() {
        driver.get(javascriptPage);
        WebElement element = driver.findElement(By.id("keyUpArea"));
        element.setValue("I like cheese");

        WebElement result = driver.findElement(By.id("result"));
        assertEquals("I like cheese", result.getText());
    }

    public void testWillSimulateAKeyDownWhenEnteringTextIntoTextAreas() {
        driver.get(javascriptPage);
        WebElement element = driver.findElement(By.id("keyDownArea"));
        element.setValue("I like cheese");

        WebElement result = driver.findElement(By.id("result"));
        // Because the key down gets the result before the input element is
        // filled, we're a letter short here
        assertEquals("I like chees", result.getText());
    }

    public void testWillSimulateAKeyPressWhenEnteringTextIntoTextAreas() {
        driver.get(javascriptPage);
        WebElement element = driver.findElement(By.id("keyPressArea"));
        element.setValue("I like cheese");

        WebElement result = driver.findElement(By.id("result"));
        // Because the key down gets the result before the input element is
        // filled, we're a letter short here
        assertEquals("I like chees", result.getText());
    }

    public void testShouldIssueMouseDownEvents() {
        driver.get(javascriptPage);
        driver.findElement(By.id("mousedown")).click();

        String result = driver.findElement(By.id("result")).getText();
        assertEquals("mouse down", result);
    }

    public void testShouldIssueClickEvents() {
        driver.get(javascriptPage);
        driver.findElement(By.id("mouseclick")).click();

        String result = driver.findElement(By.id("result")).getText();
        assertEquals("mouse click", result);
    }

    public void testShouldIssueMouseUpEvents() {
        driver.get(javascriptPage);
        driver.findElement(By.xpath("//div[@id='mouseup']")).click();

        String result = driver.findElement(By.id("result")).getText();
        assertEquals("mouse up", result);
    }

    public void testMouseEventsShouldBubbleUpToContainingElements() {
        driver.get(javascriptPage);
        driver.findElement(By.xpath("//p[@id='child']")).click();

        String result = driver.findElement(By.id("result")).getText();
        assertEquals("mouse down", result);
    }

    public void testShouldEmitOnChangeEventsWhenSelectingElements() {
        driver.get(javascriptPage);
        WebElement select = driver.findElement(By.id("selector"));
        List<WebElement> allOptions = select.getChildrenOfType("option");

        String initialTextValue = driver.findElement(By.id("result")).getText();

        WebElement foo = allOptions.get(0);
        WebElement bar = allOptions.get(1);

        foo.setSelected();
        assertEquals(initialTextValue, driver.findElement(By.id("result")).getText());
        bar.setSelected();
        assertEquals("bar", driver.findElement(By.id("result")).getText());
    }

    public void testShouldEmitOnChangeEventsWhenChnagingTheStateOfACheckbox() {
        driver.get(javascriptPage);
        WebElement checkbox = driver.findElement(By.id("checkbox"));

        checkbox.setSelected();
        assertEquals("checkbox thing", driver.findElement(By.id("result")).getText());
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

    //
    public void testShouldAllowTheUserToTellIfAnElementIsDisplayedOrNot() {
        driver.get(javascriptPage);

        assertTrue(((RenderedWebElement) driver.findElement(By.id("displayed"))).isDisplayed());
        assertFalse(((RenderedWebElement) driver.findElement(By.id("none"))).isDisplayed());
        assertFalse(((RenderedWebElement) driver.findElement(By.id("hidden"))).isDisplayed());
    }

    public void testShouldWaitForLoadsToCompleteAfterJavascriptCausesANewPageToLoad() {
        driver.get(formPage);

        driver.findElement(By.id("changeme")).setSelected();

        assertEquals("Page3", driver.getTitle());
    }

    public void testShouldBeAbleToDetermineTheLocationOfAnElement() {
        driver.get(xhtmlTestPage);

        RenderedWebElement element = (RenderedWebElement) driver.findElement(By.id("username"));
        Point location = element.getLocation();

        assertTrue(location.getX() > 0);
        assertTrue(location.getY() > 0);
    }

    public void testShouldBeAbleToDetermineTheSizeOfAnElement() {
        driver.get(xhtmlTestPage);

        RenderedWebElement element = (RenderedWebElement) driver.findElement(By.id("username"));
        Dimension size = element.getSize();

        assertTrue(size.getWidth() > 0);
        assertTrue(size.getHeight() > 0);
    }

    public void testShouldFireOnChangeEventWhenSettingAnElementsValue() {
      driver.get(javascriptPage);
      driver.findElement(By.id("change")).setValue("foo");
      String result = driver.findElement(By.id("result")).getText();

      assertEquals("change", result);
    }

    public void testShouldFireFocusKeyBlurAndChangeEventsInTheRightOrder() {
        driver.get(javascriptPage);

        driver.findElement(By.id("theworks")).setValue("a");
        String result = driver.findElement(By.id("result")).getText();

        assertEquals("focus keydown keypress keyup blur change", result.trim());
    }
}
