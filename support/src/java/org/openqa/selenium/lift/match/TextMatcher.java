package org.openqa.selenium.lift.match;

import org.hamcrest.Description;
import org.hamcrest.Factory;
import org.hamcrest.Matcher;
import org.hamcrest.TypeSafeMatcher;

import org.openqa.selenium.WebElement;

/**
 * {@link Matcher} for matching text content within {@link WebElement}s.
 * @author rchatley (Robert Chatley)
 *
 */
public class TextMatcher extends TypeSafeMatcher<WebElement> {
	
	private final Matcher<String> matcher;

	TextMatcher(Matcher<String> matcher) {
		this.matcher = matcher;
	}

	@Override
	public boolean matchesSafely(WebElement item) {
		return matcher.matches(item.getText());
	}

	public void describeTo(Description description) {
		description.appendText("text ");
		matcher.describeTo(description);
	}
	
	@Factory
	public static Matcher<WebElement> text(final Matcher<String> textMatcher) {
		return new TextMatcher(textMatcher);
	}
}