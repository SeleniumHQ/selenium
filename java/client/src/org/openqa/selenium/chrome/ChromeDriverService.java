// Copyright 2011 Google Inc. All Rights Reserved.
package org.openqa.selenium.chrome;

import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.browserlaunchers.AsyncExecute;
import org.openqa.selenium.net.PortProber;
import org.openqa.selenium.net.UrlChecker;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.PrintStream;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.concurrent.locks.ReentrantLock;

import static com.google.common.base.Preconditions.*;
import static java.util.concurrent.TimeUnit.SECONDS;
import static org.openqa.selenium.os.CommandLine.findExecutable;

/**
 * Manages the life and death of a chromedriver server.
 */
public class ChromeDriverService {

  /**
   * System property that defines the location of the chromedriver executable
   * that will be used by the {@link #createDefaultService() default service}.
   */
  public static final String CHROME_DRIVER_EXE_PROPERTY = "webdriver.chrome.driver";

  /**
   * Used to spawn a new child process when this service is {@link #start() started}.
   */
  private final ProcessBuilder processBuilder;

  /**
   * The base URL for the managed server.
   */
  private final URL url;

  /**
   * Controls access to {@link #process}.
   */
  private final ReentrantLock lock = new ReentrantLock();

  /**
   * A reference to the current child process. Will be {@code null} whenever
   * this service is not running. Protected by {@link #lock}.
   */
  private Process process = null;

  /**
   * @param executable The chromedriver executable.
   * @param port Which port to start the chromedriver on.
   * @throws IOException If an I/O error occurs.
   */
  private ChromeDriverService(File executable, int port) throws IOException {
    this.processBuilder = new ProcessBuilder(
        executable.getCanonicalPath(),
        String.format("--port=%d", port));

    url = new URL(String.format("http://localhost:%d", port));
  }

  /**
   * @return The base URL for the managed chromedriver server.
   */
  public URL getUrl() {
    return url;
  }

  /**
   * Configures and returns a new {@link ChromeDriverService} using the default
   * configuration. In this configuration, the service will use the
   * chromedriver executable identified by the
   * {@link #CHROME_DRIVER_EXE_PROPERTY} system property. Each service created
   * by this method will be configured to use a free port on the current
   * system.
   *
   * @return A new ChromeDriverService using the default configuration.
   */
  public static ChromeDriverService createDefaultService() {
    String defaultPath = findExecutable("chromedriver");
    String exePath = System.getProperty(CHROME_DRIVER_EXE_PROPERTY, defaultPath);
    checkState(exePath != null,
        "The path to the chromedriver executable must be set by the %s system property;" +
            " for more information, see http://code.google.com/p/selenium/wiki/ChromeDriver. " +
            "The latest version can be downloaded from " +
            "http://code.google.com/p/chromium/downloads/list",
        CHROME_DRIVER_EXE_PROPERTY);

    File exe = new File(exePath);
    checkState(exe.exists(),
        "The %s system property defined chromedriver executable does not exist: %s",
        CHROME_DRIVER_EXE_PROPERTY, exe.getAbsolutePath());
    checkState(!exe.isDirectory(),
        "The %s system property defined chromedriver executable is a directory: %s",
        CHROME_DRIVER_EXE_PROPERTY, exe.getAbsolutePath());
    // TODO(jleyba): Check file.canExecute() once we support Java 1.6
    //checkState(exe.canExecute(),
    //    "The %s system property defined chromedriver is not executable: %s",
    //    CHROME_DRIVER_EXE_PROPERTY, exe.getAbsolutePath());

    return new Builder()
        .usingChromeDriverExecutable(exe)
        .usingAnyFreePort()
        .build();
  }

  /**
   * Checks whether the chromedriver child proces is currently running.
   *
   * @return Whether the chromedriver child process is still running.
   */
  public boolean isRunning() {
    lock.lock();
    try {
      if (process == null) {
        return false;
      }
      process.exitValue();
      return false;
    } catch (IllegalThreadStateException e) {
      return true;
    } finally {
      lock.unlock();
    }
  }

  /**
   * Starts this service if it is not already running. This method will
   * block until the server has been fully started and is ready to handle
   * commands.
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
      process = processBuilder.start();
      pipe(process.getErrorStream(), System.err);
      pipe(process.getInputStream(), System.out);

      URL status = new URL(url.toString() + "/status");
      URL healthz = new URL(url.toString() + "/healthz");
      new UrlChecker().waitUntilAvailable(20, SECONDS, status, healthz);
    } catch (UrlChecker.TimeoutException e) {
      throw new WebDriverException("Timed out waiting for ChromeDriver server to start.", e);
    } finally {
      lock.unlock();
    }
  }

  // http://stackoverflow.com/questions/60302
  private static void pipe(final InputStream src, final PrintStream dest) {
    new Thread(new Runnable() {
      public void run() {
        try {
          byte[] buffer = new byte[1024];
          for (int n = 0; n != -1; n = src.read(buffer)) {
            dest.write(buffer, 0, n);
          }
        } catch (IOException e) {
          // Do nothing.
        }
      }
    }).start();
  }

  /**
   * Stops this service is it is currently running. This method will attempt to
   * block until the server has been fully shutdown.
   *
   * @see #start()
   */
  public void stop() {
    lock.lock();
    try {
      if (process == null) {
        return;
      }
      URL killUrl = new URL(url.toString() + "/shutdown");
      new UrlChecker().waitUntilUnavailable(3, SECONDS, killUrl);
      AsyncExecute.killProcess(process);
    } catch (MalformedURLException e) {
      throw new WebDriverException(e);
    } catch (UrlChecker.TimeoutException e) {
      throw new WebDriverException("Timed out waiting for ChromeDriver server to shutdown.", e);
    } finally {
      process = null;
      lock.unlock();
    }
  }

  /**
   * Builder used to configure new {@link ChromeDriverService} instances.
   */
  public static class Builder {

    private int port = 0;
    private File exe = null;

    /**
     * Sets which chromedriver executable the builder will use.
     *
     * @param file The executable to use.
     * @return A self reference.
     */
    public Builder usingChromeDriverExecutable(File file) {
      checkNotNull(file);
      checkArgument(file.exists(),
          "Specified chromedriver executable does not exist: %s", file.getPath());
      checkArgument(!file.isDirectory(),
          "Specified chromedriver executable is a directory: %s", file.getPath());
      // TODO(jleyba): Check file.canExecute() once we support Java 1.6
      // checkArgument(file.canExecute(), "File is not executable: %s", file.getPath());
      this.exe = file;
      return this;
    }

    /**
     * Sets which port the chromedriver server should be started on. A value of
     * 0 indicates that any free port may be used.
     *
     * @param port The port to use; must be non-negative.
     * @return A self reference.
     */
    public Builder usingPort(int port) {
      checkArgument(port >= 0, "Invalid port number: %d", port);
      this.port = port;
      return this;
    }

    /**
     * Configures the chromedriver server to start on any available port.
     *
     * @return A self reference.
     */
    public Builder usingAnyFreePort() {
      this.port = 0;
      return this;
    }

    /**
     * Creates a new binary to manage the chromedriver server. Before creating
     * a new binary, the builder will check that either the user defined the
     * location of the chromedriver executable through
     * {@link #usingChromeDriverExecutable(File) the API} or with the
     * {@code webdriver.chrome.driver} system property.
     *
     * @return The new binary.
     */
    public ChromeDriverService build() {
      if (port == 0) {
        port = PortProber.findFreePort();
      }

      checkState(exe != null, "Path to the chromedriver executable not specified");

      try {
        return new ChromeDriverService(exe, port);
      } catch (IOException e) {
        throw new WebDriverException(e);
      }
    }
  }
}
