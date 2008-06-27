package org.openqa.selenium.firefox.internal;

import org.openqa.selenium.firefox.ExtensionConnection;
import org.openqa.selenium.firefox.Response;
import org.openqa.selenium.firefox.Command;

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
