package com.thoughtworks.selenium.proxy;

import junit.framework.TestCase;

import java.net.URISyntaxException;

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

/**
 * @version $Id: SetupDestinationDetailsCommandTest.java,v 1.3 2004/11/13 05:46:47 ahelleso Exp $
 */
public class SetupDestinationDetailsCommandTest extends TestCase {

    public void testIsARequestModificationCommand() {
        assertTrue(RequestModificationCommand.class.isAssignableFrom(SetupDestinationDetailsCommand.class));
    }
    
    public void testSetsUpCorrectServerAndPortForNonPort80() throws URISyntaxException {
        String expectedServer = "localhost";
        int expectedPort = 8000;
        SeleniumHTTPRequest httpRequest = new SeleniumHTTPRequest("GET: /site/ " + HTTPRequest.CRLF +
                                                  "Host: " + expectedServer + ":" + expectedPort + HTTPRequest.CRLF);
        SetupDestinationDetailsCommand command = new SetupDestinationDetailsCommand();
        command.execute(httpRequest);
        assertEquals(expectedServer, httpRequest.getDestinationServer());
        assertEquals(expectedPort, httpRequest.getDestinationPort());
    }

    public void testSetsUpCorrectServerAndPortForDefaultPort() throws URISyntaxException {
        String expectedServer = "localhost";
        int expectedPort = 80;
        SeleniumHTTPRequest httpRequest = new SeleniumHTTPRequest("GET: /site/ " + HTTPRequest.CRLF +
                                                  "Host: " + expectedServer + HTTPRequest.CRLF);
        SetupDestinationDetailsCommand command = new SetupDestinationDetailsCommand();
        command.execute(httpRequest);
        assertEquals(expectedServer, httpRequest.getDestinationServer());
        assertEquals(expectedPort, httpRequest.getDestinationPort());
    }
}
