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

import com.thoughtworks.selenium.utils.Assert;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import java.io.*;
import java.net.Socket;

/**
 * @version $Id: RedirectingRelay.java,v 1.1 2004/11/11 12:19:48 mikemelia Exp $
 */
public class RedirectingRelay implements Relay {
    private static final Log LOG = LogFactory.getLog(RedirectingRelay.class);
    private final RequestStream requestStream;
    private final ResponseStream responseStream;
    private final RequestModificationCommand requestModificationCommand;

    public RedirectingRelay(RequestStream requestStream,
                            ResponseStream responseStream,
                            RequestModificationCommand requestModificationCommand) {
        Assert.assertIsTrue(requestStream != null, "requestStream can't be null");
        Assert.assertIsTrue(responseStream != null, "responseStream can't be null");
        Assert.assertIsTrue(requestModificationCommand != null, "requestModificationCommand can't be null");
        this.requestStream = requestStream;
        this.responseStream = responseStream;
        this.requestModificationCommand = requestModificationCommand;
    }


    public void relay() {
        HTTPRequest request = requestStream.read();
        if (!isLocalHost(request)) {
            byte[] redirectMessage = redirectResponse(request).getBytes();
            responseStream.write(redirectMessage, redirectMessage.length);
            responseStream.flush();
        } else {
            sendToIntendedTarget(request);
        }
    }

    private void sendToIntendedTarget(HTTPRequest request) {
        requestModificationCommand.execute(request);
        String requestToDest = request.getRequest();
        System.out.println("Writing\n" + requestToDest);
        String dest = request.getDestinationServer();
        int port = request.getDestinationPort();
        System.out.println("Connecting to " + dest + " on " + port);
        try {
            Socket destinationSocket = new Socket(dest, port);
            OutputStream destStream = new BufferedOutputStream(destinationSocket.getOutputStream());
            InputStream backStream = new BufferedInputStream(destinationSocket.getInputStream());
            destStream.write(requestToDest.getBytes());
            destStream.flush();
            getResponse(backStream, responseStream);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private void getResponse(InputStream inputStream, ResponseStream clientOutputStream) throws IOException {
        int bytesRead = 0;
        byte[] response = new byte[8192];
        while (bytesRead > -1) {
            bytesRead = inputStream.read(response);
            if (bytesRead > -1) {
                clientOutputStream.write(response, bytesRead);
                System.out.println("Number of bytes returned = " + bytesRead);
                System.out.println("RESPONSE\n" + new String(response, 0, bytesRead));
            }
        }
        clientOutputStream.flush();
    }

    private String redirectResponse(HTTPRequest request) {
        String response = request.getProtocol() + " 302 Moved Temporarily\r\nLocation: " +
                          HTTPRequest.SELENIUM_REDIRECT_URI  +
                          request.getUri().substring(7) + "\r\n";
        System.out.println("Response\n" + response);
        return response;
    }

    private boolean isLocalHost(HTTPRequest request) {
        return request.getHost().equals(HTTPRequest.SELENIUM_REDIRECT_SERVER);
    }

}
