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

import com.thoughtworks.selenium.SeleneseCommand;
import com.thoughtworks.selenium.SeleneseHandler;
import org.jmock.Mock;
import org.jmock.MockObjectTestCase;

import javax.servlet.ServletConfig;
import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.io.PrintWriter;
import java.io.Writer;

/**
 * @version $Id: $
 */
public class AbstractSeleneseServletTest extends MockObjectTestCase {
    private Mock requestMock;
    private Mock responseMock;
    private Mock httpSessionMock;
    private Mock servletContextMock;
    private Mock seleneseCommandMock;
    private Mock seleneseHandlerMock;
    private HttpServletRequest request;
    private HttpServletResponse response;
    private HttpSession httpSession;
    private ServletContext servletContext;
    private SeleneseCommand seleneseCommand;
    private SeleneseHandler seleneseHandler;
    private MockWriter mockWriter;

    protected void setUp() throws Exception {
        super.setUp();

        requestMock = mock(HttpServletRequest.class);
        responseMock = mock(HttpServletResponse.class);
        httpSessionMock = mock(HttpSession.class);
        servletContextMock = mock(ServletContext.class);
        seleneseCommandMock = mock(SeleneseCommand.class);
        seleneseHandlerMock = mock(SeleneseHandler.class);

        request = (HttpServletRequest) requestMock.proxy();
        response = (HttpServletResponse) responseMock.proxy();
        httpSession = (HttpSession) httpSessionMock.proxy();
        servletContext = (ServletContext) servletContextMock.proxy();
        seleneseCommand = (SeleneseCommand) seleneseCommandMock.proxy();
        seleneseHandler = (SeleneseHandler) seleneseHandlerMock.proxy();
    }

    public void testErrorMessagePipeAppended() {
        MockSeleneseServlet servlet = new MockSeleneseServlet();
        String appended = "this is the appended text";
        String expectedText = "Selenese: Error | " + appended;
        assertEquals(expectedText, servlet.error(appended));
    }

    public void testInitRetrievesHostAndPortFromServletConfig() throws ServletException {
        Mock servletConfigMock = mock(ServletConfig.class);
        ServletConfig config = (ServletConfig) servletConfigMock.proxy();

        servletConfigMock.expects(once()).method("getInitParameter").with(eq("remote-host")).will(returnValue("myhost"));
        servletConfigMock.expects(once()).method("getInitParameter").with(eq("remote-port")).will(returnValue("9090"));

        MockSeleneseServlet servlet = new MockSeleneseServlet();
        servlet.init(config);

        servletConfigMock.verify();
    }

    public void testWritesErrorMessageForNullSeleniumStartAndCommandReply() throws IOException, ServletException {
        setInitialExpectations();

        requestMock.expects(once()).method("getParameter").with(eq("commandReply"));
        requestMock.expects(once()).method("getParameter").with(eq("seleniumStart"));

        mockWriter = new MockWriter("Selenese: State Error");
        responseMock.expects(once()).method("getWriter").withNoArguments().will(returnValue(new PrintWriter(mockWriter, true)));

        MockSeleneseServlet servlet = new MockSeleneseServlet();
        servlet.doGet(request, response);

        mockWriter.verify();
        responseMock.verify();
        requestMock.verify();
    }

    public void testWritesErrorMessageForFalseSeleniumStartAndNullCommandReply() throws IOException, ServletException {
        setInitialExpectations();

        requestMock.expects(once()).method("getParameter").with(eq("commandReply"));
        requestMock.expects(once()).method("getParameter").with(eq("seleniumStart")).will(returnValue("false"));

        mockWriter = new MockWriter("Selenese: State Error");
        responseMock.expects(once()).method("getWriter").withNoArguments().will(returnValue(new PrintWriter(mockWriter, true)));

        MockSeleneseServlet servlet = new MockSeleneseServlet();
        servlet.doGet(request, response);

        mockWriter.verify();
        responseMock.verify();
        requestMock.verify();
    }

    public void testAttemptsToRetrieveHandlerFromContext() throws IOException, ServletException {
        setInitialExpectations();

        requestMock.expects(once()).method("getParameter").with(eq("commandReply"));
        requestMock.expects(once()).method("getParameter").with(eq("seleniumStart")).will(returnValue("true"));

        String expectedResponse = "this is the response expected from the test testAttemptsToRetrieveHandlerFromContext()";
        mockWriter = new MockWriter(expectedResponse);
        responseMock.expects(once()).method("getWriter").withNoArguments().will(returnValue(new PrintWriter(mockWriter, true)));
        servletContextMock.expects(once()).method("getAttribute").with(eq("remote-selenese-handler")).will(returnValue(seleneseHandler));
        seleneseHandlerMock.expects(once()).method("handleCommandResult").with(eq(null)).will(returnValue(seleneseCommand));
        seleneseCommandMock.expects(once()).method("getCommandString").withNoArguments().will(returnValue(expectedResponse));

        MockSeleneseServlet servlet = new MockSeleneseServlet();
        servlet.doGet(request, response);

        responseMock.verify();
        requestMock.verify();
        servletContextMock.verify();
        mockWriter.verify();

    }

    public void testAttemptsToRetrieveRemoteHandlerIfContextDoesNotHoldOne() throws IOException, ServletException {
        setInitialExpectations();

        requestMock.expects(once()).method("getParameter").with(eq("commandReply"));
        requestMock.expects(once()).method("getParameter").with(eq("seleniumStart")).will(returnValue("true"));

        String expectedResponse = "this is the response expected from the test testAttemptsToRetrieveRemoteHandlerIfContextDoesNotHoldOne()";
        mockWriter = new MockWriter(expectedResponse);
        responseMock.expects(once()).method("getWriter").withNoArguments().will(returnValue(new PrintWriter(mockWriter, true)));
        servletContextMock.expects(once()).method("getAttribute").with(eq("remote-selenese-handler")).will(returnValue(null));
        seleneseHandlerMock.expects(once()).method("handleCommandResult").with(eq(null)).will(returnValue(seleneseCommand));
        seleneseCommandMock.expects(once()).method("getCommandString").withNoArguments().will(returnValue(expectedResponse));

        MockSeleneseServlet servlet = new MockSeleneseServlet(servletContext, mockWriter);
        servlet.doGet(request, response);

        responseMock.verify();
        requestMock.verify();
        servletContextMock.verify();
        mockWriter.verify();
    }

    public void testWritesResponseFromCommandHandlerForNonSeleniumStart() throws IOException, ServletException {
        setInitialExpectations();

        String commandReply = "command-reply";
        requestMock.expects(once()).method("getParameter").with(eq("commandReply")).will(returnValue(commandReply));
        requestMock.expects(once()).method("getParameter").with(eq("seleniumStart"));

        String expectedOutput = "expectedOutput";
        mockWriter = new MockWriter(expectedOutput);
        responseMock.expects(once()).method("getWriter").withNoArguments().will(returnValue(new PrintWriter(mockWriter, true)));

        seleneseCommandMock.expects(once()).method("getCommandString").withNoArguments().will(returnValue(expectedOutput));

        MockSeleneseServlet servlet = new MockSeleneseServlet(servletContext, commandReply);
        servlet.doGet(request, response);
        servlet.verify();
        mockWriter.verify();
        seleneseCommandMock.verify();
        responseMock.verify();
        requestMock.verify();

    }

    public void testHandlesEndCorrectly() throws IOException, ServletException {
        setInitialExpectations();

        String commandReply = "end";
        requestMock.expects(once()).method("getParameter").with(eq("commandReply")).will(returnValue(commandReply));
        requestMock.expects(once()).method("getParameter").with(eq("seleniumStart"));

        String expectedOutput = "expectedOutput";
        mockWriter = new MockWriter(expectedOutput);
        responseMock.expects(once()).method("getWriter").withNoArguments().will(returnValue(new PrintWriter(mockWriter, true)));

        seleneseCommandMock.expects(once()).method("getCommandString").withNoArguments().will(returnValue(expectedOutput));
        servletContextMock.expects(once()).method("setAttribute").with(eq("remote-selenese-handler"), eq(null));

        MockSeleneseServlet servlet = new MockSeleneseServlet(servletContext, commandReply);
        servlet.doGet(request, response);
        servlet.verify();
        assertTrue(servlet.isTestEnded());
        mockWriter.verify();
        seleneseCommandMock.verify();
        responseMock.verify();
        requestMock.verify();
    }

    private void setInitialExpectations() {
        responseMock.expects(once()).method("setContentType").with(eq("text/plain"));
        requestMock.expects(once()).method("getSession").withNoArguments().will(returnValue(httpSession));
        httpSessionMock.expects(once()).method("getServletContext").withNoArguments().will(returnValue(servletContext));
    }

    private final class MockSeleneseServlet extends AbstractSeleneseServlet {

        private ServletContext servletContext;
        private String commandReply;
        private ServletContext expectedServletContext;
        private String expectedCommandReply;
        private boolean expectedHandleCommandToBeCalled;
        private boolean expectedGetRemoteToBeCalled;
        private boolean testEnded;
        private Writer expectedWriter;
        private Writer writer;

        public MockSeleneseServlet() {
        }

        public MockSeleneseServlet(ServletContext expectedServletContext, String expectedcommandReply) {
            super();
            this.expectedServletContext = expectedServletContext;
            this.expectedCommandReply = expectedcommandReply;
            expectedHandleCommandToBeCalled = true;
        }

        public MockSeleneseServlet(ServletContext expectedServletContext, Writer expectedWriter) {
            super();
            this.expectedServletContext = expectedServletContext;
            this.expectedWriter = expectedWriter;
            expectedGetRemoteToBeCalled = true;
        }

        protected void endTests() {
            testEnded = true;
        }

        public boolean isTestEnded() {
            return testEnded;
        }

        protected SeleneseCommand handleCommand(ServletContext servletContext, String commandReply) {
            this.servletContext = servletContext;
            this.commandReply = commandReply;
            return seleneseCommand;
        }

        protected SeleneseHandler getRemoteSeleneseHandler(ServletContext servletContext, Writer writer) {
            this.servletContext = servletContext;
            this.writer = writer;
            return seleneseHandler;
        }

        public boolean verify() {
            if (expectedHandleCommandToBeCalled) {
                return (expectedCommandReply.equals(commandReply) && expectedServletContext.equals(servletContext));
            }
            if (expectedGetRemoteToBeCalled) {
                return (expectedWriter.equals(writer) && expectedServletContext.equals(servletContext));
            }
            return true;
        }
    }

}
