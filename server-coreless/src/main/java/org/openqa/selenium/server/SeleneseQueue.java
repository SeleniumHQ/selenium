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
    private FrameAddress frameAddress = null;
    private boolean resultExpected = false;

    static private int millisecondDelayBetweenOperations;

    public SeleneseQueue(String sessionId) {
        this(sessionId, null);
    }

    public SeleneseQueue(String sessionId, FrameAddress frameAddress) {
        this.sessionId = sessionId;
        this.frameAddress  = frameAddress;
        commandHolder = new SingleEntryAsyncQueue("commandHolder/" + frameAddress);
        commandResultHolder = new SingleEntryAsyncQueue("resultHolder/" + frameAddress);
        //
        // we are only concerned about the browser, and command queue timeouts will never be
        // because of a browser problem, we should just set an infinite timeout threshold
        // so as not to be bothered by spurious command queue timeouts (which occur simply
        // because of routine selenium server inactivity).
        commandHolder.setTimeout(Integer.MAX_VALUE);
        
        millisecondDelayBetweenOperations = (System.getProperty("selenium.slowMode")==null) ? 0 : Integer.parseInt(System.getProperty("selenium.slowMode"));
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
        resultExpected = true;
        doCommandWithoutWaitingForAResponse(command, field, value);
        try {
            return queueGetResult("doCommand");
        }
        finally {
            resultExpected = false;
        }
    }

    private String queueGetResult(String comment) {
        try {
            String result = (String) queueGet(comment, commandResultHolder);
            if (result==null) {
                result = "ERROR: got a null result";
            }
            return result;
        } catch (SeleniumCommandTimedOutException e) {
            return "ERROR: Command timed out";
        }
    }

    public void doCommandWithoutWaitingForAResponse(String command, String field, String value) {
        if (millisecondDelayBetweenOperations > 0) {
            SeleniumServer.log("    Slow mode in effect: sleep " + millisecondDelayBetweenOperations + " milliseconds...");
            try {
                Thread.sleep(millisecondDelayBetweenOperations);
            } catch (InterruptedException e) {
            }
            SeleniumServer.log("    ...done");
        }
        synchronized(commandResultHolder) {
            if (!commandResultHolder.isEmpty()) {
                if (SeleniumServer.isProxyInjectionMode() && "OK".equals(commandResultHolder.peek())) {
                    if (SeleniumServer.isDebugMode()) {
                        // In proxy injection mode, a single command could cause multiple pages to
                        // reload.  Each of these reloads causes a result.  This means that the usual one-to-one
                        // relationship between commands and results can go out of whack.  To avoid this, we
                        // discard results for which no thread is waiting:
                        SeleniumServer.log("Apparently a page load result preceded the command; will ignore it...");
                        SeleniumServer.log("Apparently orphaned waiting thread (from request from replaced page) for command -- send him on his way");
                    }
                    commandResultHolder.clear();
                }
                else {
                    throw new RuntimeException("unexpected result " + commandResultHolder.peek());
                }
            }
        }                            
        synchronized(commandHolder) {
            if (!commandHolder.isEmpty()) {
                throw new RuntimeException("unexpected command " + commandHolder.peek() 
                        + " in place before new command " + command + " could be added.");
            }
        }
        queuePut("commandHolder", commandHolder, 
                new DefaultSeleneseCommand(command, field, value, makeJavaScript()));
    }

    private String makeJavaScript() {
        StringBuffer sb = new StringBuffer(InjectionHelper.restoreJsStateInitializer(sessionId, uniqueId));
        if (frameAddress!=null && !frameAddress.getWindowName().equals(FrameGroupSeleneseQueueSet.DEFAULT_SELENIUM_WINDOW_NAME)) {
            sb.append("setSeleniumWindowName(unescape('");
            try {
                sb.append(URLEncoder.encode(frameAddress.getWindowName(), "UTF-8"));
            } catch (UnsupportedEncodingException e) {
                throw new RuntimeException("URLEncoder failed: " + e);
            }
            sb.append("'));");
        }
        return sb.toString();
    }

    private Object queueGet(String caller, SingleEntryAsyncQueue q) {
        boolean clearedEarlierThread = false;
        if (q.hasBlockedGetter()) {
            q.clear();
            clearedEarlierThread = true;
        }
        String hdr = "\t" + getIdentification(caller) + " queueGet() ";
        if (SeleniumServer.isDebugMode()) {
            SeleniumServer.log(hdr + "called"
                    + (clearedEarlierThread ? " (superceding other blocked thread)" : ""));
        }
        Object object = q.get();
        
        if (SeleniumServer.isDebugMode()) {
            SeleniumServer.log(hdr + "-> " + object); 
        }
        return object;
    }

    private void queuePut(String caller, SingleEntryAsyncQueue q, Object thing) {
        String hdr = "\t" + getIdentification(caller) + " queuePut";
        if (SeleniumServer.isDebugMode()) {
            SeleniumServer.log(hdr + "(" + thing + ")");
        }
        try {
            q.put(thing);
        }
        catch (SingleEntryAsyncQueueOverflow e) {
            SeleniumServer.log(hdr + " caused " + e);
            throw e;
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
        if (!resultExpected ) {
            if (commandResultHolder.hasBlockedGetter()) {
                throw new RuntimeException("blocked getter for " + this + " but !resultExpected");
            }
            // This logic is to account for the case where in proxy injection mode, it is possible 
            // that a page reloads without having been explicitly asked to do so (e.g., an event 
            // in one frame causes reloads in others).
            if (commandResult.equals("OK")) {
                if (SeleniumServer.isDebugMode()) {
                    SeleniumServer.log("Ignoring page load no one is waiting for.");
                }
            }
            else if (commandResult.startsWith("OK")) {
                // since the result includes a value, this is clearly not from a page which has just loaded.
                // Apparently there is some confusion among the queues
                throw new RuntimeException(getIdentification("commandResultHolder") 
                        + " unexpected value " + commandResult);
            }
        }
        else {
            queuePutResult(commandResult);
        }
        SeleneseCommand sc = (SeleneseCommand) queueGet("commandHolder", commandHolder);
        return sc;
    }

    private void queuePutResult(String commandResult) {
        try {
            queuePut("commandResultHolder", commandResultHolder, commandResult);
        }
        catch (SingleEntryAsyncQueueOverflow e) {
            if (SeleniumServer.isProxyInjectionMode()) {
                SeleniumServer.log("overwrote old result with " + commandResult);
            }
            else {
                throw e;
            }
        }
    }

    private String getIdentification(String caller) {
        StringBuffer sb = new StringBuffer();
        if (frameAddress!=null) {
            sb.append(frameAddress)
                .append(' ');
        }
        sb.append(caller)
            .append(' ')
            .append(uniqueId);
        return sb.toString();
    }

    /**
     * <p> Throw away a command reply.
     *
     */
    public void discardCommandResult() {
        resultExpected = true;
        queueGetResult("commandResultHolder discard");
        resultExpected = false;
    }

    /**
     * <p> Empty queues, and thereby wake up any threads that are hanging around and send them on their way.
     *
     */
    public void endOfLife() {
        commandResultHolder.clear();
        commandResultHolder = null;
        
        commandHolder.clear();
        commandHolder = null;
    }

    public String getUniqueId() {
        return uniqueId;
    }

    public void setUniqueId(String uniqueId) {
        this.uniqueId = uniqueId;
    }

    public String waitForResult() {
        try {
            setResultExpected(true);            
            return queueGetResult("waitForResult commandResultHolder");
        }
        finally {
            setResultExpected(false);
        }
    }
    
    public String waitForResult(int timeout) {
        int oldTimeout = commandResultHolder.getTimeout();
        commandResultHolder.setTimeout(timeout);
        String result = waitForResult();
        commandResultHolder.setTimeout(oldTimeout);
        return result;
    }

    public SingleEntryAsyncQueue getCommandResultHolder() {
        return commandResultHolder;
    }

    public void setResultExpected(boolean resultExpected) {
        this.resultExpected = resultExpected;
    }

    public static void setSpeed(int i) {
        millisecondDelayBetweenOperations = i;
    }
    
    public static int getSpeed() {
        return millisecondDelayBetweenOperations;
    }
}
