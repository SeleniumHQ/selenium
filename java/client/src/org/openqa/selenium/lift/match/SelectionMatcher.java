package org.openqa.selenium.lift.match;

import org.openqa.selenium.WebElement;

import org.hamcrest.Description;
import org.hamcrest.Factory;
import org.hamcrest.Matcher;
import org.hamcrest.TypeSafeMatcher;

/**
 * Matcher to match a selected element (e.g. a radio button).
 */
public class SelectionMatcher extends TypeSafeMatcher<WebElement> {

  @Override
  public boolean matchesSafely(WebElement item) {
    return item.isSelected();
  }

  public void describeTo(Description description) {
    description.appendText("should be selected");
  }

  @Factory
  public static Matcher<WebElement> selection() {
    return new SelectionMatcher();
  }
}
