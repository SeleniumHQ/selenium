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

import com.thoughtworks.selenium.SeleneseHandler;
import com.thoughtworks.selenium.SeleneseCommand;
import com.thoughtworks.selenium.SeleneseHandler;

import java.rmi.RemoteException;

/**
 * A simple wrapper around an RMI <code>RemoteSeleneseHandler</code> object.
 * @see com.thoughtworks.selenium.servlet.RemoteSeleneseHandler
 * @author Paul Hammant
 * @version $Revision$
 */
public class RmiAdapterSeleneseHandler implements SeleneseHandler {
    private RemoteSeleneseHandler remoteSeleneseHandler;

    /** Specifies the RemoteSeleneseHandler to use */
    public RmiAdapterSeleneseHandler(RemoteSeleneseHandler remoteSeleneseHandler) {
        this.remoteSeleneseHandler = remoteSeleneseHandler;
    }

    /** Delegates to RemoteSeleneseHandler.handleCommandResult(String)
     * @see RemoteSeleneseHandler#handleCommandResult(String)
     * @see SeleneseHandler#handleCommandResult(String)
     */
    public SeleneseCommand handleCommandResult(String commandReply) {
        try {
            return remoteSeleneseHandler.handleCommandResult(commandReply);
        } catch (RemoteException e) {
            throw new RuntimeException("Rmi Failed for RMI Selenium Servlet");
        }
    }
}
