package org.openqa.selenium.support.events.listeners;

import org.openqa.selenium.WebDriver;

public interface ListensToException {
	/**
	 * Called whenever an exception would be thrown.
	 * @param throwable the exception that will be thrown
	 * @param driver WebDriver
	 */
	void onException(Throwable throwable, WebDriver driver);
}
