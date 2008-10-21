package org.openqa.selenium;

/**
 * @author Michael Tamm
 */
public class NoSuchWindowException extends RuntimeException {
    public NoSuchWindowException(String reason) {
        super(reason);
    }
}