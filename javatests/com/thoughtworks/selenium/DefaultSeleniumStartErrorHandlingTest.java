package com.thoughtworks.selenium;

import junit.framework.TestCase;

public class DefaultSeleniumStartErrorHandlingTest extends TestCase {

    public void testWrapsConnectionRefusedWithUserFriendlyExceptionMessage() {
        final FailOnStartCommandProcessor failOnStartCommandProcessor;

        failOnStartCommandProcessor = new FailOnStartCommandProcessor("Connection refused: connect");

        try {
            new DefaultSelenium(failOnStartCommandProcessor).start();
            fail("Did not catch RuntimeException as expected");
        } catch (RuntimeException expected) {
            assertTrue(-1 != expected.getMessage().indexOf("Could not contact Selenium Server; have you started it on '' ?"));
            assertTrue(-1 != expected.getMessage().indexOf("Connection refused: connect"));
        }
    }

    public void testShouldLeaveOtherExceptionAlone() {
        FailOnStartCommandProcessor failOnStartCommandProcessor;
        failOnStartCommandProcessor = new FailOnStartCommandProcessor("some crazy unexpected exception");

        try {
            new DefaultSelenium(failOnStartCommandProcessor).start();
            fail("Did not catch RuntimeException as expected");
        } catch (RuntimeException expected) {
            /* Catching RuntimeEception as expected */
            assertTrue(-1 != expected.getMessage().indexOf("Could not start Selenium session: "));
            assertTrue(-1 != expected.getMessage().indexOf("some crazy unexpected exception"));
        }
    }

    private static class FailOnStartCommandProcessor implements CommandProcessor {
        private final String message;

        FailOnStartCommandProcessor(String message) {
            this.message = message;
        }

        public void setExtensionJs(String extensionJs) {
            throw new UnsupportedOperationException();
        }
        
        public void start() {
            throw new SeleniumException(message);
        }
        
        public void start(String optionsString) {
            throw new UnsupportedOperationException();
        }

        public void start(Object optionsObject) {
            throw new UnsupportedOperationException();
        }

        public String getRemoteControlServerLocation() {
            return "";
        }

        public String doCommand(String command, String[] args) {
            throw new UnsupportedOperationException();
        }

        public boolean getBoolean(String string, String[] strings) {
            throw new UnsupportedOperationException();
        }

        public boolean[] getBooleanArray(String string, String[] strings) {
            throw new UnsupportedOperationException();
        }

        public Number getNumber(String string, String[] strings) {
            throw new UnsupportedOperationException();
        }

        public Number[] getNumberArray(String string, String[] strings) {
            throw new UnsupportedOperationException();
        }

        public String getString(String string, String[] strings) {
            throw new UnsupportedOperationException();
        }

        public String[] getStringArray(String string, String[] strings) {
            throw new UnsupportedOperationException();
        }

        public void stop() {
            throw new UnsupportedOperationException();
        }

    }
}