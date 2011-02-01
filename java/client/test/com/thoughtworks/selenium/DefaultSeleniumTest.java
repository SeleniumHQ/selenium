package com.thoughtworks.selenium;

import junit.framework.TestCase;

public class DefaultSeleniumTest extends TestCase {

    private static final String prefix = "setContext,com.thoughtworks.selenium.DefaultSeleniumTest: ";

    public void testBannerSimple() throws Throwable {
        MyCommandProcessor cp = new MyCommandProcessor();
        DefaultSelenium selenium = new DefaultSelenium(cp);
		selenium.showContextualBanner();
        assertEquals(prefix + "test Banner Simple\n", cp.commands.toString());
    }

    public void testMoreComplexExample() throws Throwable {
        MyCommandProcessor cp = new MyCommandProcessor();
        DefaultSelenium selenium = new DefaultSelenium(cp);
		selenium.showContextualBanner();
        assertEquals(prefix + "test More Complex Example\n", cp.commands.toString());
    }

    public void testEvenMOREComplexExample() throws Throwable {
        MyCommandProcessor cp = new MyCommandProcessor();
        DefaultSelenium selenium = new DefaultSelenium(cp);
		selenium.showContextualBanner();
        assertEquals(prefix + "test Even MORE Complex Example\n", cp.commands.toString());
    }


    private static class MyCommandProcessor implements CommandProcessor {
        StringBuilder commands = new StringBuilder();

        public String getRemoteControlServerLocation() {
            return "";
        }

        public String doCommand(String command, String[] args) {
            commands.append(command);
            for (int i = 0; i < args.length; i++) {
                String arg = args[i];
                commands.append(",").append(arg);
            }
            commands.append("\n");
            return null;
        }

        public void setExtensionJs(String extensionJs) {
        }

        
        public void start() {
        }
        
        public void start(String optionsString) {
        }
        
        public void start(Object optionsObject) {
        }

        public void stop() {
        }

        public String getString(String string, String[] strings) {
            return null;
        }

        public String[] getStringArray(String string, String[] strings) {
            return new String[0];
        }

        public Number getNumber(String string, String[] strings) {
            return null;
        }

        public Number[] getNumberArray(String string, String[] strings) {
            return new Number[0];
        }

        public boolean getBoolean(String string, String[] strings) {
            return false;
        }

        public boolean[] getBooleanArray(String string, String[] strings) {
                    return new boolean[0];
                }
    }
}
