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
import com.thoughtworks.selenium.SeleneseHandler;

import javax.servlet.ServletConfig;
import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.Writer;

/**
 * @author Paul Hammant
 * @version $Revision: 1.2 $
 */
public abstract class AbstractSeleneseServlet extends HttpServlet {

    String host;
    int port;

    public void init(ServletConfig config) throws ServletException {
        host = config.getInitParameter("remote-host");
        port = Integer.parseInt(config.getInitParameter("remote-port"));
    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("text/plain");

        String commandReply = request.getParameter("commandReply");
        String seleniumStart = request.getParameter("seleniumStart");

        ServletContext servletContext = request.getSession().getServletContext();
        Writer writer = response.getWriter();

        SeleneseHandler seleneseHandler = null;

        if (seleniumStart != null && seleniumStart.equals("true")) {

            seleneseHandler = (SeleneseHandler) servletContext.getAttribute("remote-selenese-handler");
            if (seleneseHandler == null) {
                seleneseHandler = getRemoteSeleneseHandler(servletContext, writer);
            }
            if (seleneseHandler != null) {
                writer.write(seleneseHandler.handleCommandResult(null).toString());
            }
        } else if (commandReply != null){
            SeleneseCommand command = handleCommand(servletContext, commandReply);
            writer.write(command.toString());
            if (command.command.equals("end")) {
                endTests();

                servletContext.setAttribute("remote-selenese-handler", null);
            }
        } else {
            writer.write("Selenese: State Error");
        }
    }

    protected abstract void endTests();

    protected abstract SeleneseCommand handleCommand(ServletContext servletContext, String commandReply);

    protected abstract SeleneseHandler getRemoteSeleneseHandler(ServletContext servletContext, Writer writer);

    protected String error(String s) {
        return "Selenese: Error | " + s;
    }

}
