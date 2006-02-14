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

import com.thoughtworks.selenium.CommandProcessor;
import com.thoughtworks.selenium.SeleneseQueue;
import com.thoughtworks.selenium.SeleneseCommand;

import java.rmi.RemoteException;
import java.rmi.NotBoundException;
import java.rmi.registry.LocateRegistry;
import java.rmi.registry.Registry;
import java.rmi.server.UnicastRemoteObject;

/**
 * A Selenium command processor that handles requests over RMI.
 * 
 * @see com.thoughtworks.selenium.servlet.SeleneseRMIProxyServlet
 * @author Paul Hammant
 * @version $Revision$
 */
public class RmiCommandProcessor implements CommandProcessor {

    private SeleneseQueue seleneseQueue = new SeleneseQueue();
    private Registry registry;

    int port;

    /** Specifies the port on which we'll start the RMI server */
    public RmiCommandProcessor(int port) {
        this.port = port;
    }

    /** Uses default port 9876 */
    public RmiCommandProcessor() {
        port = 9876;
    }

    public String doCommand(String command, String field, String value) {
        return seleneseQueue.doCommand(command, field, value);
    }

    /** Starts the RMI server */
    public void start() {
        try {
            registry = LocateRegistry.createRegistry(port);
            registry.rebind(RemoteSeleneseHandler.class.getName(), new RemoteSeleneseHandlerImpl());
        } catch (RemoteException e) {
            throw new RuntimeException("Unexpected RMI exception. Port " + port + " already has a server attached?",e);
        }
    }

    /** Stops the RMI server */
    public void stop() {
        try {
            registry.unbind(RemoteSeleneseHandler.class.getName());
        } catch (RemoteException e) {
            throw new RuntimeException("Unexpected RMI exception.",e);
        } catch (NotBoundException e) {
            throw new RuntimeException("Unexpected RMI exception. Port " + port + " already has a server attached?",e);
        }
    }

    class RemoteSeleneseHandlerImpl extends UnicastRemoteObject implements RemoteSeleneseHandler {

        public RemoteSeleneseHandlerImpl() throws RemoteException {
        }

        public SeleneseCommand handleStart() throws RemoteException {
            return seleneseQueue.handleCommandResult(null);
        }

        public SeleneseCommand handleCommandResult(String commandResult) throws RemoteException {
            return seleneseQueue.handleCommandResult(commandResult);
        }
    }
}
