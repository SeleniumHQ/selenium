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

import java.util.concurrent.Callable;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.RejectedExecutionException;
import java.util.concurrent.ThreadFactory;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

import com.google.common.base.Throwables;
import com.thoughtworks.selenium.SeleniumException;

public class Timer {
  private final ExecutorService executor = Executors.newSingleThreadExecutor(new ThreadFactory() {
      public Thread newThread(Runnable r) {
          return new Thread(r, "Selenium Timer Thread");
      }
  });
  private long timeout;

  public Timer(long timeout) {
    this.timeout = timeout;
  }

  public <T> T run(Callable<T> evaluate) {
    Future<T> future;
    try {
      future = executor.submit(evaluate);
    } catch (RejectedExecutionException e) {
      // This should only ever happen the user tries to do something with Selenium after calling
      // stop. Since this RejectedExecutionException is really vague, rethrow it with a more
      // explicit message.
      throw new RuntimeException(
          "Illegal attempt to execute a command after calling stop()", e);
    }

    try {
      return future.get(timeout, TimeUnit.MILLISECONDS);
    } catch (InterruptedException e) {
      throw new SeleniumException("Timed out waiting for action to finish", e);
    } catch (ExecutionException e) {
      Throwable cause = e.getCause();
      Throwable toThrow = rebuildStackTrace(cause);

      throw Throwables.propagate(toThrow);
    } catch (TimeoutException e) {
      throw new SeleniumException("Timed out waiting for action to finish", e);
    }
  }

  public void setTimeout(long timeout) {
    this.timeout = timeout;
  }

  public void stop() {
    executor.shutdownNow();
    try {
      executor.awaitTermination(timeout, TimeUnit.MILLISECONDS);
    } catch (InterruptedException e) {
      // There is nothing sensible to do.
    }
  }

  @SuppressWarnings({"ThrowableInstanceNeverThrown"})
  private Throwable rebuildStackTrace(Throwable cause) {
    Throwable originalCause = cause.getCause();
    RuntimeException rte = new RuntimeException("Original stack trace of cause follows", originalCause);
    rte.setStackTrace(cause.getStackTrace());
    cause.initCause(rte);
    cause.fillInStackTrace();
    return cause;
  }
}
