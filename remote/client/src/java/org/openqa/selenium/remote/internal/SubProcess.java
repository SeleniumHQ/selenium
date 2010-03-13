package org.openqa.selenium.remote.internal;

import org.openqa.selenium.ProcessUtils;
import org.openqa.selenium.WebDriverException;

import java.io.IOException;
import java.io.OutputStream;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

/**
 * Basic class for working with subprocesses. Methods are provided for
 * starting and stopping a subprocess. Also provides a mechanism for
 * detecting if a subprocess dies before it is explicitly stopped.
 *
 * @author jmleyba@gmail.com (Jason Leyba)
 */
public class SubProcess {

  private final Object lock = new Object();
  private final ProcessBuilder processBuilder;
  private final OutputStream outputStream;

  private ExecutorService executorService;
  private Process currentProcess;
  private Future<?> outputWatcher;

  /**
   * Creates a new {@link SubProcess} that will ignore all output from any
   * spawned process.
   *
   * @param processBuilder Used to launch new processes.
   * @see SubProcess(ProcessBuilder, OutputStream)
   */
  public SubProcess(ProcessBuilder processBuilder) {
    this(processBuilder, nullOutputStream());
  }

  /**
   * Creates a new {@link SubProcess} that will redirect all output to the
   * specified stream. The output written to stderr is always merged with the
   * output to stdout.
   *
   * @param processBuilder Used to launch new processes.
   * @param outputStream The stream to redirect all process output to.
   */
  public SubProcess(ProcessBuilder processBuilder,
                    OutputStream outputStream) {
    this.processBuilder = processBuilder.redirectErrorStream(true);
    this.outputStream = outputStream;
    this.executorService = null;
    this.currentProcess = null;
  }

  /**
   * Starts a new {@link Process} using this instance's {@link ProcessBuilder}.
   * If a {@code Process} is already running, this method will be a no-op.
   *
   * @throws WebDriverException If an I/O error occurs while starting the new
   *     process.
   */
  public void launch() {
    synchronized (lock) {
      if (!isRunning()) {
        try {
          currentProcess = processBuilder.start();
          executorService = Executors.newSingleThreadExecutor();
          outputWatcher = executorService.submit(
              new OutputWatcher(currentProcess.getInputStream(), outputStream));
        } catch (IOException e) {
          throw new WebDriverException(e);
        }
      }
    }
  }

  /**
   * 
   * @return The exit value for the managed subprocess.
   * @throws IllegalThreadStateException If the managed subprocess was never
   *     started, or if it was started but has not terminated yet.
   */
  public int exitValue() {
    synchronized (lock) {
      if (currentProcess == null) {
        throw new IllegalThreadStateException("Process has not yet launched");
      }
      return currentProcess.exitValue();
    }
  }

  /**
   * @return Whether the managed subprocess is currently running.
   */
  public boolean isRunning() {
    synchronized (lock) {
      if (currentProcess == null) {
        return false;
      }
      try {
        exitValue();
        return false;
      } catch (IllegalThreadStateException ignored) {
        return true;
      }
    }
  }

  /**
   * Shutsdown the {@link Process} currently being managed by this instance,
   * if any.
   *
   * @see Process#destroy()
   */
  public void shutdown() {
    synchronized (lock) {
      if (isRunning()) {
        outputWatcher.cancel(true);
        executorService.shutdownNow();
        ProcessUtils.killProcess(currentProcess);
      }
    }
  }

  private static OutputStream nullOutputStream() {
    return new OutputStream() {
      @Override
      public void write(int i) throws IOException {
        // Do nothing
      }
    };
  }
}
