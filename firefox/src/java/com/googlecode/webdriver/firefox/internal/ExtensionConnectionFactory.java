package com.googlecode.webdriver.firefox.internal;

import com.googlecode.webdriver.firefox.ExtensionConnection;

import java.io.File;
import java.io.IOException;

public class ExtensionConnectionFactory {
    public static ExtensionConnection connectTo(File profileDir, String host, int port) {
        boolean isDev = Boolean.getBoolean("webdriver.firefox.useExisting");
        if (isDev) {
            try {
                return new RunningInstanceConnection(host, port);
            } catch (IOException e) {
                // Fine. No running instance
            }
        }

        try {
          return new NewProfileExtensionConnection(profileDir, host, port);
        } catch (Exception e) {
            // Then we can't connect
        }

        return new DisconnectedExtension();
    }
}
