/*
Copyright 2012 Selenium committers
Copyright 2012 Software Freedom Conservancy

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/


package org.openqa.selenium.os;

import com.google.common.io.Closeables;

import org.openqa.selenium.Platform;

import java.lang.reflect.Field;
import java.util.logging.Logger;

import static org.openqa.selenium.Platform.WINDOWS;

public class ProcessUtils {
  static Logger log = Logger.getLogger(ProcessUtils.class.getName());

  /**
   * Waits the specified timeout for the process to die
   * 
   * @param p The process to kill.
   * @param timeout How long to wait in milliseconds.
   * @return The exit code of the given process.
   */
  private static int waitForProcessDeath(Process p, long timeout) {
    ProcessWaiter pw = new ProcessWaiter(p);
    Thread waiter = new Thread(pw);  // Thread safety reviewed
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
   * 
   * @param process The process to kill.
   * @return The exit value of the process.
   */
  public static int killProcess(Process process) {
    int exitValue;

    // first, wait a second to see if the process will die on it's own (we will likely have asked
    // the process to kill itself just before calling this method
    try {
      exitValue = waitForProcessDeath(process, 1000);
      closeAllStreamsAndDestroyProcess( process);
      if (exitValue == 0) {
        return exitValue;
      }
    } catch (Exception e) {
      // no? ok, no biggie, now let's force kill it...
    }

    process.destroy();
    try {
      exitValue = waitForProcessDeath(process, 10000);
      closeAllStreamsAndDestroyProcess( process);
    } catch (ProcessStillAliveException ex) {
      if (Platform.getCurrent().is(Platform.WINDOWS)) {
        throw ex;
      }
      try {
        log.info("Process didn't die after 10 seconds");
        kill9(process);
        exitValue = waitForProcessDeath(process, 10000);
        closeAllStreamsAndDestroyProcess( process);
      } catch (Exception e) {
        log.warning("Process refused to die after 10 seconds, and couldn't kill9 it");
        e.printStackTrace();
        throw new RuntimeException(
            "Process refused to die after 10 seconds, and couldn't kill9 it: " + e.getMessage(),
            ex);
      }
    }
    return exitValue;
  }

  private static class ProcessWaiter implements Runnable {

    private volatile InterruptedException t;
    private final Process p;

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

  public static class ProcessStillAliveException extends RuntimeException {
    public ProcessStillAliveException(String message, Throwable cause) {
      super(message, cause);
    }
  }

  private static void closeAllStreamsAndDestroyProcess(Process process) {
    Closeables.closeQuietly(process.getInputStream());
    Closeables.closeQuietly(process.getErrorStream());
    Closeables.closeQuietly(process.getOutputStream());
    process.destroy();
  }

  private static int getProcessId(Process p) {
    if (Platform.getCurrent().is(WINDOWS)) {
      throw new IllegalStateException("UnixUtils may not be used on Windows");
    }
    try {
      Field f = p.getClass().getDeclaredField("pid");
      f.setAccessible(true);
      Integer pid = (Integer) f.get(p);
      return pid;
    } catch (Exception e) {
      throw new RuntimeException("Couldn't detect pid", e);
    }
  }

  /** runs "kill -9" on the specified pid */
  private static void kill9(Integer pid) {
    log.fine("kill -9 " + pid);

    CommandLine command = new CommandLine("kill", "-9", pid.toString());
    command.execute();
    String result = command.getStdOut();
    int output = command.getExitCode();
    log.fine(String.valueOf(output));
    if (!command.isSuccessful()) {
      throw new RuntimeException("exec return code " + result + ": " + output);
    }
  }

  /** runs "kill -9" on the specified process */
  private static void kill9(Process p) {
    kill9(getProcessId(p));
  }

}
