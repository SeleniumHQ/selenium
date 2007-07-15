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


import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.locks.Condition;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

import org.apache.commons.logging.Log;
import org.mortbay.log.LogFactory;


/**
 * <p>Manages sets of CommandQueues corresponding to windows and frames in a single browser session.</p>
 * 
 * @author nelsons
 */
public class FrameGroupCommandQueueSet {
    static Log log = LogFactory.getLog(FrameGroupCommandQueueSet.class);
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
    static public final Map<String, FrameGroupCommandQueueSet> queueSets = new ConcurrentHashMap<String, FrameGroupCommandQueueSet>();
    
    private Map<FrameAddress, Boolean> frameAddressToJustLoaded = new ConcurrentHashMap<FrameAddress, Boolean>();
    static private Lock dataLock = new ReentrantLock(); // 
    static private Condition resultArrivedOnAnyQueue = dataLock.newCondition();
    
    private int pageLoadTimeoutInMilliseconds = 30000;
    
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
        
        // If we didn't find a match, try finding the frame address by window title
        if (match == null) {
	        boolean windowFound = false;
	        for (FrameAddress frameAddress : frameAddressToCommandQueue.keySet()) {
		        CommandQueue commandQueue = frameAddressToCommandQueue.get(frameAddress);
        		// Following logic is when it would freeze when it would hit WindowName::top frame
        		// if (frameAddress.getWindowName().equals("WindowName") && !seleniumWindowName.equals("WindowName")) {
        		//	continue;
        		// }
        	
        		String windowName = getWindowTitle(commandQueue);
        		
        		if (windowName.equals(seleniumWindowName)) {
			        windowFound = true;
			        match = frameAddress;
			        break;
		        }
	        }
        
        	// Return with an error if we didn't find the window
	        if (!windowFound) {
	        	return "ERROR: could not find window " + seleniumWindowName;
	        }
        }
        setCurrentFrameAddress(match);
        return "OK";
    }
    
    /**
	 * Select a window by the given frame address.
	 * 
	 * @param frameAddress
	 *            Frame address to select.
	 * @return Returns "OK" if the command was successful.
	 */
	private String selectWindow(FrameAddress frameAddress) {
		if (!SeleniumServer.isProxyInjectionMode()) {
			return doCommand("selectWindow", frameAddress.getWindowName(), "");
		}

		setCurrentFrameAddress(frameAddress);
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

            if (log.isDebugEnabled()) {
                log.debug("---------allocating new CommandQueue for " + frameAddress);
            }
            q = new CommandQueue(sessionId, frameAddress, dataLock);
            frameAddressToCommandQueue.put(frameAddress, q);
        }
        else {
            if (log.isDebugEnabled()) {
                log.debug("---------retrieving CommandQueue for " + frameAddress);
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
                    long timeoutInMilliseconds = Long.parseLong(value);
                    FrameAddress frameAddress;
                    try {
                    	 // Wait for the popup window to load, if it throws
                    	 // an exception then we should simply return the
                    	 // command result
                    	 frameAddress = waitForLoad(waitingForThisWindowName, "top", (int)(timeoutInMilliseconds / 1000l));
                    	 
                    	 // if (!result.equals("OK")) {
                    	 // 	return result;
                     	 // }
                    }
                    catch (RemoteCommandException ex) {
                    	return ex.getResult();
                    }
                    
                    // Return the result of selecting the frame address, not the window name
                    return selectWindow(frameAddress);
                }
                if (command.equals("waitForPageToLoad")) {
                    return waitForLoad(arg);
                }
                if (command.equals("waitForFrameToLoad")) {
                	String waitingForThisFrameName = arg;
                	long timeoutInMilliseconds = Long.parseLong(value);
                	String result = waitForFrameLoad(waitingForThisFrameName, (int)(timeoutInMilliseconds / 1000l));
                	
                	if (!result.equals("OK"))
                		return result;
                	
                	selectFrame(waitingForThisFrameName);
                	return "OK";
                }
                if (command.equals("open")) {
                    String t = getCommandQueue().doCommand(command, arg, value);
                    if (!"OK".equals(t)) {
                        return t;
                    }
                    return waitForLoad(pageLoadTimeoutInMilliseconds);
                }

                if (command.equals("setTimeout")) {
                    try {
                        pageLoadTimeoutInMilliseconds = Integer.parseInt(arg);
                    } catch (NumberFormatException e) {
                        return "ERROR: setTimeout arg is not a number: " + arg;
                    }
                    return "OK";
                }
                
                if (command.equals("getAllWindowNames")) {
                	return getAllWindowNames();
                }                
                
                // strip off AndWait - in PI mode we handle this in the server rather than in core...
                if (command.endsWith("AndWait")) {
                    markWhetherJustLoaded(currentFrameAddress, false);
                    command = command.substring(0, command.length() - "AndWait".length());
                    String t = getCommandQueue().doCommand(command, arg, value);
                    if (!t.startsWith("OK")) {
                        return t;
                    }

                    return waitForLoad(pageLoadTimeoutInMilliseconds);
                }
            } // if (SeleniumServer.isProxyInjectionMode())
            markWhetherJustLoaded(currentFrameAddress, false);
            return getCommandQueue().doCommand(command, arg, value);
        }
        finally {
            dataLock.unlock();
        }
    }
    
    /**
     * Generates a CSV string from the given string array.
     * 
     * @param stringArray Array of strings to generate a CSV.
     */
    public String getStringArrayAccessorCSV(String[] stringArray) {
    	StringBuffer sb = new StringBuffer();
    	
    	for (int i = 0; i < stringArray.length; i++) {
    		// Obey specs for String Array accessor responses
    		String str = stringArray[i];
    		
    		// If the string contains a slash make it appear as \\ in the protocol
    		// 1 slash in Java/regex is \\\\
    		str = str.replaceAll("\\\\", "\\\\\\\\");
    		str = str.replaceAll(",", "\\\\,");
    		sb.append(str);
    		if ((i+1) < stringArray.length) {
    			sb.append('\\');
    			sb.append(',');
    			sb.append(" ");
    		}
    	}
    	
    	return sb.toString();
    }    

    /**
     * Get all window names from the server.  Since the JS in the browser
     * cannot possibly know about all windows.
     */
    private String getAllWindowNames() {
    	// If we're not in PI mode, send the command back to the browser.
        if (!SeleniumServer.isProxyInjectionMode()) {  
        	return doCommand("getAllWindowNames", "", "");
        }
        
        Set<FrameAddress> frameAddressSet = frameAddressToCommandQueue.keySet();
        List<String> windowNames = new ArrayList<String>();
        
        // Find all window names in the set of frame addresses
        for (FrameAddress frameAddress : frameAddressSet) {
        	String windowName = frameAddress.getWindowName();
        	if (!windowNames.contains(windowName)) {
        		windowNames.add(windowName);
        	}
        }
        
        String frameAddressCSV = getStringArrayAccessorCSV(windowNames.toArray(new String[0]));
        
        return "OK," + frameAddressCSV;        
    }
    
    /**
     * Get a window title in the given CommandQueue.
     * @param queue CommandQueue to get the title from.
     * @return Returns the title if it is found.
     */
    private String getWindowTitle(CommandQueue queue) {
        String cmdResult = queue.doCommand("getTitle", "", "");
    
        if (cmdResult.length() >= 3) {  
        	// Parse out and remove the OK, from the command result
        	cmdResult = cmdResult.substring(3);
        }
    	return cmdResult;
    }    
    
    /**
     * Waits for a frame to load.
     * 
     * @param timeoutInMilliseconds Time to wait in milliseconds
     * @return Returns "OK" if waiting was successful.
     */
    private String waitForFrameLoad(long timeoutInMilliseconds) {
        int timeoutInSeconds = (int) (timeoutInMilliseconds / 1000l);
    
        if (timeoutInSeconds == 0) {
            timeoutInSeconds = 1;
        }
    
    	return waitForFrameLoad(currentLocalFrameAddress, timeoutInSeconds);
    }
    
    /**
     * Waits for a frame to load.
     * 
     * @param timeoutInMilliseconds Time to wait in milliseconds
     * @return Returns "OK" if waiting was successful.
     */
    private String waitForFrameLoad(String timeoutInMilliseconds) {
        return waitForFrameLoad(Long.parseLong(timeoutInMilliseconds));
    }
    
    /**
     * Waits for a frame to load.
     * 
     * @param waitingForThisLocalFrame
     *            Frame address to wait for.
     * @param timeoutInSeconds
     *            Time to wait in seconds.
     * @return Returns "OK" if waiting was successful.
     */
    private String waitForFrameLoad(String waitingForThisLocalFrame, int timeoutInSeconds) {
        
        dataLock.lock();
    
        try {
            for (FrameAddress matchingFrameAddress = null; timeoutInSeconds >= 0; timeoutInSeconds--) {
    			matchingFrameAddress = findMatchingFrameAddressFrame(
    				frameAddressToJustLoaded.keySet(), waitingForThisLocalFrame);
    			if (matchingFrameAddress != null) {
    				log.debug("wait is over: frame \""
    				        + waitingForThisLocalFrame
    				        + "\" was seen at last (" + matchingFrameAddress
    				        + ")");
					// Remove it from the list of matching frame addresses
					// since it just loaded.  Mark whether just loaded
					// to aid debugging.
					markWhetherJustLoaded(matchingFrameAddress, false);
    				return "OK";
    			}
    			log.debug("waiting for frame \""
    			        + waitingForThisLocalFrame + "\"");
    			try {
    			    resultArrivedOnAnyQueue.await(1, TimeUnit.SECONDS);
    			} catch (InterruptedException e) {
    			}
    		}
    		return "ERROR: timed out waiting for frame \""
    				+ waitingForThisLocalFrame + "\" to appear";
    	} finally {
    		dataLock.unlock();
    	}
    }

    /**
     * Find matching frame address for the given local frame.
     * 
     * @param frameAddresses Set of frame addresses to search within.
     * @param localFrame Local frame address as a string to search for.
     * @return Returns the frame address, null if it cannot find a match.
     */
    private FrameAddress findMatchingFrameAddressFrame(
    		Set<FrameAddress> frameAddresses, String localFrame) {
        
    	for (FrameAddress frameAddress : frameAddresses) {
    		if (matchesFrameAddressFrame(frameAddress, localFrame)) {
    			return frameAddress;
    		}
    	}
    	return null;
    }
    
    /**
     * Determine if a given frame matches the given local frame address string.
     * 
     * @param frame Frame address to search.
     * @param localFrame Frame address string to search for.
     * @return Returns true if found, otherwise false.
     */
    private boolean matchesFrameAddressFrame(FrameAddress frame, String localFrame) {
    	CommandQueue queue = frameAddressToCommandQueue.get(frame);
    	String frameLocalFrame = frame.getLocalFrameAddress();
    	boolean justLoaded = justLoaded(frame);
        
        // I tried the following but it wasn't complete and am leaving here as
        // a reference of what was tried.
             
        /* boolean result = queue.matchesFrameAddress(frameLocalFrame, localFrame);
    
    	// If we are looking for the "top" frame and the frame that we are
    	// currently
    	// looking at is a subframe of "top" and it has just loaded...then
        if (frameLocalFrame.startsWith(localFrame)
                && frameLocalFrame.startsWith(localFrame + "." + "frames")
                && justLoaded && result) {
            return true;
        } else if (localFrame.equals("top")
                && frameLocalFrame.startsWith("top.frames") && justLoaded
                && result) {
            return true;
        }
        */
    		
    		
    	// If the frame has just loaded...and
    	// 1) if the local frame is equal to the given frame address
    	//    OR:
    	// 2) if the browser returns yes if the local frame does in fact
    	//    match the given frame address to the frame
    	if (justLoaded
    			&& (localFrame.equals(frameLocalFrame) || queue
    					.matchesFrameAddress(frameLocalFrame, localFrame))) {
    		return true;
    	}
    	return false;
    }    

    public String waitForLoad(long timeoutInMilliseconds) {
        int timeoutInSeconds = (int)(timeoutInMilliseconds / 1000l);
        if (timeoutInSeconds == 0) {
            timeoutInSeconds = 1;
        }
        try {
        	FrameAddress frameAddress = waitForLoad(currentSeleniumWindowName, currentLocalFrameAddress, timeoutInSeconds);
        	
        	if (frameAddress == null) {
        		throw new RuntimeException("frame address is null in waitForLoad...this should not happen.");
        	}
        	else {
        		return "OK";
        	}
        }
        catch (RemoteCommandException se) {
        	return se.getMessage();
        }
    }
    
    private String waitForLoad(String timeoutInMilliseconds) {
        return waitForLoad(Long.parseLong(timeoutInMilliseconds));
    }

    private FrameAddress waitForLoad(String waitingForThisWindowName, String waitingForThisLocalFrame, int timeoutInSeconds) throws RemoteCommandException {
        dataLock.lock();
        try {
            for (FrameAddress matchingFrameAddress = null; timeoutInSeconds >= 0; timeoutInSeconds--) {
                log.debug("waiting for window \"" + waitingForThisWindowName + "\"" + " local frame \"" + waitingForThisLocalFrame + "\" for " + timeoutInSeconds + " more secs");
                matchingFrameAddress = findMatchingFrameAddress(frameAddressToJustLoaded.keySet(), 
                        waitingForThisWindowName, waitingForThisLocalFrame);
                if (matchingFrameAddress!=null) {
                    log.debug("wait is over: window \"" + waitingForThisWindowName + "\" was seen at last (" + matchingFrameAddress + ")");
					// Remove it from the list of matching frame addresses
					// since it just loaded.  Mark whether just loaded
					// to aid debugging.
					markWhetherJustLoaded(matchingFrameAddress, false);
                    return matchingFrameAddress;
                }
                try {
                    resultArrivedOnAnyQueue.await(1, TimeUnit.SECONDS);
                } catch (InterruptedException e) {
                }
            }
            String result = "timed out waiting for window \"" + waitingForThisWindowName + "\" to appear";
            throw new RemoteCommandException(result, result);
        }
        catch (RemoteCommandException se) {
        	throw new RemoteCommandException(se.getMessage(), se.getResult(), se);
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
        
        CommandQueue queue = frameAddressToCommandQueue.get(f);
        boolean windowJustLoaded = justLoaded(f);
//        if (windowName != null && f.getLocalFrameAddress().equals("top")) {
        if (windowJustLoaded) {
        	boolean windowDoesMatch = queue.matchesFrameAddress(f.getLocalFrameAddress(), localFrame);

			// Mark the frame as still loaded because we just sent a command
			markWhetherJustLoaded(f, true);        	
        	
        	//if (windowDoesMatch) {
        		String title = getWindowTitle(queue);
        		markWhetherJustLoaded(f, true);  
        		if (title.equals(windowName) ) {
        			return true;
        		}
        	//}
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
            
            if (justLoaded) {
                markWhetherJustLoaded(incomingFrameAddress, true);
            	commandResult = null;
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
                    if (log.isDebugEnabled()) {
                        log.debug(frameAddress + " marked as just loaded");
                    }
                    frameAddressToJustLoaded.put(frameAddress, true);
                }
                else {
                    if (log.isDebugEnabled()) {
                        log.debug(frameAddress + " marked as NOT just loaded");
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

        if (log.isDebugEnabled()) {
            log.debug("Current frame address set to " + currentFrameAddress + ".");
        }
    }

    public static FrameAddress makeFrameAddress(String seleniumWindowName, String localFrameAddress) {
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
                        if (log.isDebugEnabled()) {
                            log.debug("Trying to close " + frameAddress);
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


