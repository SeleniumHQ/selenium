package org.openqa.selenium.lift;

import static org.openqa.selenium.lift.match.NumericalMatchers.atLeast;

import java.util.Collection;

import org.hamcrest.Description;
import org.hamcrest.Matcher;
import org.hamcrest.StringDescription;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.lift.find.Finder;

/**
 * Gives the context for a test, holds page state, and interacts with the {@link WebDriver}.
 * 
 * @author rchatley (Robert Chatley)
 *
 */
public class WebDriverTestContext implements TestContext {

	private WebDriver driver;

	public WebDriverTestContext(WebDriver driver) {
		this.driver = driver;
	}

	public void goTo(String url) {
		driver.get(url);
	}

	public void assertPresenceOf(Finder<WebElement, WebDriver> finder) {
		assertPresenceOf(atLeast(1), finder);
	}

	public void assertPresenceOf(Matcher<Integer> cardinalityConstraint, Finder<WebElement, WebDriver> finder) {
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
	            
	            failWith(description.toString());
		}
	}

	public void type(String input, Finder<WebElement, WebDriver> finder) {
		WebElement element = findOneElementTo("type into", finder);
		element.sendKeys(input);
	}

	public void clickOn(Finder<WebElement, WebDriver> finder) {
		WebElement element = findOneElementTo("click on", finder);
		element.click();
	}	
	
	private WebElement findOneElementTo(String action, Finder<WebElement, WebDriver> finder) {
		Collection<WebElement> foundElements = finder.findFrom(driver);
		if (foundElements.isEmpty()) {
			failWith("could not find element to " + action);
		} else if (foundElements.size() > 1) {
			failWith("did not know what to " + action + " - ambiguous");
		} 
		
		return foundElements.iterator().next();
	}

	private void failWith(String message) throws AssertionError {
		throw new java.lang.AssertionError(message);
	}

}
