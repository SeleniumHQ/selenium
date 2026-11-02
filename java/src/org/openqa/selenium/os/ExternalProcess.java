// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

package org.openqa.selenium.os;

import static java.util.concurrent.TimeUnit.MILLISECONDS;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.UncheckedIOException;
import java.nio.charset.Charset;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicLong;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.jspecify.annotations.Nullable;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.io.CircularOutputStream;
import org.openqa.selenium.io.MultiOutputStream;

public class ExternalProcess {
  private static final Logger LOG = Logger.getLogger(ExternalProcess.class.getName());

  /**
   * How long the forwarded output may stay silent after the process exited before {@link
   * #waitFor(Duration)} and {@link #shutdown(Duration)} stop waiting for the end of the stream.
   */
  private static final long OUTPUT_QUIET_PERIOD_MS = 500;

  public static class Builder {

    private final ProcessBuilder builder;
    private @Nullable OutputStream copyOutputTo;
    private int bufferSize = 32768;

    Builder() {
      this.builder = new ProcessBuilder();
    }

    /**
     * Set the executable command to start the process, this consists of the executable and the
     * arguments.
     *
     * @param executable the executable to build the command
     * @param arguments the arguments to build the command
     * @return this instance to continue building
     */
    public Builder command(String executable, List<String> arguments) {
      List<String> command = new ArrayList<>(arguments.size() + 1);
      command.add(executable);
      command.addAll(arguments);
      builder.command(command);

      return this;
    }

    /**
     * Set the executable command to start the process, this consists of the executable and the
     * arguments.
     *
     * @param command the executable, followed by the arguments
     * @return this instance to continue building
     */
    public Builder command(List<String> command) {
      builder.command(command);

      return this;
    }

    /**
     * Set the executable command to start the process, this consists of the executable and the
     * arguments.
     *
     * @param command the executable, followed by the arguments
     * @return this instance to continue building
     */
    public Builder command(String... command) {
      builder.command(command);

      return this;
    }

    /**
     * Get the executable command to start the process, this consists of the binary and the
     * arguments.
     *
     * @return an editable list, changes to it will update the command executed.
     */
    public List<String> command() {
      return Collections.unmodifiableList(builder.command());
    }

    /**
     * Set one environment variable of the process to start, will replace the old value if exists.
     *
     * @return this instance to continue building
     */
    public Builder environment(String name, String value) {
      Require.argument("name", name).nonNull();
      Require.argument("value", value).nonNull();

      builder.environment().put(name, value);

      return this;
    }

    /**
     * Get the environment variables of the process to start.
     *
     * @return an editable map, changes to it will update the environment variables of the command
     *     executed.
     */
    public Map<String, String> environment() {
      return builder.environment();
    }

    /**
     * Get the working directory of the process to start, maybe null.
     *
     * @return the working directory
     */
    public File directory() {
      return builder.directory();
    }

    /**
     * Set the working directory of the process to start.
     *
     * @param directory the path to the directory
     * @return this instance to continue building
     */
    public Builder directory(String directory) {
      return directory(new File(directory));
    }

    /**
     * Set the working directory of the process to start.
     *
     * @param directory the path to the directory
     * @return this instance to continue building
     */
    public Builder directory(File directory) {
      builder.directory(directory);

      return this;
    }

    /**
     * Where to copy the combined stdout and stderr output to, {@code ExternalProcess#getOutput} is
     * still working when called.
     *
     * @param stream where to copy the combined output to
     * @return this instance to continue building
     */
    public Builder copyOutputTo(OutputStream stream) {
      copyOutputTo = stream;

      return this;
    }

    /**
     * The number of bytes to buffer for {@code ExternalProcess#getOutput} calls.
     *
     * @param toKeep the number of bytes, default is 32768
     * @return this instance to continue building
     */
    public Builder bufferSize(int toKeep) {
      bufferSize = toKeep;

      return this;
    }

    public ExternalProcess start() throws UncheckedIOException {
      // redirect the stderr to stdout
      builder.redirectErrorStream(true);

      Process process;
      try {
        process = builder.start();
      } catch (IOException ex) {
        throw new UncheckedIOException(ex);
      }

      try {
        OutputStream buffer;

        if (bufferSize != -1) {
          buffer = new CircularOutputStream(bufferSize);
        } else {
          buffer = new ByteArrayOutputStream();
        }

        ForwardingProgress forwarded = new ForwardingProgress();
        Thread worker =
            new Thread(
                () -> {
                  // copyOutputTo might be system.out or system.err, do not to close
                  OutputStream output =
                      new CountingOutputStream(
                          new MultiOutputStream(buffer, copyOutputTo), forwarded);
                  // closing the InputStream does somehow disturb the process, do not to close
                  InputStream input = process.getInputStream();
                  // use the CircularOutputStream as mandatory, we know it will never raise a
                  // IOException
                  try {
                    // we must read the output to ensure the process will not lock up
                    input.transferTo(output);
                  } catch (IOException ex) {
                    LOG.log(
                        Level.WARNING, "failed to copy the output of process " + process.pid(), ex);
                    // e.g. copyOutputTo was closed, while a child of the process still writes to
                    // the pipe; keep reading, so the child does not block on a full pipe
                    try {
                      input.transferTo(OutputStream.nullOutputStream());
                    } catch (IOException ignored) {
                      // the pipe is gone, nobody can block on it anymore
                    }
                  }
                  LOG.log(Level.FINE, "completed to copy the output of process " + process.pid());
                },
                "External Process Output Forwarder - "
                    + (builder.command().isEmpty() ? "N/A" : builder.command().get(0)));

        worker.setDaemon(true);
        worker.start();

        return new ExternalProcess(process, buffer, worker, forwarded);
      } catch (Throwable t) {
        // ensure we do not leak a process in case of failures
        try {
          process.destroyForcibly();
        } catch (Throwable t2) {
          t.addSuppressed(t2);
        }
        throw t;
      }
    }
  }

  public static Builder builder() {
    return new Builder();
  }

  private final Process process;
  private final OutputStream outputStream;
  private final Thread worker;
  // how far the worker has forwarded the output, null when the worker was not started by Builder
  private final @Nullable ForwardingProgress forwarded;

  public ExternalProcess(Process process, OutputStream outputStream, Thread worker) {
    this(process, outputStream, worker, null);
  }

  private ExternalProcess(
      Process process,
      OutputStream outputStream,
      Thread worker,
      @Nullable ForwardingProgress forwarded) {
    this.process = process;
    this.outputStream = outputStream;
    this.worker = worker;
    this.forwarded = forwarded;
  }

  /**
   * The last N bytes of the combined stdout and stderr as String, the value of N is set while
   * building the ExternalProcess.
   *
   * @return stdout and stderr as String in Charset.defaultCharset() encoding
   */
  public String getOutput() {
    return getOutput(Charset.defaultCharset());
  }

  /**
   * The last N bytes of the combined stdout and stderr as String, the value of N is set while
   * building the ExternalProcess.
   *
   * @param encoding the encoding to decode the stream
   * @return stdout and stderr as String in the given encoding
   */
  public String getOutput(Charset encoding) {
    if (outputStream instanceof CircularOutputStream) {
      return ((CircularOutputStream) outputStream).toString(encoding);
    } else if (outputStream instanceof ByteArrayOutputStream) {
      return ((ByteArrayOutputStream) outputStream).toString(encoding);
    } else {
      throw new IllegalStateException(
          "unexpected OutputStream implementation: " + outputStream.getClass().getSimpleName());
    }
  }

  public boolean isAlive() {
    return process.isAlive();
  }

  public boolean waitFor(Duration duration) throws InterruptedException {
    boolean exited = process.waitFor(duration.toMillis(), TimeUnit.MILLISECONDS);

    if (exited) {
      awaitWorker();
    }

    return exited;
  }

  public int exitValue() {
    return process.exitValue();
  }

  /**
   * Initiate a normal shutdown of the process or kills it when the process is alive after 4
   * seconds.
   */
  public void shutdown() {
    shutdown(Duration.ofSeconds(4));
  }

  /**
   * Initiate a normal shutdown of the process or kills it when the process is alive after the given
   * timeout.
   *
   * @param timeout the duration for a process to terminate before destroying it forcibly.
   */
  public void shutdown(Duration timeout) {
    try {
      // use the handle to prevent closing the stdin, stdout, stderr streams
      ProcessHandle handle = process.toHandle();

      if (handle.supportsNormalTermination()) {
        handle.destroy();

        try {
          if (process.waitFor(timeout.toMillis(), MILLISECONDS)) {
            // the outer finally block will take care of the worker
            return;
          }
        } catch (InterruptedException ex) {
          Thread.interrupted();
        }
      }

      handle.destroyForcibly();
      try {
        process.waitFor(timeout.toMillis(), MILLISECONDS);
      } catch (InterruptedException ex) {
        Thread.interrupted();
      }
    } finally {
      awaitWorker();
    }
  }

  /**
   * Waits for the worker to forward the output of the exited process.
   *
   * <p>The worker reads until the end of the stream. A child of the process that inherited its
   * stdout or stderr, e.g. a browser started by a driver, keeps the stream open after the process
   * itself exited. So the end of the stream may not arrive for a long time, while all output the
   * process wrote has already been forwarded. Stop waiting once the output was silent for {@link
   * #OUTPUT_QUIET_PERIOD_MS}, but keep waiting as long as output still arrives.
   */
  private void awaitWorker() {
    ForwardingProgress progress = forwarded;
    boolean quiet = false;
    try {
      // the worker might not stop even when process.destroyForcibly is called
      if (progress == null) {
        worker.join(8000);
      } else {
        quiet = joinUntilQuiet(progress, 8000);
      }
    } catch (InterruptedException ex) {
      Thread.interrupted();
    } finally {
      // if already stopped interrupt is ignored, otherwise raises I/O exceptions in the worker
      worker.interrupt();
      if (quiet) {
        LOG.log(
            Level.FINE,
            "the output of process "
                + process.pid()
                + " is still open, but silent; stopped waiting for its end");
      } else {
        try {
          // now we might be able to join
          worker.join(2000);
        } catch (InterruptedException ex) {
          Thread.interrupted();
        }
      }
    }
  }

  /**
   * Joins the worker until it stopped, the timeout elapsed, or no output was forwarded for {@link
   * #OUTPUT_QUIET_PERIOD_MS}. A write that is still in progress, e.g. to a slow {@code
   * copyOutputTo} stream, does not count as silence.
   *
   * @return true when the worker is still running, but did not forward any output in the last
   *     {@link #OUTPUT_QUIET_PERIOD_MS}
   */
  private boolean joinUntilQuiet(ForwardingProgress progress, long timeoutMs)
      throws InterruptedException {
    long deadline = System.nanoTime() + MILLISECONDS.toNanos(timeoutMs);
    long last = -1;

    while (worker.isAlive()) {
      // read the flag before the count: a write that ends between the two reads has already
      // advanced the count, so it cannot pass for silence
      boolean writing = progress.writing;
      long count = progress.bytes.get();
      if (count == last && !writing) {
        return true;
      }
      last = count;

      long remaining = TimeUnit.NANOSECONDS.toMillis(deadline - System.nanoTime());
      if (remaining <= 0) {
        return false;
      }
      worker.join(Math.min(remaining, OUTPUT_QUIET_PERIOD_MS));
    }

    return false;
  }

  /** How far the worker has forwarded the output, read by a thread waiting for it. */
  private static class ForwardingProgress {
    private final AtomicLong bytes = new AtomicLong();
    private volatile boolean writing;
  }

  /** Records the progress of the writes through it, so a waiting thread can see output flowing. */
  private static class CountingOutputStream extends OutputStream {

    private final OutputStream delegate;
    private final ForwardingProgress progress;

    private CountingOutputStream(OutputStream delegate, ForwardingProgress progress) {
      this.delegate = delegate;
      this.progress = progress;
    }

    @Override
    public void write(int b) throws IOException {
      progress.writing = true;
      try {
        delegate.write(b);
        progress.bytes.incrementAndGet();
      } finally {
        progress.writing = false;
      }
    }

    @Override
    public void write(byte[] b, int off, int len) throws IOException {
      progress.writing = true;
      try {
        delegate.write(b, off, len);
        progress.bytes.addAndGet(len);
      } finally {
        progress.writing = false;
      }
    }

    @Override
    public void flush() throws IOException {
      delegate.flush();
    }

    @Override
    public void close() throws IOException {
      delegate.close();
    }
  }
}
