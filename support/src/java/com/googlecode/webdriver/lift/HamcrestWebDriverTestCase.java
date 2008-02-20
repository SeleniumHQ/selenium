package com.googlecode.webdriver.lift;

import junit.framework.TestCase;

import org.hamcrest.Matcher;

import com.googlecode.webdriver.WebDriver;
import com.googlecode.webdriver.WebElement;
import com.googlecode.webdriver.lift.find.Finder;

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
	 * @param string - characters to type
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
