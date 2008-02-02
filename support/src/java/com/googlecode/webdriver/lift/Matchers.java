// Generated source.
package com.googlecode.webdriver.lift;

public class Matchers {

  public static org.hamcrest.Matcher<com.googlecode.webdriver.WebElement> attribute(java.lang.String attributeName, org.hamcrest.Matcher<java.lang.String> valueMatcher) {
    return com.googlecode.webdriver.lift.match.AttributeMatcher.attribute(attributeName, valueMatcher);
  }

  public static org.hamcrest.Matcher<java.lang.Integer> atLeast(int count) {
    return com.googlecode.webdriver.lift.match.NumericalMatchers.atLeast(count);
  }

  public static org.hamcrest.Matcher<java.lang.Integer> exactly(int count) {
    return com.googlecode.webdriver.lift.match.NumericalMatchers.exactly(count);
  }

  public static org.hamcrest.Matcher<com.googlecode.webdriver.WebElement> text(org.hamcrest.Matcher<java.lang.String> textMatcher) {
    return com.googlecode.webdriver.lift.match.TextMatcher.text(textMatcher);
  }

}
