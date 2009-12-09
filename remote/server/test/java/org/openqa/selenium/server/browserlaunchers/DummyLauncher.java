package org.openqa.selenium.server.browserlaunchers;

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
    public void launchHTMLSuite(String startURL, String suiteUrl) {
        closed = false;
    }

    protected boolean isClosed() {
        return closed;
    }

    protected void setOpen() {
        closed = false;
    }

    public void launchRemoteSession(String url) {
       closed = false;
    }
}