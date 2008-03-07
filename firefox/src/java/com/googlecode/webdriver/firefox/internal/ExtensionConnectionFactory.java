package com.googlecode.webdriver.firefox.internal;

import com.googlecode.webdriver.firefox.ExtensionConnection;

import java.io.File;

public class ExtensionConnectionFactory {
    public static ExtensionConnection connectTo(File profileDir, String host, int port) {
        try {
          return new NewProfileExtensionConnection(profileDir, host, port);
        } catch (Exception e) {
            // Then we can't connect
        }

        return new DisconnectedExtension();
    }
}
