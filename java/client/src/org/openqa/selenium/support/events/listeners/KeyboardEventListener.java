package org.openqa.selenium.support.events.listeners;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.interactions.Keyboard;

public interface KeyboardEventListener extends ListensToException {

	/**
	 * This action will be performed each time before
	 * {@link Keyboard#sendKeys(CharSequence...)}
	 * 
	 * @param driver WebDriver
	 * @param keysToSend Keys which are being sent
	 */
	void beforeSendKeys(WebDriver driver, CharSequence... keysToSend);

	/**
	 * This action will be performed each time after
	 * {@link Keyboard#sendKeys(CharSequence...)}
	 * 
	 * @param driver WebDriver
	 * @param keysToSend Keys which have been sent
	 */
	void afterSendKeys(WebDriver driver, CharSequence... keysToSend);

	/**
	 * This action will be performed each time before
	 * {@link Keyboard#pressKey(CharSequence)}
	 * 
	 * @param driver WebDriver
	 * @param keyToPress Keys which are being pressed
	 */
	void beforePressdKey(WebDriver driver, CharSequence... keyToPress);

	/**
	 * This action will be performed each time after
	 * {@link Keyboard#pressKey(CharSequence)}
	 * 
	 * @param driver WebDriver
	 * @param keyToPress Keys which have been pressed
	 */
	void afterPressKey(WebDriver driver, CharSequence... keyToPress);

	/**
	 * This action will be performed each time before
	 * {@link Keyboard#releaseKey(CharSequence)}
	 * 
	 * @param driver WebDriver
	 * @param keyToRelease Keys which are being released
	 */
	void beforeReleaseKey(WebDriver driver, CharSequence... keyToRelease);

	/**
	 * This action will be performed each time after
	 * {@link Keyboard#releaseKey(CharSequence)}
	 * 
	 * @param driver WebDriver
	 * @param keyToRelease Keys which have been released
	 */
	void afterReleaseKey(WebDriver driver, CharSequence... keyToRelease);
}
