package com.thoughtworks.selenium;

import edu.emory.mathcs.util.concurrent.Exchanger;

import java.io.IOException;

/**
 * This is the class that is used to start a Selenium session with a browser.
 * Intended usage:
 * <pre>
 * Browser browser = new Selenium("firefox").getBrowser();
 * browser.open("http://www.google.com/");
 * browser.verifyTextPresent("I'm feeling lucky");
 * </pre>
 * There is no direct JUnit integration, but you can use this class from a JUnit test.
 * @author Aslak Helles&oslash;y
 * @version $Revision: 1.1 $
 */
public class Selenium {
    private final String browserName;
    private final String initialUrl;
    private Browser browser;
    private SeleniumServer seleniumServer;

    public Selenium(String browserName, String initialUrl) {
        this.browserName = browserName;
        this.initialUrl = initialUrl;
        Exchanger wikiCommandExchanger = new Exchanger();
        Exchanger resultExchanger = new Exchanger();
        seleniumServer = new TjwsSeleniumServer(wikiCommandExchanger, resultExchanger);
        seleniumServer.start();
        WikiCommandGenerator wikiCommandGenerator = new WikiCommandGenerator(new ExchangerExecutor(wikiCommandExchanger, resultExchanger));
        browser = (Browser) wikiCommandGenerator.proxy(Browser.class);
    }

    public Browser getBrowser() {
        launchBrowserWindow();
        return browser;
    }

    private void launchBrowserWindow() {
        com.Ostermiller.util.Browser.exec = new String[]{browserName};
        com.Ostermiller.util.Browser.init();
        try {
            com.Ostermiller.util.Browser.displayURL(initialUrl);
        } catch (IOException e) {
            throw new SeleniumException("Couldn't launch " + browserName + ". Make sure it is on your PATH", e);
        }
    }

    public void shutdown() {
        seleniumServer.shutdown();
    }
}
