/*
Copyright (c) 2003 ThoughtWorks, Inc. All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

   1. Redistributions of source code must retain the above copyright notice,
      this list of conditions and the following disclaimer.

   2. Redistributions in binary form must reproduce the above copyright notice,
      this list of conditions and the following disclaimer in the documentation
      and/or other materials provided with the distribution.

   3. The end-user documentation included with the redistribution, if any, must
      include the following acknowledgment:

          This product includes software developed by ThoughtWorks, Inc.
          (http://www.thoughtworks.com/).

      Alternately, this acknowledgment may appear in the software itself, if and
      wherever such third-party acknowledgments normally appear.

   4. The names "CruiseControl", "CruiseControl.NET", "CCNET", and
      "ThoughtWorks, Inc." must not be used to endorse or promote products derived
      from this software without prior written permission. For written permission,
      please contact opensource@thoughtworks.com.

   5. Products derived from this software may not be called "Selenium" or
      "ThoughtWorks", nor may "Selenium" or "ThoughtWorks" appear in their name,
      without prior written permission of ThoughtWorks, Inc.


THIS SOFTWARE IS PROVIDED ``AS IS'' AND ANY EXPRESSED OR IMPLIED WARRANTIES,
INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THOUGHTWORKS
INC OR ITS CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT
OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY
OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH
DAMAGE.
*/
package com.thoughtworks.selenium.proxy;

import org.jmock.MockObjectTestCase;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;

/**
 * @version $Id: DefaultRequestStreamTest.java,v 1.4 2004/11/13 06:16:07 ahelleso Exp $
 */
public class DefaultRequestStreamTest extends MockObjectTestCase {
    
    public void testReadsWholeBufferWhileBlocking() throws IOException {
        
        byte[] testBuffer = new byte[20000];
        for (int i = 0; i < testBuffer.length; ++i) {
            testBuffer[i] = 'a';
        }
        String bufferString = new String(testBuffer);
        String testString = "GET /exec/obidos/subst/home/home.html/102-3724782-9228157 HTTP/1.1\r\n" +
                            "Host: www.amazon.com\r\n" +
                            "User-Agent: Mozilla/5.0 (Windows; U; Windows NT 5.1; rv:1.7.3) Gecko/20041001 Firefox/0.10.1\r\n" +
                            "Accept: text/xml,application/xml,application/xhtml+xml,text/html;q=0.9,text/plain;q=0.8,image/png,*/*;q=0.5\r\n" +
                            "Accept-Language: en-us,en;q=0.5\r\n" +
                            "Accept-Encoding: gzip,deflate\r\n" +
                            "Accept-Charset: ISO-8859-1,utf-8;q=0.7,*;q=0.7\r\n" +
                            "Keep-Alive: 300\r\n" +
                            "Connection: keep-alive\r\n" +
                            "Cookie: ubid-main=430-3192711-5866740; x-main=0Kg9EtBCc5sIT3F4SxI@rzDXq7fNqa0Z; session-id-time=1099900800; session-id=102-3724782-9228157\r\n" +
                            "Dummy-Data: " + bufferString + "\r\n";
        InputStream byteStream = new ByteArrayInputStream(testString.getBytes());
        RequestInput input = new RequestInputStream(byteStream);
        assertEquals(bufferString, input.readRequest().getHeaderField("Dummy-Data"));
    }
}
