package com.thoughtworks.webdriver.lift;

import static com.thoughtworks.webdriver.lift.match.NumericalMatchers.*;

import java.util.Collection;

import org.hamcrest.Description;
import org.hamcrest.Matcher;
import org.hamcrest.StringDescription;

import com.thoughtworks.webdriver.WebDriver;
import com.thoughtworks.webdriver.WebElement;
import com.thoughtworks.webdriver.lift.find.Finder;

import junit.framework.TestCase;


public abstract class HamcrestWebDriverTestCase extends TestCase {

	protected WebDriver driver = createDriver();

	protected abstract WebDriver createDriver();

	protected void clickOn(Finder<WebElement, WebDriver> finder) {
		Collection<WebElement> foundElements = finder.findFrom(driver, exactly(1));
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
		Collection<WebElement> foundElements = finder.findFrom(driver, cardinalityConstraint);
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

	protected void goTo(String url) {
		  driver.get(url);
	}
}
