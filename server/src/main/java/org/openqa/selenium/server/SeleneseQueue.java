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

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;

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
    private String sessionId;
    private String uniqueId;
    private boolean slowMode;
    private String localFrameAddress = null;
    private String seleniumWindowName = null; 

    public SeleneseQueue(String sessionId, String seleniumWindowName) {
        this(sessionId);
        this.seleniumWindowName = seleniumWindowName;
    }

    public SeleneseQueue(String sessionId) {
        this.sessionId = sessionId;
        commandHolder = new SingleEntryAsyncQueue();
        commandResultHolder = new SingleEntryAsyncQueue();
        //
        // we are only concerned about the browser, and command queue timeouts will never be
        // because of a browser problem, we should just set an infinite timeout threshold
        // so as not to be bothered by spurious command queue timeouts (which occur simply
        // because of routine selenium server inactivity).
        commandHolder.setTimeout(Integer.MAX_VALUE);
        
        slowMode = (System.getProperty("selenium.slowMode")!=null) && "true".equals(System.getProperty("selenium.slowMode"));
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
        if (slowMode) {
            System.out.println("    Slow mode in effect: sleep 1 second...");
            try {
                Thread.sleep(1000);
            } catch (InterruptedException e) {
            }
            System.out.println("    ...done");
        }
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
        if (!commandHolder.isEmpty()) {
            throw new RuntimeException("unexpected command " + commandResultHolder.peek() 
                    + " in place before new command " + command + " could be added.");
        }
        queuePut("commandHolder", commandHolder, 
                new DefaultSeleneseCommand(command, field, value, makeJavaScript()));
        try {
            return (String) queueGet("commandResultHolder", commandResultHolder);
        } catch (SeleniumCommandTimedOutException e) {
            return "ERROR: Command timed out";
        }
    }

    private String makeJavaScript() {
        StringBuffer sb = new StringBuffer(InjectionHelper.restoreJsStateInitializer(sessionId, uniqueId));
        if (seleniumWindowName !=null && !"".equals(seleniumWindowName)) {
            sb.append("window['seleniumWindowName']=unescape('");
            try {
                sb.append(URLEncoder.encode(seleniumWindowName, "UTF-8"));
            } catch (UnsupportedEncodingException e) {
                throw new RuntimeException("URLEncoder failed: " + e);
            }
            sb.append("');");
        }
        return sb.toString();
    }

    private Object queueGet(String caller, SingleEntryAsyncQueue q) {
        if (SeleniumServer.isDebugMode()) {
            System.out.println("\t" + caller + " queueGet() called...");
        }
        boolean clearedEarlierThread = false;
        if (q.hasBlockedGetter()) {
            q.clear();
            clearedEarlierThread = true;
        }
        Object object = q.get();
        
        if (SeleniumServer.isDebugMode()) {
            System.out.println("\t" + caller + " queueGet() -> " + object 
                    + (clearedEarlierThread ? " (after superceding other blocked thread)" : ""));
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
        if (!commandResultHolder.hasBlockedGetter()) {
            // This logic is to account for the case where in proxy injection mode, it is possible 
            // that a page reloads without having been explicitly asked to do so (e.g., an event 
            // in one frame causes reloads in others).
            if (SeleniumServer.isDebugMode()) {
                System.out.println("Ignoring result which no one is waiting for.");
            }
        }
        else {
            queuePut("commandResultHolder from " + getIdentification(), commandResultHolder, commandResult);
        }
        SeleneseCommand sc = (SeleneseCommand) queueGet("commandHolder " + uniqueId, commandHolder);
        return sc;
    }

    private String getIdentification() {
        StringBuffer sb = new StringBuffer();
        if (seleniumWindowName!=null) {
            sb.append(seleniumWindowName)
            .append(":");
        }
        if (localFrameAddress!=null) {
            sb.append(localFrameAddress)
            .append(".");
        }
        sb.append(uniqueId);
        return sb.toString();
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

    public String getUniqueId() {
        return uniqueId;
    }

    public void setUniqueId(String uniqueId) {
        this.uniqueId = uniqueId;
    }

    public String waitForResult() {
        return (String) queueGet("waitForResult commandResultHolder", commandResultHolder);
    }
    
    public String waitForResult(int timeout) {
        int oldTimeout = commandResultHolder.getTimeout();
        commandResultHolder.setTimeout(timeout);
        String result = waitForResult();
        commandResultHolder.setTimeout(oldTimeout);
        return result;
    }

    public String getSeleniumWindowName() {
        return seleniumWindowName;
    }

    public void setSeleniumWindowName(String seleniumWindowName) {
        this.seleniumWindowName = seleniumWindowName;
    }

    public String getLocalFrameAddress() {
        return localFrameAddress;
    }

    public void setLocalFrameAddress(String localFrameAddress) {
        this.localFrameAddress = localFrameAddress;
    }

    public SingleEntryAsyncQueue getCommandResultHolder() {
        return commandResultHolder;
    }
}
