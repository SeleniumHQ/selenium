package com.googlecode.webdriver.firefox.internal;

import java.io.IOException;
import java.net.ConnectException;

public class RunningInstanceConnection extends AbstractExtensionConnection {
    public RunningInstanceConnection(String host, int port) throws IOException {
        this(host, port, 500);
    }

    public RunningInstanceConnection(String host, int port, long timeOut) throws IOException {
        setAddress(host, port);
        if (!connectToBrowser(timeOut))
            throw new ConnectException("Cannot connect to browser");
    }

    public void quit() {
        try {
            sendMessageAndWaitForResponse(RuntimeException.class, "quit", 0);
        } catch (NullPointerException e) {
            // Expected
        }

        allowFirefoxToQuit();
    }

    private void allowFirefoxToQuit() {
        try {
            Thread.sleep(250);
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        }
    }
}
