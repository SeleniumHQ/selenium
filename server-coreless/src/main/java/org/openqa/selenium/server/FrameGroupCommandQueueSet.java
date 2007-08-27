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
import java.util.Arrays;
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
    private String currentUniqueId = null;
    
    private Map<String, CommandQueue> uniqueIdToCommandQueue = new ConcurrentHashMap<String, CommandQueue>();
    static private final Map<String, FrameGroupCommandQueueSet> queueSets = new ConcurrentHashMap<String, FrameGroupCommandQueueSet>();
    
    private Map<String, Boolean> frameAddressToJustLoaded = new ConcurrentHashMap<String, Boolean>();
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


    /**
     * Simple boolean to track if this queue set has been killed or not
     */
    private boolean dead = false;

    public FrameGroupCommandQueueSet(String sessionId) {
        this.sessionId = sessionId;
    }

    private String selectWindow(String seleniumWindowName) {
        if (!SeleniumServer.isProxyInjectionMode()) {
            return doCommand("selectWindow", seleniumWindowName, "");
        }
        if ("null".equals(seleniumWindowName)) {
            // this results from only working with strings over the wire
            currentSeleniumWindowName = DEFAULT_SELENIUM_WINDOW_NAME;
        }
        String match = findMatchingFrameAddress(uniqueIdToCommandQueue.keySet(),
                    seleniumWindowName, DEFAULT_LOCAL_FRAME_ADDRESS);
        
        // If we didn't find a match, try finding the frame address by window title
        if (match == null) {
	        boolean windowFound = false;
	        for (String uniqueId : uniqueIdToCommandQueue.keySet()) {
		        CommandQueue commandQueue = uniqueIdToCommandQueue.get(uniqueId);
        		// Following logic is when it would freeze when it would hit WindowName::top frame
        		// if (frameAddress.getWindowName().equals("WindowName") && !seleniumWindowName.equals("WindowName")) {
        		//	continue;
        		// }
        	
        		String windowName;
        		try {
        			windowName = getRemoteWindowTitle(commandQueue);
        		} catch (WindowClosedException e) {
        			// If the window is closed, then it can't be the window we're looking for
        			continue;
        		}
        		
        		if (windowName.equals(seleniumWindowName)) {
			        windowFound = true;
			        match = uniqueId;
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

    public CommandQueue getCommandQueue() {
        return getCommandQueue(currentUniqueId);
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


    public CommandQueue getCommandQueue(String uniqueId) {
        dataLock.lock();
    	try {
			CommandQueue q = uniqueIdToCommandQueue.get(uniqueId);
			if (q==null) {

			    if (log.isDebugEnabled()) {
			        log.debug("---------allocating new CommandQueue for " + uniqueId);
			    }
			    q = new CommandQueue(sessionId, uniqueId, dataLock);
			    uniqueIdToCommandQueue.put(uniqueId, q);
			}
			else {
			    if (log.isDebugEnabled()) {
			        log.debug("---------retrieving CommandQueue for " + uniqueId);
			    }
			}
			return uniqueIdToCommandQueue.get(uniqueId);
		} finally {
			dataLock.unlock();
		}
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
                        arg = "top";
                    }
                    boolean newFrameFound = false;
                    // DGF iterate in lexical order for testability
                    Set<String> idSet = uniqueIdToCommandQueue.keySet();
                    String[] ids = idSet.toArray(new String[0]);
                    Arrays.sort(ids);
                    for (String uniqueId : ids) {
                    	CommandQueue frameQ = uniqueIdToCommandQueue.get(uniqueId);
                    	if (frameQ.isClosed()) {
                    	    continue;
                    	}
                    	FrameAddress frameAddress = frameQ.getFrameAddress();
                        if (frameAddress.getWindowName().equals(currentSeleniumWindowName)) {
                            if (queueMatchesFrameAddress(frameQ, currentLocalFrameAddress, arg)) {
                                setCurrentFrameAddress(uniqueId);
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
                    String uniqueId;
                    try {
                    	 // Wait for the popup window to load, if it throws
                    	 // an exception then we should simply return the
                    	 // command result
                    	 uniqueId = waitForLoad(waitingForThisWindowName, "top", (int)(timeoutInMilliseconds / 1000l));
                    	 
                    	 // if (!result.equals("OK")) {
                    	 // 	return result;
                     	 // }
                    }
                    catch (RemoteCommandException ex) {
                    	return ex.getResult();
                    }
                    
                    // Return the result of selecting the frame address, not the window name
                    setCurrentFrameAddress(uniqueId);
                    return "OK";
                }
                if (command.equals("waitForPageToLoad")) {
                    return waitForLoad(arg);
                }
                if (command.equals("waitForFrameToLoad")) {
                	String waitingForThisFrameName = arg;
                	long timeoutInMilliseconds = Long.parseLong(value);
                	String currentWindowName = getCommandQueue().getFrameAddress().getWindowName();
                	String result;
					try {
						result = waitForLoad(currentWindowName, waitingForThisFrameName, (int)(timeoutInMilliseconds / 1000l));
					} catch (RemoteCommandException e) {
						return e.getMessage();
					}
                	setCurrentFrameAddress(result);
                	return "OK";
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
                
                // handle closed queue (the earlier commands don't care about closed queues)
                CommandQueue queue = getCommandQueue();
                if (queue.isClosed()) {
                    try {
                        String uniqueId = waitForLoad(currentSeleniumWindowName, currentLocalFrameAddress, 1);
                        setCurrentFrameAddress(uniqueId);
                    } catch (RemoteCommandException e) {
                        return WindowClosedException.WINDOW_CLOSED_ERROR;
                    }
                }
                
                if (command.equals("open")) {
                    markWhetherJustLoaded(currentUniqueId, false);
                    String t = getCommandQueue().doCommand(command, arg, value);
                    if (!"OK".equals(t)) {
                        return t;
                    }
                    return waitForLoad(pageLoadTimeoutInMilliseconds);
                }
                
                // strip off AndWait - in PI mode we handle this in the server rather than in core...
                if (command.endsWith("AndWait")) {
                    markWhetherJustLoaded(currentUniqueId, false);
                    command = command.substring(0, command.length() - "AndWait".length());
                    String t = getCommandQueue().doCommand(command, arg, value);
                    if (!t.startsWith("OK")) {
                        return t;
                    }

                    return waitForLoad(pageLoadTimeoutInMilliseconds);
                }
            } // if (SeleniumServer.isProxyInjectionMode())
            markWhetherJustLoaded(currentUniqueId, false);
            return getCommandQueue().doCommand(command, arg, value);
        }
        finally {
            dataLock.unlock();
        }
    }
    
    private void handleInvalidQueue() {
        
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
        
        Set<String> frameAddressSet = uniqueIdToCommandQueue.keySet();
        List<String> windowNames = new ArrayList<String>();
        
        // Find all window names in the set of frame addresses
        for (String uniqueId : frameAddressSet) {
        	FrameAddress frameAddress = uniqueIdToCommandQueue.get(uniqueId).getFrameAddress();
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
     * @throws WindowClosedException 
     */
    private String getRemoteWindowTitle(CommandQueue queue) throws WindowClosedException {
        String cmdResult = queue.doCommand("getTitle", "", "");
        
        if (cmdResult == null) cmdResult = "";
        
        if (cmdResult.startsWith("OK,")) {
        	// Parse out and remove the OK, from the command result
        	cmdResult = cmdResult.substring(3);
        	return cmdResult;
        } else {
        	if (WindowClosedException.WINDOW_CLOSED_ERROR.equals(cmdResult)) {
        		throw new WindowClosedException();
        	}
        	throw new RuntimeException("unexpected browser error from getTitle: " + cmdResult);
        }
    
    }
        
    public String waitForLoad(long timeoutInMilliseconds) {
        int timeoutInSeconds = (int)(timeoutInMilliseconds / 1000l);
        if (timeoutInSeconds == 0) {
            timeoutInSeconds = 1;
        }
        try {
        	String uniqueId = waitForLoad(currentSeleniumWindowName, currentLocalFrameAddress, timeoutInSeconds);
        	setCurrentFrameAddress(uniqueId);
        	if (uniqueId == null) {
        		throw new RuntimeException("uniqueId is null in waitForLoad...this should not happen.");
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

    private String waitForLoad(String waitingForThisWindowName,
            String waitingForThisLocalFrame, int timeoutInSeconds)
            throws RemoteCommandException {
        for (String matchingFrameAddress = null; timeoutInSeconds >= 0; timeoutInSeconds--) {
            dataLock.lock();
            try {
                // if the queue has been end-of-life'd, don't bother waiting in this look, just quit immediately
                if (dead) {
                    break;
                }

                log.debug("waiting for window \"" + waitingForThisWindowName
                        + "\"" + " local frame \"" + waitingForThisLocalFrame
                        + "\" for " + timeoutInSeconds + " more secs");
                matchingFrameAddress = findMatchingFrameAddress(
                        frameAddressToJustLoaded.keySet(),
                        waitingForThisWindowName, waitingForThisLocalFrame);
                if (matchingFrameAddress != null) {
                    log.debug("wait is over: window \""
                            + waitingForThisWindowName
                            + "\" was seen at last (" + matchingFrameAddress
                            + ")");
                    // Remove it from the list of matching frame addresses
                    // since it just loaded. Mark whether just loaded
                    // to aid debugging.
                    markWhetherJustLoaded(matchingFrameAddress, false);
                    return matchingFrameAddress;
                }
                try {
                    resultArrivedOnAnyQueue.await(1, TimeUnit.SECONDS);
                } catch (InterruptedException e) {
                }
            } finally {
                dataLock.unlock();
            }
        }
        String result = "timed out waiting for window \""
                + waitingForThisWindowName + "\" to appear";
        throw new RemoteCommandException(result, result);
    }

    private String findMatchingFrameAddress(Set<String> uniqueIds, String windowName, String localFrame) {
        for (String uniqueId : uniqueIds) {
            if (matchesFrameAddress(uniqueId, windowName, localFrame)) {
                return uniqueId;
            }
        }
        return null;
    }

    /**
     * Does uniqueId point at a window that matches 'windowName'/'localFrame'?
     * 
     * @param uniqueId
     * @param windowName
     * @param localFrame
     * @return True if the frame addressed by uniqueId is addressable by window name 'windowName' and local frame address 'localFrame'. 
     */
    private boolean matchesFrameAddress(String uniqueId, String windowName, String localFrame) {
        // it's an odd selenium convention: "null" maps to the initial, main window:
        if (windowName==null || windowName.equals("null")) {
            windowName = DEFAULT_SELENIUM_WINDOW_NAME;
        }
        if (localFrame == null) {
            localFrame = "top";
        }
        CommandQueue queue = uniqueIdToCommandQueue.get(uniqueId);
        if (queue.isClosed()) {
            return false;
        }
        boolean windowJustLoaded = justLoaded(uniqueId);
//        if (windowName != null && f.getLocalFrameAddress().equals("top")) {
        FrameAddress frameAddress = queue.getFrameAddress();
        if (!frameAddress.getLocalFrameAddress().equals(localFrame)) {
            return false;
        }
        // DGF Windows that have just loaded may not know their true identity
        if (windowJustLoaded) {
    	    String title;
			try {
				title = getRemoteWindowTitle(queue);
			} catch (WindowClosedException e) {
				return false;
			}
    		markWhetherJustLoaded(uniqueId, true);  
    		if (title.equals(windowName) ) {
    			return true;
    		}
        	
        }
        String actualWindowName = frameAddress.getWindowName();
        if (windowName.equals(actualWindowName)) {
            return true;
        }
        if (windowName.equals("_blank") && actualWindowName.startsWith("selenium_blank")) {
            // DGF the API automatically changed target="_blank" to target="selenium_blank12345"
            return true;
        }
        return uniqueIdToCommandQueue.get(uniqueId).isWindowPointedToByJsVariable(windowName);
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
            CommandQueue queue = getCommandQueue(uniqueId);
            queue.setFrameAddress(incomingFrameAddress);
            if (jsWindowNameVars!=null) {
                for (Object jsWindowNameVar : jsWindowNameVars) {
                    queue.addJsWindowNameVar((String)jsWindowNameVar);                    
                }
            }
            
            if (justLoaded) {
                markWhetherJustLoaded(uniqueId, true);
            	commandResult = null;
            }
            
            if (WindowClosedException.WINDOW_CLOSED_ERROR.equals(commandResult)) {
                queue.declareClosed();
                return new DefaultRemoteCommand("testComplete", "", "");
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
        dead = true;
        try {
            for (CommandQueue frameQ : uniqueIdToCommandQueue.values()) {
                frameQ.endOfLife();
            }
        }
        finally {
            dataLock.unlock();
        }
    }

    private boolean justLoaded(String uniqueId) {
        return (frameAddressToJustLoaded.containsKey(uniqueId));
    }

    private void markWhetherJustLoaded(String frameAddress, boolean justLoaded) {
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

    private void setCurrentFrameAddress(String uniqueId) {
        assert uniqueId!=null;
        FrameAddress frameAddress = uniqueIdToCommandQueue.get(uniqueId).getFrameAddress();
        this.currentUniqueId = uniqueId;
        this.currentFrameAddress = frameAddress;
        this.currentSeleniumWindowName = frameAddress.getWindowName();
        this.currentLocalFrameAddress = frameAddress.getLocalFrameAddress();
        markWhetherJustLoaded(uniqueId, false);
        if (log.isDebugEnabled()) {
            log.debug("Current uniqueId set to " + uniqueId + ", frameAddress = " + frameAddress);
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
                for (String uniqueId : uniqueIdToCommandQueue.keySet()) {
                	CommandQueue q = getCommandQueue(uniqueId);
                	FrameAddress frameAddress = q.getFrameAddress();
                    if (frameAddress.getLocalFrameAddress().equals(DEFAULT_LOCAL_FRAME_ADDRESS)
                            && frameAddress.getWindowName().equals(DEFAULT_SELENIUM_WINDOW_NAME)) {
                        continue;
                    }
                    if (frameAddress.getLocalFrameAddress().equals(DEFAULT_LOCAL_FRAME_ADDRESS)) {
                        if (log.isDebugEnabled()) {
                            log.debug("Trying to close " + frameAddress);
                        }
                        try {
							q.doCommandWithoutWaitingForAResponse("close", "", "");
						} catch (WindowClosedException e) {
							log.debug("Window was already closed");
						}
                    }
                    orphanedQueues.add(q);
                    newOrphans.add(frameAddress);
                }
                for (FrameAddress frameAddress : newOrphans) {
                    uniqueIdToCommandQueue.remove(frameAddress);
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

	private boolean queueMatchesFrameAddress(CommandQueue queue, String currentLocalFrameAddress, String newFrameAddressExpression) {
		boolean result;
		try {
			result = doBooleanCommand(queue, "getWhetherThisFrameMatchFrameExpression", currentLocalFrameAddress, newFrameAddressExpression);
		} catch (WindowClosedException e) {
			return false;
		}
		return result;
	}

	private boolean doBooleanCommand(CommandQueue queue, String command, String arg1, String arg2) throws WindowClosedException {
		String booleanResult = queue.doCommand(command, arg1, arg2);
		boolean result;
		if ("OK,true".equals(booleanResult)) {
		    result = true;
		}
		else if ("OK,false".equals(booleanResult)) {
		    result = false;
		}
		else {
			if (WindowClosedException.WINDOW_CLOSED_ERROR.equals(booleanResult)) {
				throw new WindowClosedException();
			}
		    throw new RuntimeException("unexpected return " + booleanResult + " from boolean command " + command);
		}
		CommandQueue.log.debug("doBooleancommand(" + command + "(" + arg1 + ", " + arg2 + ") -> " + result);
		return result;
	}
}


