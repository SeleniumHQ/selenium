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

/**
 * @version $Id: SeleniumPumpTest.java,v 1.2 2004/11/15 18:35:02 ahelleso Exp $
 */
public class SeleniumPumpTest extends TestCase {

    public void testPumpsReceivedDataBackOut() throws IOException {
        String jabber = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        ByteArrayInputStream in = new ByteArrayInputStream(jabber.getBytes());
        ByteArrayOutputStream out = new ByteArrayOutputStream(SeleniumPump.BLOCK_SIZE);

        Pump pump = new SeleniumPump(in, out);
        pump.pump();
        assertEquals(jabber, out.toString());
    }

    public void testMoreDataThanBlockSizePumped() throws IOException {
        String jabber = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        StringBuffer buff = new StringBuffer(5000);
        for (int i = 0; i < 100; ++i) {
            buff.append(jabber);
        }
        ByteArrayInputStream in = new ByteArrayInputStream(buff.toString().getBytes());
        ByteArrayOutputStream out = new ByteArrayOutputStream(5000);

        Pump pump = new SeleniumPump(in, out);
        pump.pump();
        assertEquals(2600, out.toString().length());
    }

    public void testOnlyPumpsContentLengthBytes() throws IOException {
    }
}
