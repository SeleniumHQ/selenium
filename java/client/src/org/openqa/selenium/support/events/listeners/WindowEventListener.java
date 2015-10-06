package org.openqa.selenium.support.events.listeners;

import org.openqa.selenium.Dimension;
import org.openqa.selenium.Point;
import org.openqa.selenium.WebDriver;

public interface WindowEventListener extends ListensToException {

	/**
	 * This action will be performed each time before
	 * {@link WebDriver.Window#setSize(Dimension)}
	 * 
	 * @param driver WebDriver
	 * @param window is the window whose size is going to be changed
	 * @param targetSize is the new size
	 */
	public void beforeWindowChangeSize(WebDriver driver, WebDriver.Window window,
			Dimension targetSize);

	/**
	 * This action will be performed each time after
	 * {@link WebDriver.Window#setSize(Dimension)}
	 * 
	 * @param driver WebDriver
	 * @param window is the window whose size has been changed
	 * @param targetSize is the new size
	 */
	public void afterWindowChangeSize(WebDriver driver, WebDriver.Window window,
			Dimension targetSize);

	/**
	 * This action will be performed each time before
	 * {@link WebDriver.Window#setPosition(org.openqa.selenium.Point)}
	 * 
	 * @param driver WebDriver
	 * @param window is the window whose position is going to be changed
	 * @param targetPoint is the new window coordinates
	 */
	public void beforeWindowIsMoved(WebDriver driver, WebDriver.Window window,
			Point targetPoint);

	/**
	 * This action will be performed each time after
	 * {@link WebDriver.Window#setPosition(org.openqa.selenium.Point)}
	 * 
	 * @param driver WebDriver
	 * @param window is the window whose position has been changed
	 * @param targetPoint is the new window coordinates
	 */
	public void afterWindowIsMoved(WebDriver driver, WebDriver.Window window,
			Point targetPoint);

	/**
	 * This action will be performed each time before {{@link WebDriver#close()}
	 * 
	 * @param driver WebDriver
	 */
	public void beforeWindowIsClosed(WebDriver driver);

	/**
	 * This action will be performed each time after {@link WebDriver#close()}
	 * 
	 * @param driver WebDriver
	 */
	public void afterWindowIsClosed(WebDriver driver);

}
