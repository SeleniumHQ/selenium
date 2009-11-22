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
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.containsString;
import org.jmock.Expectations;
import org.jmock.integration.junit3.MockObjectTestCase;
import org.openqa.selenium.RenderedWebElement;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.lift.find.Finder;
import org.openqa.selenium.support.ui.Clock;

import static org.openqa.selenium.lift.match.NumericalMatchers.atLeast;

import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;

/**
 * Unit test for {@link WebDriverTestContext}.
 * 
 * @author rchatley (Robert Chatley)
 *
 */
public class WebDriverTestContextTest extends MockObjectTestCase {

	WebDriver webdriver = mock(WebDriver.class);
	TestContext context = new WebDriverTestContext(webdriver);
	RenderedWebElement element = mock(RenderedWebElement.class);
	Finder<WebElement, WebDriver> finder = mockFinder();
	Clock clock = mock(Clock.class);
	
	public void testIsCreatedWithAWebDriverImplementation() throws Exception {
		new WebDriverTestContext(webdriver);
	}
	
	public void testCanNavigateToAGivenUrl() throws Exception {

		final String url = "http://www.example.com";
		
		checking(new Expectations() {{ 
			one(webdriver).get(url);
		}});
		
		context.goTo(url);
	}
	
	public void testCanAssertPresenceOfWebElements() throws Exception {
		
		checking(new Expectations() {{ 
			one(finder).findFrom(webdriver); will(returnValue(oneElement()));
		}});
		
		context.assertPresenceOf(finder);
	}
	
	public void testCanCheckQuantitiesOfWebElementsAndThrowsExceptionOnMismatch() throws Exception {
		
		checking(new Expectations() {{ 
			allowing(finder).findFrom(webdriver); will(returnValue(oneElement()));
			exactly(2).of(finder).describeTo(with(any(Description.class))); // in producing the error msg
		}});
		
		try {
			context.assertPresenceOf(atLeast(2), finder);
			fail("should have failed as only one element found");
		} catch (AssertionError error) {
			// expected
			assertThat(error.getMessage(), containsString("a value greater than <1>"));
		}
	}
	
	public void testCanDirectTextInputToSpecificElements() throws Exception {
		 
		final String inputText = "test";
		
		checking(new Expectations() {{ 
			one(finder).findFrom(webdriver); will(returnValue(oneElement()));
			one(element).sendKeys(inputText);
		}});
		
		context.type(inputText, finder);
	}
	
	public void testCanTriggerClicksOnSpecificElements() throws Exception {
		 
		checking(new Expectations() {{ 
			one(finder).findFrom(webdriver); will(returnValue(oneElement()));
			one(element).click();
		}});
		
		context.clickOn(finder);
	}
	
	public void testThrowsAnExceptionIfTheFinderReturnsAmbiguousResults() throws Exception {
		 
		checking(new Expectations() {{ 
			one(finder).findFrom(webdriver); will(returnValue(twoElements()));
		}});
		
		try {
			context.clickOn(finder);
			fail("should have failed as more than one element found");
		} catch (AssertionError error) {
			// expected
			assertThat(error.getMessage(), containsString("did not know what to click on"));
		}
	}
	
	public void testSupportsWaitingForElementToAppear() throws Exception {
		
		context = new WebDriverTestContext(webdriver, clock);
		
		int timeout = 1000;
		
		checking(new Expectations() {{ 
			allowing(clock).now(); will(returnValue(2000L));
			one(finder).findFrom(webdriver); will(returnValue(oneElement()));
			one(element).isDisplayed(); will(returnValue(true));
		}});
		
		context.waitFor(finder, timeout);
	}
	
	public void testSupportsWaitingForElementToAppearWithTimeout() throws Exception {
		
		context = new WebDriverTestContext(webdriver, clock);
		
		int timeout = 1000;
		
		checking(new Expectations() {{ 
			allowing(clock).now(); will(returnValue(2000L));
			exactly(2).of(finder).findFrom(webdriver); will(returnValue(oneElement()));
			exactly(2).of(element).isDisplayed(); will(onConsecutiveCalls(returnValue(false), returnValue(true)));
		}});
		
		context.waitFor(finder, timeout);
	}
	
	public void testFailsAssertionIfElementNotDisplayedBeforeTimeout() throws Exception {
		
		context = new WebDriverTestContext(webdriver, clock);
		
		int timeout = 1000;
		
		checking(new Expectations() {{ 
			exactly(3).of(clock).now(); will(onConsecutiveCalls(returnValue(2000L), returnValue(2001L), returnValue(3000L)));
			one(finder).findFrom(webdriver); will(returnValue(oneElement()));
			one(element).isDisplayed(); will(returnValue(false));
		}});
		
		try {
			context.waitFor(finder, timeout);
			fail("should have failed as element not displayed before timeout");
		} catch (AssertionError error) {
			// expected
			assertThat(error.getMessage(), containsString("Element was not rendered within 1000ms"));
		}
	}
	
	@SuppressWarnings("unchecked")
	Finder<WebElement, WebDriver> mockFinder() {
		return mock(Finder.class);
	}
	
	private Collection<? extends WebElement> oneElement() {
		return Collections.singleton(element);
	}
	
	private Collection<WebElement> twoElements() {
		return Arrays.asList(new WebElement[] {element, element});
	}
}
