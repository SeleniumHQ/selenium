package com.thoughtworks.selenium.utils;

import java.text.MessageFormat;

/**
 * Helper class to allow evaluation of state via assertions. If an assertion fails then an {@link IllegalStateException}
 * will be thrown, with a specified error message.
 * @version $Id: Assert.java,v 1.1 2004/11/11 12:19:48 mikemelia Exp $
 */
public final class Assert {
    /**
     * Private constructor to prevent instantiation of this class.
     */
    private Assert() {
        throw new UnsupportedOperationException();
    }

    /**
     * Checks if the specified condition is true and throws an IllegalStateException if not.
     * @param condition boolean statement to evaluate
     * @param msg the error message to display if the assertion proves to be invalid
     */
    public static void assertIsTrue(boolean condition, String msg) {
        assertIsTrue(condition, "{0}", new Object[] {msg});
    }

    /**
     * Checks if the specified condition is true and throws an IllegalStateException if not.
     * @param condition boolean statement to evaluate
     * @param format the error message to display if the assertion proves to be invalid.
     * @param parameter the parameter to the error message
     */
    public static void assertIsTrue(boolean condition, String format, Object parameter) {
        assertIsTrue(condition, format, new Object[] {parameter});
    }

    /**
     * Checks if the specified condition is true and throws an IllegalStateException if not.
     * @param condition boolean statement to evaluate
     * @param format the error message to display if the assertion proves to be invalid.
     * @param parameters the parameters to the error message
     */
    public static void assertIsTrue(boolean condition, String format, Object[] parameters) {
        if (!condition) {
            throw new IllegalStateException(MessageFormat.format(format, parameters));
        }
    }
}
