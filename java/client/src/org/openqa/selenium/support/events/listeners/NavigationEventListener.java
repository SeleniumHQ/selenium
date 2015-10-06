package org.openqa.selenium.support.events.listeners;

import org.openqa.selenium.WebDriver;

public interface NavigationEventListener extends ListensToException {

	/**
	 * Called before {@link org.openqa.selenium.WebDriver#get get(String url)}
	 * respectively {@link org.openqa.selenium.WebDriver.Navigation#to
	 * navigate().to(String url)}.
	 * 
	 * @param url URL
	 * @param driver WebDriver
	 */
	void beforeNavigateTo(String url, WebDriver driver);

	/**
	 * Called after {@link org.openqa.selenium.WebDriver#get get(String url)}
	 * respectively {@link org.openqa.selenium.WebDriver.Navigation#to
	 * navigate().to(String url)}. Not called, if an exception is thrown.
	 * 
	 * @param url URL
	 * @param driver WebDriver
	 */
	void afterNavigateTo(String url, WebDriver driver);

	/**
	 * Called before {@link org.openqa.selenium.WebDriver.Navigation#back
	 * navigate().back()}.
	 * 
	 * @param driver WebDriver
	 */
	void beforeNavigateBack(WebDriver driver);

	/**
	 * Called after {@link org.openqa.selenium.WebDriver.Navigation
	 * navigate().back()}. Not called, if an exception is thrown.
	 * 
	 * @param driver WebDriver
	 */
	void afterNavigateBack(WebDriver driver);

	/**
	 * Called before {@link org.openqa.selenium.WebDriver.Navigation#forward
	 * navigate().forward()}.
	 * 
	 * @param driver WebDriver
	 */
	void beforeNavigateForward(WebDriver driver);

	/**
	 * Called after {@link org.openqa.selenium.WebDriver.Navigation#forward
	 * navigate().forward()}. Not called, if an exception is thrown.
	 * 
	 * @param driver WebDriver
	 */
	void afterNavigateForward(WebDriver driver);

}
