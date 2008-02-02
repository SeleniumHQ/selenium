package com.googlecode.webdriver.lift;

import static com.googlecode.webdriver.lift.match.NumericalMatchers.atLeast;

import java.util.Collection;

import junit.framework.TestCase;

import org.hamcrest.Description;
import org.hamcrest.Matcher;
import org.hamcrest.StringDescription;

import com.googlecode.webdriver.WebDriver;
import com.googlecode.webdriver.WebElement;
import com.googlecode.webdriver.lift.find.Finder;
import com.googlecode.webdriver.lift.find.HtmlTagFinder;

/**
 * Base class for tests using the LiFT style API to driver WebDriver.
 * @author rchatley (Robert Chatley)
 *
 */
public abstract class HamcrestWebDriverTestCase extends TestCase {

	protected WebDriver driver = createDriver();

	protected abstract WebDriver createDriver();

	protected void clickOn(Finder<WebElement, WebDriver> finder) {
		Collection<WebElement> foundElements = finder.findFrom(driver);
		if (foundElements.isEmpty()) {
			fail("could not find element to click on");
		} else if (foundElements.size() > 1) {
			fail("did not know what to click on - ambiguous");
		} else {
			foundElements.iterator().next().click();
		}
	}

	protected void assertPresenceOf(Finder<WebElement, WebDriver> finder) {
		assertPresenceOf(atLeast(1), finder);
	}
	
	protected void assertPresenceOf(Matcher<Integer> cardinalityConstraint, Finder<WebElement, WebDriver> finder) {
		Collection<WebElement> foundElements = finder.findFrom(driver);
		if (!cardinalityConstraint.matches(foundElements.size())) {
			 Description description = new StringDescription();
	            description.appendText("\nExpected: ")
	                       .appendDescriptionOf(cardinalityConstraint)
	                       .appendText(" ")
	                       .appendDescriptionOf(finder)
	                       .appendText("\n     got: ")
	                       .appendValue(foundElements.size())
	                       .appendText(" ")
	                       .appendDescriptionOf(finder)
	                       .appendText("\n");
	            
	            throw new java.lang.AssertionError(description.toString());
		}
	}

	/**
	 * Cause the browser to navigate to the given URL
	 * @param url
	 */
	protected void goTo(String url) {
		  driver.get(url);
	}
	
	/**
	 * Type characters into an element of the page, typically an input field
	 * @param string - characters to type
	 * @param inputFinder - specification for the page element
	 */
	protected void type(String string, HtmlTagFinder inputFinder) {
		Collection<WebElement> inputFields = inputFinder.findFrom(driver);
		WebElement element = inputFields.iterator().next();
		element.sendKeys(string);
	}

	/**
	 * Syntactic sugar to use with {@link HamcrestWebDriverTestCase#type(String, HtmlTagFinder)},
	 * e.g. type("cheese", into(textbox()));
	 * The into() method simply returns its argument.
	 */
	protected HtmlTagFinder into(HtmlTagFinder input) {
		return input;
	}
}
