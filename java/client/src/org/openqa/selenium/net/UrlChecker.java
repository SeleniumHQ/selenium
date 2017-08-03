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


package org.openqa.selenium.net;

import static java.util.concurrent.TimeUnit.MILLISECONDS;
import static java.util.concurrent.TimeUnit.NANOSECONDS;

import com.google.common.annotations.VisibleForTesting;
import com.google.common.util.concurrent.SimpleTimeLimiter;
import com.google.common.util.concurrent.TimeLimiter;
import com.google.common.util.concurrent.UncheckedTimeoutException;

import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Arrays;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.logging.Logger;

/**
 * Polls a URL until a HTTP 200 response is received.
 */
public class UrlChecker {

  private static final Logger log = Logger.getLogger(UrlChecker.class.getName());

  private static final int CONNECT_TIMEOUT_MS = 500;
  private static final int READ_TIMEOUT_MS = 1000;
  private static final long MAX_POLL_INTERVAL_MS = 320;
  private static final long MIN_POLL_INTERVAL_MS = 10;

  private static final AtomicInteger THREAD_COUNTER = new AtomicInteger(1);
  private static final ExecutorService THREAD_POOL = Executors
      .newCachedThreadPool(r -> {
        Thread t = new Thread(r, "UrlChecker-" + THREAD_COUNTER.incrementAndGet()); // Thread safety reviewed
        t.setDaemon(true);
        return t;
      });

  private final TimeLimiter timeLimiter;

  public UrlChecker() {
    this(SimpleTimeLimiter.create(THREAD_POOL));
  }

  @VisibleForTesting
  UrlChecker(TimeLimiter timeLimiter) {
    this.timeLimiter = timeLimiter;
  }

  public void waitUntilAvailable(long timeout, TimeUnit unit, final URL... urls)
      throws TimeoutException {
    long start = System.nanoTime();
    log.fine("Waiting for " + Arrays.toString(urls));
    try {
      timeLimiter.callWithTimeout((Callable<Void>) () -> {
        HttpURLConnection connection = null;

        long sleepMillis = MIN_POLL_INTERVAL_MS;
        while (true) {
          for (URL url : urls) {
            try {
              log.fine("Polling " + url);
              connection = connectToUrl(url);
              if (connection.getResponseCode() == HttpURLConnection.HTTP_OK) {
                return null;
              }
            } catch (IOException e) {
              // Ok, try again.
            } finally {
              if (connection != null) {
                connection.disconnect();
              }
            }
          }
          MILLISECONDS.sleep(sleepMillis);
          sleepMillis = (sleepMillis >= MAX_POLL_INTERVAL_MS) ? sleepMillis : sleepMillis * 2;
        }
      }, timeout, unit);
    } catch (UncheckedTimeoutException | java.util.concurrent.TimeoutException e) {
      throw new TimeoutException(String.format(
          "Timed out waiting for %s to be available after %d ms",
          Arrays.toString(urls), MILLISECONDS.convert(System.nanoTime() - start, NANOSECONDS)), e);
    } catch (RuntimeException e) {
      throw e;
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
  }

  public void waitUntilUnavailable(long timeout, TimeUnit unit, final URL url)
      throws TimeoutException {
    long start = System.nanoTime();
    log.fine("Waiting for " + url);
    try {
      timeLimiter.callWithTimeout((Callable<Void>) () -> {
        HttpURLConnection connection = null;

        long sleepMillis = MIN_POLL_INTERVAL_MS;
        while (true) {
          try {
            log.fine("Polling " + url);
            connection = connectToUrl(url);
            if (connection.getResponseCode() != HttpURLConnection.HTTP_OK) {
              return null;
            }
          } catch (IOException e) {
            return null;
          } finally {
            if (connection != null) {
              connection.disconnect();
            }
          }

          MILLISECONDS.sleep(sleepMillis);
          sleepMillis = (sleepMillis >= MAX_POLL_INTERVAL_MS) ? sleepMillis : sleepMillis * 2;
        }
      }, timeout, unit);
    } catch (UncheckedTimeoutException e) {
      throw new TimeoutException(String.format(
          "Timed out waiting for %s to become unavailable after %d ms",
          url, MILLISECONDS.convert(System.nanoTime() - start, NANOSECONDS)), e);
    } catch (RuntimeException e) {
      throw e;
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
  }

  private HttpURLConnection connectToUrl(URL url) throws IOException {
    HttpURLConnection connection = (HttpURLConnection) url.openConnection();
    connection.setConnectTimeout(CONNECT_TIMEOUT_MS);
    connection.setReadTimeout(READ_TIMEOUT_MS);
    connection.connect();
    return connection;
  }

  public static class TimeoutException extends Exception {
    public TimeoutException(String s, Throwable throwable) {
      super(s, throwable);
    }
  }
}
