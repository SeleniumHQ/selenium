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

package com.thoughtworks.selenium.b.servlet;

import com.thoughtworks.selenium.b.SeleneseHandler;
import com.thoughtworks.selenium.b.SeleneseCommand;

import javax.servlet.ServletContext;
import java.io.Writer;

/**
 * @author Paul Hammant
 * @version $Revision: 1.1 $
 */
public class SeleneseProxyServlet extends AbstractSeleneseServlet {


    protected SeleneseHandler getRemoteSeleneseHandler(ServletContext servletContext, Writer writer) {
        SeleneseProxy seleneseProxy;
        seleneseProxy = (SeleneseProxy) servletContext.getAttribute("remote-selenese-handler");
        if (seleneseProxy == null) {
            seleneseProxy = new SeleneseProxy(host, port);
        }
        servletContext.setAttribute("remote-selenese-handler", seleneseProxy);
        return seleneseProxy;
    }

    protected SeleneseCommand handleCommand(ServletContext servletContext, String commandReply) {
        SeleneseProxy seleneseProxy;
        seleneseProxy = (SeleneseProxy) servletContext.getAttribute("remote-selenese-handler");
        SeleneseCommand command = seleneseProxy.handleCommandResult(commandReply);
        return command;
    }

    private String getRmiName() {
        String name = "rmi://" + host + ":" + port + "/" + RemoteSeleneseHandler.class.getName();
        return name;
    }

    protected void endTests() {
        //TODO
    }

}
