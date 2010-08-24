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

import java.io.File;
import java.io.IOException;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.Map;

import com.google.common.collect.Maps;
import org.apache.commons.logging.Log;
import org.openqa.jetty.log.LogFactory;
import org.openqa.selenium.Platform;
import org.openqa.selenium.browserlaunchers.WindowsUtils;
import org.openqa.selenium.internal.CommandLine;

import static org.openqa.selenium.Platform.WINDOWS;

/**
 * Spawn a process and return the process handle so you can close it yourself
 * later.
 *
 * @author dfabulich
 */
public class AsyncExecute {

  static Log log = LogFactory.getLog(AsyncExecute.class);


  private final Map<String, String> environmentBuilder = Maps.newHashMap();
  // This class was derived from Ant. Emulate the old behavior for now
  private Map<String, String> antEnv;
  private Process process;

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
   * Waits the specified timeout for the process to die
   */
  public static int waitForProcessDeath(Process p, long timeout) {
//    ProcessWaiter pw = new ProcessWaiter(p);
//    Thread waiter = new Thread(pw);
//    waiter.start();
//    try {
//      waiter.join(timeout);
//    } catch (InterruptedException e) {
//      throw new RuntimeException("Bug? Main interrupted while waiting for process", e);
//    }
//    if (waiter.isAlive()) {
//      waiter.interrupt();
//    }
//    try {
//      waiter.join();
//    } catch (InterruptedException e) {
//      throw new RuntimeException("Bug? Main interrupted while waiting for dead process waiter", e);
//    }
//    InterruptedException ie = pw.getException();
//    if (ie != null) {
//      throw new ProcessStillAliveException("Timeout waiting for process to die", ie);
//    }
//    return p.exitValue();
    return 0;
  }

  /**
   * Forcibly kills a process, using OS tools like "kill" as a last resort
   */
  public static int killProcess(Process process) {
    process.destroy();
    int exitValue;
    try {
      exitValue = AsyncExecute.waitForProcessDeath(process, 10000);
    } catch (ProcessStillAliveException ex) {
      if (WindowsUtils.thisIsWindows()) {
        throw ex;
      }
      try {
        log.info("Process didn't die after 10 seconds");
        UnixUtils.kill9(process);
        exitValue = AsyncExecute.waitForProcessDeath(process, 10000);
      } catch (Exception e) {
        log.error("Process refused to die after 10 seconds, and couldn't kill9 it", e);
        throw new RuntimeException(
            "Process refused to die after 10 seconds, and couldn't kill9 it: " + e.getMessage(),
            ex);
      }
    }
    return exitValue;
  }

  /**
   * Thrown when a process remains alive after attempting to destroy it
   */
  public static class ProcessStillAliveException extends RuntimeException {

    public ProcessStillAliveException() {
      super();
    }

    public ProcessStillAliveException(String message, Throwable cause) {
      super(message, cause);
    }

    public ProcessStillAliveException(String message) {
      super(message);
    }

    public ProcessStillAliveException(Throwable cause) {
      super(cause);
    }

  }
}