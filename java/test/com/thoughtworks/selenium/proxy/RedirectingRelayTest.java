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

import org.jmock.Mock;
import org.jmock.MockObjectTestCase;

import java.io.IOException;
import java.io.ByteArrayOutputStream;

/**
 * @version $Id: RedirectingRelayTest.java,v 1.3 2004/11/13 05:33:36 ahelleso Exp $
 */
public class RedirectingRelayTest extends MockObjectTestCase {

    public void testRedirectsForNonLocalHostTarget() throws IOException {
        Mock requestInput = mock(RequestInput.class);
        String requestString = "GET / HTTP/1.1\r\n" +
                "Host: www.amazon.com\r\n" +
                "User-Agent: Mozilla/5.0 (Windows; U; Windows NT 5.1; rv:1.7.3) Gecko/20041001 Firefox/0.10.1\r\n" +
                "Accept: text/xml,application/xml,application/xhtml+xml,text/html;q=0.9,text/plain;q=0.8,image/png,*/*;q=0.5\r\n" +
                "Accept-Language: en-us,en;q=0.5\r\n" +
                "Accept-Encoding: gzip,deflate\r\n" +
                "Accept-Charset: ISO-8859-1,utf-8;q=0.7,*;q=0.7\r\n" +
                "Keep-Alive: 300\r\n" +
                "Connection: keep-alive\r\n" +
                "Cookie: ubid-main=430-3192711-5866740; x-main=0Kg9EtBCc5sIT3F4SxI@rzDXq7fNqa0Z; session-id-time=1099900800; session-id=102-3724782-9228157";
        HTTPRequest request = new HTTPRequest(requestString);
        requestInput.expects(once()).method("readRequest").withNoArguments().will(returnValue(request));

        String expectedResponse = "HTTP/1.1 302 Moved Temporarily\r\nLocation: http://localhost:9999/selenium/\r\n";
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        RedirectingRelay relay = new RedirectingRelay((RequestInput) requestInput.proxy(), out, null);
        relay.relay();

        assertEquals(expectedResponse, new String(out.toByteArray()));
    }
}
