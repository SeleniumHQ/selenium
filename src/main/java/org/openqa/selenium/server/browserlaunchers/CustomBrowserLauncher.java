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

package org.openqa.selenium.server.browserlaunchers;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.os.CommandLine;
import org.openqa.selenium.server.RemoteControlConfiguration;


/**
 * Runs the specified command path to start the browser, and kills the process to quit.
 * 
 * @author Paul Hammant
 * @version $Revision: 189 $
 */
public class CustomBrowserLauncher extends AbstractBrowserLauncher {

  protected CommandLine process;
  protected String commandPath;

  /** Specifies a command path to run */
  public CustomBrowserLauncher(String commandPath, String sessionId,
      RemoteControlConfiguration configuration, Capabilities browserOptions) {
    super(sessionId, configuration, browserOptions);
    this.commandPath = commandPath;
    this.sessionId = sessionId;
  }

  /** Kills the process */
  public void close() {
    if (process == null) return;
    process.destroy();
  }

  @Override
  protected void launch(String url) {
    exec(commandPath + " " + url);
  }

  protected void exec(String command) {
    try {
      process = new CommandLine(command);
      process.executeAsync();
    } catch (RuntimeException e) {
      throw new RuntimeException("Error starting browser by executing command " + command + ": " +
          e);
    }
  }

}
