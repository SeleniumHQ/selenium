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

import org.jmock.MockObjectTestCase;
import org.jmock.Mock;
import com.thoughtworks.selenium.SeleneseCommand;
import com.thoughtworks.selenium.SeleneseHandler;
import com.thoughtworks.selenium.DefaultSeleneseCommand;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.Writer;
import java.io.IOException;
import java.io.StringWriter;
import java.io.PrintWriter;

/**
 * @version $Id: $
 */
public class AbstractSeleneseServletTest extends MockObjectTestCase {
    private Mock requestMock;
    private Mock responseMock;
    private Mock httpSessionMock;
    private Mock servletContextMock;
    private Mock seleneseCommandMock;
    private HttpServletRequest request;
    private HttpServletResponse response;
    private HttpSession httpSession;
    private ServletContext servletContext;
    private SeleneseCommand seleneseCommand;

    protected void setUp() throws Exception {
        super.setUp();

        requestMock = mock(HttpServletRequest.class);
        responseMock = mock(HttpServletResponse.class);
        httpSessionMock = mock(HttpSession.class);
        servletContextMock = mock(ServletContext.class);
        seleneseCommandMock = mock(SeleneseCommand.class);

        request = (HttpServletRequest) requestMock.proxy();
        response = (HttpServletResponse) responseMock.proxy();
        httpSession = (HttpSession) httpSessionMock.proxy();
        servletContext = (ServletContext) servletContextMock.proxy();
        seleneseCommand = (SeleneseCommand) seleneseCommandMock.proxy();
    }

    public void testHandlesWritesErrorMessageForNullSeleniumStartAndCommandReply() throws IOException, ServletException {
        setInitialExpectations();

        requestMock.expects(once()).method("getParameter").with(eq("commandReply"));
        requestMock.expects(once()).method("getParameter").with(eq("seleniumStart"));

        MockWriter writer = new MockWriter("Selenese: State Error");
        responseMock.expects(once()).method("getWriter").withNoArguments().will(returnValue(new PrintWriter(writer, true)));

        MockSeleneseServlet servlet = new MockSeleneseServlet();
        servlet.doGet(request, response);

        writer.verify();
        requestMock.verify();
    }

    public void testHandlesWritesErrorMessageForFalseSeleniumStartAndNullCommandReply() throws IOException, ServletException {
        setInitialExpectations();

        requestMock.expects(once()).method("getParameter").with(eq("commandReply"));
        requestMock.expects(once()).method("getParameter").with(eq("seleniumStart")).will(returnValue("false"));

        MockWriter writer = new MockWriter("Selenese: State Error");
        responseMock.expects(once()).method("getWriter").withNoArguments().will(returnValue(new PrintWriter(writer, true)));

        MockSeleneseServlet servlet = new MockSeleneseServlet();
        servlet.doGet(request, response);

        writer.verify();
        requestMock.verify();
    }

    public void testWritesResponseFromCommandHandlerForNonSeleniumStart() throws IOException, ServletException {
        setInitialExpectations();

        String commandReply = "command-reply";
        requestMock.expects(once()).method("getParameter").with(eq("commandReply")).will(returnValue(commandReply));
        requestMock.expects(once()).method("getParameter").with(eq("seleniumStart"));

        String expectedOutput = "expectedOutput";
        MockWriter writer = new MockWriter(expectedOutput);
        responseMock.expects(once()).method("getWriter").withNoArguments().will(returnValue(new PrintWriter(writer, true)));

        seleneseCommandMock.expects(once()).method("getCommandString").withNoArguments().will(returnValue(expectedOutput));

        MockSeleneseServlet servlet = new MockSeleneseServlet(servletContext, commandReply);
        servlet.doGet(request, response);
        servlet.verify();
        writer.verify();
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

        public MockSeleneseServlet() {
        }

        public MockSeleneseServlet(ServletContext expectedServletContext, String expectedcommandReply) {
            super();
            this.expectedServletContext = expectedServletContext;
            this.expectedCommandReply = expectedcommandReply;
        }

        protected void endTests() {
            //To change body of implemented methods use File | Settings | File Templates.
        }

        protected SeleneseCommand handleCommand(ServletContext servletContext, String commandReply) {
            this.servletContext = servletContext;
            this.commandReply = commandReply;
            expectedHandleCommandToBeCalled = true;
            return seleneseCommand;
        }

        protected SeleneseHandler getRemoteSeleneseHandler(ServletContext servletContext, Writer writer) {
            return null;
        }

        public boolean verify() {
            return expectedHandleCommandToBeCalled ? (expectedCommandReply.equals(commandReply) &&
                                                      expectedServletContext.equals(servletContext)) : true;
        }
    }

    private final class MockWriter extends Writer {
        private Writer stringWriter = new StringWriter();
        private String expectation;

        public MockWriter(String expectation) {
            this.expectation = expectation;
        }

        public void close() throws IOException {
            stringWriter.close();
        }

        public void flush() throws IOException {
            stringWriter.flush();
        }

        public void write(char cbuf[], int off, int len) throws IOException {
            stringWriter.write(cbuf, off, len);
        }

        public boolean verify() {
            return expectation.equals(stringWriter.toString());
        }
    }
}
