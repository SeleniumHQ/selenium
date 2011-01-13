/*
Copyright 2007-2009 WebDriver committers
Copyright 2007-2009 Google Inc.

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

package org.openqa.selenium.internal.seleniumemulation;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.TimerTask;

import com.thoughtworks.selenium.SeleniumException;
import org.openqa.selenium.WebDriver;

public class Timer {
  private java.util.Timer timer = new java.util.Timer();
  private volatile long timeout;

  public Timer(long timeout) {
    this.timeout = timeout;
  }

  public <T> T run(SeleneseCommand<T> command, WebDriver driver, String[] args) {
    Thread thread = Thread.currentThread();
    final SeleneseTimerTask myTimerTask = new SeleneseTimerTask(thread);

    try {
      timer.schedule(myTimerTask, timeout);
    } catch (IllegalStateException e) {
      Thread.interrupted();

      // This should only ever happen the user tries to do something with Selenium after calling
      // stop. Since this RejectedExecutionException is really vague, rethrow it with a more
      // explicit message.
      // The original Selenium RC would throw an NPE at this point, so we should
      // too. Sadly, an NPE can't take a cause, so spool the stacktrace into a
      // string.
      StringWriter writer = new StringWriter();
      e.printStackTrace(new PrintWriter(writer));
      String stack = writer.toString();
      throw new NullPointerException(
          "Illegal attempt to execute a command after calling stop()\n" + stack);
    }
    // Because we call Thread to interrupt, we should ensure that the
    // interrupted status is cleared. This will be a no-op if called twice.
    Thread.interrupted();

    try {
      return command.apply(driver, args);
    } catch (RuntimeException re) {
      Throwable cause = re.getCause();
      if (cause instanceof InterruptedException){
        throw new SeleniumException("Timed out waiting for action to finish", re);
      }
      throw re;
    } finally {
      myTimerTask.cancel();
    }
  }

  public void setTimeout(long timeout) {
    this.timeout = timeout;
  }

  public void stop() {
    timer.cancel();
  }

  class SeleneseTimerTask extends TimerTask {
    private final Thread thread;

    SeleneseTimerTask(Thread thread) {
      this.thread = thread;
    }

    @Override
    public void run() {
      synchronized (thread) {
        thread.interrupt();
      }
    }
  }
}
