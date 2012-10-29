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

import static com.google.common.base.Preconditions.checkNotNull;
import static com.google.common.collect.ImmutableMap.copyOf;
import static java.util.concurrent.TimeUnit.SECONDS;

import com.google.common.annotations.VisibleForTesting;
import com.google.common.collect.Maps;

import org.apache.commons.exec.DefaultExecuteResultHandler;
import org.apache.commons.exec.DefaultExecutor;
import org.apache.commons.exec.ExecuteWatchdog;
import org.apache.commons.exec.Executor;
import org.apache.commons.exec.PumpStreamHandler;
import org.openqa.selenium.WebDriverException;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.io.OutputStream;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;
import java.util.logging.Logger;

class UnixProcess implements OsProcess {
  private static final Logger log = Logger.getLogger(UnixProcess.class.getName());

  private final ByteArrayOutputStream inputOut = new ByteArrayOutputStream();
  private volatile String allInput;
  private final DefaultExecuteResultHandler handler = new DefaultExecuteResultHandler();
  private final Executor executor = new DefaultExecutor();

  private volatile OutputStream drainTo;
  private SeleniumWatchDog executeWatchdog = new SeleniumWatchDog(
      ExecuteWatchdog.INFINITE_TIMEOUT);

  private final org.apache.commons.exec.CommandLine cl;
  private final Map<String, String> env = new ConcurrentHashMap<String, String>();

  public UnixProcess(String executable, String... args) {
    String actualExe = checkNotNull(new ExecutableFinder().find(executable),
        "Unable to find executable for: %s", executable);
    cl = new org.apache.commons.exec.CommandLine(actualExe);
    cl.addArguments(args, false);
  }

  public void setEnvironmentVariable(String name, String value) {
    if (name == null) {
      throw new IllegalArgumentException("Cannot have a null environment variable name!");
    }
    if (value == null) {
      throw new IllegalArgumentException("Cannot have a null value for environment variable " +
                                         name);
    }
    env.put(name, value);
  }

  @VisibleForTesting
  public Map<String, String> getEnvironment() {
    return copyOf(env);
  }

  private Map<String, String> getMergedEnv() {
    HashMap<String, String> newEnv = Maps.newHashMap(System.getenv());
    newEnv.putAll(env);
    return newEnv;
  }

  private ByteArrayInputStream getInputStream() {
    return allInput != null ? new ByteArrayInputStream(allInput.getBytes()) : null;
  }

  public void executeAsync() {
    try {
      final OutputStream outputStream = getOutputStream();
      executeWatchdog.reset();
      executor.setWatchdog(executeWatchdog);
      executor.setStreamHandler(new PumpStreamHandler(
          outputStream, outputStream, getInputStream()));
      executor.execute(cl, getMergedEnv(), handler);
    } catch (IOException e) {
      throw new WebDriverException(e);
    }
  }

  private OutputStream getOutputStream() {
    return drainTo == null ? inputOut
        : new MultioutputStream(inputOut, drainTo);
  }

  public int destroy() {
    SeleniumWatchDog watchdog = executeWatchdog;
    watchdog.waitForProcessStarted();
    watchdog.destroyProcess();
    watchdog.waitForTerminationAfterDestroy(2, SECONDS);
    if (!isRunning()) {
      return getExitCode();
    }

    watchdog.destroyHarder();
    watchdog.waitForTerminationAfterDestroy(1, SECONDS);
    if (!isRunning()) {
      return getExitCode();
    }

    log.severe(String.format("Unable to kill process with PID %s",
        watchdog.getPID()));
    int exitCode = -1;
    executor.setExitValue(exitCode);
    return exitCode;
  }

  public void waitFor() throws InterruptedException {
    handler.waitFor();
  }
  
  public boolean isRunning() {
    return !handler.hasResult();
  }

  public int getExitCode() {
    if (isRunning()) {
      throw new IllegalStateException(
          "Cannot get exit code before executing command line: " + cl);
    }
    return handler.getExitValue();
  }

  public String getStdOut() {
    if (isRunning()) {
      throw new IllegalStateException(
          "Cannot get output before executing command line: " + cl);
    }
    return new String(inputOut.toByteArray());
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

    private String getPID() {
      return this.process.toString();
    }

    private void waitForProcessStarted() {
      while (starting) {
        try {
          Thread.sleep(50);
        } catch (InterruptedException e) {
          throw new WebDriverException(e);
        }
      }
    }

    private void waitForTerminationAfterDestroy(int duration, TimeUnit unit) {
      long end = System.currentTimeMillis() + unit.toMillis(duration);
      while (isRunning() && System.currentTimeMillis() < end) {
        try {
          Thread.sleep(50);
        } catch (InterruptedException e) {
          throw new WebDriverException(e);
        }
      }
    }

    private void destroyHarder() {
      log.info("Command failed to close cleanly. Destroying forcefully (v2). " + this);
      Process ourProc = process;
      ProcessUtils.killProcess(ourProc);
    }
  }

  class MultioutputStream extends OutputStream {

    private final OutputStream mandatory;
    private final OutputStream optional;

    MultioutputStream(OutputStream mandatory, OutputStream optional) {
      this.mandatory = mandatory;
      this.optional = optional;
    }

    @Override
    public void write(int b) throws IOException {
      mandatory.write(b);
      if (optional != null) {
        optional.write(b);
      }
    }

    @Override
    public void flush() throws IOException {
      mandatory.flush();
      if (optional != null) {
        optional.flush();
      }
    }

    @Override
    public void close() throws IOException {
      mandatory.close();
      if (optional != null) {
        optional.close();
      }
    }
  }
}
