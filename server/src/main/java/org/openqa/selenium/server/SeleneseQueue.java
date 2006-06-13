/*
 * Copyright 2006 ThoughtWorks, Inc.
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

package org.openqa.selenium.server;

/**
 * <p>Schedules and coordinates commands to be run.</p>
 * 
 * 
 * @see org.openqa.selenium.server.SingleEntryAsyncQueue
 * @author Paul Hammant
 * @version $Revision: 734 $
 */
public class SeleneseQueue {

    private SingleEntryAsyncQueue commandHolder;
    private SingleEntryAsyncQueue commandResultHolder;

    public SeleneseQueue() {
        commandResultHolder = new SingleEntryAsyncQueue(); 
        commandHolder = new SingleEntryAsyncQueue();
        //
        // we are only concerned about the browser, and command queue timeouts will never be
        // because of a browser problem, we should just set an infinite timeout threshold
        // so as not to be bothered by spurious command queue timeouts (which occur simply
        // because of routine selenium server inactivity).
        commandHolder.setTimeout(Integer.MAX_VALUE);
    }
    /** Schedules the specified command to be retrieved by the next call to
     * handle command result, and returns the result of that command.
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
        try {
            return (String) commandResultHolder.get();
        } catch (SeleniumCommandTimedOutException e) {
            return "ERROR: Command timed out";
        }
    }

    public String toString() {
        StringBuffer sb = new StringBuffer("{ commandHolder=");
        sb.append(commandHolder.toString())
        .append(", ")
        .append(" commandResultHolder=")
        .append(commandResultHolder.toString())
        .append(" }");

        return sb.toString();
    }

    /**
     * <p>Accepts a command reply, and retrieves the next command to run.</p>
     * 
     * 
     * @param commandResult - the reply from the previous command, or null
     * @return - the next command to run
     */
    public SeleneseCommand handleCommandResult(String commandResult) {
        if (commandResult == null) {
        	throw new RuntimeException("null command result");
        }
        commandResultHolder.put(commandResult);
        SeleneseCommand sc = (SeleneseCommand) commandHolder.get();
        return sc;
    }
    
    /**
     * <p> Throw away a command reply.
     *
     */
	public void discardCommandResult() {
		commandResultHolder.get();
	}
}
