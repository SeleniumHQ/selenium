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

package com.thoughtworks.selenium;

/**
 * <p>Schedules and coordinates commands to be run.</p>
 * 
 * 
 * @see com.thoughtworks.selenium.SingleEntryAsyncQueue
 * @author Paul Hammant
 * @version $Revision$
 */
public class SeleneseQueue {

    private SingleEntryAsyncQueue commandHolder = new SingleEntryAsyncQueue();
    private SingleEntryAsyncQueue commandResultHolder = new SingleEntryAsyncQueue();

    /** Schedules the specified command to be retrieved by the next call to
     * handle command result, and returns the result of that command.
     * 
     * <p>This object has a <code>doCommand</code> method, but it does not implement
     * the <code>CommandProcessor</code> interface, because end users should not
     * use this class directly to process commands.  Instead, actual
     * <code>CommandProcessor</code>s should use this class to coordinate its queues.
     * 
     * @param command - the Selenese command verb
     * @param field - the first Selenese argument (meaning depends on the verb)
     * @param value - the second Selenese argument
     * @return - the command result, defined by the Selenese JavaScript.  "getX" style
     * commands may return data from the browser; other "doX" style commands may just
     * return "OK" or an error message.
     */
    public String doCommand(String command, String field, String value) {
        commandHolder.put(new DefaultSeleneseCommand(command, field, value));
        if (!command.equals("testComplete")) {
            return (String) commandResultHolder.get();
        } else {
            return "";
        }
    }

    /**
     * <p>Accepts a command reply, and retrieves the next command to run.</p>
     * 
     * <p>This object has a <code>handleCommandResult</code> method, but it does not implement
     * the <code>SeleneseHandler</code> interface, because end users should not
     * use this class directly to process commands.  Instead, actual
     * <code>SeleneseHandler</code>s should use this class to coordinate its queues.
     * 
     * @param commandResult - the reply from the previous command, or null
     * @return - the next command to run
     */
    public SeleneseCommand handleCommandResult(String commandResult) {
        // DGF If the command result is null, we must be starting the run
        if (commandResult != null) {
            commandResultHolder.put(commandResult);
        }
        SeleneseCommand sc = (SeleneseCommand) commandHolder.get();
        return sc;
    }
}
