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

import com.thoughtworks.selenium.b.SeleneseHandler;
import com.thoughtworks.selenium.b.SeleneseCommand;
import com.thoughtworks.selenium.b.SeleneseHandler;

import java.rmi.RemoteException;

/**
 * @author Paul Hammant
 * @version $Revision: 1.1 $
 */
public class RmiAdapterSeleneseHandler implements SeleneseHandler {
    private RemoteSeleneseHandler remoteSeleneseHandler;

    public RmiAdapterSeleneseHandler(RemoteSeleneseHandler remoteSeleneseHandler) {
        this.remoteSeleneseHandler = remoteSeleneseHandler;
    }

    public SeleneseCommand handleCommandResult(String commandReply) {
        try {
            return remoteSeleneseHandler.handleCommandResult(commandReply);
        } catch (RemoteException e) {
            throw new RuntimeException("Rmi Failed for RMI Selenium Servlet");
        }
    }
}
