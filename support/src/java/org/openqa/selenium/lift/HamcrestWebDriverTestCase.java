/*
Copyright 2007-2009 WebDriver committers
Copyright 2007-2009 Google Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package org.openqa.selenium.lift;

import junit.framework.TestCase;

import org.hamcrest.Matcher;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.lift.find.Finder;

/**
 * Base class for tests using the LiFT style API to driver WebDriver.
 * @author rchatley (Robert Chatley)
 *
 */
public abstract class HamcrestWebDriverTestCase extends TestCase {

	private TestContext context = new WebDriverTestContext(createDriver());

	protected abstract WebDriver createDriver();

	protected void clickOn(Finder<WebElement, WebDriver> finder) {
		context.clickOn(finder);
	}

	protected void assertPresenceOf(Finder<WebElement, WebDriver> finder) {
		context.assertPresenceOf(finder);
	}
	
	protected void assertPresenceOf(Matcher<Integer> cardinalityConstraint, Finder<WebElement, WebDriver> finder) {
		context.assertPresenceOf(cardinalityConstraint, finder);
	}

	/**
	 * Cause the browser to navigate to the given URL
	 * @param url
	 */
	protected void goTo(String url) {
		  context.goTo(url);
	}
	
	/**
	 * Type characters into an element of the page, typically an input field
	 * @param text - characters to type
	 * @param inputFinder - specification for the page element
	 */
	protected void type(String text, Finder<WebElement, WebDriver> inputFinder) {
		context.type(text, inputFinder);
	}

	/**
	 * Syntactic sugar to use with {@link HamcrestWebDriverTestCase#type(String, Finder<WebElement, WebDriver>)},
	 * e.g. type("cheese", into(textbox()));
	 * The into() method simply returns its argument.
	 */
	protected Finder<WebElement, WebDriver> into(Finder<WebElement, WebDriver> input) {
		return input;
	}
	
	/**
	 * replace the default {@link TestContext}
	 */
	void setContext(TestContext context) {
		this.context = context;
	}
}
