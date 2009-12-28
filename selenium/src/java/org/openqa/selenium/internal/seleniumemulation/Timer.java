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
import java.util.concurrent.ThreadFactory;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

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
    Future<T> future = executor.submit(evaluate);

    try {
      return future.get(timeout, TimeUnit.MILLISECONDS);
    } catch (InterruptedException e) {
      throw new SeleniumException("Timed out waiting for action to finish", e);
    } catch (ExecutionException e) {
      Throwable cause = e.getCause();
      if (cause instanceof RuntimeException) {
        throw (RuntimeException) cause;
      }
      throw new RuntimeException(cause);
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
}
