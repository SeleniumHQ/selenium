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

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.Socket;

/**
 * @version $Id: RedirectingRelay.java,v 1.8 2004/11/15 10:44:38 mikemelia Exp $
 */
public class RedirectingRelay implements Relay {
    private static final Log LOG = LogFactory.getLog(RedirectingRelay.class);
    private static final int protocolLength = SeleniumHTTPRequest.SELENIUM_REDIRECT_PROTOCOL.length();
    private final RequestInput requestInput;
    private final OutputStream responseStream;
    private final RequestModificationCommand requestModificationCommand;

    public RedirectingRelay(RequestInput requestInput,
                            OutputStream responseStream,
                            RequestModificationCommand requestModificationCommand) {
        this.requestInput = requestInput;
        this.responseStream = responseStream;
        this.requestModificationCommand = requestModificationCommand;
    }


    public void relay() throws IOException {
        HTTPRequest request = requestInput.readRequest();
        if (!hasBeenRedirected(request.getUri())) {
            byte[] redirectMessage = redirectResponse(request).getBytes();
            responseStream.write(redirectMessage);
            responseStream.flush();
        } else {
            sendToIntendedTarget(request);
        }
    }

    private boolean hasBeenRedirected(String uri) {
        return uri.startsWith(SeleniumHTTPRequest.SELENIUM_REDIRECT_PROTOCOL + SeleniumHTTPRequest.SELENIUM_REDIRECT_SERVER);
    }

    private void sendToIntendedTarget(HTTPRequest request) {
        requestModificationCommand.execute(request);
        String requestToDest = request.getRequest();
        LOG.debug("Writing\n" + requestToDest);
        int port = request.getDestinationPort();
        String dest = request.getDestinationServer();
        LOG.debug("Connecting to " + dest + " on " + port);
        try {
            Socket destinationSocket = new Socket(dest, port);
            OutputStream destStream = destinationSocket.getOutputStream();
            InputStream backStream = destinationSocket.getInputStream();
            destStream.write(requestToDest.getBytes());
            destStream.flush();
            Pump pump = new SeleniumPump(backStream, responseStream);
            pump.pump();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private String redirectResponse(HTTPRequest request) {
        final String protocol = request.getProtocol();
        final String uri = request.getUri();
        String response = protocol + " 302 Moved Temporarily\r\nLocation: " +
                          SeleniumHTTPRequest.SELENIUM_REDIRECT_URI  +
                          uri.substring(protocolLength) + "\r\n";
        LOG.debug("Redirected Response\n" + response);
        return response;
    }

}
