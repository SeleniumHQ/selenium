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

import com.thoughtworks.selenium.utils.Assert;

import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

/**
 * @version $Id: SeleniumHTTPRequest.java,v 1.2 2004/11/13 06:16:05 ahelleso Exp $
 */
public class SeleniumHTTPRequest implements HTTPRequest {
    public static final String SELENIUM_REDIRECT_SERVERNAME = "localhost";
    public static final String SELENIUM_REDIRECT_PORT = "9999";
    public static final String SELENIUM_REDIRECT_SERVER = SELENIUM_REDIRECT_SERVERNAME + ":" +
                                                          SELENIUM_REDIRECT_PORT;
    public static final String SELENIUM_REDIRECT_DIR = "/selenium/";
    public static final String SELENIUM_REDIRECT_PROTOCOL = "http://";
    public static final String SELENIUM_REDIRECT_URI = SELENIUM_REDIRECT_PROTOCOL +
                                                       SELENIUM_REDIRECT_SERVER +
                                                       SELENIUM_REDIRECT_DIR;
    private static final String auth = System.getProperties().get("http.proxy.user") + ":" +
                                       System.getProperties().get("http.proxy.password");
    private String method;
    private String uri;
    private String protocol;
    private Map headers = new HashMap();
    private String original;
    private String destinationServer;
    private int destinationPort;

    public SeleniumHTTPRequest(String request) {
        original = request;
        parse(request);
        headers.put("Proxy-Authorization", "Basic " + new sun.misc.BASE64Encoder().encode(auth.getBytes()));
    }

    public String getDestinationServer() {
        return destinationServer;
    }

    public void setDestinationServer(String destinationServer) {
        this.destinationServer = destinationServer;
    }

    public int getDestinationPort() {
        return destinationPort;
    }

    public void setDestinationPort(int destinationPort) {
        this.destinationPort = destinationPort;
    }

    public String getMethod() {
        return method;
    }

    public String getHost() {
        return getHeaderField("Host");
    }

    public void setMethod(String method) {
        Assert.assertIsTrue(method != null, "method can't be null");
        this.method = new String(method);
    }

    public String getUri() {
        return uri;
    }

    public void setUri(String uri) {
        Assert.assertIsTrue(uri != null, "uri can't be null");
        this.uri = uri;
    }

    public String getProtocol() {
        return protocol;
    }

    public void setProtocol(String protocol) {
        Assert.assertIsTrue(protocol != null, "protocol can't be null");
        this.protocol = protocol;
    }

    private void parse(String request) {
        String [] lines = request.split(CRLF);
        parseFirstLine(lines[0]);
        for (int i = 1; i < lines.length; ++i) {
            parseLine(lines[i]);
        }
    }

    private void parseLine(String line) {
        String[] elements = line.split(": ");
        setHeaderField(elements[0], elements[1]);
    }

    private void parseFirstLine(String line) {
        // TODO validate these elements
        String[] elements = line.split(" ");
        setMethod(elements[0]);
        setUri(elements[1]);
        if (elements.length > 2) {
            protocol = elements[2];
        }
    }

    public String getHeaderField(String fieldId) {
        return (String) headers.get(fieldId);
    }

    public String getRequest() {
        StringBuffer buff = new StringBuffer(method);
        buff.append(" " + uri + " " + protocol + CRLF);
        for (Iterator i = headers.keySet().iterator(); i.hasNext();) {
            String key =  (String) i.next();
            buff.append(key + ": " + headers.get(key) + CRLF);
        }
        buff.append(CRLF);
        String request = String.valueOf(buff);
        return request;
    }

    public void setHost(String host) {
        headers.put("Host", host);
    }

    public String getOriginalRequest() {
        return original;
    }

    public void setHeaderField(String key, String value) {
        headers.put(key, value);
    }
}
