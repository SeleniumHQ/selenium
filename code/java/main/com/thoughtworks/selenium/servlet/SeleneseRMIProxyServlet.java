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

import javax.servlet.ServletContext;
import java.io.IOException;
import java.io.Writer;
import java.net.MalformedURLException;
import java.rmi.ConnectIOException;
import java.rmi.Naming;
import java.rmi.NotBoundException;
import java.rmi.RemoteException;

/**
 * @author Paul Hammant
 * @version $Revision: 1.2 $
 */
public class SeleneseRMIProxyServlet extends AbstractSeleneseServlet {

    protected SeleneseHandler getRemoteSeleneseHandler(ServletContext servletContext, Writer writer) {
        SeleneseHandler seleneseHandler = null;
        try {
            try {
                String name = getRmiName();
                seleneseHandler = new RmiAdapterSeleneseHandler((RemoteSeleneseHandler) Naming.lookup(name));
                servletContext.setAttribute("remote-selenese-handler", seleneseHandler);
            } catch (NotBoundException e) {
                String s = "IP, DNS or RMI issue is preventing binding.";
                writer.write(error(s));
                log(s, e);
            } catch (MalformedURLException e) {
                String s = "Malformed host and/or port";
                writer.write(error(s));
                log(s, e);
            } catch (ConnectIOException e) {
                String s = "Cannot connect to remote RMI server";
                writer.write(error(s));
                log(s, e);
            } catch (RemoteException e) {
                String s = "Unexpected Remote Exception";
                writer.write(error(s));
                log(s, e);
            }
        } catch (IOException ioe) {
        }
        return seleneseHandler;
    }

    protected SeleneseCommand handleCommand(ServletContext servletContext, String commandReply) {
        try {
            RemoteSeleneseHandler seleneseHandler = (RemoteSeleneseHandler) servletContext.getAttribute("remote-selenese-handler");
            SeleneseCommand command = seleneseHandler.handleCommandResult(commandReply);
            return command;
        } catch (RemoteException e) {
            throw new RuntimeException("TODO");
        }
    }

    private String getRmiName() {
        String name = "rmi://" + host + ":" + port + "/" + RemoteSeleneseHandler.class.getName();
        return name;
    }

    protected void endTests() {
        String name = getRmiName();
        try {
            Naming.unbind(name);
        } catch (NotBoundException e) {
        } catch (RemoteException e) {
        } catch (MalformedURLException e) {
        }
    }

}
