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
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.locks.Condition;
import java.util.concurrent.locks.Lock;

import org.apache.commons.logging.Log;
import org.mortbay.log.LogFactory;

/**
 * <p>Schedules and coordinates commands to be run.</p>
 * 
 * 
 * @see org.openqa.selenium.server.SingleEntryAsyncQueue
 * @author Paul Hammant
 * @version $Revision: 734 $
 */
public class CommandQueue {
    static Log log = LogFactory.getLog(CommandQueue.class);
    private SingleEntryAsyncQueue commandHolder;
    private SingleEntryAsyncQueue commandResultHolder;
    private String sessionId;
    private String uniqueId;
    private FrameAddress frameAddress = null;
    private boolean resultExpected = false;

    private final Lock dataLock;
    private Condition resultArrived;
    private Condition commandReady;
    private ConcurrentHashMap<String, Boolean> cachedJsVariableNamesPointingAtThisWindow = new ConcurrentHashMap<String, Boolean>(); 
    
    static private int millisecondDelayBetweenOperations;

    public CommandQueue(String sessionId, FrameAddress frameAddress, Lock dataLock) {
        this.sessionId = sessionId;
        this.frameAddress  = frameAddress;
        this.dataLock = dataLock;
        
        resultArrived = dataLock.newCondition();
        commandReady = dataLock.newCondition();
        
        commandHolder = new SingleEntryAsyncQueue("commandHolder/" + frameAddress, dataLock, commandReady);
        commandHolder.setRetry(true);
        commandResultHolder = new SingleEntryAsyncQueue("resultHolder/" + frameAddress, dataLock, resultArrived);
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
     * @param command - the remote command verb
     * @param field - the first remote argument (meaning depends on the verb)
     * @param value - the second remote argument
     * @return - the command result, defined by the remote JavaScript.  "getX" style
     * commands may return data from the browser; other "doX" style commands may just
     * return "OK" or an error message.
     */
    public String doCommand(String command, String field, String value) {
        dataLock.lock();
        try {
            resultExpected = true;
            
            // Clear the command result holder before a result is expected
            // What about clearing the command queue before a command is sent?
            synchronized (commandResultHolder) {
            	commandResultHolder.clear();
            }
            doCommandWithoutWaitingForAResponse(command, field, value);
            return queueGetResult("doCommand");
        }
        finally {
            resultExpected = false;
            dataLock.unlock();
        }
    }

    private String queueGetResult(String comment) {
        try {
            String result = (String) queueGet(comment, commandResultHolder, resultArrived);
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
            log.debug("    Slow mode in effect: sleep " + millisecondDelayBetweenOperations + " milliseconds...");
            try {
                Thread.sleep(millisecondDelayBetweenOperations);
            } catch (InterruptedException e) {
            }
            log.debug("    ...done");
        }
        synchronized(commandResultHolder) {
            if (commandResultHolder.isEmpty()) {
                commandResultHolder.clear();    // get rid of any threads who are waiting for a result
            }
            else {
                if (SeleniumServer.isProxyInjectionMode() && "OK".equals(commandResultHolder.peek())) {
                    if (command.startsWith("wait")) {
                        if (log.isDebugEnabled()) {
                            log.debug("Page load beat the wait command.  Leave the result to be picked up below");
                        }
                    }
                    else {
                        if (log.isDebugEnabled()) {
                            // In proxy injection mode, a single command could cause multiple pages to
                            // reload.  Each of these reloads causes a result.  This means that the usual one-to-one
                            // relationship between commands and results can go out of whack.  To avoid this, we
                            // discard results for which no thread is waiting:
                            log.debug("Apparently a page load result preceded the command; will ignore it...");
                        }
                        commandResultHolder.put(null); // overwrite result
                    }
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
                new DefaultRemoteCommand(command, field, value, makeJavaScript()), 
                commandReady);
    }

    private String makeJavaScript() {
        StringBuffer sb = new StringBuffer(InjectionHelper.restoreJsStateInitializer(sessionId, uniqueId));
        if (frameAddress!=null && !frameAddress.getWindowName().equals(FrameGroupCommandQueueSet.DEFAULT_SELENIUM_WINDOW_NAME)) {
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

    private Object queueGet(String caller, SingleEntryAsyncQueue q, Condition condition) {
        boolean clearedEarlierThread = false;

        String hdr = "\t" + getIdentification(caller) + " queueGet() ";
        if (log.isDebugEnabled()) {
            log.debug(hdr + "called"
                    + (clearedEarlierThread ? " (superceding other blocked thread)" : ""));
        }

        Object object = q.get();

        if (log.isDebugEnabled()) {
            log.debug(hdr + "-> " + object); 
        }
        return object;
    }

    private void queuePut(String caller, SingleEntryAsyncQueue q, Object thing, Condition condition) {
        String hdr = "\t" + getIdentification(caller) + " queuePut";
        if (log.isDebugEnabled()) {
            log.debug(hdr + "(" + thing + ")");
        }
        try {
            q.put(thing);
        }
        catch (SingleEntryAsyncQueueOverflow e) {
            log.debug(hdr + " caused " + e);
            throw e;
        }
        condition.signalAll();
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
    public RemoteCommand handleCommandResult(String commandResult) {
        if (commandResult == null) {
        	throw new RuntimeException("null command result");
        }
        if (!resultExpected ) {
            if (commandResultHolder.hasBlockedGetter()) {
                throw new RuntimeException("blocked getter for " + this + " but !resultExpected");
            }
            if (SeleniumServer.isProxyInjectionMode()) {
                // This logic is to account for the case where in proxy injection mode, it is possible 
                // that a page reloads without having been explicitly asked to do so (e.g., an event 
                // in one frame causes reloads in others).
                if (commandResult.startsWith("OK")) {
                    if (log.isDebugEnabled()) {
                        log.debug("Saw page load no one was waiting for.");
                    }
                    queuePutResult(commandResult);
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
        RemoteCommand sc = (RemoteCommand) queueGet("commandHolder", commandHolder, commandReady);
        if (sc != null && sc.getCommand().equals("retryLast")) {
            //commandResultHolder.clear();
        }

        return sc;
    }

    private void queuePutResult(String commandResult) {
    	// Below was commented out before during testing
    	// to discount situations where the Selenium Server
    	// would hang due to continually empty command queues
        if (SeleniumServer.isProxyInjectionMode()) {
            if (!commandResultHolder.isEmpty()) {
                commandHolder.clear();
                log.debug("clearing out old window thread(s?) for " + this 
                        + "; replaced result with " + commandResult);
            }
        }
        queuePut("commandResultHolder", commandResultHolder, commandResult, resultArrived);
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
        String s = sb.toString();
        if (s.endsWith("null")) {
            if (log.isDebugEnabled()) {
                log.debug("caller identification came in ending with null");
            }
        }
        return s;
    }

    /**
     * <p> Throw away a command reply.
     *
     */
    public void discardCommandResult() {
        dataLock.lock();
        try {
            queueGetResult("commandResultHolder discard");
        }
        finally {
            dataLock.unlock();
        }
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

    public SingleEntryAsyncQueue getCommandResultHolder() {
        return commandResultHolder;
    }

    public void setResultExpected(boolean resultExpected) {
        this.resultExpected = resultExpected;
    }
    
    /**
     * Get whether this command queue expects a result instead of just "OK".
     * @return Returns whether this command will expect a command result.
     */
    public boolean isResultExpected() {
    	return resultExpected;
    }

    public static void setSpeed(int i) {
        millisecondDelayBetweenOperations = i;
    }
    
    public static int getSpeed() {
        return millisecondDelayBetweenOperations;
    }

    public boolean isWindowPointedToByJsVariable(String jsVariableName) {
        Boolean isPointingAtThisWindow = cachedJsVariableNamesPointingAtThisWindow.get(jsVariableName);
        if (isPointingAtThisWindow==null) {
            isPointingAtThisWindow = false; // disable this -- causes timing problems since it's on same channel as initial load msg: doBooleanCommand("getWhetherThisWindowMatchWindowExpression", "", jsVariableName);
            cachedJsVariableNamesPointingAtThisWindow.put(jsVariableName, isPointingAtThisWindow);
        }
        return isPointingAtThisWindow;
    }

    public boolean doBooleanCommand(String command, String arg1, String arg2) {
        String booleanResult = doCommand(command, arg1, arg2);
        boolean result;
        if ("OK,true".equals(booleanResult)) {
            result = true;
        }
        else if ("OK,false".equals(booleanResult)) {
            result = false;
        }
        else {
            throw new RuntimeException("unexpected return " + booleanResult + " from boolean command " + command);
        }
        log.debug("doBooleancommand(" + command + "(" + arg1 + ", " + arg2 + ") -> " + result);
        return result;
    }

    public boolean matchesFrameAddress(String currentLocalFrameAddress, String newFrameAddressExpression) {
        return doBooleanCommand("getWhetherThisFrameMatchFrameExpression", currentLocalFrameAddress, newFrameAddressExpression);
    }

    public void addJsWindowNameVar(String jsWindowNameVar) {
        cachedJsVariableNamesPointingAtThisWindow.put(jsWindowNameVar, true);
    }
}
