package com.thoughtworks.selenium.proxy;
/*
  Copyright 2004 ThoughtWorks, Inc. 
  
  Licensed under the Apache License, Version 2.0 (the "License"); 
  you may not use this file except in compliance with the License. 
  You may obtain a copy of the License at 
  
      http://www.apache.org/licenses/LICENSE-2.0 
  
  Unless required by applicable law or agreed to in writing, software 
  distributed under the License is distributed on an "AS IS" BASIS, 
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. 
  See the License for the specific language governing permissions and 
  limitations under the License. 
*/

import java.io.IOException;
import java.io.OutputStream;

import junit.framework.TestCase;

/**
 * @version $Id: DefaultResponseStreamTest.java,v 1.1 2004/11/11 12:19:49 mikemelia Exp $
 */
public class DefaultResponseStreamTest extends TestCase {

    public void testWritesToStreamAndFlushes() {
        DummyStream dummyStream = new DummyStream();
        ResponseStream stream = new DefaultResponseStream(dummyStream);
        String testString = "kjasdhsduyiyoayuoyusdyaosdouo";
        stream.write(testString.getBytes(), testString.length());
        assertEquals(testString.length(), dummyStream.getNumBytesWritten());
        assertEquals(testString.length(), dummyStream.getNumBytesFlushed());
    }

    private final class DummyStream extends OutputStream {
        private int numBytesWritten = 0;
        private int numBytesFlushed = 0;

        public int getNumBytesWritten() {
            return numBytesWritten;
        }

        public int getNumBytesFlushed() {
            return numBytesFlushed;
        }

        public void write(int b) throws IOException {
        }

        public void write(byte b[]) throws IOException {
            numBytesWritten += b.length;
        }

        public void flush() throws IOException {
            numBytesFlushed = numBytesWritten;
        }
    }
}
