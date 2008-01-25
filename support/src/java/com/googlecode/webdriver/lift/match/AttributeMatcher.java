/**
 * 
 */
package com.googlecode.webdriver.lift.match;

import org.hamcrest.Description;
import org.hamcrest.Factory;
import org.hamcrest.Matcher;
import org.hamcrest.TypeSafeMatcher;

import com.googlecode.webdriver.WebElement;

public class AttributeMatcher extends TypeSafeMatcher<WebElement> {
	
	private final Matcher<String> matcher;
	private final String name;

	AttributeMatcher(String name, Matcher<String> matcher) {
		this.name = name;
		this.matcher = matcher;
	}

	@Override
	public boolean matchesSafely(WebElement item) {
		return matcher.matches(item.getAttribute(name));
	}

	public void describeTo(Description description) {
		description.appendText("text ");
		matcher.describeTo(description);
	}
	
	@Factory
	public static Matcher<WebElement> attribute(final String name, final Matcher<String> valueMatcher) {
		return new AttributeMatcher(name, valueMatcher);
	}
}