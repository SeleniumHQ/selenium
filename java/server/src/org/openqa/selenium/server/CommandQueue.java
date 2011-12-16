/*
 * Copyright 2011 Software Freedom Conservancy.
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

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;
import java.util.logging.Logger;

/**
 * <p>
 * Schedules and coordinates commands to be run.
 * </p>
 * 
 * @author Paul Hammant
 * @author Jennifer Bevan
 * @version $Revision: 734 $
 */
public class CommandQueue {
  private static Logger log = Logger.getLogger(CommandQueue.class.getName());
  private static AtomicInteger millisecondDelayBetweenOperations =
      new AtomicInteger((System.getProperty("selenium.slowMode") == null)
          ? 0 : Integer.parseInt(System.getProperty("selenium.slowMode")));
  private static AtomicInteger idGenerator = new AtomicInteger(0);

  private final AtomicLong defaultTimeout;
  private static AtomicInteger retryTimeout = new AtomicInteger(10);

  private final BrowserResponseSequencer browserResponseSequencer;
  private final String sessionId;
  private final String uniqueId;
  private final boolean proxyInjectionMode;

  private CommandHolder commandHolder;
  private CommandResultHolder resultHolder;
  private AtomicBoolean resultExpected;
  private ConcurrentHashMap<String, Boolean> cachedJsVariableNamesPointingAtThisWindow;
  private FrameAddress frameAddress;
  private AtomicBoolean closed;
  private AtomicInteger queueDelay;

  public CommandQueue(String newSessionId, String newUniqueId,
      RemoteControlConfiguration configuration) {
    sessionId = newSessionId;
    uniqueId = newUniqueId;
    proxyInjectionMode = configuration.getProxyInjectionModeArg();
    browserResponseSequencer = new BrowserResponseSequencer(newUniqueId);
    resultExpected = new AtomicBoolean(false);
    closed = new AtomicBoolean(false);
    cachedJsVariableNamesPointingAtThisWindow = new ConcurrentHashMap<String, Boolean>();
    idGenerator.incrementAndGet();
    commandHolder = new CommandHolder(uniqueId, retryTimeout.get());
    defaultTimeout = new AtomicLong(configuration.getTimeoutInSeconds());
    retryTimeout.set(configuration.getRetryTimeoutInSeconds());

    resultHolder = new CommandResultHolder(uniqueId, defaultTimeout.get());
    queueDelay = new AtomicInteger(millisecondDelayBetweenOperations.get());
  }

  public CommandQueue(String newSessionId, String newUniqueId, int opDelay,
      RemoteControlConfiguration configuration) {
    this(newSessionId, newUniqueId, configuration);
    setQueueDelay(opDelay);
  }

  /**
   * Sends the specified command (to be retrieved by the next call to handle command result), and
   * returns the result of that command.
   * 
   * @param command - the remote command verb
   * @param field - the first remote argument (meaning depends on the verb)
   * @param value - the second remote argument
   * @return - the command result, defined by the remote JavaScript. "getX" style commands may
   *         return data from the browser; other "doX" style commands may just return "OK" or an
   *         error message.
   */
  public String doCommand(String command, String field, String value) {

    if (closed.get()) {
      return WindowClosedException.WINDOW_CLOSED_ERROR;
    }

    resultExpected.set(true);
    String result = null;
    try {
      doCommandWithoutWaitingForAResponse(command, field, value);
      result = getResult();
    } catch (WindowClosedException e) {
      result = WindowClosedException.WINDOW_CLOSED_ERROR;
    } finally {
      resultExpected.set(false);
    }
    return result;
  }

  private String makeJavaScript() {
    return InjectionHelper.restoreJsStateInitializer(sessionId, uniqueId);
    // DGF we also used to remind the window of his own selenium window name here
    // (e.g. across page loads, when he may have forgotten
    // but the JS knows the window name better than we do, I think, so I've cut that code
  }

  protected void doCommandWithoutWaitingForAResponse(String command, String field, String value)
      throws WindowClosedException {

    // make sure that we don't have a pending command
    RemoteCommand prevCommand = commandHolder.peek();
    if (null != prevCommand) {
      throw new IllegalStateException("unexpected command " + prevCommand
          + " in place before new command " + command + " could be added");
    }

    // wait a bit if we're adding delay between commands
    if (queueDelay.get() > 0) {
      log.fine("    Slow mode in effect: sleep " + queueDelay + " milliseconds...");
      FrameGroupCommandQueueSet.sleepForAtLeast(queueDelay.get());
      log.fine("    ...done");
    }

    // make sure we're ready for a new command for this frame
    String prevResult = resultHolder.peek();
    if (null != prevResult) {
      if (!proxyInjectionMode) {
        throw new IllegalStateException(
            "A result was unexpectedly found in the result holder");
      }
      if (!"OK".equals(prevResult)) {
        if (WindowClosedException.WINDOW_CLOSED_ERROR.equals(prevResult)) {
          throw new WindowClosedException();
        }
        throw new IllegalStateException("unexpected result " + prevResult);
      }
      if (command.startsWith("wait")) {
        log.fine("Page load beat the wait command.  Leave the result to be picked up below");
      } else {
        // In proxy injection mode, a single command could cause multiple pages to
        // reload. Each of these reloads causes a result. This means that the usual one-to-one
        // relationship between commands and results can go out of whack. To avoid this, we
        // discard results for which no thread is waiting:
        log.fine("Apparently a page load result preceded the command; will ignore it...");
        resultHolder.poisonPollers(); // overwrite result
      }
    }

    // for the record -- the result may already be in place.
    boolean added = commandHolder.putCommand(
        new DefaultRemoteCommand(command, field, value, makeJavaScript()));
    if (!added) {
      throw new IllegalStateException("commandHolder got filled during " +
          "execution of doCommandWithoutWaitingForAReponse");
    }
  }

  /**
   * Get, and remove from the command holder, the next command to run
   */
  protected String getResult() {
    return resultHolder.getResult();
  }

  @Override
  public String toString() {
    StringBuffer sb = new StringBuffer();
    if (closed.get()) {
      sb.append("CLOSED ");
    }
    sb.append("{ commandHolder=");
    sb.append("commandHolder/" + uniqueId + "-"
        + idGenerator.get() + " " + (commandHolder.isEmpty()
            ? "null" : commandHolder.peek()))
        .append(", ")
        .append(" resultHolder=")
        .append("resultHolder/" + uniqueId + "-"
            + idGenerator.get() + " " + (resultHolder.isEmpty()
                ? "null" : resultHolder.peek()))
        .append(" }");

    return sb.toString();
  }

  /**
   * <p>
   * Accepts a command reply, and retrieves the next command to run.
   * </p>
   * 
   * @param commandResult - the reply from the previous command, or null
   * @return - the next command to run
   */
  public RemoteCommand handleCommandResult(String commandResult) {

    // first, handle the new result
    handleCommandResultWithoutWaitingForACommand(commandResult);

    // increase the browser response sequencer
    browserResponseSequencer.increaseNum();

    // get the next command to execute
    return getNextCommand();
  }

  protected void handleCommandResultWithoutWaitingForACommand(String commandResult) {
    if (commandResult != null) {
      if (!resultExpected.get()) {
        if (proxyInjectionMode) {
          // This logic is to account for the case where in proxy injection mode, it is possible
          // that a page reloads without having been explicitly asked to do so (e.g., an event
          // in one frame causes reloads in others).
          if (commandResult.startsWith("OK")) {
            log.fine("Saw page load no one was waiting for.");
            boolean putUnexpectedResult = resultHolder.putResult(commandResult);
            if (!putUnexpectedResult) {
              throw new IllegalStateException(
                  "The resultHolder was not empty for this unexpected result");
            }
          }
        } else if (commandResult.startsWith("OK")) {
          // there are a couple reasons for this. If a command
          // timed out, its response could come in after we're done
          // expecting it. A previous reason was the idea that there
          // was some confusion as to which frame's command queue was
          // to be used. Rather than throwing an IllegalStateException
          // as was the previous action, just add a warning statement
          // and throw away the unexpected response.
          log.warning(getIdentification("resultHolder", uniqueId)
              + " unexpected response: " + commandResult);
        }
      } else {
        boolean putExpectedResult = resultHolder.putResult(commandResult);
        if (!putExpectedResult) {
          throw new IllegalStateException(
              "The resultHolder was not empty and waiting for this expected result");
        }
      }
    }
  }

  /**
   * Get, and remove from the command holder, the next command to run
   */
  protected RemoteCommand getNextCommand() {
    return commandHolder.getCommand();
  }

  protected static String getIdentification(String caller, String queueId) {
    StringBuffer sb = new StringBuffer();
    if (queueId != null) {
      sb.append(queueId)
          .append(' ');
    }
    sb.append(caller)
        .append(' ')
        .append(queueId);
    String s = sb.toString();
    if (s.endsWith("null")) {
      log.fine("caller identification came in ending with null");
    }
    return s;
  }

  /**
   * clear the contents of the threads, and unblocks polling threads
   */
  public void endOfLife() {
    resultHolder.poisonPollers();
    commandHolder.poisonPollers();
  }

  public FrameAddress getFrameAddress() {
    return frameAddress;
  }

  public void setFrameAddress(FrameAddress frameAddress) {
    this.frameAddress = frameAddress;
  }

  /**
   * Get whether this command queue expects a result instead of just "OK".
   * 
   * @return Returns whether this command will expect a command result.
   */
  public boolean isResultExpected() {
    return resultExpected.get();
  }

  public void setQueueDelay(int i) {
    queueDelay.set(i);
  }

  public int getQueueDelay() {
    return queueDelay.get();
  }

  public static void setSpeed(int i) {
    millisecondDelayBetweenOperations.set(i);
  }

  public static int getSpeed() {
    return millisecondDelayBetweenOperations.get();
  }

  public boolean isWindowPointedToByJsVariable(String jsVariableName) {
    Boolean isPointingAtThisWindow = cachedJsVariableNamesPointingAtThisWindow.get(jsVariableName);
    if (isPointingAtThisWindow == null) {
      isPointingAtThisWindow = false; // disable this -- causes timing problems since it's on same
                                      // channel as initial load msg:
                                      // doBooleanCommand("getWhetherThisWindowMatchWindowExpression",
                                      // "", jsVariableName);
      cachedJsVariableNamesPointingAtThisWindow.put(jsVariableName, isPointingAtThisWindow);
    }
    return isPointingAtThisWindow;
  }

  public void addJsWindowNameVar(String jsWindowNameVar) {
    cachedJsVariableNamesPointingAtThisWindow.put(jsWindowNameVar, true);
  }

  public void declareClosed() {
    closed.set(true);
    // make sure any listeners on the result holder will finish
    if (resultHolder.isEmpty()) {
      handleCommandResultWithoutWaitingForACommand(WindowClosedException.WINDOW_CLOSED_ERROR);
    }
    endOfLife();
    browserResponseSequencer.increaseNum();
  }

  public boolean isClosed() {
    return closed.get();
  }

  public BrowserResponseSequencer getBrowserResponseSequencer() {
    return browserResponseSequencer;
  }

  protected void setResultExpected(boolean resultExpected) {
    this.resultExpected.set(resultExpected);
  }

  protected String peekAtResult() {
    return resultHolder.peek();
  }

  protected RemoteCommand peekAtCommand() {
    return commandHolder.peek();
  }

  protected boolean putResult(String result) {
    return resultHolder.putResult(result);
  }

  protected boolean putCommand(RemoteCommand cmd) {
    return commandHolder.putCommand(cmd);
  }

}
