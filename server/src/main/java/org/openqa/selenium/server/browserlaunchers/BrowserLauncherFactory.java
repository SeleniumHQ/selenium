/*
 * Created on Mar 4, 2006
 *
 */
package org.openqa.selenium.server.browserlaunchers;

import java.util.regex.*;

import org.openqa.selenium.server.*;

public class BrowserLauncherFactory {

    private static final Pattern FIREFOX_PATTERN = Pattern.compile("^\\*firefox( .*)?$");
    SeleniumProxy server;
    
    public BrowserLauncherFactory(SeleniumProxy server) {
        this.server = server;
    }
    
    public BrowserLauncher getBrowserLauncher(String browser) {
        if (browser == null) throw new IllegalArgumentException("browser may not be null");
        BrowserLauncher launcher;
        Matcher FirefoxMatcher = FIREFOX_PATTERN.matcher(browser);
        if (FirefoxMatcher.find()) {
            if (browser.equals("*firefox")) {
                launcher = new FirefoxCustomProfileLauncher(server.getPort());
            } else {
                String browserStartCommand = FirefoxMatcher.group(1).substring(1);
                launcher = new FirefoxCustomProfileLauncher(server.getPort(), browserStartCommand);
            }
        } else {
            launcher = new DestroyableRuntimeExecutingBrowserLauncher(browser);
            //launcher = new ManualPromptUserLauncher();
        }
        return launcher;
    }
}
