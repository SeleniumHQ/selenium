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

import org.jmock.MockObjectTestCase;
import org.jmock.Mock;

import java.io.IOException;
import java.io.OutputStream;
import java.io.ByteArrayOutputStream;

/**
 * @author Aslak Helles&oslash;y
 * @version $Revision: 1.2 $
 */
public class FunnelResponseHandlerTest extends MockObjectTestCase {
    private OutputStream NULL_OUT = new ByteArrayOutputStream();

    public void testShouldReadUpToContentLengthAndLeaveOpen() throws IOException {
        Mock relay = mock(Relay.class);
        FunnelResponseHandler handler = new FunnelResponseHandler((Relay) relay.proxy(), NULL_OUT, NULL_OUT);
        TestInputStream serverResponse = new TestInputStream("" +
                "HTTP/1.x 200 OK\r\n" +
                "Content-Length: 4\r\n" +
                "\r\n" +
                "hello world");

        MockOutputStream expected = new MockOutputStream("" +
                "HTTP/1.x 200 OK\r\n" +
                "Content-Length: 4\r\n" +
                "\r\n" +
                "hell");
        handler.handleResponse(serverResponse, expected, null);
        expected.verify();
        assertFalse(serverResponse.isClosed());
        assertFalse(expected.isClosed());
    }

    public void testShouldCloseOnConnectionCloseHeader() throws IOException {
        Mock relay = mock(Relay.class);
        relay.expects(once()).method("close").withNoArguments().isVoid();
        FunnelResponseHandler handler = new FunnelResponseHandler((Relay) relay.proxy(), NULL_OUT, NULL_OUT);
        TestInputStream serverResponse = new TestInputStream("" +
                "HTTP/1.x 200 OK\r\n" +
                "Connection: close\r\n" +
                "\r\n" +
                "hello world");

        MockOutputStream expected = new MockOutputStream("" +
                "HTTP/1.x 200 OK\r\n" +
                "Connection: close\r\n" +
                "\r\n" +
                "hello world");
        handler.handleResponse(serverResponse, expected, null);
        assertFalse("Should not be closed by FunnelesponseHandler, but by Relay", serverResponse.isClosed());
        assertFalse("Should not be closed by FunnelesponseHandler, but by Relay", expected.isClosed());
    }
}
