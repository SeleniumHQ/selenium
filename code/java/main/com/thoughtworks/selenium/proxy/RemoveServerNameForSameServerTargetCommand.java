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
 * This command removes the server name from the URI if the target server is hosted on the same machine as
 * Selenium. This means that we can proxy to the Selenium TinyWebServer.
 * @version $Id: RemoveServerNameForSameServerTargetCommand.java,v 1.2 2004/11/15 18:35:01 ahelleso Exp $
 */
public class RemoveServerNameForSameServerTargetCommand implements RequestModificationCommand {
    public static int start = SeleniumHTTPRequest.SELENIUM_REDIRECT_PROTOCOL.length();
    public static String sameServerAsSelenium = (SeleniumHTTPRequest.SELENIUM_REDIRECT_PROTOCOL +
                                                 SeleniumHTTPRequest.SELENIUM_REDIRECT_SERVERNAME).toUpperCase();

    /**
     * @see RequestModificationCommand#execute(HTTPRequest)
     */
    public void execute(HTTPRequest httpRequest) {
        String uri = httpRequest.getUri();
        if (uri.toUpperCase().startsWith(sameServerAsSelenium)) {
            httpRequest.setUri(uri.substring(uri.indexOf('/', start)));
        }
    }
}
