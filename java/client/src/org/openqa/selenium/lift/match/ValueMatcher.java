package org.openqa.selenium.lift.match;

import org.hamcrest.Description;
import org.hamcrest.Factory;
import org.hamcrest.Matcher;
import org.hamcrest.TypeSafeMatcher;
import org.openqa.selenium.WebElement;

/**
 * Matches the value of an element, for example an input field.
 *
 * @author rchatley (Robert Chatley)
 */
public class ValueMatcher extends TypeSafeMatcher<WebElement> {

  private final Object value;

  public ValueMatcher(Object value) {
    this.value = value;
  }

  @Override
  public boolean matchesSafely(WebElement item) {
    return item.getAttribute("value").equals(value);
  }

  public void describeTo(Description description) {
    description.appendText("should have value ").appendValue(value);
  }

  @Factory
  public static Matcher<WebElement> value(final Object value) {
    return new ValueMatcher(value);
  }
}
