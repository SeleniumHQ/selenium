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
import junit.framework.TestCase;

import java.text.MessageFormat;
import java.util.Arrays;
import java.util.Iterator;
import java.util.List;

/**
 * @version $Id: SeleniumHTTPRequestTest.java,v 1.1 2004/11/14 06:25:53 mikemelia Exp $
 */
public class SeleniumHTTPRequestTest extends TestCase {
    // relying on defs found at http://www.w3.org/Protocols/HTTP/Request.html
    public void testHandlesSimpleRequest() {
        String method = "GET";
        String uri = "http://www.google.com/";
        String request = method + " " + uri + "\r\n";
        HTTPRequest httpRequest = new SeleniumHTTPRequest(request);
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
        HTTPRequest httpRequest = new SeleniumHTTPRequest(fullRequest);
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
        HTTPRequest httpRequest = new SeleniumHTTPRequest(fullRequest);
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

        HTTPRequest httpRequest = new SeleniumHTTPRequest(request);
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
