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

import java.io.IOException;
import java.net.Socket;

import com.thoughtworks.selenium.utils.Assert;


/**
 * @version $Id: ClientConnectionThread.java,v 1.2 2004/11/13 04:46:57 ahelleso Exp $
 */
public class ClientConnectionThread extends Thread implements ConnectionThread {
    private final Socket socket;
    private final RequestModificationCommand requestModificationCommand;

    public ClientConnectionThread(Socket socket, RequestModificationCommand requestModificationCommand) {
        Assert.assertIsTrue(socket != null, "socket can't be null");
        Assert.assertIsTrue(requestModificationCommand != null, "requestModificationCommand can't be null");
        this.socket = socket;
        this.requestModificationCommand = requestModificationCommand;
    }

    /**
     * @see Thread#run()
     */
    public void run() {
        try {
            Relay relay = new RedirectingRelay(new RequestInputStream(socket.getInputStream()),
                                               new DefaultResponseStream(socket.getOutputStream()),
                                               requestModificationCommand);
            relay.relay();
            socket.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
