package org.openqa.selenium.os;

import org.openqa.selenium.Platform;

import com.google.common.io.Closeables;

public class ProcessUtils {
  /**
   * Waits the specified timeout for the process to die
   * 
   * @param p The process to kill.
   * @param timeout How long to wait in milliseconds.
   * @return The exit code of the given process.
   */
  public static int waitForProcessDeath(Process p, long timeout) {
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
        System.out.println("Process didn't die after 10 seconds");
        UnixUtils.kill9(process);
        exitValue = waitForProcessDeath(process, 10000);
        closeAllStreamsAndDestroyProcess( process);
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

  public static void closeAllStreamsAndDestroyProcess(Process process) {
    Closeables.closeQuietly(process.getInputStream());
    Closeables.closeQuietly(process.getErrorStream());
    Closeables.closeQuietly(process.getOutputStream());
    process.destroy();
  }

}
