package org.openqa.selenium.remote.internal;

import org.openqa.selenium.WebDriverException;

import java.io.IOException;
import java.io.OutputStream;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.FutureTask;

/**
 * Basic class for working with subprocesses. Methods are provided for
 * starting and stopping a subprocess. Also provides a mechanism for
 * detecting if a subprocess dies before it is explicitly stopped.
 *
 * @author jmleyba@gmail.com (Jason Leyba)
 */
public class SubProcess {

  /**
   * Each {@link SubProcess} requires three threads: one to monitor the process
   * to detect if it unexpectedly dies, one for reading from the process input
   * stream, and one for reading from the process error stream.
   */
  private static final int THREADS_PER_SUBPROCESS = 3;

  private final ProcessBuilder processBuilder;
  private final OutputStream outputStream;

  private ExecutorService executorService;
  private Process currentProcess;
  private FutureTask<Integer> babySitter;
  private Future<?> outputWatcher;

  /**
   * Creates a new {@link SubProcess} that will ignore all output from any
   * spawned process.
   *
   * @param processBuilder Used to launch new processes.
   * @see SubProcess(ProcessBuilder, OutputStream)
   */
  public SubProcess(ProcessBuilder processBuilder) {
    this(processBuilder, System.out);
  }

  /**
   * Creates a new {@link SubProcess} that will redirect all output to the
   * specified stream. The output written to stderr is always merged with the
   * output to stdout.
   *
   * @param processBuilder Used to launch new processes.
   * @param outputStream The stream to redirect all process output to. If
   *     {@code null}, all output will be ignored.
   */
  public SubProcess(ProcessBuilder processBuilder,
                    OutputStream outputStream) {
    this.processBuilder = processBuilder.redirectErrorStream(true);
    this.outputStream = outputStream;
    this.executorService = null;
    this.currentProcess = null;
    this.babySitter = null;
  }

  /**
   * Starts a new {@link Process} using this instance's {@link ProcessBuilder}.
   * If a {@code Process} is already running, this method will be a no-op.
   *
   * @throws WebDriverException If an I/O error occurs while starting the new
   *     process.
   */
  public void launch() {
    if (currentProcess == null) {
      try {
        currentProcess = processBuilder.start();
        babySitter = new FutureTask<Integer>(new Callable<Integer>() {
          public Integer call() throws Exception {
            return currentProcess.waitFor();
          }
        });
        executorService = Executors.newFixedThreadPool(THREADS_PER_SUBPROCESS);
        executorService.submit(babySitter);
        if (outputStream != null) {
          outputWatcher = executorService.submit(
              new OutputWatcher(currentProcess.getInputStream(), outputStream));
        }
      } catch (IOException e) {
        throw new WebDriverException(e);
      }
    }
  }

  /**
   * Returns the current state of this instance.
   *
   * @return The current state of this instance.
   */
  public State getState() {
    if (babySitter == null) {
      return State.NOT_RUNNING;
    }
    return babySitter.isDone() ? State.FINISHED : State.RUNNING;
  }

  /**
   * Shutsdown the {@link Process} currently being managed by this instance,
   * if any.
   *
   * @see Process#destroy()
   */
  public void shutdown() {
    babySitter = cancelFuture(babySitter);
    outputWatcher = cancelFuture(outputWatcher);

    if (executorService != null) {
      executorService.shutdownNow();
      executorService = null;
    }

    if (currentProcess != null) {
      currentProcess.destroy();
      currentProcess = null;
    }
  }

  private <T extends Future> T cancelFuture(T future) {
    if (future != null) {
      future.cancel(true);
    }
    return null;
  }

  /**
   * Enumeration of the possible {@code SubProcess} states that can be returned
   * by {@link SubProcess#getState()}
   *
   * @see SubProcess#getState()
   */
  public static enum State {
    /**
     * The {@code SubProcess} is not currently running.
     */
    NOT_RUNNING,

    /**
     * The {@code SubProcess} has launched a {@link Process} and it is still
     * running.
     *
     * @see SubProcess#launch()
     */
    RUNNING,

    /**
     * The {@code SubProcess} has launched a {@link Process} and it finished
     * without being explicitly {@link SubProcess#shutdown() shutdown}
     *
     * @see SubProcess#shutdown()
     */
    FINISHED
  }
}
