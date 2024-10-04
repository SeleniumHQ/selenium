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

package org.openqa.selenium.remote.service;

import static java.util.Collections.emptyMap;
import static java.util.concurrent.TimeUnit.SECONDS;
import static org.openqa.selenium.concurrent.ExecutorServices.shutdownGracefully;

import java.io.Closeable;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.net.MalformedURLException;
import java.net.URL;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import java.util.concurrent.locks.ReentrantLock;
import java.util.logging.Logger;
import org.openqa.selenium.Beta;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.net.PortProber;
import org.openqa.selenium.net.UrlChecker;
import org.openqa.selenium.os.ExternalProcess;

/**
 * Manages the life and death of a native executable driver server. It is expected that the driver
 * server implements the <a
 * href="https://github.com/SeleniumHQ/selenium/wiki/JsonWireProtocol">WebDriver Wire Protocol</a>.
 * In particular, it should implement /status command that is used to check if the server is alive.
 * In addition to this, it is supposed that the driver server implements /shutdown hook that is used
 * to stop the server.
 */
public class DriverService implements Closeable {

  public static final String LOG_NULL = "/dev/null";
  public static final String LOG_STDERR = "/dev/stderr";
  public static final String LOG_STDOUT = "/dev/stdout";
  private static final String NAME = "Driver Service Executor";
  protected static final Duration DEFAULT_TIMEOUT = Duration.ofSeconds(20);
  private static final Logger LOG = Logger.getLogger(DriverService.class.getName());

  private final ExecutorService executorService =
      Executors.newFixedThreadPool(
          2,
          r -> {
            Thread thread = new Thread(r);
            thread.setName(NAME);
            thread.setDaemon(true);
            return thread;
          });

  /** The base URL for the managed server. */
  private final URL url;

  /** Controls access to {@link #process}. */
  private String executable;

  private final ReentrantLock lock = new ReentrantLock();
  private final Duration timeout;
  private final List<String> args;
  private final Map<String, String> environment;

  /**
   * A reference to the current child process. Will be {@code null} whenever this service is not
   * running. Protected by {@link #lock}.
   */
  protected ExternalProcess process = null;

  private OutputStream outputStream = System.err;

  /**
   * @param executable The driver executable.
   * @param port Which port to start the driver server on.
   * @param timeout Timeout waiting for driver server to start.
   * @param args The arguments to the launched server.
   * @param environment The environment for the launched server.
   * @throws IOException If an I/O error occurs.
   */
  protected DriverService(
      File executable,
      int port,
      Duration timeout,
      List<String> args,
      Map<String, String> environment)
      throws IOException {
    if (executable != null) {
      this.executable = executable.getCanonicalPath();
    }
    this.timeout = timeout;
    this.args = args;
    this.environment = environment;

    this.url = getUrl(port);
  }

  public String getExecutable() {
    return executable;
  }

  public void setExecutable(String executable) {
    this.executable = executable;
  }

  protected List<String> getArgs() {
    return args;
  }

  protected Map<String, String> getEnvironment() {
    return environment;
  }

  protected URL getUrl(int port) throws IOException {
    return new URL(String.format("http://localhost:%d", port));
  }

  protected Capabilities getDefaultDriverOptions() {
    return new ImmutableCapabilities();
  }

  protected String getDriverName() {
    return null;
  }

  public String getDriverProperty() {
    return null;
  }

  protected File getDriverExecutable() {
    return null;
  }

  /**
   * @return The base URL for the managed driver server.
   */
  public URL getUrl() {
    return url;
  }

  /**
   * Checks whether the driver child process is currently running.
   *
   * @return Whether the driver child process is still running.
   */
  public boolean isRunning() {
    lock.lock();
    try {
      return process != null && process.isAlive();
    } catch (IllegalThreadStateException e) {
      return true;
    } finally {
      lock.unlock();
    }
  }

  /**
   * Starts this service if it is not already running. This method will block until the server has
   * been fully started and is ready to handle commands.
   *
   * @throws IOException If an error occurs while spawning the child process.
   * @see #stop()
   */
  public void start() throws IOException {
    lock.lock();
    try {
      if (process != null) {
        return;
      }
      if (this.executable == null) {
        if (getDefaultDriverOptions().getBrowserName().isEmpty()) {
          throw new WebDriverException("Driver executable is null and browser name is not set.");
        }
        this.executable = new DriverFinder(this, getDefaultDriverOptions()).getDriverPath();
      }
      LOG.fine(String.format("Starting driver at %s with %s", this.executable, this.args));

      ExternalProcess.Builder builder =
          ExternalProcess.builder().command(this.executable, args).copyOutputTo(getOutputStream());

      environment.forEach(builder::environment);
      process = builder.start();

      CompletableFuture<StartOrDie> serverStarted =
          CompletableFuture.supplyAsync(
              () -> {
                waitUntilAvailable();
                return StartOrDie.SERVER_STARTED;
              },
              executorService);

      CompletableFuture<StartOrDie> processFinished =
          CompletableFuture.supplyAsync(
              () -> {
                try {
                  return process.waitFor(getTimeout())
                      ? StartOrDie.PROCESS_DIED
                      : StartOrDie.PROCESS_IS_ACTIVE;
                } catch (InterruptedException ex) {
                  return null;
                }
              },
              executorService);

      try {
        StartOrDie status =
            (StartOrDie)
                CompletableFuture.anyOf(serverStarted, processFinished)
                    .get(getTimeout().toMillis() * 2, TimeUnit.MILLISECONDS);

        if (status == null) {
          throw new InterruptedException();
        }

        switch (status) {
          case SERVER_STARTED:
            processFinished.cancel(true);
            break;
          case PROCESS_DIED:
            process = null;
            throw new WebDriverException("Driver server process died prematurely.");
          case PROCESS_IS_ACTIVE:
            process.shutdown();
            throw new WebDriverException("Timed out waiting for driver server to bind the port.");
        }
      } catch (ExecutionException e) {
        process.shutdown();
        throw new WebDriverException("Failed waiting for driver server to start.", e);
      } catch (TimeoutException e) {
        process.shutdown();
        throw new WebDriverException("Timed out waiting for driver server to start.", e);
      } catch (InterruptedException e) {
        process.shutdown();
        Thread.currentThread().interrupt();
        throw new WebDriverException("Interrupted while waiting for driver server to start.", e);
      }
    } finally {
      lock.unlock();
    }
  }

  protected Duration getTimeout() {
    return timeout;
  }

  protected void waitUntilAvailable() {
    try {
      URL status = new URL(url.toString() + "/status");
      new UrlChecker().waitUntilAvailable(getTimeout().toMillis(), TimeUnit.MILLISECONDS, status);
    } catch (MalformedURLException e) {
      throw new WebDriverException("Driver server status URL is malformed.", e);
    } catch (UrlChecker.TimeoutException e) {
      throw new WebDriverException("Timed out waiting for driver server to start.", e);
    }
  }

  /**
   * Stops this service if it is currently running. This method will attempt to block until the
   * server has been fully shutdown.
   *
   * @see #start()
   */
  public void stop() {
    lock.lock();

    WebDriverException toThrow = null;
    try {
      if (process == null) {
        return;
      }

      if (hasShutdownEndpoint()) {
        try {
          URL killUrl = new URL(url.toString() + "/shutdown");
          new UrlChecker().waitUntilUnavailable(3, SECONDS, killUrl);
          try {
            process.waitFor(Duration.ofSeconds(10));
          } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
          }
        } catch (MalformedURLException e) {
          toThrow = new WebDriverException(e);
        } catch (UrlChecker.TimeoutException e) {
          toThrow = new WebDriverException("Timed out waiting for driver server to shutdown.", e);
        }
      }

      process.shutdown();

      if (getOutputStream() instanceof FileOutputStream) {
        try {
          getOutputStream().close();
        } catch (IOException ignore) {
        }
      }
    } finally {
      process = null;
      lock.unlock();
      close();
    }

    if (toThrow != null) {
      throw toThrow;
    }
  }

  protected boolean hasShutdownEndpoint() {
    return true;
  }

  public void sendOutputTo(OutputStream outputStream) {
    this.outputStream = Require.nonNull("Output stream", outputStream);
  }

  protected OutputStream getOutputStream() {
    return outputStream;
  }

  @Override
  public void close() {
    shutdownGracefully(NAME, executorService);
  }

  private enum StartOrDie {
    SERVER_STARTED,
    PROCESS_IS_ACTIVE,
    PROCESS_DIED
  }

  public abstract static class Builder<DS extends DriverService, B extends Builder<?, ?>> {

    private int port = 0;
    public File exe = null;
    private Map<String, String> environment = emptyMap();
    private File logFile;
    private Duration timeout;
    private OutputStream logOutputStream;

    /**
     * Provides a measure of how strongly this {@link DriverService} supports the given {@code
     * capabilities}. A score of 0 or less indicates that this {@link DriverService} does not
     * support instances of {@link org.openqa.selenium.WebDriver} that require {@code capabilities}.
     * Typically, the score is generated by summing the number of capabilities that the driver
     * service directly supports that are unique to the driver service (that is, things like "{@code
     * proxy}" don't tend to count to the score).
     */
    public abstract int score(Capabilities capabilities);

    /**
     * Sets which driver executable the builder will use.
     *
     * @param file The executable to use.
     * @return A self reference.
     */
    @SuppressWarnings("unchecked")
    public B usingDriverExecutable(File file) {
      Require.nonNull("Driver executable file", file);
      this.exe = file;
      return (B) this;
    }

    /**
     * Sets which port the driver server should be started on. A value of 0 indicates that any free
     * port may be used.
     *
     * @param port The port to use; must be non-negative.
     * @return A self reference.
     */
    public B usingPort(int port) {
      this.port = Require.nonNegative("Port number", port);
      return (B) this;
    }

    protected int getPort() {
      return port;
    }

    /**
     * Configures the driver server to start on any available port.
     *
     * @return A self reference.
     */
    public B usingAnyFreePort() {
      this.port = 0;
      return (B) this;
    }

    /**
     * Defines the environment for the launched driver server. These settings will be inherited by
     * every browser session launched by the server.
     *
     * @param environment A map of the environment variables to launch the server with.
     * @return A self reference.
     */
    @Beta
    public B withEnvironment(Map<String, String> environment) {
      this.environment = Map.copyOf(environment);
      return (B) this;
    }

    /**
     * Configures the driver server to write log to the given file.
     *
     * @param logFile A file to write log to.
     * @return A self reference.
     */
    public B withLogFile(File logFile) {
      this.logFile = logFile;
      return (B) this;
    }

    public B withLogOutput(OutputStream output) {
      this.logOutputStream = output;
      return (B) this;
    }

    protected File getLogFile() {
      return logFile;
    }

    /**
     * Configures the timeout waiting for driver server to start.
     *
     * @return A self reference.
     */
    public B withTimeout(Duration timeout) {
      this.timeout = timeout;
      return (B) this;
    }

    protected Duration getDefaultTimeout() {
      return DEFAULT_TIMEOUT;
    }

    protected OutputStream getLogOutput() {
      if (logOutputStream != null) {
        return logOutputStream;
      }
      try {
        File logFile = getLogFile();
        return logFile == null ? OutputStream.nullOutputStream() : new FileOutputStream(logFile);
      } catch (FileNotFoundException e) {
        throw new RuntimeException(e);
      }
    }

    protected void parseLogOutput(String logProperty) {
      if (getLogFile() != null || logOutputStream != null) {
        return;
      }

      String logLocation = System.getProperty(logProperty, LOG_NULL);
      switch (logLocation) {
        case LOG_STDOUT:
          withLogOutput(System.out);
          break;
        case LOG_STDERR:
          withLogOutput(System.err);
          break;
        case LOG_NULL:
          withLogOutput(OutputStream.nullOutputStream());
          break;
        default:
          withLogFile(new File(logLocation));
          break;
      }
    }

    /**
     * Creates a new service to manage the driver server. Before creating a new service, the builder
     * will find a port for the server to listen to.
     *
     * @return The new service object.
     */
    public DS build() {
      if (port == 0) {
        port = PortProber.findFreePort();
      }

      if (timeout == null) {
        timeout = getDefaultTimeout();
      }

      loadSystemProperties();
      List<String> args = createArgs();

      DS service = createDriverService(exe, port, timeout, args, environment);
      service.sendOutputTo(getLogOutput());

      port = 0; // reset port to allow reusing this builder

      return service;
    }

    protected abstract void loadSystemProperties();

    protected abstract List<String> createArgs();

    protected abstract DS createDriverService(
        File exe, int port, Duration timeout, List<String> args, Map<String, String> environment);
  }
}
