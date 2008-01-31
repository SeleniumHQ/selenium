package com.googlecode.webdriver.firefox.internal;

import com.googlecode.webdriver.firefox.ExtensionConnection;
import com.googlecode.webdriver.firefox.Response;

public class DisconnectedExtension implements ExtensionConnection {
    public boolean isConnected() {
        return false;
    }

    public Response sendMessageAndWaitForResponse(String methodName, long id, String argument) {
        throw new UnsupportedOperationException("Cannot execute " + methodName + " on a disconnected extension");
    }

    public void quit() {
        // no-op
    }
}
