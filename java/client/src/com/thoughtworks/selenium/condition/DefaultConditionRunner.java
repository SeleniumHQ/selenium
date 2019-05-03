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

package com.thoughtworks.selenium.condition;

import com.thoughtworks.selenium.Selenium;
import com.thoughtworks.selenium.SeleniumException;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.logging.Logger;

/**
 * This ConditionRunner throws a simple {@link RuntimeException} when the
 * condition is not met in the {@link #waitFor(Condition)} method. More specific
 * runners are preferred for different testing frameworks. E.g. JUnit tests
 * would prefer to use {@link JUnitConditionRunner}.
 */
public class DefaultConditionRunner implements ConditionRunner {

  private final Monitor monitor;
  private final Selenium selenium;
  private final int initialDelay;
  private final int interval;
  private final int timeout;

  /**
   * @param monitor the Monitor
   * @param selenium the selenium to be passed to the Conditions run from within this runner.
   * @param initialDelay (in millis) how long to wait before the initial test of the condition
   * @param interval (in millis) when waiting for a condition, how long to wait between calls to
   *        {@link Condition#isTrue(com.thoughtworks.selenium.condition.ConditionRunner.Context)}
   * @param timeout (in millis) when waiting for a condition, how long to wait until we give up.
   */
  public DefaultConditionRunner(Monitor monitor, Selenium selenium, int initialDelay, int interval,
      int timeout) {
    this.monitor = monitor;
    this.selenium = selenium;
    this.initialDelay = initialDelay;
    this.interval = interval;
    this.timeout = timeout;
  }

  /**
   * @param monitor the Monitor
   * @param selenium the selenium to be passed to the Conditions run from within this runner.
   * @param interval (in millis) when waiting for a condition, how long to wait between calls to
   *        {@link Condition#isTrue(com.thoughtworks.selenium.condition.ConditionRunner.Context)}
   * @param timeout (in millis) when waiting for a condition, how long to wait until we give up.
   */
  public DefaultConditionRunner(Monitor monitor, Selenium selenium, int interval, int timeout) {
    this(monitor, selenium, interval, interval, timeout);
  }

  /**
   * Constructs an instance of this class with a {@link NoOpMonitor}.
   *
   * @see DefaultConditionRunner#DefaultConditionRunner(Monitor, Selenium, int, int)
   * @param selenium the selenium to be passed to the Conditions run from within this runner.
   * @param initialDelay (in millis) how long to wait before the initial test of the condition
   * @param interval (in millis) when waiting for a condition, how long to wait between calls to
   *        {@link Condition#isTrue(com.thoughtworks.selenium.condition.ConditionRunner.Context)}
   * @param timeout (in millis) when waiting for a condition, how long to wait until we give up.
   */
  public DefaultConditionRunner(Selenium selenium, int initialDelay, int interval, int timeout) {
    this(new NoOpMonitor(), selenium, initialDelay, interval, timeout);
  }

  /**
   * Constructs an instance of this class with a {@link NoOpMonitor}.
   *
   * @see DefaultConditionRunner#DefaultConditionRunner(Monitor, Selenium, int, int)
   * @param selenium the selenium to be passed to the Conditions run from within this runner.
   * @param interval (in millis) when waiting for a condition, how long to wait between calls to
   *        {@link Condition#isTrue(com.thoughtworks.selenium.condition.ConditionRunner.Context)}
   * @param timeout (in millis) when waiting for a condition, how long to wait until we give up.
   */
  public DefaultConditionRunner(Selenium selenium, int interval, int timeout) {
    this(new NoOpMonitor(), selenium, interval, timeout);
  }

  /**
   * Constructs an instance of this class with reasonable defaults.
   *
   * @see DefaultConditionRunner#DefaultConditionRunner(Monitor, Selenium, int, int)
   * @param selenium the selenium to be passed to the Conditions run from within this runner.
   */
  public DefaultConditionRunner(Selenium selenium) {
    this(new NoOpMonitor(), selenium, 500, 45 * 1000);
  }

  /**
   * A {@link Monitor} can be installed in {@link DefaultConditionRunner} as an open ended way of
   * being notified of certain events.
   */
  public interface Monitor {

    /**
     * Called whenever a {@link DefaultConditionRunner#waitFor(Condition)} has begun, and is being
     * tracked with the given {@code condition}.
     *
     * @param condition condition that waiting is about to begin
     * @param context context on with the condition will be run
     */
    void waitHasBegun(ConditionRunner.Context context, Condition condition);

    /**
     * Called whenever a {@link DefaultConditionRunner#waitFor(Condition)} is successful (i.e.
     * {@link Condition#isTrue(com.thoughtworks.selenium.condition.ConditionRunner.Context)}
     * returned true within the timeout}.
     * @param condition condition that waiting completed
     * @param context context for the condition
     */
    void conditionWasReached(ConditionRunner.Context context, Condition condition);

    void conditionFailed(ConditionRunner.Context context, Condition condition, String message);
  }

  /**
   * A no-op implementation of {@link Monitor}.
   */
  public static final class NoOpMonitor implements Monitor {

    @Override
    public void waitHasBegun(ConditionRunner.Context context, Condition condition) {
    }

    @Override
    public void conditionWasReached(ConditionRunner.Context context, Condition condition) {
    }

    @Override
    public void conditionFailed(Context context, Condition condition, String message) {
    }
  }


  /**
   * A Log4j implementation of {@link Monitor}.
   */
  public static final class Log4jMonitor implements Monitor {
    private static final Logger logger =
        Logger.getLogger(DefaultConditionRunner.class.getName());

    @Override
    public void conditionWasReached(ConditionRunner.Context context, Condition condition) {
      log("Reached " + condition.toString());
    }

    @Override
    public void waitHasBegun(ConditionRunner.Context context, Condition condition) {
      log("Waiting for " + condition.toString());
    }

    @Override
    public void conditionFailed(ConditionRunner.Context context, Condition condition, String message) {
      log(message);
    }

    protected void log(String message) {
      logger.finest(new Date() + " - " + message);
    }

  }

  @Override
  public void waitFor(Condition condition) {
    waitFor("", condition);
  }

  @Override
  public void waitFor(String narrative, Condition condition) {
    ContextImpl context = new ContextImpl();
    SeleniumException seleniumException = null;
    try {
      monitor.waitHasBegun(context, condition);
      threadSleep(initialDelay);
      while (context.elapsed() < context.timeout()) {
        seleniumException = null;
        try {
          if (condition.isTrue(context)) {
            monitor.conditionWasReached(context, condition);
            return;
          }
        } catch (SeleniumException se) {
          seleniumException = se;
        }
        threadSleep(interval);
      }
    } catch (RuntimeException e) {
      throwAssertionException("Exception while waiting for '" + condition.toString() + "'", e);
    }
    if (seleniumException != null) {
      throwAssertionException("SeleniumException while waiting for '" + condition.toString() +
          "' (otherwise timed out)", seleniumException);
    }
    // Note that AssertionFailedError will pass right through
    String message = context.failureMessage(narrative, condition);
    monitor.conditionFailed(context, condition, message);
    throwAssertionException(message);
  }

  private void threadSleep(int interval) {
    try {
      Thread.sleep(interval);
    } catch (InterruptedException ignore) {
    }
  }

  protected void throwAssertionException(String message) {
    throw new RuntimeException(message);
  }

  protected void throwAssertionException(String message, Throwable throwable) {
    throw new RuntimeException(message, throwable);
  }

  private final class ContextImpl implements ConditionRunner.Context {

    private final long start;
    private List<String> info = new ArrayList<>();
    private String lastInfo;

    public ContextImpl() {
      this.start = now();
    }

    private long now() {
      return System.currentTimeMillis();
    }

    @Override
    public void info(String info) {
      if (!info.equals(lastInfo)) {
        this.info.add(info);
      }
      lastInfo = info;
    }

    @Override
    public long elapsed() {
      return now() - start;
    }

    @Override
    public Selenium getSelenium() {
      return selenium;
    }

    @Override
    public ConditionRunner getConditionRunner() {
      return DefaultConditionRunner.this;
    }

    private String failureMessage(String narrative, Condition condition) {
      String message = condition.toString() +
          " failed to become true within " + timeout() + " msec";
      message += narrative.equals("") ? "" : "; " + narrative;
      if (!info.isEmpty()) {
        message += "; " + info;
      }
      return message;
    }

    private int timeout() {
      return timeout;
    }

  }
}
