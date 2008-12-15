package org.openqa.selenium.server.browserlaunchers;

import org.openqa.selenium.server.BrowserConfigurationOptions;
import org.openqa.selenium.server.browserlaunchers.BrowserLauncher;

/**
 * A teeny tiny no-op launcher to get a non-null launcher for testing.
 *
 * @author jbevan@google.com (Jennifer Bevan)
 */
public class DummyLauncher implements BrowserLauncher {

    private boolean closed;

    public DummyLauncher() {
        closed = true;
    }

    /**
     * noop
     */
    public void close() {
        closed = true;
    }

    /**
     * noop
     */
    public Process getProcess() {
        return null;
    }

    /**
     * noop
     */
    public void launchHTMLSuite(String startURL, String suiteUrl,
                                boolean multiWindow, String defaultLogLevel) {
        closed = false;
    }

    /**
     * noop
     */
    public void launchRemoteSession(String url, boolean multiWindow) {
        closed = false;
    }

    protected boolean isClosed() {
        return closed;
    }

    protected void setOpen() {
        closed = false;
    }

    public void launchRemoteSession(String url, boolean multiWindow,
            BrowserConfigurationOptions browserConfigurationOptions) {
       closed = false;
    }
}