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
package com.thoughtworks.selenium.proxy;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.Socket;

/**
 * @version $Id: RedirectingRelay.java,v 1.10 2004/11/15 23:37:52 ahelleso Exp $
 */
public class RedirectingRelay implements Relay {
    private static final Log LOG = LogFactory.getLog(RedirectingRelay.class);
    private static final int protocolLength = SeleniumHTTPRequest.SELENIUM_REDIRECT_PROTOCOL.length();
    private final RequestInput requestInput;
    private final OutputStream responseStream;
    private final RequestModificationCommand requestModificationCommand;

    public RedirectingRelay(RequestInput requestInput,
                            OutputStream responseStream,
                            RequestModificationCommand requestModificationCommand) {
        this.requestInput = requestInput;
        this.responseStream = responseStream;
        this.requestModificationCommand = requestModificationCommand;
    }


    public void relay() throws IOException {
        HTTPRequest request = requestInput.readRequest();
        System.out.println(request);
        System.out.println("---------------");
        if (!hasBeenRedirected(request.getUri())) {
            byte[] redirectMessage = redirectResponse(request).getBytes();
            responseStream.write(redirectMessage);
            responseStream.flush();
        } else {
            sendToIntendedTarget(request);
        }
    }

    private boolean hasBeenRedirected(String uri) {
        return uri.startsWith(SeleniumHTTPRequest.SELENIUM_REDIRECT_PROTOCOL + SeleniumHTTPRequest.SELENIUM_REDIRECT_SERVER);
    }

    private void sendToIntendedTarget(HTTPRequest request) {
        requestModificationCommand.execute(request);
        int port = request.getDestinationPort();
        String dest = request.getDestinationServer();
        System.out.println("Connecting to " + dest + " on " + port);
        try {
            Socket destinationSocket = new Socket(dest, port);
            OutputStream destStream = destinationSocket.getOutputStream();
            InputStream backStream = destinationSocket.getInputStream();
            request.writeTo(destStream);
            destStream.flush();
            Pump pump = new SeleniumPump();
            pump.pump(backStream, responseStream);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private String redirectResponse(HTTPRequest request) {
        final String protocol = request.getProtocol();
        final String uri = request.getUri();
        String response = protocol + " 302 Moved Temporarily\r\nLocation: " +
                          SeleniumHTTPRequest.SELENIUM_REDIRECT_URI  +
                          uri.substring(protocolLength) + "\r\n";
        LOG.debug("Redirected Response\n" + response);
        return response;
    }

}
