package com.googlecode.webdriver.firefox.internal;

import com.googlecode.webdriver.firefox.ExtensionConnection;
import com.googlecode.webdriver.firefox.Response;
import com.googlecode.webdriver.firefox.Command;

public class DisconnectedExtension implements ExtensionConnection {
    public boolean isConnected() {
        return false;
    }


    public Response sendMessageAndWaitForResponse(Class<? extends RuntimeException> throwOnFailure, Command command) {
        throw new UnsupportedOperationException("Cannot execute " + command.getCommandName() + " on a disconnected extension");
    }

    public void quit() {
        // no-op
    }
}
