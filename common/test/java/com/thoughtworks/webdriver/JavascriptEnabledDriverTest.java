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

/**
 * Test case for browsers that support using Javascript
 */
public abstract class JavascriptEnabledDriverTest extends BasicDriverTestCase {
	protected void setUp() throws Exception {
		super.setUp();
		
		driver.get(javascriptPage);
	}
	
    public void testDocumentShouldReflectLatestDOM() {
        driver.get(xhtmlTestPage);

        assertEquals("XHTML Test Page", driver.getTitle());
        driver.selectElement("link=Change the page title!").click();
        assertEquals("Changed", driver.getTitle());

        String titleViaXPath = driver.selectText("/html/head/title");
        assertEquals("Changed", titleViaXPath);
    }
	
	public void testWillSimulateAKeyUpWhenEnteringTextIntoInputElements() {
		WebElement element = driver.selectElement("//input[@id='keyUp']");
		element.setValue("I like cheese");

		WebElement result = driver.selectElement("//div[@id='result']");
		assertEquals("I like cheese", result.getText());
	}

	public void testWillSimulateAKeyDownWhenEnteringTextIntoInputElements() {
		WebElement element = driver.selectElement("//input[@id='keyDown']");
		element.setValue("I like cheese");

		WebElement result = driver.selectElement("//div[@id='result']");
		// Because the key down gets the result before the input element is
		// filled, we're a letter short here
		assertEquals("I like chees", result.getText());
	}

	public void testWillSimulateAKeyPressWhenEnteringTextIntoInputElements() {
		WebElement element = driver.selectElement("//input[@id='keyPress']");
		element.setValue("I like cheese");

		WebElement result = driver.selectElement("//div[@id='result']");
		// Because the key down gets the result before the input element is
		// filled, we're a letter short here
		assertEquals("I like chees", result.getText());
	}
	
	public void testWillSimulateAKeyUpWhenEnteringTextIntoTextAreas() {
		WebElement element = driver.selectElement("//textarea[@id='keyUpArea']");
		element.setValue("I like cheese");

		WebElement result = driver.selectElement("//div[@id='result']");
		assertEquals("I like cheese", result.getText());
	}

	public void testWillSimulateAKeyDownWhenEnteringTextIntoTextAreas() {
		WebElement element = driver.selectElement("//textarea[@id='keyDownArea']");
		element.setValue("I like cheese");

		WebElement result = driver.selectElement("//div[@id='result']");
		// Because the key down gets the result before the input element is
		// filled, we're a letter short here
		assertEquals("I like chees", result.getText());
	}

	public void testWillSimulateAKeyPressWhenEnteringTextIntoTextAreas() {
		WebElement element = driver.selectElement("//textarea[@id='keyPressArea']");
		element.setValue("I like cheese");

		WebElement result = driver.selectElement("//div[@id='result']");
		// Because the key down gets the result before the input element is
		// filled, we're a letter short here
		assertEquals("I like chees", result.getText());
	}
}
