/*
 * Copyright 2004 ThoughtWorks, Inc.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */
package com.thoughtworks.selenium.utils;

import java.text.MessageFormat;

/**
 * Helper class to allow evaluation of state via assertions. If an assertion fails then an {@link IllegalStateException}
 * will be thrown, with a specified error message.
 * @version $Id: Assert.java,v 1.3 2004/11/15 18:35:01 ahelleso Exp $
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
