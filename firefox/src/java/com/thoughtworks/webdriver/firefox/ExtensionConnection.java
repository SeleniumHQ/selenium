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
}
