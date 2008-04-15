package com.thoughtworks.selenium;

import junit.framework.TestCase;

/**
 * {@link com.thoughtworks.selenium.HttpCommandProcessor} unit test class.
 */
public class HttpCommandProcessorUnitTest extends TestCase {

    public void testCanStopTheSeleneseSessionEvenIfThereIsNoCurrentSession() {
        final HttpCommandProcessor processor;

        processor = new HttpCommandProcessor("a Server", 1234, "", "a url");
        processor.stop();
    }

    public void testCanStopTheSeleneseSessionWhenASessionIsInProgress() {
        final HttpCommandProcessor processor;

        processor = new HttpCommandProcessor("a Server", 1234, "", "a url") {
            public String doCommand(String commandName, String[] args) {
                assertEquals("testComplete", commandName);
                assertNull(args);
                return null;
            }
        };
        processor.setSessionInProgress("123456789");
        processor.stop();
    }

}
