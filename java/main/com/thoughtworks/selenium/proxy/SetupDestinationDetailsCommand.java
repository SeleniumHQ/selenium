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

import java.net.URI;
import java.net.URISyntaxException;

/**
 * @version $Id: SetupDestinationDetailsCommand.java,v 1.7 2004/11/15 18:35:01 ahelleso Exp $
 */
public class SetupDestinationDetailsCommand implements RequestModificationCommand {

    private final String proxy = (String) System.getProperties().get("http.proxyHost");
    private final String proxyPort = (String) System.getProperties().get("http.proxyPort");
    /**
     * @see RequestModificationCommand#execute(HTTPRequest)
     */
    public void execute(HTTPRequest httpRequest) {
        try {
            URI uri = new URI(SeleniumHTTPRequest.SELENIUM_REDIRECT_PROTOCOL + httpRequest.getHost());
            String host = uri.getHost();
            httpRequest.setDestinationServer(getServer(host));
            httpRequest.setDestinationPort(getPort(getPort(uri), host));
        } catch (URISyntaxException e) {
            throw new IllegalStateException("Should have a valid host");
        }
    }

    private int getPort(URI uri) {
        int port = uri.getPort();
        return port == -1 ? 80 : port;
    }
    private int getPort(int destinationPort, String destinationServer) {
        if (proxyPort == null || destinationServer.startsWith(SeleniumHTTPRequest.SELENIUM_REDIRECT_SERVERNAME)) {
            return destinationPort;
        }
        return Integer.parseInt(proxyPort);
    }

    private String getServer(String destinationServer) {
        if (proxy == null || destinationServer.startsWith(SeleniumHTTPRequest.SELENIUM_REDIRECT_SERVERNAME)) {
            return destinationServer;
        }
        return proxy;
    }
}
