package org.openqa.selenium;

/**
 * Thrown by {@link WebDriver.TargetLocator#window(String) WebDriver.switchTo().window(String windowName)}.
 */
public class NoSuchWindowException extends NotFoundException {

    public NoSuchWindowException(String reason) {
        super(reason);
    }

}