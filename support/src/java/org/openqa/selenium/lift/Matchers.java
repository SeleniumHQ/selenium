// Generated source.
package org.openqa.selenium.lift;

public class Matchers {

  public static org.hamcrest.Matcher<org.openqa.selenium.WebElement> attribute(java.lang.String attributeName, org.hamcrest.Matcher<java.lang.String> valueMatcher) {
    return org.openqa.selenium.lift.match.AttributeMatcher.attribute(attributeName, valueMatcher);
  }

  public static org.hamcrest.Matcher<java.lang.Integer> atLeast(int count) {
    return org.openqa.selenium.lift.match.NumericalMatchers.atLeast(count);
  }

  public static org.hamcrest.Matcher<java.lang.Integer> exactly(int count) {
    return org.openqa.selenium.lift.match.NumericalMatchers.exactly(count);
  }

  public static org.hamcrest.Matcher<org.openqa.selenium.WebElement> text(org.hamcrest.Matcher<java.lang.String> textMatcher) {
    return org.openqa.selenium.lift.match.TextMatcher.text(textMatcher);
  }

}
