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

import junit.framework.TestCase;

/**
 * @version $Id: RemoveRedirectedServerNameFromRelativeURLCommandTest.java,v 1.2 2004/11/15 18:35:02 ahelleso Exp $
 */
public class RemoveRedirectedServerNameFromRelativeURLCommandTest extends TestCase {

    public void testRemovesRedirectedServerFronURL() {
        String relative = "/site/pic.gif";
        HTTPRequest httpRequest = new SeleniumHTTPRequest("GET: " + SeleniumHTTPRequest.SELENIUM_REDIRECT_PROTOCOL +
                                                          SeleniumHTTPRequest.SELENIUM_REDIRECT_SERVER + relative +
                                                          HTTPRequest.CRLF);
        RemoveRedirectedServerNameFromRelativeURLCommand command = new RemoveRedirectedServerNameFromRelativeURLCommand();
        command.execute(httpRequest);
        assertEquals(relative, httpRequest.getUri());
    }
}
