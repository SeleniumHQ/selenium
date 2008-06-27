package org.openqa.selenium.lift;

import org.hamcrest.Matcher;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.lift.find.Finder;

/**
 * Interface for objects that provide a context (maintaining any state) for web tests.
 * @author rchatley (Robert Chatley)
 *
 */
public interface TestContext {

	public abstract void goTo(String url);

	public abstract void assertPresenceOf(Finder<WebElement, WebDriver> finder);

	public abstract void assertPresenceOf(
			Matcher<Integer> cardinalityConstraint,
			Finder<WebElement, WebDriver> finder);

	public abstract void type(String input, Finder<WebElement, WebDriver> finder);

	public abstract void clickOn(Finder<WebElement, WebDriver> finder);

}