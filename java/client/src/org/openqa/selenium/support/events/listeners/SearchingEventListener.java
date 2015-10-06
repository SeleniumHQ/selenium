package org.openqa.selenium.support.events.listeners;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

public interface SearchingEventListener extends ListensToException {
	/**
	 * Called before {@link WebDriver#findElement WebDriver.findElement(...)}, or
	 * {@link WebDriver#findElements WebDriver.findElements(...)}, or
	 * {@link WebElement#findElement WebElement.findElement(...)}, or
	 * {@link WebElement#findElement WebElement.findElements(...)}.
	 *
	 * @param element will be <code>null</code>, if a find method of <code>WebDriver</code> is called.
	 * @param by locator being used
	 * @param driver WebDriver
	 */
	void beforeFindBy(By by, WebElement element, WebDriver driver);

	/**
	 * Called after {@link WebDriver#findElement WebDriver.findElement(...)}, or
	 * {@link WebDriver#findElements WebDriver.findElements(...)}, or
	 * {@link WebElement#findElement WebElement.findElement(...)}, or
	 * {@link WebElement#findElement WebElement.findElements(...)}.
	 *
	 * @param element will be <code>null</code>, if a find method of <code>WebDriver</code> is called.
	 * @param by locator being used
	 * @param driver WebDriver
	 */
	void afterFindBy(By by, WebElement element, WebDriver driver);
}
