package com.googlecode.webdriver;

public class NoSuchFrameException extends RuntimeException {
    public NoSuchFrameException(String reason) {
        super(reason);
    }
}
