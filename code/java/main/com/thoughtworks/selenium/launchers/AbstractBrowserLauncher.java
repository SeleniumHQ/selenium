package com.thoughtworks.selenium.launchers;

import com.thoughtworks.selenium.BrowserLauncher;

import java.io.IOException;

/**
 * @author Paul Hammant
 * @version $Revision: 1.8 $
 */
public abstract class AbstractBrowserLauncher implements BrowserLauncher {

    protected Process process;

    protected void exec(String command) throws IOException {
        process = Runtime.getRuntime().exec(command);
    }
}
