package org.openqa.selenium;

public class NoSuchFrameException extends RuntimeException {
    public NoSuchFrameException(String reason) {
        super(reason);
    }
}
