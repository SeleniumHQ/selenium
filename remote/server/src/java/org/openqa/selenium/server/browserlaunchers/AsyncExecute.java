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
import java.util.HashMap;
import java.util.Map;

import org.apache.commons.logging.Log;
import org.apache.tools.ant.*;
import org.apache.tools.ant.taskdefs.*;
import org.apache.tools.ant.taskdefs.condition.*;
import org.apache.tools.ant.types.*;
import org.openqa.jetty.log.LogFactory;
import org.openqa.selenium.browserlaunchers.WindowsUtils;
import org.openqa.selenium.server.log.AntJettyLoggerBuildListener;

/**
 * A handy wrapper around Ant's Execute class that can spawn a process
 * and return the process handle so you can close it yourself later
 *
 * @author dfabulich
 */
public class AsyncExecute extends Execute {

  static Log log = LogFactory.getLog(AsyncExecute.class);
  File workingDirectory;
  Project project;
  boolean useVMLauncher = true;
  private final Map<String, String> environmentBuilder;

  public AsyncExecute() {
    project = new Project();
    project.addBuildListener(new AntJettyLoggerBuildListener(log));
    environmentBuilder = new HashMap<String, String>(2);
  }

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
   * Copied from spawn, but actually returns the Process, instead of void
   *
   * @return the spawned process handle
   */
  public Process asyncSpawn() throws IOException {
    if (!environmentBuilder.isEmpty()) {
      setActualExecuteEnvironment();
    }
    if (workingDirectory != null && !workingDirectory.exists()) {
      throw new BuildException(workingDirectory + " doesn't exist.");
    }
    final Process process = launch(project, getCommandline(),
        getEnvironment(), workingDirectory,
        useVMLauncher);
    if (Os.isFamily("windows")) {
      AsyncExecute.sleepTight(1000);
    }

    OutputStream dummyOut = new OutputStream() {
      public void write(int b) throws IOException {
      }
    };

    ExecuteStreamHandler streamHandler = new PumpStreamHandler(dummyOut);
    streamHandler.setProcessErrorStream(process.getErrorStream());
    streamHandler.setProcessOutputStream(process.getInputStream());
    streamHandler.start();

    project.log("spawned process " + process.toString(), Project.MSG_VERBOSE);
    return process;
  }

  @Override
  public int execute() throws IOException {
    if (!environmentBuilder.isEmpty()) {
      setActualExecuteEnvironment();
    }
    return super.execute();
  }

  /**
   * Is this process still running ?
   */
  public static boolean isAlive(Process p) {
    try {
      p.exitValue();
    } catch (IllegalThreadStateException e) {
      return true;
    }
    return false;
  }

  /**
   * Waits the specified timeout for the process to die
   */
  public static int waitForProcessDeath(Process p, long timeout) {
    ProcessWaiter pw = new ProcessWaiter(p);
    Thread waiter = new Thread(pw);
    waiter.start();
    try {
      waiter.join(timeout);
    } catch (InterruptedException e) {
      throw new RuntimeException("Bug? Main interrupted while waiting for process", e);
    }
    if (waiter.isAlive()) {
      waiter.interrupt();
    }
    try {
      waiter.join();
    } catch (InterruptedException e) {
      throw new RuntimeException("Bug? Main interrupted while waiting for dead process waiter", e);
    }
    InterruptedException ie = pw.getException();
    if (ie != null) {
      throw new ProcessStillAliveException("Timeout waiting for process to die", ie);
    }
    return p.exitValue();

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

  private static class ProcessWaiter implements Runnable {

    private InterruptedException t;
    private Process p;

    public InterruptedException getException() {
      return t;
    }

    public ProcessWaiter(Process p) {
      this.p = p;
    }

    public void run() {
      try {
        p.waitFor();
      } catch (InterruptedException e) {
        this.t = e;
      }
    }
  }

  /**
   * Searches the path for the specified executable
   *
   * @param exec the executable name to search for
   * @return the executable, or null if the executable could not be found
   */
  public static File whichExec(String exec) {
    Path p = null;
    String pathStr = WindowsUtils.getPath();
    if (pathStr != null) {
      p = new Path(new Project(), pathStr);
    }
    if (p != null) {
      String[] dirs = p.list();
      for (String dir : dirs) {
        File executableFile = new File(dir, exec);
        if (executableFile.exists()) {
          return executableFile;
        }
      }
    }
    return null;
  }

  public void setLibraryPath(String newLibraryPath) {
    if (WindowsUtils.thisIsWindows()) {
      return;
    }

    environmentBuilder.put(SystemUtils.libraryPathEnvironmentVariable(), newLibraryPath);
  }

  public void setEnvironmentVariable(String name, String value) {
    environmentBuilder.put(name, value);
  }

  protected void setActualExecuteEnvironment() {
    final ArrayList<String> env;

    if (environmentBuilder.isEmpty()) {
      return;
    }
    env = new ArrayList<String>(environmentBuilder.size());
    for (Map.Entry<String, String> variable : environmentBuilder.entrySet()) {
      env.add(variable.getKey() + "=" + variable.getValue());
    }
    setEnvironment(env.toArray(new String[env.size()]));
  }

}