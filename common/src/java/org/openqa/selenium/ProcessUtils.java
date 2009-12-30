package org.openqa.selenium;

import java.io.IOException;
import java.lang.reflect.Field;

public class ProcessUtils {
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
    int exitValue;

    // first, wait a second to see if the process will die on it's own (we will likely have asked
    // the process to kill itself just before calling this method
    try {
      exitValue = waitForProcessDeath(process, 1000);
      if (exitValue == 0) {
        return exitValue;
      }
    } catch (Exception e) {
      // no? ok, no biggie, now let's force kill it...
    }

    process.destroy();
    try {
      exitValue = waitForProcessDeath(process, 10000);
    } catch (ProcessStillAliveException ex) {
      if (Platform.getCurrent().is(Platform.WINDOWS)) {
        throw ex;
      }
      try {
        System.out.println("Process didn't die after 10 seconds");
        kill9(process);
        exitValue = waitForProcessDeath(process, 10000);
      } catch (Exception e) {
        System.out.println("Process refused to die after 10 seconds, and couldn't kill9 it");
        e.printStackTrace();
        throw new RuntimeException(
            "Process refused to die after 10 seconds, and couldn't kill9 it: " + e.getMessage(),
            ex);
      }
    }
    return exitValue;
  }

  /**
   * retrieves the pid
   */
  public static int getProcessId(Process p) {
    if (Platform.getCurrent().is(Platform.WINDOWS)) {
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

  /**
   * runs "kill -9" on the specified pid
   */
  public static void kill9(Integer pid) throws IOException, InterruptedException {
    ProcessBuilder pb = new ProcessBuilder("kill", "-9", pid.toString());
    pb.redirectErrorStream();
    Process p = pb.start();
    int code = p.waitFor();

    if (code != 0) {
      String output = IOUtils.readFully(p.getInputStream());
      throw new RuntimeException("kill return code " + code + ": " + output);
    }
  }

  /**
   * runs "kill -9" on the specified process
   */
  public static void kill9(Process p) throws IOException, InterruptedException {
    kill9(getProcessId(p));
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
