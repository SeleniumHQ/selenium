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

import java.net.URISyntaxException;
import java.util.Properties;

/**
 * @version $Id: SetupDestinationDetailsCommandTest.java,v 1.5 2004/11/14 06:25:53 mikemelia Exp $
 */
public class SetupDestinationDetailsCommandTest extends TestCase {
    private Properties props;

    public void testIsARequestModificationCommand() {
        assertTrue(RequestModificationCommand.class.isAssignableFrom(SetupDestinationDetailsCommand.class));
    }

    public void testSetsUpCorrectServerAndPortForNonPort80() throws URISyntaxException {
        String expectedServer = "localhost";
        int expectedPort = 8000;
        HTTPRequest httpRequest = new SeleniumHTTPRequest("GET: /site/ " + HTTPRequest.CRLF +
                                                  "Host: " + expectedServer + ":" + expectedPort + HTTPRequest.CRLF);
        SetupDestinationDetailsCommand command = new SetupDestinationDetailsCommand();
        command.execute(httpRequest);
        assertEquals(expectedServer, httpRequest.getDestinationServer());
        assertEquals(expectedPort, httpRequest.getDestinationPort());
    }

    public void testSetsUpCorrectServerAndPortForDefaultPort() throws URISyntaxException {
        String expectedServer = "localhost";
        int expectedPort = 80;
        HTTPRequest httpRequest = new SeleniumHTTPRequest("GET: /site/ " + HTTPRequest.CRLF +
                                                  "Host: " + expectedServer + HTTPRequest.CRLF);
        SetupDestinationDetailsCommand command = new SetupDestinationDetailsCommand();
        command.execute(httpRequest);
        assertEquals(expectedServer, httpRequest.getDestinationServer());
        assertEquals(expectedPort, httpRequest.getDestinationPort());
    }

    public void testSetsUpCorrectServerAndPortIfProxySpecified() {
        String expectedServer = "corpproxy";
        int expectedPort = 8080;

        Properties props = new Properties();
        props.put("http.proxyHost", expectedServer);
        props.put("http.proxyPort", Integer.toString(expectedPort));
        System.setProperties(props);

        HTTPRequest httpRequest = new SeleniumHTTPRequest("GET: /site/ " + HTTPRequest.CRLF +
                                                  "Host: www.amazon.com:9090" + HTTPRequest.CRLF);
        SetupDestinationDetailsCommand command = new SetupDestinationDetailsCommand();
        command.execute(httpRequest);
        assertEquals(expectedServer, httpRequest.getDestinationServer());
        assertEquals(expectedPort, httpRequest.getDestinationPort());
    }

    protected void setUp() throws Exception {
        super.setUp();
        props = System.getProperties();
    }

    protected void tearDown() throws Exception {
        System.setProperties(props);
        super.tearDown();
    }
}
