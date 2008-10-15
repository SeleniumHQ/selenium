package org.openqa.selenium.firefox.internal;

import java.io.IOException;

import org.openqa.selenium.firefox.ExtensionConnection;
import org.openqa.selenium.firefox.FirefoxProfile;
import org.openqa.selenium.firefox.FirefoxBinary;

public class ExtensionConnectionFactory {
    public static ExtensionConnection connectTo(FirefoxBinary binary, FirefoxProfile profile, String host) {
        boolean isDev = Boolean.getBoolean("webdriver.firefox.useExisting");
        if (isDev) {
            try {
                return new RunningInstanceConnection(host, profile.getPort());
            } catch (IOException e) {
                // Fine. No running instance
            }
        }

        try {
          return new NewProfileExtensionConnection(binary, profile, host);
        } catch (Exception e) {
          // Tell the world what went wrong
          e.printStackTrace();
        }

        return new DisconnectedExtension();
    }
}
