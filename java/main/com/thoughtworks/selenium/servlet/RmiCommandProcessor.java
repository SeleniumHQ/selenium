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

import com.thoughtworks.selenium.b.CommandProcessor;
import com.thoughtworks.selenium.b.SeleneseQueue;
import com.thoughtworks.selenium.b.SeleneseCommand;

import java.rmi.RemoteException;
import java.rmi.NotBoundException;
import java.rmi.registry.LocateRegistry;
import java.rmi.registry.Registry;
import java.rmi.server.UnicastRemoteObject;

/**
 * @author Paul Hammant
 * @version $Revision: 1.1 $
 */
public class RmiCommandProcessor implements CommandProcessor {

    private SeleneseQueue seleneseQueue = new SeleneseQueue();
    private Registry registry;

    int port;

    public RmiCommandProcessor(int port) {
        this.port = port;
    }

    public RmiCommandProcessor() {
        port = 9876;
    }

    public String doCommand(String command, String field, String value) {
        return seleneseQueue.doCommand(command, field, value);
    }

    public void start() {
        try {
            registry = LocateRegistry.createRegistry(port);
            registry.rebind(RemoteSeleneseHandler.class.getName(), new RemoteSeleneseHandlerImpl());
        } catch (RemoteException e) {
            throw new RuntimeException("Unexpected RMI exception. Port " + port + " already has a server attached?",e);
        }
    }

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
