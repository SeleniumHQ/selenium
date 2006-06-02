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

import org.openqa.selenium.server.SeleneseQueue;
import org.openqa.selenium.server.SeleniumServer;

import java.lang.reflect.Constructor;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Returns BrowserLaunchers based on simple strings given by the user
 *  
 * 
 *  @author danielf
 *
 */
public class BrowserLauncherFactory {

    private static final Pattern CUSTOM_PATTERN = Pattern.compile("^\\*custom( .*)?$");
    
    private static final Map supportedBrowsers = new HashMap();

    static {
        supportedBrowsers.put("firefox", FirefoxCustomProfileLauncher.class);
        supportedBrowsers.put("iexplore", InternetExplorerCustomProxyLauncher.class);
        supportedBrowsers.put("safari", SafariCustomProfileLauncher.class);
        supportedBrowsers.put("iehta", HTABrowserLauncher.class);
        supportedBrowsers.put("chrome", FirefoxChromeLauncher.class);
        supportedBrowsers.put("opera", OperaCustomProfileLauncher.class);
    }
    
    SeleniumServer server;
    
    public BrowserLauncherFactory(SeleniumServer server) {
        this.server = server;
    }
    
    /** Returns the browser given by the specified browser string
     * 
     * @param browser a browser string like "*firefox"
     * @param sessionId the sessionId to launch
     * @param queue
     * @return the BrowserLauncher ready to launch
     */
    public BrowserLauncher getBrowserLauncher(String browser, String sessionId, SeleneseQueue queue) {
        if (browser == null) throw new IllegalArgumentException("browser may not be null");

        for (Iterator iterator = supportedBrowsers.entrySet().iterator(); iterator.hasNext();) {
            Map.Entry entry = (Map.Entry) iterator.next();
            String name = (String) entry.getKey();
            Class c = (Class) entry.getValue();
            Pattern pat = Pattern.compile("^\\*" + name + "( .*)?$");
            Matcher mat = pat.matcher(browser);
            if (mat.find()) {
                String browserStartCommand;
                if (browser.equals("*" + name)) {
                    browserStartCommand = null;
                } else {
                    browserStartCommand = mat.group(1).substring(1);
                }
                return createBrowserLauncher(c, browserStartCommand, sessionId, queue);
            }
        }
        Matcher CustomMatcher = CUSTOM_PATTERN.matcher(browser);
        if (CustomMatcher.find()) {
            String browserStartCommand = CustomMatcher.group(1).substring(1);
            return new DestroyableRuntimeExecutingBrowserLauncher(browserStartCommand, sessionId);
        }
        throw browserNotSupported(browser);
    }

    public void addBrowserLauncher(String browser, Class clazz) {
        supportedBrowsers.put(browser, clazz);
    }

    private RuntimeException browserNotSupported(String browser) {
        StringBuffer errorMessage = new StringBuffer("Browser not supported: " + browser);
        errorMessage.append('\n');
        if (!browser.startsWith("*")) {
            errorMessage.append("(Did you forget to add a *?)\n");
        }
        errorMessage.append('\n');
        errorMessage.append("Supported browsers include:\n");
        for (Iterator iterator = supportedBrowsers.keySet().iterator(); iterator.hasNext();) {
            String name = (String) iterator.next();
            errorMessage.append("  *").append(name).append('\n');
        }
        errorMessage.append("  *custom\n");
        return new RuntimeException(errorMessage.toString());
    }

    private BrowserLauncher createBrowserLauncher(Class c, String browserStartCommand, String sessionId, SeleneseQueue queue) {
            try {
                BrowserLauncher browserLauncher;
                if (null == browserStartCommand) {
                    Constructor ctor = c.getConstructor(new Class[]{int.class, String.class});
                    Object[] args = new Object[] {new Integer(server.getPort()), sessionId};
                    browserLauncher = (BrowserLauncher) ctor.newInstance(args);
                } else {
                    Constructor ctor = c.getConstructor(new Class[]{int.class, String.class, String.class});
                    Object[] args = new Object[] {new Integer(server.getPort()), sessionId, browserStartCommand};
                    browserLauncher = (BrowserLauncher) ctor.newInstance(args);
                }

                if (browserLauncher instanceof SeleneseQueueAware) {
                    ((SeleneseQueueAware) browserLauncher).setSeleneseQueue(queue);
                }

                return browserLauncher;
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
    }
}
