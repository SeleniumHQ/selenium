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

import org.jmock.Mock;
import org.jmock.MockObjectTestCase;
import org.jmock.core.Constraint;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

/**
 * @author Aslak Helles&oslash;y
 * @version $Revision: 1.3 $
 */
public class FunnelRequestHandlerTest extends MockObjectTestCase {
    private OutputStream NULL_OUT = new ByteArrayOutputStream();

    public void testShouldWrite302RedirectForInitialRootRequest() throws IOException {
        InputStream clientRequest = new ByteArrayInputStream(("" +
                "GET http://www.google.com/ HTTP/1.1\r\n" +
                "Host: www.google.com\r\n" +
                "\r\n").getBytes());

        MockOutputStream expectedClientResponse = new MockOutputStream("" +
                "HTTP/1.x 302 Moved Temporarily\r\n" +
                "Location: http://127.0.0.1/www.google.com/\r\n" +
                "\r\n");
        Mock client = mock(Client.class);
        new FunnelRequestHandler((Client) client.proxy(), NULL_OUT, NULL_OUT, NULL_OUT).handleRequest(clientRequest, expectedClientResponse);
        expectedClientResponse.verify();
    }

    public void testShouldWrite302RedirectForInitialRequestWithSubPath() throws IOException {
        InputStream clientRequest = new ByteArrayInputStream(("" +
                "GET http://www.thoughtworks.com/us HTTP/1.1\r\n" +
                "Host: www.thoughtworks.com\r\n" +
                "\r\n").getBytes());

        MockOutputStream expectedClientResponse = new MockOutputStream("" +
                "HTTP/1.x 302 Moved Temporarily\r\n" +
                "Location: http://127.0.0.1/www.thoughtworks.com/us\r\n" +
                "\r\n");
        Mock client = mock(Client.class);
        new FunnelRequestHandler((Client) client.proxy(), NULL_OUT, NULL_OUT, NULL_OUT).handleRequest(clientRequest, expectedClientResponse);
        expectedClientResponse.verify();
    }

    public void testShouldForwardRedirectedRequestUsingHostFromRequestLine() throws IOException {
        InputStream clientRequest = new ByteArrayInputStream(("" +
                "GET http://127.0.0.1/www.google.com/ HTTP/1.1\r\n" +
                "Host: 127.0.0.1\r\n" +
                "\r\n").getBytes());

        MockOutputStream expectedClientResponse = new MockOutputStream("");
        MockOutputStream debugServerRequest = new MockOutputStream("" +
                "----- FUNNEL->SERVER REQUEST HEADERS -----\r\n" +
                "GET http://www.google.com/ HTTP/1.1\r\n" +
                "Host: www.google.com\r\n" +
                "\r\n");
        Mock client = mock(Client.class);

        client.expects(once()).method("request").with(same(clientRequest),
                same(expectedClientResponse),
                eq("www.google.com"),
                isA(OutputStream.class)).isVoid();
        new FunnelRequestHandler((Client) client.proxy(), NULL_OUT, NULL_OUT, debugServerRequest).handleRequest(clientRequest, expectedClientResponse);
        expectedClientResponse.verify();
        debugServerRequest.verify();
    }

    public void testShouldForwardRedirectedRequestUsingHostFromCookie() throws IOException {
        InputStream clientRequest = new ByteArrayInputStream(("" +
                "GET http://127.0.0.1/images/logo.gif HTTP/1.1\r\n" +
                "Host: 127.0.0.1\r\n" +
                "Referer: http://127.0.0.1/www.google.com/\r\n" +
                "Cookie: FOO=BAR; SELENIUM=www.google.com; MOOKY=SNOOPY\r\n" +
                "\r\n").getBytes());

        MockOutputStream expectedClientResponse = new MockOutputStream("");
        Mock client = mock(Client.class);
        Constraint expectedRequest = new StreamConstraint("" +
                "GET /images/logo.gif HTTP/1.1\r\n" +
                "Cookie: FOO=BAR; SELENIUM=www.google.com; MOOKY=SNOOPY\r\n" +
                "Host: www.google.com\r\n" +
                "Referer: http://www.google.com/\r\n" +
                "\r\n");

        client.expects(once()).method("request").with(
                same(clientRequest),
                same(expectedClientResponse),
                eq("www.google.com"),
                expectedRequest
        ).isVoid();
        new FunnelRequestHandler((Client) client.proxy(), NULL_OUT, NULL_OUT, NULL_OUT).handleRequest(clientRequest, expectedClientResponse);
        expectedClientResponse.verify();
    }

    private class StreamConstraint implements Constraint {
        private final String expected;
        private String requestContent = "CONSTRAINT NOT CHECKED YET";

        public StreamConstraint(String expected) {
            this.expected = expected;
        }

        public boolean eval(Object o) {
            ByteArrayOutputStream headers = (ByteArrayOutputStream) o;
            requestContent = new String(headers.toByteArray());
            assertEquals(expected, requestContent);
            return expected.equals(requestContent);
        }

        public StringBuffer describeTo(StringBuffer stringBuffer) {
            return stringBuffer.append("Expected <").append(expected).append("> but was <").append(requestContent).append(">");
        }
    }
}
