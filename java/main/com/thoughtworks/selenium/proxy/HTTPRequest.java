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
package com.thoughtworks.selenium.proxy;

import com.thoughtworks.selenium.utils.Assert;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

/**
 * @version $Id: HTTPRequest.java,v 1.5 2004/11/13 05:33:36 ahelleso Exp $
 */
public class HTTPRequest {
    public static final String SELENIUM_REDIRECT_SERVERNAME = "localhost";
    public static final String SELENIUM_REDIRECT_PORT = "9999";
    public static final String SELENIUM_REDIRECT_SERVER = SELENIUM_REDIRECT_SERVERNAME + ":" +
                                                          SELENIUM_REDIRECT_PORT;
    public static final String SELENIUM_REDIRECT_DIR = "/selenium/";
    public static final String SELENIUM_REDIRECT_PROTOCOL = "http://";
    public static final String SELENIUM_REDIRECT_URI = SELENIUM_REDIRECT_PROTOCOL +
                                                       SELENIUM_REDIRECT_SERVER +
                                                       SELENIUM_REDIRECT_DIR;
    public static final String CRLF = "\r\n";
    private static final Log LOG = LogFactory.getLog(RequestInputStream.class);
    private static final String auth = System.getProperties().get("http.proxy.user") + ":" +
                                       System.getProperties().get("http.proxy.password");
    private String method;
    private String uri;
    private String protocol;
    private Map headers = new HashMap();
    private String original;
    private String destinationServer;
    private int destinationPort;

    public HTTPRequest(String request) {
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

    public String getOriginal() {
        return original;
    }

    public void setHeaderField(String key, String value) {
        headers.put(key, value);
    }
}
