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

import com.thoughtworks.selenium.utils.Assert;

import java.io.BufferedWriter;
import java.io.IOException;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.io.InputStream;
import java.io.ByteArrayInputStream;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

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
    private String uri;
    private String protocol;
    private Map headers = new HashMap();
    private String destinationServer;
    private int destinationPort;

    /**
     * @deprecated Use {@link #SeleniumHTTPRequest(java.io.InputStream)}
     */
    public SeleniumHTTPRequest(String request) throws IOException {
        this(new ByteArrayInputStream(request.getBytes()));
    }

    public SeleniumHTTPRequest(InputStream in) throws IOException {
        parse(in);
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

    public String getHost() {
        return getHeaderField("Host");
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
        this.protocol = protocol;
    }

    private void parse(InputStream in) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(in));
        parseFirstLine(br);

        String line = null;
        // loop until the end of the header - \r\n
        while((line = br.readLine()) != null) {
            if(!"".equals(line)) {
                parseHeaderLine(line);
            } else {
                break;
            }
        }
    }

    private void parseHeaderLine(String line) {
        String[] elements = line.split(": ");
        final String key = elements[0];
        final String value = elements[1];
        setHeaderField(key, value);
    }

    private void parseFirstLine(BufferedReader br) throws IOException {
        String line = br.readLine();
        String[] elements = line.split(" ");
        setUri(elements[1]);
        if (elements.length > 2) {
            protocol = elements[2];
        }
    }

    public String getHeaderField(String fieldId) {
        return (String) headers.get(fieldId);
    }

    public void writeTo(OutputStream out) throws IOException {
        BufferedWriter sw = new BufferedWriter(new OutputStreamWriter(out));
        // TODO: parse this
        String method = "GET";
        sw.write(method + " " + uri + " " + protocol + CRLF);
        for (Iterator i = headers.keySet().iterator(); i.hasNext();) {
            String key =  (String) i.next();
            sw.write(key);
            sw.write(": ");
            sw.write((String) headers.get(key));
            sw.write(CRLF);
        }
        sw.write(CRLF);
        sw.flush();
    }

    public void setHost(String host) {
        headers.put("Host", host);
    }

    public void setHeaderField(String key, String value) {
        headers.put(key, value);
    }

    public boolean equals(Object o) {
        SeleniumHTTPRequest other = (SeleniumHTTPRequest) o;
        return headers.equals(other.headers);
    }
}
