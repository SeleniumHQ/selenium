package com.thoughtworks.webdriver.firefox;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.InetSocketAddress;
import java.net.Socket;
import java.net.SocketAddress;

class ExtensionConnection {
	private Socket socket;
	private final SocketAddress address;
	private PrintWriter out;
	private BufferedReader in;

	public ExtensionConnection(String host, int port) {
		address = new InetSocketAddress(host, port);
	}

	public void connect() throws IOException {
		socket = new Socket();

		socket.connect(address);
		in = new BufferedReader(new InputStreamReader(socket.getInputStream()));
		out = new PrintWriter(socket.getOutputStream(), true);
	}

	public boolean isConnected() {
		return socket != null && socket.isConnected();
	}

	public String sendMessageAndWaitForResponse(String methodName, String argument) {
        int lines = countLines(argument);

        StringBuffer message = new StringBuffer(methodName);
		message.append(" ").append(lines).append("\n");
        if (argument != null)
            message.append(argument).append("\n");

        out.print(message.toString());
        out.flush();

        return waitForResponseFor(methodName);
	}

    private int countLines(String argument) {
        int lines = 0;

        if (argument != null)
            lines = argument.split("\n").length;
        return lines;
    }

    private String waitForResponseFor(String command) {
		try {
			return readLoop(command);
		} catch (IOException e) {
			throw new RuntimeException(e);
		}
	}

	private String readLoop(String command) throws IOException {
		while (true) {
			String[] response = nextResponse();

            if (command.equals(response[0]))
				return response[1];
            throw new RuntimeException("Expected response to " + command + " but actually got: " + response[0] + " (" + response[1] + ")");
        }
	}

	private String[] nextResponse() throws IOException {
        String line = in.readLine();

        int spaceIndex = line.indexOf(' ');
        String methodName = line.substring(0, spaceIndex);
		String remainingResponse = line.substring(spaceIndex + 1);
		long count = Long.parseLong(remainingResponse);

		StringBuffer result = new StringBuffer();
        for (int i = 0; i < count; i++) {
            result.append(in.readLine());
        }
		
		return new String[] { methodName, result.toString() };
	}
}
