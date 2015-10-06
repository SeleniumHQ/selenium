package org.openqa.selenium.support.events.listeners;

import org.openqa.selenium.Alert;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.security.Credentials;

public interface AlertEventListener extends ListensToException {
	/**
	 * This action will be performed each time before {@link Alert#accept()}
	 * 
	 * @param driver WebDriver
	 * @param alert {@link Alert} which is being accepted
	 */
	public void beforeAlertAccept(WebDriver driver, Alert alert);

	/**
	 * This action will be performed each time after {@link Alert#accept()}
	 * 
	 * @param driver WebDriver
	 * @param alert {@link Alert} which has been accepted
	 */
	public void afterAlertAccept(WebDriver driver, Alert alert);

	/**
	 * This action will be performed each time before {@link Alert#dismiss()}
	 * 
	 * @param driver WebDriver
	 * @param alert {@link Alert} which which is being dismissed
	 */
	public void afterAlertDismiss(WebDriver driver, Alert alert);

	/**
	 * This action will be performed each time after {@link Alert#dismiss()}
	 * 
	 * @param driver WebDriver
	 * @param alert {@link Alert} which has been dismissed
	 */
	public void beforeAlertDismiss(WebDriver driver, Alert alert);

	/**
	 * This action will be performed each time before
	 * {@link Alert#sendKeys(String)}
	 * 
	 * @param driver WebDriver
	 * @param alert {@link Alert} which is receiving keys
	 * @param keys Keys which are being sent
	 */
	public void beforeAlertSendKeys(WebDriver driver, Alert alert, String keys);

	/**
	 * This action will be performed each time after
	 * {@link Alert#sendKeys(String)}
	 * 
	 * @param driver WebDriver
	 * @param alert {@link Alert} which has received keys
	 * @param keys Keys which have been sent
	 */
	public void afterAlertSendKeys(WebDriver driver, Alert alert, String keys);

	/**
	 * This action will be performed each time before
	 * {@link Alert#setCredentials(Credentials)} and
	 * {@link Alert#authenticateUsing(Credentials)}
	 * 
	 * @param driver WebDriver
	 * @param alert {@link Alert} which is receiving user credentials
	 * @param crdentials which are being sent
	 */
	public void beforeAuthentication(WebDriver driver, Alert alert,
			Credentials credentials);

	/**
	 * This action will be performed each time after
	 * {@link Alert#setCredentials(Credentials)} and
	 * {@link Alert#authenticateUsing(Credentials)}
	 * 
	 * @param driver WebDriver
	 * @param alert {@link Alert} which has received user credentials
	 * @param crdentials which have been sent
	 */
	public void afterAuthentication(WebDriver driver, Alert alert,
			Credentials credentials);
}
