package com.thoughtworks.selenium;

/**
 * @author Aslak Helles&oslash;y
 * @version $Revision: 1.1 $
 */
public class SeleniumException extends RuntimeException {
    public SeleniumException(String message) {
        super(message);
    }

    public SeleniumException(Exception e) {
        super(e);
    }

    public SeleniumException(String message, Exception e) {
        super(message, e);
    }
}
