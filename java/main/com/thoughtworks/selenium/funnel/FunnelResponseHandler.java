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

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.ByteArrayOutputStream;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * @author Aslak Helles&oslash;y
 * @version $Revision: 1.2 $
 */
public class FunnelResponseHandler {
    private static final int BLOCK_SIZE = 2048;
    private static final Pattern STATUS_CODE_PATTERN = Pattern.compile("HTTP/1\\..\\s([0-9]*).*", Pattern.DOTALL + Pattern.CASE_INSENSITIVE);
    private static final Pattern CONTENT_LENGTH_PATTERN = Pattern.compile("Content-Length:\\s([0-9]*).*", Pattern.DOTALL + Pattern.CASE_INSENSITIVE);
    private static final Pattern COOKIE_PATTERN = Pattern.compile("domain=([^;])");

    private final Relay relay;
    private final OutputStream debugServerResponse;
    private final OutputStream debugClientResponse;

    public FunnelResponseHandler(Relay relay, OutputStream debugServerResponse, OutputStream debugClientResponse) {
        this.relay = relay;
        this.debugServerResponse = debugServerResponse;
        this.debugClientResponse = debugClientResponse;
    }

    public void handleResponse(InputStream serverIn, OutputStream clientResponse, String host) throws IOException {
        pumpHeader(serverIn, clientResponse, host);
    }

    private void pumpHeader(InputStream serverIn, OutputStream clientResponse, String host) throws IOException {
        LineInputStream lineInputStream = new LineInputStream(serverIn);

        ByteArrayOutputStream originalResponseFromServer = new ByteArrayOutputStream();
        ByteArrayOutputStream modifiedResponseFromServer = new ByteArrayOutputStream();

        // Read status line
        String statusLine = lineInputStream.readLine();
        originalResponseFromServer.write(statusLine.getBytes());
        modifiedResponseFromServer.write(statusLine.getBytes());

        Matcher statusCodeMatcher = STATUS_CODE_PATTERN.matcher(statusLine);
        int statusCode = 0;
        if (statusCodeMatcher.matches()) {
            statusCode = Integer.parseInt(statusCodeMatcher.group(1));
        }

        // Read headers
        int contentLength = -1;
        boolean closeConnection = false;
        String headerData = null;
        while (!"\r\n".equals((headerData = lineInputStream.readLine()))) {
            originalResponseFromServer.write(headerData.getBytes());

            Matcher cookieMatcher = COOKIE_PATTERN.matcher(headerData);
            Matcher contentLengthMatcher = CONTENT_LENGTH_PATTERN.matcher(headerData);

            // Replace cookies' domain with our own
            if (cookieMatcher.find()) {
                StringBuffer buffer = new StringBuffer();
                cookieMatcher.appendReplacement(buffer, "domain=127.0.0.1");
                headerData = buffer.toString().trim() + "\r\n";
            } else if(contentLengthMatcher.matches()) {
                contentLength = Integer.parseInt(contentLengthMatcher.group(1));
            } else if("Connection: close".equalsIgnoreCase(headerData.trim())) {
                closeConnection = true;
            }
            modifiedResponseFromServer.write(headerData.getBytes());
        }

        // Set a cookie that will expire at the end of the conversation.
        // http://compnetworking.about.com/gi/dynamic/offsite.htm?site=http%3A%2F%2Fhome.netscape.com%2Fnewsref%2Fstd%2Fcookie_spec.html
        if (host != null) {
            String setCookie = "Set-Cookie: SELENIUM=" + host + "; path=/; domain=127.0.0.1\r\n";
            modifiedResponseFromServer.write(setCookie.getBytes());
        }

        originalResponseFromServer.write("\r\n".getBytes());
        modifiedResponseFromServer.write("\r\n".getBytes());

        debugServerResponse.write("----- SERVER->FUNNEL RESPONSE HEADERS -----\r\n".getBytes());
        originalResponseFromServer.writeTo(debugServerResponse);

        debugClientResponse.write("----- FUNNEL->CLIENT RESPONSE HEADERS -----\r\n".getBytes());
        modifiedResponseFromServer.writeTo(debugClientResponse);

        modifiedResponseFromServer.writeTo(clientResponse);

        if (statusCode == 200) {
            pumpBody(contentLength, serverIn, clientResponse);
        }
        if (closeConnection) {
            relay.close();
        }
    }

    private void pumpBody(int contentLength, InputStream serverIn, OutputStream clientResponse) throws IOException {
        boolean shouldRead = true;
        int totalBytesRead = 0;
        int bytesRead;
        byte[] response = new byte[BLOCK_SIZE];
        while (shouldRead) {
            int toRead;
            toRead = getNumberOfBytesToRead(contentLength, totalBytesRead);

            bytesRead = serverIn.read(response, 0, toRead);
            totalBytesRead += bytesRead;
            if (bytesRead > -1) {
                clientResponse.write(response, 0, bytesRead);
                shouldRead = contentLength == -1 || totalBytesRead < contentLength;
            } else {
                shouldRead = false;
            }
        }
    }

    private int getNumberOfBytesToRead(int contentLength, int totalBytesRead) {
        int toRead;
        toRead = BLOCK_SIZE;
        if (contentLength != -1) {
            int totalRemaining = contentLength - totalBytesRead;
            toRead = Math.min(totalRemaining, BLOCK_SIZE);
        }
        return toRead;
    }

}
