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

import static java.util.Collections.unmodifiableMap;
import static java.util.concurrent.TimeUnit.SECONDS;
import static org.openqa.selenium.Platform.WINDOWS;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.Charset;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.apache.commons.exec.DaemonExecutor;
import org.apache.commons.exec.DefaultExecuteResultHandler;
import org.apache.commons.exec.ExecuteWatchdog;
import org.apache.commons.exec.Executor;
import org.apache.commons.exec.PumpStreamHandler;
import org.openqa.selenium.Platform;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.io.CircularOutputStream;
import org.openqa.selenium.io.MultiOutputStream;

class OsProcess {
  private static final Logger LOG = Logger.getLogger(OsProcess.class.getName());

  private final CircularOutputStream inputOut = new CircularOutputStream(32768);
  private volatile String allInput;
  private final DefaultExecuteResultHandler handler = new DefaultExecuteResultHandler();
  private final Executor executor = new DaemonExecutor();

  private volatile OutputStream drainTo;
  private SeleniumWatchDog executeWatchdog = new SeleniumWatchDog(ExecuteWatchdog.INFINITE_TIMEOUT);
  private PumpStreamHandler streamHandler;

  private final org.apache.commons.exec.CommandLine cl;
  private final Map<String, String> env = new ConcurrentHashMap<>();

  public OsProcess(String executable, String... args) {
    String actualExe = new ExecutableFinder().find(executable);
    Require.state("Actual executable", actualExe)
        .nonNull("Unable to find executable for: %s", executable);
    cl = new org.apache.commons.exec.CommandLine(actualExe);
    cl.addArguments(args, false);
  }

  public void setEnvironmentVariable(String name, String value) {
    if (name == null) {
      throw new IllegalArgumentException("Cannot have a null environment variable name!");
    }
    if (value == null) {
      throw new IllegalArgumentException(
          "Cannot have a null value for environment variable " + name);
    }
    env.put(name, value);
  }

  public Map<String, String> getEnvironment() {
    return unmodifiableMap(new HashMap<>(env));
  }

  private Map<String, String> getMergedEnv() {
    HashMap<String, String> newEnv = new HashMap<>(System.getenv());
    newEnv.putAll(env);
    return newEnv;
  }

  private ByteArrayInputStream getInputStream() {
    return allInput != null
        ? new ByteArrayInputStream(allInput.getBytes(Charset.defaultCharset()))
        : null;
  }

  public void executeAsync() {
    try {
      final OutputStream outputStream = getOutputStream();
      executeWatchdog.reset();
      executor.setWatchdog(executeWatchdog);
      streamHandler = new PumpStreamHandler(outputStream, outputStream, getInputStream());
      executor.setStreamHandler(streamHandler);
      executor.execute(cl, getMergedEnv(), handler);
    } catch (IOException e) {
      throw new WebDriverException(e);
    }
  }

  public boolean waitForProcessStarted(long duration, TimeUnit unit) {
    return executeWatchdog.waitForProcessStarted(duration, unit);
  }

  private OutputStream getOutputStream() {
    return drainTo == null ? inputOut : new MultiOutputStream(inputOut, drainTo);
  }

  public int destroy() {
    SeleniumWatchDog watchdog = executeWatchdog;

    if (watchdog.waitForProcessStarted(2, TimeUnit.MINUTES)) {
      // I literally have no idea why we don't try and kill the process nicely on Windows. If you
      // do,
      // answers on the back of a postcard to SeleniumHQ, please.
      if (!Platform.getCurrent().is(WINDOWS)) {
        watchdog.destroyProcess();
        watchdog.waitForTerminationAfterDestroy(2, SECONDS);
      }

      if (isRunning()) {
        watchdog.destroyHarder();
        watchdog.waitForTerminationAfterDestroy(1, SECONDS);
      }
    } else {
      LOG.warning("Tried to destory a process which never started.");
    }

    // Make a best effort to drain the streams.
    if (streamHandler != null) {
      // Stop trying to read the output stream so that we don't race with the stream being closed
      // when the process is destroyed.
      streamHandler.setStopTimeout(2000);
      try {
        streamHandler.stop();
      } catch (IOException e) {
        // Ignore and destroy the process anyway.
        LOG.log(
            Level.INFO,
            "Unable to drain process streams. Ignoring but the exception being swallowed follows.",
            e);
      }
    }

    if (!isRunning()) {
      return getExitCode();
    }

    LOG.severe(String.format("Unable to kill process %s", watchdog.process));
    int exitCode = -1;
    executor.setExitValue(exitCode);
    return exitCode;
  }

  public void waitFor() throws InterruptedException {
    handler.waitFor();
  }

  public void waitFor(long timeout) throws InterruptedException {
    long until = System.currentTimeMillis() + timeout;
    boolean timedOut = true;
    while (System.currentTimeMillis() < until) {
      if (Thread.interrupted()) {
        throw new InterruptedException();
      }
      if (handler.hasResult()) {
        timedOut = false;
        break;
      }
      Thread.sleep(50);
    }
    if (timedOut) {
      throw new TimeoutException(
          String.format("Process timed out after waiting for %d ms.", timeout));
    }

    // Wait until syserr and sysout have been read
  }

  public boolean isRunning() {
    return !handler.hasResult();
  }

  public int getExitCode() {
    if (isRunning()) {
      throw new IllegalStateException("Cannot get exit code before executing command line: " + cl);
    }
    return handler.getExitValue();
  }

  public void checkForError() {
    if (handler.getException() != null) {
      LOG.severe(handler.getException().toString());
    }
  }

  public String getStdOut() {
    return inputOut.toString();
  }

  public void setInput(String allInput) {
    this.allInput = allInput;
  }

  public void setWorkingDirectory(File workingDirectory) {
    executor.setWorkingDirectory(workingDirectory);
  }

  @Override
  public String toString() {
    return cl.toString() + "[ " + env + "]";
  }

  public void copyOutputTo(OutputStream out) {
    drainTo = out;
  }

  class SeleniumWatchDog extends ExecuteWatchdog {

    private volatile Process process;
    private volatile boolean starting = true;

    SeleniumWatchDog(long timeout) {
      super(timeout);
    }

    @Override
    public synchronized void start(Process process) {
      this.process = process;
      starting = false;
      super.start(process);
    }

    public void reset() {
      starting = true;
    }

    private boolean waitForProcessStarted(long duration, TimeUnit unit) {
      long end = System.currentTimeMillis() + unit.toMillis(duration);
      while (starting && System.currentTimeMillis() < end) {
        try {
          Thread.sleep(50);
        } catch (InterruptedException e) {
          Thread.currentThread().interrupt();
          throw new WebDriverException(e);
        }
      }

      return !starting;
    }

    private void waitForTerminationAfterDestroy(int duration, TimeUnit unit) {
      long end = System.currentTimeMillis() + unit.toMillis(duration);
      while (isRunning() && System.currentTimeMillis() < end) {
        try {
          Thread.sleep(50);
        } catch (InterruptedException e) {
          Thread.currentThread().interrupt();
          throw new WebDriverException(e);
        }
      }
    }

    private void destroyHarder() {
      try {
        Process awaitFor = this.process.destroyForcibly();
        awaitFor.waitFor(10, SECONDS);
      } catch (InterruptedException e) {
        Thread.currentThread().interrupt();
        throw new RuntimeException(e);
      }
    }
  }
}
