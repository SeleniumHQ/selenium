// Generated source.
package com.googlecode.webdriver.lift;

public class Matchers {

  public static org.hamcrest.Matcher<com.googlecode.webdriver.WebElement> attribute(java.lang.String param1, org.hamcrest.Matcher<java.lang.String> param2) {
    return com.googlecode.webdriver.lift.match.AttributeMatcher.attribute(param1, param2);
  }

  public static org.hamcrest.Matcher<java.lang.Integer> atLeast(int param1) {
    return com.googlecode.webdriver.lift.match.NumericalMatchers.atLeast(param1);
  }

  public static org.hamcrest.Matcher<java.lang.Integer> exactly(int param1) {
    return com.googlecode.webdriver.lift.match.NumericalMatchers.exactly(param1);
  }

  public static org.hamcrest.Matcher<com.googlecode.webdriver.WebElement> text(org.hamcrest.Matcher<java.lang.String> param1) {
    return com.googlecode.webdriver.lift.match.TextMatcher.text(param1);
  }

}
