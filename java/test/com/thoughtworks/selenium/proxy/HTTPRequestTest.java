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

import java.text.MessageFormat;
import java.util.List;
import java.util.Arrays;
import java.util.Iterator;

import junit.framework.TestCase;

/**
 * @version $Id: HTTPRequestTest.java,v 1.2 2004/11/13 05:00:09 ahelleso Exp $
 */
public class HTTPRequestTest extends TestCase {
    // relying on defs found at http://www.w3.org/Protocols/HTTP/Request.html
    public void testHandlesSimpleRequest() {
        String method = "GET";
        String uri = "http://www.google.com/";
        String request = method + " " + uri + "\r\n";
        HTTPRequest httpRequest = new HTTPRequest(request);
        assertEquals(method, httpRequest.getMethod());
        assertEquals(uri, httpRequest.getUri());
    }

    public void testHandlesFullRequest() {
        String method = "GET";
        String uri = "http://www.amazon.com/";
        String protocol = "HTTP/1.1";
        String host = "www.amazon.com";
        String acceptEncoding = "gzip,deflate";
        String request = "GET {0} {1}\r\n" +
                "Host: {2}\r\n" +
                "User-Agent: Mozilla/5.0 (Windows; U; Windows NT 5.1; rv:1.7.3) Gecko/20041001 Firefox/0.10.1\r\n" +
                "Accept: text/xml,application/xml,application/xhtml+xml,text/html;q=0.9,text/plain;q=0.8,image/png,*/*;q=0.5\r\n" +
                "Accept-Language: en-us,en;q=0.5\r\n" +
                "Accept-Encoding: {3}\r\n" +
                "Accept-Charset: ISO-8859-1,utf-8;q=0.7,*;q=0.7\r\n" +
                "Keep-Alive: 300\r\n" +
                "Connection: keep-alive\r\n" +
                "Cookie: ubid-main=430-3192711-5866740; x-main=0Kg9EtBCc5sIT3F4SxI@rzDXq7fNqa0Z";
        String fullRequest = MessageFormat.format(request, new Object[] {uri, protocol, host, acceptEncoding});
        HTTPRequest httpRequest = new HTTPRequest(fullRequest);
        assertEquals(method, httpRequest.getMethod());
        assertEquals(uri, httpRequest.getUri());
        assertEquals(host, httpRequest.getHost());
        assertEquals(acceptEncoding, httpRequest.getHeaderField("Accept-Encoding"));
    }

    public void testHandlesFullRequestWithPort() {
        String method = "GET";
        String uri = "http://www.amazon.com:80//exec/obidos/subst/home/home.html";
        String protocol = "HTTP/1.1";
        String host = "www.amazon.com:80";
        String acceptEncoding = "gzip,deflate";
        String request = "GET {0} {1}\r\n" +
                "Host: {2}\r\n" +
                "User-Agent: Mozilla/5.0 (Windows; U; Windows NT 5.1; rv:1.7.3) Gecko/20041001 Firefox/0.10.1\r\n" +
                "Accept: text/xml,application/xml,application/xhtml+xml,text/html;q=0.9,text/plain;q=0.8,image/png,*/*;q=0.5\r\n" +
                "Accept-Language: en-us,en;q=0.5\r\n" +
                "Accept-Encoding: {3}\r\n" +
                "Accept-Charset: ISO-8859-1,utf-8;q=0.7,*;q=0.7\r\n" +
                "Keep-Alive: 300\r\n" +
                "Connection: keep-alive\r\n" +
                "Cookie: ubid-main=430-3192711-5866740; x-main=0Kg9EtBCc5sIT3F4SxI@rzDXq7fNqa0Z";
        String fullRequest = MessageFormat.format(request, new Object[] {uri, protocol, host, acceptEncoding});
        HTTPRequest httpRequest = new HTTPRequest(fullRequest);
        assertEquals(method, httpRequest.getMethod());
        assertEquals(uri, httpRequest.getUri());
        assertEquals(host, httpRequest.getHost());
        assertEquals(acceptEncoding, httpRequest.getHeaderField("Accept-Encoding"));
    }
    
    public void testReconstructsCorrectRequestWithAdditionalProxyAuthorizationField() {
        String request = "GET /dir/page HTTP/1.0\r\n" +
                "Host: www.thoughtworks.com\r\n" +
                "User-Agent: Mozilla/5.0 (Windows; U; Windows NT 5.1; rv:1.7.3) Gecko/20041001 Firefox/0.10.1\r\n" +
                "Accept: text/xml,application/xml,application/xhtml+xml,text/html;q=0.9,text/plain;q=0.8,image/png,*/*;q=0.5\r\n" +
                "Accept-Language: en-us,en;q=0.5\r\n" +
                "Accept-Encoding: gzip,deflate\r\n" +
                "Accept-Charset: ISO-8859-1,utf-8;q=0.7,*;q=0.7\r\n" +
                "Keep-Alive: 300\r\n" +
                "Connection: keep-alive\r\n" +
                "Cookie: ubid-main=430-3192711-5866740; x-main=0Kg9EtBCc5sIT3F4SxI@rzDXq7fNqa0Z";

        HTTPRequest httpRequest = new HTTPRequest(request);
        String rebuiltRequest = httpRequest.getRequest();
        assertTrue(rebuiltRequest.startsWith("GET /dir/page HTTP/1.0\r\n"));

        assertContainsSame(request, rebuiltRequest);
    }

    private void assertContainsSame(String expectedRequest, String rebuiltRequest) {
        List expectedList = getTextLinesAsList(expectedRequest);
        List retrievedList = getTextLinesAsList(rebuiltRequest);
// We can't expect the size to be the same - there might be additional headers in the rebuiltRequest (such as Proxy-Authorization)
//        assertEquals(expectedList.size(), retrievedList.size());
        for (Iterator i = expectedList.iterator(); i.hasNext();) {
            assertTrue(retrievedList.contains(i.next()));
        }
    }

    private List getTextLinesAsList(String text) {
        String [] lines = text.split("\r\n");
        return Arrays.asList(lines);
    }
}
