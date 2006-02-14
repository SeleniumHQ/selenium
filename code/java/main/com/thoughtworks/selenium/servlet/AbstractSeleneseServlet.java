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
 * An abstract servlet that handles Selenese commands by handing them off to another
 * remote machine/port.
 * 
 * <p><b>Note</b>: This is not the only Selenium servlet.  You can also use the
 * <code>CommandBridge</code> in outbedded mode.
 * 
 * @see com.thoughtworks.selenium.outbedded.CommandBridge
 * @author Paul Hammant
 * @version $Revision$
 */
public abstract class AbstractSeleneseServlet extends HttpServlet {

    String host;
    int port;

    /** Reads "remote-host" and "remote-port" parameters from web.xml servlet configuration */
    public void init(ServletConfig config) throws ServletException {
        host = config.getInitParameter("remote-host");
        port = Integer.parseInt(config.getInitParameter("remote-port"));
    }

    /** Handles a Selenese request by passing it off to the remote Selenese handler */
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
                writer.write(seleneseHandler.handleCommandResult(null).getCommandString());
            }
        } else if (commandReply != null){
            SeleneseCommand command = handleCommand(servletContext, commandReply);
            writer.write(command.getCommandString());
            if (commandReply.equals("end")) {
                endTests();

                servletContext.setAttribute("remote-selenese-handler", null);
            }
        } else {
            writer.write("Selenese: State Error");
        }
    }

    /** Perform any necessary clean-up */
    protected abstract void endTests();

    /** Handles the specified command result using the remote Selenese handler
     * 
     * @param servletContext The context of the current servlet (which should contain the remote Selenese handler in the "remote-selenese-handler" attribute)
     * @param commandReply The previous command's result (or null if this is the first command)
     * @return the next command to run
     */
    protected abstract SeleneseCommand handleCommand(ServletContext servletContext, String commandReply);

    /** Retrieves the remote Selenese handler and sets it in the "remote-selenese-handler" servlet context attribute 
     * 
     * @param servletContext The context of the current servlet 
     * @param writer the writer associated with the current HTTP response
     * @return the remote Selenese Handler
     */
    protected abstract SeleneseHandler getRemoteSeleneseHandler(ServletContext servletContext, Writer writer);

    protected String error(String s) {
        return "Selenese: Error | " + s;
    }

}
