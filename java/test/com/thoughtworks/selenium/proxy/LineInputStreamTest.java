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
import java.io.IOException;

/**
 * @author Aslak Helles&oslash;y
 * @version $Revision: 1.1 $
 */
public class LineInputStreamTest extends TestCase {
    public void testShouldPreserveLineEndingsForEachReadLine() throws IOException {
        final String buf = "" +
                        "unix\n" +
                        "mac\r" +
                        "pc\r\n" +
                        "\n" +
                        "\n" +
                        "\r" +
                        "\r" +
                        "\r\n" +
                        "\r\n" +
                        "nolineend";
        LineInputStream variousLineEndings = new LineInputStream(new ByteArrayInputStream(buf.getBytes()));

        assertEquals("unix\n", variousLineEndings.readLine());
        assertEquals("mac\r", variousLineEndings.readLine());
        assertEquals("pc\r\n", variousLineEndings.readLine());
        assertEquals("\n", variousLineEndings.readLine());
        assertEquals("\n", variousLineEndings.readLine());
        assertEquals("\r", variousLineEndings.readLine());
        assertEquals("\r", variousLineEndings.readLine());
        assertEquals("\r\n", variousLineEndings.readLine());
        assertEquals("\r\n", variousLineEndings.readLine());
        assertEquals("nolineend", variousLineEndings.readLine());
    }
}
