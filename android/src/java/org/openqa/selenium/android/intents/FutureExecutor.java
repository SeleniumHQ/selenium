/*
Copyright 2010 WebDriver committers
Copyright 2010 Google Inc.

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

package org.openqa.selenium.android.intents;

import android.util.Log;

import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.android.Logger;

import java.util.concurrent.Callable;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

/**
 * Helper class that allows executing future tasks.
 */
public class FutureExecutor {
  private static final String LOG_TAG = FutureExecutor.class.getName();
  private static final ExecutorService executor = Executors.newSingleThreadExecutor();
  
  public static Object executeFuture(Callable callable, long timeout) {
    Future<Object> future = executor.submit(callable);
    Object toReturn = null;
    try {
      toReturn = future.get(timeout, TimeUnit.MILLISECONDS);
    } catch (InterruptedException e) {
      Logger.log(Log.ERROR, LOG_TAG, "InterruptedException Future interupted, restauring state. "
          + e);
      Thread.currentThread().interrupt();
    } catch (ExecutionException e) {
      executor.shutdown();
      throw new WebDriverException("ExecutionException: Future task shutdown. ",
          e);
    } catch (TimeoutException e) {
      // TODO(berrada): What's the best way to handle timeouts? Usually this implies
      // the server is still up, but incoming request are mishandled. Maybe add an id
      // with the request.
      Logger.log(Log.INFO, LOG_TAG, "Future Timeout!");
    }
    return toReturn;
  }
  
}
