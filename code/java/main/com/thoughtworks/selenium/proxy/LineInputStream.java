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

import java.io.FilterInputStream;
import java.io.IOException;
import java.io.InputStream;

/**
 * A reader which preserves EOL when reading lines.
 *
 * @author Aslak Helles&oslash;y
 * @version $Revision: 1.1 $
 */
public class LineInputStream extends FilterInputStream {
    private final StringBuffer sb = new StringBuffer();
    private char lastChar = (char) -1;
    private boolean backlog = false;

    public LineInputStream(InputStream in) {
        super(in);
    }

    /**
     * Reads a line, including the line separator at the end, i.e either
     * \n, \r or \r\n. If the last line doesn't have a line ending, it is returned as is.
     *
     * @return a line with line separator, or null if EOF.
     * @throws IOException
     */
    public String readLine() throws IOException {
        while (true) {
            char c = (char) in.read();
            if (c == (char) -1) {
                if (sb.length() > 0) {
                    final String result = sb.toString();
                    sb.delete(0, result.length());
                    return result;
                } else {
                    return null;
                }
            }

            if (c == '\n') {
                if (backlog) {
                    sb.append(lastChar);
                    backlog = false;
                }
                sb.append(c);
                final String result = sb.toString();
                sb.delete(0, result.length());
                lastChar = c;
                return result;
            } else if (lastChar == '\r') {
                if (backlog) {
                    sb.append(lastChar);
                }
                backlog = true;
                lastChar = c;
                final String result = sb.toString();
                sb.delete(0, result.length());
                return result;
            } else {
                if (backlog) {
                    sb.append(lastChar);
                    backlog = false;
                }
                sb.append(c);
                lastChar = c;
            }
        }
    }
}
