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
package com.thoughtworks.selenium.proxy;

import java.io.IOException;
import java.net.ServerSocket;
import java.net.Socket;

/**
 * @version $Id: SeleniumProxy.java,v 1.7 2004/11/15 23:37:52 ahelleso Exp $
 */
public class SeleniumProxy {
    private final ServerSocket serverSocket;

    public SeleniumProxy(ServerSocket serverSocket) {
        this.serverSocket = serverSocket;
    }

    public void listenAndDispatch() throws IOException {
        RequestModificationCommand command = buildRequestModificationCommand();

        while (true) {
            Socket socket = serverSocket.accept();
            ConnectionThread connectionThread = new ClientConnectionThread(socket, command);
            connectionThread.start();
        }
    }

    private RequestModificationCommand buildRequestModificationCommand() {
        CompositeCommand command = new CompositeCommand();
        // we want to remove the redirection details from the requested uri
        command.addCommand(new RemoveRedirectionDetailsFromURICommand());
        // we want to remove the redirection details from the referer uri
        command.addCommand(new RemoveRedirectionDetailsFromRefererNameCommand());
        // if the request was originally relative to the redirection, we need to mod it.
        command.addCommand(new RemoveRedirectedServerNameFromRelativeURLCommand());
        // we can now create the host field in the header
        command.addCommand(new CreateHostCommand());
        // we need to remove the server name from any URI on the same host as the proxy
        command.addCommand(new RemoveServerNameForSameServerTargetCommand());
        // we now set up the correct destination server to communicate with.
        command.addCommand(new SetupDestinationDetailsCommand());
        return command;
    }

    public static void main(String[] args) throws IOException {
        SeleniumProxy proxy = new SeleniumProxy(new ServerSocket(7777));
        proxy.listenAndDispatch();
    }
}
