package com.googlecode.webdriver.firefox.internal;

import com.googlecode.webdriver.firefox.ExtensionConnection;
import com.googlecode.webdriver.firefox.Response;
import com.googlecode.webdriver.firefox.FirefoxLauncher;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.net.NetworkInterface;
import java.net.Socket;
import java.net.SocketAddress;
import java.net.SocketException;
import java.net.UnknownHostException;
import java.net.Inet4Address;
import java.net.Inet6Address;
import java.util.Enumeration;

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
            sendMessageAndWaitForResponse("quit", 0, null);
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
