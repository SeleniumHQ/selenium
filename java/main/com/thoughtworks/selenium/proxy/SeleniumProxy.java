/*
Copyright (c) 2003 ThoughtWorks, Inc. All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

   1. Redistributions of source code must retain the above copyright notice,
      this list of conditions and the following disclaimer.

   2. Redistributions in binary form must reproduce the above copyright notice,
      this list of conditions and the following disclaimer in the documentation
      and/or other materials provided with the distribution.

   3. The end-user documentation included with the redistribution, if any, must
      include the following acknowledgment:

          This product includes software developed by ThoughtWorks, Inc.
          (http://www.thoughtworks.com/).

      Alternately, this acknowledgment may appear in the software itself, if and
      wherever such third-party acknowledgments normally appear.

   4. The names "CruiseControl", "CruiseControl.NET", "CCNET", and
      "ThoughtWorks, Inc." must not be used to endorse or promote products derived
      from this software without prior written permission. For written permission,
      please contact opensource@thoughtworks.com.

   5. Products derived from this software may not be called "Selenium" or
      "ThoughtWorks", nor may "Selenium" or "ThoughtWorks" appear in their name,
      without prior written permission of ThoughtWorks, Inc.


THIS SOFTWARE IS PROVIDED ``AS IS'' AND ANY EXPRESSED OR IMPLIED WARRANTIES,
INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THOUGHTWORKS
INC OR ITS CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT
OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY
OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH
DAMAGE.
*/
package com.thoughtworks.selenium.proxy;

import com.thoughtworks.selenium.utils.Assert;

import java.io.IOException;
import java.net.ServerSocket;
import java.net.Socket;

/**
 * @author <a href="mailto:mikemelia@thoughtworks.net">Mike Melia</a>
 * @version $Id: SeleniumProxy.java,v 1.4 2004/11/13 06:16:05 ahelleso Exp $
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
        command.addCommand(new RemoveLocalhostServerNameFromRelativeURLCommand());
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
