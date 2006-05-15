/*
 * Copyright 2006 ThoughtWorks, Inc.
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
package org.openqa.selenium.server.browserlaunchers;

import java.net.*;
import java.util.regex.*;

import org.openqa.selenium.server.*;

public class BrowserLauncherFactory {

    private static final Pattern FIREFOX_PATTERN = Pattern.compile("^\\*firefox( .*)?$");
    private static final Pattern IEXPLORE_PATTERN = Pattern.compile("^\\*iexplore( .*)?$");
    private static final Pattern SAFARI_PATTERN = Pattern.compile("^\\*safari( .*)?$");
    private static final Pattern HTA_PATTERN = Pattern.compile("^\\*iehta( .*)?$");
    SeleniumServer server;
    
    public BrowserLauncherFactory(SeleniumServer server) {
        this.server = server;
    }
    
    public BrowserLauncher getBrowserLauncher(String browser, String sessionId) {
        if (browser == null) throw new IllegalArgumentException("browser may not be null");
        BrowserLauncher launcher;
        Matcher FirefoxMatcher = FIREFOX_PATTERN.matcher(browser);
        Matcher IExploreMatcher = IEXPLORE_PATTERN.matcher(browser);
        Matcher SafariMatcher = SAFARI_PATTERN.matcher(browser);
        Matcher HTAMatcher = HTA_PATTERN.matcher(browser);
        if (FirefoxMatcher.find()) {
            if (browser.equals("*firefox")) {
                launcher = new FirefoxCustomProfileLauncher(server.getPort(), sessionId);
            } else {
                String browserStartCommand = FirefoxMatcher.group(1).substring(1);
                launcher = new FirefoxCustomProfileLauncher(server.getPort(), sessionId, browserStartCommand);
            }
        } else if (IExploreMatcher.find()) {
            if (browser.equals("*iexplore")) {
                launcher = new InternetExplorerCustomProxyLauncher(server.getPort(), sessionId);
            } else {
                String browserStartCommand = IExploreMatcher.group(1).substring(1);
                launcher = new InternetExplorerCustomProxyLauncher(server.getPort(), sessionId, browserStartCommand);
            }
        } else if (SafariMatcher.find()) {
            if (browser.equals("*safari")) {
                launcher = new SafariCustomProfileLauncher(server.getPort(), sessionId);
            } else {
                String browserStartCommand = SafariMatcher.group(1).substring(1);
                launcher = new SafariCustomProfileLauncher(server.getPort(), sessionId, browserStartCommand);
            }
        } else if (HTAMatcher.find()) {
            if (browser.equals("*iehta")) {
                launcher = new HTABrowserLauncher(server.getPort(), sessionId);
            } else {
                String browserStartCommand = HTAMatcher.group(1).substring(1);
                launcher = new HTABrowserLauncher(server.getPort(), sessionId, browserStartCommand);
            }
        } else {
            launcher = new DestroyableRuntimeExecutingBrowserLauncher(browser);
            //launcher = new ManualPromptUserLauncher();
        }
        return launcher;
    }
    
    /** Strips the specified URL so it only includes a protocal, hostname and port 
     * @throws MalformedURLException */
    public static String stripStartURL(String url) throws MalformedURLException {
        URL u = new URL(url);
        return u.getProtocol() + "://" + u.getAuthority();
    }
}
