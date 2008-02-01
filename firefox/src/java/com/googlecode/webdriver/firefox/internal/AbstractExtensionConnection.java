package com.googlecode.webdriver.firefox.internal;

import com.googlecode.webdriver.firefox.ExtensionConnection;
import com.googlecode.webdriver.firefox.Response;

import java.net.InetAddress;
import java.net.NetworkInterface;
import java.net.Inet4Address;
import java.net.Inet6Address;
import java.net.SocketException;
import java.net.Socket;
import java.net.SocketAddress;
import java.net.UnknownHostException;
import java.net.InetSocketAddress;
import java.net.ConnectException;
import java.util.Enumeration;
import java.io.IOException;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.PrintWriter;

public abstract class AbstractExtensionConnection implements ExtensionConnection {
    private Socket socket;
    protected SocketAddress address;
    private PrintWriter out;
    private BufferedReader in;

    protected void setAddress(String host, int port) {
        InetAddress addr;

        if ("localhost".equals(host)) {
            addr = obtainLoopbackAddress();
        } else {
            try {
                addr = InetAddress.getByName(host);
            } catch (UnknownHostException e) {
                throw new RuntimeException(e);
            }
        }

        address = new InetSocketAddress(addr, port);
    }

    private InetAddress obtainLoopbackAddress() {
        InetAddress localIp4 = null;
        InetAddress localIp6 = null;

        try {
            Enumeration<NetworkInterface> allInterfaces = NetworkInterface.getNetworkInterfaces();
            while (allInterfaces.hasMoreElements()) {
                NetworkInterface iface = allInterfaces.nextElement();
                Enumeration<InetAddress> allAddresses = iface.getInetAddresses();
                while (allAddresses.hasMoreElements()) {
                    InetAddress addr = allAddresses.nextElement();
                    if (addr.isLoopbackAddress()) {
                        if (addr instanceof Inet4Address && localIp4 == null)
                            localIp4 = addr;
                        else if (addr instanceof Inet6Address && localIp6 == null)
                            localIp6 = addr;
                    }
                }
            }
        } catch (SocketException e) {
            throw new RuntimeException(e);
        }

        // Firefox binds to the IP4 address by preference
        if (localIp4 != null)
            return localIp4;

        if (localIp6 != null)
            return localIp6;

        throw new RuntimeException("Unable to find loopback address for localhost");
    }

    protected boolean connectToBrowser(long timeToWaitInMilliSeconds) throws IOException {
        long waitUntil = System.currentTimeMillis() + timeToWaitInMilliSeconds;
        while (!isConnected() && waitUntil > System.currentTimeMillis()) {
            try {
                connect();
            } catch (ConnectException e) {
                try {
                    Thread.sleep(250);
                } catch (InterruptedException ie) {
                    throw new RuntimeException(ie);
                }
            }
        }
        return isConnected();
    }

    private void connect() throws IOException {
        socket = new Socket();

        socket.connect(address);
        in = new BufferedReader(new InputStreamReader(socket.getInputStream(), "UTF-8"));
        out = new PrintWriter(socket.getOutputStream(), true);
    }

    public boolean isConnected() {
        return socket != null && socket.isConnected();
    }

    public Response sendMessageAndWaitForResponse(Class<? extends RuntimeException> throwOnFailure, String methodName,
                                                  long driverId, String... arguments) {
        int lines = countLines(arguments) + 1;

        StringBuffer message = new StringBuffer(methodName);
        message.append(" ").append(lines).append("\n");

        message.append(driverId).append("\n");

        for (String arg : arguments) {
            message.append(arg).append("\n");
        }

        out.print(message.toString());
        out.flush();

        return waitForResponseFor(methodName);
    }

    private int countLines(String... arguments) {
        int lines = 0;

        for (String arg : arguments) {
            lines += arg.split("\n").length;
        }

        return lines;
    }

    private Response waitForResponseFor(String command) {
        try {
            return readLoop(command);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    private Response readLoop(String command) throws IOException {
        Response response = nextResponse();

        if (command.equals(response.getCommand()))
            return response;
        throw new RuntimeException("Expected response to " + command + " but actually got: " + response.getCommand() + " (" + response.getCommand() + ")");
    }

    private Response nextResponse() throws IOException {
        String line = in.readLine();

        // Expected input will be of the form:
        // CommandName NumberOfLinesRemaining
        // context
        // Status
        // ResponseText

        int spaceIndex = line.indexOf(' ');
        String methodName = line.substring(0, spaceIndex);
        String remainingResponse = line.substring(spaceIndex + 1);
        long count = Long.parseLong(remainingResponse);

        StringBuffer result = new StringBuffer();
        for (int i = 0; i < count; i++) {
            String read = in.readLine();
            result.append(read);
            if (i != count - 1)
                result.append("\n");
        }

        return new Response(methodName, result.toString());
    }
}
