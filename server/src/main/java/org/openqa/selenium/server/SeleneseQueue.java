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
        commandHolder = new SingleEntryAsyncQueue();
        commandResultHolder = new SingleEntryAsyncQueue();
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
        if (!commandResultHolder.isEmpty()) {
            if (SeleniumServer.isProxyInjectionMode() && "OK".equals(commandResultHolder.peek())) {
                if (SeleniumServer.isDebugMode()) {
                    // TODO: explain...
                    System.out.println("Apparently a page load result preceded the command; will ignore it...");
                    System.out.println("Apparently orphaned waiting thread (from request from replaced page) for command -- send him on his way");
                }
                queueGet("doCommand spotted early result, discard", commandResultHolder);
                queuePut("put a dummy command to satisfy an orphaned waiting thread from a page which has been reloaded: commandHolder", 
                        commandHolder, new DefaultSeleneseCommand("dummy command for a page which has been reloaded", "dummy", "dummy"));
            }
            else {
                throw new RuntimeException("unexpected result " + commandResultHolder.peek());
            }
        }
        queuePut("commandHolder", commandHolder, new DefaultSeleneseCommand(command, field, value));
        try {
            return (String) queueGet("commandResultHolder", commandResultHolder);
        } catch (SeleniumCommandTimedOutException e) {
            return "ERROR: Command timed out";
        }
    }

    private Object queueGet(String caller, SingleEntryAsyncQueue q) {
        if (SeleniumServer.isDebugMode()) {
            System.out.println("\t" + caller + " queueGet() called...");
        }
        Object object = q.get();
        
        if (SeleniumServer.isDebugMode()) {
            System.out.println("\t" + caller + " queueGet() -> " + object);
        }
        return object;
    }

    private void queuePut(String caller, SingleEntryAsyncQueue q, Object thing) {
        if (SeleniumServer.isDebugMode()) {
            System.out.println("\t" + caller + " queuePut(" + thing + ")");
        }
        q.put(thing);
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
        queuePut("commandResultHolder", commandResultHolder, commandResult);
        SeleneseCommand sc = (SeleneseCommand) queueGet("commandHolder", commandHolder);
        return sc;
    }

    /**
     * <p> Throw away a command reply.
     *
     */
    public void discardCommandResult() {
        queueGet("commandResultHolder discard", commandResultHolder);
    }

    /**
     * <p> Empty queues, and thereby wake up any threads that are hanging around.
     *
     */
    public void endOfLife() {
        commandResultHolder.clear();
        commandHolder.clear();
    }
}
