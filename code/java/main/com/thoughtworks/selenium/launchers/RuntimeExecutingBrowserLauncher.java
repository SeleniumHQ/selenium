package com.thoughtworks.selenium.launchers;

import com.thoughtworks.selenium.BrowserLauncher;
import com.thoughtworks.selenium.SeleniumException;

import java.io.IOException;

/**
 * @author Paul Hammant
 * @version $Revision: 1.8 $
 */
public abstract class RuntimeExecutingBrowserLauncher implements BrowserLauncher {

    protected Process process;
    private String commandPath;

    protected RuntimeExecutingBrowserLauncher(String commandPath) {
        this.commandPath = commandPath;
    }

    public final void launch(String url) {
        exec(commandPath + " " + url);
    }

    protected void exec(String command) {

        try {
            process = Runtime.getRuntime().exec(command);
        } catch (IOException e) {
            throw new SeleniumException("IO Exception:" + e.getMessage());
        }
    }
}
