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

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.UncheckedIOException;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.io.CircularOutputStream;
import org.openqa.selenium.io.MultiOutputStream;

public class ExternalProcess {
  private static final Logger LOG = Logger.getLogger(ExternalProcess.class.getName());

  public static class Builder {

    private ProcessBuilder builder;
    private OutputStream copyOutputTo;
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
     * Where to copy the combined stdout and stderr output to, {@code OsProcess#getOutput} is still
     * working when called.
     *
     * @param stream where to copy the combined output to
     * @return this instance to continue building
     */
    public Builder copyOutputTo(OutputStream stream) {
      copyOutputTo = stream;

      return this;
    }

    /**
     * The number of bytes to buffer for {@code OsProcess#getOutput} calls.
     *
     * @param toKeep the number of bytes, default is 4096
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
        CircularOutputStream circular = new CircularOutputStream(bufferSize);

        Thread worker =
            new Thread(
                () -> {
                  // copyOutputTo might be system.out or system.err, do not to close
                  OutputStream output = new MultiOutputStream(circular, copyOutputTo);
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
                  }
                  LOG.log(Level.FINE, "completed to copy the output of process " + process.pid());
                },
                "External Process Output Forwarder - "
                    + (builder.command().isEmpty() ? "N/A" : builder.command().get(0)));

        worker.start();

        return new ExternalProcess(process, circular, worker);
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
  private final CircularOutputStream outputStream;
  private final Thread worker;

  public ExternalProcess(Process process, CircularOutputStream outputStream, Thread worker) {
    this.process = process;
    this.outputStream = outputStream;
    this.worker = worker;
  }

  /**
   * The last N bytes of the combined stdout and stderr as String, the value of N is set while
   * building the OsProcess.
   *
   * @return stdout and stderr as String in Charset.defaultCharset() encoding
   */
  public String getOutput() {
    return outputStream.toString();
  }

  public boolean isAlive() {
    return process.isAlive();
  }

  public boolean waitFor(Duration duration) throws InterruptedException {
    boolean exited = process.waitFor(duration.toMillis(), TimeUnit.MILLISECONDS);

    if (exited) {
      worker.join();
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
    if (process.supportsNormalTermination()) {
      process.destroy();

      try {
        if (process.waitFor(timeout.toMillis(), MILLISECONDS)) {
          worker.join();
          return;
        }
      } catch (InterruptedException ex) {
        Thread.interrupted();
      }
    }

    process.destroyForcibly();
    try {
      worker.join();
    } catch (InterruptedException ex) {
      Thread.interrupted();
    }
  }
}
