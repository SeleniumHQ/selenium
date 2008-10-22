package org.openqa.selenium;

/**
 * Thrown by {@link WebDriver.TargetLocator#frame(int) WebDriver.switchTo().frame(int frameIndex)}
 * and {@link WebDriver.TargetLocator#frame(String) WebDriver.switchTo().frame(String frameName)}.  
 */
public class NoSuchFrameException extends NotFoundException {

    public NoSuchFrameException(String reason) {
        super(reason);
    }

}
