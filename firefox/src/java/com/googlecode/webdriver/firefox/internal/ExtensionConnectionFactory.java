package com.googlecode.webdriver.firefox.internal;

import java.io.IOException;

import com.googlecode.webdriver.firefox.ExtensionConnection;

public class ExtensionConnectionFactory {
    public static ExtensionConnection connectTo(String profileName, String host, int port) {
        try {
            return new RunningInstanceConnection(host, port);
        } catch (IOException e) {
            // Fine
        }

        try {
            return new NewProfileExtensionConnection(profileName, host, port);
        } catch (IOException e) {
            // Then we can't connect
        }

        return new DisconnectedExtension();
    }
}
