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

import com.thoughtworks.selenium.utils.Assert;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

/**
 * @version $Id: SeleniumPump.java,v 1.3 2004/11/15 21:19:21 ahelleso Exp $
 */
public class SeleniumPump implements Pump {
    public static final int BLOCK_SIZE = 2048;
    private InputStream in;
    private OutputStream out;
    private static final byte[] NEW_LINE = "\r\n".getBytes();

    public SeleniumPump(InputStream in, OutputStream out) {
        Assert.assertIsTrue(in != null, "in can't be null");
        Assert.assertIsTrue(out != null, "out can't be null");
        this.in = in;
        this.out = out;
    }

    public void pump() throws IOException {
        pumpStatusLine();
        int contentLength = pumpHeader();
        pumpBody(contentLength);
        out.flush();
    }

    private void pumpBody(int contentLength) throws IOException {
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

    private void pumpStatusLine() throws IOException {
        String statusLine = readLine(in);
        out.write(statusLine.getBytes());
        out.write(NEW_LINE);
    }

    private int pumpHeader() throws IOException {
        int contentLength = -1;

        String headerData = null;
        while (!"".equals((headerData = readLine(in)))) {
            int colonSpace = headerData.indexOf(": ");
            String key = headerData.substring(0, colonSpace);
            if(key.equalsIgnoreCase("content-length")) {
                String value = headerData.substring(colonSpace + 2).trim();
                contentLength = Integer.parseInt(value);
            }
            out.write(headerData.getBytes());
            out.write(NEW_LINE);
        }
        out.write(NEW_LINE);
        return contentLength;
    }

    // reads a line of text from an InputStream.
    // We can't use BufferedReader to do this, since we run the risk
    // of it caching too much (we want to read the content after the header
    // in a different place).
    private String readLine(InputStream in) throws IOException {
        StringBuffer data = new StringBuffer("");
        int c;

        // if we have nothing to read, just return null
        in.mark(1);
        if (in.read() == -1)
            return null;
        else
            in.reset();
        while ((c = in.read()) >= 0) {
            // check for an end-of-line character
            if ((c == 0) || (c == 10) || (c == 13))
                break;
            else
                data.append((char) c);
        }

        // deal with the case where the end-of-line terminator is \r\n
        if (c == 13) {
            in.mark(1);
            if (in.read() != 10)
                in.reset();
        }
        return data.toString();
    }

}
