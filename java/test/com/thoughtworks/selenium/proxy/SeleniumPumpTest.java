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

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;

/**
 * @version $Id: SeleniumPumpTest.java,v 1.4 2004/11/15 23:37:53 ahelleso Exp $
 */
public class SeleniumPumpTest extends TestCase {

    public void testShouldOnlyPumpContentLengthBytesWhenSpecified() throws IOException {
        String data = "" +
                "HTTP/1.1 200 OK\r\n" +
                "Content-Length: 4\r\n" +
                "\r\n" +
                "this";
        String excess = " but not this";
        String excessData = data + excess;

        InputStream excessResponse = new ByteArrayInputStream(excessData.getBytes());
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Pump pump = new SeleniumPump();
        pump.pump(excessResponse, out);
        String pumped = new String(out.toByteArray());
        assertEquals(data, pumped);

        // the remainder should be left
        byte[] excessBytes = new byte[excess.length()];
        excessResponse.read(excessBytes);
        assertEquals(" but not this", new String(excessBytes));
    }

    public void testShouldPumpUntilEndWhenContentLengthNotSpecified() throws IOException {
        String data = "" +
                "HTTP/1.1 200 OK\r\n" +
                "\r\n" +
                "this";

        InputStream response = new ByteArrayInputStream(data.getBytes());
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Pump pump = new SeleniumPump();
        pump.pump(response, out);
        String pumped = new String(out.toByteArray());
        assertEquals(data, pumped);

        // there should be no remainder
        assertEquals(-1, response.read());
    }
}
