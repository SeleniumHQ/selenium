package com.thoughtworks.webdriver;

public class NoSuchFrameException extends RuntimeException {
    public NoSuchFrameException(String reason) {
        super(reason);
    }
}
