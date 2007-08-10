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

import java.util.List;

/**
 * Test case for browsers that support using Javascript
 */
public abstract class JavascriptEnabledDriverTest extends BasicDriverTestCase {
    public void testDocumentShouldReflectLatestTitle() throws Exception {
        driver.get(javascriptPage);

        assertEquals("Testing Javascript", driver.getTitle());
        driver.selectElement("link=Change the page title!").click();
        assertEquals("Changed", driver.getTitle());

        String titleViaXPath = driver.selectText("/html/head/title");
        assertEquals("Changed", titleViaXPath);
    }

    public void testDocumentShouldReflectLatestDom() throws Exception {
        driver.get(javascriptPage);
        String currentText = driver.selectText("//div[@id='dynamo']");
    	assertEquals("What's for dinner?", currentText);

        WebElement webElement = driver.selectElement("link=Update a div");
        webElement.click();

        String newText = driver.selectText("//div[@id='dynamo']");
        assertEquals("Fish and chips!", newText);
    }
    
	public void testWillSimulateAKeyUpWhenEnteringTextIntoInputElements() {
        driver.get(javascriptPage);
        WebElement element = driver.selectElement("//input[@id='keyUp']");
		element.setValue("I like cheese");

		WebElement result = driver.selectElement("//div[@id='result']");
		assertEquals("I like cheese", result.getText());
	}

	public void testWillSimulateAKeyDownWhenEnteringTextIntoInputElements() {
        driver.get(javascriptPage);
        WebElement element = driver.selectElement("//input[@id='keyDown']");
		element.setValue("I like cheese");

		WebElement result = driver.selectElement("//div[@id='result']");
		// Because the key down gets the result before the input element is
		// filled, we're a letter short here
		assertEquals("I like chees", result.getText());
	}

	public void testWillSimulateAKeyPressWhenEnteringTextIntoInputElements() {
        driver.get(javascriptPage);
        WebElement element = driver.selectElement("//input[@id='keyPress']");
		element.setValue("I like cheese");

		WebElement result = driver.selectElement("//div[@id='result']");
		// Because the key down gets the result before the input element is
		// filled, we're a letter short here
		assertEquals("I like chees", result.getText());
	}
	
	public void testWillSimulateAKeyUpWhenEnteringTextIntoTextAreas() {
        driver.get(javascriptPage);
        WebElement element = driver.selectElement("//textarea[@id='keyUpArea']");
		element.setValue("I like cheese");
		
		WebElement result = driver.selectElement("//div[@id='result']");
		assertEquals("I like cheese", result.getText());
	}

	public void testWillSimulateAKeyDownWhenEnteringTextIntoTextAreas() {
        driver.get(javascriptPage);
        WebElement element = driver.selectElement("//textarea[@id='keyDownArea']");
		element.setValue("I like cheese");

		WebElement result = driver.selectElement("//div[@id='result']");
		// Because the key down gets the result before the input element is
		// filled, we're a letter short here
		assertEquals("I like chees", result.getText());
	}

	public void testWillSimulateAKeyPressWhenEnteringTextIntoTextAreas() {
        driver.get(javascriptPage);
        WebElement element = driver.selectElement("//textarea[@id='keyPressArea']");
		element.setValue("I like cheese");

		WebElement result = driver.selectElement("//div[@id='result']");
		// Because the key down gets the result before the input element is
		// filled, we're a letter short here
		assertEquals("I like chees", result.getText());
	}

    public void testShouldIssueMouseDownEvents() {
        driver.get(javascriptPage);
        driver.selectElement("//div[@id='mousedown']").click();

        String result = driver.selectElement("//div[@id='result']").getText();
        assertEquals("mouse down", result);
    }

    public void testShouldIssueClickEvents() {
        driver.get(javascriptPage);
        driver.selectElement("//div[@id='mouseclick']").click();

        String result = driver.selectElement("//div[@id='result']").getText();
        assertEquals("mouse click", result);
    }

    public void testShouldIssueMouseUpEvents() {
        driver.get(javascriptPage);
        driver.selectElement("//div[@id='mouseup']").click();

        String result = driver.selectElement("//div[@id='result']").getText();
        assertEquals("mouse up", result);
    }

    public void testMouseEventsShouldBubbleUpToContainingElements() {
        driver.get(javascriptPage);
        driver.selectElement("//p[@id='child']").click();

        String result = driver.selectElement("//div[@id='result']").getText();
        assertEquals("mouse down", result);
    }
    
    public void testShouldEmitOnChangeEventsWhenSelectingElements() {
    	driver.get(javascriptPage);
    	WebElement select = driver.selectElement("id=selector");
    	List allOptions = select.getChildrenOfType("option");
    	
    	String initialTextValue = driver.selectText("id=result");
    	
    	WebElement foo = (WebElement) allOptions.get(0);
    	WebElement bar = (WebElement) allOptions.get(1);

    	foo.setSelected();
    	assertEquals(initialTextValue, driver.selectText("id=result"));
    	bar.setSelected();
    	assertEquals("bar", driver.selectText("id=result"));
    }
    
    public void testShouldEmitOnChangeEventsWhenChnagingTheStateOfACheckbox() {
    	driver.get(javascriptPage);
    	WebElement checkbox = driver.selectElement("id=checkbox");
    	
    	checkbox.setSelected();
    	assertEquals("checkbox thing", driver.selectText("id=result"));
    }
}
