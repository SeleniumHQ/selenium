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
package com.thoughtworks.selenium;

import edu.emory.mathcs.util.concurrent.Exchanger;

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
 * @version $Revision: 1.5 $
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
        System.out.println("Open a browser and point it to");
        System.out.println(initialUrl);
    }

    public void shutdown() {
        seleniumServer.shutdown();
    }
}
