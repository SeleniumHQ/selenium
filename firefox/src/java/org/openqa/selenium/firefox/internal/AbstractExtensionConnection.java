package org.openqa.selenium.firefox.internal;

import org.openqa.selenium.firefox.Command;
import org.openqa.selenium.firefox.ExtensionConnection;
import org.openqa.selenium.firefox.Response;
import org.json.JSONArray;
import org.json.JSONObject;
import org.json.JSONException;

import java.io.BufferedInputStream;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.net.ConnectException;
import java.net.Inet4Address;
import java.net.Inet6Address;
import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.net.NetworkInterface;
import java.net.Socket;
import java.net.SocketAddress;
import java.net.SocketException;
import java.net.UnknownHostException;
import java.util.Enumeration;

public abstract class AbstractExtensionConnection implements ExtensionConnection {
    private Socket socket;
    protected SocketAddress address;
    private OutputStreamWriter out;
    private BufferedInputStream in;

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
//                System.out.println("Attempting to connect");
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
        in = new BufferedInputStream(socket.getInputStream());
        out = new OutputStreamWriter(socket.getOutputStream(), "UTF-8");
    }

    public boolean isConnected() {
        return socket != null && socket.isConnected();
    }

    public Response sendMessageAndWaitForResponse(Class<? extends RuntimeException> throwOnFailure,
                                                  Command command) {
        String converted = convert(command);

        int lines = countLines(converted);

        StringBuffer message = new StringBuffer("Length: ");
        message.append(lines).append("\n\n");

        message.append(converted).append("\n");

        try {
            out.write(message.toString());
            out.flush();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }

        return waitForResponseFor(command.getCommandName());
    }

    private String convert(Command command) {
        JSONObject json = new JSONObject();
        try {
            json.put("commandName", command.getCommandName());
            json.put("context", String.valueOf(command.getContext()));
            json.put("elementId", command.getElementId());

            JSONArray params = new JSONArray();
            for (Object o : command.getParameters()) {
                params.put(o);
            }

            json.put("parameters", params);
        } catch (JSONException e) {
            throw new RuntimeException(e);
        }

        return json.toString();
    }

    private int countLines(String response) {
        return response.split("\n").length;
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
        String line = readLine();

        // Expected input will be of the form:
        // Header: Value
        // \n
        // JSON object
        //
        // The only expected header is "Length"

        // Read headers
        int count = 0;
        String[] parts = line.split(":", 2);
        if ("Length".equals(parts[0])) {
            count = Integer.parseInt(parts[1].trim());
        }

        // Wait for the blank line
        while (line.length() != 0) {
            line = readLine();
        }

        // Read the rest of the response.
        byte[] remaining = new byte[count];
        for (int i = 0; i < count; i++) {
            remaining[i] = (byte) in.read();
        }

        return new Response(new String(remaining, "UTF-8"));
    }

    private String readLine() throws IOException {
        int size = 4096;
        int growBy = 1024;
        byte[] raw = new byte[size];
        int count = 0;

        for (;;) {
            int b = in.read();

            if (b == -1 || (char) b == '\n')
                break;
            raw[count++] = (byte) b;
            if (count == size) {
                size += growBy;
                byte[] temp = new byte[size];
                System.arraycopy(raw, 0, temp, 0, count);
                raw = temp;
            }
        }

        return new String(raw, 0, count, "UTF-8");
    }
}
