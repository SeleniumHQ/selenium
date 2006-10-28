package org.openqa.selenium.server;
/*
 * Copyright 2006 BEA, Inc.
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


import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.locks.*;


/**
 * <p>Manages sets of SeleneseQueues corresponding to windows and frames in a single browser session.</p>
 * 
 * @author nelsons
 */
public class FrameGroupSeleneseQueueSet {
    private static String expectedNewWindowName;
    /**
     * JavaScript expression telling where the frame is within the current window (i.e., "local"
     * to the current window).
     */
    private String currentLocalFrameAddress;
    /**
     * the name of the user-level window in selenium's record-keeping.
     * 
     * The initial browser window has a blank name.  When a test calls waitForPopUp, that call's
     * argument is the window name as far as selenium is concerned.
     */
    private String currentSeleniumWindowName;
    /**
     * combines currentSeleniumWindowName and currentLocalFrameAddress to form an address of a frame
     * which is unique across all windows
     */
    private FrameAddress currentFrameAddress = null;

    private Map<FrameAddress, SeleneseQueue> frameAddressToSeleneseQueue = new HashMap<FrameAddress, SeleneseQueue>();

    private Map<FrameAddress, Boolean> frameAddressToJustLoaded = new HashMap<FrameAddress, Boolean>();
    static private Lock dataLock = new ReentrantLock();
    static private Condition justLoadedUpdate = dataLock.newCondition();

    /**
     * A unique string denoting a session with a browser.  In most cases this session begins with the
     * selenium server configuring and starting a browser process, and ends with a selenium server killing 
     * that process.
     */
    private final String sessionId;
    /**
     * Queues which will not be used anymore, but which cannot be immediately
     * destroyed because their corresponding windows may still be listening.
     */
    private Set<SeleneseQueue> orphanedQueues = new HashSet<SeleneseQueue>();

    public static final String DEFAULT_LOCAL_FRAME_ADDRESS = "top";
    /**
     * Each user-visible window group has a selenium window name.  The name of the initial browser window is "".
     * Even if the page reloads, the JavaScript is able to determine that it is this initial window because
     * window.opener==null.  Any window for whom window.opener!=null is a "pop-up".
     */
    public static final String DEFAULT_SELENIUM_WINDOW_NAME = "";
    /**
     * Each user-visible window group has a selenium window name.  The name of the initial browser window is "".
     * Even if the page reloads, the JavaScript is able to determine that it is this initial window because
     * window.opener==null.  Any window for whom window.opener!=null is a "pop-up".  
     * 
     * When a pop-up reloads, it can see that it is not in the initial window.  It will not know which window
     * it is until selenium tells it as part of the information sent with the next command.  Until that
     * happens, use this placeholder for the unknown name.
     */
    public static final String SELENIUM_WINDOW_NAME_UNKNOWN_POPUP = "?";

    public FrameGroupSeleneseQueueSet(String sessionId) {
        this.sessionId = sessionId;
        setCurrentFrameAddress(new FrameAddress(DEFAULT_SELENIUM_WINDOW_NAME, DEFAULT_LOCAL_FRAME_ADDRESS));
    }

    private void selectWindow(String seleniumWindowName) {
        if (!SeleniumServer.isProxyInjectionMode()) {
            doCommand("selectWindow", seleniumWindowName, "");
        }
        else {
            if ("null".equals(seleniumWindowName)) {
                // this results from only working with strings over the wire for Selenese
                currentSeleniumWindowName = DEFAULT_SELENIUM_WINDOW_NAME;
            }
            else {
                currentSeleniumWindowName = seleniumWindowName;
            }
            selectFrame(DEFAULT_LOCAL_FRAME_ADDRESS);   
        }
    }

    public SeleneseQueue getSeleneseQueue() {
        return getSeleneseQueue(currentFrameAddress);
    }

    public SeleneseQueue getSeleneseQueue(FrameAddress frameAddress) {
        synchronized(frameAddressToSeleneseQueue) {
            if (!frameAddressToSeleneseQueue.containsKey(frameAddress)) {

                if (SeleniumServer.isDebugMode()) {
                    SeleniumServer.log("---------allocating new SeleneseQueue for " + frameAddress);
                }
                frameAddressToSeleneseQueue.put(frameAddress, new SeleneseQueue(sessionId, frameAddress));
            }
            else {
                if (SeleniumServer.isDebugMode()) {
                    SeleniumServer.log("---------retrieving SeleneseQueue for " + frameAddress);
                }
            }
            return frameAddressToSeleneseQueue.get(frameAddress);
        }
    }

    private void selectFrame(String localFrameAddress) {
        setCurrentLocalFrameAddress(localFrameAddress);
    }

    /** Schedules the specified command to be retrieved by the next call to
     * handle command result, and returns the result of that command.
     * 
     * @param command - the Selenese command verb
     * @param arg - the first Selenese argument (meaning depends on the verb)
     * @param value - the second Selenese argument
     * @return - the command result, defined by the Selenese JavaScript.  "getX" style
     * commands may return data from the browser; other "doX" style commands may just
     * return "OK" or an error message.
     */
    public String doCommand(String command, String arg, String value) {
        if (SeleniumServer.isProxyInjectionMode()) {
            if (command.equals("selectFrame")) {
                if ("".equals(arg)) {
                    selectFrame(DEFAULT_LOCAL_FRAME_ADDRESS);
                    return "OK";
                }
                boolean newFrameFound = false;
                synchronized(frameAddressToSeleneseQueue) {
                    for (FrameAddress frameAddress : frameAddressToSeleneseQueue.keySet()) {
                        if (frameAddress.getWindowName().equals(currentSeleniumWindowName)) {
                            SeleneseQueue frameQ = frameAddressToSeleneseQueue.get(frameAddress);
                            String frameMatchBooleanString = frameQ.doCommand("getWhetherThisFrameMatchFrameExpression", currentLocalFrameAddress, arg);
                            if ("OK,true".equals(frameMatchBooleanString)) {
                                setCurrentFrameAddress(frameAddress);
                                newFrameFound = true;
                                break;
                            }
                            else if (!"OK,false".equals(frameMatchBooleanString)) {
                                throw new RuntimeException("unexpected return " + frameMatchBooleanString
                                        + " from frame search");
                            }
                        }
                    }
                }
                if (!newFrameFound) {
                    return "ERROR: starting from frame " + currentFrameAddress
                    + ", could not find frame " + arg;
                }
                return "OK";
            }
            if (command.equals("selectWindow")) {
                selectWindow(arg);
                return "OK";
            }
            if (command.equals("waitForPopUp")) {
                String waitingForThisWindowName = arg;
                int timeoutInSeconds = Integer.parseInt(value);
                selectWindow(waitingForThisWindowName);
                return waitForLoad(waitingForThisWindowName, "top", timeoutInSeconds);
            }
            if (command.equals("waitForPageToLoad")) {
                return waitForLoad();
            }
            if (command.equals("open")) {
                String t = getSeleneseQueue().doCommand(command, arg, value);
                if (!"OK".equals(t)) {
                    return t;
                }
                return waitForLoad();
            }
        } // if (SeleniumServer.isProxyInjectionMode())
        return getSeleneseQueue().doCommand(command, arg, value);
    }

    private String waitForLoad() {
        return waitForLoad(currentSeleniumWindowName, currentLocalFrameAddress, SeleniumServer.getTimeoutInSeconds());
    }

    private String waitForLoad(String waitingForThisWindowName, String waitingForThisLocalFrame, int timeoutInSeconds) {
        FrameGroupSeleneseQueueSet.expectedNewWindowName = waitingForThisWindowName;
        dataLock.lock();
        try {
            for (FrameAddress matchingFrameAddress = null; timeoutInSeconds >= 0; timeoutInSeconds--) {
                for (FrameAddress justLoaded : frameAddressToJustLoaded.keySet()) {
                    if (waitingForThisLocalFrame!=null) {
                        if (!justLoaded.getLocalFrameAddress().equals(waitingForThisLocalFrame)) {
                            continue;
                        }
                    }
                    if (justLoaded.getWindowName().equals(SELENIUM_WINDOW_NAME_UNKNOWN_POPUP)) {
                        justLoaded.setWindowName(waitingForThisWindowName);
                    }
                    else if (!justLoaded.getWindowName().equals(waitingForThisWindowName)) {
                        continue;
                    }
                    matchingFrameAddress = justLoaded;
                    break;
                }
                if (matchingFrameAddress!=null) {
                    frameAddressToJustLoaded.remove(matchingFrameAddress);
                    SeleniumServer.log("wait is over: window \"" + waitingForThisWindowName + "\" was seen at last");
                    return "OK";
                }
                SeleniumServer.log("waiting for window \"" + waitingForThisWindowName + "\"");
                try {
                    justLoadedUpdate.await(1, TimeUnit.SECONDS);
                } catch (InterruptedException e) {
                }
            }
            return "ERROR: timed out waiting for window \"" + waitingForThisWindowName + "\" to appear";
        }
        finally {
            dataLock.unlock();
        }

    }

    /**
     * <p>Accepts a command reply, and retrieves the next command to run.</p>
     * 
     * 
     * @param commandResult - the reply from the previous command, or null
     * @param frameAddress - frame from which the reply came
     * @param uniqueId 
     * @return - the next command to run
     */
    public SeleneseCommand handleCommandResult(String commandResult, FrameAddress frameAddress, String uniqueId) {
        SeleneseQueue queue;
        if (!SeleniumServer.isProxyInjectionMode()) {
            queue = getSeleneseQueue();
        }
        else {
            synchronized(this) {
                if (frameAddress.getWindowName().equals(SELENIUM_WINDOW_NAME_UNKNOWN_POPUP)) {
                    boolean foundFrameAddressOfUnknownPopup = false;
                    for (FrameAddress f : frameAddressToSeleneseQueue.keySet()) {
                        // the situation being handled here: a pop-up window has either just loaded or reloaded, and therefore
                        // doesn't know its name.  It uses SELENIUM_WINDOW_NAME_UNKNOWN_POPUP as a placeholder.
                        // Meanwhile, on the selenium server-side, a thread is waiting for this result.
                        //
                        // To determine if this has happened, we cycle through all of the SeleneseQueue objects,
                        // looking for ones with a matching local frame address (e.g., top.frames[1]), is also a
                        // pop-up, and which has a thread waiting on a result.  If all of these conditions hold,
                        // then we figure this queue is the one that we want:
                        if (f.getLocalFrameAddress().equals(frameAddress.getLocalFrameAddress())
                                && !f.getWindowName().equals(DEFAULT_SELENIUM_WINDOW_NAME)
                                && frameAddressToSeleneseQueue.get(f).getCommandResultHolder().hasBlockedGetter()) {
                            frameAddress = f;
                            foundFrameAddressOfUnknownPopup = true;
                            break;
                        }
                    }
                    if (!foundFrameAddressOfUnknownPopup) {
                        SeleniumServer.log("WARNING: unknown popup " + frameAddress + " was not resolved");
                    }
                }
            }
            queue = getSeleneseQueue(frameAddress);
        }
        queue.setUniqueId(uniqueId);
        return queue.handleCommandResult(commandResult);
    }

    /**
     * <p> Empty queues, and thereby wake up any threads that are hanging around.
     *
     */
    public void endOfLife() {
        for (SeleneseQueue frameQ : frameAddressToSeleneseQueue.values()) {
            frameQ.endOfLife();
        }
    }

    private boolean justLoaded(FrameAddress frameAddress) {
        return (frameAddressToJustLoaded.containsKey(frameAddress));
    }

    public void markWhetherJustLoaded(FrameAddress frameAddress, boolean justLoaded) {
        boolean oldState = justLoaded(frameAddress);
        if (oldState!=justLoaded) {
            dataLock.lock();
            try {       
                if (justLoaded) {
                    if (SeleniumServer.isDebugMode()) {
                        SeleniumServer.log(frameAddress + " marked as just loaded");
                    }
                    frameAddressToJustLoaded.put(frameAddress, true);
                }
                else {
                    if (SeleniumServer.isDebugMode()) {
                        SeleniumServer.log(frameAddress + " marked as NOT just loaded");
                    }
                    frameAddressToJustLoaded.remove(frameAddress);
                }
                justLoadedUpdate.signalAll();
            }
            finally {
                dataLock.unlock();
            }
        }
    }

    public String getCurrentLocalFrameAddress() {
        return currentLocalFrameAddress;
    }

    public void setCurrentLocalFrameAddress(String localFrameAddress) {
        this.setCurrentFrameAddress(new FrameAddress(currentSeleniumWindowName, localFrameAddress));
    }

    public String getCurrentSeleniumWindowName() {
        return currentSeleniumWindowName;
    }

    public FrameAddress getCurrentFrameAddress() {
        return currentFrameAddress;
    }

    private void setCurrentFrameAddress(FrameAddress frameAddress) {
        this.currentFrameAddress = frameAddress;
        this.currentSeleniumWindowName = frameAddress.getWindowName();
        this.currentLocalFrameAddress = frameAddress.getLocalFrameAddress();

        if (SeleniumServer.isDebugMode()) {
            SeleniumServer.log("Current frame address set to " + currentFrameAddress + ".");
        }
    }

    public static synchronized FrameAddress makeFrameAddress(String seleniumWindowName, String localFrameAddress, boolean justLoaded) {
        if (seleniumWindowName==null) {
            // we are talking to a version of selenium core which isn't telling us the
            // seleniumWindowName.  Set it to the default, which will be right most of
            // the time.
            seleniumWindowName = DEFAULT_SELENIUM_WINDOW_NAME;
        }
        if (seleniumWindowName.equals(SELENIUM_WINDOW_NAME_UNKNOWN_POPUP) && justLoaded && expectedNewWindowName!=null) {
            seleniumWindowName = expectedNewWindowName;
            expectedNewWindowName = null;
        }
        return new FrameAddress(seleniumWindowName, localFrameAddress);
    }

    /**
     * TODO: someone should call this
     */
    public void garbageCollectOrphans() {
        /**
         * The list of orphaned queues was assembled in the browser session 
         * preceding the current one.  At this point it is safe to get rid 
         * of them; their windows must have long since being destroyed.
         */
        for (SeleneseQueue q : orphanedQueues) {
            q.endOfLife();
        }
        orphanedQueues.clear();
    }

    public void reset() {
        if (SeleniumServer.isProxyInjectionMode()) {
            // shut down all but the primary top level connection
            List<FrameAddress> newOrphans = new LinkedList<FrameAddress>(); 
            for (FrameAddress frameAddress : frameAddressToSeleneseQueue.keySet()) {
                if (frameAddress.getLocalFrameAddress().equals(DEFAULT_LOCAL_FRAME_ADDRESS)
                        && frameAddress.getWindowName().equals(DEFAULT_SELENIUM_WINDOW_NAME)) {
                    continue;
                }
                selectWindow(frameAddress.getWindowName());
                selectFrame(frameAddress.getLocalFrameAddress());
                SeleneseQueue q = getSeleneseQueue();
                if (frameAddress.getLocalFrameAddress().equals(DEFAULT_LOCAL_FRAME_ADDRESS)) {
                    if (SeleniumServer.isDebugMode()) {
                        SeleniumServer.log("Trying to close " + frameAddress);
                    }
                    q.doCommandWithoutWaitingForAResponse("getEval", "selenium.browserbot.getCurrentWindow().close()", "");
                }
                orphanedQueues.add(q);
                newOrphans.add(frameAddress);
            }
            for (FrameAddress frameAddress : newOrphans) {
                frameAddressToSeleneseQueue.remove(frameAddress);
            }
        }
        selectWindow(DEFAULT_SELENIUM_WINDOW_NAME);
        String defaultUrl = "http://localhost:" + SeleniumServer.getPortDriversShouldContact()
        + "/selenium-server/core/InjectedSeleneseRunner.html";
        doCommand("open", defaultUrl, ""); // will close out subframes
    }
}


