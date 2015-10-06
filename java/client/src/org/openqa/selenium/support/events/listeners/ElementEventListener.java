package org.openqa.selenium.support.events.listeners;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

public interface ElementEventListener extends ListensToException {
	/**
	 * Called before {@link WebElement#click WebElement.click()}.
	 * 
	 * @param driver WebDriver
	 * @param element the WebElement being used for the action
	 */
	void beforeClickOn(WebElement element, WebDriver driver);

	/**
	 * Called after {@link WebElement#click WebElement.click()}. Not called, if an
	 * exception is thrown.
	 * 
	 * @param driver WebDriver
	 * @param element the WebElement being used for the action
	 */
	void afterClickOn(WebElement element, WebDriver driver);

	/**
	 * Called before {@link WebElement#clear WebElement.clear()},
	 * {@link WebElement#sendKeys WebElement.sendKeys(...)}.
	 * 
	 * @param driver WebDriver
	 * @param element the WebElement being used for the action
	 */
	void beforeChangeValueOf(WebElement element, WebDriver driver);

	/**
	 * Called after {@link WebElement#clear WebElement.clear()},
	 * {@link WebElement#sendKeys WebElement.sendKeys(...)} . Not called, if an
	 * exception is thrown.
	 * 
	 * @param driver WebDriver
	 * @param element the WebElement being used for the action
	 */
	void afterChangeValueOf(WebElement element, WebDriver driver);
}
