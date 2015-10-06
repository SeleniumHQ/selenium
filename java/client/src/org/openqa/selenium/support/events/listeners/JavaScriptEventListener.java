package org.openqa.selenium.support.events.listeners;

import org.openqa.selenium.WebDriver;

public interface JavaScriptEventListener extends ListensToException {
	/**
	 * Called before {@link org.openqa.selenium.remote.RemoteWebDriver#executeScript(java.lang.String, java.lang.Object[]) }
	 * 
	 * @param driver WebDriver
	 * @param script the script to be executed
	 */
	void beforeScript(String script, WebDriver driver);

	/**
	 * Called after {@link org.openqa.selenium.remote.RemoteWebDriver#executeScript(java.lang.String, java.lang.Object[]) }.
	 * Not called if an exception is thrown
	 * 
	 * @param driver WebDriver
	 * @param script the script that was executed
	 */
	void afterScript(String script, WebDriver driver);
}
