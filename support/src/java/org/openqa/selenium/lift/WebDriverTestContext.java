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

import org.hamcrest.Description;
import org.hamcrest.Matcher;
import org.hamcrest.StringDescription;
import org.openqa.selenium.RenderedWebElement;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.lift.find.Finder;
import org.openqa.selenium.support.ui.Clock;
import org.openqa.selenium.support.ui.SystemClock;

import static org.openqa.selenium.lift.match.NumericalMatchers.atLeast;

import java.util.Collection;

/**
 * Gives the context for a test, holds page state, and interacts with the {@link WebDriver}.
 * 
 * @author rchatley (Robert Chatley)
 *
 */
public class WebDriverTestContext implements TestContext {

	private WebDriver driver;
	private final Clock clock;

	public WebDriverTestContext(WebDriver driver) {
		this(driver, new SystemClock());
	}

	WebDriverTestContext(WebDriver driver, Clock clock) {
		this.driver = driver;
		this.clock = clock;
	}
	
	public void quit() {
		driver.quit();
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
	
	public void clickOnFirst(Finder<WebElement, WebDriver> finder) {
		WebElement element = findFirstElementTo("click on", finder);
		element.click();
	}	
	
  private WebElement findFirstElementTo(String action, Finder<WebElement, WebDriver> finder) {
    Collection<WebElement> foundElements = finder.findFrom(driver);
    if (foundElements.isEmpty()) {
      failWith("could not find element to " + action);
    } 
    
    return foundElements.iterator().next();
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

	public void waitFor(Finder<WebElement, WebDriver> finder, long timeoutMillis) {
		long timeoutTime = clock.now() + timeoutMillis;
		while (clock.now() < timeoutTime) {
			Collection<WebElement> result = finder.findFrom(driver);
			for (WebElement webElement : result) {
				if (((RenderedWebElement) webElement).isDisplayed()) {
					return; // found it
				}
			}
		}
		failWith("Element was not rendered within " + timeoutMillis + "ms");
	}

}
