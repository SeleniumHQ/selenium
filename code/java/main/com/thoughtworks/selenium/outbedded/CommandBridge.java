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

package com.thoughtworks.selenium.outbedded;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.ServletException;
import javax.servlet.ServletOutputStream;
import java.io.ByteArrayOutputStream;
import java.io.Writer;
import java.io.OutputStreamWriter;
import java.io.IOException;
import java.net.URLDecoder;

import com.thoughtworks.selenium.SeleneseCommand;
import com.thoughtworks.selenium.SeleneseQueue;

/**
 * Bridges HTTP commandRequests (presumably from external tests)
 * and HTTP commandResults (presumably from selenium javascript running in browser)
 * @author Ben Griffiths, Jez Humble
 */
public class CommandBridge extends HttpServlet {

    private SeleneseQueue queue = new SeleneseQueue();
    private static final String COMMAND_DELIMITER_REGEX = "\\|";

    public void init() {
    }

     public void service(HttpServletRequest request, HttpServletResponse response) throws ServletException {
        String commandRequest = request.getParameter("commandRequest");
        if (commandRequest == null) {
            serviceSeleniumCommandResult(response, request);
        } else {
            serviceServletConnectorCommandRequest(URLDecoder.decode(commandRequest),response,request);
        }
     }

    private void serviceServletConnectorCommandRequest(String command,HttpServletResponse response, HttpServletRequest request) throws ServletException {
        response.setContentType("text/plain");
        String[] values = command.split(COMMAND_DELIMITER_REGEX);
        String commandS = ""; String field = ""; String value="";
        if (values.length > 1) commandS = values[1];
        if (values.length > 2) field = values[2];
        if (values.length > 3) value = values[3];

        String results = queue.doCommand(commandS,field,value);
        try {
            response.getOutputStream().write(results.getBytes());
        } catch (IOException e) {
            throw new ServletException(e.getMessage());
        }
    }

    private void serviceSeleniumCommandResult(HttpServletResponse response, HttpServletRequest request) throws ServletException {
        response.setContentType("text/plain");
        try {
            ServletOutputStream out = response.getOutputStream();
            ByteArrayOutputStream buf = new ByteArrayOutputStream(1000);
            Writer writer = new OutputStreamWriter(buf, "ISO_8859_1");
            String seleniumStart = request.getParameter("seleniumStart");
            String commandResult = request.getParameter("commandResult");
            if (commandResult != null || (seleniumStart != null && seleniumStart.equals("true")) ) {
                SeleneseCommand sc = queue.handleCommandResult(commandResult);
                writer.flush();
                writer.write(sc.getCommandString());
                writer.flush();
                buf.writeTo(out);
            } else {
                throw new ServletException("No start nor command string");
            }
        } catch (IOException e) {
            throw new ServletException(e.getMessage());
        }
    }
}
