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

package org.openqa.selenium.server.browserlaunchers;

import org.apache.commons.logging.Log;
import org.openqa.jetty.log.LogFactory;
import org.openqa.selenium.os.ProcessUtils;
import org.openqa.selenium.browserlaunchers.WindowsUtils;

/**
 * Spawn a process and return the process handle so you can close it yourself
 * later.
 *
 * @author dfabulich
 */
public class AsyncExecute {

  static Log log = LogFactory.getLog(AsyncExecute.class);

  /**
   * Sleeps without explicitly throwing an InterruptedException
   *
   * @param timeoutInSeconds Sleep time in seconds.
   * @throws RuntimeException wrapping an InterruptedException if one gets thrown
   */
  public static void sleepTightInSeconds(long timeoutInSeconds) {
    sleepTight(timeoutInSeconds * 1000);
  }

  /**
   * Sleeps without explicitly throwing an InterruptedException
   *
   * @param timeout the amout of time to sleep
   * @throws RuntimeException wrapping an InterruptedException if one gets thrown
   */
  public static void sleepTight(long timeout) {
    try {
      Thread.sleep(timeout);
    } catch (InterruptedException e) {
      throw new RuntimeException(e);
    }
  }


  /**
   * Forcibly kills a process, using OS tools like "kill" as a last resort
   *
   * @param process The process to kill.
   * @return The exit value of the process.
   */
  public static int killProcess(Process process) {
    process.destroy();
    int exitValue;
    try {
      exitValue = ProcessUtils.waitForProcessDeath(process, 10000);
    } catch (ProcessUtils.ProcessStillAliveException ex) {
      if (WindowsUtils.thisIsWindows()) {
        throw ex;
      }
      try {
        log.info("Process didn't die after 10 seconds");
        UnixUtils.kill9(process);
        exitValue = ProcessUtils.waitForProcessDeath(process, 10000);
      } catch (Exception e) {
        log.error("Process refused to die after 10 seconds, and couldn't kill9 it", e);
        throw new RuntimeException(
            "Process refused to die after 10 seconds, and couldn't kill9 it: " + e.getMessage(),
            ex);
      }
    }
    return exitValue;
  }
}