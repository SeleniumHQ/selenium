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
package com.thoughtworks.selenium.servlet;

import com.thoughtworks.selenium.SeleneseHandler;
import com.thoughtworks.selenium.SeleneseCommand;
import org.jmock.Mock;
import org.jmock.MockObjectTestCase;

import javax.servlet.ServletContext;

/**
 * @version $Id: $
 */
public class SeleneseProxyServletTest extends MockObjectTestCase {

    public void testRemoteHandlerStoredInServletContext() {
        Mock servletContextMock = mock(ServletContext.class);
        MockWriter writer = new MockWriter("");

        ServletContext servletContext = (ServletContext) servletContextMock.proxy();

        servletContextMock.expects(once()).method("setAttribute").with(eq("remote-selenese-handler"), isA(SeleneseHandler.class));

        SeleneseProxyServlet servlet = new SeleneseProxyServlet();
        servlet.getRemoteSeleneseHandler(servletContext, writer);

        servletContextMock.verify();
        writer.verify();
    }

    public void testHandlerUsedFromContext() {
        Mock servletContextMock = mock(ServletContext.class);
        Mock seleneseHandlerMock = mock(SeleneseHandler.class);
        Mock seleneseCommandMock = mock(SeleneseCommand.class);
        String commandText = "commandText";

        ServletContext servletContext = (ServletContext) servletContextMock.proxy();
        SeleneseHandler handler = (SeleneseHandler) seleneseHandlerMock.proxy();
        SeleneseCommand expectedCommand = (SeleneseCommand) seleneseCommandMock.proxy();

        servletContextMock.expects(once()).method("getAttribute").with(eq("remote-selenese-handler")).will(returnValue(handler));
        seleneseHandlerMock.expects(once()).method("handleCommandResult").with(eq(commandText)).will(returnValue(expectedCommand));

        SeleneseProxyServlet servlet = new SeleneseProxyServlet();
        SeleneseCommand command = servlet.handleCommand(servletContext, commandText);

        servletContextMock.verify();
        seleneseHandlerMock.verify();
        assertEquals(expectedCommand, command);
    }

    public void testNonExistentHandlerResultsInIllegalState() {
        Mock servletContextMock = mock(ServletContext.class);
        ServletContext servletContext = (ServletContext) servletContextMock.proxy();

        servletContextMock.expects(once()).method("getAttribute").with(eq("remote-selenese-handler")).will(returnValue(null));

        SeleneseProxyServlet servlet = new SeleneseProxyServlet();
        try {
            servlet.handleCommand(servletContext, "commandText");
            fail("Expected an IllegalStateException");
        } catch (IllegalStateException e) {
            // expected an IllegalStateException
        }
    }

    public void testEndTestsDoesNothing() {
        // TODO placeholder
        new SeleneseProxyServlet().endTests();
    }
}
