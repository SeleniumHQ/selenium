/*
 * Copyright 2004 ThoughtWorks, Inc.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */
package com.thoughtworks.selenium.funnel;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.Socket;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * This client connects to a HTTP server and writes the response back
 * to a stream.
 *
 * @author Aslak Helles&oslash;y
 * @author Mike Melia
 * @version $Revision: 1.1 $
 */
public class HttpClient implements Client {
    private static final Pattern HOST_PATTERN = Pattern.compile("(.*):([0-9]*)");
    private final OutputStream debugServerResponse;
    private final OutputStream debugClientResponse;
    private Socket socket;

    public HttpClient(OutputStream debugServerResponse, OutputStream debugClientResponse) {
        this.debugServerResponse = debugServerResponse;
        this.debugClientResponse = debugClientResponse;
    }

    public void request(InputStream clientRequest, OutputStream clientResponse, String host, ByteArrayOutputStream serverRequestBuffer) throws IOException {
        if (socket == null || socket.isClosed()) {
            open(host);
        }
        // write the request
        OutputStream serverOut = socket.getOutputStream();
        serverRequestBuffer.writeTo(serverOut);
        serverOut.flush();

        InputStream serverIn = socket.getInputStream();

        Relay relay = new DefaultRelay(clientRequest, clientResponse, serverIn, serverOut);
        FunnelResponseHandler funnelResponseHandler = new FunnelResponseHandler(relay, debugServerResponse, debugClientResponse);

        funnelResponseHandler.handleResponse(serverIn, clientResponse, host);
        clientResponse.flush();
        if (socket.isClosed()) {
            clientResponse.close();
        }
    }

    private void open(String host) throws IOException {
        Matcher hostMatcher = HOST_PATTERN.matcher(host);
        String hostName = host;
        int port = 80;
        if (hostMatcher.matches()) {
            hostName = hostMatcher.group(1);
            port = Integer.parseInt(hostMatcher.group(2));
        }
        socket = new Socket(hostName, port);
    }
}
