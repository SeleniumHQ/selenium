package com.thoughtworks.selenium.proxy;

import junit.framework.TestCase;

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
 * @version $Id: RemoveProxyFromRefererNameCommandTest.java,v 1.3 2004/11/13 05:43:01 ahelleso Exp $
 */
public class RemoveProxyFromRefererNameCommandTest extends TestCase {
    
    public void testIsARequestModificationCommand() {
        assertTrue(RequestModificationCommand.class.isAssignableFrom(RemoveProxyFromRefererNameCommand.class));
    }

    public void testProxyRemovedFromReferer() {
        String server = "www.amazon.com/site/";
        String expectedHost = SeleniumHTTPRequest.SELENIUM_REDIRECT_PROTOCOL + server;
        SeleniumHTTPRequest httpRequest = new SeleniumHTTPRequest("GET: " + SeleniumHTTPRequest.SELENIUM_REDIRECT_URI + HTTPRequest.CRLF +
                                                  "Referer: " + SeleniumHTTPRequest.SELENIUM_REDIRECT_URI +
                                                   server + HTTPRequest.CRLF );
        RemoveProxyFromRefererNameCommand command = new RemoveProxyFromRefererNameCommand();
        command.execute(httpRequest);
        assertEquals(expectedHost, httpRequest.getHeaderField("Referer"));

    }
}
