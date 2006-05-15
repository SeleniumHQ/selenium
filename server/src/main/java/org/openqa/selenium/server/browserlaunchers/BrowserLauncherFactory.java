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

import java.lang.reflect.*;
import java.net.*;
import java.util.regex.*;

import org.openqa.selenium.server.*;

/**
 * Returns BrowserLaunchers based on simple strings given by the user
 *  
 * 
 *  @author danielf
 *
 */
public class BrowserLauncherFactory {

    private static final Pattern CUSTOM_PATTERN = Pattern.compile("^\\*custom( .*)?$");
    
    private static final BrowserStringPair[] supportedBrowsers = new BrowserStringPair[] {
        new BrowserStringPair("firefox", FirefoxCustomProfileLauncher.class),
        new BrowserStringPair("iexplore", InternetExplorerCustomProxyLauncher.class),
        new BrowserStringPair("safari", SafariCustomProfileLauncher.class),
        new BrowserStringPair("iehta", HTABrowserLauncher.class),
    };
    
    SeleniumServer server;
    
    public BrowserLauncherFactory(SeleniumServer server) {
        this.server = server;
    }
    
    /** Returns the browser given by the specified browser string
     * 
     * @param browser a browser string like "*firefox"
     * @param sessionId the sessionId to launch
     * @return the BrowserLauncher ready to launch
     */
    public BrowserLauncher getBrowserLauncher(String browser, String sessionId) {
        if (browser == null) throw new IllegalArgumentException("browser may not be null");
        for (int i = 0; i < supportedBrowsers.length; i++) {
            BrowserStringPair pair = supportedBrowsers[i];
            String name = pair.name;
            Class c = pair.c;
            Pattern pat = Pattern.compile("^\\*" + name + "( .*)?$");
            Matcher mat = pat.matcher(browser);
            if (mat.find()) {
                String browserStartCommand;
                if (browser.equals("*" + name)) {
                    browserStartCommand = null;
                } else {
                    browserStartCommand = mat.group(1).substring(1);
                }
                return createBrowserLauncher(c, browserStartCommand, sessionId);
            }
        }
        Matcher CustomMatcher = CUSTOM_PATTERN.matcher(browser);
        if (CustomMatcher.find()) {
            String browserStartCommand = CustomMatcher.group(1).substring(1);
            return new DestroyableRuntimeExecutingBrowserLauncher(browserStartCommand);
        }
        throw browserNotSupported(browser);
    }
    
    private RuntimeException browserNotSupported(String browser) {
        StringBuffer errorMessage = new StringBuffer("Browser not supported: " + browser);
        errorMessage.append('\n');
        if (!browser.startsWith("*")) {
            errorMessage.append("(Did you forget to add a *?)\n");
        }
        errorMessage.append('\n');
        errorMessage.append("Supported browsers include:\n");
        for (int i = 0; i < supportedBrowsers.length; i++) {
            errorMessage.append("  *").append(supportedBrowsers[i].name).append('\n');
        }
        return new RuntimeException(errorMessage.toString());
    }
    
    private BrowserLauncher createBrowserLauncher(Class c, String browserStartCommand, String sessionId) {
            try {
                if (null == browserStartCommand) {
                    Constructor ctor = c.getConstructor(new Class[]{int.class, String.class});
                    Object[] args = new Object[] {new Integer(server.getPort()), sessionId};
                    return (BrowserLauncher) ctor.newInstance(args);
                } else {
                    Constructor ctor = c.getConstructor(new Class[]{int.class, String.class, String.class});
                    Object[] args = new Object[] {new Integer(server.getPort()), sessionId, browserStartCommand};
                    return (BrowserLauncher) ctor.newInstance(args);
                }
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
    }
    
    private static class BrowserStringPair {
        public String name;
        public Class c;
        public BrowserStringPair(String name, Class c) {
            this.name = name;
            this.c = c;
        }
    }

}
