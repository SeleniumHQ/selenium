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

import com.thoughtworks.selenium.proxy.LineInputStream;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * The FunnelRequestHandler handles HTTP requests and responds with 302 redirects for new requests.
 * When the FunnelRequestHandler receives new redirected requests it will detect that it is a "re-request".
 * Re-requests are forwarded to the real host and the response is written back to the client.
 * <p/>
 * The browser will think everything comes from 127.0.0.1 although there is actually nothing there.
 *
 * @author Mike Melia
 * @author Aslak Helles&oslash;y
 * @version $Revision: 1.3 $
 */
public class FunnelRequestHandler {
    // Host: foo.bar.com:88
    private static final Pattern HOST_HEADER_PATTERN = Pattern.compile("Host:\\s(.*)", Pattern.DOTALL + Pattern.CASE_INSENSITIVE);
    // Referer: http://127.0.0.1/www.google.com/
    private static final Pattern REFERER_HEADER_PATTERN = Pattern.compile("Referer:\\shttp://127.0.0.1/([^\\/]*)(.*)", Pattern.DOTALL + Pattern.CASE_INSENSITIVE);
    private static final Pattern COOKIE_HEADER_PATTERN = Pattern.compile("Cookie:.*SELENIUM=([^;]*).*", Pattern.DOTALL + Pattern.CASE_INSENSITIVE);
    // GET http://www.google.com/ HTTP/1.1
    private static final Pattern REQUEST_LINE_PATTERN = Pattern.compile("([A-Z]*)\\s([a-z]*://)([^\\/]*)([^\\s]*)(.*)", Pattern.DOTALL + Pattern.CASE_INSENSITIVE);
    private static final String DUMMY_REDIRECT_HOST = "127.0.0.1";

    private final Client client;
    private final OutputStream debugClientRequest;
    private final OutputStream debugClientResponse;
    private final OutputStream debugServerRequest;

    /**
     * Creates a new FunnelRequestHandler with debug streams. It is recommended to always use debug streams
     * so that bugs can be captured. When Funnel becomes really stable we can use ByteArrayOutputStream for this.
     *
     * @param client              where the forwarded requests will be handled.
     * @param debugClientRequest  debug stream where client's request headers are written.
     * @param debugClientResponse debug stream where response headers to client are written.
     */
    public FunnelRequestHandler(Client client, OutputStream debugClientRequest, OutputStream debugClientResponse, OutputStream debugServerRequest) {
        this.client = client;
        this.debugClientRequest = debugClientRequest;
        this.debugClientResponse = debugClientResponse;
        this.debugServerRequest = debugServerRequest;
    }

    /**
     * @return true if connection should be kept alive
     */
    public boolean handleRequest(InputStream clientRequest, OutputStream clientResponse) throws IOException {
        LineInputStream lineInputStream = new LineInputStream(clientRequest);
        ByteArrayOutputStream serverRequestHeaders = new ByteArrayOutputStream();
        ByteArrayOutputStream debugRequestHeaders = new ByteArrayOutputStream();

        String requestLine = lineInputStream.readLine();
        debugRequestHeaders.write(requestLine.getBytes());

        Matcher requestLineMatcher = REQUEST_LINE_PATTERN.matcher(requestLine);
        if (!requestLineMatcher.matches()) {
            throw new IOException(requestLine + " doesn't match " + REQUEST_LINE_PATTERN.pattern());
        }

        String referer = null;
        String hostFromHostHeader = null;
        String hostFromSeleniumCookie = null;

        String line = null;
        while ((line = lineInputStream.readLine()) != null) {
            debugRequestHeaders.write(line.getBytes());
            // break out of the loop if we hit an empty line. Thet means end of HTTP
            // header section.
            if (line.equals("\r\n")) {
                debugClientRequest.write("----- CLIENT->FUNNEL REQUEST HEADERS -----\r\n".getBytes());
                debugRequestHeaders.writeTo(debugClientRequest);
                break;
            }
            Matcher hostHeaderMatcher = HOST_HEADER_PATTERN.matcher(line.trim());
            Matcher refererHeaderMatcher = REFERER_HEADER_PATTERN.matcher(line.trim());
            Matcher cookieHeaderMatcher = COOKIE_HEADER_PATTERN.matcher(line.trim());
            if (cookieHeaderMatcher.matches()) {
                hostFromSeleniumCookie = cookieHeaderMatcher.group(1);
                serverRequestHeaders.write(line.getBytes());
            } else if (hostHeaderMatcher.matches()) {
                hostFromHostHeader = hostHeaderMatcher.group(1);
            } else if (refererHeaderMatcher.matches()) {
                referer = line;
            } else {
                serverRequestHeaders.write(line.getBytes());
            }
        }

        if (hostFromHostHeader.equals(DUMMY_REDIRECT_HOST)) {
            // It is a re-request of a previously redirected request.
            String forwardRequestLine = null;

            String host = null;
            if (hostFromSeleniumCookie != null) {
                forwardRequestLine = requestLine.replaceFirst("http://127.0.0.1", "");
                forwardRequestLine = forwardRequestLine.replaceFirst("/" + hostFromSeleniumCookie, "");
                host = hostFromSeleniumCookie;
            } else {
                forwardRequestLine = requestLine.replaceFirst("127.0.0.1/", "");
                Matcher forwardRequestLineMatcher = REQUEST_LINE_PATTERN.matcher(forwardRequestLine);
                if (!forwardRequestLineMatcher.matches()) {
                    throw new IOException(requestLine + " doesn't match " + REQUEST_LINE_PATTERN.pattern());
                }
                host = forwardRequestLineMatcher.group(3);
            }

            serverRequestHeaders.write("Host: ".getBytes());
            serverRequestHeaders.write(host.getBytes());
            serverRequestHeaders.write("\r\n".getBytes());

            if (referer != null) {
                String forwardReferer = referer.replaceFirst("127.0.0.1/", "");
                serverRequestHeaders.write(forwardReferer.getBytes());
            }

            serverRequestHeaders.write("\r\n".getBytes());
            request(clientRequest, clientResponse, host, forwardRequestLine, serverRequestHeaders);

            // TODO: return false if hostFromHostHeader is different than previous request
            return true;
        } else {
            StringBuffer buffer = new StringBuffer();
            requestLineMatcher.appendReplacement(buffer, "$2127.0.0.1/$3$4");

            String newRequestLine = buffer.toString();
            redirect302(newRequestLine, clientResponse);
            return false;
        }
    }

    private void request(InputStream clientRequest, OutputStream clientResponse, String host, String requestLine, ByteArrayOutputStream headers) throws IOException {
        ByteArrayOutputStream serverRequest = new ByteArrayOutputStream();
        serverRequest.write(requestLine.getBytes());
        headers.writeTo(serverRequest);

        debugServerRequest.write("----- FUNNEL->SERVER REQUEST HEADERS -----\r\n".getBytes());
        serverRequest.writeTo(debugServerRequest);

        client.request(clientRequest, clientResponse, host, serverRequest);
    }

    private void redirect302(String redirectUrl, OutputStream response) throws IOException {

        // We're telling the client that this resource must be retrieved from 127.0.0.1.
        // In reality nothing will ever be forwarded there - it is just a token that
        // we'll use to identify a previously redirected request. Remember - all requests
        // go through us regardless of what host and port is specified.

        // This intermediary ByteArrayOutputStream is strictly not needed - it is only
        // here for debugging.
        ByteArrayOutputStream responseContent = new ByteArrayOutputStream();

        responseContent.write("HTTP/1.x 302 Moved Temporarily\r\n".getBytes());

        responseContent.write("Location: ".getBytes());
        responseContent.write(redirectUrl.getBytes());
        responseContent.write("\r\n".getBytes());

        responseContent.write("\r\n".getBytes());

        debugClientResponse.write("----- FUNNEL->CLIENT RESPONSE HEADERS -----\r\n".getBytes());
        responseContent.writeTo(debugClientResponse);

        responseContent.writeTo(response);
        response.flush();
    }
}
