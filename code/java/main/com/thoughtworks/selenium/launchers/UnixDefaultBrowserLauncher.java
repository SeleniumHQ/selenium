package com.thoughtworks.selenium.launchers;

import com.thoughtworks.selenium.BrowserLauncher;

/**
 * Does nothing; what should we do for Unix?
 * @deprecated This class doesn't do anything!
 * @author Paul Hammant
 * @version $Revision: 1.8 $
 */
public class UnixDefaultBrowserLauncher implements BrowserLauncher {

    public void launch(String url) {
    }

    public void close() {
    }
}
