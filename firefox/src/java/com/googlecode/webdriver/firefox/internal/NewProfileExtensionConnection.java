package com.googlecode.webdriver.firefox.internal;

import com.googlecode.webdriver.firefox.FirefoxLauncher;
import com.googlecode.webdriver.firefox.Command;

import java.io.IOException;

public class NewProfileExtensionConnection extends AbstractExtensionConnection {
    private static long TIMEOUT_IN_SECONDS = 20;
    private static long MILLIS_IN_SECONDS = 1000;
    private Process process;

    public NewProfileExtensionConnection(String profileName, String host, int port) throws IOException {
        process = new FirefoxLauncher().startProfile(profileName);

        setAddress(host, port);
        connectToBrowser(TIMEOUT_IN_SECONDS * MILLIS_IN_SECONDS);
    }

    public void quit() {
        try {
            sendMessageAndWaitForResponse(RuntimeException.class, new Command(null, "quit"));
        } catch (NullPointerException e) {
            // this is expected
        }

        // Wait for process to die and return
        try {
            process.waitFor();
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        }
    }

}
