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


import java.io.File;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.locks.Condition;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;
import java.util.logging.Logger;

import org.openqa.selenium.net.Urls;


/**
 * <p>
 * Manages sets of CommandQueues corresponding to windows and frames in a single browser session.
 * </p>
 * 
 * @author nelsons
 */
public class FrameGroupCommandQueueSet {
  private static final Logger log = Logger.getLogger(FrameGroupCommandQueueSet.class.getName());

  static private final Map<String, FrameGroupCommandQueueSet> queueSets =
      new ConcurrentHashMap<String, FrameGroupCommandQueueSet>();
  static private Lock dataLock = new ReentrantLock(); //
  static private Condition resultArrivedOnAnyQueue = dataLock.newCondition();

  /**
   * JavaScript expression telling where the frame is within the current window (i.e., "local" to
   * the current window).
   */
  private String currentLocalFrameAddress;
  /**
   * the name of the user-level window in selenium's record-keeping.
   * <p/>
   * The initial browser window has a blank name. When a test calls waitForPopUp, that call's
   * argument is the window name as far as selenium is concerned.
   */
  private String currentSeleniumWindowName;
  /**
   * combines currentSeleniumWindowName and currentLocalFrameAddress to form an address of a frame
   * which is unique across all windows
   */
  private FrameAddress currentFrameAddress = null;
  private String currentUniqueId = null;

  private final Set<File> tempFilesForSession = Collections.synchronizedSet(new HashSet<File>());
  private Map<String, CommandQueue> uniqueIdToCommandQueue =
      new ConcurrentHashMap<String, CommandQueue>();

  private Map<String, Boolean> frameAddressToJustLoaded = new ConcurrentHashMap<String, Boolean>();

  private int pageLoadTimeoutInMilliseconds = 30000;
  private AtomicInteger millisecondDelayBetweenOperations;

  /**
   * A unique string denoting a session with a browser.
   * <p/>
   * In most cases this session begins with the selenium server configuring and starting a browser
   * process, and ends with a selenium server killing that process.
   */
  private final String sessionId;
  private final boolean proxyInjectionMode;
  /**
   * Queues which will not be used anymore, but which cannot be immediately destroyed because their
   * corresponding windows may still be listening.
   */
  private Set<CommandQueue> orphanedQueues = new HashSet<CommandQueue>();

  public static final String DEFAULT_LOCAL_FRAME_ADDRESS = "top";
  /**
   * Each user-visible window group has a selenium window name. The name of the initial browser
   * window is "". Even if the page reloads, the JavaScript is able to determine that it is this
   * initial window because window.opener==null. Any window for whom window.opener!=null is a
   * "pop-up".
   */
  public static final String DEFAULT_SELENIUM_WINDOW_NAME = "";
  private int portDriversShouldContact;
  private RemoteControlConfiguration configuration;

  /**
   * The extension Javascript particular to this session.
   */
  private String extensionJs;

  public FrameGroupCommandQueueSet(String sessionId, int portDriversShouldContact,
      RemoteControlConfiguration configuration) {

    this.sessionId = sessionId;
    this.portDriversShouldContact = portDriversShouldContact;
    this.configuration = configuration;
    this.extensionJs = "";
    proxyInjectionMode = configuration.getProxyInjectionModeArg();

    /*
     * Initialize delay, using the static CommandQueue getSpeed in order to imitate previous
     * behavior, wherein that static field would control the speed for all sessions. The speed for a
     * frame group's queues will only be changed if they're changed via this class's setSpeed().
     */
    millisecondDelayBetweenOperations = new AtomicInteger(CommandQueue.getSpeed());
  }

  private String selectWindow(String seleniumWindowName) {
    if (!proxyInjectionMode) {
      String result;
      try {
        result = doCommand("selectWindow", seleniumWindowName, "");
      } catch (RemoteCommandException rce) {
        result = rce.getMessage();
      }
      return result;
    }
    if (seleniumWindowName == null) {
      seleniumWindowName = DEFAULT_SELENIUM_WINDOW_NAME;
    }
    if (seleniumWindowName.startsWith("title=")) {
      return selectWindowByRemoteTitle(seleniumWindowName.substring(6));
    }
    // TODO separate name and var into separate functions
    if (seleniumWindowName.startsWith("name=")) {
      seleniumWindowName = seleniumWindowName.substring(5);
      return selectWindowByNameOrVar(seleniumWindowName);
    }
    if (seleniumWindowName.startsWith("var=")) {
      seleniumWindowName = seleniumWindowName.substring(4);
      return selectWindowByNameOrVar(seleniumWindowName);
    }
    // no locator prefix; try the default strategies
    String match =
        findMatchingFrameAddress(uniqueIdToCommandQueue.keySet(), seleniumWindowName,
            DEFAULT_LOCAL_FRAME_ADDRESS);

    // If we didn't find a match, try finding the frame address by window title
    if (match == null) {
      return selectWindowByRemoteTitle(seleniumWindowName);
    }

    // we found a match
    setCurrentFrameAddress(match);
    return "OK";
  }

  private String selectWindowByNameOrVar(String seleniumWindowName) {
    String match =
        findMatchingFrameAddress(uniqueIdToCommandQueue.keySet(), seleniumWindowName,
            DEFAULT_LOCAL_FRAME_ADDRESS);
    if (match == null) {
      return "ERROR: could not find window " + seleniumWindowName;
    }
    setCurrentFrameAddress(match);
    return "OK";
  }

  private String selectWindowByRemoteTitle(String title) {
    String match = null;
    boolean windowFound = false;
    for (String uniqueId : uniqueIdToCommandQueue.keySet()) {
      CommandQueue commandQueue = uniqueIdToCommandQueue.get(uniqueId);

      String windowName;
      try {
        windowName = getRemoteWindowTitle(commandQueue);
      } catch (WindowClosedException e) {
        // If the window is closed, then it can't be the window we're looking for
        continue;
      }

      if (windowName.equals(title)) {
        windowFound = true;
        match = uniqueId;
        break;
      }
    }
    // Return with an error if we didn't find the window
    if (!windowFound) {
      return "ERROR: could not find window " + title;
    }
    setCurrentFrameAddress(match);
    return "OK";
  }

  public CommandQueue getCommandQueue() {
    return getCommandQueue(currentUniqueId);
  }


  /**
   * Retrieves a FrameGroupCommandQueueSet for the specified sessionId
   */
  static public FrameGroupCommandQueueSet getQueueSet(String sessionId) {
    if (sessionId == null) {
      throw new NullPointerException(
          "sessionId should not be null; has this session been started yet?");
    }
    FrameGroupCommandQueueSet queueSet = FrameGroupCommandQueueSet.queueSets.get(sessionId);
    if (queueSet == null) {
      throw new RuntimeException("sessionId " + sessionId
          + " doesn't exist; perhaps this session was already stopped?");
    }
    return queueSet;
  }

  /**
   * Creates a FrameGroupCommandQueueSet for the specifed sessionId
   */
  static public FrameGroupCommandQueueSet makeQueueSet(String sessionId,
      int portDriversShouldContact, RemoteControlConfiguration configuration) {
    synchronized (queueSets) {
      FrameGroupCommandQueueSet queueSet = FrameGroupCommandQueueSet.queueSets.get(sessionId);
      if (queueSet != null) {
        throw new RuntimeException("sessionId " + sessionId + " already exists");
      }
      queueSet = new FrameGroupCommandQueueSet(sessionId, portDriversShouldContact, configuration);
      FrameGroupCommandQueueSet.queueSets.put(sessionId, queueSet);
      return queueSet;
    }
  }

  /**
   * Deletes the specified FrameGroupCommandQueueSet
   */
  static public void clearQueueSet(String sessionId) {
    log.fine("clearing queue set");
    FrameGroupCommandQueueSet queue = FrameGroupCommandQueueSet.queueSets.get(sessionId);
    if (null != queue) {
      queue.endOfLife();
      FrameGroupCommandQueueSet.queueSets.remove(sessionId);
    }
  }

  public CommandQueue getCommandQueue(String uniqueId) {
    CommandQueue q = uniqueIdToCommandQueue.get(uniqueId);
    if (q == null) {
      log.fine("---------allocating new CommandQueue for " + uniqueId);

      q =
          new CommandQueue(sessionId, uniqueId, millisecondDelayBetweenOperations.get(),
              configuration);
      uniqueIdToCommandQueue.put(uniqueId, q);
    } else {
      log.fine("---------retrieving CommandQueue for " + uniqueId);
    }
    return uniqueIdToCommandQueue.get(uniqueId);
  }

  /**
   * Sets this frame group's speed, and updates all command queues to use this speed.
   * 
   * @param i millisecond delay between queue operations
   */
  protected void setSpeed(int i) {
    millisecondDelayBetweenOperations.set(i);
    for (CommandQueue queue : uniqueIdToCommandQueue.values()) {
      queue.setQueueDelay(i);
    }
  }

  /**
   * Returns the delay for this frame group's command queues
   * 
   * @return millisecond delay between queue operations
   */
  protected int getSpeed() {
    return millisecondDelayBetweenOperations.get();
  }

  /**
   * Schedules the specified command to be retrieved by the next call to handle command result, and
   * returns the result of that command.
   * 
   * @param command - the remote command verb
   * @param arg - the first remote argument (meaning depends on the verb)
   * @param value - the second remote argument
   * @return - the command result, defined by the remote JavaScript. "getX" style commands may
   *         return data from the browser; other "doX" style commands may just return "OK" or an
   *         error message.
   * @throws RemoteCommandException if a waitForLoad failed.
   */
  public String doCommand(String command, String arg, String value) throws RemoteCommandException {
    if (proxyInjectionMode) {
      if ("selectFrame".equals(command)) {
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
          return "ERROR: starting from frame " + currentFrameAddress + ", could not find frame "
              + arg;
        }
        return "OK";
      }
      if ("selectWindow".equals(command)) {
        return selectWindow(arg);
      }
      if ("waitForPopUp".equals(command)) {
        String waitingForThisWindowName = arg;
        long timeoutInMilliseconds = Long.parseLong(value);
        String uniqueId;
        try {
          // Wait for the popup window to load, if it throws
          // an exception then we should simply return the
          // command result
          uniqueId =
              waitForLoad(waitingForThisWindowName, "top", (int) (timeoutInMilliseconds / 1000l));

          // if (!result.equals("OK")) {
          // return result;
          // }
        } catch (RemoteCommandException ex) {
          return ex.getResult();
        }

        // Return the result of selecting the frame address, not the window name
        setCurrentFrameAddress(uniqueId);
        return "OK";
      }
      if ("waitForPageToLoad".equals(command)) {
        return waitForLoad(arg);
      }
      if ("waitForFrameToLoad".equals(command)) {
        String waitingForThisFrameName = arg;
        long timeoutInMilliseconds = Long.parseLong(value);
        String currentWindowName = getCommandQueue().getFrameAddress().getWindowName();
        String result;
        try {
          result =
              waitForLoad(currentWindowName, waitingForThisFrameName,
                  (int) (timeoutInMilliseconds / 1000l));
        } catch (RemoteCommandException e) {
          return e.getMessage();
        }
        setCurrentFrameAddress(result);
        return "OK";
      }

      if ("setTimeout".equals(command)) {
        try {
          pageLoadTimeoutInMilliseconds = Integer.parseInt(arg);
        } catch (NumberFormatException e) {
          return "ERROR: setTimeout arg is not a number: " + arg;
        }
        return "OK";
      }

      if ("getAllWindowNames".equals(command)) {
        return getAttributeFromAllWindows("name");
      }
      if ("getAllWindowTitles".equals(command)) {
        return getAttributeFromAllWindows("document.title");
      }
      if ("getAllWindowIds".equals(command)) {
        return getAttributeFromAllWindows("id");
      }
      if ("getAttributeFromAllWindows".equals(command)) {
        return getAttributeFromAllWindows(arg);
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

      if ("open".equals(command)) {
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
    } // if (proxyInjectionMode)
    markWhetherJustLoaded(currentUniqueId, false);
    return getCommandQueue().doCommand(command, arg, value);
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
      if ((i + 1) < stringArray.length) {
        sb.append('\\');
        sb.append(',');
        sb.append(" ");
      }
    }

    return sb.toString();
  }

  /**
   * Get all window attributes from the server. Since the JS in the browser cannot possibly know
   * about all windows.
   */
  private String getAttributeFromAllWindows(String attributeName) {
    // If we're not in PI mode, send the command back to the browser.
    if (!proxyInjectionMode) {
      String result;
      try {
        result = doCommand("getAttributeFromAllWindows", "", "");
      } catch (RemoteCommandException rce) {
        result = rce.getMessage();
      }
      return result;
    }

    Set<String> frameAddressSet = uniqueIdToCommandQueue.keySet();
    List<String> windowTitles = new ArrayList<String>();

    // Find all window names in the set of frame addresses
    for (String uniqueId : frameAddressSet) {
      CommandQueue q = uniqueIdToCommandQueue.get(uniqueId);
      String attribute;
      try {
        attribute = getRemoteString(q, "getEval", "window." + attributeName, "");
      } catch (WindowClosedException e) {
        continue;
      }
      windowTitles.add(attribute);
    }

    String frameAddressCSV = getStringArrayAccessorCSV(windowTitles.toArray(new String[0]));

    return "OK," + frameAddressCSV;
  }

  /**
   * Get a window title in the given CommandQueue.
   * 
   * @param queue CommandQueue to get the title from.
   * @return Returns the title if it is found.
   * @throws WindowClosedException
   */
  private String getRemoteWindowTitle(CommandQueue queue) throws WindowClosedException {
    return getRemoteString(queue, "getTitle", "", "");

  }

  private String getRemoteString(CommandQueue queue, String command, String arg1, String arg2)
      throws WindowClosedException {
    String cmdResult = queue.doCommand(command, arg1, arg2);

    if (cmdResult == null) cmdResult = "";

    if (cmdResult.startsWith("OK,")) {
      // Parse out and remove the OK, from the command result
      cmdResult = cmdResult.substring(3);
      return cmdResult;
    }
    if (WindowClosedException.WINDOW_CLOSED_ERROR.equals(cmdResult)) {
      throw new WindowClosedException();
    }
    throw new RuntimeException("unexpected browser error from getTitle: " + cmdResult);
  }

  public String waitForLoad(long timeoutInMilliseconds) throws RemoteCommandException {
    final String uniqueId;

    int timeoutInSeconds = (int) (timeoutInMilliseconds / 1000l);
    if (timeoutInSeconds == 0) {
      timeoutInSeconds = 1;
    }
    uniqueId = waitForLoad(currentSeleniumWindowName, currentLocalFrameAddress, timeoutInSeconds);
    setCurrentFrameAddress(uniqueId);
    if (uniqueId == null) {
      throw new RuntimeException("uniqueId is null in waitForLoad...this should not happen.");
    }
    return "OK";
  }

  private String waitForLoad(String timeoutInMilliseconds) throws RemoteCommandException {
    return waitForLoad(Long.parseLong(timeoutInMilliseconds));
  }

  private String waitForLoad(String waitingForThisWindowName, String waitingForThisLocalFrame,
      int timeoutInSeconds) throws RemoteCommandException {

    for (String matchingFrameAddress = null; timeoutInSeconds >= 0; timeoutInSeconds--) {
      dataLock.lock();
      try {
        log.fine("waiting for window '" + waitingForThisWindowName + "' local frame '"
            + waitingForThisLocalFrame + "' for " + timeoutInSeconds + " more secs");

        matchingFrameAddress =
            findMatchingFrameAddress(frameAddressToJustLoaded.keySet(), waitingForThisWindowName,
                waitingForThisLocalFrame);
        if (null != matchingFrameAddress) {
          log.fine("wait is over: window '" + waitingForThisWindowName + "' was seen at last ("
              + matchingFrameAddress + ")");
          /*
           * Remove it from the list of matching frame addresses since it just loaded. Mark whether
           * just loaded to aid debugging.
           */
          markWhetherJustLoaded(matchingFrameAddress, false);
          return matchingFrameAddress;
        }

        waitUntilSignalOrNumSecondsPassed(resultArrivedOnAnyQueue, 1);
      } finally {
        dataLock.unlock();
      }
    }
    String result = "timed out waiting for window '" + waitingForThisWindowName + "' to appear";
    throw new RemoteCommandException(result, result);
  }

  /**
   * Waits on the condition, making sure to wait at least as many seconds as specified, unless the
   * condition is signaled first.
   * 
   * @param condition
   * @param numSeconds
   */
  protected static boolean waitUntilSignalOrNumSecondsPassed(Condition condition, int numSeconds) {
    boolean result = false;
    if (numSeconds > 0) {
      long now = System.currentTimeMillis();
      long deadline = now + (numSeconds * 1000);
      while (now < deadline) {
        try {
          log.fine("waiting for condition for " + (deadline - now) + " more ms");
          result = condition.await(deadline - now, TimeUnit.MILLISECONDS);
          log.fine("got condition? : " + result);
          now = deadline;
        } catch (InterruptedException ie) {
          now = System.currentTimeMillis();
        }
      }
    }
    return result;
  }

  protected static void sleepForAtLeast(long ms) {
    if (ms > 0) {
      long now = System.currentTimeMillis();
      long deadline = now + ms;
      while (now < deadline) {
        try {
          Thread.sleep(deadline - now);
          now = deadline; // terminates loop
        } catch (InterruptedException ie) {
          now = System.currentTimeMillis();
        }
      }
    }
  }

  private String findMatchingFrameAddress(Set<String> uniqueIds, String windowName,
      String localFrame) {
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
   * @return True if the frame addressed by uniqueId is addressable by window name 'windowName' and
   *         local frame address 'localFrame'.
   */
  private boolean matchesFrameAddress(String uniqueId, String windowName, String localFrame) {
    // it's an odd selenium convention: "null" maps to the initial, main window:
    if (windowName == null || windowName.equals("null")) {
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
      if (title.equals(windowName)) {
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
   * <p>
   * Accepts a command reply, and retrieves the next command to run.
   * </p>
   * 
   * @param commandResult - the reply from the previous command, or null
   * @param incomingFrameAddress - frame from which the reply came
   * @param uniqueId
   * @param justLoaded
   * @param jsWindowNameVars
   * @return - the next command to run
   */
  public RemoteCommand handleCommandResult(String commandResult, FrameAddress incomingFrameAddress,
      String uniqueId, boolean justLoaded, List<?> jsWindowNameVars) {
    CommandQueue queue = getCommandQueue(uniqueId);
    queue.setFrameAddress(incomingFrameAddress);
    if (jsWindowNameVars != null) {
      for (Object jsWindowNameVar : jsWindowNameVars) {
        queue.addJsWindowNameVar((String) jsWindowNameVar);
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

  /**
   * <p>
   * Empty queues, and thereby wake up any threads that are hanging around.
   */
  public void endOfLife() {
    removeTemporaryFiles();
    for (CommandQueue frameQ : uniqueIdToCommandQueue.values()) {
      frameQ.endOfLife();
    }
  }

  private boolean justLoaded(String uniqueId) {
    boolean result = false;
    if (null != uniqueId) {
      result = frameAddressToJustLoaded.containsKey(uniqueId);
    }
    return result;
  }

  private void markWhetherJustLoaded(String frameAddress, boolean justLoaded) {
    boolean oldState = justLoaded(frameAddress);
    if (oldState != justLoaded) {
      dataLock.lock();
      try {
        if (justLoaded) {
          log.fine(frameAddress + " marked as just loaded");
          frameAddressToJustLoaded.put(frameAddress, true);
        } else {
          log.fine(frameAddress + " marked as NOT just loaded");
          frameAddressToJustLoaded.remove(frameAddress);
        }
        resultArrivedOnAnyQueue.signalAll();
      } finally {
        dataLock.unlock();
      }
    }
  }

  private void setCurrentFrameAddress(String uniqueId) {
    assert uniqueId != null;
    FrameAddress frameAddress = uniqueIdToCommandQueue.get(uniqueId).getFrameAddress();
    this.currentUniqueId = uniqueId;
    this.currentFrameAddress = frameAddress;
    this.currentSeleniumWindowName = frameAddress.getWindowName();
    this.currentLocalFrameAddress = frameAddress.getLocalFrameAddress();
    markWhetherJustLoaded(uniqueId, false);
    log.fine("Current uniqueId set to " + uniqueId + ", frameAddress = " + frameAddress);
  }

  public static FrameAddress makeFrameAddress(String seleniumWindowName, String localFrameAddress) {
    if (seleniumWindowName == null) {
      // we are talking to a version of selenium core which isn't telling us the
      // seleniumWindowName. Set it to the default, which will be right most of
      // the time.
      seleniumWindowName = DEFAULT_SELENIUM_WINDOW_NAME;
    }
    return FrameAddress.make(seleniumWindowName, localFrameAddress);
  }

  // /**
  // * TODO: someone should call this
  // */
  // public void garbageCollectOrphans() {
  // /**
  // * The list of orphaned queues was assembled in the browser session
  // * preceding the current one. At this point it is safe to get rid
  // * of them; their windows must have long since being destroyed.
  // */
  // for (CommandQueue q : orphanedQueues) {
  // q.endOfLife();
  // }
  // orphanedQueues.clear();
  // }

  public void reset(String baseUrl) {
    log.fine("resetting frame group");
    if (proxyInjectionMode) {
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
          log.fine("Trying to close " + frameAddress);
          try {
            q.doCommandWithoutWaitingForAResponse("close", "", "");
          } catch (WindowClosedException e) {
            log.fine("Window was already closed");
          }
        }
        orphanedQueues.add(q);
        newOrphans.add(frameAddress);
      }
      for (FrameAddress frameAddress : newOrphans) {
        uniqueIdToCommandQueue.remove(frameAddress);
      }
    }
    removeTemporaryFiles();
    selectWindow(DEFAULT_SELENIUM_WINDOW_NAME);
    // String defaultUrl = "http://localhost:"
    StringBuilder openUrl = new StringBuilder();
    if (proxyInjectionMode) {
      openUrl.append("http://localhost:");
      openUrl.append(portDriversShouldContact);
      openUrl.append("/selenium-server/core/InjectedRemoteRunner.html");
    } else {
      openUrl.append(Urls.toProtocolHostAndPort(baseUrl));
    }
    try {
      doCommand("open", openUrl.toString(), ""); // will close out subframes
    } catch (RemoteCommandException rce) {
      log.fine("RemoteCommandException in reset: " + rce.getMessage());
    }
  }

  protected void removeTemporaryFiles() {
    for (File file : tempFilesForSession) {
      boolean deleteSuccessful = file.delete();
      if (!deleteSuccessful) {
        log.warning("temp file for session " + sessionId + " not deleted " + file.getAbsolutePath());
      }
    }
    tempFilesForSession.clear();
  }

  protected void addTemporaryFile(File tf) {
    tempFilesForSession.add(tf);
  }

  private boolean queueMatchesFrameAddress(CommandQueue queue, String localFrameAddress,
      String newFrameAddressExpression) {
    boolean result;
    try {
      result =
          doBooleanCommand(queue, "getWhetherThisFrameMatchFrameExpression", localFrameAddress,
              newFrameAddressExpression);
    } catch (WindowClosedException e) {
      return false;
    }
    return result;
  }

  private boolean doBooleanCommand(CommandQueue queue, String command, String arg1, String arg2)
      throws WindowClosedException {
    String booleanResult = queue.doCommand(command, arg1, arg2);
    boolean result;
    if ("OK,true".equals(booleanResult)) {
      result = true;
    } else if ("OK,false".equals(booleanResult)) {
      result = false;
    } else {
      if (WindowClosedException.WINDOW_CLOSED_ERROR.equals(booleanResult)) {
        throw new WindowClosedException();
      }
      throw new RuntimeException("unexpected return " + booleanResult + " from boolean command "
          + command);
    }
    log.fine("doBooleancommand(" + command + "(" + arg1 + ", " + arg2 + ") -> " + result);
    return result;
  }

  public void setExtensionJs(String extensionJs) {
    this.extensionJs = extensionJs;
  }

  public String getExtensionJs() {
    return extensionJs;
  }
}
