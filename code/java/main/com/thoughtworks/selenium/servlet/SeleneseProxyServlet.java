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

import javax.servlet.ServletContext;
import java.io.Writer;

/**
 * Handles command requests by passing them off to a remote Selenium Server.
 * 
 * <p>Unlike the outbedded <code>CommandBridge</code>, the SeleneseProxyServlet initiates
 * HTTP requests to a remote Selenium server, acting as if it were the browser.</p>
 * 
 * <p><img src="http://www.openqa.org/selenium/images/proxyservlet.png"/></p>
 * 
 * <p>In this scenario, the browser initiates the first request to the SeleneseProxyServlet,
 * who in turn issues a request to a remote Selenium Server (e.g. an embedded Jetty, an
 * outbedded CommandBridge, or even another SeleneseProxyServlet).  The remote server's
 * response is, in turn, written directly back to the browser.
 * </p>
 *
 * @see com.thoughtworks.selenium.servlet.SeleneseProxy
 * @see com.thoughtworks.selenium.outbedded.CommandBridge
 * @author Paul Hammant
 * @version $Revision$
 */
public class SeleneseProxyServlet extends AbstractSeleneseServlet {


    protected SeleneseHandler getRemoteSeleneseHandler(ServletContext servletContext, Writer writer) {
        SeleneseProxy seleneseProxy = new SeleneseProxy(host, port);
        servletContext.setAttribute("remote-selenese-handler", seleneseProxy);
        return seleneseProxy;
    }

    protected SeleneseCommand handleCommand(ServletContext servletContext, String commandReply) {
        SeleneseHandler seleneseProxy = (SeleneseHandler) servletContext.getAttribute("remote-selenese-handler");
        if (seleneseProxy == null) {
            throw new IllegalStateException("We expected the attribute 'remote-selenese-handler' to exist");
        }
        SeleneseCommand command = seleneseProxy.handleCommandResult(commandReply);
        return command;
    }

    protected void endTests() {
        //TODO
    }

}
