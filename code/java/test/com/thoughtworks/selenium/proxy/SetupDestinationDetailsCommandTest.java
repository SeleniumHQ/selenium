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

import junit.framework.TestCase;

import java.io.IOException;
import java.net.URISyntaxException;
import java.util.Properties;

/**
 * @version $Id: SetupDestinationDetailsCommandTest.java,v 1.7 2004/11/15 23:37:53 ahelleso Exp $
 */
public class SetupDestinationDetailsCommandTest extends TestCase {
    private Properties props;

    public void testIsARequestModificationCommand() {
        assertTrue(RequestModificationCommand.class.isAssignableFrom(SetupDestinationDetailsCommand.class));
    }

    public void testSetsUpCorrectServerAndPortForNonPort80() throws URISyntaxException, IOException {
        String expectedServer = "localhost";
        int expectedPort = 8000;
        HTTPRequest httpRequest = new SeleniumHTTPRequest("GET: /site/ " + HTTPRequest.CRLF +
                                                  "Host: " + expectedServer + ":" + expectedPort + HTTPRequest.CRLF);
        SetupDestinationDetailsCommand command = new SetupDestinationDetailsCommand();
        command.execute(httpRequest);
        assertEquals(expectedServer, httpRequest.getDestinationServer());
        assertEquals(expectedPort, httpRequest.getDestinationPort());
    }

    public void testSetsUpCorrectServerAndPortForDefaultPort() throws URISyntaxException, IOException {
        String expectedServer = "localhost";
        int expectedPort = 80;
        HTTPRequest httpRequest = new SeleniumHTTPRequest("GET: /site/ " + HTTPRequest.CRLF +
                                                  "Host: " + expectedServer + HTTPRequest.CRLF);
        SetupDestinationDetailsCommand command = new SetupDestinationDetailsCommand();
        command.execute(httpRequest);
        assertEquals(expectedServer, httpRequest.getDestinationServer());
        assertEquals(expectedPort, httpRequest.getDestinationPort());
    }

    public void testSetsUpCorrectServerAndPortIfProxySpecified() throws IOException {
        String expectedServer = "corpproxy";
        int expectedPort = 8080;

        Properties props = new Properties();
        props.put("http.proxyHost", expectedServer);
        props.put("http.proxyPort", Integer.toString(expectedPort));
        System.setProperties(props);

        HTTPRequest httpRequest = new SeleniumHTTPRequest("GET: /site/ " + HTTPRequest.CRLF +
                                                  "Host: www.amazon.com:9090" + HTTPRequest.CRLF);
        SetupDestinationDetailsCommand command = new SetupDestinationDetailsCommand();
        command.execute(httpRequest);
        assertEquals(expectedServer, httpRequest.getDestinationServer());
        assertEquals(expectedPort, httpRequest.getDestinationPort());
    }

    protected void setUp() throws Exception {
        super.setUp();
        props = System.getProperties();
    }

    protected void tearDown() throws Exception {
        System.setProperties(props);
        super.tearDown();
    }
}
