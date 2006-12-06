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
 * <p>Manages sets of CommandQueues corresponding to windows and frames in a single browser session.</p>
 * 
 * @author nelsons
 */
public class FrameGroupCommandQueueSet {
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
    
    private Map<FrameAddress, CommandQueue> frameAddressToCommandQueue = new ConcurrentHashMap<FrameAddress, CommandQueue>();
    static public final Map<String, FrameGroupCommandQueueSet> queueSets = new HashMap<String, FrameGroupCommandQueueSet>();
    
    private Map<FrameAddress, Boolean> frameAddressToJustLoaded = new HashMap<FrameAddress, Boolean>();
    static private Lock dataLock = new ReentrantLock(); // 
    static private Condition resultArrivedOnAnyQueue = dataLock.newCondition();
    
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
    private Set<CommandQueue> orphanedQueues = new HashSet<CommandQueue>();

    public static final String DEFAULT_LOCAL_FRAME_ADDRESS = "top";
    /**
     * Each user-visible window group has a selenium window name.  The name of the initial browser window is "".
     * Even if the page reloads, the JavaScript is able to determine that it is this initial window because
     * window.opener==null.  Any window for whom window.opener!=null is a "pop-up".
     */
    public static final String DEFAULT_SELENIUM_WINDOW_NAME = "";

    public FrameGroupCommandQueueSet(String sessionId) {
        this.sessionId = sessionId;
        setCurrentFrameAddress(FrameAddress.make(DEFAULT_SELENIUM_WINDOW_NAME, DEFAULT_LOCAL_FRAME_ADDRESS));
    }

    private String selectWindow(String seleniumWindowName) {
        if (!SeleniumServer.isProxyInjectionMode()) {
            return doCommand("selectWindow", seleniumWindowName, "");
        }
        if ("null".equals(seleniumWindowName)) {
            // this results from only working with strings over the wire
            currentSeleniumWindowName = DEFAULT_SELENIUM_WINDOW_NAME;
        }
        FrameAddress match = findMatchingFrameAddress(frameAddressToCommandQueue.keySet(),
                    seleniumWindowName, DEFAULT_LOCAL_FRAME_ADDRESS);
        if (match==null) {
            return "ERROR: could not find window " + seleniumWindowName;
        }
        setCurrentFrameAddress(match);
        return "OK";
    }

    public CommandQueue getCommandQueue() {
        dataLock.lock();
        try {
            return getCommandQueue(currentFrameAddress);
        }
        finally {
            dataLock.unlock();
        }
    }
    

    /** Retrieves a FrameGroupCommandQueueSet for the specifed sessionId 
     */
    static public FrameGroupCommandQueueSet getQueueSet(String sessionId) {
        dataLock.lock();
        try {
            FrameGroupCommandQueueSet queueSet = FrameGroupCommandQueueSet.queueSets.get(sessionId);
            if (queueSet == null) {
                throw new RuntimeException("sessionId " + sessionId + " doesn't exist"); 
            }
            return queueSet;
        }
        finally {
            dataLock.unlock();
        }
    }
    
    /** Creates a FrameGroupCommandQueueSet for the specifed sessionId 
     */
    static public FrameGroupCommandQueueSet makeQueueSet(String sessionId) {
        dataLock.lock();
        try {
            FrameGroupCommandQueueSet queueSet = FrameGroupCommandQueueSet.queueSets.get(sessionId);
            if (queueSet != null) {
                throw new RuntimeException("sessionId " + sessionId + " already exists");
            }
            queueSet = new FrameGroupCommandQueueSet(sessionId);
            FrameGroupCommandQueueSet.queueSets.put(sessionId, queueSet);
            return queueSet;
        }
        finally {
            dataLock.unlock();
        }
    }

    /** Deletes the specified FrameGroupCommandQueueSet */
    static public void clearQueueSet(String sessionId) {
        dataLock.lock();
        try {
            FrameGroupCommandQueueSet queue = FrameGroupCommandQueueSet.queueSets.get(sessionId);
            queue.endOfLife();
            FrameGroupCommandQueueSet.queueSets.remove(sessionId);
        }
        finally {
            dataLock.unlock();
        }
    }


    private CommandQueue getCommandQueue(FrameAddress frameAddress) {
        CommandQueue q = frameAddressToCommandQueue.get(frameAddress);
        if (q==null) {

            if (SeleniumServer.isDebugMode()) {
                SeleniumServer.log("---------allocating new CommandQueue for " + frameAddress);
            }
            q = new CommandQueue(sessionId, frameAddress, dataLock);
            frameAddressToCommandQueue.put(frameAddress, q);
        }
        else {
            if (SeleniumServer.isDebugMode()) {
                SeleniumServer.log("---------retrieving CommandQueue for " + frameAddress);
            }
        }
        return frameAddressToCommandQueue.get(frameAddress);
    }

    private void selectFrame(String localFrameAddress) {
        setCurrentLocalFrameAddress(localFrameAddress);
    }

    /** Schedules the specified command to be retrieved by the next call to
     * handle command result, and returns the result of that command.
     * 
     * @param command - the remote command verb
     * @param arg - the first remote argument (meaning depends on the verb)
     * @param value - the second remote argument
     * @return - the command result, defined by the remote JavaScript.  "getX" style
     * commands may return data from the browser; other "doX" style commands may just
     * return "OK" or an error message.
     */
    public String doCommand(String command, String arg, String value) {
        dataLock.lock();
        try {
            if (SeleniumServer.isProxyInjectionMode()) {
                if (command.equals("close")) {
                    getCommandQueue().doCommandWithoutWaitingForAResponse(command, arg, value);
                    return "OK";    // do not wait for a response; this window is killing itself
                }
                if (command.equals("selectFrame")) {
                    if ("".equals(arg)) {
                        selectFrame(DEFAULT_LOCAL_FRAME_ADDRESS);
                        return "OK";
                    }
                    boolean newFrameFound = false;
                    for (FrameAddress frameAddress : frameAddressToCommandQueue.keySet()) {
                        if (frameAddress.getWindowName().equals(currentSeleniumWindowName)) {
                            CommandQueue frameQ = frameAddressToCommandQueue.get(frameAddress);
                            if (frameQ.matchesFrameAddress(currentLocalFrameAddress, arg)) {
                                setCurrentFrameAddress(frameAddress);
                                newFrameFound = true;
                                break;
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
                    return selectWindow(arg);
                }
                if (command.equals("waitForPopUp")) {
                    String waitingForThisWindowName = arg;
                    int timeoutInSeconds = Integer.parseInt(value);
                    String result = waitForLoad(waitingForThisWindowName, "top", timeoutInSeconds);
                    if (!result.equals("OK")) {
                        return result;
                    }
                    return selectWindow(waitingForThisWindowName);
                }
                if (command.equals("waitForPageToLoad")) {
                    return waitForLoad(arg);
                }
                if (command.equals("open")) {
                    String t = getCommandQueue().doCommand(command, arg, value);
                    if (!"OK".equals(t)) {
                        return t;
                    }
                    return waitForLoad(SeleniumServer.getTimeoutInSeconds() * 1000l);
                }

                // strip off AndWait - in PI mode we handle this in the server rather than in core...
                if (command.endsWith("AndWait")) {
                    command = command.substring(0, command.length() - "AndWait".length());
                    String t = getCommandQueue().doCommand(command, arg, value);
                    if (!t.startsWith("OK")) {
                        return t;
                    }

                    return waitForLoad(SeleniumServer.getTimeoutInSeconds() * 1000l);
                }
            } // if (SeleniumServer.isProxyInjectionMode())
            return getCommandQueue().doCommand(command, arg, value);
        }
        finally {
            dataLock.unlock();
        }
    }

    private String waitForLoad(long timeoutInMilliseconds) {
        int timeoutInSeconds = (int)(timeoutInMilliseconds / 1000l);
        if (timeoutInSeconds == 0) {
            timeoutInSeconds = 1;
        };
        return waitForLoad(currentSeleniumWindowName, currentLocalFrameAddress, timeoutInSeconds);
    }
    
    private String waitForLoad(String timeoutInMilliseconds) {
        return waitForLoad(Long.parseLong(timeoutInMilliseconds));
    }

    private String waitForLoad(String waitingForThisWindowName, String waitingForThisLocalFrame, int timeoutInSeconds) {
        dataLock.lock();
        try {
            for (FrameAddress matchingFrameAddress = null; timeoutInSeconds >= 0; timeoutInSeconds--) {
                matchingFrameAddress = findMatchingFrameAddress(frameAddressToJustLoaded.keySet(), 
                        waitingForThisWindowName, waitingForThisLocalFrame);
                if (matchingFrameAddress!=null) {
                    SeleniumServer.log("wait is over: window \"" + waitingForThisWindowName + "\" was seen at last (" + matchingFrameAddress + ")");
                    frameAddressToJustLoaded.remove(matchingFrameAddress);
                    return "OK";
                }
                SeleniumServer.log("waiting for window \"" + waitingForThisWindowName + "\"" + " local frame \"" + waitingForThisLocalFrame + "\"");
                try {
                    resultArrivedOnAnyQueue.await(1, TimeUnit.SECONDS);
                } catch (InterruptedException e) {
                }
            }
            return "ERROR: timed out waiting for window \"" + waitingForThisWindowName + "\" to appear";
        }
        finally {
            dataLock.unlock();
        }
    }

    private FrameAddress findMatchingFrameAddress(Set<FrameAddress> frameAddresses, String windowName, String localFrame) {
        for (FrameAddress frameAddress : frameAddresses) {
            if (matchesFrameAddress(frameAddress, windowName, localFrame)) {
                return frameAddress;
            }
        }
        return null;
    }

    /**
     * Does 'f' point at a window that matches 'windowName'/'localFrame'?
     * 
     * @param f
     * @param windowName
     * @param localFrame
     * @return True if the frame addressed by 'f' is addressable by window name 'windowName' and local frame address 'localFrame'. 
     */
    private boolean matchesFrameAddress(FrameAddress f, String windowName, String localFrame) {
        // it's an odd selenium convention: "null" maps to the initial, main window:
        if (windowName==null || windowName.equals("null")) {
            windowName = DEFAULT_SELENIUM_WINDOW_NAME;
        }
        if (!f.getLocalFrameAddress().equals(localFrame)) {
            return false;
        }
        if (f.getWindowName().equals(windowName)) {
            return true;
        }
        return frameAddressToCommandQueue.get(f).isWindowPointedToByJsVariable(windowName);
    }
    
    /**
     * <p>Accepts a command reply, and retrieves the next command to run.</p>
     * 
     * 
     * @param commandResult - the reply from the previous command, or null
     * @param incomingFrameAddress - frame from which the reply came
     * @param uniqueId 
     * @param justLoaded 
     * @param jsWindowNameVars 
     * @return - the next command to run
     */
    public RemoteCommand handleCommandResult(String commandResult, FrameAddress incomingFrameAddress, String uniqueId, boolean justLoaded, List jsWindowNameVars) {
        dataLock.lock();
        try {
            markWhetherJustLoaded(incomingFrameAddress, justLoaded);
            CommandQueue queue;
            if (!SeleniumServer.isProxyInjectionMode()) {
                queue = getCommandQueue();
            }
            else {
                queue = getCommandQueue(incomingFrameAddress);
            }
            queue.setUniqueId(uniqueId);
            if (jsWindowNameVars!=null) {
                for (Object jsWindowNameVar : jsWindowNameVars) {
                    queue.addJsWindowNameVar((String)jsWindowNameVar);                    
                }
            }
            return queue.handleCommandResult(commandResult);
        }
        finally {
            dataLock.unlock();
        }
    }

    /**
     * <p> Empty queues, and thereby wake up any threads that are hanging around.
     *
     */
    public void endOfLife() {
        dataLock.lock();
        try {
            for (CommandQueue frameQ : frameAddressToCommandQueue.values()) {
                frameQ.endOfLife();
            }
        }
        finally {
            dataLock.unlock();
        }
    }

    private boolean justLoaded(FrameAddress frameAddress) {
        return (frameAddressToJustLoaded.containsKey(frameAddress));
    }

    private void markWhetherJustLoaded(FrameAddress frameAddress, boolean justLoaded) {
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
                resultArrivedOnAnyQueue.signalAll();
            }
            finally {
                dataLock.unlock();
            }
        }
    }

    private void setCurrentLocalFrameAddress(String localFrameAddress) {
        this.setCurrentFrameAddress(FrameAddress.make(currentSeleniumWindowName, localFrameAddress));
    }

    private void setCurrentFrameAddress(FrameAddress frameAddress) {
        assert frameAddress!=null;
        this.currentFrameAddress = frameAddress;
        this.currentSeleniumWindowName = frameAddress.getWindowName();
        this.currentLocalFrameAddress = frameAddress.getLocalFrameAddress();

        if (SeleniumServer.isDebugMode()) {
            SeleniumServer.log("Current frame address set to " + currentFrameAddress + ".");
        }
    }

    public static FrameAddress makeFrameAddress(String seleniumWindowName, String localFrameAddress, boolean justLoaded) {
        if (seleniumWindowName==null) {
            // we are talking to a version of selenium core which isn't telling us the
            // seleniumWindowName.  Set it to the default, which will be right most of
            // the time.
            seleniumWindowName = DEFAULT_SELENIUM_WINDOW_NAME;
        }
        return FrameAddress.make(seleniumWindowName, localFrameAddress);
    }

//    /**
//     * TODO: someone should call this
//     */
//    public void garbageCollectOrphans() {
//        /**
//         * The list of orphaned queues was assembled in the browser session 
//         * preceding the current one.  At this point it is safe to get rid 
//         * of them; their windows must have long since being destroyed.
//         */
//        for (CommandQueue q : orphanedQueues) {
//            q.endOfLife();
//        }
//        orphanedQueues.clear();
//    }

    public void reset() {
        dataLock.lock();
        try {
            if (SeleniumServer.isProxyInjectionMode()) {
                // shut down all but the primary top level connection
                List<FrameAddress> newOrphans = new LinkedList<FrameAddress>(); 
                for (FrameAddress frameAddress : frameAddressToCommandQueue.keySet()) {
                    if (frameAddress.getLocalFrameAddress().equals(DEFAULT_LOCAL_FRAME_ADDRESS)
                            && frameAddress.getWindowName().equals(DEFAULT_SELENIUM_WINDOW_NAME)) {
                        continue;
                    }
                    selectWindow(frameAddress.getWindowName());
                    selectFrame(frameAddress.getLocalFrameAddress());
                    CommandQueue q = getCommandQueue();
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
                    frameAddressToCommandQueue.remove(frameAddress);
                }
            }
            selectWindow(DEFAULT_SELENIUM_WINDOW_NAME);
            String defaultUrl = "http://localhost:" + SeleniumServer.getPortDriversShouldContact()
            + "/selenium-server/core/InjectedRemoteRunner.html";
            doCommand("open", defaultUrl, ""); // will close out subframes
        }
        finally {
            dataLock.unlock();
        }
    }
}


