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

import java.util.logging.Logger;

/**
 * <p>
 * Holds the command to be next run in the browser
 * </p>
 * 
 * @author Jennifer Bevan
 * @version $Revision: 734 $
 */
public class CommandHolder {

  private static final Logger log = Logger.getLogger(CommandHolder.class.getName());
  private static final int defaultTimeout = 10; // seconds
  private static final RemoteCommand poisonCommand = new DefaultRemoteCommand(
      "CommandHolder.POISON", "", "");
  protected static final String RETRY_CMD_STRING = "retryLast";
  protected static final RemoteCommand retryCommand = new DefaultRemoteCommand(RETRY_CMD_STRING,
      "", "", "");

  private final String queueId;
  private final SingleEntryAsyncQueue<RemoteCommand> queue;


  public CommandHolder(String queueId) {
    this(queueId, defaultTimeout);
  }

  public CommandHolder(String queueId, int timeoutInSeconds) {
    this.queueId = queueId;
    queue = new SingleEntryAsyncQueue<RemoteCommand>(timeoutInSeconds);
    queue.setPoison(poisonCommand);
  }

  /**
   * Get, and remove from the holder, the next command to run. If the next command doesn't show up
   * within timeoutInSeconds seconds, then return a "retry" command.
   * 
   * @return the next command to execute.
   */
  public RemoteCommand getCommand() {
    RemoteCommand command;

    log.fine(hdr() + "called");
    command = queue.pollToGetContentUntilTimeout();
    if (null == command) {
      // if there is no new command, send a retryLast.
      // Purpose: to get around the 2-connections per host issue
      // by sending a request in response to the frame's looking for
      // work -- this allows frame to close the connection.
      command = retryCommand;
    } else if (queue.isPoison(command)) {
      // if the queue was poisoned, just exit with a null command.
      command = null;
    }
    log.fine(hdr() + "-> " + ((null == command) ? "null" : command.toString()));

    return command;
  }

  public boolean putCommand(RemoteCommand cmd) {
    log.fine(hdr());
    return queue.putContent(cmd);
  }

  public boolean isEmpty() {
    return queue.isEmpty();
  }

  public RemoteCommand peek() {
    return queue.peek();
  }

  public void poisonPollers() {
    log.fine(hdr() + " poisoning pollers");
    queue.poisonPollers();
  }

  private String hdr() {
    return "\t" + CommandQueue.getIdentification("commandHolder", queueId) + " getCommand() ";
  }

}
