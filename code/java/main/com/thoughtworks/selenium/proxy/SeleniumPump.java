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

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

/**
 * This handleRequest looks for a HTTP Content-Length header and limits the number of bytes
 * pumped to its cvalue if it exists.
 */
public class SeleniumPump implements Pump {
    public static final int BLOCK_SIZE = 2048;
    private static final byte[] NEW_LINE = "\r\n".getBytes();

    public void pump(InputStream in, OutputStream out) throws IOException {
        LineInputStream lineInputStream = new LineInputStream(in);
        pumpStatusLine(lineInputStream, out);
        int contentLength = pumpHeader(lineInputStream, out);
        pumpBody(contentLength, in, out);
        out.flush();
    }

    private void pumpBody(int contentLength, InputStream in, OutputStream out) throws IOException {
        boolean shouldRead = true;
        int totalBytesRead = 0;
        int bytesRead;
        byte[] response = new byte[BLOCK_SIZE];
        while (shouldRead) {
            int toRead;
            toRead = getNumberOfBytesToRead(contentLength, totalBytesRead);

            bytesRead = in.read(response, 0, toRead);
            totalBytesRead += bytesRead;
            if (bytesRead > -1) {
                out.write(response, 0, bytesRead);
            }

            shouldRead = shouldRead(bytesRead, contentLength, totalBytesRead);
        }
    }

    private boolean shouldRead(int bytesRead, int contentLength, int totalBytesRead) {
        boolean shouldRead;
        shouldRead = bytesRead > -1;
        if(contentLength != -1) {
            shouldRead = shouldRead && totalBytesRead < contentLength;
        }
        return shouldRead;
    }

    private int getNumberOfBytesToRead(int contentLength, int totalBytesRead) {
        int toRead;
        toRead = BLOCK_SIZE;
        if(contentLength != -1) {
            int totalRemaining = contentLength - totalBytesRead;
            toRead = Math.min(totalRemaining, BLOCK_SIZE);
        }
        return toRead;
    }

    private void pumpStatusLine(LineInputStream lineInputStream, OutputStream out) throws IOException {
        String statusLine = lineInputStream.readLine();
        out.write(statusLine.getBytes());
    }

    private int pumpHeader(LineInputStream lineInputStream, OutputStream out) throws IOException {
        int contentLength = -1;

        String headerData = null;
        while (!"\r\n".equals((headerData = lineInputStream.readLine()))) {
            int colonSpace = headerData.indexOf(": ");
            String key = headerData.substring(0, colonSpace);
            if(key.equalsIgnoreCase("content-length")) {
                String value = headerData.substring(colonSpace + 2).trim();
                contentLength = Integer.parseInt(value);
            }
            out.write(headerData.getBytes());
        }
        out.write(NEW_LINE);
        return contentLength;
    }
}
