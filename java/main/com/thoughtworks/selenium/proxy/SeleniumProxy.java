package com.thoughtworks.selenium.proxy;
/*
  Copyright 2004 ThoughtWorks, Inc.

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

import com.thoughtworks.selenium.utils.Assert;

import java.io.IOException;
import java.net.ServerSocket;
import java.net.Socket;

/**
 * @author <a href="mailto:mikemelia@thoughtworks.net">Mike Melia</a>
 * @version $Id: SeleniumProxy.java,v 1.1 2004/11/11 12:19:48 mikemelia Exp $
 */
public class SeleniumProxy
{
    private final ServerSocket serverSocket;

    public SeleniumProxy(ServerSocket serverSocket) {
        Assert.assertIsTrue(serverSocket != null, "serverSocket can't be null");
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
        command.addCommand(new ProxyDetailsRemovalCommand());
        command.addCommand(new RemoveProxyFromRefererNameCommand());
        command.addCommand(new CreateHostCommand());
        command.addCommand(new RemoveLocalhostServerNameCommand());
        command.addCommand(new SetupDestinationDetailsCommand());
        return command;
    }

    public static void main(String[] args) throws IOException {
        SeleniumProxy proxy = new SeleniumProxy(new ServerSocket(7777));
        proxy.listenAndDispatch();
    }
}
