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
/**
 * This command creates the host field for the request from either the uri. If the uri is relative then the
 * host is set up from the referer.
 * @version $Id: CreateHostCommand.java,v 1.6 2004/11/15 23:37:52 ahelleso Exp $
 */
public class CreateHostCommand implements RequestModificationCommand {
    private static int start = SeleniumHTTPRequest.SELENIUM_REDIRECT_PROTOCOL.length();

    /**
     * @see RequestModificationCommand#execute(HTTPRequest)
     */
    public void execute(HTTPRequest httpRequest) {
        String uri = httpRequest.getUri();
        String newHost = getHost(uri);
        if (newHost == null) {
            newHost = getHost(httpRequest.getHeaderField("Referer"));
        }
        httpRequest.setHost(newHost);
    }

    private String getHost(String uri) {
        if (uri != null && uri.startsWith(SeleniumHTTPRequest.SELENIUM_REDIRECT_PROTOCOL)) {
            int end = uri.indexOf('/', start);
            return (end == -1) ? uri.substring(start) : uri.substring(start, end);
        }
        return null;
    }

}
